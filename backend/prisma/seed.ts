import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- REGION/LEAGUE/CLUB SEEDERS ---
// Import all region and division-specific seeders
import { seedZaterdagWest2 } from './seed/regions/zaterdagWest2';
// import { seedZaterdagWest1 } from './seed/regions/zaterdagWest1';
// import { seedZondagWest1 } from './seed/regions/zondagWest1';
import { seedO21Divisie1 } from './seed/seedO21Divisie1';
import { seedEredivisie } from './seed/seedEredivisie';
import { seedEersteDivisie } from './seed/seedEersteDivisie';
import { seedTweedeDivisie } from './seed/seedTweedeDivisie';
import { seedDerdeDivisie } from './seed/seedDerdeDivisie';
import { seedVierdeDivisie } from './seed/seedVierdeDivisie';
import { seedO21Divisie2 } from './seed/seedO21Divisie2';
import { seedO21Divisie3 } from './seed/seedO21Divisie3';
import { seedO21Divisie4A } from './seed/seedO21Divisie4A';
import { seedO21Divisie4B } from './seed/seedO21Divisie4B';
// import { seedUnassignedClubs } from './seed/seedUnassignedClubs';
// import { seedForeignPlayers } from './seed/seedForeignPlayers';

async function main() {
  // --- CLEAR ALL DATA ---
  // Clean up existing data (removed non-existent models)
  await prisma.matchEvent.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.playerContract.deleteMany(); // Added valid model
  await prisma.player.deleteMany();
  await prisma.transferOffer.deleteMany(); // Valid model
  await prisma.transferListing.deleteMany(); // Valid model
  await prisma.clubFinances.deleteMany(); // Valid model
  await prisma.clubFacility.deleteMany(); // Valid model
  await prisma.clubSeasonStats.deleteMany(); // Valid model
  await prisma.sponsorship.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.teamInCompetition.deleteMany(); // Valid model
  await prisma.club.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.league.deleteMany();

  // --- NATIONAL LEAGUES/CLUBS ---
  // (Retain your original national league/club seeding logic here)
  // ...

  // --- REGIONAL/AMATEUR LEAGUES/CLUBS ---
  await seedEredivisie(prisma);
  await seedEersteDivisie(prisma);
  await seedTweedeDivisie(prisma);
  await seedDerdeDivisie(prisma);
  await seedVierdeDivisie(prisma);

  // Create Zaterdag West 1 leagues
  const zaterdagWest1Divisions = [
    'Vijfde Klasse A',
    'Vijfde Klasse B',
    'Vijfde Klasse C',
    'Vijfde Klasse D',
    'Vijfde Klasse E'
  ];
  const zaterdagLeagues: any[] = [];
  for (const division of zaterdagWest1Divisions) {
    const league = await prisma.league.create({
      data: {
        name: `Zaterdag West 1 ${division}`,
        level: division,
        tier: 5,
        // region and season removed as they are not in schema
      },
    });
    zaterdagLeagues.push(league);
  }

  // Create Zondag West 1 leagues
  const zondagWest1Divisions = [
    'Tweede Klasse A',
    'Tweede Klasse B',
    'Derde Klasse A',
    'Derde Klasse B',
    'Vierde Klasse A',
    'Vierde Klasse B',
    'Vierde Klasse C',
    'Vijfde Klasse A'
  ];
  const zondagLeagues: any[] = [];
  for (const division of zondagWest1Divisions) {
    const league = await prisma.league.create({
      data: {
        name: `Zondag West 1 ${division}`,
        level: division,
        tier: 5,
        // region and season removed as they are not in schema
      },
    });
    zondagLeagues.push(league);
  }

  // Import locally to avoid top-level failures if files are broken
  const { seedZaterdagWest1 } = require('./seed/regions/zaterdagWest1');
  const { seedZondagWest1 } = require('./seed/regions/zondagWest1');

  await seedZaterdagWest1(prisma, zaterdagLeagues);
  await seedZondagWest1(prisma, zondagLeagues);
  await seedZaterdagWest2(prisma);
  await seedO21Divisie1(prisma);
  await seedO21Divisie2(prisma);
  await seedO21Divisie3(prisma);
  await seedO21Divisie4A(prisma);
  await seedO21Divisie4B(prisma);

  // Seed unassigned clubs
  // await seedUnassignedClubs(prisma);

  // Seed foreign clubs and players
  // await seedForeignPlayers(prisma);

  // ...add any other scripts as needed

  console.log('✅ All Dutch leagues, regions, O21, Jong, and clubs seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
