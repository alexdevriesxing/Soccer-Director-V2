import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../src/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      headers: {
        'accept-language': 'en-US,en;q=0.9'
      }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should handle AppError with translation key', () => {
    const error = new AppError('Test error', 400, 'test.error');
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
      translationKey: 'test.error',
      ...(process.env.NODE_ENV === 'development' && { stack: expect.any(String), error: expect.any(Object) })
    });
  });

  it('should handle unknown errors in production', () => {
    // Set to production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Unexpected error');
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong!',
      translationKey: 'errors.generic',
      ...(process.env.ENABLE_TRANSLATION_DEBUG && { debug: expect.any(Object) })
    });
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle Prisma not found error', () => {
    const error = new Error('Record to update not found');
    error.name = 'PrismaClientKnownRequestError';
    (error as any).code = 'P2025';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Record not found',
      translationKey: 'errors.not_found',
      ...(process.env.NODE_ENV === 'development' && { stack: expect.any(String), error: expect.any(Object) })
    });
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid token. Please log in again!',
      translationKey: 'errors.invalid_token',
      ...(process.env.NODE_ENV === 'development' && { stack: expect.any(String), error: expect.any(Object) })
    });
  });
});
