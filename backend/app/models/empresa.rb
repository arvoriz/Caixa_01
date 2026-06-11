class Empresa < ApplicationRecord
  has_many :acessos_empresas, class_name: 'AcessoEmpresa'
  has_many :usuarios, through: :acessos_empresas
  has_many :categorias
  has_many :lancamentos
  # FK de emprestimos_mutuo para empresas não tem ON DELETE CASCADE no banco —
  # precisa destruir explicitamente para não violar a constraint ao excluir a empresa.
  has_many :emprestimos_como_origem,  class_name: 'Emprestimo', foreign_key: :empresa_origem_id,  dependent: :destroy
  has_many :emprestimos_como_destino, class_name: 'Emprestimo', foreign_key: :empresa_destino_id, dependent: :destroy

  CNPJ_FORMAT = /\A\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\z/

  validates :cnpj,        presence: true, uniqueness: true,
                          format: { with: CNPJ_FORMAT, message: "deve estar no formato XX.XXX.XXX/XXXX-XX" }
  validates :razao_social,  presence: true
  validates :nome_fantasia, presence: true
  validates :saldo_atual, presence: true, numericality: { greater_than_or_equal_to: 0 }

  validate :cnpj_valido, if: -> { cnpj.present? && cnpj.match?(CNPJ_FORMAT) }

  private

  def cnpj_valido
    digits = cnpj.gsub(/\D/, '')
    return errors.add(:cnpj, "inválido") if digits.chars.uniq.length == 1

    mult1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    mult2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    soma1 = digits[0, 12].chars.each_with_index.sum { |d, i| d.to_i * mult1[i] }
    d1    = (soma1 % 11) < 2 ? 0 : 11 - (soma1 % 11)

    soma2 = digits[0, 13].chars.each_with_index.sum { |d, i| d.to_i * mult2[i] }
    d2    = (soma2 % 11) < 2 ? 0 : 11 - (soma2 % 11)

    errors.add(:cnpj, "inválido") unless digits[12].to_i == d1 && digits[13].to_i == d2
  end
end
