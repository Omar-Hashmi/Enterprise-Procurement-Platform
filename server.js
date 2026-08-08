require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const socketIO = require('socket.io');
const socketAuth = require('./src/middlewares/socketAuth.middleware');
const socketManager = require('./src/utils/socketManager');

connectDB();

const server = http.createServer(app);
const io = new socketIO.Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Apply authentication middleware for Socket.IO
io.use(socketAuth);

io.on('connection', (socket) => {
  // Register socket
  socketManager.addSocket(socket);
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    socketManager.removeSocket(socket);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Export server and io for other modules
module.exports = { server, io };