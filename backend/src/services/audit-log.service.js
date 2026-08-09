const auditLogRepo = require('../repositories/audit-log.repository');
const mongoose = require('mongoose');

class AuditLogService {
  /**
   * Record an audit event.
   * @param {Object} event - Must match AuditLog schema fields.
   */
  async log(event) {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }
    try {
      return await auditLogRepo.create(event);
    } catch (err) {
      console.error('Audit log insertion failed:', err.message);
      return null;
    }
  }

  /** Query audit logs (admin only) */
  async query(filter = {}, options = {}) {
    return auditLogRepo.find(filter, options);
  }
}

module.exports = new AuditLogService();
