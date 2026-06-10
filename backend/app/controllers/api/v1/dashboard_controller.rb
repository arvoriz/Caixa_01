module Api
  module V1
    class DashboardController < BaseController
      include EscopoEmpresa

      MESES_PT = %w[_ Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez].freeze

      # GET /api/v1/empresas/:empresa_id/dashboard
      def show
        hoje       = Date.current
        inicio_mes = hoje.beginning_of_month
        fim_mes    = hoje.end_of_month

        pagos   = empresa_atual.lancamentos.where(status: 'pago')
        abertos = empresa_atual.lancamentos.where(status: %w[pendente atrasado])

        receitas_mes = pagos.where(tipo: 'entrada', data_pagamento: inicio_mes..fim_mes).sum(:valor)
        despesas_mes = pagos.where(tipo: 'saida',   data_pagamento: inicio_mes..fim_mes).sum(:valor)
        a_receber    = abertos.where(tipo: 'entrada').sum(:valor)
        a_pagar      = abertos.where(tipo: 'saida').sum(:valor)

        mutuo_a_receber = Emprestimo.where(tipo: 'mutuo', status: 'ativo', empresa_origem_id: empresa_atual.id).sum(:saldo_devedor)

        render_sucesso({
          saldo_atual:     empresa_atual.saldo_atual,
          receitas_mes:    receitas_mes,
          despesas_mes:    despesas_mes,
          a_receber:       a_receber,
          a_pagar:         a_pagar,
          mutuo_a_receber: mutuo_a_receber,
          fluxo_mensal:    fluxo_mensal(pagos, hoje),
          despesas_categoria: despesas_categoria(pagos, inicio_mes, fim_mes),
          alertas:         alertas(abertos, hoje),
          ultimas_transacoes: ultimas_transacoes
        })
      end

      private

      # Receitas x despesas pagas dos últimos 6 meses.
      def fluxo_mensal(pagos, hoje)
        inicio_janela = hoje.beginning_of_month - 5.months
        agrupado = pagos.where('data_pagamento >= ?', inicio_janela)
                        .group(Arel.sql("to_char(data_pagamento, 'YYYY-MM')"), :tipo)
                        .sum(:valor)

        (0..5).map do |i|
          d     = hoje.beginning_of_month - (5 - i).months
          chave = d.strftime('%Y-%m')
          {
            label:   MESES_PT[d.month],
            receita: agrupado[[chave, 'entrada']].to_d,
            despesa: agrupado[[chave, 'saida']].to_d,
            atual:   d.month == hoje.month && d.year == hoje.year
          }
        end
      end

      # Top 5 categorias de despesas pagas no mês.
      def despesas_categoria(pagos, inicio_mes, fim_mes)
        por_cat = pagos.where(tipo: 'saida', data_pagamento: inicio_mes..fim_mes)
                       .joins(:categoria).group('categorias.nome').sum(:valor)
        total = por_cat.values.sum
        por_cat.map { |nome, valor|
          { nome: nome, valor: valor, pct: total.positive? ? (valor / total * 100).round : 0 }
        }.sort_by { |c| -c[:valor] }.first(5)
      end

      # Contas em aberto vencidas ou vencendo nos próximos dias.
      def alertas(abertos, hoje)
        abertos.includes(:categoria)
               .where('data_vencimento <= ?', hoje + 3)
               .order(:data_vencimento)
               .limit(4)
               .map do |l|
          dias = (hoje - l.data_vencimento).to_i
          {
            id:              l.id,
            descricao:       l.descricao,
            categoria:       l.categoria&.nome,
            tipo:            l.tipo,
            valor:           l.valor,
            data_vencimento: l.data_vencimento,
            dias_atraso:     dias.positive? ? dias : 0,
            vence_hoje:      l.data_vencimento == hoje
          }
        end
      end

      # Últimos lançamentos registrados (não cancelados).
      def ultimas_transacoes
        empresa_atual.lancamentos
                     .where.not(status: 'cancelado')
                     .includes(:categoria)
                     .order(criado_em: :desc)
                     .limit(6)
                     .map do |l|
          {
            id:            l.id,
            descricao:     l.descricao,
            categoria:     l.categoria&.nome,
            tipo:          l.tipo,
            valor:         l.valor,
            status:        l.status,
            data:          l.data_pagamento || l.data_vencimento,
            criado_em:     l.criado_em
          }
        end
      end
    end
  end
end
