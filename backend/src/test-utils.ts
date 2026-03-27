import { PrismaClient, Player } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Types based on Prisma schema
interface TestPlayer extends Omit<Player, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

/**
 * Clears all data from the test database (SQLite version)
 */
export const clearDatabase = async (prisma: PrismaClient) => {
  try {
    // Disable FK checks to allow clearing tables in any order
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');

    // Get all tables
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_migrations';
    `;

    // Clear all tables
    for (const { name } of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
      } catch (e) {
        console.error(`Failed to clear table ${name}`, e);
      }
    }

    // Reset autoincrement counters (optional but good for consistency)
    for (const { name } of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='${name}';`);
      } catch (e) {
        // Ignore if valid
      }
    }

    // Re-enable FK checks
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  } catch (error) {
    console.error('Error clearing test database:', error);
    // Don't throw, just log to prevent test suite crash on cleanup
  }
};

/**
 * Creates a test user and returns the user data and auth token
 */
interface TestUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestUtils {
  user: TestUser;
  token: string;
  cleanup?: () => Promise<void>;
}

export const createTestUser = async (_prisma: PrismaClient): Promise<TestUtils> => {
  // Return a mock user for testing
  const user: TestUser = {
    id: faker.number.int({ min: 1, max: 1000 }),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // In a real app, you would generate a proper JWT token here
  const token = 'test-token';

  return { user, token };
};

/**
 * Creates test players for database seeding
 */
interface TestPlayer extends Omit<Player, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

export const createTestPlayers = async (prisma: PrismaClient, count = 10, clubId?: number): Promise<TestPlayer[]> => {
  const positions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LWB', 'RWB', 'LB', 'RB', 'CB', 'GK'];
  const nationalities = ['Brazil', 'Argentina', 'France', 'Spain', 'Germany', 'England', 'Italy', 'Netherlands', 'Portugal', 'Belgium'];

  const now = new Date();
  const players: TestPlayer[] = [];

  for (let i = 0; i < count; i++) {
    const skill = Math.floor(Math.random() * 30) + 50; // 50-80
    const potential = Math.min(99, skill + Math.floor(Math.random() * 20) + 5); // 5-25 points higher than skill, max 99
    const contractStart = new Date(now);
    const contractExpiry = new Date(now);
    contractExpiry.setFullYear(contractExpiry.getFullYear() + Math.floor(Math.random() * 3) + 2); // 2-5 year contract

    // Create player in database
    const player = await prisma.player.create({
      data: {
        firstName: `Player`,
        lastName: `${i + 1}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        dateOfBirth: new Date(now.getFullYear() - (Math.floor(Math.random() * 15) + 18), 0, 1),
        currentAbility: skill,
        potentialAbility: potential,

        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        weeklyWage: Math.floor(Math.random() * 50000) + 5000,
        contractStart: contractStart,
        contractEnd: contractExpiry,

        morale: Math.floor(Math.random() * 40) + 60,
        isInjured: Math.random() > 0.9,

        preferredPositions: "[]",
        preferredFoot: "RIGHT",

        ...(clubId && { currentClubId: clubId })
      }
    });

    // Cast to TestPlayer or similar if needed
    players.push(player);
  }

  return players;
};

