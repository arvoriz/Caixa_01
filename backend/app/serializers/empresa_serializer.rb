class EmpresaSerializer
  include JSONAPI::Serializer

  attributes :id, :cnpj, :razao_social, :nome_fantasia, :saldo_inicial, :criado_em
end
