class Convite < ApplicationRecord
  self.table_name = "convites"

  belongs_to :empresa
  belongs_to :convidado_por_usuario, class_name: "Usuario", foreign_key: :convidado_por

  enum :papel, { socio: "socio", contador: "contador" }

  validates :token, presence: true, uniqueness: true
  validates :papel, presence: true
  validates :expira_em, presence: true

  scope :validos, -> { where(usado_em: nil).where("expira_em > ?", Time.current) }

  def valido?
    usado_em.nil? && expira_em > Time.current
  end

  def usar!(usuario)
    return false unless valido?
    transaction do
      update!(usado_em: Time.current)
      AcessoEmpresa.create!(empresa: empresa, usuario: usuario, papel: papel)
    end
    true
  end
end
