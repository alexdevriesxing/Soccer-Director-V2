import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotFoundError extends Error { }
export class ValidationError extends Error { }
export class DuplicateError extends Error { }

// In-memory storage for tactics (these models don't exist in Prisma schema yet)
interface SetPieceSpecialist {
  id: number;
  playerId: number;
  type: string;
  skill: number;
  successRate?: number;
  attempts?: number;
  goals?: number;
}

interface ClubTactics {
  clubId: number;
  formation?: string;
  style?: string;
  intensity?: number;
  width?: number;
  tempo?: number;
  approach?: string;
  defensiveStyle?: string;
  attackingStyle?: string;
  setPieces?: string;
  marking?: string;
}

// In-memory stores (would be replaced with Prisma once models are added)
const specialistsStore: Map<number, SetPieceSpecialist[]> = new Map();
const tacticsStore: Map<number, ClubTactics> = new Map();
let nextSpecialistId = 1;

export class ClubTacticsService {
  // --- SET PIECE SPECIALISTS ---
  static async getSetPieceSpecialists(clubId: number) {
    // Get players for the club
    const players = await prisma.player.findMany({ where: { currentClubId: clubId } });
    const playerIds = new Set(players.map(p => p.id));

    // Return specialists for those players
    const clubSpecialists = specialistsStore.get(clubId) || [];
    return clubSpecialists.filter(s => playerIds.has(s.playerId));
  }

  static async addSetPieceSpecialist(clubId: number, data: { playerId: number, type: string, skill: number, successRate?: number, attempts?: number, goals?: number }) {
    const { playerId, type, skill, successRate, attempts, goals } = data;

    // Validate player belongs to club
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player || player.currentClubId !== clubId) throw new ValidationError('Player does not belong to this club');

    // Get or create club specialists array
    let clubSpecialists = specialistsStore.get(clubId);
    if (!clubSpecialists) {
      clubSpecialists = [];
      specialistsStore.set(clubId, clubSpecialists);
    }

    // Prevent duplicate specialist for same player/type
    const existing = clubSpecialists.find(s => s.playerId === playerId && s.type === type);
    if (existing) throw new DuplicateError('Specialist for this player and type already exists');

    const specialist: SetPieceSpecialist = {
      id: nextSpecialistId++,
      playerId,
      type,
      skill,
      successRate,
      attempts,
      goals
    };

    clubSpecialists.push(specialist);
    return specialist;
  }

  static async updateSetPieceSpecialist(id: number, data: { skill?: number }) {
    for (const [_clubId, specialists] of specialistsStore) {
      const specialist = specialists.find(s => s.id === id);
      if (specialist) {
        if (data.skill !== undefined) specialist.skill = data.skill;
        return specialist;
      }
    }
    throw new NotFoundError('Specialist not found');
  }

  static async deleteSetPieceSpecialist(id: number) {
    for (const [_clubId, specialists] of specialistsStore) {
      const index = specialists.findIndex(s => s.id === id);
      if (index !== -1) {
        specialists.splice(index, 1);
        return true;
      }
    }
    throw new NotFoundError('Specialist not found');
  }

  // --- CLUB TACTICS & STRATEGY ---
  static async getTactics(clubId: number) {
    const tactics = tacticsStore.get(clubId);
    return {
      formation: tactics ? { clubId, formation: tactics.formation, style: tactics.style, intensity: tactics.intensity, width: tactics.width, tempo: tactics.tempo } : null,
      strategy: tactics ? { clubId, approach: tactics.approach, defensiveStyle: tactics.defensiveStyle, attackingStyle: tactics.attackingStyle, setPieces: tactics.setPieces, marking: tactics.marking } : null
    };
  }

  static async updateTactics(clubId: number, data: Partial<ClubTactics>) {
    let tactics = tacticsStore.get(clubId);
    if (!tactics) {
      tactics = { clubId };
      tacticsStore.set(clubId, tactics);
    }

    // Update formation fields
    if (data.formation !== undefined) tactics.formation = data.formation;
    if (data.style !== undefined) tactics.style = data.style;
    if (data.intensity !== undefined) tactics.intensity = data.intensity;
    if (data.width !== undefined) tactics.width = data.width;
    if (data.tempo !== undefined) tactics.tempo = data.tempo;

    // Update strategy fields
    if (data.approach !== undefined) tactics.approach = data.approach;
    if (data.defensiveStyle !== undefined) tactics.defensiveStyle = data.defensiveStyle;
    if (data.attackingStyle !== undefined) tactics.attackingStyle = data.attackingStyle;
    if (data.setPieces !== undefined) tactics.setPieces = data.setPieces;
    if (data.marking !== undefined) tactics.marking = data.marking;

    return {
      formation: { clubId, formation: tactics.formation, style: tactics.style, intensity: tactics.intensity, width: tactics.width, tempo: tactics.tempo },
      strategy: { clubId, approach: tactics.approach, defensiveStyle: tactics.defensiveStyle, attackingStyle: tactics.attackingStyle, setPieces: tactics.setPieces, marking: tactics.marking }
    };
  }
}