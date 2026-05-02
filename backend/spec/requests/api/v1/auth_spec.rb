require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  let(:usuario) { create(:usuario) }

  describe "GET /api/v1/auth/me" do
    it "retorna usuário autenticado" do
      allow(Auth::TokenService).to receive(:decodificar).and_return({ "sub" => usuario.id })
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer token_valido" }
      expect(response).to have_http_status(:ok)
    end

    it "retorna 401 sem token" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
