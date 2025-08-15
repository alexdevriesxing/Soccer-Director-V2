const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupO21Divisie2() {
  try {
    console.log('Cleaning up O21 Divisie 2 - moving existing clubs to Deleted Clubs league...');

    // Get O21 Divisie 2 league
    const o21Divisie2 = await prisma.league.findFirst({
      where: {
        name: 'O21 Divisie 2'
      }
    });

    if (!o21Divisie2) {
      console.log('O21 Divisie 2 league not found');
      return;
    }

    console.log(`Found O21 Divisie 2 league: ${o21Divisie2.name} (ID: ${o21Divisie2.id})`);

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
          region: 'Deleted'
        }
      });
      console.log('Created Deleted Clubs league');
    }

    // Get all clubs in O21 Divisie 2
    const clubsToMove = await prisma.club.findMany({
      where: {
        leagueId: o21Divisie2.id
      }
    });

    console.log(`Found ${clubsToMove.length} clubs to move to Deleted Clubs`);

    // Move each club to Deleted Clubs league
    for (const club of clubsToMove) {
      await prisma.club.update({
        where: { id: club.id },
        data: { leagueId: deletedClubsLeague.id }
      });
      console.log(`Moved ${club.name} to Deleted Clubs`);
    }

    console.log('\nCleanup complete! All existing O21 Divisie 2 clubs moved to Deleted Clubs.');

  } catch (error) {
    console.error('Error cleaning up O21 Divisie 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupO21Divisie2(); 