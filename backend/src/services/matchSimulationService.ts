import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchEvent {
  id?: number;
  fixtureId: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution' | 'near_miss' | 'save' | 'penalty_goal' | 'penalty_miss';
  minute: number;
  description: string;
  playerName?: string;
  clubId?: number;
  isPenalty?: boolean;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export interface MatchAnalysis {
  xg: { home: number; away: number; perPlayer: Record<number, number> };
  heatmap: Record<number, Array<{ x: number; y: number }>>;
  playerRatings: Record<number, number>;
}

export class MatchSimulationService {

  static async simulateMatch(fixtureId: number): Promise<MatchResult> {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { include: { players: true } },
        awayTeam: { include: { players: true } }
      }
    });

    if (!fixture) throw new Error('Fixture not found');

    const homeTeam = fixture.homeTeam;
    const awayTeam = fixture.awayTeam;

    // Get available players (filter injured)
    const homePlayers = homeTeam.players.filter((p: any) => !p.isInjured).slice(0, 11);
    const awayPlayers = awayTeam.players.filter((p: any) => !p.isInjured).slice(0, 11);

    // Calculate team strengths
    const homeStrength = this.calculateTeamStrength(homePlayers, homeTeam.morale || 50);
    const awayStrength = this.calculateTeamStrength(awayPlayers, awayTeam.morale || 50);

    // Generate match events
    const events = this.generateMatchEvents(fixtureId, homeTeam, awayTeam, homePlayers, awayPlayers, homeStrength, awayStrength);

    // Calculate stats
    const stats = this.calculateMatchStats(events, homeStrength, awayStrength, homeTeam.id, awayTeam.id);

    // Update fixture with result
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        isPlayed: true,
        homeScore: stats.homeGoals,
        awayScore: stats.awayGoals
      }
    });

    // Save match events
    for (const event of events) {
      if (!event.clubId) continue; // Skip events without clubId as it is required
      await prisma.matchEvent.create({
        data: {
          fixtureId: event.fixtureId,
          eventType: event.type,
          minute: event.minute,
          description: event.description,
          playerId: null,
          clubId: event.clubId,
          isHomeTeam: event.clubId === homeTeam.id
        }
      });
    }

    // Update club morale
    await this.updateClubMorale(homeTeam.id, awayTeam.id, stats);

    return stats;
  }

  private static calculateTeamStrength(players: any[], morale: number): number {
    if (players.length === 0) return 30;
    const totalAbility = players.reduce((sum, p) => sum + (p.currentAbility || 50), 0);
    const avgAbility = totalAbility / players.length;
    const moraleBonus = 1.0 + (morale - 50) / 100;
    return Math.round(avgAbility * moraleBonus);
  }

  private static generateMatchEvents(
    fixtureId: number,
    homeTeam: any,
    awayTeam: any,
    homePlayers: any[],
    awayPlayers: any[],
    homeStrength: number,
    awayStrength: number
  ): MatchEvent[] {
    const events: MatchEvent[] = [];

    // Calculate goal probabilities
    const homeGoalProb = Math.min(0.4, Math.max(0.05, 0.15 + (homeStrength - awayStrength) / 100 + 0.1));
    const awayGoalProb = Math.min(0.4, Math.max(0.05, 0.15 + (awayStrength - homeStrength) / 100));

    // Generate home goals
    const homeGoals = Math.floor(Math.random() * 4);
    for (let i = 0; i < homeGoals; i++) {
      if (Math.random() < homeGoalProb) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const scorer = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        if (scorer) {
          events.push({
            fixtureId,
            type: 'goal',
            minute,
            description: `GOAL! ${scorer.firstName} ${scorer.lastName} scores for ${homeTeam.name}!`,
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            clubId: homeTeam.id
          });
        }
      }
    }

    // Generate away goals
    const awayGoals = Math.floor(Math.random() * 4);
    for (let i = 0; i < awayGoals; i++) {
      if (Math.random() < awayGoalProb) {
        const minute = Math.floor(Math.random() * 90) + 1;
        const scorer = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        if (scorer) {
          events.push({
            fixtureId,
            type: 'goal',
            minute,
            description: `GOAL! ${scorer.firstName} ${scorer.lastName} scores for ${awayTeam.name}!`,
            playerName: `${scorer.firstName} ${scorer.lastName}`,
            clubId: awayTeam.id
          });
        }
      }
    }

    // Generate yellow cards
    const yellowCards = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < yellowCards; i++) {
      const isHome = Math.random() < 0.5;
      const players = isHome ? homePlayers : awayPlayers;
      const team = isHome ? homeTeam : awayTeam;
      const player = players[Math.floor(Math.random() * players.length)];
      if (player) {
        events.push({
          fixtureId,
          type: 'yellow_card',
          minute: Math.floor(Math.random() * 90) + 1,
          description: `Yellow card for ${player.firstName} ${player.lastName}`,
          playerName: `${player.firstName} ${player.lastName}`,
          clubId: team.id
        });
      }
    }

    // Sort by minute
    events.sort((a, b) => a.minute - b.minute);
    return events;
  }

  private static calculateMatchStats(events: MatchEvent[], homeStrength: number, awayStrength: number, homeId: number, awayId: number): MatchResult {
    const homeGoals = events.filter(e => e.type === 'goal' && e.clubId === homeId).length;
    const awayGoals = events.filter(e => e.type === 'goal' && e.clubId === awayId).length;
    const homeYellowCards = events.filter(e => e.type === 'yellow_card' && e.clubId === homeId).length;
    const awayYellowCards = events.filter(e => e.type === 'yellow_card' && e.clubId === awayId).length;

    const totalStrength = homeStrength + awayStrength;
    const homePossession = Math.round((homeStrength / totalStrength) * 100);

    return {
      homeGoals,
      awayGoals,
      events,
      homePossession,
      awayPossession: 100 - homePossession,
      homeShots: Math.floor(Math.random() * 10) + 5,
      awayShots: Math.floor(Math.random() * 10) + 5,
      homeShotsOnTarget: Math.floor(Math.random() * 5) + 2,
      awayShotsOnTarget: Math.floor(Math.random() * 5) + 2,
      homeCorners: Math.floor(Math.random() * 8) + 2,
      awayCorners: Math.floor(Math.random() * 8) + 2,
      homeFouls: Math.floor(Math.random() * 15) + 8,
      awayFouls: Math.floor(Math.random() * 15) + 8,
      homeYellowCards,
      awayYellowCards,
      homeRedCards: 0,
      awayRedCards: 0
    };
  }

  private static async updateClubMorale(homeId: number, awayId: number, stats: MatchResult): Promise<void> {
    const homeWin = stats.homeGoals > stats.awayGoals;
    const awayWin = stats.awayGoals > stats.homeGoals;

    await prisma.club.update({
      where: { id: homeId },
      data: { morale: { increment: homeWin ? 5 : (awayWin ? -3 : 1) } }
    });

    await prisma.club.update({
      where: { id: awayId },
      data: { morale: { increment: awayWin ? 5 : (homeWin ? -3 : 1) } }
    });
  }

  static async getMatchAnalysis(fixtureId: number): Promise<MatchAnalysis | null> {
    const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) return null;

    // Stub analysis since it's not in schema
    return {
      xg: { home: 1.5, away: 1.2, perPlayer: {} },
      heatmap: {},
      playerRatings: {}
    };
  }
}