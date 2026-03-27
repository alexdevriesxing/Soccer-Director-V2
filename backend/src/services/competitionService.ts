import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Competition types
 */
export enum CompetitionType {
  LEAGUE = 'LEAGUE',
  CUP = 'CUP',
  PLAYOFF = 'PLAYOFF',
  FRIENDLY = 'FRIENDLY'
}

export enum CompetitionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

/**
 * Competition Service - Handles league tables, cup draws, fixtures
 */
export class CompetitionService {
  /**
   * Get all competitions
   */
  async getAllCompetitions() {
    return prisma.competition.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(id: number) {
    return prisma.competition.findUnique({
      where: { id }
    });
  }

  /**
   * Get league table for a competition
   */
  async getLeagueTable(competitionId: number) {
    const standings = await prisma.clubSeasonStats.findMany({
      where: {
        club: {
          leagueId: competitionId
        }
      },
      include: {
        club: true
      },
      orderBy: [
        { points: 'desc' },
        { goalsFor: 'desc' }
      ]
    });

    return standings.map((s, index) => ({
      position: index + 1,
      clubId: s.clubId,
      clubName: s.club.name,
      played: s.matchesPlayed,
      won: s.wins,
      drawn: s.draws,
      lost: s.losses,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.points
    }));
  }

  /**
   * Get fixtures for a competition
   */
  async getFixtures(competitionId: number, matchDay?: number) {
    const where: any = { competitionId };
    if (matchDay !== undefined) {
      where.matchDay = matchDay;
    }

    return prisma.fixture.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: [
        { matchDay: 'asc' },
        { matchDate: 'asc' }
      ]
    });
  }

  /**
   * Get results (played fixtures)
   */
  async getResults(competitionId: number) {
    return prisma.fixture.findMany({
      where: {
        competitionId,
        isPlayed: true
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { matchDay: 'desc' }
    });
  }
}

export default new CompetitionService();
