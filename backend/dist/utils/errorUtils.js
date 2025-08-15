"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenError = exports.unauthorizedError = exports.validationError = exports.notFoundError = exports.handlePrismaError = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Handles Prisma errors and converts them to AppError instances
 * @param error The error to handle
 * @returns An AppError instance with appropriate status code and translation key
 */
const handlePrismaError = (error) => {
    const prismaError = error;
    if (prismaError instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        switch (prismaError.code) {
            case 'P2002':
                {
                    const meta = prismaError.meta;
                    const target = meta === null || meta === void 0 ? void 0 : meta.target;
                    const fields = Array.isArray(target)
                        ? target.join(', ')
                        : (typeof target === 'string' ? target : '');
                    return new errorHandler_1.AppError('A unique constraint was violated', 409, 'errors.unique_constraint_violation', { fields });
                }
            case 'P2025':
                return new errorHandler_1.AppError('The requested record was not found', 404, 'errors.record_not_found');
            default:
                return new errorHandler_1.AppError(`Database error: ${prismaError.message}`, 500, 'errors.database_error');
        }
    }
    else if (prismaError instanceof client_1.Prisma.PrismaClientValidationError) {
        return new errorHandler_1.AppError('Invalid input data', 400, 'errors.invalid_input_data');
    }
    // For other types of errors, create a generic error
    return new errorHandler_1.AppError(error instanceof Error ? error.message : 'An unknown error occurred', 500, 'errors.generic');
};
exports.handlePrismaError = handlePrismaError;
/**
 * Creates a not found error
 * @param entity The entity that was not found
 * @param id The ID of the entity
 * @returns An AppError instance with a 404 status code
 */
const notFoundError = (entity, id) => {
    return new errorHandler_1.AppError(`${entity} with ID ${id} not found`, 404, 'errors.not_found', { entity, id: String(id) });
};
exports.notFoundError = notFoundError;
/**
 * Creates a validation error
 * @param message The error message
 * @param fields Optional fields that failed validation
 * @returns An AppError instance with a 400 status code
 */
const validationError = (message, fields) => {
    return new errorHandler_1.AppError(message, 400, 'errors.validation_error', { fields: fields || {} });
};
exports.validationError = validationError;
/**
 * Creates an unauthorized error
 * @param message Optional custom message
 * @returns An AppError instance with a 401 status code
 */
const unauthorizedError = (message = 'Unauthorized') => {
    return new errorHandler_1.AppError(message, 401, 'errors.unauthorized');
};
exports.unauthorizedError = unauthorizedError;
/**
 * Creates a forbidden error
 * @param message Optional custom message
 * @returns An AppError instance with a 403 status code
 */
const forbiddenError = (message = 'Forbidden') => {
    return new errorHandler_1.AppError(message, 403, 'errors.forbidden');
};
exports.forbiddenError = forbiddenError;
