import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 4A clubs data
const o21Divisie4AClubs = [
  { name: 'FC Den Bosch Onder 21', city: 'Den Bosch' },
  { name: 'FC Dordrecht Onder 21', city: 'Dordrecht' },
  { name: 'Helmond Sport Onder 21', city: 'Helmond' },
  { name: 'MVV Maastricht Onder 21', city: 'Maastricht' },
  { name: 'Roda JC Onder 21', city: 'Kerkrade' },
  { name: 'TOP Oss Onder 21', city: 'Oss' },
  { name: 'VVV-Venlo Onder 21', city: 'Venlo' },
  { name: 'Willem II Onder 21', city: 'Tilburg' }
];

export async function seedO21Divisie4A(prisma: PrismaClient) {
  // Create O21 Divisie 4A league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 4A',
      tier: 9, level: 'O21 Divisie 4',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie4AClubs) {
    const createdClub = await prisma.club.create({
      data: {
        name: club.name,
        city: club.city,
        leagueId: league.id,
      },
    });
    await generatePlayersForClub(prisma, createdClub.id, { o21: true });
  }
} 