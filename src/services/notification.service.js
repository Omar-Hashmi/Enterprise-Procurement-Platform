// src/services/notification.service.js
// Centralized notification manager using Socket.IO via socketManager.
// Provides helper methods to emit events to specific users or roles.

const socketManager = require('../utils/socketManager');

function buildPayload(event, data = {}) {
  return {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

function emitToUser(userId, event, data) {
  const payload = buildPayload(event, data);
  socketManager.emitToUser(userId, event, payload);
}

function emitToRole(role, event, data) {
  const payload = buildPayload(event, data);
  socketManager.emitToRole(role, event, payload);
}

module.exports = {
  emitToUser,
  emitToRole,
};
