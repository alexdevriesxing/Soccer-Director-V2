import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedEredivisie(prisma: PrismaClient) {
  // Create Eredivisie league
  const eredivisie = await prisma.league.create({
    data: {
      name: 'Eredivisie',
      tier: 1, level: 'Eredivisie',
    },
  });

  // Eredivisie clubs
  const eredivisieClubs = [
    { name: 'AFC Ajax', city: 'Amsterdam', boardExpectation: 'Win the league', morale: 85, form: 'WWWDL',  },
    { name: 'PSV Eindhoven', city: 'Eindhoven', boardExpectation: 'Challenge for the title', morale: 82, form: 'WWWWD',  },
    { name: 'Feyenoord', city: 'Rotterdam', boardExpectation: 'Qualify for Europe', morale: 80, form: 'WDLWW',  },
    { name: 'AZ Alkmaar', city: 'Alkmaar', boardExpectation: 'Top 6 finish', morale: 78, form: 'DLWWW',  },
    { name: 'FC Twente', city: 'Enschede', boardExpectation: 'Top 8 finish', morale: 75, form: 'LWWDL',  },
    { name: 'SC Heerenveen', city: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 72, form: 'DLWWD',  },
    { name: 'FC Utrecht', city: 'Utrecht', boardExpectation: 'Top 10 finish', morale: 70, form: 'WDLWL',  },
    { name: 'Vitesse', city: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 65, form: 'LDLWW',  },
    { name: 'Sparta Rotterdam', city: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 68, form: 'WLDLW',  },
    { name: 'Heracles Almelo', city: 'Almelo', boardExpectation: 'Avoid relegation', morale: 65, form: 'DLWLL',  },
    { name: 'PEC Zwolle', city: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 67, form: 'LWDLL',  },
    { name: 'NEC Nijmegen', city: 'Nijmegen', boardExpectation: 'Avoid relegation', morale: 66, form: 'DLWDL',  },
    { name: 'Go Ahead Eagles', city: 'Deventer', boardExpectation: 'Avoid relegation', morale: 64, form: 'LDLWL',  },
    { name: 'Fortuna Sittard', city: 'Sittard', boardExpectation: 'Avoid relegation', morale: 63, form: 'LLDWL',  },
    { name: 'RKC Waalwijk', city: 'Waalwijk', boardExpectation: 'Avoid relegation', morale: 62, form: 'DLWLL',  },
    { name: 'FC Volendam', city: 'Volendam', boardExpectation: 'Avoid relegation', morale: 60, form: 'LLDLL',  },
    { name: 'Excelsior', city: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 61, form: 'LDLWL',  },
    { name: 'Almere City FC', city: 'Almere', boardExpectation: 'Avoid relegation', morale: 58, form: 'LLDLL',  }
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