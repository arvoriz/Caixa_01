class Usuario < ApplicationRecord
  has_many :acessos_empresas, class_name: 'AcessoEmpresa', foreign_key: :usuario_id
  has_many :empresas, through: :acessos_empresas
  belongs_to :ultima_empresa, class_name: 'Empresa', foreign_key: :ultima_empresa_id, optional: true

  validates :email, presence: true, uniqueness: { case_sensitive: false }
end
