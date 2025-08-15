const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const leagueName = 'West 1 Eerste Klasse A';
const regionTag = 'West 1';
const division = 'Eerste Klasse A';
const season = '2024/2025';
const keepLeagueId = 971; // The correct league ID

const validClubNames = [
  'SV Hoofddorp',
  'FC Aalsmeer',
  'RKVV Velsen',
  'VIOS W',
  'CSV BOL',
  'Sporting Martinus',
  "Vitesse '22",
  'VV ZOB',
  'SV Hillegom',
  'HBOK',
  'VV HSV',
  'VV De Zouaven',
  'ZSGOWMS',
  'VV AGB'
];

async function cleanup() {
  try {
    // 1. Delete duplicate leagues
    const leagues = await prisma.league.findMany({
      where: {
        name: leagueName,
        region: regionTag,
        division: division,
        season: season,
        NOT: { id: keepLeagueId }
      }
    });
    for (const league of leagues) {
      // Find all clubs in this league
      const leagueClubs = await prisma.club.findMany({ where: { leagueId: league.id } });
      for (const club of leagueClubs) {
        // Delete related data
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({ where: { OR: [{ homeClubId: club.id }, { awayClubId: club.id }] } });
        // Delete the club
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`Deleted club and related data: ${club.name}`);
      }
      // Delete the league
      await prisma.league.delete({ where: { id: league.id } });
      console.log(`Deleted duplicate league: ${league.name} (ID: ${league.id})`);
    }

    // 2. Delete clubs not in the valid list from the correct league
    const clubs = await prisma.club.findMany({ where: { leagueId: keepLeagueId } });
    for (const club of clubs) {
      if (!validClubNames.includes(club.name)) {
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`Deleted club not in list: ${club.name}`);
      }
    }

    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 