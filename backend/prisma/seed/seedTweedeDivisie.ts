import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedTweedeDivisie(prisma: PrismaClient) {
  // Create Tweede Divisie league
  const tweedeDivisie = await prisma.league.create({
    data: {
      name: 'Tweede Divisie',
      tier: 3, level: 'Tweede Divisie',
    },
  });

  // Tweede Divisie clubs
  const tweedeDivisieClubs = [
    { name: 'VV Noordwijk', city: 'Noordwijk', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL',  },
    { name: 'Jong Sparta Rotterdam', city: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL',  },
    { name: 'SVV Scheveningen', city: 'Scheveningen', boardExpectation: 'Avoid relegation', morale: 45, form: 'DLWLL',  },
    { name: 'ADO \'20', city: 'Heemskerk', boardExpectation: 'Avoid relegation', morale: 42, form: 'LDLWL',  }
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