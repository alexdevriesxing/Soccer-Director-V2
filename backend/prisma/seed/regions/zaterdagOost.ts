import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper: Board expectation by position
function getBoardExpectation(position: number, total: number): string {
  if (position === 1) return 'Win the league';
  if (position === 2) return 'Promotion';
  if (position <= Math.ceil(total / 4)) return 'Play-off spot';
  if (position <= Math.ceil(total / 2)) return 'Top half';
  if (position <= total - 2) return 'Mid-table';
  return 'Avoid relegation';
}

// Helper: Morale by position
function getMorale(position: number, total: number): number {
  if (position === 1) return 80;
  if (position === 2) return 78;
  if (position <= Math.ceil(total / 4)) return 75;
  if (position <= Math.ceil(total / 2)) return 70;
  if (position <= total - 2) return 65;
  return 60;
}

// Helper: Kit colors (placeholder)
function getKitColors(name: string) {
  return {
    primary: '#1976d2',
    secondary: '#fff',
    accent: '#43a047',
  };
}

interface LeagueWithClubsArgs {
  name: string;
  division: string;
  region: string;
  clubs: { name: string; homeCity?: string; boardExpectation?: string }[];
}

async function createLeagueWithClubs({ name, division, region, clubs }: LeagueWithClubsArgs) {
  let league = await prisma.league.findFirst({
    where: {
      name,
      division,
      region,
      season: '2024/2025',
    },
  });
  if (!league) {
    league = await prisma.league.create({
      data: {
        name,
        division,
        region,
        tier: 'AMATEUR',
        season: '2024/2025',
      },
    });
  }
  for (let i = 0; i < clubs.length; i++) {
    const c = clubs[i];
    const kit = getKitColors(c.name);
    // Check if club already exists in this league
    const existing = await prisma.club.findFirst({
      where: { name: c.name, leagueId: league.id },
    });
    if (!existing) {
      await prisma.club.create({
        data: {
          name: c.name,
          leagueId: league.id,
          city: c.homeCity || null,
          boardExpectation: c.boardExpectation || getBoardExpectation(i + 1, clubs.length),
          morale: getMorale(i + 1, clubs.length),
          regionTag: 'Zaterdag Oost',
          primaryColor: kit.primary,
          homeKitShorts: kit.secondary,
          homeKitSocks: kit.accent,
          secondaryColor: kit.primary,
          awayKitShorts: kit.secondary,
          awayKitSocks: kit.accent,
        },
      });
    }
  }
}

async function main() {
  // Tweede Klasse G
  await createLeagueWithClubs({
    name: 'Tweede Klasse G',
    division: 'Tweede Klasse',
    region: 'Oost',
    clubs: [
      { name: "VV VRC" },
      { name: "RODA '46" },
      { name: "VV Nunspeet" },
      { name: "FC Horst" },
      { name: "CJVV" },
      { name: "VV Lunteren" },
      { name: "VV Zeewolde" },
      { name: "De Merino's" },
      { name: "VV Woudenberg" },
      { name: "NSC Nijkerk" },
      { name: "VV Hooglanderveen" },
      { name: "VV Renswoude" },
      { name: "ONA '53" },
    ],
  });
  // Tweede Klasse H
  await createLeagueWithClubs({
    name: 'Tweede Klasse H',
    division: 'Tweede Klasse',
    region: 'Oost',
    clubs: [
      { name: "VV Den Ham" },
      { name: "VV Vroomshoopse Boys" },
      { name: "FC Zutphen" },
      { name: "DOS '37" },
      { name: "VV SVI" },
      { name: "Rigtersbleek" },
      { name: "Hulzense Boys" },
      { name: "CVV Oranje Nassau A" },
      { name: "v.v. Hellendoorn" },
      { name: "VV Dieren" },
      { name: "SV Hatto Heim" },
      { name: "FC Suryoye-Mediterraneo" },
      { name: "SV Helios Deventer" },
    ],
  });
  // Derde Klasse L
  await createLeagueWithClubs({
    name: 'Derde Klasse L',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "De Valleivogels" },
      { name: "VVA Achterberg" },
      { name: "SV Harskamp" },
      { name: "SV Juliana '31" },
      { name: "OSS '20" },
      { name: "VVOP" },
      { name: "Candia '66" },
      { name: "Advendo '57" },
      { name: "ESA Rijkerswoerd" },
      { name: "SV De Paasberg" },
      { name: "WAVV" },
      { name: "AVW '66" },
      { name: "CDW" },
      { name: "SV Otterlo" },
    ],
  });
  // Derde Klasse M
  await createLeagueWithClubs({
    name: 'Derde Klasse M',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Robur et Velocitas" },
      { name: "Zwart-Wit '63" },
      { name: "VIOS V" },
      { name: "SP Teuge" },
      { name: "OWIOS" },
      { name: "VV Heerde" },
      { name: "AGOVV" },
      { name: "SV Epe" },
      { name: "VV SEH" },
      { name: "Groen Wit '62" },
      { name: "VV Hattem" },
      { name: "Swift '64" },
      { name: "SV Twello" },
      { name: "ZVV Be Quick" },
    ],
  });
  // Derde Klasse N
  await createLeagueWithClubs({
    name: 'Derde Klasse N',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SDC '12" },
      { name: "S.V. Losser" },
      { name: "Enter Vooruit" },
      { name: "Avanti W" },
      { name: "BWO" },
      { name: "SC Barbaros" },
      { name: "PH Almelo" },
      { name: "Tubantia" },
      { name: "Wilhelminaschool" },
      { name: "De Zweef" },
      { name: "SV Juliana '32" },
      { name: "VV Drienerlo" },
      { name: "VV DES" },
      { name: "VV Daarlerveen" },
    ],
  });
  // Derde Klasse O
  await createLeagueWithClubs({
    name: 'Derde Klasse O',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "CSV '28" },
      { name: "FC Zuidwolde" },
      { name: "MSC" },
      { name: "VV Hoogeveen" },
      { name: "SC Rouveen" },
      { name: "IJVV" },
      { name: "ASC '62" },
      { name: "VV De Weide" },
      { name: "Zwolsche Boys" },
      { name: "FC Ommen" },
      { name: "Dieze West" },
      { name: "ZAC" },
      { name: "SVM Marknesse" },
      { name: "Vitesse '63" },
    ],
  });
  // Vierde Klasse A
  await createLeagueWithClubs({
    name: 'Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV Wisch" },
      { name: "SC Woezik" },
      { name: "Concordia Wehl" },
      { name: "ZZC '20" },
      { name: "Kolping-Dynamo" },
      { name: "Excelsior Zetten" },
      { name: "De Treffers" },
      { name: "SV DFS Opheusden" },
      { name: "CSV Oranje Blauw" },
      { name: "SKV" },
      { name: "VV Alverna" },
      { name: "FC Lienden" },
    ],
  });
  // Vierde Klasse B
  await createLeagueWithClubs({
    name: 'Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Blauw Geel '55" },
      { name: "Fortissimo KSV" },
      { name: "SDS '55" },
      { name: "Sportclub Deventer" },
      { name: "Eerbeekse Boys" },
      { name: "Rood Wit '58" },
      { name: "EFC '58" },
      { name: "FC Jeugd" },
      { name: "OVC '85" },
      { name: "DVOV" },
      { name: "VV Barneveld" },
      { name: "Sportclub Brummen" },
    ],
  });
  // Vierde Klasse C
  await createLeagueWithClubs({
    name: 'Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "VV 's-Heerenbroek" },
      { name: "SV 't Harde" },
      { name: "VSCO '61" },
      { name: "ESC" },
      { name: "SV Lelystad '67" },
      { name: "VV Hulshorst" },
      { name: "DSV '61" },
      { name: "WZC Wapenveld" },
      { name: "VV Oene" },
      { name: "VEVO" },
      { name: "BAS" },
    ],
  });
  // Vierde Klasse D
  await createLeagueWithClubs({
    name: 'Vierde Klasse D',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "DVC Dedemsvaart" },
      { name: "VV Bergentheim" },
      { name: "Hardenberg '85" },
      { name: "ASV '57" },
      { name: "VV Bruchterveld" },
      { name: "Juventa '12" },
      { name: "VV Voorwaarts V" },
      { name: "Sportlust Vroomshoop" },
      { name: "VV Mariënberg" },
      { name: "VV Avereest" },
      { name: "VV DKB" },
      { name: "SC Lutten" },
    ],
  });
  // Vierde Klasse E
  await createLeagueWithClubs({
    name: 'Vierde Klasse E',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "FC Berghuizen" },
      { name: "SVVN" },
      { name: "RKSV Bornerbroek" },
      { name: "FC RDC" },
      { name: "ZVV De Esch" },
      { name: "HSC '21" },
      { name: "GVV Eilermark" },
      { name: "GFC" },
      { name: "Blauw Wit '66" },
      { name: "SV Rijssen" },
      { name: "HVV Hengelo" },
      { name: "SV Almelo" },
    ],
  });
  // Vijfde Klasse A
  await createLeagueWithClubs({
    name: 'Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SC Elistha" },
      { name: "VV Kesteren" },
      { name: "Quick 1888" },
      { name: "BVC '12" },
      { name: "SC Valburg" },
      { name: "VV Dodewaard" },
      { name: "SV Leones" },
      { name: "VV Ewijk" },
      { name: "SV AWC" },
      { name: "SVHA" },
      { name: "Uchta" },
    ],
  });
  // Vijfde Klasse B
  await createLeagueWithClubs({
    name: 'Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Arnhemse Boys Schuytgraaf" },
      { name: "VV Elspeet" },
      { name: "VV Stroe" },
      { name: "ASV Zuid Arnhem" },
      { name: "GVC" },
      { name: "Prins Bernhard" },
      { name: "Ede/Victoria" },
      { name: "VV De Veluwse Boys" },
      { name: "SCW ’23" },
      { name: "SDOO" },
      { name: "Wageningen" },
    ],
  });
  // Vijfde Klasse C
  await createLeagueWithClubs({
    name: 'Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "ASV Alexandria" },
      { name: "VV Gorssel" },
      { name: "SV Harfsen" },
      { name: "Oeken" },
      { name: "Dierensche Boys" },
      { name: "VV Doetinchem" },
      { name: "VV Sportclub Eefde" },
      { name: "Koninklijke UD 1875" },
      { name: "SV Almen" },
      { name: "Apeldoornse Boys" },
      { name: "ZVV '56" },
    ],
  });
  // Vijfde Klasse D
  await createLeagueWithClubs({
    name: 'Vijfde Klasse D',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "OWZ '24" },
      { name: "VV Wilsum" },
      { name: "EZC '84" },
      { name: "SV HTC" },
      { name: "SV Zalk" },
      { name: "Lemele" },
      { name: "MVV '69" },
      { name: "VV Wijthmen" },
      { name: "VV Kampen" },
      { name: "Sportclub Daarle" },
      { name: "VSW" },
      { name: "Noord Veluwe Boys" },
    ],
  });
  // Vijfde Klasse E
  await createLeagueWithClubs({
    name: 'Vijfde Klasse E',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Achilles Enschede" },
      { name: "AVC Heracles" },
      { name: "De Tubanters 1897" },
      { name: "EMOS" },
      { name: "FC Aramea" },
      { name: "Victoria '28" },
      { name: "SC Enschede" },
      { name: "PW 1885" },
      { name: "Blauwwitters BZSV" },
      { name: "SVV '91" },
      { name: "SV DRC '12" },
      { name: "SC Rijssen" },
    ],
  });
}

main().then(() => {
  console.log('Zaterdag Oost clubs seeded!');
  prisma.$disconnect();
}).catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 