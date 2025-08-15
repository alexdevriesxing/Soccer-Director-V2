import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Test route for 400 Bad Request error
router.get('/bad-request', (req, res, next) => {
  const error = new AppError('This is a bad request', 400, 'error.bad_request');
  next(error);
});

// Test route for 401 Unauthorized error
router.get('/unauthorized', (req, res, next) => {
  const error = new AppError('You are not authorized', 401, 'error.unauthorized');
  next(error);
});

// Test route for 404 Not Found error
router.get('/not-found', (req, res, next) => {
  const error = new AppError('Resource not found', 404, 'error.not_found');
  next(error);
});

// Test route for 500 Internal Server Error
router.get('/server-error', (req, res, next) => {
  const error = new Error('This is a server error');
  (error as any).statusCode = 500;
  next(error);
});

// Test route for Prisma error (e.g., record not found)
router.get('/prisma-error', async (req, res, next) => {
  try {
    // This will throw a Prisma error since we're not actually querying the database
    throw new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '4.0.0',
      meta: {}
    });
  } catch (error) {
    next(error);
  }
});

export default router;
