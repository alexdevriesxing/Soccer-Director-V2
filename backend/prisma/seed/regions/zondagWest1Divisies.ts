import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function getBoardExpectation(position: number): string {
  if (position === 1) return 'Win the league';
  if (position <= 3) return 'Promotion challenge';
  if (position <= 7) return 'Top half finish';
  if (position <= 11) return 'Mid-table';
  return 'Avoid relegation';
}

function getKitColors(clubName: string) {
  // Placeholder mapping, expand as needed
  return { shirt: '#1976d2', shorts: '#fff', socks: '#1976d2' };
}

function getHomeCity(clubName: string) {
  // Placeholder mapping, expand as needed
  return 'Noord-Holland';
}

async function main() {
  // Helper to create a league and its clubs
  async function createLeagueWithClubs({
    name,
    division,
    region,
    clubs
  }: {
    name: string;
    division: string;
    region: string;
    clubs: Array<any>;
  }) {
    const league = await prisma.league.create({
      data: {
        name,
        division,
        region,
        tier: 'AMATEUR',
        season: '2024/2025',
      },
    });
    for (let i = 0; i < clubs.length; i++) {
      const c = clubs[i];
      const club = await prisma.club.create({
        data: {
          name: c.name,
          homeCity: getHomeCity(c.name),
          homeKitShirt: getKitColors(c.name).shirt,
          homeKitShorts: getKitColors(c.name).shorts,
          homeKitSocks: getKitColors(c.name).socks,
          boardExpectation: getBoardExpectation(i + 1),
          morale: 70,
          form: c.Vorm || '',
          leagueId: league.id,
        },
      });
      await prisma.clubSeasonStats.create({
        data: {
          season: '2024/2025',
          clubId: club.id,
          leagueId: league.id,
          position: i + 1,
          played: c.Wed,
          won: c.W,
          drawn: c.G,
          lost: c.V,
          points: c.Pnt,
          goalsFor: c.DV,
          goalsAgainst: c.DT,
          goalDifference: c.DV - c.DT,
        },
      });
    }
  }

  // --- Tweede Klasse A ---
  await createLeagueWithClubs({
    name: 'Tweede Klasse A',
    division: 'Tweede Klasse',
    region: 'West 1',
    clubs: [
      { name: 'JVC', Wed: 26, W: 20, G: 2, V: 4, Pnt: 62, DV: 56, DT: 28 },
      { name: 'FC Uitgeest', Wed: 26, W: 14, G: 10, V: 2, Pnt: 52, DV: 51, DT: 32 },
      { name: 'VV Egmond', Wed: 26, W: 14, G: 5, V: 7, Pnt: 47, DV: 70, DT: 39 },
      { name: 'Westfriezen', Wed: 26, W: 12, G: 7, V: 7, Pnt: 43, DV: 51, DT: 47 },
      { name: 'VV Limmen', Wed: 26, W: 13, G: 3, V: 10, Pnt: 42, DV: 44, DT: 40 },
      { name: 'LSVV', Wed: 26, W: 11, G: 5, V: 10, Pnt: 38, DV: 46, DT: 46 },
      { name: 'KFC', Wed: 26, W: 11, G: 4, V: 11, Pnt: 37, DV: 61, DT: 47 },
      { name: 'SVAS', Wed: 26, W: 8, G: 9, V: 9, Pnt: 33, DV: 45, DT: 42 },
      { name: 'Always Forward', Wed: 26, W: 9, G: 6, V: 11, Pnt: 33, DV: 43, DT: 44 },
      { name: 'DSOV', Wed: 26, W: 8, G: 7, V: 11, Pnt: 31, DV: 40, DT: 45 },
      { name: 'IVV', Wed: 26, W: 7, G: 8, V: 11, Pnt: 29, DV: 53, DT: 52 },
      { name: 'Fortuna Wormerveer', Wed: 26, W: 9, G: 2, V: 15, Pnt: 29, DV: 41, DT: 56 },
      { name: "Meervogels '31", Wed: 26, W: 6, G: 5, V: 15, Pnt: 23, DV: 42, DT: 73 },
      { name: 'VV Flevo', Wed: 26, W: 2, G: 3, V: 21, Pnt: 9, DV: 35, DT: 87 },
    ],
  });

  // --- Tweede Klasse B ---
  await createLeagueWithClubs({
    name: 'Tweede Klasse B',
    division: 'Tweede Klasse',
    region: 'West 1',
    clubs: [
      { name: 'SV TOP', Wed: 24, W: 14, G: 5, V: 5, Pnt: 47, DV: 47, DT: 36 },
      { name: 'SV De Meer', Wed: 24, W: 11, G: 6, V: 7, Pnt: 39, DV: 49, DT: 41 },
      { name: 'RSV Antibarbari', Wed: 24, W: 11, G: 6, V: 7, Pnt: 39, DV: 47, DT: 39 },
      { name: 'VV Nieuwkuijk', Wed: 24, W: 11, G: 5, V: 8, Pnt: 38, DV: 51, DT: 45 },
      { name: 'Zwaluw VFC', Wed: 24, W: 10, G: 6, V: 8, Pnt: 36, DV: 38, DT: 28 },
      { name: "RKSV RODA '23", Wed: 24, W: 9, G: 8, V: 7, Pnt: 35, DV: 45, DT: 41 },
      { name: 'RKSV DCG', Wed: 24, W: 8, G: 10, V: 6, Pnt: 34, DV: 40, DT: 30 },
      { name: 'SDO', Wed: 24, W: 9, G: 6, V: 9, Pnt: 33, DV: 55, DT: 42 },
      { name: 'FC Abcoude', Wed: 24, W: 9, G: 6, V: 9, Pnt: 33, DV: 45, DT: 41 },
      { name: 'Beuningse Boys', Wed: 24, W: 9, G: 6, V: 9, Pnt: 33, DV: 36, DT: 34 },
      { name: 'WV-HEDW', Wed: 24, W: 8, G: 6, V: 10, Pnt: 30, DV: 48, DT: 45 },
      { name: 'SV Leones', Wed: 24, W: 7, G: 6, V: 11, Pnt: 27, DV: 35, DT: 54 },
      { name: 'SC Woezik', Wed: 24, W: 1, G: 2, V: 21, Pnt: 5, DV: 18, DT: 78 },
    ],
  });

  // --- Derde Klasse A ---
  await createLeagueWithClubs({
    name: 'Derde Klasse A',
    division: 'Derde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'ZAP', Wed: 26, W: 22, G: 2, V: 2, Pnt: 68, DV: 97, DT: 28 },
      { name: 'Schagen United', Wed: 26, W: 16, G: 5, V: 5, Pnt: 53, DV: 65, DT: 35 },
      { name: 'FC Den Helder', Wed: 26, W: 16, G: 3, V: 7, Pnt: 51, DV: 64, DT: 42 },
      { name: 'VV DWB', Wed: 26, W: 12, G: 7, V: 7, Pnt: 43, DV: 52, DT: 43 },
      { name: "VVS '46", Wed: 26, W: 12, G: 5, V: 9, Pnt: 41, DV: 67, DT: 47 },
      { name: 'VV Grasshoppers', Wed: 26, W: 10, G: 10, V: 6, Pnt: 40, DV: 52, DT: 39 },
      { name: 'De Valken', Wed: 26, W: 10, G: 5, V: 11, Pnt: 35, DV: 44, DT: 47 },
      { name: 'SV Spartanen', Wed: 26, W: 9, G: 4, V: 13, Pnt: 31, DV: 43, DT: 58 },
      { name: 'RKSV Sint George', Wed: 26, W: 7, G: 8, V: 11, Pnt: 29, DV: 41, DT: 45 },
      { name: 's.v. Enkhuizen', Wed: 26, W: 8, G: 5, V: 13, Pnt: 29, DV: 27, DT: 45 },
      { name: 'SV Kleine Sluis', Wed: 26, W: 8, G: 4, V: 14, Pnt: 28, DV: 35, DT: 46 },
      { name: 'VV Dirkshorn', Wed: 26, W: 5, G: 9, V: 12, Pnt: 24, DV: 43, DT: 63 },
      { name: 'VVW', Wed: 26, W: 5, G: 8, V: 13, Pnt: 23, DV: 31, DT: 61 },
      { name: 'DWOW', Wed: 26, W: 4, G: 1, V: 21, Pnt: 13, DV: 31, DT: 93 },
    ],
  });

  // --- Derde Klasse B ---
  await createLeagueWithClubs({
    name: 'Derde Klasse B',
    division: 'Derde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'BVC Bloemendaal', Wed: 24, W: 17, G: 3, V: 4, Pnt: 54, DV: 55, DT: 31 },
      { name: 'VV Bergen', Wed: 24, W: 15, G: 4, V: 5, Pnt: 49, DV: 59, DT: 34 },
      { name: 'VV Assendelft', Wed: 24, W: 14, G: 1, V: 9, Pnt: 43, DV: 44, DT: 32 },
      { name: 'RKVV Saenden', Wed: 24, W: 11, G: 9, V: 4, Pnt: 42, DV: 46, DT: 36 },
      { name: 'SV ROAC', Wed: 24, W: 9, G: 5, V: 10, Pnt: 32, DV: 38, DT: 33 },
      { name: 'SV De Meteoor', Wed: 24, W: 9, G: 5, V: 10, Pnt: 32, DV: 54, DT: 59 },
      { name: 'AVV Swift', Wed: 24, W: 10, G: 2, V: 12, Pnt: 32, DV: 43, DT: 49 },
      { name: 'Tos Actief', Wed: 24, W: 8, G: 7, V: 9, Pnt: 31, DV: 44, DT: 48 },
      { name: 'Sporting Krommenie', Wed: 24, W: 7, G: 7, V: 10, Pnt: 28, DV: 37, DT: 37 },
      { name: 'SC Hercules Zaandam', Wed: 24, W: 8, G: 3, V: 13, Pnt: 27, DV: 43, DT: 52 },
      { name: "Alliance '22", Wed: 24, W: 5, G: 10, V: 9, Pnt: 25, DV: 24, DT: 30 },
      { name: "WSV '30", Wed: 24, W: 6, G: 5, V: 13, Pnt: 23, DV: 44, DT: 53 },
      { name: 'DSS', Wed: 24, W: 4, G: 5, V: 15, Pnt: 17, DV: 27, DT: 64 },
    ],
  });

  // --- Vierde Klasse A ---
  await createLeagueWithClubs({
    name: 'Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'Alkmaarsche Boys', Wed: 22, W: 20, G: 1, V: 1, Pnt: 61, DV: 79, DT: 21 },
      { name: 'Alcmaria Victrix', Wed: 22, W: 18, G: 0, V: 4, Pnt: 54, DV: 83, DT: 27 },
      { name: 'VV Winkel', Wed: 22, W: 11, G: 4, V: 7, Pnt: 37, DV: 45, DT: 32 },
      { name: "Texel '94", Wed: 22, W: 11, G: 3, V: 8, Pnt: 36, DV: 46, DT: 37 },
      { name: 'Hugo Boys', Wed: 22, W: 8, G: 7, V: 7, Pnt: 31, DV: 36, DT: 34 },
      { name: 'Hollandia T', Wed: 22, W: 8, G: 5, V: 9, Pnt: 29, DV: 44, DT: 55 },
      { name: 'Con Zelo', Wed: 22, W: 8, G: 4, V: 10, Pnt: 28, DV: 35, DT: 39 },
      { name: 'SV De Koog', Wed: 22, W: 6, G: 4, V: 12, Pnt: 22, DV: 46, DT: 62 },
      { name: 'KSV Heerhugowaard', Wed: 22, W: 6, G: 4, V: 12, Pnt: 22, DV: 37, DT: 57 },
      { name: 'VV Succes', Wed: 22, W: 5, G: 6, V: 11, Pnt: 21, DV: 27, DT: 46 },
      { name: 'Duinrand S', Wed: 22, W: 5, G: 6, V: 11, Pnt: 21, DV: 41, DT: 67 },
      { name: 'VV Oudesluis', Wed: 22, W: 3, G: 2, V: 17, Pnt: 11, DV: 27, DT: 69 },
    ],
  });

  // --- Vierde Klasse B ---
  await createLeagueWithClubs({
    name: 'Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'SV De Rijp', Wed: 22, W: 18, G: 2, V: 2, Pnt: 56, DV: 67, DT: 24 },
      { name: 'Ilpendam', Wed: 22, W: 16, G: 2, V: 4, Pnt: 50, DV: 57, DT: 33 },
      { name: 'Victoria O', Wed: 22, W: 15, G: 2, V: 5, Pnt: 47, DV: 76, DT: 36 },
      { name: "SC Spirit '30", Wed: 22, W: 12, G: 3, V: 7, Pnt: 39, DV: 47, DT: 32 },
      { name: 'SEW', Wed: 22, W: 12, G: 1, V: 9, Pnt: 37, DV: 42, DT: 40 },
      { name: 'RKEDO', Wed: 22, W: 10, G: 1, V: 11, Pnt: 31, DV: 51, DT: 49 },
      { name: 'VV Woudia', Wed: 22, W: 10, G: 1, V: 11, Pnt: 31, DV: 39, DT: 42 },
      { name: 'SC Dynamo', Wed: 22, W: 6, G: 6, V: 10, Pnt: 24, DV: 42, DT: 53 },
      { name: 'Strandvogels', Wed: 22, W: 7, G: 3, V: 12, Pnt: 24, DV: 39, DT: 59 },
      { name: 'VV ALC', Wed: 22, W: 4, G: 3, V: 15, Pnt: 15, DV: 19, DT: 47 },
      { name: "Kwiek '78", Wed: 22, W: 3, G: 4, V: 15, Pnt: 13, DV: 30, DT: 54 },
      { name: 'VV MOC', Wed: 22, W: 3, G: 4, V: 15, Pnt: 13, DV: 13, DT: 53 },
    ],
  });

  // --- Vierde Klasse C ---
  await createLeagueWithClubs({
    name: 'Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'SV Rood-Wit Zaanstad', Wed: 20, W: 16, G: 1, V: 3, Pnt: 49, DV: 70, DT: 24 },
      { name: 'RCZ', Wed: 20, W: 12, G: 3, V: 5, Pnt: 39, DV: 46, DT: 25 },
      { name: 'SV DIOS', Wed: 20, W: 11, G: 4, V: 5, Pnt: 37, DV: 55, DT: 38 },
      { name: 'SV BSM', Wed: 20, W: 9, G: 3, V: 8, Pnt: 30, DV: 53, DT: 48 },
      { name: 'HOV/DJSCR', Wed: 20, W: 7, G: 5, V: 8, Pnt: 26, DV: 51, DT: 44 },
      { name: 'COAL', Wed: 20, W: 6, G: 8, V: 6, Pnt: 26, DV: 51, DT: 52 },
      { name: "Eendracht '82", Wed: 20, W: 7, G: 5, V: 8, Pnt: 26, DV: 42, DT: 49 },
      { name: 'AVV TOG', Wed: 20, W: 7, G: 4, V: 9, Pnt: 25, DV: 31, DT: 43 },
      { name: 'SV Nieuw-West United', Wed: 20, W: 6, G: 5, V: 9, Pnt: 22, DV: 34, DT: 50 },
      { name: 'PVC', Wed: 20, W: 3, G: 6, V: 11, Pnt: 15, DV: 33, DT: 47 },
      { name: "VV CTO '70", Wed: 20, W: 2, G: 4, V: 14, Pnt: 10, DV: 30, DT: 76 },
    ],
  });

  // --- Vijfde Klasse A ---
  await createLeagueWithClubs({
    name: 'Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'VV Callantsoog', Wed: 20, W: 17, G: 1, V: 2, Pnt: 52, DV: 78, DT: 15 },
      { name: "Geel Zwart '30", Wed: 20, W: 11, G: 8, V: 1, Pnt: 41, DV: 51, DT: 19 },
      { name: 'SV Petten', Wed: 20, W: 12, G: 3, V: 5, Pnt: 39, DV: 46, DT: 32 },
      { name: 'VV Nieuwe Niedorp', Wed: 20, W: 10, G: 4, V: 6, Pnt: 34, DV: 66, DT: 35 },
      { name: 'Vesdo', Wed: 20, W: 11, G: 1, V: 8, Pnt: 34, DV: 36, DT: 34 },
      { name: 'VZV', Wed: 20, W: 6, G: 7, V: 7, Pnt: 25, DV: 41, DT: 47 },
      { name: 'Zeemacht', Wed: 20, W: 8, G: 1, V: 11, Pnt: 24, DV: 35, DT: 62 },
      { name: 'VV Wieringerwaard', Wed: 20, W: 5, G: 7, V: 8, Pnt: 22, DV: 42, DT: 36 },
      { name: 'AGSV', Wed: 20, W: 5, G: 3, V: 12, Pnt: 18, DV: 39, DT: 64 },
      { name: 'Sint Boys', Wed: 20, W: 3, G: 4, V: 13, Pnt: 13, DV: 27, DT: 44 },
      { name: 'Kaagvogels', Wed: 20, W: 2, G: 1, V: 17, Pnt: 7, DV: 18, DT: 91 },
    ],
  });

  // --- Vijfde Klasse B ---
  await createLeagueWithClubs({
    name: 'Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'HSV Sport 1889', Wed: 18, W: 13, G: 3, V: 2, Pnt: 42, DV: 53, DT: 18 },
      { name: 'VV KGB', Wed: 18, W: 12, G: 2, V: 4, Pnt: 38, DV: 51, DT: 18 },
      { name: 'VV Oosthuizen', Wed: 18, W: 11, G: 4, V: 3, Pnt: 37, DV: 57, DT: 26 },
      { name: 'RKVV Zwaagdijk', Wed: 18, W: 10, G: 4, V: 4, Pnt: 34, DV: 38, DT: 19 },
      { name: 'VV Berkhout', Wed: 18, W: 8, G: 3, V: 7, Pnt: 27, DV: 38, DT: 42 },
      { name: "Apollo '68", Wed: 18, W: 8, G: 2, V: 8, Pnt: 26, DV: 39, DT: 38 },
      { name: 'SV DESS', Wed: 18, W: 5, G: 4, V: 9, Pnt: 19, DV: 24, DT: 35 },
      { name: 'Hauwert 65', Wed: 18, W: 5, G: 1, V: 12, Pnt: 16, DV: 16, DT: 38 },
      { name: 'SSV', Wed: 18, W: 4, G: 2, V: 12, Pnt: 14, DV: 22, DT: 56 },
      { name: 'VV WBSV', Wed: 18, W: 0, G: 3, V: 15, Pnt: 3, DV: 18, DT: 66 },
    ],
  });

  // --- Vijfde Klasse C ---
  await createLeagueWithClubs({
    name: 'Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'West 1',
    clubs: [
      { name: 'ZVV Zaandijk', Wed: 18, W: 14, G: 1, V: 3, Pnt: 43, DV: 75, DT: 14 },
      { name: 'HFC Heemstede', Wed: 18, W: 14, G: 0, V: 4, Pnt: 42, DV: 86, DT: 27 },
      { name: 'SV Rivierwijkers', Wed: 18, W: 11, G: 2, V: 5, Pnt: 35, DV: 41, DT: 21 },
      { name: 'OSC (A)', Wed: 18, W: 10, G: 1, V: 7, Pnt: 31, DV: 47, DT: 23 },
      { name: 'VV Kismet', Wed: 18, W: 4, G: 2, V: 12, Pnt: 14, DV: 37, DT: 86 },
      { name: "SV Geel Wit '20", Wed: 18, W: 3, G: 5, V: 10, Pnt: 11, DV: 29, DT: 59 },
      { name: 'Sloterdijk AVV', Wed: 18, W: 1, G: 1, V: 16, Pnt: 0, DV: 16, DT: 101 },
    ],
  });

  console.log('Seeded West 1 Zondag divisies!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 