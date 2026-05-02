module RespostaJson
  extend ActiveSupport::Concern

  def render_sucesso(data, status: :ok, meta: {})
    render json: { data: data, meta: meta, errors: [] }, status: status
  end

  def render_erro(errors, status: :unprocessable_entity)
    render json: { data: nil, meta: {}, errors: Array(errors) }, status: status
  end

  def nao_encontrado(exception = nil)
    render_erro(exception&.message || I18n.t("errors.not_found"), status: :not_found)
  end

  def nao_processavel(exception)
    render_erro(exception.record.errors.full_messages, status: :unprocessable_entity)
  end

  def requisicao_invalida(exception)
    render_erro(exception.message, status: :bad_request)
  end
end
