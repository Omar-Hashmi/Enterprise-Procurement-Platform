// src/utils/socketManager.js
// Manages Socket.IO connections and provides helper methods to emit events to users or roles.

const socketMap = new Map(); // key: socket.id, value: {socket, userId, role}
const userSockets = new Map(); // key: userId, value: Set of socket ids
const roleSockets = new Map(); // key: role, value: Set of socket ids

/** Add a new socket connection */
function addSocket(socket) {
  const { userId, role } = socket.user || socket.handshake.auth || {};
  if (!userId) return;
  socketMap.set(socket.id, { socket, userId, role });

  // Track by userId
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socket.id);

  // Track by role if present
  if (role) {
    if (!roleSockets.has(role)) roleSockets.set(role, new Set());
    roleSockets.get(role).add(socket.id);
  }
}

/** Remove a socket connection */
function removeSocket(socket) {
  const info = socketMap.get(socket.id);
  if (!info) return;
  const { userId, role } = info;
  socketMap.delete(socket.id);

  if (userSockets.has(userId)) {
    const set = userSockets.get(userId);
    set.delete(socket.id);
    if (set.size === 0) userSockets.delete(userId);
  }

  if (role && roleSockets.has(role)) {
    const set = roleSockets.get(role);
    set.delete(socket.id);
    if (set.size === 0) roleSockets.delete(role);
  }
}

/** Get sockets for a specific user */
function getSocketsByUserId(userId) {
  const ids = userSockets.get(userId);
  if (!ids) return [];
  return Array.from(ids).map(id => socketMap.get(id).socket);
}

/** Get sockets for a specific role */
function getSocketsByRole(role) {
  const ids = roleSockets.get(role);
  if (!ids) return [];
  return Array.from(ids).map(id => socketMap.get(id).socket);
}

/** Emit an event to a specific user */
function emitToUser(userId, event, payload) {
  const sockets = getSocketsByUserId(userId);
  sockets.forEach(s => s.emit(event, payload));
}

/** Emit an event to all users with a role */
function emitToRole(role, event, payload) {
  const sockets = getSocketsByRole(role);
  sockets.forEach(s => s.emit(event, payload));
}

module.exports = {
  addSocket,
  removeSocket,
  emitToUser,
  emitToRole,
};
