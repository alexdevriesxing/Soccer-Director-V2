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

async function forceCleanupVierdeDivisieA() {
  try {
    console.log('Force cleaning up Vierde Divisie A clubs...');
    
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

    console.log(`Found Vierde Divisie A league: ${vierdeDivisieA.name} (ID: ${vierdeDivisieA.id})`);
    console.log(`Current clubs in league: ${vierdeDivisieA.clubs.length}`);

    // Find clubs that should be removed
    const clubsToRemove = vierdeDivisieA.clubs.filter(club => !allowedClubs.includes(club.name));
    
    console.log(`\nClubs to remove: ${clubsToRemove.length}`);
    clubsToRemove.forEach(club => {
      console.log(`- ${club.name} (ID: ${club.id})`);
    });

    // First, try to update these clubs to remove their league association
    for (const club of clubsToRemove) {
      try {
        await prisma.club.update({
          where: { id: club.id },
          data: {
            leagueId: null
          }
        });
        console.log(`✅ Removed league association from ${club.name}`);
      } catch (err) {
        console.log(`❌ Failed to remove league association from ${club.name}: ${err.message}`);
      }
    }

    // Now try to delete the clubs completely
    for (const club of clubsToRemove) {
      try {
        await prisma.club.delete({
          where: { id: club.id }
        });
        console.log(`🗑️  Deleted club: ${club.name}`);
      } catch (err) {
        console.log(`⚠️  Could not delete ${club.name} (likely still referenced elsewhere): ${err.message}`);
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

    console.log('\n🎉 Vierde Divisie A force cleanup completed!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCleanupVierdeDivisieA(); 