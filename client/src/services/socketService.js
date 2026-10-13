import { io } from 'socket.io-client';

const PRIMARY_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'https://rasoijunction.up.railway.app');

const FALLBACK_SOCKET_URL = import.meta.env.VITE_FALLBACK_SOCKET_URL || 
  (import.meta.env.VITE_FALLBACK_API_URL ? import.meta.env.VITE_FALLBACK_API_URL.replace(/\/api\/?$/, '') : 'https://zodiac-snooper-cornfield.ngrok-free.dev');

let socket = null;
let currentSocketUrl = (typeof window !== 'undefined' && sessionStorage.getItem('active_api_url'))
  ? sessionStorage.getItem('active_api_url').replace(/\/api\/?$/, '')
  : PRIMARY_SOCKET_URL;

export const connectSocket = (user) => {
  if (socket) return socket;

  const init = (targetUrl) => {
    socket = io(targetUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 8000,
    });

    socket.on('connect', () => {
      console.log(`🔌 Connected to Socket.IO Server (${targetUrl})`);
      if (user) {
        socket.emit('join', { userId: user._id, role: user.role });
      }
    });

    socket.on('connect_error', (err) => {
      console.warn(`⚠️ Socket connection failed on ${targetUrl}:`, err.message);
      if (targetUrl !== FALLBACK_SOCKET_URL && FALLBACK_SOCKET_URL) {
        console.log(`🔄 Switching Socket.IO to fallback: ${FALLBACK_SOCKET_URL}`);
        socket.disconnect();
        init(FALLBACK_SOCKET_URL);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO Server');
    });
  };

  init(currentSocketUrl);
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
