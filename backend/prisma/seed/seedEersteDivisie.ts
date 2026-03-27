import { PrismaClient } from '@prisma/client';
import { generatePlayersForClub } from './generatePlayers';

export async function seedEersteDivisie(prisma: PrismaClient) {
  // Create Eerste Divisie league
  const eersteDivisie = await prisma.league.create({
    data: {
      name: 'Eerste Divisie',
      tier: 2, level: 'Keuken Kampioen Divisie',
    },
  });

  // Eerste Divisie clubs
  const eersteDivisieClubs = [
    { name: 'Willem II', city: 'Tilburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD',  },
    { name: 'FC Groningen', city: 'Groningen', boardExpectation: 'Promotion', morale: 82, form: 'WWWDL',  },
    { name: 'Roda JC', city: 'Kerkrade', boardExpectation: 'Play-off spot', morale: 78, form: 'WWDLW',  },
    { name: 'NAC Breda', city: 'Breda', boardExpectation: 'Play-off spot', morale: 76, form: 'WDLWW',  },
    { name: 'FC Emmen', city: 'Emmen', boardExpectation: 'Play-off spot', morale: 74, form: 'DLWWW',  },
    { name: 'Helmond Sport', city: 'Helmond', boardExpectation: 'Mid-table finish', morale: 70, form: 'LWWDL',  },
    { name: 'MVV Maastricht', city: 'Maastricht', boardExpectation: 'Mid-table finish', morale: 68, form: 'DLWWD',  },
    { name: 'FC Den Bosch', city: 'Den Bosch', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW',  },
    { name: 'FC Dordrecht', city: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 64, form: 'LWWDL',  },
    { name: 'Jong Ajax', city: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWLL',  },
    { name: 'Jong PSV', city: 'Eindhoven', boardExpectation: 'Mid-table finish', morale: 60, form: 'LLDWL',  },
    { name: 'Jong AZ', city: 'Alkmaar', boardExpectation: 'Mid-table finish', morale: 58, form: 'LDLWL',  },
    { name: 'Jong FC Utrecht', city: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LLDLL',  },
    { name: 'Jong Feyenoord', city: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL',  },
    { name: 'Jong Vitesse', city: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LDLWL',  },
    { name: 'Jong Sparta Rotterdam', city: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDLL',  },
    { name: 'Jong FC Twente', city: 'Enschede', boardExpectation: 'Avoid relegation', morale: 48, form: 'DLWLL',  },
    { name: 'Jong SC Heerenveen', city: 'Heerenveen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL',  },
    { name: 'Jong PEC Zwolle', city: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL',  }
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