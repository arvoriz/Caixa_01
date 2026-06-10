class EstenderEmprestimosParaExternos < ActiveRecord::Migration[7.2]
  def up
    # Empréstimos externos (banco/pessoa) não têm empresa de origem.
    change_column_null :emprestimos_mutuo, :empresa_origem_id, true

    # tipo: 'mutuo' (intercompany), 'banco' ou 'pessoa' (credor externo)
    add_column :emprestimos_mutuo, :tipo,           :string, null: false, default: 'mutuo'
    add_column :emprestimos_mutuo, :credor_externo, :string
    add_column :emprestimos_mutuo, :data_contrato,  :date,   null: false, default: -> { "CURRENT_DATE" }
  end

  def down
    remove_column :emprestimos_mutuo, :data_contrato
    remove_column :emprestimos_mutuo, :credor_externo
    remove_column :emprestimos_mutuo, :tipo
    change_column_null :emprestimos_mutuo, :empresa_origem_id, false
  end
end
