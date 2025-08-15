const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testZaterdagWestStructures() {
  try {
    console.log('Testing Zaterdag West 1 and West 2 structures...\n');

    // Get all Zaterdag West 1 leagues
    const zaterdagWest1Leagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag West 1'
      },
      include: {
        clubs: true
      }
    });

    // Get all Zaterdag West 2 leagues
    const zaterdagWest2Leagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag West 2'
      },
      include: {
        clubs: true
      }
    });

    console.log(`Found ${zaterdagWest1Leagues.length} Zaterdag West 1 leagues:`);
    zaterdagWest1Leagues.forEach(league => {
      console.log(`  - ${league.name}: ${league.clubs.length} clubs`);
    });

    console.log(`\nFound ${zaterdagWest2Leagues.length} Zaterdag West 2 leagues:`);
    zaterdagWest2Leagues.forEach(league => {
      console.log(`  - ${league.name}: ${league.clubs.length} clubs`);
    });

    // Count total clubs in Zaterdag West 1
    const totalClubsWest1 = zaterdagWest1Leagues.reduce((total, league) => total + league.clubs.length, 0);
    console.log(`\nTotal clubs in Zaterdag West 1: ${totalClubsWest1}`);

    // Count total clubs in Zaterdag West 2
    const totalClubsWest2 = zaterdagWest2Leagues.reduce((total, league) => total + league.clubs.length, 0);
    console.log(`Total clubs in Zaterdag West 2: ${totalClubsWest2}`);

    // Check if Vierde Divisie clubs can be relegated to Zaterdag West 1 or West 2
    const vierdeDivisie = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie'
      },
      include: {
        clubs: true
      }
    });

    if (vierdeDivisie) {
      console.log(`\nVierde Divisie has ${vierdeDivisie.clubs.length} clubs that can be relegated to Zaterdag West 1 or West 2`);
    }

    console.log('\n✅ Zaterdag West 1 and West 2 structure test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Zaterdag West structures:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testZaterdagWestStructures(); 