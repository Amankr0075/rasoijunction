import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (user) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to Socket.IO Server');
    
    // Join appropriate rooms
    if (user) {
      socket.emit('join', { userId: user._id, role: user.role });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from Socket.IO Server');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
