const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupO21Divisie1() {
  try {
    console.log('Cleaning up O21 Divisie 1 - moving existing clubs to Deleted Clubs league...');

    // Get O21 Divisie 1 league
    const o21Divisie1 = await prisma.league.findFirst({
      where: {
        name: 'O21 Divisie 1'
      }
    });

    if (!o21Divisie1) {
      console.log('O21 Divisie 1 league not found');
      return;
    }

    console.log(`Found O21 Divisie 1 league: ${o21Divisie1.name} (ID: ${o21Divisie1.id})`);

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

    // Get all clubs in O21 Divisie 1
    const existingClubs = await prisma.club.findMany({
      where: {
        leagueId: o21Divisie1.id
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

cleanupO21Divisie1(); 