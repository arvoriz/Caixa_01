class EmprestimoSerializer
  include JSONAPI::Serializer

  attributes :id, :tipo, :empresa_origem_id, :empresa_destino_id, :credor_externo,
             :descricao, :valor, :saldo_devedor, :status, :data_contrato, :criado_em

  attribute :progresso, &:progresso

  attribute :empresa_origem_nome do |e|
    e.empresa_origem&.nome_fantasia || e.empresa_origem&.razao_social
  end

  attribute :empresa_destino_nome do |e|
    e.empresa_destino&.nome_fantasia || e.empresa_destino&.razao_social
  end

  # Nome de quem emprestou (credor): a empresa de origem no mútuo, ou o credor externo.
  attribute :credor_nome do |e|
    e.mutuo? ? (e.empresa_origem&.nome_fantasia || e.empresa_origem&.razao_social) : e.credor_externo
  end
end
