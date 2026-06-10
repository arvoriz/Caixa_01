class Emprestimo < ApplicationRecord
  self.table_name = 'emprestimos_mutuo'

  TIPOS = %w[mutuo banco pessoa].freeze

  belongs_to :empresa_origem,  class_name: 'Empresa', foreign_key: :empresa_origem_id, optional: true
  belongs_to :empresa_destino, class_name: 'Empresa', foreign_key: :empresa_destino_id

  enum :status, { ativo: 'ativo', quitado: 'quitado', cancelado: 'cancelado' }

  validates :tipo,          inclusion: { in: TIPOS }
  validates :valor,         presence: true, numericality: { greater_than: 0 }
  validates :saldo_devedor, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # Mútuo precisa de empresa de origem; externo precisa de credor textual.
  validates :empresa_origem_id, presence: true, if: :mutuo?
  validates :credor_externo,    presence: true, unless: :mutuo?

  def mutuo?
    tipo == 'mutuo'
  end

  def externo?
    !mutuo?
  end

  # 0–100, quanto do valor original já foi pago.
  def progresso
    return 100 if valor.to_d.zero?
    pago = valor.to_d - saldo_devedor.to_d
    ((pago / valor.to_d) * 100).round.clamp(0, 100)
  end
end
