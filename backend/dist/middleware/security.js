"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = exports.validateRequest = exports.configureCors = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./errorHandler");
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Set security headers using Helmet
    (0, helmet_1.default)({
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
exports.securityHeaders = securityHeaders;
// CORS configuration
const configureCors = (req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://your-production-domain.com',
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
};
exports.configureCors = configureCors;
// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return next(new errorHandler_1.AppError('Validation failed', 400, errors));
        }
        next();
    };
};
exports.validateRequest = validateRequest;
// CSRF protection (to be used with a CSRF token in forms)
const csrfProtection = (req, res, next) => {
    var _a;
    // Skip CSRF check for API requests
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // Verify CSRF token for non-GET requests
    if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.method !== 'HEAD') {
        const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
        if (!csrfToken || csrfToken !== ((_a = req.session) === null || _a === void 0 ? void 0 : _a.csrfToken)) {
            return next(new errorHandler_1.AppError('Invalid CSRF token', 403));
        }
    }
    // Generate new CSRF token for the next request
    if (req.session) {
        req.session.csrfToken = require('crypto').randomBytes(64).toString('hex');
        res.locals.csrfToken = req.session.csrfToken;
    }
    next();
};
exports.csrfProtection = csrfProtection;
