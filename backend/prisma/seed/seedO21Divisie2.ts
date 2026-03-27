import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 2 clubs data
const o21Divisie2Clubs = [
  { name: 'Excelsior Onder 21', city: 'Rotterdam' },
  { name: 'Helmond Sport Onder 21', city: 'Helmond' },
  { name: 'FC Dordrecht Onder 21', city: 'Dordrecht' },
  { name: 'Roda JC Onder 21', city: 'Kerkrade' },
  { name: 'FC Den Bosch Onder 21', city: 'Den Bosch' },
  { name: 'Almere City Onder 21', city: 'Almere' },
  { name: 'MVV Maastricht Onder 21', city: 'Maastricht' },
  { name: 'ADO Den Haag Onder 21', city: 'Den Haag' }
];

export async function seedO21Divisie2(prisma: PrismaClient) {
  // Create O21 Divisie 2 league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 2',
      tier: 7, level: 'O21 Divisie 2',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie2Clubs) {
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