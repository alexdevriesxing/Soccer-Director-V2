import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 3 clubs data
const o21Divisie3Clubs = [
  { name: 'FC Volendam Onder 21', homeCity: 'Volendam' },
  { name: 'TOP Oss Onder 21', homeCity: 'Oss' },
  { name: 'SC Telstar Onder 21', homeCity: 'Velsen' },
  { name: 'FC Eindhoven Onder 21', homeCity: 'Eindhoven' },
  { name: 'FC Emmen Onder 21', homeCity: 'Emmen' },
  { name: 'FC Utrecht Onder 21', homeCity: 'Utrecht' },
  { name: 'NAC Breda Onder 21', homeCity: 'Breda' },
  { name: 'NEC Nijmegen Onder 21', homeCity: 'Nijmegen' }
];

export async function seedO21Divisie3(prisma: PrismaClient) {
  // Create O21 Divisie 3 league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 3',
      tier: 'O21_DIVISIE_3',
      season: '2024-2025',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie3Clubs) {
    const createdClub = await prisma.club.create({
      data: {
        name: club.name,
        homeCity: club.homeCity,
        leagueId: league.id,
      },
    });
    await generatePlayersForClub(prisma, createdClub.id, { o21: true });
  }
} 