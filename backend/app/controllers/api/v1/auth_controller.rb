module Api
  module V1
    class AuthController < BaseController
      def me
        render_sucesso(UsuarioSerializer.new(usuario_atual).serializable_hash[:data][:attributes])
      end
    end
  end
end
