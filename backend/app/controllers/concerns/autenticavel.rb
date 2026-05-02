module Autenticavel
  extend ActiveSupport::Concern

  included do
    before_action :autenticar_usuario!
  end

  def autenticar_usuario!
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = Auth::TokenService.decodificar(token)
    @usuario_atual = Usuario.find(payload["sub"])
  rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
    render_erro(I18n.t("errors.unauthorized"), status: :unauthorized)
  end

  def usuario_atual
    @usuario_atual
  end
end
