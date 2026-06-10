module EscopoEmpresa
  extend ActiveSupport::Concern

  included do
    before_action :definir_empresa_atual
  end

  def definir_empresa_atual
    @empresa_atual = usuario_atual.empresas.find(params[:empresa_id])
  rescue ActiveRecord::RecordNotFound
    render_erro(I18n.t("errors.not_found"), status: :not_found)
  end

  def empresa_atual
    @empresa_atual
  end

  # Papel do usuário autenticado na empresa ativa: dono, socio ou contador.
  def papel_atual
    @papel_atual ||= empresa_atual&.acessos_empresas&.find_by(usuario_id: usuario_atual.id)&.papel
  end

  # Guard para ações de escrita: o contador tem acesso somente leitura.
  # Use como before_action nos endpoints de mutação (only: %i[create update ...]).
  def bloquear_somente_leitura!
    return unless papel_atual == "contador"

    render_erro(["Contador tem acesso somente leitura"], status: :forbidden)
  end
end
