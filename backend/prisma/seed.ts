import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- REGION/LEAGUE/CLUB SEEDERS ---
// Import all region and division-specific seeders
import { seedZaterdagWest1 } from './seed/regions/zaterdagWest1';
import { seedZondagWest1 } from './seed/regions/zondagWest1';
import { seedZaterdagWest2 } from './seed/regions/zaterdagWest2';
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
import { seedUnassignedClubs } from './seed/seedUnassignedClubs';
import { seedForeignPlayers } from './seed/seedForeignPlayers';

async function main() {
  // --- CLEAR ALL DATA ---
  await prisma.internationalMatchEvent.deleteMany();
  await prisma.internationalMatch.deleteMany();
  await prisma.internationalPlayer.deleteMany();
  await prisma.internationalManager.deleteMany();
  await prisma.competitionStage.deleteMany();
  await prisma.internationalCompetition.deleteMany();
  await prisma.nationalTeam.deleteMany();
  await prisma.gateReceipt.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.staffContract.deleteMany();
  await prisma.clubFinances.deleteMany();
  await prisma.tVRights.deleteMany();
  await prisma.trainingFocus.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.player.deleteMany();
  await prisma.clubFormation.deleteMany();
  await prisma.clubStrategy.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.club.deleteMany();
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
        division,
        region: 'West 1',
        tier: 'AMATEUR',
        season: '2024/2025',
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
        division,
        region: 'West 1',
        tier: 'AMATEUR',
        season: '2024/2025',
      },
    });
    zondagLeagues.push(league);
  }

  await seedZaterdagWest1(prisma, zaterdagLeagues);
  await seedZondagWest1(prisma, zondagLeagues);
  await seedZaterdagWest2(prisma);
  await seedO21Divisie1(prisma);
  await seedO21Divisie2(prisma);
  await seedO21Divisie3(prisma);
  await seedO21Divisie4A(prisma);
  await seedO21Divisie4B(prisma);

  // Seed unassigned clubs
  await seedUnassignedClubs(prisma);

  // Seed foreign clubs and players
  await seedForeignPlayers(prisma);

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
