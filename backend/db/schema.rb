# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_06_09_120000) do
  create_schema "auth"
  create_schema "extensions"
  create_schema "graphql"
  create_schema "graphql_public"
  create_schema "pgbouncer"
  create_schema "realtime"
  create_schema "storage"
  create_schema "vault"

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "supabase_vault"
  enable_extension "uuid-ossp"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "papel_usuario", ["dono", "socio", "contador"]
  create_enum "status_emprestimo", ["ativo", "quitado", "cancelado"]
  create_enum "status_lancamento", ["pendente", "pago", "atrasado", "cancelado"]
  create_enum "tipo_transacao", ["entrada", "saida"]

  create_table "acessos_empresas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "empresa_id", null: false
    t.uuid "usuario_id", null: false
    t.enum "papel", null: false, enum_type: "papel_usuario"
    t.timestamptz "criado_em", default: -> { "now()" }, null: false
    t.index ["empresa_id"], name: "acessos_empresas_empresa_id_idx"
    t.index ["usuario_id"], name: "acessos_empresas_usuario_id_idx"
    t.unique_constraint ["empresa_id", "usuario_id"], name: "acessos_empresas_empresa_id_usuario_id_key"
  end

  create_table "categorias", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "empresa_id"
    t.string "nome", null: false
    t.enum "tipo", null: false, enum_type: "tipo_transacao"
    t.boolean "padrao_sistema", default: false, null: false
  end

  create_table "convites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "empresa_id", null: false
    t.enum "papel", null: false, enum_type: "papel_usuario"
    t.uuid "convidado_por", null: false
    t.string "token", null: false
    t.timestamptz "usado_em"
    t.timestamptz "expira_em", null: false
    t.timestamptz "criado_em", default: -> { "now()" }

    t.unique_constraint ["token"], name: "convites_token_key"
  end

  create_table "empresas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "cnpj", null: false
    t.string "razao_social", null: false
    t.string "nome_fantasia"
    t.decimal "saldo_atual", precision: 15, scale: 2, default: "0.0", null: false
    t.timestamptz "criado_em", default: -> { "now()" }, null: false

    t.unique_constraint ["cnpj"], name: "empresas_cnpj_key"
  end

  create_table "emprestimos_mutuo", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "empresa_origem_id", null: false
    t.uuid "empresa_destino_id", null: false
    t.string "descricao"
    t.decimal "valor", precision: 15, scale: 2, null: false
    t.decimal "saldo_devedor", precision: 15, scale: 2, null: false
    t.enum "status", default: "ativo", null: false, enum_type: "status_emprestimo"
    t.timestamptz "criado_em", default: -> { "now()" }, null: false
    t.index ["empresa_destino_id"], name: "emprestimos_mutuo_empresa_destino_id_idx"
    t.index ["empresa_origem_id"], name: "emprestimos_mutuo_empresa_origem_id_idx"
  end

  create_table "lancamentos", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "empresa_id", null: false
    t.uuid "categoria_id", null: false
    t.string "descricao", null: false
    t.enum "tipo", null: false, enum_type: "tipo_transacao"
    t.decimal "valor", precision: 15, scale: 2, null: false
    t.date "data_vencimento", null: false
    t.date "data_pagamento"
    t.enum "status", default: "pendente", null: false, enum_type: "status_lancamento"
    t.uuid "grupo_parcelamento_id"
    t.timestamptz "criado_em", default: -> { "now()" }, null: false
    t.index ["data_vencimento"], name: "lancamentos_data_vencimento_idx"
    t.index ["empresa_id"], name: "lancamentos_empresa_id_idx"
    t.index ["grupo_parcelamento_id"], name: "lancamentos_grupo_parcelamento_id_idx"
  end

  create_table "logs_auditoria", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "usuario_id"
    t.uuid "empresa_id"
    t.string "acao", null: false
    t.string "entidade", null: false
    t.uuid "entidade_id"
    t.jsonb "detalhes", default: {}, null: false
    t.timestamptz "criado_em", default: -> { "now()" }, null: false
    t.index ["criado_em"], name: "index_logs_auditoria_on_criado_em"
    t.index ["empresa_id"], name: "index_logs_auditoria_on_empresa_id"
    t.index ["usuario_id"], name: "index_logs_auditoria_on_usuario_id"
  end

  create_table "usuarios", id: :uuid, default: nil, force: :cascade do |t|
    t.string "email", null: false
    t.string "nome_completo"
    t.timestamptz "criado_em", default: -> { "now()" }, null: false
    t.uuid "ultima_empresa_id"

    t.unique_constraint ["email"], name: "usuarios_email_key"
  end

  add_foreign_key "acessos_empresas", "empresas", name: "acessos_empresas_empresa_id_fkey", on_delete: :cascade
  add_foreign_key "acessos_empresas", "usuarios", name: "acessos_empresas_usuario_id_fkey", on_delete: :cascade
  add_foreign_key "categorias", "empresas", name: "categorias_empresa_id_fkey", on_delete: :cascade
  add_foreign_key "convites", "empresas", name: "convites_empresa_id_fkey", on_delete: :cascade
  add_foreign_key "convites", "usuarios", column: "convidado_por", name: "convites_convidado_por_fkey"
  add_foreign_key "emprestimos_mutuo", "empresas", column: "empresa_destino_id", name: "emprestimos_mutuo_empresa_destino_id_fkey"
  add_foreign_key "emprestimos_mutuo", "empresas", column: "empresa_origem_id", name: "emprestimos_mutuo_empresa_origem_id_fkey"
  add_foreign_key "lancamentos", "categorias", name: "lancamentos_categoria_id_fkey"
  add_foreign_key "lancamentos", "empresas", name: "lancamentos_empresa_id_fkey", on_delete: :cascade
  add_foreign_key "usuarios", "auth.users", column: "id", name: "usuarios_id_fkey", on_delete: :cascade
  add_foreign_key "usuarios", "empresas", column: "ultima_empresa_id", name: "usuarios_ultima_empresa_id_fkey", on_delete: :nullify
end
