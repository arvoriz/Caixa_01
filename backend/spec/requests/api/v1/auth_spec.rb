require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  let(:user) { create(:user, password: "senha123") }

  describe "POST /api/v1/auth/login" do
    it "retorna token com credenciais válidas" do
      post "/api/v1/auth/login", params: { email: user.email, password: "senha123" }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]).to have_key("token")
    end

    it "retorna 401 com credenciais inválidas" do
      post "/api/v1/auth/login", params: { email: user.email, password: "errada" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/auth/me" do
    it "retorna usuário autenticado" do
      token = JwtService.encode(user_id: user.id)
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer #{token}" }
      expect(response).to have_http_status(:ok)
    end
  end
end
