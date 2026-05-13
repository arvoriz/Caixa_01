module Api
  module V1
    class EmpresasController < BaseController
      def index
        empresas = usuario_atual.empresas.includes(:acessos_empresas)
        data = empresas.map { |e| serializar(e) }
        render_sucesso(data)
      end

      def create
        empresa = Empresa.new(empresa_params)
        empresa.save!
        AcessoEmpresa.create!(empresa: empresa, usuario: usuario_atual, papel: :dono)
        render_sucesso(serializar(empresa), status: :created)
      end

      private

      def empresa_params
        params.require(:empresa).permit(:cnpj, :razao_social, :nome_fantasia, :saldo_inicial)
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
