"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ValidationAppError = exports.createAppError = exports.handleJWTExpiredError = exports.handleJWTError = exports.handleValidationErrorDB = exports.handleDuplicateFieldsDB = exports.handleCastErrorDB = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, translationKey = 'errors.generic', translationParams) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.translationKey = translationKey;
        this.translationParams = translationParams;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'errors.invalidId', { field: err.path, value: err.value });
};
exports.handleCastErrorDB = handleCastErrorDB;
const handleDuplicateFieldsDB = (err) => {
    var _a, _b;
    const field = ((_b = (_a = err.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0]) || 'field';
    return new AppError(`Duplicate field value: ${field}. Please use another value!`, 400, 'errors.duplicateField', { field });
};
exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    return new AppError(`Invalid input data. ${errors.join('. ')}`, 400, 'errors.validation', { errors });
};
exports.handleValidationErrorDB = handleValidationErrorDB;
// Handle JWT errors
const handleJWTError = (_error) => {
    return new AppError('Invalid token. Please log in again!', 401, 'errors.invalid_token');
};
exports.handleJWTError = handleJWTError;
// Handle JWT expired error
const handleJWTExpiredError = (_error) => {
    return new AppError('Your token has expired! Please log in again.', 401, 'errors.token_expired');
};
exports.handleJWTExpiredError = handleJWTExpiredError;
const handlePrismaNotFoundError = (_error) => {
    return new AppError('Record not found', 404, 'errors.not_found');
};
// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
// Helper to create a safe AppError from any error
const createAppError = (error) => {
    // If it's already an AppError, return it as is
    if (error instanceof AppError) {
        return error;
    }
    // Handle Prisma not found error
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        if (prismaError.code === 'P2025') {
            return handlePrismaNotFoundError(prismaError);
        }
    }
    // Handle JWT errors
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
        return (0, exports.handleJWTError)(error);
    }
    // Handle JWT expired error
    if (error instanceof Error && error.name === 'TokenExpiredError') {
        return (0, exports.handleJWTExpiredError)(error);
    }
    // Handle native Error objects
    if (error instanceof Error) {
        return new AppError(error.message, 500, 'errors.generic', { originalError: error });
    }
    // Handle non-Error thrown values
    const errorMessage = typeof error === 'string' ? error : 'Something went wrong!';
    return new AppError(errorMessage, 500, 'errors.generic', { originalError: error });
};
exports.createAppError = createAppError;
// Extended AppError class for validation errors
class ValidationAppError extends AppError {
    constructor(errors) {
        super('Validation failed', 400, 'validation_error');
        this.errors = errors;
    }
}
exports.ValidationAppError = ValidationAppError;
const errorHandler = (error, req, res, _next) => {
    let err = (0, exports.createAppError)(error);
    // Handle different types of errors in production
    if (!isDevelopment) {
        if (err.name === 'CastError' && 'path' in err && 'value' in err) {
            err = (0, exports.handleCastErrorDB)(err);
        }
        else if ('code' in err && err.code === 11000) {
            err = (0, exports.handleDuplicateFieldsDB)(err);
        }
        else if (err.name === 'ValidationError' && 'errors' in err) {
            err = (0, exports.handleValidationErrorDB)(err);
        }
        else if (err.name === 'JsonWebTokenError') {
            err = (0, exports.handleJWTError)(err);
        }
        else if (err.name === 'TokenExpiredError') {
            err = (0, exports.handleJWTExpiredError)(err);
        }
    }
    // Send appropriate error response based on environment
    // Handle validation errors
    if (err instanceof ValidationAppError) {
        const response = {
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
        const response = {
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
    }
    else {
        sendErrorProd(err, req, res);
    }
    // Create a safe error object with proper type checking
    let errorMessage = 'An unknown error occurred';
    let errorStack;
    if (err && typeof err === 'object') {
        // Safely extract message
        const message = err.message;
        if (typeof message === 'string') {
            errorMessage = message;
        }
        // Safely extract stack trace
        const stack = err.stack;
        if (typeof stack === 'string') {
            errorStack = stack;
        }
    }
    // Prepare the error response
    const response = {
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
exports.errorHandler = errorHandler;
const sendErrorDev = (err, _req, res) => {
    const response = {
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
const sendErrorProd = (err, _req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        const response = {
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
    }
    else {
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        const response = {
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
