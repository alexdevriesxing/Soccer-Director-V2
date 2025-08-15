/// <reference types="node" />

import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include language
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      language?: string;
    }
  }
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  translationKey: string;
  translationParams?: Record<string, unknown>;

  constructor(
    message: string, 
    statusCode: number, 
    translationKey: string = 'errors.generic',
    translationParams?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.translationKey = translationKey;
    this.translationParams = translationParams;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface CastError extends Error {
  path: string;
  value: unknown;
}

export const handleCastErrorDB = (err: CastError) => {
  return new AppError(
    `Invalid ${err.path}: ${err.value}`,
    400,
    'errors.invalidId',
    { field: err.path, value: err.value }
  );
};

interface DuplicateFieldError extends Error {
  meta?: {
    target?: string[];
  };
}

export const handleDuplicateFieldsDB = (err: DuplicateFieldError) => {
  const field = err.meta?.target?.[0] || 'field';
  return new AppError(
    `Duplicate field value: ${field}. Please use another value!`,
    400,
    'errors.duplicateField',
    { field }
  );
};

interface ValidationError extends Error {
  errors: Record<string, { message: string }>;
}

export const handleValidationErrorDB = (err: ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(
    `Invalid input data. ${errors.join('. ')}`,
    400,
    'errors.validation',
    { errors }
  );
};

// Handle JWT errors
export const handleJWTError = (_error: Error): AppError => {
  return new AppError('Invalid token. Please log in again!', 401, 'errors.invalid_token');
};

// Handle JWT expired error
export const handleJWTExpiredError = (_error: Error): AppError => {
  return new AppError('Your token has expired! Please log in again.', 401, 'errors.token_expired');
};

// Handle Prisma not found error
interface PrismaError extends Error {
  code?: string;
}

const handlePrismaNotFoundError = (_error: PrismaError): AppError => {
  return new AppError('Record not found', 404, 'errors.not_found');
};

// Error response type is now defined in the interface below

// Define process type to avoid TypeScript errors
declare const process: {
  env: {
    NODE_ENV?: string;
    ENABLE_TRANSLATION_DEBUG?: string;
  };
};

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper to create a safe AppError from any error
export const createAppError = (error: unknown): AppError => {
  // If it's already an AppError, return it as is
  if (error instanceof AppError) {
    return error;
  }

  // Handle Prisma not found error
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return handlePrismaNotFoundError(prismaError);
    }
  }

  // Handle JWT errors
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return handleJWTError(error);
  }

  // Handle JWT expired error
  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return handleJWTExpiredError(error);
  }

  // Handle native Error objects
  if (error instanceof Error) {
    return new AppError(
      error.message,
      500,
      'errors.generic',
      { originalError: error }
    );
  }

  // Handle non-Error thrown values
  const errorMessage = typeof error === 'string' ? error : 'Something went wrong!';
  return new AppError(
    errorMessage,
    500,
    'errors.generic',
    { originalError: error }
  );
};

// Interface for validation error item
export interface ValidationErrorItem {
  field?: string;
  message: string;
  value?: unknown;
}

// Extended AppError class for validation errors
export class ValidationAppError extends AppError {
  errors: ValidationErrorItem[];

  constructor(errors: ValidationErrorItem[]) {
    super('Validation failed', 400, 'validation_error');
    this.errors = errors;
  }
}

// Interface for error response
export interface ErrorResponse {
  status: string;
  message: string;
  error: {
    code: string;
    details?: unknown;
    errors?: ValidationErrorItem[];
  };
  stack?: string;
  translationKey?: string;
  translationParams?: Record<string, unknown>;
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let err = createAppError(error);
  // Handle different types of errors in production
  if (!isDevelopment) {
    if (err.name === 'CastError' && 'path' in err && 'value' in err) {
      err = handleCastErrorDB(err as unknown as CastError);
    } else if ('code' in err && err.code === 11000) {
      err = handleDuplicateFieldsDB(err as unknown as DuplicateFieldError);
    } else if (err.name === 'ValidationError' && 'errors' in err) {
      err = handleValidationErrorDB(err as unknown as ValidationError);
    } else if (err.name === 'JsonWebTokenError') {
      err = handleJWTError(err);
    } else if (err.name === 'TokenExpiredError') {
      err = handleJWTExpiredError(err);
    }
  }

  // Send appropriate error response based on environment
  // Handle validation errors
  if (err instanceof ValidationAppError) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
      error: {
        code: err.translationKey,
        errors: err.errors,
      }
    };
    
    if (isDevelopment) {
      response.stack = err.stack;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Handle other AppError instances
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
      error: {
        code: err.translationKey,
        details: err.translationParams,
      }
    };
    
    if (isDevelopment) {
      response.stack = err.stack;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Handle development vs production errors
  if (isDevelopment) {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
  
  // Create a safe error object with proper type checking
  let errorMessage = 'An unknown error occurred';
  let errorStack: string | undefined;

  if (err && typeof err === 'object') {
    // Safely extract message
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string') {
      errorMessage = message;
    }

    // Safely extract stack trace
    const stack = (err as { stack?: unknown }).stack;
    if (typeof stack === 'string') {
      errorStack = stack;
    }
  }
  
  // Prepare the error response
  const response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error',
    error: {
      code: 'internal_server_error',
      details: { message: errorMessage }
    }
  };
  
  // Only include stack trace in development
  if (isDevelopment && errorStack) {
    response.stack = errorStack;
  }
  
  return res.status(500).json(response);
};

const sendErrorDev = (err: AppError, _req: Request, res: Response) => {
  const response: ErrorResponse = {
    status: err.status,
    message: err.message,
    error: {
      code: err.translationKey,
      details: err.translationParams || {},
    },
    stack: err.stack,
    translationKey: err.translationKey,
    translationParams: err.translationParams,
  };
  
  res.status(err.statusCode).json(response);
};

const sendErrorProd = (err: AppError, _req: Request, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ErrorResponse = {
      status: err.status,
      message: err.message,
      error: {
        code: err.translationKey,
        details: err.translationParams,
      },
      translationKey: err.translationKey,
      translationParams: err.translationParams,
    };
    
    res.status(err.statusCode).json(response);
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    const response: ErrorResponse = {
      status: 'error',
      message: 'Something went very wrong!',
      error: {
        code: 'internal_server_error',
        details: {},
      },
    };
    
    res.status(500).json(response);
  }
};
