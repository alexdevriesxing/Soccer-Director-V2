// International Duty Service - stub since Player model doesn't have onInternationalDuty field

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In-memory tracking of international duty
const internationalDutyPlayers: Set<number> = new Set();

export async function callUpPlayersForInternationalDuty(_week?: number) {
  // Get players with high ability who could be called up
  const eligiblePlayers = await prisma.player.findMany({
    where: {
      currentAbility: { gte: 70 }
    },
    take: 50
  });

  // Randomly call up some players
  const calledUp: number[] = [];
  for (const player of eligiblePlayers) {
    if (Math.random() < 0.1) { // 10% chance
      internationalDutyPlayers.add(player.id);
      calledUp.push(player.id);
    }
  }

  return { calledUp, count: calledUp.length };
}

export async function releasePlayersFromInternationalDuty() {
  const released = Array.from(internationalDutyPlayers);
  internationalDutyPlayers.clear();
  return { released, count: released.length };
}

export function isPlayerOnInternationalDuty(playerId: number): boolean {
  return internationalDutyPlayers.has(playerId);
}

export async function getPlayersOnInternationalDuty() {
  const playerIds = Array.from(internationalDutyPlayers);
  if (playerIds.length === 0) return [];

  return prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, firstName: true, lastName: true, nationality: true, currentAbility: true }
  });
}