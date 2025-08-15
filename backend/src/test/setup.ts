import { PrismaClient } from '@prisma/client';
import { clearDatabase } from '../test-utils';

// Global test setup
const prisma = new PrismaClient();

global.beforeAll(async () => {
  // Connect to the test database
  await prisma.$connect();
  
  // Clear the test database before all tests
  await clearDatabase(prisma);
});

global.afterAll(async () => {
  // Disconnect from the test database after all tests
  await prisma.$disconnect();
});

// Add global test utilities
global.prisma = prisma;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}
