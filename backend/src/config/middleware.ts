import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from '../middleware/errorHandler';
import { securityHeaders, configureCors, csrfProtection } from '../middleware/security';

export const configureMiddleware = (app: express.Application) => {
  // Security headers
  app.use(securityHeaders);
  
  // CORS configuration
  app.use(configureCors);
  
  // CSRF protection
  app.use(csrfProtection);
  
  // Request logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Compression
  app.use(compression());
  
  // Static files
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Error handling (must be last)
  app.use(errorHandler);
};
