module Api
  module V1
    class EmpresasController < BaseController
      def index
        empresas = usuario_atual.empresas.includes(:acessos_empresas)
        render_sucesso(empresas.map { |e| serializar(e) })
      end

      def create
        empresa = Empresa.new(empresa_params)
        empresa.save!
        AcessoEmpresa.create!(empresa: empresa, usuario: usuario_atual, papel: :dono)

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa,
          acao:        'criar_empresa',
          entidade:    'empresa',
          entidade_id: empresa.id,
          detalhes:    { cnpj: empresa.cnpj, razao_social: empresa.razao_social, nome_fantasia: empresa.nome_fantasia }
        )

        render_sucesso(serializar(empresa), status: :created)
      end

      def update
        empresa    = usuario_atual.empresas.find(params[:id])
        meu_papel  = empresa.acessos_empresas.find_by!(usuario_id: usuario_atual.id).papel

        return render_erro(["Sem permissão para editar"], status: :forbidden) if meu_papel == "contador"

        valores_antes = empresa.attributes.slice(*empresa_update_params.keys)
        empresa.update!(empresa_update_params)

        alteracoes = empresa_update_params.keys.each_with_object({}) do |campo, h|
          antes  = valores_antes[campo]
          depois = empresa.attributes[campo]
          h[campo] = { de: antes, para: depois } if antes.to_s != depois.to_s
        end

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa,
          acao:        'atualizar_empresa',
          entidade:    'empresa',
          entidade_id: empresa.id,
          detalhes:    { alteracoes: alteracoes }
        )

        render_sucesso(serializar(empresa))
      rescue ActiveRecord::RecordNotFound
        render_erro(["Empresa não encontrada"], status: :not_found)
      end

      def destroy
        empresa   = usuario_atual.empresas.find(params[:id])
        meu_papel = empresa.acessos_empresas.find_by!(usuario_id: usuario_atual.id).papel

        return render_erro(["Apenas o dono pode excluir a empresa"], status: :forbidden) unless meu_papel == "dono"

        Auditoria::Registrador.registrar(
          usuario:     usuario_atual,
          empresa:     empresa,
          acao:        'excluir_empresa',
          entidade:    'empresa',
          entidade_id: empresa.id,
          detalhes:    { cnpj: empresa.cnpj, razao_social: empresa.razao_social, nome_fantasia: empresa.nome_fantasia }
        )

        empresa.destroy!
        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Empresa não encontrada"], status: :not_found)
      end

      def transferir_titularidade
        empresa   = usuario_atual.empresas.find(params[:id])
        meu_acc   = empresa.acessos_empresas.find_by!(usuario_id: usuario_atual.id)

        return render_erro(["Apenas o dono pode transferir titularidade"], status: :forbidden) unless meu_acc.papel == "dono"

        novo_acc = empresa.acessos_empresas.find(params[:acesso_id])
        return render_erro(["Destino deve ser sócio"], status: :unprocessable_entity) unless novo_acc.papel == "socio"

        ActiveRecord::Base.transaction do
          meu_acc.update!(papel: :socio)
          novo_acc.update!(papel: :dono)
        end

        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Empresa ou acesso não encontrado"], status: :not_found)
      end

      private

      def empresa_params
        params.require(:empresa).permit(:cnpj, :razao_social, :nome_fantasia, :saldo_atual)
      end

      def empresa_update_params
        params.require(:empresa).permit(:nome_fantasia)
      end

      def serializar(empresa)
        acesso = empresa.acessos_empresas.find { |a| a.usuario_id == usuario_atual.id }
        EmpresaSerializer.new(empresa)
                         .serializable_hash[:data][:attributes]
                         .merge(papel: acesso&.papel)
      end
    end
  end
end
