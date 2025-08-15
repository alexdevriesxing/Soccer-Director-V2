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
        regionTag: 'Zondag Zuid 1',
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

export async function seedZondagZuid1(prisma: PrismaClient) {
  // Tweede Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Tweede Klasse C',
    division: 'Tweede Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'Bladella' },
      { name: 'VV TSC' },
      { name: 'VV Gilze' },
      { name: 'RKSV Cluzona' },
      { name: 'Reusel Sport' },
      { name: 'VV Rijen' },
      { name: 'VOAB' },
      { name: 'RKVV Roosendaal' },
      { name: 'JEKA' },
      { name: 'SVSSS' },
      { name: 'SC Gastel' },
      { name: 'GSBW' },
      { name: 'Moerse Boys' },
      { name: 'Uno Animo' },
    ],
  });
  // Derde Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Derde Klasse C',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'RKSV Groen Wit' },
      { name: "VV Victoria '03" },
      { name: "HVV '24" },
      { name: 'VV Steen' },
      { name: 'VV Zundert' },
      { name: 'VV Virtus' },
      { name: 'VV Hoeven' },
      { name: 'BSC' },
      { name: 'SV DOSKO' },
      { name: 'VV Hontenisse' },
      { name: 'VV Clinge' },
      { name: 'VVR' },
    ],
  });
  // Derde Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Derde Klasse D',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'Madese Boys' },
      { name: 'RKDVC' },
      { name: 'VV Bavel' },
      { name: 'VV Trinitas Oisterwijk' },
      { name: 'Hilvaria' },
      { name: 'VV ZIGO' },
      { name: 'VV Oosterhout' },
      { name: 'Beek Vooruit' },
      { name: 'TSV Gudok' },
      { name: 'Be Ready' },
      { name: 'SV Reeshof' },
      { name: 'VV Dubbeldam' },
    ],
  });
  // Derde Klasse E
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Derde Klasse E',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'Berghem Sport' },
      { name: 'Nulandia' },
      { name: 'VV Haarsteeg' },
      { name: 'EVVC' },
      { name: 'SC Den Dungen' },
      { name: 'RKSV Margriet' },
      { name: "SCG '18" },
      { name: 'VV DSC' },
      { name: 'ODC' },
      { name: "Sporting '70" },
      { name: 'FC Engelen' },
      { name: 'SMVC Fair Play' },
    ],
  });
  // Derde Klasse F
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Derde Klasse F',
    division: 'Derde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'VV Brabantia' },
      { name: 'RKVV Dommelen' },
      { name: 'Beerse Boys' },
      { name: 'Wilhelmina Boys' },
      { name: 'RKVVO' },
      { name: "Unitas '59" },
      { name: 'PSV' },
      { name: 'VV Gestel' },
      { name: 'VV Hoogeloon' },
      { name: 'VV Acht' },
      { name: 'VV DBS' },
      { name: 'Bergeijk' },
      { name: 'FC Eindhoven AV' },
      { name: 'Spoordonkse Boys' },
    ],
  });
  // Vierde Klasse A
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'Rood Wit W' },
      { name: 'RKVV Rimboe' },
      { name: 'VV DSE' },
      { name: 'VV Breskens' },
      { name: 'VV Wernhout' },
      { name: "WVV '67" },
      { name: 'VV RSV' },
      { name: 'SV Sprundel' },
      { name: 'VV Schijf' },
      { name: 'VV Achtmaal' },
      { name: 'TVC/Breda' },
    ],
  });
  // Vierde Klasse B
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'SV Terheijden' },
      { name: 'VV Waspik' },
      { name: 'RKVV DIA' },
      { name: "Right 'Oh" },
      { name: 'Gloria UC' },
      { name: 'VV Chaam' },
      { name: "Neerlandia '31" },
      { name: "WDS '19" },
      { name: 'RKSV RCD' },
      { name: 'SC EMMA' },
      { name: 'VV Raamsdonk' },
      { name: 'VV Berkdijk' },
    ],
  });
  // Vierde Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'Rood-Wit V' },
      { name: 'VV Vessem' },
      { name: 'Jong Brabant' },
      { name: 'VV Steensel' },
      { name: 'RKDSV' },
      { name: "EDN '56" },
      { name: 'HMVV' },
      { name: 'Tuldania' },
      { name: 'ZSC' },
      { name: 'Terlo' },
      { name: 'FC Tilburg' },
    ],
  });
  // Vierde Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vierde Klasse D',
    division: 'Vierde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'RKVV Wilhelmina' },
      { name: 'RKTVC' },
      { name: "DBN '22" },
      { name: 'Boxtel' },
      { name: 'VV Alem' },
      { name: 'VV Hedel' },
      { name: 'VV Helvoirt' },
      { name: 'Essche Boys' },
      { name: 'VCB' },
      { name: 'BVV' },
    ],
  });
  // Vijfde Klasse A
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'VV Groede' },
      { name: 'VV Vogelwaarde' },
      { name: 'RKVV METO' },
      { name: 'NSV' },
      { name: 'VIVOO' },
      { name: 'ODIO' },
      { name: 'VV Hulsterloo' },
      { name: 'VV Graauw' },
      { name: "HSC '28" },
      { name: 'VV Grenswachters' },
      { name: 'RKVV Koewacht' },
      { name: "SDO '63" },
    ],
  });
  // Vijfde Klasse B
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'NVS' },
      { name: 'VCW' },
      { name: 'VV SVC' },
      { name: "VV HZ '75" },
      { name: 'De Schutters' },
      { name: 'SAB' },
      { name: 'DIOZ' },
      { name: 'DEVO' },
      { name: 'VV Noordhoek' },
      { name: 'SV ADVENDO' },
      { name: 'VV TPO' },
    ],
  });
  // Vijfde Klasse C
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: "OVV '67" },
      { name: 'Audacia' },
      { name: 'VV Viola' },
      { name: "Blauw Wit '81" },
      { name: 'Dussense Boys' },
      { name: 'Were Di' },
      { name: "De Bocht '80" },
      { name: 'RKVV GESTA' },
      { name: 'VV Riel' },
      { name: 'VV Molenschot' },
      { name: 'VV LSV Boxtel' },
      { name: 'SVSOS' },
    ],
  });
  // Vijfde Klasse D
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse D',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'VV BZS' },
      { name: 'RKKSV' },
      { name: "SV MEC '07" },
      { name: 'Teisterbanders' },
      { name: 'SC Elshout' },
      { name: "HRC '14" },
      { name: 'FC Drunen' },
      { name: 'SV Buren' },
      { name: 'SCZ' },
      { name: 'VV Ophemert' },
      { name: "HHC '09" },
      { name: 'VV Wadenoijen' },
    ],
  });
  // Vijfde Klasse E
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse E',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'VV Hapert' },
      { name: 'De Raven' },
      { name: "DOSKO '32" },
      { name: 'Marvilde' },
      { name: 'Casteren' },
      { name: 'VV Netersel' },
      { name: 'VV Hulsel' },
      { name: "SDO '39" },
      { name: 'Knegselse Boys' },
      { name: 'vv DEES' },
      { name: 'VV Riethoven' },
      { name: 'De Weebosch' },
    ],
  });
  // Vijfde Klasse F
  await createLeagueWithClubs({
    name: 'Zondag Zuid 1 Vijfde Klasse F',
    division: 'Vijfde Klasse',
    region: 'Zondag Zuid 1',
    clubs: [
      { name: 'DVS' },
      { name: 'FC Cranendonck' },
      { name: 'Eindse Boys' },
      { name: 'ESVV Pusphaira' },
      { name: 'SV Tongelre' },
      { name: 'RKVV Nederwetten' },
      { name: 'Waalre' },
      { name: 'Woenselse Boys' },
      { name: 'RKVV EMK' },
      { name: 'RKSV Sterksel' },
      { name: 'SV Tivoli' },
    ],
  });
}

if (require.main === module) {
  seedZondagZuid1(prisma).then(() => {
    console.log('✅ Zondag Zuid 1 seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} 