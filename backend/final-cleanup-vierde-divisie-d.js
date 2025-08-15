const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupVierdeDivisieD() {
  try {
    console.log('Cleaning up Vierde Divisie D - moving existing clubs to Deleted Clubs league...');

    // Get Vierde Divisie D league
    const vierdeDivisieD = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie D'
      }
    });

    if (!vierdeDivisieD) {
      console.log('Vierde Divisie D league not found');
      return;
    }

    console.log(`Found Vierde Divisie D league: ${vierdeDivisieD.name} (ID: ${vierdeDivisieD.id})`);

    // Get or create "Deleted Clubs" league
    let deletedClubsLeague = await prisma.league.findFirst({
      where: {
        name: 'Deleted Clubs'
      }
    });

    if (!deletedClubsLeague) {
      deletedClubsLeague = await prisma.league.create({
        data: {
          name: 'Deleted Clubs',
          tier: 999,
          region: 'System',
          division: 'Deleted'
        }
      });
      console.log('Created Deleted Clubs league');
    }

    // Get all clubs in Vierde Divisie D
    const existingClubs = await prisma.club.findMany({
      where: {
        leagueId: vierdeDivisieD.id
      }
    });

    console.log(`Found ${existingClubs.length} clubs to move`);

    // Move all clubs to Deleted Clubs league
    for (const club of existingClubs) {
      await prisma.club.update({
        where: { id: club.id },
        data: {
          leagueId: deletedClubsLeague.id
        }
      });
      console.log(`Moved: ${club.name}`);
    }

    console.log('Cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupVierdeDivisieD(); 