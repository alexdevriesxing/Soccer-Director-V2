const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// The exact 16 clubs that should be in Vierde Divisie A
const allowedClubs = [
  'VV Scherpenzeel',
  'JOS Watergraafsmeer',
  'Kampong',
  'VV SJC',
  'VV Hoogland',
  'AFC \'34',
  'HVV Hollandia',
  'AVV Swift',
  'SDV Barneveld',
  'Purmersteijn',
  'ODIN \'59',
  'DVVA',
  'VVOG Harderwijk',
  'Ter Leede',
  'Kolping Boys',
  'HSV De Zuidvogels'
];

async function finalCleanupVierdeDivisieA() {
  try {
    console.log('Final cleanup of Vierde Divisie A clubs...');
    
    // Get Vierde Divisie A league
    const vierdeDivisieA = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie A'
      },
      include: {
        clubs: true
      }
    });

    if (!vierdeDivisieA) {
      console.log('Vierde Divisie A league not found');
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

    console.log(`Found Vierde Divisie A league: ${vierdeDivisieA.name} (ID: ${vierdeDivisieA.id})`);
    console.log(`Current clubs in league: ${vierdeDivisieA.clubs.length}`);

    // Find clubs that should be removed
    const clubsToRemove = vierdeDivisieA.clubs.filter(club => !allowedClubs.includes(club.name));
    
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
        name: 'Vierde Divisie A'
      },
      include: {
        clubs: {
          orderBy: { name: 'asc' }
        }
      }
    });

    console.log(`\n✅ Final state: ${updatedLeague.clubs.length} clubs in Vierde Divisie A`);
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

    console.log(`\n📁 Clubs moved to "Deleted Clubs" league: ${deletedLeagueClubs.clubs.length}`);
    deletedLeagueClubs.clubs.forEach(club => {
      console.log(`- ${club.name}`);
    });

    console.log('\n🎉 Vierde Divisie A final cleanup completed!');
    console.log('✅ Only the 16 specified clubs remain in Vierde Divisie A');
    console.log('📁 Unwanted clubs have been moved to "Deleted Clubs" league');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanupVierdeDivisieA(); 