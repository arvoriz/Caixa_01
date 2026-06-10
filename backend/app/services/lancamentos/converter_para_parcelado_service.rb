module Lancamentos
  # Converte um lançamento simples em parcelado, criando N-1 cópias futuras.
  class ConverterParaParceladoService
    def initialize(empresa:, lancamento:, parcelas:)
      @empresa    = empresa
      @lancamento = lancamento
      @parcelas   = [parcelas.to_i, 2].max
    end

    def call
      grupo = SecureRandom.uuid

      ActiveRecord::Base.transaction do
        # Atualiza o lançamento original para ser a 1ª parcela
        @lancamento.update!(
          grupo_parcelamento_id: grupo,
          descricao: base_descricao + " (1/#{@parcelas})"
        )

        # Cria as parcelas restantes
        (2..@parcelas).each do |n|
          Lancamento.create!(
            empresa_id:            @empresa.id,
            categoria_id:          @lancamento.categoria_id,
            descricao:             "#{base_descricao} (#{n}/#{@parcelas})",
            tipo:                  @lancamento.tipo,
            valor:                 @lancamento.valor,
            data_vencimento:       @lancamento.data_vencimento >> (n - 1),
            status:                'pendente',
            grupo_parcelamento_id: grupo
          )
        end
      end
    end

    private

    def base_descricao
      # Remove sufixo "(N/M)" se já existir
      @lancamento.descricao.sub(/\s*\(\d+\/\d+\)$/, '')
    end
  end
end
