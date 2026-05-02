class Lancamento < ApplicationRecord
  belongs_to :empresa
  belongs_to :categoria

  enum :tipo,   { entrada: 'entrada', saida: 'saida' }
  enum :status, { pendente: 'pendente', pago: 'pago', atrasado: 'atrasado', cancelado: 'cancelado' }

  validates :descricao,       presence: true
  validates :tipo,            presence: true
  validates :valor,           presence: true, numericality: { greater_than: 0 }
  validates :data_vencimento, presence: true
end
