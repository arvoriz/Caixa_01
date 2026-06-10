module Emprestimos
  # Cria um empréstimo e movimenta o saldo das empresas envolvidas.
  #
  #   Mútuo:   debita a empresa de origem (credor) e credita a de destino (devedor).
  #   Externo: credita a empresa de destino (que recebeu o dinheiro do banco/pessoa).
  class CriarService
    class AcessoNegado < StandardError; end

    def initialize(usuario:, params:)
      @usuario = usuario
      @params  = params
    end

    def call
      tipo  = @params[:tipo].to_s
      valor = @params[:valor].to_d

      destino = empresa_do_usuario!(@params[:empresa_destino_id])

      emprestimo = Emprestimo.new(
        tipo:               tipo,
        descricao:          @params[:descricao],
        valor:              valor,
        saldo_devedor:      valor,
        status:             'ativo',
        empresa_destino_id: destino.id,
        data_contrato:      @params[:data_contrato].presence
      )

      ActiveRecord::Base.transaction do
        if tipo == 'mutuo'
          origem = empresa_do_usuario!(@params[:empresa_origem_id])
          raise AcessoNegado, "Origem e destino devem ser diferentes" if origem.id == destino.id

          novo_origem = origem.saldo_atual.to_d - valor
          raise SaldoInsuficiente, "Saldo insuficiente na empresa de origem" if novo_origem < 0

          origem.update_column(:saldo_atual, novo_origem)
          destino.update_column(:saldo_atual, destino.saldo_atual.to_d + valor)
          emprestimo.empresa_origem_id = origem.id
        else
          # Externo: o dinheiro entra na empresa de destino.
          destino.update_column(:saldo_atual, destino.saldo_atual.to_d + valor)
          emprestimo.credor_externo = @params[:credor_externo]
        end

        emprestimo.save!
      end

      emprestimo
    end

    private

    def empresa_do_usuario!(id)
      @usuario.empresas.find(id)
    rescue ActiveRecord::RecordNotFound
      raise AcessoNegado, "Empresa não encontrada ou sem acesso"
    end
  end
end
