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
  if (position <= Math.ceil(total / 2)) return 72;
  if (position <= total - 2) return 68;
  return 65;
}

// Helper: Kit colors (use defaults, can be customized per club)
function getKitColors(name: string) {
  // TODO: Add real kit colors if available
  return {
    homeKitShirt: '#ffb347',
    homeKitShorts: '#cc8e35',
    homeKitSocks: '#ffb347',
    awayKitShirt: '#4ecdc4',
    awayKitShorts: '#3da89e',
    awayKitSocks: '#4ecdc4',
  };
}

// Helper: Home city (stub, can be improved)
function getHomeCity(name: string): string {
  // Try to extract city from club name, fallback to empty
  const match = name.match(/\b([A-Z][a-z]+)$/);
  return match ? match[1] : '';
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
    await prisma.club.create({
      data: {
        name: c.name,
        homeCity: c.homeCity || getHomeCity(c.name),
        boardExpectation: c.boardExpectation || getBoardExpectation(i + 1, clubs.length),
        morale: getMorale(i + 1, clubs.length),
        regionTag: 'Zaterdag Zuid 1',
        homeKitShirt: kit.homeKitShirt,
        homeKitShorts: kit.homeKitShorts,
        homeKitSocks: kit.homeKitSocks,
        awayKitShirt: kit.awayKitShirt,
        awayKitShorts: kit.awayKitShorts,
        awayKitSocks: kit.awayKitSocks,
        leagueId: league.id,
      },
    });
  }
}

export async function seedZaterdagZuid1(prisma: PrismaClient) {
  // Tweede Klasse E
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Tweede Klasse E',
    division: 'Tweede Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'IFC' },
      { name: "MZC '11" },
      { name: 'Luctor Heinkenszand' },
      { name: 'SV Walcheren' },
      { name: "SVOD '22" },
      { name: 'VV Terneuzense Boys' },
      { name: 'VVGZ' },
      { name: 'GSC/ODS' },
      { name: 'VV Arnemuiden' },
      { name: 'VV Yerseke' },
      { name: 'VV Terneuzen' },
      { name: 'RKSV Halsteren' },
      { name: 'EBOH' },
      { name: "MOC '17" },
    ],
  });
  // Tweede Klasse F
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Tweede Klasse F',
    division: 'Tweede Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'SV Houten' },
      { name: 'Nivo Sparta' },
      { name: 'SV Parkhout' },
      { name: 'JVC Cuijk' },
      { name: 'Theole' },
      { name: 'GRC 14' },
      { name: "Achilles '29" },
      { name: 'VV Tricht' },
      { name: 'GJS' },
      { name: 'VV Sliedrecht' },
      { name: 'VV De Alblas' },
      { name: 'VV Dongen' },
      { name: "Wilhelmina '26" },
    ],
  });
  // Derde Klasse H
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Derde Klasse H',
    division: 'Derde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VCK' },
      { name: 'FC Dauwendaele' },
      { name: "VV 's-Heer Arendskerke" },
      { name: 'VV De Meeuwen' },
      { name: 'FC Axel' },
      { name: 'Bruse Boys' },
      { name: 'VV RCS' },
      { name: 'VV Kapelle' },
      { name: "SSV '65" },
      { name: 'Zeelandia-Middelburg' },
      { name: 'VV Serooskerke' },
      { name: 'GPC Vlissingen' },
      { name: 'SKNWK' },
      { name: 'VV IJzendijke' },
    ],
  });
  // Derde Klasse I
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Derde Klasse I',
    division: 'Derde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: "DVV '09" },
      { name: 'De Jonge Spartaan' },
      { name: 'VV Prinsenland' },
      { name: 'VV Stellendam' },
      { name: 'Zinkwegse Boys' },
      { name: 'VV Klundert' },
      { name: 'VV Steenbergen' },
      { name: 'WHS' },
      { name: 'SSS' },
      { name: 'Tholense Boys' },
      { name: 'VV Den Bommel' },
      { name: 'DBGC' },
      { name: "VVC '68" },
      { name: 'VV Internos' },
    ],
  });
  // Derde Klasse J
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Derde Klasse J',
    division: 'Derde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV De Zwerver' },
      { name: 'VV Spirit' },
      { name: 'SV Slikkerveer' },
      { name: 'VV Drechtstreek' },
      { name: 'VV Rijsoord' },
      { name: 'VV Pelikaan' },
      { name: 'RV&AV Overmaas' },
      { name: 'FC IJsselmonde' },
      { name: 'Wieldrecht' },
      { name: 'VV Streefkerk' },
      { name: 'Groote Lindt' },
      { name: "ZBC '97" },
      { name: 'RVV LMO' },
    ],
  });
  // Derde Klasse K
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Derde Klasse K',
    division: 'Derde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV SVW' },
      { name: 'WSC' },
      { name: 'VV DESK' },
      { name: 'VV Hardinxveld' },
      { name: 'VV Woudrichem' },
      { name: 'VV Schelluinen' },
      { name: 'VVAC' },
      { name: 'RFC' },
      { name: 'VV Sleeuwijk' },
      { name: 'VV GDC' },
      { name: 'VV Jan van Arckel' },
      { name: 'VV Zwaluwe' },
      { name: "BZC '14" },
      { name: 'SV BLC' },
    ],
  });
  // Vierde Klasse A
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV De Patrijzen' },
      { name: 'VV Lewedorpse Boys' },
      { name: 'VV Zaamslag' },
      { name: 'VV Wolfaartsdijk' },
      { name: 'RIA W' },
      { name: 'SV Nieuwdorp' },
      { name: 'SV Sluis' },
      { name: 'SV Oostburg' },
      { name: 'Nieuwland N' },
      { name: 'VV Philippine' },
      { name: "DwO '15" },
      { name: 'VV Spui' },
    ],
  });
  // Vierde Klasse B
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV Krabbendijke' },
      { name: "NOAD '67" },
      { name: 'VV Bevelanders' },
      { name: "SV WIK '57" },
      { name: 'VV Kruiningen' },
      { name: 'De Noormannen' },
      { name: "Herkingen '55" },
      { name: 'VV Goes' },
      { name: "ZSC '62" },
      { name: 'SV Duiveland' },
      { name: 'VV Veere' },
      { name: 'VC Vlissingen' },
    ],
  });
  // Vierde Klasse C
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'SEOLTO' },
      { name: 'VV Kogelvangers' },
      { name: 'DFC' },
      { name: 'VV Vrederust' },
      { name: 'Alliance' },
      { name: 'VV De Fendert' },
      { name: 'SCO' },
      { name: 'VV Alblasserdam' },
      { name: 'VV DHV' },
      { name: 'De Markiezaten' },
      { name: 'VV TSC' },
      { name: 'The Gunners' },
    ],
  });
  // Vierde Klasse D
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vierde Klasse D',
    division: 'Vierde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV Ameide' },
      { name: 'SV Meerkerk' },
      { name: 'ASV Arkel' },
      { name: 'VV Vuren' },
      { name: "HSSC '61" },
      { name: "MVV '58" },
      { name: 'VV Herovina' },
      { name: 'VV Peursum' },
      { name: 'VV BRC' },
      { name: 'VV Altena' },
      { name: 'GVV Unitas' },
      { name: 'VV Haaften' },
    ],
  });
  // Vierde Klasse E
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vierde Klasse E',
    division: 'Vierde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'Vlijmense Boys' },
      { name: 'RWB' },
      { name: "GVV '63" },
      { name: 'VV Baardwijk' },
      { name: "VV NEO '25" },
      { name: 'VV ONI' },
      { name: "Sparta '30" },
      { name: 'RKSV Margriet' },
      { name: 'SV Capelle' },
      { name: 'VV BES' },
      { name: 'SV De Braak' },
      { name: 'TSVV Merlijn' },
    ],
  });
  // Vijfde Klasse A
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: "SV Apollo '69" },
      { name: 'MZVC' },
      { name: 'VV Cadzand' },
      { name: "HKW '21" },
      { name: 'Jong Ambon' },
      { name: 'SC Waarde' },
      { name: 'VV Schoondijke' },
      { name: 'VV Wemeldinge' },
      { name: "HBC '22" },
      { name: 'Corn Boys' },
      { name: 'Aardenburg' },
    ],
  });
  // Vijfde Klasse B
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: "DVO '60" },
      { name: 'VV SSW' },
      { name: 'VV Rillandia' },
      { name: 'VV OFB' },
      { name: 'SPS' },
      { name: 'FC De Westhoek' },
      { name: 'Smerdiek' },
      { name: 'FC Dordrecht' },
      { name: 'Brouwershaven' },
      { name: 'SC Welberg' },
      { name: 'SC Stavenisse' },
      { name: 'Lepelstraatse Boys' },
    ],
  });
  // Vijfde Klasse C
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'RKTSV WSJ' },
      { name: "SSC '55" },
      { name: 'Rood-Wit V' },
      { name: "Olympia '60" },
      { name: 'Real Lunet' },
      { name: 'DVVC' },
      { name: "UVV '40" },
      { name: "OVC '26" },
      { name: 'PCP' },
      { name: "Irene '58" },
      { name: 'Willem II' },
    ],
  });
  // Vijfde Klasse D
  await createLeagueWithClubs({
    name: 'Zaterdag Zuid 1 Vijfde Klasse D',
    division: 'Vijfde Klasse',
    region: 'Zaterdag Zuid 1',
    clubs: [
      { name: 'VV Asperen' },
      { name: 'ASH' },
      { name: "SVS '65" },
      { name: 'SV Noordeloos' },
      { name: "Leerdam Sport '55" },
      { name: 'VV Kerkwijk' },
      { name: "NOAD '32" },
      { name: 'Well' },
      { name: 'SV TOP' },
      { name: 'GVV' },
      { name: "DSS '14" },
    ],
  });
}

if (require.main === module) {
  seedZaterdagZuid1(prisma).then(() => {
    console.log('✅ Zaterdag Zuid 1 seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} 