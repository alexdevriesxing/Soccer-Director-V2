import { PrismaClient } from '@prisma/client';

export function createBoardroomService(prisma: PrismaClient) {
  return {
    // BoardMember CRUD
    async getBoardMembers(clubId: number) {
      return prisma.boardMember.findMany({ where: { clubId } });
    },
    async createBoardMember(data: any) {
      return prisma.boardMember.create({ data });
    },
    async updateBoardMember(id: number, data: any) {
      return prisma.boardMember.update({ where: { id }, data });
    },
    async deleteBoardMember(id: number) {
      return prisma.boardMember.delete({ where: { id } });
    },
    // BoardMeeting CRUD
    async getBoardMeetings(clubId: number) {
      return prisma.boardMeeting.findMany({ where: { clubId } });
    },
    async createBoardMeeting(data: any) {
      return prisma.boardMeeting.create({ data });
    },
    async updateBoardMeeting(id: number, data: any) {
      return prisma.boardMeeting.update({ where: { id }, data });
    },
    async deleteBoardMeeting(id: number) {
      return prisma.boardMeeting.delete({ where: { id } });
    },
    // BoardObjective CRUD
    async getBoardObjectives(boardMemberId: number) {
      return prisma.boardObjective.findMany({ where: { boardMemberId } });
    },
    async createBoardObjective(data: any) {
      return prisma.boardObjective.create({ data });
    },
    async updateBoardObjective(id: number, data: any) {
      return prisma.boardObjective.update({ where: { id }, data });
    },
    async deleteBoardObjective(id: number) {
      return prisma.boardObjective.delete({ where: { id } });
    },
    // BoardDecision CRUD
    async getBoardDecisions(boardMeetingId: number) {
      return prisma.boardDecision.findMany({ where: { boardMeetingId } });
    },
    async createBoardDecision(data: any) {
      return prisma.boardDecision.create({ data });
    },
    async updateBoardDecision(id: number, data: any) {
      return prisma.boardDecision.update({ where: { id }, data });
    },
    async deleteBoardDecision(id: number) {
      return prisma.boardDecision.delete({ where: { id } });
    },
    // Business logic: trigger a board meeting (utility)
    async triggerBoardMeeting(clubId: number, agenda: string, date: Date) {
      const meeting = await prisma.boardMeeting.create({
        data: { clubId, agenda, date }
      });
      return meeting;
    },
    // --- Advanced business logic ---
    async calculateBoardSatisfaction(clubId: number) {
      // Fetch objectives
      const objectives = await prisma.boardObjective.findMany({
        where: { boardMember: { clubId } },
      });
      // Fetch recent results (stub: assume available via another service or passed in)
      // Fetch finances (stub: assume available via another service or passed in)
      // For now, use objectives only
      const completed = objectives.filter(o => o.status === 'completed').length;
      const failed = objectives.filter(o => o.status === 'failed').length;
      const active = objectives.filter(o => o.status === 'active').length;
      // Simple formula: 100 - (failed*20) + (completed*10) - (active*2)
      let score = 100 - (failed * 20) + (completed * 10) - (active * 2);
      if (score > 100) score = 100;
      if (score < 0) score = 0;
      return score;
    },
    async triggerBoardMeetingIfNeeded(clubId: number, context: { recentResults: any[], finances: any, crisis?: boolean }) {
      // Example: if crisis or poor results, trigger a meeting
      if (context.crisis || (context.recentResults && context.recentResults.filter(r => r.loss).length >= 3)) {
        return this.triggerBoardMeeting(clubId, 'Emergency Meeting', new Date());
      }
      return null;
    },
    async updateBoardObjectives(clubId: number) {
      // Example: if no active objectives, add a new one
      const objectives = await prisma.boardObjective.findMany({
        where: { boardMember: { clubId }, status: 'active' },
      });
      if (objectives.length === 0) {
        // Find a board member
        const member = await prisma.boardMember.findFirst({ where: { clubId } });
        if (member) {
          await prisma.boardObjective.create({
            data: {
              boardMemberId: member.id,
              description: 'Finish in top half of league',
              status: 'active',
              deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            },
          });
        }
      }
      return true;
    },
    async handleBoardMemberTurnover(clubId: number) {
      // Remove a board member if satisfaction < 40, add if > 90
      const satisfaction = await this.calculateBoardSatisfaction(clubId);
      if (satisfaction < 40) {
        const member = await prisma.boardMember.findFirst({ where: { clubId } });
        if (member) {
          await prisma.boardMember.delete({ where: { id: member.id } });
        }
      } else if (satisfaction > 90) {
        await prisma.boardMember.create({
          data: {
            clubId,
            name: 'New Board Member',
            role: 'Director',
            influence: 50,
            tenure: 0,
          },
        });
      }
      return true;
    },
  };
}

// Default instance for production
import { PrismaClient as RealPrismaClient } from '@prisma/client';
export const BoardroomService = createBoardroomService(new RealPrismaClient()); 