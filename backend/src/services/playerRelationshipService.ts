// Player Relationship Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a relationship between two players
export const createRelationship = async (playerAId: number, playerBId: number, type: string, strength: number) => {
  return prisma.playerRelationship.create({
    data: { playerAId, playerBId, type, strength }
  });
};

// Update relationship strength or type
export const updateRelationship = async (id: number, data: { type?: string; strength?: number }) => {
  return prisma.playerRelationship.update({
    where: { id },
    data
  });
};

// Fetch all relationships for a player
export const getRelationshipsForPlayer = async (playerId: number) => {
  return prisma.playerRelationship.findMany({
    where: { OR: [{ playerAId: playerId }, { playerBId: playerId }] }
  });
};

// Logic for forming/breaking relationships can be added here 