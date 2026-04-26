module BusinessScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_current_business
  end

  def set_current_business
    @current_business = current_user.businesses.find(params[:business_id])
  rescue ActiveRecord::RecordNotFound
    render_error(I18n.t("errors.not_found"), status: :not_found)
  end

  def current_business
    @current_business
  end
end
