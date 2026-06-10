module Lancamentos
  module GerenciarSaldo
    class SaldoInsuficiente < StandardError; end

    # Chamado quando um lançamento é marcado como pago (criação ou edição).
    def self.ao_pagar(empresa, lancamento)
      if lancamento.tipo == 'saida'
        novo = empresa.saldo_atual.to_d - lancamento.valor.to_d
        raise SaldoInsuficiente, "Saldo insuficiente para este lançamento de saída" if novo < 0
        empresa.update_column(:saldo_atual, novo)
      else
        empresa.update_column(:saldo_atual, empresa.saldo_atual.to_d + lancamento.valor.to_d)
      end
    end

    # Chamado para reverter o efeito de um pagamento (estorno ou cancelamento).
    # tipo: 'entrada' ou 'saida' — o tipo do lançamento que está sendo revertido.
    def self.ao_estornar(empresa, tipo, valor)
      valor = valor.to_d
      return if valor <= 0

      if tipo == 'saida'
        empresa.update_column(:saldo_atual, empresa.saldo_atual.to_d + valor)
      else
        novo = empresa.saldo_atual.to_d - valor
        raise SaldoInsuficiente, "Saldo insuficiente para processar o estorno" if novo < 0
        empresa.update_column(:saldo_atual, novo)
      end
    end
  end
end
