import { PrismaClient, Player } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Selects the best starting XI for a club using a 4-4-2 formation.
 * Considers skill, fitness, and availability (not injured, not on international duty, not on loan).
 * Returns an array of Player objects representing the best XI.
 */
export async function selectBestXIForClub(clubId: number): Promise<Player[]> {
  // Fetch all available players for the club, including their loans
  const players = await prisma.player.findMany({
    where: {
      clubId,
      injured: false,
      onInternationalDuty: false,
    },
    include: {
      loans: true,
    },
    orderBy: [
      { skill: 'desc' },
      { morale: 'desc' },
    ],
  });

  // Filter out players who are currently on loan (have an active loan)
  const availablePlayers = players.filter(p => !p.loans.some(loan => loan.status === 'active'));

  // Define a standard 4-4-2 formation
  const formation = [
    { position: 'GK', count: 1 },
    { position: 'DEF', count: 4 },
    { position: 'MID', count: 4 },
    { position: 'FWD', count: 2 },
  ];

  const selectedXI: Player[] = [];
  const usedPlayerIds = new Set<number>();

  for (const { position, count } of formation) {
    const candidates = availablePlayers.filter(p => p.position === position && !usedPlayerIds.has(p.id));
    for (let i = 0; i < count && i < candidates.length; i++) {
      const player = candidates[i];
      if (player) {
        selectedXI.push(player);
        usedPlayerIds.add(player.id);
      }
    }
  }

  // If not enough players for a position, fill with best available remaining players
  if (selectedXI.length < 11) {
    const remaining = availablePlayers.filter(p => !usedPlayerIds.has(p.id));
    for (let i = 0; i < 11 - selectedXI.length && i < remaining.length; i++) {
      selectedXI.push(remaining[i]);
    }
  }

  return selectedXI;
}

/**
 * Sets the starting XI for a club by creating or updating the StartingXI and StartingXISlot records.
 * @param clubId The club's ID
 * @param xi Array of { id: number, position: string, order: number }
 */
export async function setStartingXIForClub(clubId: number, xi: { id: number, position: string, order: number }[]): Promise<void> {
  // Find or create the StartingXI record for the club
  let startingXI = await prisma.startingXI.findUnique({
    where: { clubId },
    include: { slots: true },
  });

  if (!startingXI) {
    startingXI = {
      ...(await prisma.startingXI.create({
        data: {
          clubId,
        },
      })),
      slots: []
    };
  } else {
    // Delete existing slots
    await prisma.startingXISlot.deleteMany({ where: { startingXIId: startingXI.id } });
  }

  // Create new slots for the XI
  await prisma.startingXISlot.createMany({
    data: xi.map((p, idx) => ({
      startingXIId: startingXI!.id,
      playerId: p.id,
      position: p.position,
      order: p.order ?? idx + 1,
    })),
  });
} 