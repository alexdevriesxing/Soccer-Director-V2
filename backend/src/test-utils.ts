import { PrismaClient, Player, PlayerTrait, Personality } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Types based on Prisma schema
interface TestPlayer extends Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'club'> {
  id?: number;
  playerTraits?: PlayerTrait[];
  clubId: number | null;  // Make required to match Prisma model
}

/**
 * Clears all data from the test database (SQLite version)
 */
export const clearDatabase = async (prisma: PrismaClient) => {
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%' 
    AND name NOT LIKE '_prisma_migrations'
  `;

  try {
    await prisma.$transaction([
      // Disable foreign key checks
      prisma.$executeRaw`PRAGMA foreign_keys = OFF`,
      // Delete all data from each table
      ...tables.map(({ name }) => 
        prisma.$executeRawUnsafe(`DELETE FROM "${name}"`)
      ),
      // Re-enable foreign key checks
      prisma.$executeRaw`PRAGMA foreign_keys = ON`
    ]);
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
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

export const createTestUser = async (_prisma: PrismaClient): Promise<{ user: TestUser; token: string }> => {
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
  playerTraits?: PlayerTrait[];
}

export const createTestPlayers = async (prisma: PrismaClient, count = 10, clubId?: number): Promise<TestPlayer[]> => {
  const positions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LWB', 'RWB', 'LB', 'RB', 'CB', 'GK'];
  const nationalities = ['Brazil', 'Argentina', 'France', 'Spain', 'Germany', 'England', 'Italy', 'Netherlands', 'Portugal', 'Belgium'];
  const personalities = [
    Personality.LAZY,
    Personality.BELOW_AVERAGE,
    Personality.PROFESSIONAL,
    Personality.DRIVEN,
    Personality.NATURAL
  ];
  
  const now = new Date();
  const players: TestPlayer[] = [];
  
  for (let i = 0; i < count; i++) {
    const skill = Math.floor(Math.random() * 30) + 50; // 50-80
    const potential = Math.min(99, skill + Math.floor(Math.random() * 20) + 5); // 5-25 points higher than skill, max 99
    const currentPotential = potential - Math.floor(Math.random() * 5); // Slightly lower than max potential
    const contractStart = new Date(now);
    const contractExpiry = new Date(now);
    contractExpiry.setFullYear(contractExpiry.getFullYear() + Math.floor(Math.random() * 3) + 2); // 2-5 year contract
    
    const playerData = {
      name: `Player ${i + 1}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      age: Math.floor(Math.random() * 15) + 18, // 18-33
      skill: skill,
      talent: Math.floor(Math.random() * 100),
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      wage: Math.floor(Math.random() * 50000) + 5000, // 5K-55K
      contractStart: contractStart,
      contractExpiry: contractExpiry,
      potential: potential,
      currentPotential: currentPotential,
      morale: Math.floor(Math.random() * 40) + 60, // 60-100
      injured: Math.random() > 0.9, // 10% chance of being injured
      internationalCaps: Math.floor(Math.random() * 50),
      improvementRate: 0.02 + (Math.random() * 0.03), // 2-5%
      ambition: Math.floor(Math.random() * 5) + 1, // 1-5
      reputation: Math.floor(Math.random() * 100),
      ...(clubId && { clubId: clubId })
    };
    
    // Create player traits
    const traits = [
      { name: `Trait ${i + 1}-1`, description: 'Test trait 1' },
      { name: `Trait ${i + 1}-2`, description: 'Test trait 2' },
    ];
    
    // Create the player with traits in a transaction
    const [player] = await prisma.$transaction([
      prisma.player.create({
        data: {
          ...playerData,
          playerTraits: {
            create: traits.map(trait => ({
              name: trait.name,
              description: trait.description,
              isPositive: Math.random() > 0.5,
            })),
          },
        },
        include: {
          playerTraits: true,
        },
      })
    ]);
    
    players.push(player);
  }
  
  return players;
};
