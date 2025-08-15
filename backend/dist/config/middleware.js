"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("../middleware/errorHandler");
const security_1 = require("../middleware/security");
const configureMiddleware = (app) => {
    // Security headers
    app.use(security_1.securityHeaders);
    // CORS configuration
    app.use(security_1.configureCors);
    // CSRF protection
    app.use(security_1.csrfProtection);
    // Request logging
    if (process.env.NODE_ENV === 'development') {
        app.use((0, morgan_1.default)('dev'));
    }
    // Body parsing
    app.use(express_1.default.json({ limit: '10kb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
    // Compression
    app.use((0, compression_1.default)());
    // Static files
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
    // Error handling (must be last)
    app.use(errorHandler_1.errorHandler);
};
exports.configureMiddleware = configureMiddleware;
