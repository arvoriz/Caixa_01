class Categoria < ApplicationRecord
  belongs_to :empresa, optional: true
  has_many :lancamentos

  enum :tipo, { entrada: 'entrada', saida: 'saida' }

  validates :nome, presence: true
  validates :tipo, presence: true
end
