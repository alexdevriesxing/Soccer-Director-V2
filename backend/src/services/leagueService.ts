import { CompetitionType, LeagueLevel } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

// Create a new Prisma client instance
const prisma = new PrismaClient();

// Type definitions
interface CreateLeagueInput {
  name: string;
  country: string;
  level: string;
  season: string;
  type?: string;
  isActive?: boolean;
}

interface UpdateLeagueInput {
  name?: string;
  country?: string;
  level?: string;
  season?: string;
  type?: string;
  isActive?: boolean;
}

interface LeagueStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  status?: string;
}

interface LeagueStandings {
  league: string;
  season: string;
  standings: LeagueStanding[];
}

class LeagueService {
  // Create a new league
  async createLeague(data: CreateLeagueInput) {
    return prisma.competition.create({
      data: {
        name: data.name,
        country: data.country,
        level: data.level as LeagueLevel,
        season: data.season,
        type: (data.type as CompetitionType) || CompetitionType.LEAGUE,
        isActive: data.isActive ?? true,
      },
    });
  }

  // Get league by ID
  async getLeagueById(id: number) {
    return prisma.competition.findUnique({
      where: { id },
      include: {
        teams: true,
      },
    });
  }

  // Update league
  async updateLeague(id: number, data: UpdateLeagueInput) {
    const updateData: {
      name?: string;
      country?: string;
      level?: LeagueLevel;
      season?: string;
      type?: CompetitionType;
      isActive?: boolean;
    } = {};
    
    // Only include the fields that are provided in the input
    if (data.name !== undefined) updateData.name = data.name;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.level !== undefined) updateData.level = data.level as LeagueLevel;
    if (data.season !== undefined) updateData.season = data.season;
    if (data.type !== undefined) updateData.type = data.type as CompetitionType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    return prisma.competition.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete league
  async deleteLeague(id: number) {
    return prisma.competition.delete({
      where: { id },
    });
  }

  // Register club for league
  async registerClubForLeague(_clubId: number, _leagueId: number, _season: string) {
    // Implementation depends on your data model
    throw new Error('Not implemented');
  }

  // Get league rules implementation is already defined below

  // Generate league fixtures
  async generateLeagueFixtures(_leagueId: number, _season: string) {
    // Implementation depends on your fixture generation logic
    throw new Error('Not implemented');
  }

  // Process promotion and relegation
  async processPromotionRelegation(_leagueId: number) {
    // Implementation depends on your promotion/relegation logic
    throw new Error('Not implemented');
  }

  // Get league statistics
  async getLeagueStatistics(_leagueId: number) {
    // Implementation depends on your statistics logic
    throw new Error('Not implemented');
  }

  // Get league history
  async getLeagueHistory(_leagueId: number) {
    // Implementation depends on your history logic
    throw new Error('Not implemented');
  }

  // Get league standings - implementation moved to the second method

  // Get league rankings (alias for getLeagueStandings)
  async getLeagueRankings(leagueId: number, season?: string) {
    return this.getLeagueStandings(leagueId, season);
  }

  // Get cup fixtures
  async getCupFixtures(_leagueId: number) {
    // Implementation depends on your cup logic
    throw new Error('Not implemented');
  }
  async getLeagueStructure(): Promise<Record<string, Array<{
    id: number;
    name: string;
    level: string;
    season: string;
    country: string;
    teamCount: number;
  }>>> {
    try {
      const competitions = await prisma.competition.findMany({
        where: {
          type: CompetitionType.LEAGUE,
          isActive: true
        },
        orderBy: [
          { level: 'asc' },
          { name: 'asc' }
        ],
        include: {
          _count: {
            select: { teams: true }
          }
        }
      });

      // Convert to the expected format
      const result: Record<string, Array<{
        id: number;
        name: string;
        level: string;
        season: string;
        country: string;
        teamCount: number;
      }>> = {};

      competitions.forEach(comp => {
        const level = comp.level || 'OTHER';
        if (!result[level]) {
          result[level] = [];
        }
        result[level].push({
          id: comp.id,
          name: comp.name,
          level: comp.level,
          season: comp.season,
          country: comp.country,
          teamCount: comp._count?.teams || 0
        });
      });

      return result;
    } catch (error) {
      console.error('Error in getLeagueStructure:', error);
      throw new Error('Failed to fetch league structure');
    }
  }

  async getCupCompetitions(): Promise<Array<{
    id: number;
    name: string;
    level: string;
    season: string;
    country: string;
    isActive: boolean;
    teamCount: number;
  }>> {
    try {
      const competitions = await prisma.competition.findMany({
        where: {
          type: 'CUP' as const,
          isActive: true
        },
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: { teams: true }
          }
        }
      });

      return competitions.map(comp => ({
        id: comp.id,
        name: comp.name,
        level: comp.level,
        season: comp.season,
        country: comp.country,
        isActive: comp.isActive,
        teamCount: comp._count.teams
      }));
    } catch (error) {
      console.error('Error in getCupCompetitions:', error);
      throw new Error('Failed to fetch cup competitions');
    }
  }

  async getLeagueFixtures(
    leagueId: number, 
    season?: string
  ): Promise<{
    league: string;
    season: string;
    fixtures: Array<{
      id: number;
      matchDay: number;
      homeTeam: {
        id: number;
        name: string;
        score: number | null;
      };
      awayTeam: {
        id: number;
        name: string;
        score: number | null;
      };
    }>;
  }> {
    try {
      const competition = await prisma.competition.findUnique({
        where: { id: leagueId },
      });

      if (!competition) {
        throw new Error('Competition not found');
      }

      const currentSeason = season || competition.season;
      
      // First get all fixtures with basic info
      const fixtures = await prisma.fixture.findMany({
        where: {
          competitionId: leagueId,
          homeScore: { not: null },
          awayScore: { not: null }
        },
        orderBy: [
          { matchDay: 'asc' },
          { id: 'asc' }
        ]
      });

      // Get all team IDs from the fixtures
      const teamIds = new Set<number>();
      fixtures.forEach(fixture => {
        teamIds.add(fixture.homeTeamId);
        teamIds.add(fixture.awayTeamId);
      });

      // Get club details in a single query using the correct Prisma client method
      const clubRecords = await prisma.club.findMany({
        where: {
          id: { in: Array.from(teamIds) }
        },
        select: {
          id: true,
          name: true
        }
      });

      // Create a map of club IDs to club names with proper type assertion
      const teamMap = new Map<number, string>();
      clubRecords.forEach((club: { id: number; name: string }) => {
        if (club?.id && club?.name) {
          teamMap.set(club.id, club.name);
        }
      });

      return {
        league: competition.name,
        season: currentSeason,
        fixtures: fixtures.map(fixture => ({
          id: fixture.id,
          matchDay: fixture.matchDay,
          homeTeam: {
            id: fixture.homeTeamId,
            name: teamMap.get(fixture.homeTeamId) || 'Unknown Team',
            score: fixture.homeScore
          },
          awayTeam: {
            id: fixture.awayTeamId,
            name: teamMap.get(fixture.awayTeamId) || 'Unknown Team',
            score: fixture.awayScore
          }
        }))
      };
    } catch (error) {
      console.error('Error in getLeagueFixtures:', error);
      throw new Error('Failed to fetch league fixtures');
    }
  }

  async getLeagueStandings(leagueId: number, season?: string): Promise<LeagueStandings> {
    // Get competition details
    const competition = await prisma.competition.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        season: true
      }
    });

    if (!competition) {
      throw new Error('Competition not found');
    }

    // Get all teams in the competition using the correct relation
    const competitionWithTeams = await prisma.competition.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!competitionWithTeams) {
      throw new Error('Competition not found');
    }

    if (!competitionWithTeams.teams || competitionWithTeams.teams.length === 0) {
      throw new Error('No teams found for this competition');
    }

    const currentSeason = season || competition.season;

    // Get all fixtures for the competition and season
    const fixtures = await prisma.fixture.findMany({
      where: {
        competitionId: leagueId,
        homeScore: { not: null },
        awayScore: { not: null }
      }
    });

    // Initialize team standings
    const teamStandings: Record<number, LeagueStanding> = {};

    // Initialize all teams with zero stats
    if (competitionWithTeams.teams && Array.isArray(competitionWithTeams.teams)) {
      competitionWithTeams.teams.forEach(({ team }) => {
        if (team && team.id) {
          teamStandings[team.id] = {
            position: 0,
            team: team.name || 'Unknown Team',
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
          };
        }
      });
    }

    // Process each fixture to update team stats
    fixtures.forEach((fixture) => {
      const homeTeamId = fixture.homeTeamId;
      const awayTeamId = fixture.awayTeamId;
      const homeTeam = teamStandings[homeTeamId];
      const awayTeam = teamStandings[awayTeamId];

      if (!homeTeam || !awayTeam) return;

      const homeGoals = fixture.homeScore || 0;
      const awayGoals = fixture.awayScore || 0;

      // Update matches played
      homeTeam.played++;
      awayTeam.played++;

      // Update goals
      homeTeam.goalsFor += homeGoals;
      homeTeam.goalsAgainst += awayGoals;
      awayTeam.goalsFor += awayGoals;
      awayTeam.goalsAgainst += homeGoals;

      // Update goal difference
      homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
      awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;

      // Update points and win/draw/loss
      if (homeGoals > awayGoals) {
        // Home win
        homeTeam.points += 3;
        homeTeam.won++;
        awayTeam.lost++;
      } else if (homeGoals < awayGoals) {
        // Away win
        awayTeam.points += 3;
        awayTeam.won++;
        homeTeam.lost++;
      } else {
        // Draw
        homeTeam.points += 1;
        awayTeam.points += 1;
        homeTeam.drawn++;
        awayTeam.drawn++;
      }
    });

    // Convert to array and sort by points, then goal difference, then goals scored
    const sortedStandings = Object.values(teamStandings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Update positions
    sortedStandings.forEach((team, index) => {
      team.position = index + 1;
    });

    return {
      league: competition.name,
      season: currentSeason,
      standings: sortedStandings
    };
  }

  // Helper method to get club status based on position and total teams
  getClubStatus(position: number, totalTeams: number): string {
    if (position <= 1) return 'champions';
    if (position <= 4) return 'champions-league';
    if (position === 5) return 'europa-league';
    if (position === 6) return 'conference-league';
    if (position >= totalTeams - 2) return 'relegation';
    return 'mid-table';
  }

  // Note: Removed unused methods to clean up the code
  // The following methods were removed as they were not being used:
  // - getLeagueCapacity
  // - getLeagueRules
  // - getPromotionSpots
  // - getRelegationSpots
  // - getEuropeanQualification
  // - getCupQualification

  // Get transfer window information for a league
  async getTransferWindow(_leagueName: string): Promise<{
    isOpen: boolean;
    startDate: Date;
    endDate: Date;
  }> {
    // Implementation would check the current date against the league's transfer window
    // For now, return default values
    return {
      isOpen: true,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31')
    };
  }

  // Get foreign player limit for a league
  async getForeignPlayerLimit(_leagueName: string): Promise<number> {
    // Implementation would return the maximum number of foreign players allowed
    // For now, return a default value
    return 5;
  }

  // Get homegrown player requirement for a league
  async getHomegrownRequirement(_leagueName: string): Promise<number> {
    // Implementation would return the minimum number of homegrown players required
    // For now, return a default value
    return 4;
  }

  // Get financial fair play status for a league
  async getFinancialFairPlay(_leagueName: string): Promise<boolean> {
    // Implementation would check if financial fair play rules are in effect
    // For now, return a default value
    return true;
  }
}

export default new LeagueService();