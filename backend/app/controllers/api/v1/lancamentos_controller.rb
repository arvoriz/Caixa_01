module Api
  module V1
    class LancamentosController < BaseController
      include EscopoEmpresa

      # GET /api/v1/empresas/:empresa_id/lancamentos
      # Filtros opcionais: status, tipo, busca (descrição)
      def index
        lancamentos = empresa_atual.lancamentos.includes(:categoria).order(data_vencimento: :desc)
        lancamentos = lancamentos.where(tipo: params[:tipo])     if params[:tipo].present?
        lancamentos = lancamentos.where(status: params[:status]) if params[:status].present?
        if params[:busca].present?
          lancamentos = lancamentos.where("descricao ILIKE ?", "%#{params[:busca]}%")
        end

        render_sucesso(lancamentos.map { |l| serializar(l) }, meta: { total: lancamentos.size })
      end

      def create
        criados = Lancamentos::CriarService.new(
          empresa:  empresa_atual,
          params:   lancamento_params.to_h.symbolize_keys,
          parcelas: params[:parcelas]
        ).call

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'criar_lancamento',
          entidade:    'lancamento',
          entidade_id: criados.first&.id,
          detalhes: {
            descricao: criados.first&.descricao,
            tipo:      criados.first&.tipo,
            valor:     criados.first&.valor,
            parcelas:  criados.size,
            grupo_parcelamento_id: criados.first&.grupo_parcelamento_id
          }
        )

        render_sucesso(criados.map { |l| serializar(l) }, status: :created)
      rescue Lancamentos::GerenciarSaldo::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      def update
        lancamento    = empresa_atual.lancamentos.find(params[:id])
        status_antes  = lancamento.status
        valores_antes = lancamento.attributes.slice(*lancamento_params.keys)

        lancamento.update!(lancamento_params)

        if status_antes != 'pago' && lancamento.status == 'pago'
          Lancamentos::GerenciarSaldo.ao_pagar(empresa_atual.reload, lancamento)
        end

        alteracoes = lancamento_params.keys.each_with_object({}) do |campo, h|
          antes  = valores_antes[campo]
          depois = lancamento.attributes[campo]
          h[campo] = { de: antes, para: depois } if antes.to_s != depois.to_s
        end

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'atualizar_lancamento',
          entidade:    'lancamento',
          entidade_id: lancamento.id,
          detalhes:    { descricao: lancamento.descricao, alteracoes: alteracoes }
        )

        render_sucesso(serializar(lancamento))
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      rescue Lancamentos::GerenciarSaldo::SaldoInsuficiente => e
        lancamento.update_column(:status, status_antes)
        render_erro([e.message], status: :unprocessable_entity)
      end

      def cancelar
        lancamento = empresa_atual.lancamentos.find(params[:id])

        Lancamentos::CancelarService.new(
          empresa:       empresa_atual,
          lancamento:    lancamento,
          estorno:       params[:estorno] || 'nenhum',
          valor_estorno: params[:valor_estorno] || 0
        ).call

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'cancelar_lancamento',
          entidade:    'lancamento',
          entidade_id: lancamento.id,
          detalhes: {
            descricao:   lancamento.descricao,
            estorno:       params[:estorno] || 'nenhum',
            valor_estorno: params[:valor_estorno],
            grupo_parcelamento_id: lancamento.grupo_parcelamento_id
          }
        )

        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      rescue Lancamentos::GerenciarSaldo::SaldoInsuficiente => e
        render_erro([e.message], status: :unprocessable_entity)
      end

      # PATCH /empresas/:empresa_id/lancamentos/:id/propagar_grupo
      # Propaga o novo valor para todas as parcelas pendentes/atrasadas do mesmo grupo.
      def propagar_grupo
        lancamento = empresa_atual.lancamentos.find(params[:id])
        return render_erro(["Lançamento não pertence a um grupo parcelado"], status: :unprocessable_entity) unless lancamento.grupo_parcelamento_id.present?

        novo_valor = params[:valor].to_d
        return render_erro(["Valor inválido"], status: :unprocessable_entity) if novo_valor <= 0

        empresa_atual.lancamentos
                     .where(grupo_parcelamento_id: lancamento.grupo_parcelamento_id)
                     .where(status: %w[pendente atrasado])
                     .update_all(valor: novo_valor)

        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      end

      # POST /empresas/:empresa_id/lancamentos/:id/parcelar
      # Converte um lançamento simples em parcelado.
      def parcelar
        lancamento = empresa_atual.lancamentos.find(params[:id])
        return render_erro(["Já é um lançamento parcelado"], status: :unprocessable_entity) if lancamento.grupo_parcelamento_id.present?
        return render_erro(["Lançamentos pagos ou cancelados não podem ser parcelados"], status: :unprocessable_entity) if %w[pago cancelado].include?(lancamento.status)

        Lancamentos::ConverterParaParceladoService.new(
          empresa:    empresa_atual,
          lancamento: lancamento,
          parcelas:   params[:parcelas]
        ).call

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'parcelar_lancamento',
          entidade:    'lancamento',
          entidade_id: lancamento.id,
          detalhes:    { descricao: lancamento.descricao, parcelas: params[:parcelas] }
        )

        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      end

      def destroy
        lancamento = empresa_atual.lancamentos.find(params[:id])
        lancamento.destroy!

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa_atual,
          acao:        'excluir_lancamento',
          entidade:    'lancamento',
          entidade_id: lancamento.id,
          detalhes:    { descricao: lancamento.descricao }
        )

        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      end

      private

      def lancamento_params
        params.require(:lancamento).permit(
          :categoria_id, :descricao, :tipo, :valor,
          :data_vencimento, :data_pagamento, :status
        )
      end

      def serializar(lancamento)
        LancamentoSerializer.new(lancamento).serializable_hash[:data][:attributes]
                            .merge(categoria_nome: lancamento.categoria&.nome)
      end
    end
  end
end
