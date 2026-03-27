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
          regionTag: 'Zondag Oost',
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
  await createLeagueWithClubs({
    name: 'Tweede Klasse F',
    division: 'Tweede Klasse',
    region: 'Oost',
    clubs: [
      { name: "SDOUC" },
      { name: "SC Westervoort" },
      { name: "VV VIOD Doetinchem" },
      { name: "Jonge Kracht" },
      { name: "AZC" },
      { name: "Quick 1888" },
      { name: "SV Grol" },
      { name: "VV Trekvogels" },
      { name: "VVG '25" },
      { name: "SC Varsseveld" },
      { name: "WSV" },
      { name: "RKZVC" },
      { name: "VV Union" },
      { name: "Voorwaarts T" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse K',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "DSVD" },
      { name: "VOGIDO" },
      { name: "VV Sportclub Lochem" },
      { name: "SV Delden" },
      { name: "UD W" },
      { name: "SV Enter" },
      { name: "Witkampers" },
      { name: "VV Ruurlo" },
      { name: "WVV '34" },
      { name: "FC Trias" },
      { name: "Wijhe '92" },
      { name: "VV Lemelerveld" },
      { name: "VV Reünie" },
      { name: "BSC Unisson" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse L',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "OBW" },
      { name: "SV Schalkhaar" },
      { name: "SV DCS" },
      { name: "DVV" },
      { name: "KCVO" },
      { name: "VV Vorden" },
      { name: "Columbia" },
      { name: "VV Gendringen" },
      { name: "Warnsveldse Boys" },
      { name: "FC Bergh" },
      { name: "GSV '38" },
      { name: "Diepenveen" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Derde Klasse M',
    division: 'Derde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV Spero" },
      { name: "DVOL" },
      { name: "DIO '30" },
      { name: "Groesbeekse Boys" },
      { name: "SML" },
      { name: "Eldenia" },
      { name: "SCE" },
      { name: "VDZ" },
      { name: "Brakkenstein" },
      { name: "SC Millingen" },
      { name: "RKSV Driel" },
      { name: "Eendracht '30" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse A',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV Vasse" },
      { name: "SV De Lutte" },
      { name: "AVC La Première" },
      { name: "VV Bentelo" },
      { name: "VV Reutum" },
      { name: "TVV" },
      { name: "LSV Lonneker" },
      { name: "VC Fleringen" },
      { name: "SV TVO" },
      { name: "DTC '07" },
      { name: "Saasveldia" },
      { name: "Luctor et Emergo" },
      { name: "Rood Zwart" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse B',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV SDOL" },
      { name: "Overwetering" },
      { name: "SV Turkse Kracht" },
      { name: "VV Twenthe" },
      { name: "VV Holten" },
      { name: "SV Colmschate '33" },
      { name: "ABS" },
      { name: "CCW '16" },
      { name: "SV Hector" },
      { name: "VV Activia" },
      { name: "SV Heeten" },
      { name: "SV Haarle" },
      { name: "SV Terwolde" },
      { name: "DVV Sallandia" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse C',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "FC Dinxperlo" },
      { name: "GWVV" },
      { name: "VIOS B" },
      { name: "Pax" },
      { name: "SC Doesburg" },
      { name: "HC '03" },
      { name: "Keijenburgse Boys" },
      { name: "Angerlo Vooruit" },
      { name: "FC Eibergen" },
      { name: "Sportclub Rekken" },
      { name: "VV Erix" },
      { name: "RKSV 't Peeske" },
      { name: "SV Basteom" },
      { name: "SC Rijnland" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse D',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "VV OSC (N)" },
      { name: "Germania" },
      { name: "VV GVA" },
      { name: "DDV '23" },
      { name: "FC Kunde" },
      { name: "VV Krayenhoff" },
      { name: "Rood Wit" },
      { name: "SV Blauw Wit" },
      { name: "Overasseltse Boys" },
      { name: "VV Ewijk" },
      { name: "Victoria '25" },
      { name: "DVSG" },
      { name: "SV Nijmegen" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vierde Klasse E',
    division: 'Vierde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SC Veluwezoom" },
      { name: "SC Klarenbeek" },
      { name: "Elsweide" },
      { name: "VVOVVO" },
      { name: "SV Angeren" },
      { name: "ZVV De Hoven" },
      { name: "SC Rheden" },
      { name: "Albatross" },
      { name: "VV Beekbergen" },
      { name: "VV Loenermark" },
      { name: "Groessen" },
      { name: "sv Orderbos" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse A',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Sportclub Overdinkel" },
      { name: "KOSC" },
      { name: "Buurse" },
      { name: "FC Het Centrum" },
      { name: "UDI" },
      { name: "VV Manderveen" },
      { name: "VV Langeveen" },
      { name: "Borne" },
      { name: "VV Haaksbergen" },
      { name: "Vosta" },
      { name: "Zenderen Vooruit" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse B',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Sp. Neede" },
      { name: "SC Meddo" },
      { name: "VV Diepenheim" },
      { name: "VV Wolfersveen" },
      { name: "VV Rietmolen" },
      { name: "VV DEO" },
      { name: "Hoeve Vooruit" },
      { name: "GSV '63" },
      { name: "SVBV" },
      { name: "VV Lochuizen" },
      { name: "SRC '24" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse C',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "Ulftse Boys" },
      { name: "Ajax B" },
      { name: "VV Etten" },
      { name: "AD '69" },
      { name: "SVGG" },
      { name: "HMC '17" },
      { name: "VV MEC" },
      { name: "SV Halle" },
      { name: "SV Bredevoort" },
      { name: "NVC Netterden" },
      { name: "KSV Vragender" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse D',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV Kilder" },
      { name: "HAVO" },
      { name: "Sprinkhanen" },
      { name: "SV Loil" },
      { name: "VV Montferland" },
      { name: "SV Loo" },
      { name: "SV Babberich" },
      { name: "VV Den Dam" },
      { name: "SV Gelders Eiland" },
      { name: "SDZZ" },
      { name: "PSC" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse E',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "WVW" },
      { name: "VV UHC" },
      { name: "SC DIOSA" },
      { name: "Unitas '28" },
      { name: "VV SCP" },
      { name: "VV Niftrik" },
      { name: "AAC-Olympia" },
      { name: "SV AVIOS/DBV" },
      { name: "VV Alverna" },
      { name: "SCD '33" },
      { name: "VV Aquila" },
      { name: "RODA '28" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse F',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "VV TKA" },
      { name: "VV Emst" },
      { name: "Victoria Boys" },
      { name: "WWNA" },
      { name: "SV Vaassen" },
      { name: "Eendracht Arnhem" },
      { name: "VV SHE" },
      { name: "SC EDS" },
      { name: "VV Voorst" },
      { name: "VV Arnhemia" },
      { name: "SV Wissel" },
    ],
  });
  await createLeagueWithClubs({
    name: 'Vijfde Klasse G',
    division: 'Vijfde Klasse',
    region: 'Oost',
    clubs: [
      { name: "SV Broekland" },
      { name: "DVV Go-Ahead" },
      { name: "SV Raalte" },
      { name: "DVV IJsselstreek" },
      { name: "VV Lettele" },
      { name: "VV Hoonhorst" },
      { name: "SV Nieuw Heeten" },
      { name: "SV Mariënheem" },
      { name: "Wesepe" },
      { name: "Epse" },
      { name: "DAVO" },
    ],
  });
}
main().then(() => {
  console.log('Zondag Oost clubs seeded!');
  prisma.$disconnect();
}).catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 