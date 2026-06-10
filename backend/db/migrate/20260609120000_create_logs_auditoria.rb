class CreateLogsAuditoria < ActiveRecord::Migration[7.2]
  def change
    create_table :logs_auditoria, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.uuid    :usuario_id
      t.uuid    :empresa_id
      t.string  :acao,        null: false
      t.string  :entidade,    null: false
      t.uuid    :entidade_id
      t.jsonb   :detalhes,    null: false, default: {}
      t.timestamptz :criado_em, default: -> { "now()" }, null: false
    end

    add_index :logs_auditoria, :empresa_id
    add_index :logs_auditoria, :usuario_id
    add_index :logs_auditoria, :criado_em
  end
end
