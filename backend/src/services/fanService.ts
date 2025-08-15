import { PrismaClient } from '@prisma/client';

export function createFanService(prisma: PrismaClient) {
  return {
    // FanGroup CRUD
    async getFanGroups(clubId: number) {
      return prisma.fanGroup.findMany({ where: { clubId } });
    },
    async createFanGroup(data: any) {
      return prisma.fanGroup.create({ data });
    },
    async updateFanGroup(id: number, data: any) {
      return prisma.fanGroup.update({ where: { id }, data });
    },
    async deleteFanGroup(id: number) {
      return prisma.fanGroup.delete({ where: { id } });
    },
    // FanEvent CRUD
    async getFanEvents(fanGroupId: number) {
      return prisma.fanEvent.findMany({ where: { fanGroupId } });
    },
    async createFanEvent(data: any) {
      return prisma.fanEvent.create({ data });
    },
    async updateFanEvent(id: number, data: any) {
      return prisma.fanEvent.update({ where: { id }, data });
    },
    async deleteFanEvent(id: number) {
      return prisma.fanEvent.delete({ where: { id } });
    },
    // FanSentiment CRUD
    async getFanSentiments(fanGroupId: number) {
      return prisma.fanSentiment.findMany({ where: { fanGroupId } });
    },
    async createFanSentiment(data: any) {
      return prisma.fanSentiment.create({ data });
    },
    async updateFanSentiment(id: number, data: any) {
      return prisma.fanSentiment.update({ where: { id }, data });
    },
    async deleteFanSentiment(id: number) {
      return prisma.fanSentiment.delete({ where: { id } });
    },
    // Business logic: trigger a fan event (utility)
    async triggerFanEvent(fanGroupId: number, type: string, description: string, date: Date) {
      const event = await prisma.fanEvent.create({
        data: { fanGroupId, type, description, date }
      });
      return event;
    },
    // --- Advanced business logic ---
    async calculateFanSentiment(fanGroupId: number, context: { matchResults: any[], transfers: any[], boardDecisions: any[] }) {
      // Calculate sentiment: +10 per win, -15 per loss, +5 for big signing, -10 for star sold, -20 for unpopular board decision
      let sentiment = 50;
      if (context.matchResults) {
        for (const r of context.matchResults) {
          if (r.result === 'win') sentiment += 10;
          if (r.result === 'loss') sentiment -= 15;
        }
      }
      if (context.transfers) {
        for (const t of context.transfers) {
          if (t.type === 'in' && t.star) sentiment += 5;
          if (t.type === 'out' && t.star) sentiment -= 10;
        }
      }
      if (context.boardDecisions) {
        for (const d of context.boardDecisions) {
          if (d.unpopular) sentiment -= 20;
        }
      }
      if (sentiment > 100) sentiment = 100;
      if (sentiment < -100) sentiment = -100;
      return sentiment;
    },
    async triggerFanEventIfNeeded(fanGroupId: number, context: { sentiment: number, recentEvents: any[] }) {
      // Example: trigger protest if sentiment < -50, celebration if > 80
      if (context.sentiment < -50) {
        return this.triggerFanEvent(fanGroupId, 'protest', 'Fan protest due to poor results', new Date());
      }
      if (context.sentiment > 80) {
        return this.triggerFanEvent(fanGroupId, 'celebration', 'Fan celebration for great results', new Date());
      }
      return null;
    },
    async updateFanGroupSize(fanGroupId: number, context: { clubPerformance: number, engagement: number }) {
      // Grow group if performance/engagement high, shrink if low
      const group = await prisma.fanGroup.findUnique({ where: { id: fanGroupId } });
      if (!group) return false;
      let newSize = group.size;
      if (context.clubPerformance > 70 && context.engagement > 50) newSize += 20;
      if (context.clubPerformance < 40 || context.engagement < 20) newSize -= 15;
      if (newSize < 10) newSize = 10;
      await prisma.fanGroup.update({ where: { id: fanGroupId }, data: { size: newSize } });
      return true;
    },
    async applyFanPressure(clubId: number, context: { sentiment: number }) {
      // If sentiment < -50, reduce board satisfaction or club finances
      if (context.sentiment < -50) {
        // Example: call BoardroomService to reduce satisfaction (integration point)
        // Or update club finances (not implemented here)
        // (Stub: no-op)
        return 'Fan pressure applied';
      }
      return 'No action';
    },
  };
}

// Default instance for production
import { PrismaClient as RealPrismaClient } from '@prisma/client';
export const FanService = createFanService(new RealPrismaClient()); 