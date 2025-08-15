import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createAppError } from '../middleware/errorHandler';

/**
 * Type-safe async handler for Express routes
 * @param fn The async route handler function
 * @returns A new route handler that catches and passes errors to Express's next function
 */
export const asyncHandler = <
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction
  ) => Promise<void | Response<ResBody, Locals>>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      const appError = createAppError(error);
      
      // Set appropriate translation key based on the error
      if (!appError.translationKey) {
        // Default to a generic error if no specific translation key is set
        appError.translationKey = 'errors.generic';
      }
      
      next(appError);
    });
  };
};

/**
 * Creates a new AppError with the given message, status code, and translation key
 * @param message Error message
 * @param statusCode HTTP status code
 * @param translationKey Translation key for i18n
 * @param translationParams Optional parameters for the translation
 * @returns A new AppError instance
 */
export const createError = (
  message: string,
  statusCode: number,
  translationKey: string,
  translationParams?: Record<string, unknown>
) => {
  const error = new Error(message) as Error & {
    statusCode: number;
    translationKey: string;
    translationParams?: Record<string, unknown>;
  };
  
  error.statusCode = statusCode;
  error.translationKey = translationKey;
  if (translationParams) {
    error.translationParams = translationParams;
  }
  return error;
};
