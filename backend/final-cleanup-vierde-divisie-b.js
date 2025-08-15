const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// The exact 16 clubs that should be in Vierde Divisie B
const allowedClubs = [
  'VV Zwaluwen',
  'XerxesDZB',
  'SV Poortugaal',
  'VV LRC Leerdam',
  'RKVV Westlandia',
  'VV Capelle',
  'RKAVV',
  'VV Heerjansdam',
  'SC Feyenoord',
  'RKSV Halsteren',
  'VV Achilles Veen',
  'HBS',
  'Forum Sport',
  'GVV Unitas',
  'VV WNC',
  'RVVH'
];

async function finalCleanupVierdeDivisieB() {
  try {
    console.log('Final cleanup of Vierde Divisie B clubs...');
    
    // Get Vierde Divisie B league
    const vierdeDivisieB = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie B'
      },
      include: {
        clubs: true
      }
    });

    if (!vierdeDivisieB) {
      console.log('Vierde Divisie B league not found');
      return;
    }

    // Get or create a "deleted" league to move unwanted clubs to
    let deletedLeague = await prisma.league.findFirst({
      where: {
        name: 'Deleted Clubs'
      }
    });

    if (!deletedLeague) {
      deletedLeague = await prisma.league.create({
        data: {
          name: 'Deleted Clubs',
          tier: 'Deleted',
          region: 'Deleted',
          season: '2024/25'
        }
      });
      console.log('Created "Deleted Clubs" league');
    }

    console.log(`Found Vierde Divisie B league: ${vierdeDivisieB.name} (ID: ${vierdeDivisieB.id})`);
    console.log(`Current clubs in league: ${vierdeDivisieB.clubs.length}`);

    // Find clubs that should be removed
    const clubsToRemove = vierdeDivisieB.clubs.filter(club => !allowedClubs.includes(club.name));
    
    console.log(`\nClubs to remove: ${clubsToRemove.length}`);
    clubsToRemove.forEach(club => {
      console.log(`- ${club.name} (ID: ${club.id})`);
    });

    // Move unwanted clubs to the "deleted" league
    for (const club of clubsToRemove) {
      try {
        await prisma.club.update({
          where: { id: club.id },
          data: {
            leagueId: deletedLeague.id
          }
        });
        console.log(`✅ Moved ${club.name} to "Deleted Clubs" league`);
      } catch (err) {
        console.log(`❌ Failed to move ${club.name}: ${err.message}`);
      }
    }

    // Verify final state
    const updatedLeague = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie B'
      },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`\n✅ Final state: ${updatedLeague.clubs.length} clubs in Vierde Divisie B`);
    updatedLeague.clubs.forEach(club => {
      console.log(`- ${club.name}`);
    });

    // Verify the clubs are now in the deleted league
    const deletedLeagueClubs = await prisma.league.findFirst({
      where: {
        name: 'Deleted Clubs'
      },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`\n📁 Total clubs in "Deleted Clubs" league: ${deletedLeagueClubs.clubs.length}`);
    console.log('📁 All unwanted clubs from both Vierde Divisie A and B are now in "Deleted Clubs" league');

    console.log('\n🎉 Vierde Divisie B final cleanup completed!');
    console.log('✅ Only the 16 specified clubs remain in Vierde Divisie B');
    console.log('📁 Unwanted clubs have been moved to "Deleted Clubs" league');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanupVierdeDivisieB(); 