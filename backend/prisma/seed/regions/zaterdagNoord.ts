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
          regionTag: 'Zaterdag Noord',
          ...kit,
        },
      });
    }
  }
}
async function main() {
  await createLeagueWithClubs({
    name: 'Tweede Klasse I',
    division: 'II',
    region: 'Noord',
    clubs: [
      { name: 'SV Nieuwleusen' },
      { name: 'WVF' },
      { name: 'VV Noordscheschut' },
      { name: 'VV Gorecht' },
      { name: 'Achilles 1894' },
      { name: 'VV Grijpskerk' },
      { name: 'VV LTC' },
      { name: 'SV Bedum' },
      { name: 'SV Gramsbergen' },
      { name: 'FC Meppel' },
      { name: "Be Quick '28" },
      { name: 'VV Helpman' },
      { name: "VEV '67" },
      { name: 'VV Hoogezand' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Tweede Klasse J',
    division: 'II',
    region: 'Noord',
    clubs: [
      { name: 'L.A.C. "Frisia 1883"' },
      { name: 'FC Surhústerfean' },
      { name: 'Zeerobben' },
      { name: 'VV Sneek Wit Zwart' },
      { name: 'SC Bolsward' },
      { name: 'FC Burgum' },
      { name: 'FVC' },
      { name: 'VV Heerenveen' },
      { name: 'SV Marum' },
      { name: 'SC Leovardia' },
      { name: 'VV Balk' },
      { name: 'GAVC' },
      { name: 'FC Wolvega' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse P',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'SC Joure' },
      { name: 'VV Workum' },
      { name: 'VVI' },
      { name: 'Leeuwarder Zwaluwen' },
      { name: 'CVVO' },
      { name: 'SC Berlikum' },
      { name: 'VV Minnertsga' },
      { name: 'VV Nijland' },
      { name: 'AVC' },
      { name: 'VV Sint Annaparochie' },
      { name: 'VV DWP' },
      { name: 'VV QVC' },
      { name: 'VV Dronrijp' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse Q',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'VV Hardegarijp' },
      { name: 'SV Oosterwolde' },
      { name: 'Be Quick Dokkum' },
      { name: 'VV Opende' },
      { name: 'VV ONR' },
      { name: 'VV Noordbergum' },
      { name: 'VV Kollum' },
      { name: 'VV Zuidhorn' },
      { name: 'SC Twijzel' },
      { name: 'VV Drachten' },
      { name: 'VV Rijperkerk' },
      { name: 'SV RWF' },
      { name: 'VV Eastermar' },
      { name: 'SC Kootstertille' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse R',
    division: 'III',
    region: 'Noord',
    clubs: [
      { name: 'FC Zuidlaren' },
      { name: 'The Knickerbockers' },
      { name: 'VV Veendam 1894' },
      { name: 'VV Wildervank' },
      { name: 'VV Aduard 2000' },
      { name: 'Be Quick 1887' },
      { name: 'Groen Geel' },
      { name: 'DVC Appingedam' },
      { name: 'SC Loppersum' },
      { name: 'VV Groningen' },
      { name: 'SV Lycurgus' },
      { name: 'FC Lewenborg' },
      { name: "HS '88" },
      { name: 'SV Borger' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse A',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'SV VHK' },
      { name: 'FC Ulu Spor' },
      { name: 'VV Creil-Bant' },
      { name: 'DESZ' },
      { name: 'VV Nagele' },
      { name: "SVN '69" },
      { name: 'VV Sleat' },
      { name: 'VV Steenwijk' },
      { name: "Olympia '28" },
      { name: 'VV Heeg' },
      { name: 'VV Oudehaske' },
      { name: 'HJSC' },
      { name: 'VV Delfstrahuizen' },
      { name: 'SV Ens' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse B',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'IJVC' },
      { name: 'VV Foarút' },
      { name: 'SC Franeker' },
      { name: 'VV SDS' },
      { name: 'SV Wykels Hallum' },
      { name: 'VV Makkum' },
      { name: 'SF Deinum' },
      { name: "SSS '68" },
      { name: 'Waterpoort Boys' },
      { name: 'VV Marrum' },
      { name: 'Irnsum' },
      { name: 'VV DTD' },
      { name: "RKVV MKV '29" },
      { name: "VV Scharnegoutum '70" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse C',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'VV Zwaagwesteinde' },
      { name: 'VV ONT' },
      { name: 'VC Trynwâlden' },
      { name: "Lions '66" },
      { name: 'VV Drogeham' },
      { name: 'VV Dokkum' },
      { name: 'VIOD Driesum' },
      { name: 'VV Harkema Opeinde' },
      { name: 'VV Anjum' },
      { name: 'Friese Boys' },
      { name: 'VV Rottevalle' },
      { name: 'SC Veenwouden' },
      { name: 'FC Birdaard' },
      { name: "V en V '68" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse D',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'VV Veenhuizen' },
      { name: 'VV Niekerk' },
      { name: 'SV Haulerwijk' },
      { name: "SC Boornbergum '80" },
      { name: 'Fc. Grootegast' },
      { name: 'VV ONB' },
      { name: "HFC '15" },
      { name: 'VV ODV' },
      { name: 'VV Bakkeveen' },
      { name: 'VV Waskemeer' },
      { name: 'VV TLC' },
      { name: 'De Wilper Boys' },
      { name: 'VV Stânfries' },
      { name: 'VV Westerkwartier' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse E',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'NEC Delfzijl' },
      { name: 'Corenos' },
      { name: 'VV Omlandia' },
      { name: 'VV Holwierde' },
      { name: 'VV Poolster' },
      { name: 'VV Middelstum' },
      { name: 'SV De Heracliden' },
      { name: 'VV Mamio' },
      { name: 'VV SGV' },
      { name: 'VV Noordwolde' },
      { name: 'WVV' },
      { name: 'VV Haren' },
      { name: 'VV ZNC' },
      { name: 'vv ZEC' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse F',
    division: 'IV',
    region: 'Noord',
    clubs: [
      { name: 'VV CEC' },
      { name: 'VV Hollandscheveld' },
      { name: 'FC Assen' },
      { name: 'VV SJS' },
      { name: 'Onstwedder Boys' },
      { name: 'VV SVBO' },
      { name: 'SC Elim' },
      { name: 'SCN' },
      { name: 'CSVC' },
      { name: 'Fit Boys' },
      { name: 'VV Bargeres' },
      { name: 'VCG' },
      { name: 'FC Klazienaveen' },
      { name: 'Damacota' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse A',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'SV NOK' },
      { name: "TOP '63" },
      { name: 'Oeverzwaluwen' },
      { name: 'VV Arum' },
      { name: 'SV Hielpen' },
      { name: 'SV Mulier' },
      { name: 'De Wâlde' },
      { name: 'UDIROS' },
      { name: 'VV Woudsend' },
      { name: 'Bakhuizen' },
      { name: 'VV Nieuweschoot' },
      { name: 'LSC 1890' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse B',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV Ouwe Syl' },
      { name: 'WTOC' },
      { name: 'VCR' },
      { name: 'Blija' },
      { name: 'CVO' },
      { name: 'Ropta Boys' },
      { name: 'VV Ternaard' },
      { name: 'VV Holwerd' },
      { name: 'VV De Lauwers' },
      { name: 'VV Beetgum' },
      { name: 'VV Oostergo' },
      { name: 'VV De Wâlden' },
      { name: 'Wardy' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse C',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV TFS' },
      { name: 'GSVV' },
      { name: 'SV Donkerbroek' },
      { name: 'VV WWS' },
      { name: "ASC '75" },
      { name: 'VV Blue Boys' },
      { name: 'De Sweach' },
      { name: 'SV Houtigehage' },
      { name: 'VVT' },
      { name: 'VV Suameer' },
      { name: 'VV Jistrum' },
      { name: 'Suawoude' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse D',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV SIOS' },
      { name: 'De Fivel' },
      { name: 'Rood Zwart Baflo' },
      { name: 'VV Warffum' },
      { name: 'FC LEO' },
      { name: 'Noordpool UFC' },
      { name: 'OKVC' },
      { name: 'VV Zeester' },
      { name: 'VV Stedum' },
      { name: 'VV Kloosterburen' },
      { name: 'VV KRC' },
      { name: 'VV Ezinge' },
      { name: 'VV Eenrum' },
      { name: "VVSV '09" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse E',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VAKO' },
      { name: 'VV Oosterparkers' },
      { name: 'VV Glimmen' },
      { name: 'VV Gruno' },
      { name: 'VV LEO' },
      { name: 'VV Nieuw Roden' },
      { name: 'BSVV' },
      { name: 'VV GEO' },
      { name: 'Amicitia VMC' },
      { name: 'SV Blauw Geel 1915' },
      { name: 'SV Tynaarlo' },
      { name: 'GRC Groningen' },
      { name: 'VVK' },
      { name: 'Asser Boys' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse F',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'VV HSC' },
      { name: 'SC Scheemda' },
      { name: 'SC Angelslo' },
      { name: 'VVS Oostwold' },
      { name: 'NWVV' },
      { name: 'VV Meeden' },
      { name: 'VV BATO' },
      { name: 'SV Mussel' },
      { name: 'VV Harkstede' },
      { name: 'VV Wagenborger Boys' },
      { name: 'VV Westerlee' },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse G',
    division: 'V',
    region: 'Noord',
    clubs: [
      { name: 'Steenwijker Boys' },
      { name: 'VV Tollebeek' },
      { name: 'TONEGO' },
      { name: 'VVAK' },
      { name: 'SV Nieuw Balinge' },
      { name: 'RKO' },
      { name: "SVBS '77" },
      { name: 'NKVV' },
      { name: 'VV Beilen' },
      { name: 'SC Espel' },
      { name: 'SV Blokzijl' },
      { name: 'VV Tiendeveen' },
    ],
  });
}
main().finally(() => prisma.$disconnect()); 