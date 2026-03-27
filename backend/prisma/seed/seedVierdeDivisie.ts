import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedVierdeDivisie(prisma: PrismaClient) {
  // Create Vierde Divisie league
  const vierdeDivisie = await prisma.league.create({
    data: {
      name: 'Vierde Divisie',
      tier: 5, level: 'Vierde Divisie',
    },
  });

  // Vierde Divisie clubs (add your actual club data here)
  const vierdeDivisieClubs = [
    // Example clubs, replace with actual data as needed
    { name: 'Club A', city: 'City A', boardExpectation: 'Mid-table', morale: 70, form: 'WDLWL',  },
    { name: 'Club B', city: 'City B', boardExpectation: 'Avoid relegation', morale: 65, form: 'LLDWL',  }
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