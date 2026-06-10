module Auditoria
  module Registrador
    # Registra uma ação importante no log de auditoria. Falhas ao gravar o
    # log nunca devem interromper a operação principal.
    def self.registrar(usuario:, acao:, entidade:, empresa: nil, entidade_id: nil, detalhes: {})
      LogAuditoria.create!(
        usuario_id:  usuario&.id,
        empresa_id:  empresa&.id,
        acao:        acao.to_s,
        entidade:    entidade.to_s,
        entidade_id: entidade_id,
        detalhes:    detalhes
      )
    rescue StandardError => e
      Rails.logger.error("[Auditoria] falha ao registrar #{acao} em #{entidade}: #{e.message}")
    end
  end
end
