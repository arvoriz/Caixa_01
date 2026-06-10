module Api
  module V1
    class EmprestimosController < BaseController
      include EscopoEmpresa

      # Contador tem acesso somente leitura (index).
      before_action :bloquear_somente_leitura!, only: %i[create update registrar_pagamento cancelar destroy]

      # GET /api/v1/empresas/:empresa_id/emprestimos
      # Lista os empréstimos em que a empresa ativa participa (como origem ou destino).
      # Filtros opcionais: tipo, status, busca (descrição ou credor externo).
      def index
        emprestimos = Emprestimo
                        .includes(:empresa_origem, :empresa_destino)
                        .where("empresa_origem_id = :id OR empresa_destino_id = :id", id: empresa_atual.id)
                        .order(criado_em: :desc)

        emprestimos = emprestimos.where(tipo: params[:tipo])     if params[:tipo].present?
        emprestimos = emprestimos.where(status: params[:status]) if params[:status].present?
        if params[:busca].present?
          q = "%#{params[:busca]}%"
          emprestimos = emprestimos.where("descricao ILIKE :q OR credor_externo ILIKE :q", q: q)
        end

        render_sucesso(emprestimos.map { |e| serializar(e) }, meta: { total: emprestimos.size })
      end

      def create
        emprestimo = Emprestimos::CriarService.new(
          usuario: usuario_atual,
          params:  emprestimo_params.to_h.symbolize_keys.merge(empresa_destino_id: destino_id)
        ).call

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'criar_emprestimo',
          entidade:    'emprestimo',
          entidade_id: emprestimo.id,
          detalhes: {
            tipo:      emprestimo.tipo,
            descricao: emprestimo.descricao,
            valor:     emprestimo.valor,
            credor:    emprestimo.mutuo? ? emprestimo.empresa_origem_id : emprestimo.credor_externo,
            empresa_destino_id: emprestimo.empresa_destino_id
          }
        )

        render_sucesso(serializar(emprestimo), status: :created)
      rescue Emprestimos::CriarService::AcessoNegado => e
        render_erro([e.message], status: :unprocessable_entity)
      rescue Emprestimos::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      def update
        emprestimo = emprestimo_do_escopo!(params[:id])
        return render_erro(["Empréstimo quitado ou cancelado não pode ser modificado"], status: :unprocessable_entity) unless emprestimo.ativo?

        valores_antes = emprestimo.attributes.slice(*emprestimo_update_params.keys)

        emprestimo.update!(emprestimo_update_params)

        alteracoes = emprestimo_update_params.keys.each_with_object({}) do |campo, h|
          antes  = valores_antes[campo]
          depois = emprestimo.attributes[campo]
          h[campo] = { de: antes, para: depois } if antes.to_s != depois.to_s
        end

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'atualizar_emprestimo',
          entidade:    'emprestimo',
          entidade_id: emprestimo.id,
          detalhes:    { descricao: emprestimo.descricao, alteracoes: alteracoes }
        )

        render_sucesso(serializar(emprestimo))
      end

      # POST /api/v1/empresas/:empresa_id/emprestimos/:id/registrar_pagamento
      def registrar_pagamento
        emprestimo = emprestimo_do_escopo!(params[:id])

        Emprestimos::RegistrarPagamentoService.new(
          emprestimo: emprestimo,
          valor_pago: params[:valor_pago]
        ).call

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'pagar_emprestimo',
          entidade:    'emprestimo',
          entidade_id: emprestimo.id,
          detalhes: {
            descricao:     emprestimo.descricao,
            valor_pago:    params[:valor_pago],
            saldo_devedor: emprestimo.saldo_devedor,
            status:        emprestimo.status
          }
        )

        render_sucesso(serializar(emprestimo))
      rescue Emprestimos::RegistrarPagamentoService::PagamentoInvalido => e
        render_erro([e.message], status: :unprocessable_entity)
      rescue Emprestimos::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      # POST /api/v1/empresas/:empresa_id/emprestimos/:id/cancelar
      # Cancela um empréstimo ativo: desfaz o saldo devedor pendente (devolve à origem)
      # e marca como cancelado, preservando o registro para histórico.
      def cancelar
        emprestimo = emprestimo_do_escopo!(params[:id])
        return render_erro(["Apenas empréstimos ativos podem ser cancelados"], status: :unprocessable_entity) unless emprestimo.ativo?

        ActiveRecord::Base.transaction do
          reverter_saldo_pendente!(emprestimo)
          emprestimo.update!(status: :cancelado, saldo_devedor: 0)
        end

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'cancelar_emprestimo',
          entidade:    'emprestimo',
          entidade_id: emprestimo.id,
          detalhes:    { descricao: emprestimo.descricao }
        )

        render_sucesso(serializar(emprestimo.reload))
      rescue Emprestimos::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      # DELETE /api/v1/empresas/:empresa_id/emprestimos/:id
      # Desfaz o saldo devedor pendente (devolve à origem) e remove o registro.
      def destroy
        emprestimo = emprestimo_do_escopo!(params[:id])
        descricao  = emprestimo.descricao

        ActiveRecord::Base.transaction do
          reverter_saldo_pendente!(emprestimo)
          emprestimo.destroy!
        end

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'excluir_emprestimo',
          entidade:    'emprestimo',
          entidade_id: params[:id],
          detalhes:    { descricao: descricao }
        )

        render_sucesso({})
      rescue Emprestimos::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      private

      # Devolve à empresa devedora (e à origem, em mútuo) o saldo devedor ainda pendente
      # de um empréstimo ativo. Usado tanto no cancelamento quanto na exclusão.
      def reverter_saldo_pendente!(emprestimo)
        pendente = emprestimo.saldo_devedor.to_d
        return unless emprestimo.ativo? && pendente > 0

        destino    = emprestimo.empresa_destino
        novo_saldo = destino.saldo_atual.to_d - pendente
        raise Emprestimos::SaldoInsuficiente, "Saldo insuficiente na empresa devedora para desfazer o empréstimo" if novo_saldo < 0

        destino.update_column(:saldo_atual, novo_saldo)

        if emprestimo.mutuo? && emprestimo.empresa_origem
          origem = emprestimo.empresa_origem
          origem.update_column(:saldo_atual, origem.saldo_atual.to_d + pendente)
        end
      end

      # Levanta ActiveRecord::RecordNotFound (tratado globalmente) se a empresa ativa
      # não participar do empréstimo.
      def emprestimo_do_escopo!(id)
        Emprestimo.where("empresa_origem_id = :eid OR empresa_destino_id = :eid", eid: empresa_atual.id).find(id)
      end

      def destino_id
        emprestimo_params[:empresa_destino_id].presence || empresa_atual.id
      end

      def emprestimo_params
        params.require(:emprestimo).permit(
          :tipo, :descricao, :valor, :empresa_origem_id,
          :empresa_destino_id, :credor_externo, :data_contrato
        )
      end

      # Edição livre só da descrição. Transições de status têm fluxos dedicados que
      # ajustam o saldo: registrar_pagamento (→ quitado) e cancelar (→ cancelado).
      def emprestimo_update_params
        params.require(:emprestimo).permit(:descricao)
      end

      def serializar(emprestimo)
        EmprestimoSerializer.new(emprestimo).serializable_hash[:data][:attributes]
      end
    end
  end
end
