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
    homeKitShirt: '#ff6b6b',
    homeKitShorts: '#cc5555',
    homeKitSocks: '#ff6b6b',
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

async function createLeagueWithClubs({ name, division, region, clubs }: { name: string; division: string; region: string; clubs: any[] }) {
  // Prisma upsert requires a unique constraint. We'll use findFirst + create if not found.
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
        regionTag: 'Zaterdag West 2',
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

export async function seedZaterdagWest2(prisma: PrismaClient) {
  // Example for Tweede Klasse C
  await createLeagueWithClubs({
    name: 'Zaterdag West 2 Tweede Klasse C',
    division: 'Tweede Klasse',
    region: 'Zaterdag West 2',
    clubs: [
      { name: 'RCL' },
      { name: 'Alphia' },
      { name: "SVC '08" },
      { name: 'VV Nieuwerkerk' },
      { name: "VV Alexandria '66" },
      { name: 'Graaf Willem II/VAC' },
      { name: 'Foreholte' },
      { name: 'SV Nootdorp' },
      { name: 'SV DONK' },
      { name: 'OLIVEO' },
      { name: 'CVV Zwervers' },
      { name: "TAC '90" },
      { name: 'VV Koudekerk' },
      { name: 'SV Die Haghe' },
    ],
  });
  // Repeat for all other divisions (fill in clubs for each)
  // ...
}

if (require.main === module) {
  seedZaterdagWest2(prisma).then(() => {
    console.log('✅ Zaterdag West 2 seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
