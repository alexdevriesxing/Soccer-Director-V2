/**
 * Server Entry Point
 * 
 * This module is responsible for starting the HTTP server.
 */

import 'express-async-errors';
import dotenv from 'dotenv';
import { httpServer } from './app';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

function startServer() {
  try {
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`   - Local:    http://localhost:${PORT}`);
      console.log('Press CTRL-C to stop\n');
    });

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('Shutting down server...');
      httpServer.close(() => {
        console.log('Server shut down.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();