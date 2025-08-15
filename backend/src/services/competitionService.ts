import { PrismaClient, Prisma } from '@prisma/client';

// Extend the Prisma client with our model types
type PrismaClientWithModels = PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;

// Re-export enums from Prisma client
export { CompetitionType, LeagueLevel } from '@prisma/client';

// Local type for team in competition to avoid conflicts with Prisma's generated types
export enum CompetitionType {
  LEAGUE = 'LEAGUE',
  CUP = 'CUP',
  PLAYOFF = 'PLAYOFF'
}

export enum LeagueLevel {
  EREDIVISIE = 'EREDIVISIE',
  KKD = 'KKD',
  TWEEDE_DIVISIE = 'TWEEDE_DIVISIE',
  DERDE_DIVISIE = 'DERDE_DIVISIE',
  VIERDE_KLASSE = 'VIERDE_KLASSE',
  VIJFTIGE_KLASSE = 'VIJFTIGE_KLASSE',
  ZONDAG_AMATEURS = 'ZONDAG_AMATEURS',
  ZATERDAG_AMATEURS = 'ZATERDAG_AMATEURS'
}

// Define interfaces for our service
type TeamInCompetition = Prisma.TeamInCompetitionGetPayload<{
  include: {
    team: true;
  };
}> & {
  id: number;
  teamId: number;
  competitionId: number;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
  homeForm: string | null;
  awayForm: string | null;
  promotion: boolean;
  relegation: boolean;
  playoff: boolean;
  notes: string | null;
  team: {
    id: number;
    name: string;
    shortName: string | null;
    logo: string | null;
  };
}

interface CompetitionWithTeams {
  id: number;
  name: string;
  type: CompetitionType;
  level: LeagueLevel;
  season: string;
  country: string;
  isActive: boolean;
  teams: TeamInCompetition[];
}

interface UpdateTeamRecordParams {
  teamId: number;
  competitionId: number;
  goalsFor: number;
  goalsAgainst: number;
  isHome: boolean;
  season: string;
}

interface TeamFormParams {
  teamId: number;
  competitionId: number;
  season: string;
}

interface GenerateFixturesParams {
  competitionId: number;
  season: string;
  startDate: Date;
  endDate: Date;
  matchDays: number[];
}

export class CompetitionService {
  private prisma: PrismaClientWithModels;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma as PrismaClientWithModels;
  }

  async getActiveCompetitions(season: string): Promise<CompetitionWithTeams[]> {
    try {
      const competitions = await this.prisma.competition.findMany({
        where: { isActive: true },
        include: {
          teams: {
            where: {
              competition: {
                season
              },
            },
            include: {
              team: true,
            },
            orderBy: [
              { points: 'desc' as const },
              { goalDifference: 'desc' as const },
              { goalsFor: 'desc' as const },
            ],
          },
        },
      });

      return competitions.map((comp: any) => ({
        ...comp,
        teams: comp.teams.map((team: any) => ({
          ...team,
          team: {
            id: team.team.id,
            name: team.team.name,
            shortName: team.team.shortName,
            logo: team.team.logo,
          }
        }))
      }));
    } catch (error) {
      console.error('Error fetching active competitions:', error);
      throw new Error('Failed to fetch active competitions');
    }
  }

  async getLeagueTable(competitionId: number, season: string): Promise<TeamInCompetition[]> {
    try {
      // Get all teams in the competition
      const teams = await this.prisma.teamInCompetition.findMany({
        where: {
          competitionId,
          competition: {
            season,
          },
        },
        include: {
          team: true,
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
          { goalsAgainst: 'asc' },
        ],
      });

      return teams.map(team => ({
        id: team.id,
        teamId: team.teamId,
        competitionId: team.competitionId,
        position: team.position,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
        form: team.form || null,
        homeForm: team.homeForm || null,
        awayForm: team.awayForm || null,
        promotion: team.promotion,
        relegation: team.relegation,
        playoff: team.playoff,
        notes: team.notes,
        team: {
          id: team.team.id,
          name: team.team.name,
          shortName: team.team.shortName || null,
          logo: team.team.logo || null,
        },
      }));
    } catch (error) {
      console.error(`Error getting league table for competition ${competitionId}:`, error);
      throw new Error('Failed to get league table');
    }
  }

  async processMatchResults(fixtureId: number): Promise<void> {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: true,
        awayClub: true,
        league: true,
        cup: true,
      },
    });

    if (!fixture || fixture.homeGoals === null || fixture.awayGoals === null) {
      throw new Error('Invalid fixture or missing scores');
    }

    const homeScore = fixture.homeGoals;
    const awayScore = fixture.awayGoals;
    const competitionId = fixture.leagueId || fixture.cupId;
    const homeTeamId = fixture.homeClubId;
    const awayTeamId = fixture.awayClubId;

    if (!competitionId) {
      throw new Error('Fixture is not associated with a competition');
    }

    await this.updateTeamRecord({
      teamId: homeTeamId,
      competitionId,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
      isHome: true,
      season: fixture.season,
    });

    await this.updateTeamRecord({
      teamId: awayTeamId,
      competitionId,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
      isHome: false,
      season: fixture.season,
    });
  }

  async recordMatchResult(
    matchId: number,
    homeScore: number,
    awayScore: number,
    status: string
  ): Promise<void> {
    try {
      // Find the match with related data
      const match = await this.prisma.fixture.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          competition: true,
          league: true,
          cup: true,
        },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // Determine competition and season
      const competitionId = match.competitionId || match.leagueId || match.cupId;
      if (!competitionId) {
        throw new Error('Could not determine competition for match');
      }

      const season = match.competition?.season || match.league?.season || match.cup?.season;
      if (!season) {
        throw new Error('Could not determine season for match');
      }

      // Update the fixture with the result
      await this.prisma.fixture.update({
        where: { id: matchId },
        data: {
          homeGoals: homeScore,
          awayGoals: awayScore,
          status,
          updatedAt: new Date(),
        },
      });

      // Update home team record
      await this.updateTeamRecord(
        match.homeTeamId,
        competitionId,
        true, // isHome
        homeScore,
        awayScore,
        season
      );

      // Update away team record
      await this.updateTeamRecord(
        match.awayTeamId,
        competitionId,
        false, // isHome
        awayScore,
        homeScore,
        season
      );

      // Update team forms
      await this.updateTeamForm(match.homeTeamId, competitionId, season);
      await this.updateTeamForm(match.awayTeamId, competitionId, season);

      // Update league table positions
      await this.updateLeagueTablePositions(competitionId, season);
    } catch (error) {
      console.error('Error updating match result:', error);
      throw new Error(`Failed to update match result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateTeamRecord(
    teamId: number,
    competitionId: number,
    isHome: boolean,
    goalsFor: number,
    goalsAgainst: number,
    season: string
  ): Promise<void> {
    try {
      // Find or create the team's record in this competition
      const teamRecord = await this.prisma.teamInCompetition.upsert({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        create: {
          teamId,
          competitionId,
          season,
          position: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: '',
          homeForm: isHome ? '' : null,
          awayForm: isHome ? null : '',
          promotion: false,
          relegation: false,
          playoff: false,
        },
        update: {},
      });

      // Calculate match outcome
      const isWin = goalsFor > goalsAgainst;
      const isDraw = goalsFor === goalsAgainst;
      const isLoss = goalsFor < goalsAgainst;
      const result = isWin ? 'W' : isDraw ? 'D' : 'L';

      // Prepare update data
      const updateData: Record<string, any> = {
        played: { increment: 1 },
        goalsFor: { increment: goalsFor },
        goalsAgainst: { increment: goalsAgainst },
        goalDifference: { increment: goalsFor - goalsAgainst },
        updatedAt: new Date(),
      };

      // Add win/draw/loss specific updates
      if (isWin) {
        updateData.won = { increment: 1 };
        updateData.points = { increment: 3 };
      } else if (isDraw) {
        updateData.drawn = { increment: 1 };
        updateData.points = { increment: 1 };
      } else {
        updateData.lost = { increment: 1 };
      }

      // Get current form
      const formField = isHome ? 'homeForm' : 'awayForm';
      const currentForm = teamRecord[formField as keyof typeof teamRecord] || '';
      const newForm = (typeof currentForm === 'string' ? currentForm : '').slice(-4) + 
                     (isWin ? 'W' : isDraw ? 'D' : 'L');
      
      // Update the team's record
      await this.prisma.teamInCompetition.update({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        data: {
          ...updateData,
          [formField]: newForm,
        },
      });

      // Update the league table positions
      await this.updateLeagueTablePositions(competitionId);
    } catch (error) {
      console.error('Error updating team record:', error);
      throw new Error('Failed to update team record');
    }
  }



  private async updateTeamRecord(
    teamId: number,
    competitionId: number,
    isHome: boolean,
    goalsFor: number,
    goalsAgainst: number,
    season: string
  ): Promise<void> {
    try {
      const result = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L';
      const formField = isHome ? 'homeForm' : 'awayForm';
      const isWin = goalsFor > goalsAgainst;
      const isDraw = goalsFor === goalsAgainst;
      const isLoss = goalsFor < goalsAgainst;

      await this.prisma.teamInCompetition.upsert({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        create: {
          teamId,
          competitionId,
          position: 0, // Will be updated by updateLeagueTablePositions
          played: 1,
          won: isWin ? 1 : 0,
          drawn: isDraw ? 1 : 0,
          lost: isLoss ? 1 : 0,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points: isWin ? 3 : isDraw ? 1 : 0,
          [formField]: result,
          homeForm: isHome ? result : '',
          awayForm: isHome ? '' : result,
          promotion: false,
          relegation: false,
          playoff: false,
        },
        update: {
          played: { increment: 1 },
          won: isWin ? { increment: 1 } : undefined,
          drawn: isDraw ? { increment: 1 } : undefined,
          lost: isLoss ? { increment: 1 } : undefined,
          goalsFor: { increment: goalsFor },
          goalsAgainst: { increment: goalsAgainst },
          goalDifference: { increment: goalsFor - goalsAgainst },
          points: {
            increment: isWin ? 3 : isDraw ? 1 : 0,
          },
          [formField]: {
            set: (prev => `${prev || ''}${result}`.slice(-5)) as Prisma.StringFieldUpdateOperationsInput['set'],
          },
        },
      });

      // Update the league table positions
      await this.updateLeagueTablePositions(competitionId, season);
    } catch (error) {
      console.error('Error updating team record:', error);
      throw new Error('Failed to update team record');
    }
  }

  private async updateLeagueTablePositions(competitionId: number, season: string): Promise<void> {
    try {
      // Get all teams in the competition ordered by points, goal difference, and goals for
      const teams = await this.prisma.teamInCompetition.findMany({
        where: { 
          competitionId,
          competition: {
            season,
          },
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
          { goalsAgainst: 'asc' },
          { id: 'asc' } // Add a consistent tiebreaker
        ],
        include: {
          team: true,
        },
      });

      // Update each team's position
      const updates = teams.map((team, index) =>
        this.prisma.teamInCompetition.update({
          where: { 
            teamId_competitionId: {
              teamId: team.teamId,
              competitionId: team.competitionId,
            },
          },
          data: { 
            position: index + 1,
            // Update promotion/relegation status based on position
            promotion: index < 2, // Top 2 promote
            playoff: index >= 2 && index <= 5, // Positions 3-6 go to playoffs
            relegation: index >= teams.length - 3, // Bottom 3 relegate
          },
        })
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating league table positions:', error);
      throw new Error('Failed to update league table positions');
    }
  }

  private async updateTeamForm(
    teamId: number,
    competitionId: number,
    season: string,
    matches = 5
  ): Promise<void> {
    try {
      // Get the last N matches for this team in the competition
      const recentMatches = await this.prisma.fixture.findMany({
        where: {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
          ],
          competitionId,
          season,
          status: 'FINISHED'
        },
        orderBy: { date: 'desc' },
        take: matches,
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });

      // Calculate form string (W/W/D/L, etc.)
      const form = recentMatches
        .map(match => {
          if (!match.homeScore || !match.awayScore) return ''; // Skip if scores are not available
          if (match.homeTeamId === teamId) {
            return match.homeScore > match.awayScore ? 'W' : 
                   match.homeScore === match.awayScore ? 'D' : 'L';
          } else {
            return match.awayScore > match.homeScore ? 'W' : 
                   match.awayScore === match.homeScore ? 'D' : 'L';
          }
        })
        .filter(Boolean)
        .join('');

      // Update the team's form
      await this.prisma.teamInCompetition.update({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        data: { 
          form,
          updatedAt: new Date()
        },
      });
    } catch (error) {
      console.error('Error updating team form:', error);
      throw new Error(`Failed to update team form: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateLeagueTablePositions(competitionId: number, season: string): Promise<void> {
    try {
      // First, get all teams in the competition ordered by their current standings
      const teamStats = await this.prisma.teamInCompetition.findMany({
        where: { 
          competitionId,
          competition: {
            season
          }
        },
        include: {
          team: true,
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
          { goalsAgainst: 'asc' },
        ],
      });

      // Update each team's position based on the sorted results
      const updatePromises = teamStats.map((stats: TeamInCompetition, index: number) =>
        this.prisma.teamInCompetition.update({
          where: { 
            teamId_competitionId: {
              teamId: stats.teamId,
              competitionId: stats.competitionId
            }
          },
          data: { 
            position: index + 1,
            updatedAt: new Date(),
          },
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating league table positions:', error);
      throw new Error('Failed to update league table positions');
    }
  }

  async generateLeagueFixtures(leagueId: number, season: string): Promise<void> {
    try {
      // Get teams in this competition
      const teams = await this.prisma.teamInCompetition.findMany({
        where: {
          competitionId: leagueId,
          competition: { 
            season,
            type: 'LEAGUE'
          },
        },
        include: {
          team: true,
        },
      });

      if (teams.length < 2) {
        throw new Error('Not enough teams in the competition to generate fixtures');
      }

      // Generate round-robin fixtures (two legs)
      const fixtures = this.generateRoundRobinFixtures(
        teams.map(t => ({ id: t.team.id, name: t.team.name })),
        leagueId,
        season
      );

      // Save fixtures to database using Prisma schema fields
      await this.prisma.fixture.createMany({
        data: fixtures.map((f) => ({
          competitionId: leagueId,
          homeTeamId: f.homeTeamId,
          awayTeamId: f.awayTeamId,
          matchDay: f.matchDay,
          matchDate: f.date,
          isPlayed: false,
          isPostponed: false,
        })),
      });
    } catch (error) {
      console.error('Error generating league fixtures:', error);
      throw new Error('Failed to generate league fixtures');
    }
  }

  async getTeamForm(teamId: number, competitionId: number, season: string, matchCount = 5): Promise<string> {
    try {
      const matches = await this.prisma.fixture.findMany({
        where: {
          OR: [
            { homeClubId: teamId },
            { awayClubId: teamId },
          ],
          league: {
            id: competitionId,
            season,
          },
          played: true,
        },
        orderBy: { date: 'desc' },
        take: matchCount,
      });

      return matches
        .map((match) => {
          if (match.homeGoals === null || match.awayGoals === null) return 'D';
          
          const isHomeTeam = match.homeClubId === teamId;
          const teamScore = isHomeTeam ? match.homeGoals : match.awayGoals;
          const opponentScore = isHomeTeam ? match.awayGoals : match.homeGoals;

          if (teamScore > opponentScore) return 'W';
          if (teamScore < opponentScore) return 'L';
          return 'D';
        })
        .join('');
    } catch (error) {
      console.error('Error getting team form:', error);
      return '';
    }
  }

  async processPromotionsAndRelegations(season: string): Promise<void> {
    try {
      const competitions = await this.prisma.competition.findMany({
        where: { 
          isActive: true,
          season
        },
        orderBy: { level: 'asc' },
      });

      // Process each level from top to bottom
      for (let i = 0; i < competitions.length - 1; i++) {
        const currentCompetition = competitions[i];
        const nextCompetition = competitions[i + 1];
        
        if (!nextCompetition) continue;

        // Get teams for current and next competitions
        const currentTeams = await this.prisma.teamInCompetition.findMany({
          where: { 
            competitionId: currentCompetition.id,
            competition: { 
              season 
            }
          },
          orderBy: { position: 'asc' },
        });

        const nextTeams = await this.prisma.teamInCompetition.findMany({
          where: { 
            competitionId: nextCompetition.id,
            competition: { 
              season 
            }
          },
          orderBy: { position: 'asc' },
        });

        // Process promotions and relegations
        const teamsToPromote = currentTeams.filter(t => t.promotion);
        const teamsToRelegate = nextTeams.filter(t => t.relegation);

        // Update team competitions for next season
        for (const team of teamsToPromote) {
          await this.prisma.teamInCompetition.update({
            where: { id: team.id },
            data: { 
              competitionId: nextCompetition.id,
              // Reset stats for the new season
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
              form: null,
              homeForm: null,
              awayForm: null,
              promotion: false,
              relegation: false,
              playoff: false
            },
          });
        }

        for (const team of teamsToRelegate) {
          await this.prisma.teamInCompetition.update({
            where: { id: team.id },
            data: { 
              competitionId: currentCompetition.id,
              // Reset stats for the new season
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
              form: null,
              homeForm: null,
              awayForm: null,
              promotion: false,
              relegation: false,
              playoff: false
            },
          });
        }
      }
    } catch (error) {
      console.error('Error processing promotions and relegations:', error);
      throw new Error('Failed to process promotions and relegations');
    }
  }

  private generateRoundRobinFixtures(
    teams: Array<{ id: number; name: string }>,
    competitionId: number,
    season: string
  ): Array<{
    competitionId: number;
    homeTeamId: number;
    awayTeamId: number;
    matchDay: number;
    date: Date;
    isPlayed: boolean;
    isPostponed: boolean;
    season: string;
    homeGoals: number | null;
    awayGoals: number | null;
    attendance: number | null;
    type: 'LEAGUE' | 'CUP' | 'PLAYOFF';
  }> {
    const fixtures: Array<{
      competitionId: number;
      homeTeamId: number;
      awayTeamId: number;
      matchDay: number;
      date: Date;
      isPlayed: boolean;
      isPostponed: boolean;
      season: string;
      homeGoals: number | null;
      awayGoals: number | null;
      attendance: number | null;
      type: 'LEAGUE' | 'CUP' | 'PLAYOFF';
    }> = [];

    // If odd number of teams, add a BYE team
    const teamList = [...teams];
    if (teamList.length % 2 !== 0) {
      teamList.push({ id: -1, name: 'BYE' });
    }

    const rounds = teamList.length - 1;
    const half = teamList.length / 2;

    // Generate first half of the season
    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < half; i++) {
        const home = teamList[i];
        const away = teamList[teamList.length - 1 - i];

        // Skip BYE matches
        if (home.id === -1 || away.id === -1) continue;

        fixtures.push({
          competitionId,
          homeTeamId: home.id,
          awayTeamId: away.id,
          matchDay: round + 1,
          date: new Date(),
          isPlayed: false,
          isPostponed: false,
          season,
          homeGoals: null,
          awayGoals: null,
          attendance: null,
          type: 'LEAGUE',
        });
      }

      // Rotate teams for the next round
      if (teamList.length > 1) {
        const lastTeam = teamList.pop();
        if (lastTeam) {
          teamList.splice(1, 0, lastTeam);
        }
      }
    }

    // Generate second half of the season (reverse fixtures)
    const secondHalfFixtures = fixtures.map((fixture) => ({
      ...fixture,
      homeTeamId: fixture.awayTeamId,
      awayTeamId: fixture.homeTeamId,
      matchDay: fixture.matchDay + rounds,
    }));

    return [...fixtures, ...secondHalfFixtures];
  }

  private getPreviousSeason(season: string): string {
    const [startYear, endYear] = season.split('/').map(Number);
    return `${startYear - 1}/${endYear - 1}`;
  }

  private getNextSeason(season: string): string {
    const [startYear, endYear] = season.split('/').map(Number);
    return `${startYear + 1}/${endYear + 1}`;
  }
}

// Initialize with properly typed Prisma client
export const competitionService = new CompetitionService(
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  }) as unknown as PrismaClientWithModels
);
