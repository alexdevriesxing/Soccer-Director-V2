// Player Trait Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Assign a trait to a player
export const assignTrait = async (playerId: number, trait: string) => {
  return prisma.playerTrait.create({
    data: { playerId, trait, revealed: false }
  });
};

// Reveal a trait for a player
export const revealTrait = async (traitId: number) => {
  return prisma.playerTrait.update({
    where: { id: traitId },
    data: { revealed: true }
  });
};

// Fetch all traits for a player
export const getTraitsForPlayer = async (playerId: number) => {
  return prisma.playerTrait.findMany({ where: { playerId } });
}; 