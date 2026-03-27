import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Boardroom Service - Stub
 */
export class BoardroomService {
  async getBoardExpectations(clubId: number) {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, boardExpectation: true, morale: true }
    });

    return {
      clubId,
      expectation: club?.boardExpectation || 'mid-table',
      confidence: 70,
      morale: club?.morale || 70
    };
  }

  async getBoardMeetingNotes(_clubId: number) {
    return {
      notes: [],
      lastMeeting: null
    };
  }

  async requestBudgetIncrease(_clubId: number, _amount: number) {
    return {
      success: false,
      message: 'Budget increase request - coming soon'
    };
  }
}

export default new BoardroomService();