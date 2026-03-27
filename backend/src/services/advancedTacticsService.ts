import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory storage for TacticalFormation (model doesn't exist in Prisma)
interface TacticalFormation {
  id: number;
  clubId: number;
  name: string;
  formation: string;
  style: string;
  intensity: number;
  width: number;
  tempo: number;
  positions: TacticalPosition[];
}

interface TacticalPosition {
  id: number;
  position: string;
  playerId?: number;
  role: string;
  duty: string;
}

interface TacticalAnalysis {
  formation: TacticalFormation;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  familiarity: number;
  chemistry: number;
}

interface MatchPreparation {
  opponentAnalysis: any;
  tacticalPlan: any;
  playerInstructions: any;
  setPieces: any;
  substitutions: any;
}

const formationsStore: Map<number, TacticalFormation> = new Map();
let nextFormationId = 1;

class AdvancedTacticsService {
  static async createTacticalFormation(
    clubId: number,
    name: string,
    formation: string,
    style: string,
    intensity: number,
    width: number,
    tempo: number
  ): Promise<TacticalFormation> {
    const positions = this.generatePositionsFromFormation(formation);

    const tacticalFormation: TacticalFormation = {
      id: nextFormationId++,
      clubId,
      name,
      formation,
      style,
      intensity,
      width,
      tempo,
      positions
    };

    formationsStore.set(tacticalFormation.id, tacticalFormation);
    return tacticalFormation;
  }

  static async getTacticalFormation(clubId: number): Promise<TacticalFormation | null> {
    const formations = Array.from(formationsStore.values()).filter(f => f.clubId === clubId);
    return formations.length > 0 ? formations[0] : null;
  }

  static async updateTacticalFormation(formationId: number, updates: Partial<TacticalFormation>): Promise<TacticalFormation> {
    const existing = formationsStore.get(formationId);
    if (!existing) throw new Error('Formation not found');

    const updated = { ...existing, ...updates };
    formationsStore.set(formationId, updated);
    return updated;
  }

  static async assignPlayerToPosition(_formationId: number, _positionId: number, _playerId: number): Promise<void> {
    // Stub - would update player assignment in formation
    console.log('Player assigned to position (stub)');
  }

  static async addPlayerInstruction(_formationId: number, _positionId: number, _instruction: any): Promise<void> {
    // Stub - would add instruction to position
    console.log('Player instruction added (stub)');
  }

  static async analyzeTacticalFormation(clubId: number): Promise<TacticalAnalysis> {
    const formation = await this.getTacticalFormation(clubId);

    if (!formation) {
      // Return default analysis
      const defaultFormation = await this.createTacticalFormation(clubId, 'Default', '4-4-2', 'balanced', 50, 50, 50);
      return {
        formation: defaultFormation,
        strengths: ['Balanced approach'],
        weaknesses: ['No clear tactical identity'],
        recommendations: ['Develop a tactical style'],
        familiarity: 50,
        chemistry: 50
      };
    }

    return {
      formation,
      strengths: this.analyzeStrengths(formation),
      weaknesses: this.analyzeWeaknesses(formation),
      recommendations: this.generateRecommendations(formation),
      familiarity: await this.calculateTacticalFamiliarity(clubId),
      chemistry: await this.calculateSquadChemistry(clubId)
    };
  }

  static analyzeStrengths(formation: TacticalFormation): string[] {
    const strengths: string[] = [];

    if (formation.style === 'attacking') {
      strengths.push('Strong offensive capability');
      strengths.push('High goal-scoring potential');
    }
    if (formation.style === 'defensive') {
      strengths.push('Solid defensive structure');
      strengths.push('Difficult to break down');
    }
    if (formation.intensity > 70) {
      strengths.push('High pressing intensity');
    }
    if (formation.width > 70) {
      strengths.push('Good width in attack');
    }

    if (strengths.length === 0) {
      strengths.push('Balanced tactical approach');
    }

    return strengths;
  }

  static analyzeWeaknesses(formation: TacticalFormation): string[] {
    const weaknesses: string[] = [];

    if (formation.style === 'attacking') {
      weaknesses.push('Vulnerable to counter-attacks');
    }
    if (formation.style === 'defensive') {
      weaknesses.push('Limited attacking options');
    }
    if (formation.intensity > 80) {
      weaknesses.push('Risk of player fatigue');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('No major tactical weaknesses identified');
    }

    return weaknesses;
  }

  static generateRecommendations(formation: TacticalFormation): string[] {
    const recommendations: string[] = [];

    if (formation.intensity < 40) {
      recommendations.push('Consider increasing pressing intensity');
    }
    if (formation.width < 40) {
      recommendations.push('Increase width to stretch opposition');
    }
    if (formation.tempo < 40) {
      recommendations.push('Consider faster tempo for more attacking play');
    }

    if (recommendations.length === 0) {
      recommendations.push('Current tactics are well-balanced');
    }

    return recommendations;
  }

  static async calculateTacticalFamiliarity(_clubId: number): Promise<number> {
    // Stub - would calculate based on how long the formation has been used
    return 50 + Math.floor(Math.random() * 30);
  }

  static async calculateSquadChemistry(clubId: number): Promise<number> {
    // Calculate based on player nationalities, clubs, etc.
    const players = await prisma.player.findMany({
      where: { currentClubId: clubId },
      take: 11
    });

    if (players.length < 11) return 50;

    // Check nationality diversity
    const nationalities = new Set(players.map(p => p.nationality));
    const chemistryBonus = Math.max(0, 11 - nationalities.size) * 3;

    return Math.min(100, 50 + chemistryBonus);
  }

  static async prepareForMatch(clubId: number, opponentId: number, _fixtureId: number): Promise<MatchPreparation> {
    const formation = await this.getTacticalFormation(clubId);
    const opponentFormation = await this.getTacticalFormation(opponentId);

    const opponent = await prisma.club.findUnique({
      where: { id: opponentId },
      include: { players: true }
    });

    const opponentAnalysis = await this.analyzeOpponent(opponent, opponentFormation);
    const tacticalPlan = this.createTacticalPlan(formation, opponentAnalysis);
    const playerInstructions = this.generatePlayerInstructions(formation, opponentAnalysis);
    const setPieces = await this.planSetPieces(clubId);
    const substitutions = await this.planSubstitutions(clubId);

    return {
      opponentAnalysis,
      tacticalPlan,
      playerInstructions,
      setPieces,
      substitutions
    };
  }

  static async analyzeOpponent(opponent: any, opponentFormation: any): Promise<any> {
    const form = await this.getRecentForm(opponent?.id);

    return {
      teamName: opponent?.name || 'Unknown',
      formation: opponentFormation?.formation || '4-4-2',
      form,
      strengths: opponentFormation ? this.analyzeStrengths(opponentFormation) : [],
      weaknesses: opponentFormation ? this.analyzeWeaknesses(opponentFormation) : []
    };
  }

  static async getRecentForm(clubId: number): Promise<any> {
    if (!clubId) return { wins: 0, draws: 0, losses: 0, form: 'Unknown' };

    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }],
        isPlayed: true
      },
      orderBy: { matchDate: 'desc' },
      take: 5
    });

    let wins = 0, draws = 0, losses = 0;
    for (const f of fixtures) {
      const isHome = f.homeTeamId === clubId;
      const goalsFor = isHome ? (f.homeScore || 0) : (f.awayScore || 0);
      const goalsAgainst = isHome ? (f.awayScore || 0) : (f.homeScore || 0);
      if (goalsFor > goalsAgainst) wins++;
      else if (goalsFor === goalsAgainst) draws++;
      else losses++;
    }

    return { wins, draws, losses, form: `W${wins}D${draws}L${losses}` };
  }

  static createTacticalPlan(formation: any, opponentAnalysis: any): any {
    return {
      approach: formation?.style || 'balanced',
      focus: opponentAnalysis?.weaknesses?.[0] || 'general play',
      keyPlayers: [],
      instructions: []
    };
  }

  static generatePlayerInstructions(_formation: any, _opponentAnalysis: any): any {
    return { general: 'Standard instructions' };
  }

  static async planSetPieces(clubId: number): Promise<any> {
    const players = await prisma.player.findMany({
      where: { currentClubId: clubId },
      take: 11
    });

    return {
      cornerTaker: players[0]?.firstName || 'TBD',
      freeKickTaker: players[0]?.firstName || 'TBD',
      penaltyTaker: players[0]?.firstName || 'TBD'
    };
  }

  static async planSubstitutions(_clubId: number): Promise<any> {
    return {
      plan: 'Standard substitution plan',
      triggers: ['fatigue', 'tactical change', 'injury']
    };
  }

  static generatePositionsFromFormation(formation: string): TacticalPosition[] {
    const positions: TacticalPosition[] = [];
    const parts = formation.split('-').map(Number);
    let posId = 1;

    // Goalkeeper
    positions.push({ id: posId++, position: 'GK', role: 'Goalkeeper', duty: 'Defend' });

    // Defenders
    const numDef = parts[0] || 4;
    for (let i = 0; i < numDef; i++) {
      positions.push({ id: posId++, position: 'DEF', role: 'Defender', duty: 'Defend' });
    }

    // Midfielders
    const numMid = parts[1] || 4;
    for (let i = 0; i < numMid; i++) {
      positions.push({ id: posId++, position: 'MID', role: 'Midfielder', duty: 'Support' });
    }

    // Attackers
    const numFwd = parts[2] || 2;
    for (let i = 0; i < numFwd; i++) {
      positions.push({ id: posId++, position: 'FWD', role: 'Forward', duty: 'Attack' });
    }

    return positions;
  }
}

export default AdvancedTacticsService;