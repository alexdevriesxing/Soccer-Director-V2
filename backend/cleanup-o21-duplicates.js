const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupO21Duplicates() {
  try {
    console.log('Cleaning up duplicate O21 leagues...\n');

    // Get all O21_4 leagues
    const o21_4Leagues = await prisma.league.findMany({
      where: { tier: 'O21_4' },
      include: {
        _count: {
          select: {
            clubs: true
          }
        }
      },
      orderBy: [
        { division: 'asc' },
        { id: 'asc' }
      ]
    });

    console.log('Current O21_4 leagues:');
    o21_4Leagues.forEach(league => {
      console.log(`  ${league.name} (ID: ${league.id}) - Clubs: ${league._count.clubs}`);
    });

    // Group by division
    const leaguesByDivision = {};
    o21_4Leagues.forEach(league => {
      const division = league.division || 'unknown';
      if (!leaguesByDivision[division]) {
        leaguesByDivision[division] = [];
      }
      leaguesByDivision[division].push(league);
    });

    console.log('\nGrouped by division:');
    Object.entries(leaguesByDivision).forEach(([division, leagues]) => {
      console.log(`  ${division}: ${leagues.length} leagues`);
      leagues.forEach(league => {
        console.log(`    - ${league.name} (ID: ${league.id}) - Clubs: ${league._count.clubs}`);
      });
    });

    // For each division, keep the league with the most clubs, delete the rest
    const leaguesToDelete = [];
    const leaguesToKeep = [];

    Object.entries(leaguesByDivision).forEach(([division, leagues]) => {
      // Sort by club count (descending) and then by ID (ascending)
      const sortedLeagues = leagues.sort((a, b) => {
        if (b._count.clubs !== a._count.clubs) {
          return b._count.clubs - a._count.clubs;
        }
        return a.id - b.id;
      });

      // Keep the first one (most clubs or lowest ID if tied)
      const keepLeague = sortedLeagues[0];
      leaguesToKeep.push(keepLeague);

      // Mark the rest for deletion
      for (let i = 1; i < sortedLeagues.length; i++) {
        leaguesToDelete.push(sortedLeagues[i]);
      }
    });

    console.log('\nLeagues to keep:');
    leaguesToKeep.forEach(league => {
      console.log(`  ${league.name} (ID: ${league.id}) - Clubs: ${league._count.clubs}`);
    });

    console.log('\nLeagues to delete:');
    leaguesToDelete.forEach(league => {
      console.log(`  ${league.name} (ID: ${league.id}) - Clubs: ${league._count.clubs}`);
    });

    if (leaguesToDelete.length === 0) {
      console.log('\n✅ No duplicate leagues to clean up');
      return;
    }

    // Delete the duplicate leagues
    console.log('\nDeleting duplicate leagues...');
    for (const league of leaguesToDelete) {
      try {
        // Check for related data first
        const relatedData = await prisma.$transaction([
          prisma.club.count({ where: { leagueId: league.id } }),
          prisma.fixture.count({ where: { leagueId: league.id } }),
          prisma.clubSeasonStats.count({ where: { leagueId: league.id } })
        ]);

        const [clubCount, fixtureCount, statsCount] = relatedData;

        if (clubCount > 0 || fixtureCount > 0) {
          console.log(`  Skipping ${league.name} (ID: ${league.id}) - has related data: ${clubCount} clubs, ${fixtureCount} fixtures, ${statsCount} stats`);
          continue;
        }

        // Delete related ClubSeasonStats first
        if (statsCount > 0) {
          await prisma.clubSeasonStats.deleteMany({ where: { leagueId: league.id } });
          console.log(`  Deleted ${statsCount} ClubSeasonStats for league ${league.name} (ID: ${league.id})`);
        }

        await prisma.league.delete({
          where: { id: league.id }
        });
        console.log(`  Deleted: ${league.name} (ID: ${league.id})`);
      } catch (error) {
        console.log(`  Error deleting ${league.name} (ID: ${league.id}): ${error.message}`);
      }
    }

    console.log('\n✅ Cleanup completed successfully');

    // Verify the final structure
    const finalLeagues = await prisma.league.findMany({
      where: { tier: 'O21_4' },
      include: {
        _count: {
          select: {
            clubs: true
          }
        }
      },
      orderBy: [
        { division: 'asc' },
        { id: 'asc' }
      ]
    });

    console.log('\nFinal O21_4 structure:');
    finalLeagues.forEach(league => {
      console.log(`  ${league.name} (ID: ${league.id}) - Clubs: ${league._count.clubs}`);
    });

  } catch (error) {
    console.error('Error cleaning up O21 duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupO21Duplicates(); 