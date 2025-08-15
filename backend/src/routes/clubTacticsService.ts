import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class DuplicateError extends Error {}

export class ClubTacticsService {
  // --- SET PIECE SPECIALISTS ---
  static async getSetPieceSpecialists(clubId: number) {
    const players = await prisma.player.findMany({ where: { clubId } });
    const playerIds = players.map(p => p.id);
    return prisma.setPieceSpecialists.findMany({ where: { playerId: { in: playerIds } } });
  }

  static async addSetPieceSpecialist(clubId: number, data: { playerId: number, type: string, skill: number, successRate?: number, attempts?: number, goals?: number }) {
    const { playerId, type, skill, successRate, attempts, goals } = data;
    // Validate player belongs to club
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player || player.clubId !== clubId) throw new ValidationError('Player does not belong to this club');
    // Prevent duplicate specialist for same player/type
    const existing = await prisma.setPieceSpecialists.findFirst({ where: { playerId, type } });
    if (existing) throw new DuplicateError('Specialist for this player and type already exists');
    const specialistData: any = { playerId, type, skill };
    if (successRate !== undefined) specialistData.successRate = successRate;
    if (attempts !== undefined) specialistData.attempts = attempts;
    if (goals !== undefined) specialistData.goals = goals;
    return prisma.setPieceSpecialists.create({ data: specialistData });
  }

  static async updateSetPieceSpecialist(id: number, data: { skill?: number }) {
    const specialist = await prisma.setPieceSpecialists.findUnique({ where: { id } });
    if (!specialist) throw new NotFoundError('Specialist not found');
    return prisma.setPieceSpecialists.update({ where: { id }, data });
  }

  static async deleteSetPieceSpecialist(id: number) {
    const specialist = await prisma.setPieceSpecialists.findUnique({ where: { id } });
    if (!specialist) throw new NotFoundError('Specialist not found');
    await prisma.setPieceSpecialists.delete({ where: { id } });
    return true;
  }

  // --- CLUB TACTICS & STRATEGY ---
  static async getTactics(clubId: number) {
    const formation = await prisma.clubFormation.findFirst({ where: { clubId } });
    const strategy = await prisma.clubStrategy.findFirst({ where: { clubId } });
    return { formation, strategy };
  }

  static async updateTactics(clubId: number, data: any) {
    const { formation, style, intensity, width, tempo, approach, defensiveStyle, attackingStyle, setPieces, marking } = data;
    let updatedFormation = null;
    let updatedStrategy = null;
    if (formation || style || intensity !== undefined || width !== undefined || tempo !== undefined) {
      const existing = await prisma.clubFormation.findFirst({ where: { clubId } });
      const formationData: any = {};
      if (formation !== undefined) formationData.formation = formation;
      if (style !== undefined) formationData.style = style;
      if (intensity !== undefined) formationData.intensity = intensity;
      if (width !== undefined) formationData.width = width;
      if (tempo !== undefined) formationData.tempo = tempo;
      if (existing) {
        updatedFormation = await prisma.clubFormation.update({ where: { id: existing.id }, data: formationData });
      } else {
        updatedFormation = await prisma.clubFormation.create({ data: { clubId, ...formationData } });
      }
    }
    if (approach || defensiveStyle || attackingStyle || setPieces || marking) {
      const existing = await prisma.clubStrategy.findFirst({ where: { clubId } });
      const strategyData: any = {};
      if (approach !== undefined) strategyData.approach = approach;
      if (defensiveStyle !== undefined) strategyData.defensiveStyle = defensiveStyle;
      if (attackingStyle !== undefined) strategyData.attackingStyle = attackingStyle;
      if (setPieces !== undefined) strategyData.setPieces = setPieces;
      if (marking !== undefined) strategyData.marking = marking;
      if (existing) {
        updatedStrategy = await prisma.clubStrategy.update({ where: { id: existing.id }, data: strategyData });
      } else {
        updatedStrategy = await prisma.clubStrategy.create({ data: { clubId, ...strategyData } });
      }
    }
    return { formation: updatedFormation, strategy: updatedStrategy };
  }
} 