import { PrismaClient } from '@prisma/client';

// Keep for standalone testing
let prisma: PrismaClient;

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getKitColors(_name: string) {
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

async function createLeagueWithClubs(prismaClient: PrismaClient, { name, division, region: _region, clubs }: { name: string; division: string; region: string; clubs: any[] }) {
  // Prisma upsert requires a unique constraint. We'll use findFirst + create if not found.
  let league = await prismaClient.league.findFirst({
    where: {
      name,
      level: division,
      // division, region, season removed as they don't exist in League model
    },
  });
  if (!league) {
    league = await prismaClient.league.create({
      data: {
        name,
        level: division,
        tier: 5,
        // region: 'West 1',
        // season: '2026/2027',
      },
    });
  }
  for (let i = 0; i < clubs.length; i++) {
    const c = clubs[i];
    const kit = getKitColors(c.name);
    await prismaClient.club.create({
      data: {
        name: c.name,
        city: c.city || getHomeCity(c.name),
        boardExpectation: c.boardExpectation || getBoardExpectation(i + 1, clubs.length),
        morale: getMorale(i + 1, clubs.length),
        primaryColor: kit.homeKitShirt,
        secondaryColor: kit.awayKitShirt,
        // regionTag removed
        // kit fields mapped to primary/secondary colors
        leagueId: league.id,
      },
    });
  }
}

export async function seedZaterdagWest2(prismaClient: PrismaClient) {
  // Example for Tweede Klasse C
  await createLeagueWithClubs(prismaClient, {
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
  prisma = new PrismaClient();
  seedZaterdagWest2(prisma).then(() => {
    console.log('✅ Zaterdag West 2 seeded!');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
