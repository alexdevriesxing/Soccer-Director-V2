import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { AppError, ValidationErrorItem } from './errorHandler';

type ValidationSchema = ValidationChain[];

// Common validation rules
export const validate = (validations: ValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => {
      const errorObj: ValidationErrorItem = {
        field: 'param' in err ? String(err.param) : undefined,
        message: err.msg,
        value: 'value' in err ? err.value : undefined,
      };
      return errorObj;
    });

    next(new AppError(
      'Validation failed',
      400,
      'validation_error',
      { errors: errorMessages }
    ));
  };
};

// Player validation schemas
export const createPlayerSchema: ValidationSchema = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .trim()
    .notEmpty().withMessage('Position is required')
    .isIn(['GK', 'DEF', 'MID', 'FWD']).withMessage('Invalid position'),
  
  body('skill')
    .isInt({ min: 0, max: 100 }).withMessage('Skill must be between 0 and 100'),
  
  body('age')
    .isInt({ min: 16, max: 45 }).withMessage('Age must be between 16 and 45'),
  
  body('nationality')
    .trim()
    .notEmpty().withMessage('Nationality is required'),
  
  body('potential')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Potential must be between 0 and 100'),
  
  body('value')
    .optional()
    .isInt({ min: 0 }).withMessage('Value must be a positive number'),
  
  body('wage')
    .optional()
    .isInt({ min: 0 }).withMessage('Wage must be a positive number'),
  
  body('contractExpiry')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DD)'),
  
  body('clubId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid club ID')
    .toInt(),
  
  body('traits')
    .optional()
    .isArray().withMessage('Traits must be an array')
    .custom((traits: string[]) => {
      if (!Array.isArray(traits)) return false;
      return traits.every(trait => typeof trait === 'string');
    }).withMessage('Each trait must be a string')
];

export const updatePlayerSchema: ValidationSchema = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
    .toInt(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .optional()
    .isIn(['GK', 'DEF', 'MID', 'FWD']).withMessage('Invalid position'),
  
  body('skill')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Skill must be between 0 and 100'),
  
  body('age')
    .optional()
    .isInt({ min: 16, max: 45 }).withMessage('Age must be between 16 and 45'),
  
  body('traits')
    .optional()
    .isArray().withMessage('Traits must be an array')
];

export const playerIdParamSchema: ValidationSchema = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
    .toInt()
];

export const playerListQuerySchema: ValidationSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt()
];

export const playerSearchQuerySchema: ValidationSchema = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
];
