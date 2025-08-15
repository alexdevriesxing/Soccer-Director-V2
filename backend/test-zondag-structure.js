const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testZondagStructure() {
  try {
    console.log('Testing Zondag league structure...\n');

    // Test Zondag regions
    const zondagRegions = ['Zondag Noord', 'Zondag Oost', 'Zondag West 1', 'Zondag West 2', 'Zondag Zuid 1', 'Zondag Zuid 2'];
    
    for (const region of zondagRegions) {
      console.log(`\n=== ${region} ===`);
      
      // Get all leagues for this region
      const leagues = await prisma.league.findMany({
        where: { region: region },
        include: {
          clubs: true
        },
        orderBy: { name: 'asc' }
      });

      console.log(`Total leagues: ${leagues.length}`);
      
      for (const league of leagues) {
        console.log(`  ${league.name}: ${league.clubs.length} clubs`);
      }
      
      const totalClubs = leagues.reduce((sum, league) => sum + league.clubs.length, 0);
      console.log(`Total clubs in ${region}: ${totalClubs}`);
    }

    // Test national clubs with regionTags
    console.log('\n=== National Clubs with Region Tags ===');
    const nationalClubs = await prisma.club.findMany({
      where: {
        league: {
          tier: {
            in: ['EREDIVISIE', 'EERSTE_DIVISIE', 'TWEEDE_DIVISIE', 'DERDE_DIVISIE', 'VIERDE_DIVISIE']
          }
        }
      },
      include: {
        league: true
      },
      orderBy: [
        { league: { tier: 'asc' } },
        { name: 'asc' }
      ]
    });

    const regionTagCounts = {};
    for (const club of nationalClubs) {
      if (club.regionTag) {
        regionTagCounts[club.regionTag] = (regionTagCounts[club.regionTag] || 0) + 1;
      }
    }

    console.log('Region tag distribution:');
    for (const [region, count] of Object.entries(regionTagCounts)) {
      console.log(`  ${region}: ${count} clubs`);
    }

    console.log(`\nTotal national clubs: ${nationalClubs.length}`);

    // Test overall structure
    console.log('\n=== Overall Structure ===');
    const allLeagues = await prisma.league.findMany({
      include: {
        clubs: true
      },
      orderBy: { name: 'asc' }
    });

    const tierCounts = {};
    const regionCounts = {};
    
    for (const league of allLeagues) {
      tierCounts[league.tier] = (tierCounts[league.tier] || 0) + 1;
      if (league.region) {
        regionCounts[league.region] = (regionCounts[league.region] || 0) + 1;
      }
    }

    console.log('League tiers:');
    for (const [tier, count] of Object.entries(tierCounts)) {
      console.log(`  ${tier}: ${count} leagues`);
    }

    console.log('\nRegions:');
    for (const [region, count] of Object.entries(regionCounts)) {
      console.log(`  ${region}: ${count} leagues`);
    }

    const totalClubs = allLeagues.reduce((sum, league) => sum + league.clubs.length, 0);
    console.log(`\nTotal clubs in database: ${totalClubs}`);

  } catch (error) {
    console.error('Error testing structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testZondagStructure(); 