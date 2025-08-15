"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Test route for 400 Bad Request error
router.get('/bad-request', (req, res, next) => {
    const error = new errorHandler_1.AppError('This is a bad request', 400, 'error.bad_request');
    next(error);
});
// Test route for 401 Unauthorized error
router.get('/unauthorized', (req, res, next) => {
    const error = new errorHandler_1.AppError('You are not authorized', 401, 'error.unauthorized');
    next(error);
});
// Test route for 404 Not Found error
router.get('/not-found', (req, res, next) => {
    const error = new errorHandler_1.AppError('Resource not found', 404, 'error.not_found');
    next(error);
});
// Test route for 500 Internal Server Error
router.get('/server-error', (req, res, next) => {
    const error = new Error('This is a server error');
    error.statusCode = 500;
    next(error);
});
// Test route for Prisma error (e.g., record not found)
router.get('/prisma-error', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // This will throw a Prisma error since we're not actually querying the database
        throw new client_1.Prisma.PrismaClientKnownRequestError('Record not found', {
            code: 'P2025',
            clientVersion: '4.0.0',
            meta: {}
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
