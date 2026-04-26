module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = Auth::TokenService.decode(token)
    @current_user = User.find(payload["user_id"])
  rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
    render_error(I18n.t("errors.unauthorized"), status: :unauthorized)
  end

  def current_user
    @current_user
  end
end
