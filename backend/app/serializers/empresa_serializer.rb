class EmpresaSerializer
  include JSONAPI::Serializer

  attributes :id, :cnpj, :razao_social, :nome_fantasia, :saldo_atual, :criado_em
end
