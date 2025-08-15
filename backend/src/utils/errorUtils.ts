import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
  };
}

/**
 * Handles Prisma errors and converts them to AppError instances
 * @param error The error to handle
 * @returns An AppError instance with appropriate status code and translation key
 */
export const handlePrismaError = (error: unknown): AppError => {
  const prismaError = error as PrismaError;
  
  if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (prismaError.code) {
      case 'P2002':
        {
          const meta = (prismaError as unknown as { meta?: { target?: unknown } }).meta;
          const target = meta?.target;
          const fields = Array.isArray(target)
            ? (target as string[]).join(', ')
            : (typeof target === 'string' ? target : '');
          return new AppError(
            'A unique constraint was violated',
            409,
            'errors.unique_constraint_violation',
            { fields }
          );
        }
      case 'P2025':
        return new AppError(
          'The requested record was not found',
          404,
          'errors.record_not_found'
        );
      default:
        return new AppError(
          `Database error: ${prismaError.message}`,
          500,
          'errors.database_error'
        );
    }
  } else if (prismaError instanceof Prisma.PrismaClientValidationError) {
    return new AppError(
      'Invalid input data',
      400,
      'errors.invalid_input_data'
    );
  }
  
  // For other types of errors, create a generic error
  return new AppError(
    error instanceof Error ? error.message : 'An unknown error occurred',
    500,
    'errors.generic'
  );
};

/**
 * Creates a not found error
 * @param entity The entity that was not found
 * @param id The ID of the entity
 * @returns An AppError instance with a 404 status code
 */
export const notFoundError = (entity: string, id: string | number): AppError => {
  return new AppError(
    `${entity} with ID ${id} not found`,
    404,
    'errors.not_found',
    { entity, id: String(id) }
  );
};

/**
 * Creates a validation error
 * @param message The error message
 * @param fields Optional fields that failed validation
 * @returns An AppError instance with a 400 status code
 */
export const validationError = (
  message: string, 
  fields?: Record<string, string | number | boolean>
): AppError => {
  return new AppError(
    message,
    400,
    'errors.validation_error',
    { fields: fields || {} }
  );
};

/**
 * Creates an unauthorized error
 * @param message Optional custom message
 * @returns An AppError instance with a 401 status code
 */
export const unauthorizedError = (message = 'Unauthorized'): AppError => {
  return new AppError(
    message,
    401,
    'errors.unauthorized'
  );
};

/**
 * Creates a forbidden error
 * @param message Optional custom message
 * @returns An AppError instance with a 403 status code
 */
export const forbiddenError = (message = 'Forbidden'): AppError => {
  return new AppError(
    message,
    403,
    'errors.forbidden'
  );
};
