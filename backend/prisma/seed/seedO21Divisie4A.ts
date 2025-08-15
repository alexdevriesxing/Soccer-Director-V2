import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 4A clubs data
const o21Divisie4AClubs = [
  { name: 'FC Den Bosch Onder 21', homeCity: 'Den Bosch' },
  { name: 'FC Dordrecht Onder 21', homeCity: 'Dordrecht' },
  { name: 'Helmond Sport Onder 21', homeCity: 'Helmond' },
  { name: 'MVV Maastricht Onder 21', homeCity: 'Maastricht' },
  { name: 'Roda JC Onder 21', homeCity: 'Kerkrade' },
  { name: 'TOP Oss Onder 21', homeCity: 'Oss' },
  { name: 'VVV-Venlo Onder 21', homeCity: 'Venlo' },
  { name: 'Willem II Onder 21', homeCity: 'Tilburg' }
];

export async function seedO21Divisie4A(prisma: PrismaClient) {
  // Create O21 Divisie 4A league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 4A',
      tier: 'O21_DIVISIE_4A',
      season: '2024-2025',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie4AClubs) {
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