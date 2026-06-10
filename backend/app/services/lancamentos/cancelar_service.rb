module Lancamentos
  class CancelarService
    def initialize(empresa:, lancamento:, estorno: 'nenhum', valor_estorno: 0)
      @empresa       = empresa
      @lancamento    = lancamento
      @estorno       = estorno.to_s
      @valor_estorno = valor_estorno.to_d
    end

    def call
      escopo = if @lancamento.grupo_parcelamento_id.present?
        @empresa.lancamentos
                .where(grupo_parcelamento_id: @lancamento.grupo_parcelamento_id)
                .where.not(status: 'cancelado')
      else
        @empresa.lancamentos.where(id: @lancamento.id)
      end

      ActiveRecord::Base.transaction do
        aplicar_estorno(escopo)
        escopo.update_all(status: 'cancelado')
      end
    end

    private

    def aplicar_estorno(escopo)
      return if @estorno == 'nenhum'

      valor = if @estorno == 'integral'
        escopo.where(status: 'pago').sum(:valor).to_d
      else
        @valor_estorno
      end

      GerenciarSaldo.ao_estornar(@empresa, @lancamento.tipo, valor)
    end
  end
end
