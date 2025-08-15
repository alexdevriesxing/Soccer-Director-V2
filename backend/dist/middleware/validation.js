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
exports.playerSearchQuerySchema = exports.playerListQuerySchema = exports.playerIdParamSchema = exports.updatePlayerSchema = exports.createPlayerSchema = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
// Common validation rules
const validate = (validations) => {
    return (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorMessages = errors.array().map(err => {
            const errorObj = {
                field: 'param' in err ? String(err.param) : undefined,
                message: err.msg,
                value: 'value' in err ? err.value : undefined,
            };
            return errorObj;
        });
        next(new errorHandler_1.AppError('Validation failed', 400, 'validation_error', { errors: errorMessages }));
    });
};
exports.validate = validate;
// Player validation schemas
exports.createPlayerSchema = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('position')
        .trim()
        .notEmpty().withMessage('Position is required')
        .isIn(['GK', 'DEF', 'MID', 'FWD']).withMessage('Invalid position'),
    (0, express_validator_1.body)('skill')
        .isInt({ min: 0, max: 100 }).withMessage('Skill must be between 0 and 100'),
    (0, express_validator_1.body)('age')
        .isInt({ min: 16, max: 45 }).withMessage('Age must be between 16 and 45'),
    (0, express_validator_1.body)('nationality')
        .trim()
        .notEmpty().withMessage('Nationality is required'),
    (0, express_validator_1.body)('potential')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Potential must be between 0 and 100'),
    (0, express_validator_1.body)('value')
        .optional()
        .isInt({ min: 0 }).withMessage('Value must be a positive number'),
    (0, express_validator_1.body)('wage')
        .optional()
        .isInt({ min: 0 }).withMessage('Wage must be a positive number'),
    (0, express_validator_1.body)('contractExpiry')
        .optional()
        .isISO8601().withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DD)'),
    (0, express_validator_1.body)('clubId')
        .optional()
        .isInt({ min: 1 }).withMessage('Invalid club ID')
        .toInt(),
    (0, express_validator_1.body)('traits')
        .optional()
        .isArray().withMessage('Traits must be an array')
        .custom((traits) => {
        if (!Array.isArray(traits))
            return false;
        return traits.every(trait => typeof trait === 'string');
    }).withMessage('Each trait must be a string')
];
exports.updatePlayerSchema = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 }).withMessage('Invalid player ID')
        .toInt(),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('position')
        .optional()
        .isIn(['GK', 'DEF', 'MID', 'FWD']).withMessage('Invalid position'),
    (0, express_validator_1.body)('skill')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Skill must be between 0 and 100'),
    (0, express_validator_1.body)('age')
        .optional()
        .isInt({ min: 16, max: 45 }).withMessage('Age must be between 16 and 45'),
    (0, express_validator_1.body)('traits')
        .optional()
        .isArray().withMessage('Traits must be an array')
];
exports.playerIdParamSchema = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 }).withMessage('Invalid player ID')
        .toInt()
];
exports.playerListQuerySchema = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt()
];
exports.playerSearchQuerySchema = [
    (0, express_validator_1.query)('q')
        .trim()
        .notEmpty().withMessage('Search query is required')
        .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
];
