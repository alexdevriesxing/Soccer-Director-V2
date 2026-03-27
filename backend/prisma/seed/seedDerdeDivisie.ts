import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedDerdeDivisie(prisma: PrismaClient) {
  // Create Derde Divisie league
  const derdeDivisie = await prisma.league.create({
    data: {
      name: 'Derde Divisie',
      tier: 4, level: 'Derde Divisie',
    },
  });

  // Derde Divisie clubs
  const derdeDivisieClubs = [
    { name: 'VV IJsselmeervogels', city: 'Spakenburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD',  },
    { name: 'Harkemase Boys', city: 'Harkema', boardExpectation: 'Play-off spot', morale: 78, form: 'WWWDL',  },
    { name: 'Sportlust \'46', city: 'Woerden', boardExpectation: 'Play-off spot', morale: 76, form: 'WWDLW',  },
    { name: 'DVS \'33 Ermelo', city: 'Ermelo', boardExpectation: 'Play-off spot', morale: 74, form: 'WDLWW',  },
    { name: 'Sparta Nijkerk', city: 'Nijkerk', boardExpectation: 'Mid-table finish', morale: 70, form: 'DLWWW',  },
    { name: 'USV Hercules', city: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 68, form: 'LWWDL',  },
    { name: 'DOVO', city: 'Veenendaal', boardExpectation: 'Play-off spot', morale: 72, form: 'DLWWD',  },
    { name: 'SC Genemuiden', city: 'Genemuiden', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW',  }
  ];

  for (const clubData of derdeDivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: derdeDivisie.id,
      },
    });
    await generatePlayersForClub(prisma, club.id);
  }

  console.log('Derde Divisie and clubs seeded!');
} 