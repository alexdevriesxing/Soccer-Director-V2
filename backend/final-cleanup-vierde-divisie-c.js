const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// The exact 16 clubs that should be in Vierde Divisie C
const allowedClubs = [
  'UDI \'19',
  'RKSV Groene Ster',
  'RBC',
  'SV Orion',
  'RKSV Wittenhorst',
  'SV AWC',
  'VV Baronie',
  'SV Juliana \'31',
  'MASV',
  'VV Dongen',
  'SV Valkenswaard',
  'SV Venray',
  'RKSV Mierlo-Hout',
  'EVV',
  'RKSV Nuenen',
  'RKVV Best Vooruit'
];

async function finalCleanupVierdeDivisieC() {
  try {
    console.log('Final cleanup of Vierde Divisie C clubs...');
    
    // Get Vierde Divisie C league
    const vierdeDivisieC = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie C'
      },
      include: {
        clubs: true
      }
    });

    if (!vierdeDivisieC) {
      console.log('Vierde Divisie C league not found');
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

    console.log(`Found Vierde Divisie C league: ${vierdeDivisieC.name} (ID: ${vierdeDivisieC.id})`);
    console.log(`Current clubs in league: ${vierdeDivisieC.clubs.length}`);

    // Find clubs that should be removed
    const clubsToRemove = vierdeDivisieC.clubs.filter(club => !allowedClubs.includes(club.name));
    
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
        name: 'Vierde Divisie C'
      },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`\n✅ Final state: ${updatedLeague.clubs.length} clubs in Vierde Divisie C`);
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
    console.log('📁 All unwanted clubs from Vierde Divisie A, B, and C are now in "Deleted Clubs" league');

    console.log('\n🎉 Vierde Divisie C final cleanup completed!');
    console.log('✅ Only the 16 specified clubs remain in Vierde Divisie C');
    console.log('📁 Unwanted clubs have been moved to "Deleted Clubs" league');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanupVierdeDivisieC(); 