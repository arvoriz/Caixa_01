class EmprestimoMutuoSerializer
  include JSONAPI::Serializer

  attributes :id, :empresa_origem_id, :empresa_destino_id, :descricao,
             :valor, :saldo_devedor, :status, :criado_em
end
