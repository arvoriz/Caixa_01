module Api
  module V1
    class EmpresaConvitesController < BaseController
      before_action :carregar_empresa

      def create
        meu_papel     = meu_acesso.papel
        papel_convite = params[:papel]

        return render_erro(["Sem permissão"], status: :forbidden)                                              if meu_papel == "contador"
        return render_erro(["Papel inválido"], status: :unprocessable_entity)                                  unless %w[socio contador].include?(papel_convite)
        return render_erro(["Sócio pode convidar apenas contadores"], status: :forbidden)                      if meu_papel == "socio" && papel_convite != "contador"

        token     = SecureRandom.urlsafe_base64(32)
        expira_em = 24.hours.from_now

        Convite.create!(
          empresa_id:    @empresa.id,
          papel:         papel_convite,
          convidado_por: usuario_atual.id,
          token:         token,
          expira_em:     expira_em
        )

        base_url = ENV.fetch("FRONTEND_URL", "http://localhost:4200")
        render_sucesso({ url: "#{base_url}/convite?token=#{token}", expira_em: expira_em })
      end

      private

      def carregar_empresa
        @empresa = usuario_atual.empresas.find(params[:empresa_id])
      rescue ActiveRecord::RecordNotFound
        render_erro(["Empresa não encontrada"], status: :not_found)
      end

      def meu_acesso
        @meu_acesso ||= @empresa.acessos_empresas.find_by!(usuario_id: usuario_atual.id)
      end
    end
  end
end
