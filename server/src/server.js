import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { initSocket } from './socket/socket.js';
import { startAutoResponder } from './utils/autoResponder.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start IMAP Auto-Responder asynchronously
    startAutoResponder().catch(err => console.error('Failed to start Auto-Responder:', err));

    // Create HTTP Server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server);

    // Start HTTP server
    server.listen(env.PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║       🍽️  RASOI JUNCTION SERVER              ║');
      console.log('║       Good Food • Good Mood • Good Times   ║');
      console.log('╠══════════════════════════════════════════════╣');
      console.log(`║  🌐 Server:  http://localhost:${env.PORT}          ║`);
      console.log(`║  📦 Mode:    ${env.NODE_ENV.padEnd(30)}║`);
      console.log(`║  🕒 Started: ${new Date().toLocaleTimeString().padEnd(30)}║`);
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Restart trigger

// Trigger nodemon restart

// Trigger nodemon restart 2

// Trigger nodemon restart 3

// Trigger nodemon restart 4
