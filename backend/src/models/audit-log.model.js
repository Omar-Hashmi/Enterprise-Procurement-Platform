const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failure',
      'password_changed',
      'password_reset_requested',
      'password_reset_success',
      'approval_created',
      'approval_decision',
      'purchase_request_created',
      'purchase_request_updated',
      'purchase_request_cancelled',
      'purchase_request_deleted',
      'purchase_order_created',
      'purchase_order_updated',
      'purchase_order_status_changed',
      'purchase_order_cancelled',
    ],
  },
  entity: {
    type: String,
    enum: ['User', 'Approval', 'PurchaseRequest', 'PurchaseOrder', 'Vendor', 'Quotation'],
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entity' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByRole: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
