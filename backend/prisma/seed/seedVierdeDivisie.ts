import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedVierdeDivisie(prisma: PrismaClient) {
  // Create Vierde Divisie league
  const vierdeDivisie = await prisma.league.create({
    data: {
      name: 'Vierde Divisie',
      tier: 'VIERDE_DIVISIE',
      season: '2024-2025',
    },
  });

  // Vierde Divisie clubs (add your actual club data here)
  const vierdeDivisieClubs = [
    // Example clubs, replace with actual data as needed
    { name: 'Club A', homeCity: 'City A', boardExpectation: 'Mid-table', morale: 70, form: 'WDLWL', regionTag: 'Noord' },
    { name: 'Club B', homeCity: 'City B', boardExpectation: 'Avoid relegation', morale: 65, form: 'LLDWL', regionTag: 'Oost' }
  ];

  for (const clubData of vierdeDivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: vierdeDivisie.id,
      },
    });
    await generatePlayersForClub(prisma, club.id);
  }

  console.log('Vierde Divisie and clubs seeded!');
} 