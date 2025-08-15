import { PrismaClient } from '@prisma/client';

export function createTacticalFamiliarityService(prisma: PrismaClient) {
  return {
    async getTacticalFamiliarity(clubId: number, tactic: string) {
      return prisma.tacticalFamiliarity.findFirst({ where: { clubId, tactic } });
    },
    async setTacticalFamiliarity(clubId: number, tactic: string, familiarity: number, notes?: string) {
      const existing = await prisma.tacticalFamiliarity.findFirst({ where: { clubId, tactic } });
      if (existing) {
        return prisma.tacticalFamiliarity.update({ where: { id: existing.id }, data: { familiarity, notes } });
      } else {
        return prisma.tacticalFamiliarity.create({ data: { clubId, tactic, familiarity, notes } });
      }
    },
    async calculateTacticalFamiliarity(clubId: number, tactic: string, context: { trainingSessions: any[], matches: any[] }) {
      // Example: +3 per training session, +5 per match played with tactic
      let familiarity = 50;
      if (context.trainingSessions) familiarity += context.trainingSessions.length * 3;
      if (context.matches) familiarity += context.matches.length * 5;
      if (familiarity > 100) familiarity = 100;
      if (familiarity < 0) familiarity = 0;
      await this.setTacticalFamiliarity(clubId, tactic, familiarity);
      return familiarity;
    },
  };
}

import { PrismaClient as RealPrismaClient } from '@prisma/client';
export const TacticalFamiliarityService = createTacticalFamiliarityService(new RealPrismaClient()); 