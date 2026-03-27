import { PrismaClient } from '@prisma/client';
import { clearDatabase } from '../test-utils';

// Global test setup
const prisma = new PrismaClient();

// @ts-ignore: jest globals
const beforeAllMock = beforeAll;
// @ts-ignore: jest globals
const afterAllMock = afterAll;

beforeAllMock(async () => {
  // Connect to the test database
  await prisma.$connect();

  // Clear the test database before all tests
  await clearDatabase(prisma);
});

afterAllMock(async () => {
  // Disconnect from the test database after all tests
  await prisma.$disconnect();
});

// Global test utilities
// Use simple assignment for now or let Jest handle it
// (global as any).prisma = prisma;
// (global as any).beforeAll = global.beforeAll;
// (global as any).afterAll = global.afterAll;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

// Ensure prisma is available globally for tests
(global as any).prisma = prisma;
