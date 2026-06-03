class AcessoEmpresa < ApplicationRecord
  self.table_name = 'acessos_empresas'

  belongs_to :empresa
  belongs_to :usuario

  enum :papel, { dono: 'dono', socio: 'socio', contador: 'contador' }

  validates :papel, presence: true
  validates :usuario_id, uniqueness: { scope: :empresa_id }
end
