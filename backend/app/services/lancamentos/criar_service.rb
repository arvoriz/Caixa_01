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
      Lancamento.create!(@params.merge(empresa_id: @empresa.id))
    end

    def criar_parcelado
      grupo = SecureRandom.uuid
      base_descricao  = @params[:descricao]
      valor_parcela   = (@params[:valor].to_d / @parcelas).round(2)
      vencimento_base = @params[:data_vencimento].to_date

      ActiveRecord::Base.transaction do
        (1..@parcelas).map do |n|
          Lancamento.create!(
            @params.merge(
              empresa_id:            @empresa.id,
              descricao:             "#{base_descricao} (#{n}/#{@parcelas})",
              valor:                 valor_parcela,
              data_vencimento:       vencimento_base >> (n - 1), # soma n-1 meses
              grupo_parcelamento_id: grupo
            )
          )
        end
      end
    end
  end
end
