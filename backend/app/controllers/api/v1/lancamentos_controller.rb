module Api
  module V1
    class LancamentosController < BaseController
      include EscopoEmpresa

      # GET /api/v1/empresas/:empresa_id/lancamentos
      # Filtros opcionais: status, tipo, busca (descrição)
      def index
        lancamentos = empresa_atual.lancamentos.includes(:categoria).order(data_vencimento: :desc)
        lancamentos = lancamentos.where(tipo: params[:tipo])     if params[:tipo].present?
        lancamentos = lancamentos.where(status: params[:status]) if params[:status].present?
        if params[:busca].present?
          lancamentos = lancamentos.where("descricao ILIKE ?", "%#{params[:busca]}%")
        end

        render_sucesso(lancamentos.map { |l| serializar(l) }, meta: { total: lancamentos.size })
      end

      def create
        criados = Lancamentos::CriarService.new(
          empresa:  empresa_atual,
          params:   lancamento_params.to_h.symbolize_keys,
          parcelas: params[:parcelas]
        ).call

        render_sucesso(criados.map { |l| serializar(l) }, status: :created)
      end

      def update
        lancamento = empresa_atual.lancamentos.find(params[:id])
        lancamento.update!(lancamento_params)
        render_sucesso(serializar(lancamento))
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      end

      def destroy
        lancamento = empresa_atual.lancamentos.find(params[:id])
        lancamento.destroy!
        render_sucesso({})
      rescue ActiveRecord::RecordNotFound
        render_erro(["Lançamento não encontrado"], status: :not_found)
      end

      private

      def lancamento_params
        params.require(:lancamento).permit(
          :categoria_id, :descricao, :tipo, :valor,
          :data_vencimento, :data_pagamento, :status
        )
      end

      def serializar(lancamento)
        LancamentoSerializer.new(lancamento).serializable_hash[:data][:attributes]
                            .merge(categoria_nome: lancamento.categoria&.nome)
      end
    end
  end
end
