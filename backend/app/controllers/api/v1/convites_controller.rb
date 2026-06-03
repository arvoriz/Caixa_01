module Api
  module V1
    # Endpoint público — valida token sem precisar de sessão.
    # Endpoint de aceitação — requer JWT do usuário logado.
    class ConvitesController < BaseController
      skip_before_action :autenticar_usuario!, only: [:show]

      # GET /api/v1/convites/:token
      # Retorna dados públicos do convite para exibir na tela de boas-vindas.
      def show
        convite = Convite.validos.find_by!(token: params[:token])
        render_sucesso({
          nome_fantasia: convite.empresa.nome_fantasia,
          razao_social:  convite.empresa.razao_social,
          papel:         convite.papel,
          expira_em:     convite.expira_em
        })
      rescue ActiveRecord::RecordNotFound
        render_erro(["Convite inválido ou expirado"], status: :not_found)
      end

      # POST /api/v1/convites/:token/aceitar
      # Usuário já autenticado aceita o convite — víncula à empresa.
      def aceitar
        convite = Convite.validos.find_by!(token: params[:token])

        if AcessoEmpresa.exists?(empresa_id: convite.empresa_id, usuario_id: usuario_atual.id)
          return render_erro(["Você já tem acesso a esta empresa"], status: :unprocessable_entity)
        end

        if convite.usar!(usuario_atual)
          render_sucesso({ mensagem: "Acesso concedido", empresa: convite.empresa.razao_social, papel: convite.papel })
        else
          render_erro(["Convite inválido ou expirado"], status: :unprocessable_entity)
        end
      rescue ActiveRecord::RecordNotFound
        render_erro(["Convite inválido ou expirado"], status: :not_found)
      end
    end
  end
end
