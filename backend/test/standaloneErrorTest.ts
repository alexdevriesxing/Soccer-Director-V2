import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../src/middleware/errorHandler';

// Mock Express request/response objects
const createMockRequest = (headers = {}) => ({
  headers: {
    'accept-language': 'en-US,en;q=0.9',
    ...headers
  }
});

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const nextFunction: NextFunction = jest.fn();

// Test cases
const testCases = [
  {
    name: 'AppError with translation key',
    error: new AppError('Test error', 400, 'test.error'),
    expectedStatus: 400,
    expectedResponse: {
      status: 'fail',
      message: 'Test error',
      translationKey: 'test.error'
    }
  },
  {
    name: 'Prisma not found error',
    error: (() => {
      const err = new Error('Record to update not found');
      err.name = 'PrismaClientKnownRequestError';
      (err as any).code = 'P2025';
      return err;
    })(),
    expectedStatus: 404,
    expectedResponse: {
      status: 'fail',
      message: 'Record not found',
      translationKey: 'errors.not_found'
    }
  },
  {
    name: 'JWT error',
    error: (() => {
      const err = new Error('Invalid token');
      err.name = 'JsonWebTokenError';
      return err;
    })(),
    expectedStatus: 401,
    expectedResponse: {
      status: 'fail',
      message: 'Invalid token. Please log in again!',
      translationKey: 'errors.invalid_token'
    }
  },
  {
    name: 'Generic error in production',
    error: new Error('Unexpected error'),
    env: { NODE_ENV: 'production' },
    expectedStatus: 500,
    expectedResponse: {
      status: 'error',
      message: 'Something went wrong!',
      translationKey: 'errors.generic'
    }
  }
];

// Run tests
console.log('Running error handler tests...');
console.log('---------------------------');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  // Set environment if specified
  const originalEnv = { ...process.env };
  if (testCase.env) {
    Object.entries(testCase.env).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  // Create mocks
  const req = createMockRequest() as Request;
  const res = createMockResponse();
  
  // Run the error handler
  errorHandler(testCase.error, req, res, nextFunction);
  
  // Check the status code
  const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
  const jsonCall = (res.json as jest.Mock).mock.calls[0]?.[0];
  
  // Check if the test passed
  const statusPassed = statusCall === testCase.expectedStatus;
  const responsePassed = Object.entries(testCase.expectedResponse).every(
    ([key, value]) => jsonCall?.[key] === value
  );
  
  // Log result
  const testNumber = index + 1;
  if (statusPassed && responsePassed) {
    console.log(`✅ Test ${testNumber}: ${testCase.name} - PASSED`);
    passed++;
  } else {
    console.error(`❌ Test ${testNumber}: ${testCase.name} - FAILED`);
    if (!statusPassed) {
      console.error(`   Expected status: ${testCase.expectedStatus}, got: ${statusCall}`);
    }
    if (!responsePassed) {
      console.error('   Response mismatch:');
      console.error('   Expected:', testCase.expectedResponse);
      console.error('   Got:', jsonCall);
    }
    failed++;
  }
  
  // Restore environment
  process.env = { ...originalEnv };
});

// Print summary
console.log('\nTest Summary:');
console.log(`Total: ${testCases.length}, Passed: ${passed}, Failed: ${failed}`);

// Exit with appropriate code
if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
}
