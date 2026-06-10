module Emprestimos
  # Registra um pagamento de um empréstimo, reduzindo o saldo devedor.
  #
  #   O devedor (empresa de destino) paga: seu saldo é debitado.
  #   No mútuo, o credor (empresa de origem) recebe: seu saldo é creditado.
  #   No externo, o dinheiro sai do sistema (vai para o banco/pessoa).
  #
  # Quita automaticamente quando o saldo devedor chega a zero.
  class RegistrarPagamentoService
    class PagamentoInvalido < StandardError; end

    def initialize(emprestimo:, valor_pago:)
      @emprestimo = emprestimo
      @valor_pago = valor_pago.to_d
    end

    def call
      raise PagamentoInvalido, "Informe um valor de pagamento maior que zero" if @valor_pago <= 0
      raise PagamentoInvalido, "Este empréstimo não está ativo"               unless @emprestimo.ativo?

      # Não permite pagar mais do que o devido.
      valor = [@valor_pago, @emprestimo.saldo_devedor.to_d].min

      ActiveRecord::Base.transaction do
        destino     = @emprestimo.empresa_destino
        novo_saldo  = destino.saldo_atual.to_d - valor
        raise SaldoInsuficiente, "Saldo insuficiente na empresa devedora para o pagamento" if novo_saldo < 0
        destino.update_column(:saldo_atual, novo_saldo)

        if @emprestimo.mutuo? && @emprestimo.empresa_origem
          origem = @emprestimo.empresa_origem
          origem.update_column(:saldo_atual, origem.saldo_atual.to_d + valor)
        end

        novo_devedor = @emprestimo.saldo_devedor.to_d - valor
        @emprestimo.saldo_devedor = novo_devedor
        @emprestimo.status = 'quitado' if novo_devedor <= 0
        @emprestimo.save!
      end

      @emprestimo
    end
  end
end
