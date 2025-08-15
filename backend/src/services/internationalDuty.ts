import { PrismaClient, Player } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Randomly selects eligible players for international duty and updates their status in the DB.
 * @param week The current week number (optional, for future use)
 * @param callUpRate The probability (0-1) that an eligible player is called up (default: 0.5)
 * @returns The list of called-up players
 */
export async function callUpPlayersForInternationalDuty(week?: number, callUpRate = 0.5): Promise<Player[]> {
  // Find all eligible players
  const eligiblePlayers = await prisma.player.findMany({
    where: {
      internationalCaps: { gt: 0 },
      injured: false,
      onInternationalDuty: false,
    },
  });

  // Randomly select players to call up
  const calledUp: Player[] = eligiblePlayers.filter(() => Math.random() < callUpRate);
  const calledUpIds = calledUp.map(p => p.id);

  // Update their status in the DB
  await prisma.player.updateMany({
    where: { id: { in: calledUpIds } },
    data: { onInternationalDuty: true },
  });

  return calledUp;
}

/**
 * Resets all players' onInternationalDuty flag to false (after the break)
 */
export async function resetInternationalDuty(): Promise<void> {
  await prisma.player.updateMany({
    where: { onInternationalDuty: true },
    data: { onInternationalDuty: false },
  });
} 