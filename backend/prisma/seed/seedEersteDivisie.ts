import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedEersteDivisie(prisma: PrismaClient) {
  // Create Eerste Divisie league
  const eersteDivisie = await prisma.league.create({
    data: {
      name: 'Eerste Divisie',
      tier: 'EERSTE_DIVISIE',
      season: '2024-2025',
    },
  });

  // Eerste Divisie clubs
  const eersteDivisieClubs = [
    { name: 'Willem II', homeCity: 'Tilburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'Zuid' },
    { name: 'FC Groningen', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 82, form: 'WWWDL', regionTag: 'Noord' },
    { name: 'Roda JC', homeCity: 'Kerkrade', boardExpectation: 'Play-off spot', morale: 78, form: 'WWDLW', regionTag: 'Zuid' },
    { name: 'NAC Breda', homeCity: 'Breda', boardExpectation: 'Play-off spot', morale: 76, form: 'WDLWW', regionTag: 'Zuid' },
    { name: 'FC Emmen', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 74, form: 'DLWWW', regionTag: 'Noord' },
    { name: 'Helmond Sport', homeCity: 'Helmond', boardExpectation: 'Mid-table finish', morale: 70, form: 'LWWDL', regionTag: 'Zuid' },
    { name: 'MVV Maastricht', homeCity: 'Maastricht', boardExpectation: 'Mid-table finish', morale: 68, form: 'DLWWD', regionTag: 'Zuid' },
    { name: 'FC Den Bosch', homeCity: 'Den Bosch', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW', regionTag: 'Zuid' },
    { name: 'FC Dordrecht', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 64, form: 'LWWDL', regionTag: 'West 2' },
    { name: 'Jong Ajax', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWLL', regionTag: 'West 1' },
    { name: 'Jong PSV', homeCity: 'Eindhoven', boardExpectation: 'Mid-table finish', morale: 60, form: 'LLDWL', regionTag: 'Zuid' },
    { name: 'Jong AZ', homeCity: 'Alkmaar', boardExpectation: 'Mid-table finish', morale: 58, form: 'LDLWL', regionTag: 'West 1' },
    { name: 'Jong FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LLDLL', regionTag: 'West 1' },
    { name: 'Jong Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL', regionTag: 'West 2' },
    { name: 'Jong Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LDLWL', regionTag: 'Oost' },
    { name: 'Jong Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDLL', regionTag: 'West 2' },
    { name: 'Jong FC Twente', homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 48, form: 'DLWLL', regionTag: 'Oost' },
    { name: 'Jong SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL', regionTag: 'Noord' },
    { name: 'Jong PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL', regionTag: 'Oost' }
  ];

  for (const clubData of eersteDivisieClubs) {
    const club = await prisma.club.create({
      data: {
        ...clubData,
        leagueId: eersteDivisie.id,
      },
    });
    await generatePlayersForClub(prisma, club.id);
  }

  console.log('Eerste Divisie and clubs seeded!');
} 