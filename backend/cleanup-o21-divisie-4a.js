const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupO21Divisie4A() {
  try {
    console.log('Cleaning up O21 Divisie 4A - moving existing clubs to Deleted Clubs league...');

    // Get O21 Divisie 4A league
    const o21Divisie4A = await prisma.league.findFirst({ where: { name: 'O21 Divisie 4A' } });
    if (!o21Divisie4A) {
      console.log('O21 Divisie 4A league not found');
      return;
    }
    let deletedClubsLeague = await prisma.league.findFirst({ where: { name: 'Deleted Clubs' } });
    if (!deletedClubsLeague) {
      deletedClubsLeague = await prisma.league.create({ data: { name: 'Deleted Clubs', tier: '999', region: 'Deleted', season: '2024/25' } });
      console.log('Created Deleted Clubs league');
    }
    const clubsToMove = await prisma.club.findMany({ where: { leagueId: o21Divisie4A.id } });
    for (const club of clubsToMove) {
      await prisma.club.update({ where: { id: club.id }, data: { leagueId: deletedClubsLeague.id } });
      console.log(`Moved ${club.name} to Deleted Clubs`);
    }
    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Error cleaning up O21 Divisie 4A:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupO21Divisie4A(); 