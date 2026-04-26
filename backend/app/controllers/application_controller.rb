class ApplicationController < ActionController::API
  include JsonResponse
  include Authenticatable

  rescue_from ActiveRecord::RecordNotFound,    with: :not_found
  rescue_from ActiveRecord::RecordInvalid,     with: :unprocessable
  rescue_from ActionController::ParameterMissing, with: :bad_request
end
