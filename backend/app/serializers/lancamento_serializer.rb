class LancamentoSerializer
  include JSONAPI::Serializer

  attributes :id, :empresa_id, :categoria_id, :descricao, :tipo, :valor,
             :data_vencimento, :data_pagamento, :status, :grupo_parcelamento_id, :criado_em
end
