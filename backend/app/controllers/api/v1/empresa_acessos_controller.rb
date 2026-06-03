module Api
  module V1
    class EmpresaAcessosController < BaseController
      before_action :carregar_empresa

      def index
        acessos = @empresa.acessos_empresas.includes(:usuario)
        render_sucesso(acessos.map { |a| serializar(a) })
      end

      def destroy
        acesso    = @empresa.acessos_empresas.find(params[:id])
        meu_papel = meu_acesso.papel

        return render_erro(["Sem permissão"], status: :forbidden)          if meu_papel == "contador"
        return render_erro(["Não é possível remover o dono"], status: :unprocessable_entity) if acesso.papel == "dono"
        return render_erro(["Sócio pode remover apenas contadores"], status: :forbidden) if meu_papel == "socio" && acesso.papel != "contador"

        acesso.destroy!
        render_sucesso({})
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

      def serializar(acesso)
        {
          id:         acesso.id,
          papel:      acesso.papel,
          usuario_id: acesso.usuario_id,
          nome:       acesso.usuario.nome_completo,
          email:      acesso.usuario.email,
          criado_em:  acesso.criado_em
        }
      end
    end
  end
end
