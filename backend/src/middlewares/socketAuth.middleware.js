// src/middlewares/socketAuth.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Socket.IO authentication middleware.
 * Expects the client to send the JWT token in the handshake auth object as `token`.
 * On success, attaches the decoded payload to `socket.user`.
 */
function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: token missing'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (err) {
    return next(new Error('Authentication error: invalid token'));
  }
}

module.exports = socketAuth;
