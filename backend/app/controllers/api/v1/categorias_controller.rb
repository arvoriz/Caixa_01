module Api
  module V1
    class CategoriasController < BaseController
      include EscopoEmpresa

      # GET /api/v1/empresas/:empresa_id/categorias
      # Retorna categorias padrão do sistema + categorias próprias da empresa.
      def index
        categorias = Categoria.where(padrao_sistema: true)
                              .or(Categoria.where(empresa_id: empresa_atual.id))
                              .order(:nome)
        categorias = categorias.where(tipo: params[:tipo]) if params[:tipo].present?
        render_sucesso(categorias.map { |c| serializar(c) })
      end

      def create
        categoria = empresa_atual.categorias.new(categoria_params)
        categoria.padrao_sistema = false
        categoria.save!
        render_sucesso(serializar(categoria), status: :created)
      end

      private

      def categoria_params
        params.require(:categoria).permit(:nome, :tipo)
      end

      def serializar(categoria)
        CategoriaSerializer.new(categoria).serializable_hash[:data][:attributes]
      end
    end
  end
end
