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
export const configureCors = (req: Request, res: Response, next: NextFunction): void => {
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
    res.sendStatus(200);
    return;
  }

  next();
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate({ abortEarly: false });

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

// CSRF protection (simplified - skip for API requests)
export const csrfProtection = (req: Request, _res: Response, next: NextFunction): void => {
  // Skip CSRF check for API requests (stateless)
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }

  // For non-API requests, skip CSRF (or implement session-based CSRF)
  next();
};
