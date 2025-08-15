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
    homeKitShirt: '#b3a369',
    homeKitShorts: '#7c6f3a',
    homeKitSocks: '#b3a369',
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
        regionTag: 'Zondag Zuid 2',
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

export async function seedZondagZuid2(prisma: PrismaClient) {
  // Tweede Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Tweede Klasse D',
    division: 'Tweede Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: "SV Avanti '31" },
      { name: 'RKVV Erp' },
      { name: 'ZSV' },
      { name: 'VV SBC' },
      { name: 'NWC' },
      { name: 'Heeze' },
      { name: 'Rhode' },
      { name: 'VV Handel' },
      { name: 'Oirschot Vooruit' },
      { name: 'RPC' },
      { name: 'RKSV Schijndel' },
      { name: "Olympia '18" },
      { name: 'VV Bruheze' },
      { name: 'Stiphout Vooruit' },
    ],
  });
  // Tweede Klasse E
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Tweede Klasse E',
    division: 'Tweede Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'SV Someren' },
      { name: 'SV Budel' },
      { name: 'VV Alfa Sport' },
      { name: 'RKSV Minor' },
      { name: "Sportclub '25" },
      { name: 'RVU' },
      { name: 'Merefeldia' },
      { name: 'VV Schaesberg' },
      { name: 'Caesar' },
      { name: 'Veritas' },
      { name: 'SHH' },
      { name: 'Sporting Heerlen' },
      { name: 'Geusselt Sport' },
      { name: 'VV Maastricht West' },
    ],
  });
  // Derde Klasse G
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Derde Klasse G',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Avesteyn' },
      { name: 'RKSV Prinses Irene' },
      { name: 'Festilent' },
      { name: 'Vianen Vooruit' },
      { name: 'Volkel' },
      { name: 'VV Heeswijk' },
      { name: "EGS '20" },
      { name: 'RKSV Venhorst' },
      { name: 'SES' },
      { name: 'DSV' },
      { name: 'VV Excellent' },
      { name: "SSS '18" },
    ],
  });
  // Derde Klasse H
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Derde Klasse H',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'VV Geldrop' },
      { name: 'HVV Helmond' },
      { name: 'RKSVO' },
      { name: "Sparta '18" },
      { name: 'SV Lierop' },
      { name: 'VV Helden' },
      { name: "PEC '20" },
      { name: 'VV Mariahout' },
      { name: 'VV Hegelsom' },
      { name: 'ELI' },
      { name: 'Neerkandia' },
      { name: 'MMC Weert' },
    ],
  });
  // Derde Klasse I
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Derde Klasse I',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Venlosche Boys' },
      { name: 'SV Haslou' },
      { name: 'VV Sittard' },
      { name: 'VV DVO' },
      { name: 'VV HEBES' },
      { name: 'SV Blerick' },
      { name: 'FC Maasgouw' },
      { name: 'RKSVN' },
      { name: 'VV Spaubeek' },
      { name: 'FCV' },
      { name: 'VV Baarlo' },
      { name: 'HBSV' },
      { name: 'Irene Sportclub' },
    ],
  });
  // Derde Klasse J
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Derde Klasse J',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'VV Eijsden' },
      { name: 'RKHSV' },
      { name: 'FC Gulpen' },
      { name: 'SC Jekerdal' },
      { name: 'FC Hoensbroek' },
      { name: 'Scharn' },
      { name: 'RKSV Heer' },
      { name: 'SV Langeberg' },
      { name: 'VV Bunde' },
      { name: 'RKVV Vaesrade' },
      { name: 'RKUVC' },
      { name: 'Weltania' },
      { name: 'SV Hulsberg' },
      { name: 'VV Walram' },
    ],
  });
  // Vierde Klasse A
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'RKASV' },
      { name: 'VV Keer' },
      { name: 'Leonidas W' },
      { name: 'BMR' },
      { name: 'RKVVM' },
      { name: 'VV Daalhof' },
      { name: "SNC '14" },
      { name: 'VV Willem I' },
      { name: 'Geertruidse Boys' },
      { name: 'SVME' },
      { name: 'FC Bemelen' },
      { name: 'SCG' },
    ],
  });
  // Vierde Klasse B
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'FC Landgraaf' },
      { name: "UOW '02" },
      { name: 'Laura-Hopel Combinatie' },
      { name: 'SV Simpelveld' },
      { name: 'RKHBS' },
      { name: 'VV WDZ' },
      { name: 'FC Kerkrade-West' },
      { name: "Rood Groen LVC '01" },
      { name: 'RKVV Voerendaal' },
      { name: 'KVC Oranje' },
      { name: 'RKVV Vijlen' },
      { name: 'SV Eikenderveld' },
    ],
  });
  // Vierde Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'RKVV De Leeuw' },
      { name: 'RKFC Lindenheuvel-Heidebloem Comb.' },
      { name: 'Heksenberg-NEC' },
      { name: 'VV Schimmert' },
      { name: 'SV Geuldal' },
      { name: 'RKVV Neerbeek' },
      { name: 'VV Amstenrade' },
      { name: 'Urmondia' },
      { name: 'FC Geleen Zuid' },
      { name: 'Woander Forest' },
      { name: 'RKSV Olympia Schinveld' },
      { name: "Sporting Sittard '13" },
    ],
  });
  // Vierde Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse D',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'SVH 39' },
      { name: 'FC Roerdalen' },
      { name: 'SC Leeuwen' },
      { name: 'Heythuysen' },
      { name: 'SV Roggel' },
      { name: 'Haelen' },
      { name: "Oranje Blauw '15" },
      { name: 'VV Roosteren' },
      { name: 'VV IVS' },
      { name: 'FC Ria' },
      { name: 'Slekker Boys' },
      { name: 'VV Born' },
    ],
  });
  // Vierde Klasse E
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse E',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Brevendia' },
      { name: 'VV Maarheeze' },
      { name: 'SPV' },
      { name: 'RKSV Liessel' },
      { name: 'ONDO' },
      { name: 'SVSH' },
      { name: 'FC Oda' },
      { name: "DFO '20" },
      { name: "Rood Wit '67" },
      { name: 'DOSL' },
      { name: 'SSE' },
      { name: 'BEVO' },
    ],
  });
  // Vierde Klasse F
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse F',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'IVO' },
      { name: 'Meterik' },
      { name: 'VV Kessel' },
      { name: 'SV Melderslo' },
      { name: 'SV Ysselsteyn' },
      { name: 'SJO/SSA SVEB-Sporting ST' },
      { name: "SVOC '01" },
      { name: 'VV Reuver' },
      { name: 'SV Kronenberg' },
      { name: "MVC '19" },
      { name: 'Leunen' },
      { name: 'Belfeldia' },
    ],
  });
  // Vierde Klasse G
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse G',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Mifano' },
      { name: 'Braakhuizen' },
      { name: 'SV Brandevoort' },
      { name: 'DVG' },
      { name: "ASV '33" },
      { name: 'RKGSV' },
      { name: 'Milheezer Boys' },
      { name: 'VOW' },
      { name: 'Nijnsel' },
      { name: "Rood Wit '62" },
      { name: 'VV Nieuw Woensel' },
      { name: 'SV Olland' },
    ],
  });
  // Vierde Klasse H
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse H',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'SV United' },
      { name: 'Juliana Mill' },
      { name: 'VV Heijen' },
      { name: 'SV Milsbeek' },
      { name: 'Astrantia' },
      { name: 'HBV' },
      { name: "VIOS '38" },
      { name: 'Constantia' },
      { name: 'MSH Maasduinen' },
      { name: "sv DWSH '18" },
      { name: 'Hapse Boys' },
      { name: "Vitesse '08" },
    ],
  });
  // Vierde Klasse I
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vierde Klasse I',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'BMC' },
      { name: 'FC Uden' },
      { name: "SSA Vesta '19" },
      { name: 'Nooit Gedacht' },
      { name: 'FC de Rakt' },
      { name: 'WEC' },
      { name: 'FC Schadewijk' },
      { name: 'Vorstenbossche Boys' },
      { name: 'VITA' },
      { name: 'Herpinia' },
      { name: 'Achilles Reek' },
      { name: 'RKVV Maliskamp' },
    ],
  });
  // Vijfde Klasse A
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: "VV Berg '28" },
      { name: 'VV Hellas' },
      { name: 'RKMVC' },
      { name: "SV Zwart-Wit '19" },
      { name: 'SV Brunssum' },
      { name: 'RKTSV' },
      { name: 'DBSV' },
      { name: 'RKVV Wijnandia' },
      { name: 'RKSVB' },
      { name: 'VV Partij' },
      { name: 'RKIVV' },
      { name: 'Geulsche Boys' },
    ],
  });
  // Vijfde Klasse B
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Sporting H.A.C.' },
      { name: 'SV Argo' },
      { name: 'VV Zwentibold' },
      { name: 'VV SVM Munstergeleen' },
      { name: 'SV Abdissenbosch' },
      { name: 'RKVV Rimburg' },
      { name: 'Passart-VKC' },
      { name: 'OVCS' },
      { name: 'Centrum Boys' },
      { name: 'Kakertse Boys' },
      { name: 'SV De Dem' },
      { name: 'VV Sanderbout' },
    ],
  });
  // Vijfde Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Horn' },
      { name: 'VV Linne' },
      { name: "MBC '13" },
      { name: 'VV Sint Joost' },
      { name: "RIOS '31" },
      { name: 'VV SNA Montfort' },
      { name: "Conventus '03" },
      { name: 'Susterse Boys' },
      { name: 'RKVBR' },
      { name: 'SVC 2000' },
      { name: 'RKSVV' },
      { name: 'RKAVC' },
    ],
  });
  // Vijfde Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse D',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'DEV-Arcen' },
      { name: 'VV Koningslust' },
      { name: 'DESM' },
      { name: 'SV Grashoek' },
      { name: 'RKMSV' },
      { name: "SSA SV Lottum - GFC '33" },
      { name: 'DES Swalmen' },
      { name: "TSC '04" },
      { name: 'RKDSO' },
      { name: 'America' },
      { name: 'Bieslo' },
    ],
  });
  // Vijfde Klasse E
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse E',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'Bavos' },
      { name: 'Boerdonk' },
      { name: 'SJVV' },
      { name: 'RKVV Keldonk' },
      { name: 'VV Boskant' },
      { name: 'VV MVC' },
      { name: 'VV Irene' },
      { name: 'SV De Middenpeel' },
      { name: 'SV De Braak' },
      { name: 'SCMH' },
      { name: 'Olympia Boys' },
    ],
  });
  // Vijfde Klasse F
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse F',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'VV Achates' },
      { name: 'VV De Zwaluw' },
      { name: 'VV Sambeek' },
      { name: "BVV '27" },
      { name: 'Toxandria' },
      { name: 'SV Oostrum' },
      { name: 'SV Merselo' },
      { name: 'SVS Stevensbeek' },
      { name: 'VV SIOL' },
      { name: 'VV Holthees-Smakt' },
    ],
  });
  // Vijfde Klasse G
  await createLeagueWithClubs({
    name: 'Zondag Zuid 2 Vijfde Klasse G',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 2',
    clubs: [
      { name: 'DESO' },
      { name: 'RKSV Cito' },
      { name: 'Odiliapeel' },
      { name: 'Maaskantse Boys' },
      { name: "NLC '03" },
      { name: 'VV Gassel' },
      { name: 'VCO' },
      { name: 'OKSV' },
      { name: "MOSA '14" },
      { name: 'Sportclub Loosbroek' },
    ],
  });
}

if (require.main === module) {
  seedZondagZuid2(prisma).then(() => {
    console.log('✅ Zondag Zuid 2 seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} 