import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

// O21 Divisie 2 clubs data
const o21Divisie2Clubs = [
  { name: 'Excelsior Onder 21', homeCity: 'Rotterdam' },
  { name: 'Helmond Sport Onder 21', homeCity: 'Helmond' },
  { name: 'FC Dordrecht Onder 21', homeCity: 'Dordrecht' },
  { name: 'Roda JC Onder 21', homeCity: 'Kerkrade' },
  { name: 'FC Den Bosch Onder 21', homeCity: 'Den Bosch' },
  { name: 'Almere City Onder 21', homeCity: 'Almere' },
  { name: 'MVV Maastricht Onder 21', homeCity: 'Maastricht' },
  { name: 'ADO Den Haag Onder 21', homeCity: 'Den Haag' }
];

export async function seedO21Divisie2(prisma: PrismaClient) {
  // Create O21 Divisie 2 league
  const league = await prisma.league.create({
    data: {
      name: 'O21 Divisie 2',
      tier: 'O21_DIVISIE_2',
      season: '2024-2025',
    },
  });

  // Create clubs and assign to league
  for (const club of o21Divisie2Clubs) {
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