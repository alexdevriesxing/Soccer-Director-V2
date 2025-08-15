import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../src/middleware/errorHandler';

// Simple mock objects
class MockResponse {
  statusCode: number = 200;
  status(code: number) {
    this.statusCode = code;
    return this;
  }
  responseData: any;
  json(data: any) {
    this.responseData = data;
    console.log('Response:', {
      status: this.statusCode,
      ...data
    });
    return this;
  }
}

// Test cases
const testCases = [
  {
    name: 'AppError with translation key',
    error: new AppError('Test error', 400, 'test.error'),
    expectedStatus: 400,
    expectedMessage: 'Test error',
    expectedTranslationKey: 'test.error'
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
    expectedMessage: 'Record not found',
    expectedTranslationKey: 'errors.not_found'
  },
  {
    name: 'JWT error',
    error: (() => {
      const err = new Error('Invalid token');
      err.name = 'JsonWebTokenError';
      return err;
    })(),
    expectedStatus: 401,
    expectedMessage: 'Invalid token. Please log in again!',
    expectedTranslationKey: 'errors.invalid_token'
  },
  {
    name: 'Generic error in production',
    error: new Error('Unexpected error'),
    env: { NODE_ENV: 'production' },
    expectedStatus: 500,
    expectedMessage: 'Unexpected error',
    expectedTranslationKey: 'errors.generic'
  }
];

// Run tests
console.log('Running error handler tests...');
console.log('---------------------------');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\nTest: ${testCase.name}`);
  console.log('---');
  
  // Set environment if specified
  const originalEnv = { ...process.env };
  if (testCase.env) {
    Object.entries(testCase.env).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  // Create mocks
  const req = { headers: { 'accept-language': 'en-US,en;q=0.9' } } as Request;
  const res = new MockResponse() as unknown as Response & { responseData?: any };
  
  // Run the error handler
  errorHandler(testCase.error, req, res, (() => {}) as NextFunction);
  
  // Get the response data
  const responseData = (res as any).responseData || {};
  
  // Check results
  const statusMatch = (res as any).statusCode === testCase.expectedStatus;
  const messageMatch = testCase.expectedMessage ? 
    responseData.message === testCase.expectedMessage : true;
  const translationKeyMatch = testCase.expectedTranslationKey ? 
    responseData.translationKey === testCase.expectedTranslationKey : true;
  
  if (statusMatch && messageMatch && translationKeyMatch) {
    console.log('✅ PASSED');
    passed++;
  } else {
    console.log('❌ FAILED');
    if (!statusMatch) console.log(`  Expected status: ${testCase.expectedStatus}, got: ${(res as any).statusCode}`);
    if (!messageMatch) console.log(`  Expected message: ${testCase.expectedMessage}, got: ${(testCase.error as any).message}`);
    if (!translationKeyMatch) console.log(`  Expected translation key: ${testCase.expectedTranslationKey}, got: ${(testCase.error as any).translationKey}`);
    failed++;
  }
  
  // Restore environment
  process.env = { ...originalEnv };
}

// Print summary
console.log('\nTest Summary:');
console.log(`Total: ${testCases.length}, Passed: ${passed}, Failed: ${failed}`);

// Exit with appropriate code
if (failed > 0) {
  console.error('\n❌ Some tests failed');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
}
