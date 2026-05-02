module EscopoEmpresa
  extend ActiveSupport::Concern

  included do
    before_action :definir_empresa_atual
  end

  def definir_empresa_atual
    @empresa_atual = usuario_atual.empresas.find(params[:empresa_id])
  rescue ActiveRecord::RecordNotFound
    render_erro(I18n.t("errors.not_found"), status: :not_found)
  end

  def empresa_atual
    @empresa_atual
  end
end
