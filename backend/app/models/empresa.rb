class Empresa < ApplicationRecord
  has_many :acessos_empresas
  has_many :usuarios, through: :acessos_empresas
  has_many :categorias
  has_many :lancamentos
  has_many :emprestimos_como_origem,  class_name: 'EmprestimoMutuo', foreign_key: :empresa_origem_id
  has_many :emprestimos_como_destino, class_name: 'EmprestimoMutuo', foreign_key: :empresa_destino_id

  validates :cnpj, presence: true, uniqueness: true
  validates :razao_social, presence: true
end
