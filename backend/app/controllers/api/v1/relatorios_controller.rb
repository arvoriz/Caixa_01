module Api
  module V1
    class RelatoriosController < BaseController
      include EscopoEmpresa

      # GET /api/v1/empresas/:empresa_id/relatorios/fluxo_caixa?de=&ate=
      # Regime de caixa: considera apenas lançamentos efetivamente pagos no período.
      def fluxo_caixa
        de, ate = periodo

        pagos = empresa_atual.lancamentos.where(status: 'pago')

        no_periodo = pagos.where(data_pagamento: de..ate)
        entradas   = no_periodo.where(tipo: 'entrada').joins(:categoria).group('categorias.nome').sum(:valor)
        saidas     = no_periodo.where(tipo: 'saida').joins(:categoria).group('categorias.nome').sum(:valor)

        entradas_total = entradas.values.sum
        saidas_total   = saidas.values.sum

        # saldo_atual reflete toda a movimentação paga até hoje; revertemos o que
        # foi pago depois de 'ate' para obter o saldo final do período, e então o inicial.
        apos      = pagos.where('data_pagamento > ?', ate)
        net_apos  = apos.where(tipo: 'entrada').sum(:valor) - apos.where(tipo: 'saida').sum(:valor)
        saldo_final   = empresa_atual.saldo_atual.to_d - net_apos
        saldo_inicial = saldo_final - (entradas_total - saidas_total)

        render_sucesso({
          de:             de,
          ate:            ate,
          saldo_inicial:  saldo_inicial,
          entradas_total: entradas_total,
          saidas_total:   saidas_total,
          saldo_final:    saldo_final,
          entradas:       entradas.map { |nome, valor| { nome: nome, valor: valor } }.sort_by { |c| -c[:valor] },
          saidas:         saidas.map   { |nome, valor| { nome: nome, valor: valor } }.sort_by { |c| -c[:valor] }
        })
      end

      # GET /api/v1/empresas/:empresa_id/relatorios/contas
      # Contas a pagar/receber: lançamentos em aberto (pendentes/atrasados).
      def contas
        hoje    = Date.current
        abertos = empresa_atual.lancamentos
                               .where(status: %w[pendente atrasado])
                               .includes(:categoria)
                               .order(:data_vencimento)

        a_pagar       = 0.to_d
        a_receber     = 0.to_d
        inadimplencia = 0.to_d

        itens = abertos.map do |l|
          dias_atraso = l.data_vencimento && l.data_vencimento < hoje ? (hoje - l.data_vencimento).to_i : 0
          if l.tipo == 'saida'
            a_pagar += l.valor.to_d
          else
            a_receber += l.valor.to_d
          end
          inadimplencia += l.valor.to_d if dias_atraso > 0

          {
            id:              l.id,
            descricao:       l.descricao,
            categoria:       l.categoria&.nome,
            tipo:            l.tipo,
            valor:           l.valor,
            data_vencimento: l.data_vencimento,
            dias_atraso:     dias_atraso
          }
        end

        render_sucesso({
          inadimplencia: inadimplencia,
          a_pagar:       a_pagar,
          a_receber:     a_receber,
          itens:         itens
        })
      end

      # GET /api/v1/empresas/:empresa_id/relatorios/intercompany
      # Mútuos entre as próprias empresas, do ponto de vista da empresa ativa.
      def intercompany
        mutuos = Emprestimo
                   .includes(:empresa_origem, :empresa_destino)
                   .where(tipo: 'mutuo')
                   .where("empresa_origem_id = :id OR empresa_destino_id = :id", id: empresa_atual.id)
                   .order(criado_em: :desc)
                   .to_a

        a_receber = mutuos.select { |e| e.empresa_origem_id == empresa_atual.id && e.ativo? }.sum { |e| e.saldo_devedor.to_d }
        a_pagar   = mutuos.select { |e| e.empresa_destino_id == empresa_atual.id && e.ativo? }.sum { |e| e.saldo_devedor.to_d }

        render_sucesso({
          total_a_receber: a_receber,
          total_a_pagar:   a_pagar,
          saldo_liquido:   a_receber - a_pagar,
          contratos:       mutuos.map { |e| serializar_emprestimo(e) }
        })
      end

      # GET /api/v1/empresas/:empresa_id/relatorios/externos
      # Empréstimos externos (banco/pessoa) em que a empresa ativa é a devedora.
      def externos
        externos = Emprestimo
                     .includes(:empresa_destino)
                     .where(tipo: %w[banco pessoa])
                     .where(empresa_destino_id: empresa_atual.id)
                     .order(criado_em: :desc)
                     .to_a

        total_captado = externos.sum { |e| e.valor.to_d }
        saldo_devedor = externos.select(&:ativo?).sum { |e| e.saldo_devedor.to_d }

        render_sucesso({
          total_captado: total_captado,
          saldo_devedor: saldo_devedor,
          total_pago:    total_captado - saldo_devedor,
          contratos:     externos.map { |e| serializar_emprestimo(e) }
        })
      end

      private

      def periodo
        de  = parse_data(params[:de])  || Date.current.beginning_of_month
        ate = parse_data(params[:ate]) || Date.current.end_of_month
        [de, ate]
      end

      def parse_data(valor)
        return nil if valor.blank?
        Date.parse(valor)
      rescue ArgumentError
        nil
      end

      def serializar_emprestimo(emprestimo)
        EmprestimoSerializer.new(emprestimo).serializable_hash[:data][:attributes]
      end
    end
  end
end
