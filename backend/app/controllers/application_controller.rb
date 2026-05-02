class ApplicationController < ActionController::API
  include RespostaJson
  include Autenticavel

  rescue_from ActiveRecord::RecordNotFound,       with: :nao_encontrado
  rescue_from ActiveRecord::RecordInvalid,        with: :nao_processavel
  rescue_from ActionController::ParameterMissing, with: :requisicao_invalida
end
