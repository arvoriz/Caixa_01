class LancamentoSerializer
  include JSONAPI::Serializer

  attributes :id, :empresa_id, :categoria_id, :descricao, :tipo, :valor,
             :data_vencimento, :data_pagamento, :grupo_parcelamento_id, :criado_em

  # Status efetivo: um lançamento pendente cuja data de vencimento já passou
  # é exibido como "atrasado", sem alterar o registro no banco.
  attribute :status do |lancamento|
    if lancamento.status == "pendente" && lancamento.data_vencimento.present? && lancamento.data_vencimento < Date.current
      "atrasado"
    else
      lancamento.status
    end
  end
end
