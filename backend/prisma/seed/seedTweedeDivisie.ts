import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedTweedeDivisie(prisma: PrismaClient) {
  // Create Tweede Divisie league
  const tweedeDivisie = await prisma.league.create({
    data: {
      name: 'Tweede Divisie',
      tier: 'TWEEDE_DIVISIE',
      season: '2024-2025',
    },
  });

  // Tweede Divisie clubs
  const tweedeDivisieClubs = [
    { name: 'VV Noordwijk', homeCity: 'Noordwijk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL', regionTag: 'West 2' },
    { name: 'Jong Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL', regionTag: 'West 2' },
    { name: 'SVV Scheveningen', homeCity: 'Scheveningen', boardExpectation: 'Avoid relegation', morale: 45, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'ADO \'20', homeCity: 'Heemskerk', boardExpectation: 'Avoid relegation', morale: 42, form: 'LDLWL', regionTag: 'West 1' }
  ];

  for (const clubData of tweedeDivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: tweedeDivisie.id,
      },
    });
    await generatePlayersForClub(prisma, club.id);
  }

  console.log('Tweede Divisie and clubs seeded!');
} 