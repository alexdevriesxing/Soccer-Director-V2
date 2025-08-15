import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedEredivisie(prisma: PrismaClient) {
  // Create Eredivisie league
  const eredivisie = await prisma.league.create({
    data: {
      name: 'Eredivisie',
      tier: 'EREDIVISIE',
      season: '2024-2025',
    },
  });

  // Eredivisie clubs
  const eredivisieClubs = [
    { name: 'AFC Ajax', homeCity: 'Amsterdam', boardExpectation: 'Win the league', morale: 85, form: 'WWWDL', regionTag: 'West 1' },
    { name: 'PSV Eindhoven', homeCity: 'Eindhoven', boardExpectation: 'Challenge for the title', morale: 82, form: 'WWWWD', regionTag: 'Zuid' },
    { name: 'Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Qualify for Europe', morale: 80, form: 'WDLWW', regionTag: 'West 2' },
    { name: 'AZ Alkmaar', homeCity: 'Alkmaar', boardExpectation: 'Top 6 finish', morale: 78, form: 'DLWWW', regionTag: 'West 1' },
    { name: 'FC Twente', homeCity: 'Enschede', boardExpectation: 'Top 8 finish', morale: 75, form: 'LWWDL', regionTag: 'Oost' },
    { name: 'SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 72, form: 'DLWWD', regionTag: 'Noord' },
    { name: 'FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Top 10 finish', morale: 70, form: 'WDLWL', regionTag: 'West 1' },
    { name: 'Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 65, form: 'LDLWW', regionTag: 'Oost' },
    { name: 'Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 68, form: 'WLDLW', regionTag: 'West 2' },
    { name: 'Heracles Almelo', homeCity: 'Almelo', boardExpectation: 'Avoid relegation', morale: 65, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 67, form: 'LWDLL', regionTag: 'Oost' },
    { name: 'NEC Nijmegen', homeCity: 'Nijmegen', boardExpectation: 'Avoid relegation', morale: 66, form: 'DLWDL', regionTag: 'Oost' },
    { name: 'Go Ahead Eagles', homeCity: 'Deventer', boardExpectation: 'Avoid relegation', morale: 64, form: 'LDLWL', regionTag: 'Oost' },
    { name: 'Fortuna Sittard', homeCity: 'Sittard', boardExpectation: 'Avoid relegation', morale: 63, form: 'LLDWL', regionTag: 'Zuid' },
    { name: 'RKC Waalwijk', homeCity: 'Waalwijk', boardExpectation: 'Avoid relegation', morale: 62, form: 'DLWLL', regionTag: 'Zuid' },
    { name: 'FC Volendam', homeCity: 'Volendam', boardExpectation: 'Avoid relegation', morale: 60, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'Excelsior', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 61, form: 'LDLWL', regionTag: 'West 2' },
    { name: 'Almere City FC', homeCity: 'Almere', boardExpectation: 'Avoid relegation', morale: 58, form: 'LLDLL', regionTag: 'West 1' }
  ];

  for (const clubData of eredivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: eredivisie.id,
      },
    });
    await generatePlayersForClub(prisma, club.id);
  }

  console.log('Eredivisie and clubs seeded!');
} 