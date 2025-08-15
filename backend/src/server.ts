/**
 * Server Entry Point
 * 
 * This module is responsible for:
 * - Loading environment variables
 * - Initializing the Express application
 * - Setting up error handlers
 * - Starting the HTTP server
 * - Handling graceful shutdown
 */

// Import Node.js types at the very top
/// <reference types="node" />

// Import required modules
import 'express-async-errors';
import dotenv from 'dotenv';
import { Server as HttpServer } from 'http';
import App from './app.new';

// Define environment variable types
type NodeEnv = 'development' | 'production' | 'test';

// Extend global process object with our custom environment variables
declare const process: {
  env: {
    NODE_ENV?: NodeEnv;
    PORT?: string;
    FRONTEND_URL?: string;
    [key: string]: string | undefined;
  };
  exit(code?: number): never;
  on(event: 'uncaughtException', listener: (error: Error) => void): void;
  on(event: 'unhandledRejection', listener: (reason: unknown, promise: Promise<unknown>) => void): void;
  on(event: 'SIGTERM' | 'SIGINT', listener: () => void): void;
};

// Load environment variables from .env file
dotenv.config();

// Environment variable validation with type safety
function getEnvVar<T extends string | number>(
  key: string,
  defaultValue?: T,
  parser?: (value: string) => T
): T {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  if (parser) {
    return parser(value);
  }
  
  return value as unknown as T;
}

// Type-safe environment variables
const env = {
  NODE_ENV: getEnvVar<'development' | 'production' | 'test'>(
    'NODE_ENV',
    'development',
    (value) => {
      if (['development', 'production', 'test'].includes(value)) {
        return value as 'development' | 'production' | 'test';
      }
      return 'development';
    }
  ),
  PORT: getEnvVar<number>('PORT', 4000, (value) => {
    const port = parseInt(value, 10);
    if (isNaN(port) || port < 0 || port > 65535) {
      throw new Error(`Invalid port number: ${value}`);
    }
    return port;
  }),
  FRONTEND_URL: getEnvVar<string>('FRONTEND_URL', 'http://localhost:3000'),
} as const;

// Create server instance
const app = new App();
let server: HttpServer;


/**
 * Gracefully shut down the server
 */
async function shutdown(): Promise<void> {
  console.log('Shutting down server...');
  
  try {
    // Close the server first to stop accepting new connections
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
    
    // Close the application (this will close database connections, etc.)
    await app.close();
    
    console.log('Server has been shut down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
function setupErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Attempt to gracefully shut down
    shutdown().catch(() => process.exit(1));
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider logging to an external service in production
  });

  // Handle termination signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Start the application and get the HTTP server instance
    const httpServer = await app.start(env.PORT);
    if (!httpServer) {
      throw new Error('Failed to start HTTP server');
    }
    server = httpServer;
    
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr ? addr.port : 'unknown'}`;
    console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on ${bind}`);
    console.log(`   - Local:    http://localhost:${env.PORT}`);
    console.log(`   - Frontend: ${env.FRONTEND_URL}`);
    console.log('Press CTRL-C to stop\n');
    
    // Setup error handlers after server starts
    setupErrorHandlers();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);