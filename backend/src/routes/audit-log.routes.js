const express = require('express');
const auditLogController = require('../controllers/audit-log.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Only admin can access audit logs
router.get('/', authenticate, authorize(['admin']), auditLogController.list);

module.exports = router;
