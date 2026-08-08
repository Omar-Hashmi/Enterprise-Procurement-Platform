const auditLogService = require('../services/audit-log.service');

// GET /api/audit-logs?entity=&action=&userId=&start=&end=&limit=
exports.list = async (req, res) => {
  try {
    const { entity, action, userId, start, end, limit = 100, skip = 0 } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    if (userId) filter.performedBy = userId;
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }
    const logs = await auditLogService.query(filter, { limit: Number(limit), skip: Number(skip) });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
