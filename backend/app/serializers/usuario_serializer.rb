class UsuarioSerializer
  include JSONAPI::Serializer

  attributes :id, :nome_completo, :email, :ultima_empresa_id, :criado_em
end
