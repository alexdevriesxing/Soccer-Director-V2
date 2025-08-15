"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Type-safe async handler for Express routes
 * @param fn The async route handler function
 * @returns A new route handler that catches and passes errors to Express's next function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            const appError = (0, errorHandler_1.createAppError)(error);
            // Set appropriate translation key based on the error
            if (!appError.translationKey) {
                // Default to a generic error if no specific translation key is set
                appError.translationKey = 'errors.generic';
            }
            next(appError);
        });
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Creates a new AppError with the given message, status code, and translation key
 * @param message Error message
 * @param statusCode HTTP status code
 * @param translationKey Translation key for i18n
 * @param translationParams Optional parameters for the translation
 * @returns A new AppError instance
 */
const createError = (message, statusCode, translationKey, translationParams) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.translationKey = translationKey;
    if (translationParams) {
        error.translationParams = translationParams;
    }
    return error;
};
exports.createError = createError;
