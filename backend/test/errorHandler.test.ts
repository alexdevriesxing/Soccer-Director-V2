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
    expect(mockResponse.json).toHaveBeenCalled();

    // The error handler now returns a different structure with error.code
    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.status).toBe('error');
    expect(jsonCall.message).toBe('Test error');
    expect(jsonCall.error.code).toBe('test.error');
  });

  it('should handle unknown errors in production', () => {
    // Set to production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Unexpected error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.status).toBe('error');

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle Prisma not found error', () => {
    const error = new Error('Record to update not found');
    error.name = 'PrismaClientKnownRequestError';
    (error as any).code = 'P2025';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalled();

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.status).toBe('error');
    expect(jsonCall.message).toBe('Record not found');
    expect(jsonCall.error.code).toBe('errors.not_found');
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalled();

    const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.status).toBe('error');
    expect(jsonCall.message).toBe('Invalid token. Please log in again!');
    expect(jsonCall.error.code).toBe('errors.invalid_token');
  });
});
