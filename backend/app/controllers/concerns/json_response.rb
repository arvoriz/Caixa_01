module JsonResponse
  extend ActiveSupport::Concern

  def render_success(data, status: :ok, meta: {})
    render json: { data: data, meta: meta, errors: [] }, status: status
  end

  def render_error(errors, status: :unprocessable_entity)
    render json: { data: nil, meta: {}, errors: Array(errors) }, status: status
  end

  def not_found(exception = nil)
    render_error(exception&.message || I18n.t("errors.not_found"), status: :not_found)
  end

  def unprocessable(exception)
    render_error(exception.record.errors.full_messages, status: :unprocessable_entity)
  end

  def bad_request(exception)
    render_error(exception.message, status: :bad_request)
  end
end
