class Usuario < ApplicationRecord
  has_many :acessos_empresas, foreign_key: :usuario_id
  has_many :empresas, through: :acessos_empresas

  validates :email, presence: true, uniqueness: { case_sensitive: false }
end
