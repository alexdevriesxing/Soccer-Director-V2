import { PrismaClient } from '@prisma/client';

export function createSquadChemistryService(prisma: PrismaClient) {
  return {
    async getSquadChemistry(clubId: number) {
      return prisma.squadChemistry.findFirst({ where: { clubId } });
    },
    async setSquadChemistry(clubId: number, score: number, notes?: string) {
      const existing = await prisma.squadChemistry.findFirst({ where: { clubId } });
      if (existing) {
        return prisma.squadChemistry.update({ where: { id: existing.id }, data: { score, notes } });
      } else {
        return prisma.squadChemistry.create({ data: { clubId, score, notes } });
      }
    },
    async calculateSquadChemistry(clubId: number, context: { recentResults: any[], transfers: any[], injuries: any[] }) {
      // Example: +5 per win, -7 per loss, -3 per injury, -10 for major transfer out
      let score = 50;
      if (context.recentResults) {
        for (const r of context.recentResults) {
          if (r.result === 'win') score += 5;
          if (r.result === 'loss') score -= 7;
        }
      }
      if (context.transfers) {
        for (const t of context.transfers) {
          if (t.type === 'out' && t.important) score -= 10;
        }
      }
      if (context.injuries) {
        score -= context.injuries.length * 3;
      }
      if (score > 100) score = 100;
      if (score < 0) score = 0;
      await this.setSquadChemistry(clubId, score);
      return score;
    },
  };
}

import { PrismaClient as RealPrismaClient } from '@prisma/client';
export const SquadChemistryService = createSquadChemistryService(new RealPrismaClient()); 