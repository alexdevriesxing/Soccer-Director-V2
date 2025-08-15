// Player Injury Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Log a new injury for a player
export const logInjury = async (playerId: number, type: string, severity: string, startDate: Date, endDate?: Date, description?: string) => {
  return prisma.playerInjury.create({
    data: { playerId, type, severity, startDate, endDate, description }
  });
};

// Update an injury (e.g., set endDate or description)
export const updateInjury = async (injuryId: number, data: { endDate?: Date; description?: string }) => {
  return prisma.playerInjury.update({
    where: { id: injuryId },
    data
  });
};

// Fetch all injuries for a player
export const getInjuriesForPlayer = async (playerId: number) => {
  return prisma.playerInjury.findMany({ where: { playerId } });
}; 