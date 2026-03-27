import { GameState as PrismaGameState } from '@prisma/client';

declare global {
  // Extend the Prisma client to include our custom methods
  namespace PrismaClient {
    interface Prisma {
      gameState: {
        findFirst: () => Promise<PrismaGameState | null>;
        create: (args: { data: Omit<PrismaGameState, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } }) => Promise<PrismaGameState>;
        update: (args: { where: { id: string }; data: Partial<Omit<PrismaGameState, 'id' | 'createdAt'>> }) => Promise<PrismaGameState>;
      };
    }
  }
}
