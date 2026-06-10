class EmprestimoMutuo < ApplicationRecord
  self.table_name = 'emprestimos_mutuo'

  belongs_to :empresa_origem,  class_name: 'Empresa', foreign_key: :empresa_origem_id
  belongs_to :empresa_destino, class_name: 'Empresa', foreign_key: :empresa_destino_id

  enum :status, { ativo: 'ativo', quitado: 'quitado', cancelado: 'cancelado' }

  validates :valor,         presence: true, numericality: { greater_than: 0 }
  validates :saldo_devedor, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
