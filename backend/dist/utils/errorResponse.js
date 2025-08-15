"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = errorResponse;
/**
 * Sends a standardized error response. In development, includes the error message; in production, only a generic message.
 * Always logs the error (with stack if available) on the server.
 */
function errorResponse(res, error, genericMessage, status = 500) {
    // Always log the error details
    if (error instanceof Error) {
        // log stack trace if available
        console.error(genericMessage + ':', error.stack || error.message);
    }
    else {
        console.error(genericMessage + ':', error);
    }
    const isDev = process.env.NODE_ENV === 'development';
    const errorMsg = isDev && error && error.message ? error.message : genericMessage;
    // Optionally include stack in dev
    const details = isDev && error && error.stack ? error.stack : undefined;
    return res.status(status).json(details
        ? { error: errorMsg, details }
        : { error: errorMsg });
}
