import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

const createRateLimiter = (minutes: number, maxRequests: number) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: `Too many requests from this IP, please try again after ${minutes} minutes`,
    handler: (req: Request, res: Response, next: NextFunction) => {
      next(
        new AppError(
          `Too many requests from this IP, please try again in ${minutes} minutes`,
          429
        )
      );
    },
  });
};

// Apply different rate limits for different routes
export const authLimiter = createRateLimiter(15, 100); // 100 requests per 15 minutes
export const apiLimiter = createRateLimiter(60, 1000); // 1000 requests per hour
export const strictLimiter = createRateLimiter(15, 50); // 50 requests per 15 minutes
export const publicLimiter = createRateLimiter(60, 100); // 100 requests per minute

// Special rate limiters for sensitive endpoints
export const passwordResetLimiter = createRateLimiter(60, 5); // 5 requests per hour
export const signupLimiter = createRateLimiter(60, 10); // 10 requests per hour

export default {
  authLimiter,
  apiLimiter,
  strictLimiter,
  publicLimiter,
  passwordResetLimiter,
  signupLimiter,
};
