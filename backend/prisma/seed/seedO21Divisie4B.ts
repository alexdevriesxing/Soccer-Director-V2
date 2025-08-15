import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 4B clubs data
const o21Divisie4BClubs = [
  { name: 'Almere City Onder 21', homeCity: 'Almere' },
  { name: 'De Graafschap Onder 21', homeCity: 'Doetinchem' },
  { name: 'Excelsior Onder 21', homeCity: 'Rotterdam' },
  { name: 'FC Emmen Onder 21', homeCity: 'Emmen' },
  { name: 'FC Volendam Onder 21', homeCity: 'Volendam' },
  { name: 'Go Ahead Eagles Onder 21', homeCity: 'Deventer' },
  { name: 'SC Cambuur Onder 21', homeCity: 'Leeuwarden' },
  { name: 'SC Telstar Onder 21', homeCity: 'Velsen' }
];

export async function seedO21Divisie4B(prisma: PrismaClient) {
  // Create O21 Divisie 4B league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 4B',
      tier: 'O21_DIVISIE_4B',
      season: '2024-2025',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie4BClubs) {
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