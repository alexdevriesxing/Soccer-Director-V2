// Import Node.js types
/// <reference types="node" />

import 'express-async-errors';

// Define our environment variables type
interface AppEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  FRONTEND_URL: string;
}
import { createServer, Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { Server as SocketIOServer } from 'socket.io';
import * as path from 'path';
import express, { Application, Request as ExpressRequest, Response, ErrorRequestHandler, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import config and routes
import leagueRoutes from './routes/league.routes';

// Ensure Node.js globals are available
declare const process: NodeJS.Process;

// Define user payload type
export interface UserPayload {
  id: number;
  role: string;
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

// Re-export the extended Request type
export interface Request extends ExpressRequest {
  user?: UserPayload;
}
// Import other route files as they're created

class App {
  public app: Application;
  public readonly httpServer: HttpServer | HttpsServer;
  // Socket.IO instance for real-time communication
  private io: SocketIOServer;
  
  // Track if server is running
  private isRunning = false;
  private env: AppEnv;
  
  // Alias for backward compatibility
  public get server(): ReturnType<typeof createServer> {
    return this.httpServer;
  }

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    
    // Initialize environment variables with defaults and type safety
    const nodeEnv = (process.env.NODE_ENV as AppEnv['NODE_ENV']) || 'development';
    this.env = {
      NODE_ENV: nodeEnv,
      PORT: process.env.PORT || '3000',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    };
    
    // Initialize Socket.IO with proper CORS
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: this.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Trust proxy
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: this.env.FRONTEND_URL,
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Request logging
    this.app.use(
      morgan(this.env.NODE_ENV === 'production' ? 'combined' : 'dev')
    );
    
    // Development-only middleware
    if (this.env.NODE_ENV === 'development') {
      this.app.use((_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('X-Environment', 'development');
        next();
      });
    }

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    const publicPath = path.join(process.cwd(), 'public');
    this.app.use(express.static(publicPath));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: this.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/leagues', leagueRoutes);
    // Add other route files here as they're created
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Not Found',
      });
    });

    // Define custom error interface
    interface AppError extends Error {
      statusCode?: number;
      details?: unknown;
      errors?: unknown[];
      code?: string;
    }

    // Error handling middleware
    const errorHandler: ErrorRequestHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
      // Default status code
      let statusCode = 500;
      let message = 'Internal Server Error';
      
      // Handle different types of errors
      if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        // JSON parse error
        statusCode = 400;
        message = 'Invalid JSON';
      } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Prisma errors
        statusCode = 400;
        message = 'Database error occurred';
        
        // Handle specific Prisma error codes
        if (err.code === 'P2002') {
          message = 'Duplicate entry';
        } else if (err.code === 'P2025') {
          statusCode = 404;
          message = 'Record not found';
        }
      } else if (err.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = 'Validation failed';
      } else if (err.statusCode) {
        // Custom application error
        statusCode = err.statusCode;
        message = err.message;
      }
      
      const isDevelopment = this.env.NODE_ENV === 'development';
      
      // Log the error
      console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path}`, {
        error: err.message,
        stack: isDevelopment ? err.stack : undefined,
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Prepare error response
      const errorResponse: Record<string, unknown> = {
        status: 'error',
        message: message,
        ...(statusCode >= 500 && isDevelopment && { error: err.message }),
      };
      
      // Add additional debug info in development
      if (isDevelopment) {
        if (err.stack) errorResponse.stack = err.stack;
        if (err.details) errorResponse.details = err.details;
        if (err.errors) errorResponse.errors = err.errors;
      }
      
      res.status(statusCode).json(errorResponse);
    };
    
    this.app.use(errorHandler);
  }

  /**
   * Start the HTTP server
   * @param port - Port to listen on
   * @returns Promise that resolves with the HTTP server instance
   */
  public start(port: number | string): Promise<HttpServer> {
    if (this.isRunning) {
      return Promise.reject(new Error('Server is already running'));
    }

    return new Promise((resolve, reject) => {
      const onError = (error: NodeJS.ErrnoException) => {
        if (error.syscall !== 'listen') {
          return reject(error);
        }

        const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

        // Handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
          default:
            reject(error);
        }
      };

      this.httpServer.on('error', onError);

      const onListening = () => {
        this.isRunning = true;
        const addr = this.httpServer.address();
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
        
        console.log(`Server is running on ${bind}`);
        console.log(`Environment: ${this.env.NODE_ENV}`);
        console.log(`Frontend URL: ${this.env.FRONTEND_URL}`);
        
        // Setup Socket.IO
        this.setupSocketIO();
        
        // Resolve with the HTTP server instance
        resolve(this.httpServer as HttpServer);
      };

      this.httpServer.listen(port, onListening);
    });
  }
  
  /**
   * Setup Socket.IO with proper typing and event handlers
   */
  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('New client connected');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
      
      // Add your Socket.IO event handlers here
    });
  }
  
  /**
   * Gracefully shutdown the server
   */
  public async close(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    return new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        this.httpServer.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.isRunning = false;
            console.log('Server has been closed');
            resolve();
          }
        });
      });
    });
  }
}

export default App;
