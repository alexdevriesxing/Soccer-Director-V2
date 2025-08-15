import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedDerdeDivisie(prisma: PrismaClient) {
  // Create Derde Divisie league
  const derdeDivisie = await prisma.league.create({
    data: {
      name: 'Derde Divisie',
      tier: 'DERDE_DIVISIE',
      season: '2024-2025',
    },
  });

  // Derde Divisie clubs
  const derdeDivisieClubs = [
    { name: 'VV IJsselmeervogels', homeCity: 'Spakenburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'West 1' },
    { name: 'Harkemase Boys', homeCity: 'Harkema', boardExpectation: 'Play-off spot', morale: 78, form: 'WWWDL', regionTag: 'Noord' },
    { name: 'Sportlust \'46', homeCity: 'Woerden', boardExpectation: 'Play-off spot', morale: 76, form: 'WWDLW', regionTag: 'West 1' },
    { name: 'DVS \'33 Ermelo', homeCity: 'Ermelo', boardExpectation: 'Play-off spot', morale: 74, form: 'WDLWW', regionTag: 'Oost' },
    { name: 'Sparta Nijkerk', homeCity: 'Nijkerk', boardExpectation: 'Mid-table finish', morale: 70, form: 'DLWWW', regionTag: 'Oost' },
    { name: 'USV Hercules', homeCity: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 68, form: 'LWWDL', regionTag: 'West 1' },
    { name: 'DOVO', homeCity: 'Veenendaal', boardExpectation: 'Play-off spot', morale: 72, form: 'DLWWD', regionTag: 'West 1' },
    { name: 'SC Genemuiden', homeCity: 'Genemuiden', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW', regionTag: 'Oost' }
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