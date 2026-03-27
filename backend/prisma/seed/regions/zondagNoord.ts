import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function getBoardExpectation(position: number, total: number): string {
  if (position === 1) return 'Win the league';
  if (position === 2) return 'Promotion';
  if (position <= Math.ceil(total / 4)) return 'Play-off spot';
  if (position <= Math.ceil(total / 2)) return 'Top half';
  if (position <= total - 2) return 'Mid-table';
  return 'Avoid relegation';
}
function getMorale(position: number, total: number): number {
  if (position === 1) return 80;
  if (position === 2) return 78;
  if (position <= Math.ceil(total / 4)) return 75;
  if (position <= Math.ceil(total / 2)) return 70;
  if (position <= total - 2) return 65;
  return 60;
}
function getKitColors(name: string) {
  // Placeholder: default kit colors
  return {
    primaryColor: '#1976d2',
    homeKitShorts: '#fff',
    homeKitSocks: '#222',
    secondaryColor: '#4ecdc4',
    awayKitShorts: '#3da89e',
    awayKitSocks: '#4ecdc4',
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
          regionTag: 'Zondag Noord',
          ...kit,
        },
      });
    }
  }
}
async function main() {
  await createLeagueWithClubs({
    name: 'Tweede Klasse G',
    division: 'II',
    region: 'Noord',
    clubs: [
      { name: "MVV '29" },
      { name: 'WKE-16' },
      { name: 'De Tukkers' },
      { name: 'Markelo' },
      { name: 'VV Valthermond' },
      { name: 'RSC' },
      { name: 'VV Raptim' },
      { name: 'Germanicus' },
      { name: 'SV Dalfsen' },
      { name: 'VV Dalen' },
      { name: 'Twedo' },
      { name: 'VV Sellingen' },
      { name: "EHS '85" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Tweede Klasse H',
    division: 'II',
    region: 'Noord',
    clubs: [
      { name: 'GRC Groningen' },
      { name: 'VKW' },
      { name: 'Alcides' },
      { name: 'VV Annen' },
      { name: 'VV Oldeholtpade' },
      { name: 'LSC 1890' },
      { name: 'SV Steenwijkerwold' },
      { name: 'GOMOS' },
      { name: 'VV Peize' },
      { name: 'GSAVV Forward' },
      { name: 'GVAV-Rapiditas' },
      { name: 'VV Gorredijk' },
      { name: 'VV Jubbega' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse N',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'VV Akkrum' },
      { name: 'Olyphia' },
      { name: 'VV Oerterp' },
      { name: 'SV VENO' },
      { name: 'LVV Friesland' },
      { name: 'Read Swart' },
      { name: 'VV Oranje Zwart' },
      { name: 'SC Emmeloord' },
      { name: 'VV Trinitas' },
      { name: "Smilde '94" },
      { name: 'FC Harlingen' },
      { name: 'VV Warga' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse O',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'SVZ' },
      { name: 'VV Musselkanaal' },
      { name: 'SC Stadspark' },
      { name: 'SC Stadskanaal' },
      { name: 'VV ASVB' },
      { name: 'VV Groninger Boys' },
      { name: 'VV Noordster' },
      { name: 'VV Gieten' },
      { name: "FC Ter Apel '96" },
      { name: 'VV Siddeburen' },
      { name: 'MOVV' },
      { name: 'VV Muntendam' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse P',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'VV Ruinen' },
      { name: 'vv HOVC' },
      { name: 'SC Erica' },
      { name: 'VV EMMS' },
      { name: 'VV Sweel' },
      { name: 'VV Titan' },
      { name: 'VV Beilen' },
      { name: "SVV '04" },
      { name: 'SV Pesse' },
      { name: 'VV Wacker' },
      { name: 'HODO' },
      { name: 'VV Sleen' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse A',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'VV Geel Wit' },
      { name: 'VV Renado' },
      { name: 'VV Tijnje' },
      { name: 'VV Mildam' },
      { name: 'VV Oosterlittens' },
      { name: 'VV De Blesse' },
      { name: 'FC Oldemarkt' },
      { name: 'VV Oldeboorn' },
      { name: 'VWC' },
      { name: 'SC Makkinga' },
      { name: 'SC Terschelling' },
      { name: 'VV Blauwhuis' },
      { name: 'SV THOR' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse B',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'VV Actief' },
      { name: 'VV Heiligerlee' },
      { name: 'VV Nieuw Buinen' },
      { name: 'VV BNC' },
      { name: 'VV Westerwolde' },
      { name: 'VV Buinen' },
      { name: 'VV Veelerveen' },
      { name: 'SV Drieborg' },
      { name: 'VV Engelbert' },
      { name: 'VV Gasselternijveen' },
      { name: 'VV Gieterveen' },
      { name: 'Groen Geel' },
      { name: 'VV Eext' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse C',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'USV' },
      { name: 'VV Havelte' },
      { name: 'VV Ruinerwold' },
      { name: 'VV Weerdinge' },
      { name: 'VV Schoonebeek' },
      { name: 'VV Dwingeloo' },
      { name: 'SC Zwartemeerse Boys' },
      { name: 'VV Protos' },
      { name: 'SV Hoogersmilde' },
      { name: "Witteveense Boys '87" },
      { name: "DSC '65" },
      { name: 'Wijster' },
      { name: 'FC Kraggenburg' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse A',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'SV Zwolle' },
      { name: 'Old Forward' },
      { name: 'VV IJhorst' },
      { name: 'VV Diever/Wapse' },
      { name: 'SV Giethoorn' },
      { name: 'SC Balkbrug' },
      { name: 'VV BEW' },
      { name: 'SSA Oosterstreek Zandhuizen' },
      { name: 'VV Vilsteren' },
      { name: 'VV Uffelte' },
      { name: 'VV Wapserveen' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse B',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV Zevenhuizen' },
      { name: "VV Blauw Rood '20" },
      { name: 'VV Langezwaag' },
      { name: 'VV Wispolia' },
      { name: 'AVV' },
      { name: 'vv Lemmer' },
      { name: 'VV Kuinre' },
      { name: 'VV Aengwirden' },
      { name: 'VV Langweer' },
      { name: 'VV Sport Vereent' },
      { name: 'FFS' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse C',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV Bareveld' },
      { name: 'VV Bellingwolde' },
      { name: 'VV DWZ' },
      { name: 'SV Yde de Punt' },
      { name: 'Usquert' },
      { name: 'FVV' },
      { name: 'VV Farmsum' },
      { name: 'VV PJC' },
      { name: 'SV Woltersum' },
      { name: 'VV Pekelder Boys' },
      { name: 'VV Wedde' },
      { name: 'VV Alteveer' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse D',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV SPW' },
      { name: 'VIOS O' },
      { name: 'Weiteveense Boys' },
      { name: 'JVV' },
      { name: 'VV SVBC' },
      { name: "DVC '59" },
      { name: 'VV KSC' },
      { name: 'VV GKC' },
      { name: 'HHCombi' },
      { name: "VV De Treffer '16" },
      { name: 'VV Buinerveen' },
      { name: 'Sportclub Roswinkel' },
    ],
  });
}
main().finally(() => prisma.$disconnect()); 