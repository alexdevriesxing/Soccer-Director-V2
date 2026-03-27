import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Squad Selection Service
// Handles starting XI and player selection

export async function getAvailablePlayers(clubId: number) {
  const players = await prisma.player.findMany({
    where: {
      currentClubId: clubId,
      isInjured: false
    },
    orderBy: { currentAbility: 'desc' }
  });

  // Filter out players on loan to other clubs
  const availablePlayers = players.filter(_p => {
    // Player is available if they're at the club and not injured
    return true; // Simplified - loans would need separate checking
  });

  return availablePlayers;
}

export async function getBestXI(clubId: number) {
  const players = await getAvailablePlayers(clubId);

  // Get best player for each position
  const positions = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'CM', 'LW', 'RW', 'ST'];
  const bestXI: any[] = [];
  const usedIds = new Set<number>();

  for (const pos of positions) {
    const positionGroup = pos === 'CB' ? ['CB'] :
      pos === 'CM' ? ['CM', 'DM', 'AM'] :
        [pos];

    const available = players.filter(p =>
      positionGroup.includes(p.position) && !usedIds.has(p.id)
    );

    if (available.length > 0) {
      const best = available.sort((a, b) => (b.currentAbility || 0) - (a.currentAbility || 0))[0];
      bestXI.push({ ...best, selectedPosition: pos });
      usedIds.add(best.id);
    } else {
      // Fill with any available player
      const anyPlayer = players.find(p => !usedIds.has(p.id));
      if (anyPlayer) {
        bestXI.push({ ...anyPlayer, selectedPosition: pos });
        usedIds.add(anyPlayer.id);
      }
    }
  }

  return bestXI;
}

export async function getStartingXI(clubId: number) {
  const existing = await prisma.startingXI.findUnique({
    where: { clubId }
  });

  if (!existing) {
    return null;
  }

  return existing;
}

export async function saveStartingXI(clubId: number, playerIds: number[]) {
  // Validate that all players belong to the club
  const players = await prisma.player.findMany({
    where: {
      id: { in: playerIds },
      currentClubId: clubId
    }
  });

  if (players.length !== playerIds.length) {
    throw new Error('Some players do not belong to this club');
  }

  // Upsert starting XI
  const startingXI = await prisma.startingXI.upsert({
    where: { clubId },
    create: {
      clubId,
      slots: JSON.stringify(playerIds) // Storing player IDs as JSON string
    },
    update: {
      slots: JSON.stringify(playerIds)
    }
  });

  return startingXI;
}

export async function getSubstitutes(clubId: number) {
  const allPlayers = await getAvailablePlayers(clubId);
  // const starting = await getStartingXI(clubId);

  // Get players not in starting XI
  // For now, return players beyond the first 11
  return allPlayers.slice(11, 18);
}