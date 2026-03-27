import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory storage for FanGroup (model doesn't exist in Prisma)
interface FanGroup {
  id: number;
  clubId: number;
  name: string;
  size: number;
  satisfaction: number;
}

interface FanReaction {
  id: number;
  clubId: number;
  eventType: string;
  eventId: number;
  reaction: string;
  intensity: number;
  description: string;
  createdAt: Date;
}

interface FanSatisfaction {
  clubId: number;
  overallSatisfaction: number;
  matchResults: number;
  entertainment: number;
  ticketPrices: number;
  facilities: number;
  communication: number;
  community: number;
  lastUpdated: Date;
}

const fanGroupsStore: Map<number, FanGroup> = new Map();
const fanReactionsStore: Map<number, FanReaction> = new Map();
let nextGroupId = 1;
let nextReactionId = 1;

class FanDynamicsService {
  static async calculateFanSatisfaction(clubId: number): Promise<FanSatisfaction> {
    // Get recent fixtures for the club
    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }],
        isPlayed: true
      },
      orderBy: { matchDate: 'desc' },
      take: 10
    });

    const matchResults = this.calculateMatchResultsSatisfaction(fixtures, clubId);
    const entertainment = this.calculateEntertainmentSatisfaction(fixtures);
    const ticketPrices = 70; // Default
    const facilities = 70; // Default
    const communication = 70; // Default
    const community = 70; // Default

    const overallSatisfaction = (
      matchResults * 0.3 +
      entertainment * 0.2 +
      ticketPrices * 0.15 +
      facilities * 0.15 +
      communication * 0.1 +
      community * 0.1
    );

    return {
      clubId,
      overallSatisfaction: Math.round(overallSatisfaction),
      matchResults,
      entertainment,
      ticketPrices,
      facilities,
      communication,
      community,
      lastUpdated: new Date()
    };
  }

  static calculateMatchResultsSatisfaction(fixtures: any[], clubId: number): number {
    if (fixtures.length === 0) return 50;

    let wins = 0, draws = 0, losses = 0;
    for (const f of fixtures) {
      const isHome = f.homeTeamId === clubId;
      const goalsFor = isHome ? (f.homeScore || 0) : (f.awayScore || 0);
      const goalsAgainst = isHome ? (f.awayScore || 0) : (f.homeScore || 0);
      if (goalsFor > goalsAgainst) wins++;
      else if (goalsFor === goalsAgainst) draws++;
      else losses++;
    }

    const points = wins * 3 + draws;
    const maxPoints = fixtures.length * 3;
    return Math.round((points / maxPoints) * 100);
  }

  static calculateEntertainmentSatisfaction(fixtures: any[]): number {
    if (fixtures.length === 0) return 50;
    const totalGoals = fixtures.reduce((sum, f) => sum + (f.homeScore || 0) + (f.awayScore || 0), 0);
    const avgGoals = totalGoals / fixtures.length;
    return Math.min(100, Math.round(avgGoals * 20)); // More goals = more entertainment
  }

  static async createFanGroup(clubId: number, name: string, size: number): Promise<FanGroup> {
    const group: FanGroup = {
      id: nextGroupId++,
      clubId,
      name,
      size,
      satisfaction: 70
    };
    fanGroupsStore.set(group.id, group);
    return group;
  }

  static async getFanGroups(clubId: number): Promise<FanGroup[]> {
    return Array.from(fanGroupsStore.values()).filter(g => g.clubId === clubId);
  }

  static async updateFanGroupSatisfaction(groupId: number, satisfaction: number): Promise<void> {
    const group = fanGroupsStore.get(groupId);
    if (group) {
      group.satisfaction = satisfaction;
      fanGroupsStore.set(groupId, group);
    }
  }

  static async triggerAutomaticFanReactions(clubId: number): Promise<FanReaction[]> {
    const reactions: FanReaction[] = [];

    // Check recent match results
    const recentFixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }],
        isPlayed: true
      },
      orderBy: { matchDate: 'desc' },
      take: 1
    });

    if (recentFixtures.length > 0) {
      const lastMatch = recentFixtures[0];
      const isHome = lastMatch.homeTeamId === clubId;
      const goalsFor = isHome ? (lastMatch.homeScore || 0) : (lastMatch.awayScore || 0);
      const goalsAgainst = isHome ? (lastMatch.awayScore || 0) : (lastMatch.homeScore || 0);

      let reaction: FanReaction;
      if (goalsFor > goalsAgainst) {
        reaction = {
          id: nextReactionId++,
          clubId,
          eventType: 'match_result',
          eventId: lastMatch.id,
          reaction: goalsFor - goalsAgainst >= 3 ? 'ecstatic' : 'positive',
          intensity: Math.min(100, (goalsFor - goalsAgainst) * 25),
          description: `Fans celebrate ${goalsFor}-${goalsAgainst} victory`,
          createdAt: new Date()
        };
      } else if (goalsFor === goalsAgainst) {
        reaction = {
          id: nextReactionId++,
          clubId,
          eventType: 'match_result',
          eventId: lastMatch.id,
          reaction: 'neutral',
          intensity: 30,
          description: `Mixed feelings about ${goalsFor}-${goalsAgainst} draw`,
          createdAt: new Date()
        };
      } else {
        reaction = {
          id: nextReactionId++,
          clubId,
          eventType: 'match_result',
          eventId: lastMatch.id,
          reaction: goalsAgainst - goalsFor >= 3 ? 'outraged' : 'negative',
          intensity: Math.min(100, (goalsAgainst - goalsFor) * 25),
          description: `Fans disappointed by ${goalsFor}-${goalsAgainst} loss`,
          createdAt: new Date()
        };
      }
      fanReactionsStore.set(reaction.id, reaction);
      reactions.push(reaction);
    }

    return reactions;
  }

  static async getFanAnalytics(clubId: number): Promise<any> {
    const satisfaction = await this.calculateFanSatisfaction(clubId);
    const groups = await this.getFanGroups(clubId);
    const reactions = Array.from(fanReactionsStore.values()).filter(r => r.clubId === clubId);

    return {
      satisfaction,
      groups,
      recentReactions: reactions.slice(-10),
      sentiment: this.calculateFanSentiment(reactions),
      recommendations: this.generateFanRecommendations(satisfaction, reactions, groups)
    };
  }

  static calculateFanSentiment(reactions: FanReaction[]): number {
    if (reactions.length === 0) return 50;

    const sentimentMap: Record<string, number> = {
      'ecstatic': 100,
      'positive': 75,
      'neutral': 50,
      'negative': 25,
      'outraged': 0
    };

    const total = reactions.reduce((sum, r) => sum + (sentimentMap[r.reaction] || 50), 0);
    return Math.round(total / reactions.length);
  }

  static generateFanRecommendations(satisfaction: FanSatisfaction, _reactions: FanReaction[], _groups: FanGroup[]): string[] {
    const recommendations: string[] = [];

    if (satisfaction.matchResults < 50) {
      recommendations.push('Focus on improving team performance to boost fan morale');
    }
    if (satisfaction.entertainment < 50) {
      recommendations.push('Consider more attacking tactics for entertainment value');
    }
    if (satisfaction.ticketPrices < 50) {
      recommendations.push('Review ticket pricing strategy');
    }
    if (satisfaction.facilities < 50) {
      recommendations.push('Invest in stadium facilities upgrades');
    }
    if (satisfaction.communication < 50) {
      recommendations.push('Improve communication with fan groups');
    }

    if (recommendations.length === 0) {
      recommendations.push('Fan satisfaction is healthy - maintain current strategy');
    }

    return recommendations;
  }
}

export default FanDynamicsService;