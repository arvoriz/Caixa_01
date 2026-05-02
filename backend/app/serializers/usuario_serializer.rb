class UsuarioSerializer
  include JSONAPI::Serializer

  attributes :id, :nome_completo, :email, :criado_em
end
