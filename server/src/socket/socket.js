import { Server } from 'socket.io';
import env from '../config/env.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for specific user ID or role
    socket.on('join', (data) => {
      if (data.userId) {
        socket.join(data.userId);
        console.log(`👤 User joined room: ${data.userId}`);
      }
      if (data.role) {
        socket.join(data.role);
        console.log(`👥 Role joined room: ${data.role}`);
      }
    });

    // Leave room
    socket.on('leave', (data) => {
      if (data.userId) {
        socket.leave(data.userId);
        console.log(`👤 User left room: ${data.userId}`);
      }
      if (data.role) {
        socket.leave(data.role);
        console.log(`👥 Role left room: ${data.role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
