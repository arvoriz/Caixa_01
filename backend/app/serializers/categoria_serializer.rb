class CategoriaSerializer
  include JSONAPI::Serializer

  attributes :id, :empresa_id, :nome, :tipo, :padrao_sistema
end
