const AuditLog = require('../models/audit-log.model');

class AuditLogRepository {
  async create(entry) {
    return AuditLog.create(entry);
  }

  // read-only for admin UI
  async find(filter = {}, options = {}) {
    return AuditLog.find(filter, null, options).sort({ timestamp: -1 });
  }
}

module.exports = new AuditLogRepository();
