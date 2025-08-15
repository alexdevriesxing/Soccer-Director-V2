"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupLimiter = exports.passwordResetLimiter = exports.publicLimiter = exports.strictLimiter = exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./errorHandler");
const createRateLimiter = (minutes, maxRequests) => {
    return (0, express_rate_limit_1.default)({
        windowMs: minutes * 60 * 1000, // Convert minutes to milliseconds
        max: maxRequests,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: `Too many requests from this IP, please try again after ${minutes} minutes`,
        handler: (req, res, next) => {
            next(new errorHandler_1.AppError(`Too many requests from this IP, please try again in ${minutes} minutes`, 429));
        },
    });
};
// Apply different rate limits for different routes
exports.authLimiter = createRateLimiter(15, 100); // 100 requests per 15 minutes
exports.apiLimiter = createRateLimiter(60, 1000); // 1000 requests per hour
exports.strictLimiter = createRateLimiter(15, 50); // 50 requests per 15 minutes
exports.publicLimiter = createRateLimiter(60, 100); // 100 requests per minute
// Special rate limiters for sensitive endpoints
exports.passwordResetLimiter = createRateLimiter(60, 5); // 5 requests per hour
exports.signupLimiter = createRateLimiter(60, 10); // 10 requests per hour
exports.default = {
    authLimiter: exports.authLimiter,
    apiLimiter: exports.apiLimiter,
    strictLimiter: exports.strictLimiter,
    publicLimiter: exports.publicLimiter,
    passwordResetLimiter: exports.passwordResetLimiter,
    signupLimiter: exports.signupLimiter,
};
