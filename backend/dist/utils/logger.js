"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpStream = void 0;
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const node_process_1 = __importDefault(require("node:process"));
const { combine, timestamp, printf, colorize, json } = winston_1.format;
// Custom log format
const logFormat = printf((_a) => {
    var { level, message, timestamp } = _a, meta = __rest(_a, ["level", "message", "timestamp"]);
    return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
});
// Log directory
const logDir = path_1.default.join(node_process_1.default.cwd(), 'logs');
// Create logger instance
const logger = (0, winston_1.createLogger)({
    level: node_process_1.default.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json(), logFormat),
    defaultMeta: { service: 'football-director' },
    transports: [
        // Console transport
        new winston_1.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
        }),
        // Daily rotate file transport for errors
        new winston_daily_rotate_file_1.default({
            level: 'error',
            filename: path_1.default.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
        // Daily rotate file transport for all logs
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
    exceptionHandlers: [
        new winston_1.transports.File({ filename: path_1.default.join(logDir, 'exceptions.log') }),
    ],
    exitOnError: false,
});
// Handle unhandled promise rejections
node_process_1.default.on('unhandledRejection', (reason) => {
    throw reason;
});
exports.default = logger;
exports.httpStream = {
    write(message) {
        logger.info(message.trim());
    },
};
