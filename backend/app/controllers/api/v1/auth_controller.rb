module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!, only: [:login]

      def login
        user = User.find_by(email: params[:email]&.downcase)

        if user&.authenticate(params[:password])
          token = Auth::TokenService.encode(user_id: user.id)
          render_success({ token: token, user: UserSerializer.new(user).serializable_hash[:data][:attributes] })
        else
          render_error("E-mail ou senha inválidos", status: :unauthorized)
        end
      end

      def logout
        render_success({ message: "Logout realizado com sucesso" })
      end

      def me
        render_success(UserSerializer.new(current_user).serializable_hash[:data][:attributes])
      end
    end
  end
end
