class LogAuditoria < ApplicationRecord
  self.table_name = 'logs_auditoria'

  belongs_to :usuario, optional: true
  belongs_to :empresa, optional: true
end
