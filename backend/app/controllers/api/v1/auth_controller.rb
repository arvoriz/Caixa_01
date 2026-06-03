module Api
  module V1
    class AuthController < BaseController
      def me
        render_sucesso(UsuarioSerializer.new(usuario_atual).serializable_hash[:data][:attributes])
      end

      def atualizar_perfil
        usuario_atual.update!(perfil_params)
        render_sucesso(UsuarioSerializer.new(usuario_atual).serializable_hash[:data][:attributes])
      end

      def ultima_empresa
        empresa = usuario_atual.empresas.find(params[:empresa_id])
        usuario_atual.update!(ultima_empresa_id: empresa.id)
        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Empresa não encontrada"], status: :not_found)
      end
      private

      def perfil_params
        params.require(:usuario).permit(:nome_completo)
      end
    end
  end
end
