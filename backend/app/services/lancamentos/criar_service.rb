module Lancamentos
  # Cria um lançamento simples ou, quando parcelado, gera N lançamentos
  # mensais compartilhando um grupo_parcelamento_id.
  class CriarService
    def initialize(empresa:, params:, parcelas: 1)
      @empresa  = empresa
      @params   = params
      @parcelas = [parcelas.to_i, 1].max
    end

    def call
      return [criar_unico] if @parcelas == 1

      criar_parcelado
    end

    private

    def criar_unico
      validar_saldo!(@params[:valor])
      lance = Lancamento.create!(@params.merge(empresa_id: @empresa.id))
      GerenciarSaldo.ao_pagar(@empresa, lance) if lance.status == 'pago'
      lance
    end

    def criar_parcelado
      grupo = SecureRandom.uuid
      base_descricao  = @params[:descricao]
      valor_parcela   = (@params[:valor].to_d / @parcelas).round(2)
      vencimento_base = @params[:data_vencimento].to_date

      ActiveRecord::Base.transaction do
        (1..@parcelas).map do |n|
          lance = Lancamento.create!(
            @params.merge(
              empresa_id:            @empresa.id,
              descricao:             "#{base_descricao} (#{n}/#{@parcelas})",
              valor:                 valor_parcela,
              data_vencimento:       vencimento_base >> (n - 1),
              grupo_parcelamento_id: grupo
            )
          )
          GerenciarSaldo.ao_pagar(@empresa, lance) if lance.status == 'pago'
          lance
        end
      end
    end

    def validar_saldo!(valor)
      return unless @params[:status] == 'pago' && @params[:tipo] == 'saida'
      total = valor.to_d * @parcelas
      raise GerenciarSaldo::SaldoInsuficiente, "Saldo insuficiente para este lançamento de saída" if @empresa.saldo_atual.to_d < total
    end
  end
end
