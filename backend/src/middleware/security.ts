import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppError } from './errorHandler';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers using Helmet
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted-cdn.com'],
        styleSrc: ["'self'", 'trusted-cdn.com', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
        connectSrc: ["'self'", 'api.trusted.com'],
        fontSrc: ["'self'", 'trusted-cdn.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    frameguard: {
      action: 'deny',
    },
    dnsPrefetchControl: {
      allow: false,
    },
    ieNoOpen: true,
    referrerPolicy: { policy: 'same-origin' },
  })(req, res, next);
};

// CORS configuration
export const configureCors = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-production-domain.com',
  ];
  
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return next(
        new AppError(
          'Validation failed',
          400,
          errors
        )
      );
    }
    
    next();
  };
};

// CSRF protection (to be used with a CSRF token in forms)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for API requests
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Verify CSRF token for non-GET requests
  if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.method !== 'HEAD') {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!csrfToken || csrfToken !== req.session?.csrfToken) {
      return next(
        new AppError('Invalid CSRF token', 403)
      );
    }
  }
  
  // Generate new CSRF token for the next request
  if (req.session) {
    req.session.csrfToken = require('crypto').randomBytes(64).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
  }
  
  next();
};
