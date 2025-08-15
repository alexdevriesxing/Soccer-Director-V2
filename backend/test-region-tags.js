const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRegionTags() {
  console.log('Testing regionTags for all national division clubs...\n');

  try {
    // Get all national division leagues
    const nationalLeagues = await prisma.league.findMany({
      where: {
        tier: {
          in: ['EREDIVISIE', 'EERSTE_DIVISIE', 'TWEEDE_DIVISIE', 'DERDE_DIVISIE', 'VIERDE_DIVISIE']
        }
      },
      include: {
        clubs: true
      }
    });

    console.log('National Division Clubs with Region Tags:\n');

    for (const league of nationalLeagues) {
      console.log(`${league.name} (${league.tier}):`);
      
      if (league.clubs.length === 0) {
        console.log('  No clubs found');
        continue;
      }

      // Group clubs by regionTag
      const clubsByRegion = {};
      league.clubs.forEach(club => {
        const region = club.regionTag || 'No region tag';
        if (!clubsByRegion[region]) {
          clubsByRegion[region] = [];
        }
        clubsByRegion[region].push(club);
      });

      // Display clubs grouped by region
      for (const [region, clubs] of Object.entries(clubsByRegion)) {
        console.log(`  ${region} (${clubs.length} clubs):`);
        clubs.forEach(club => {
          console.log(`    - ${club.name} (${club.homeCity})`);
        });
      }
      console.log('');
    }

    // Summary statistics
    console.log('Summary Statistics:');
    console.log('==================');
    
    const allNationalClubs = nationalLeagues.flatMap(league => league.clubs);
    const clubsWithRegionTags = allNationalClubs.filter(club => club.regionTag);
    const clubsWithoutRegionTags = allNationalClubs.filter(club => !club.regionTag);
    
    console.log(`Total national division clubs: ${allNationalClubs.length}`);
    console.log(`Clubs with region tags: ${clubsWithRegionTags.length}`);
    console.log(`Clubs without region tags: ${clubsWithoutRegionTags.length}`);
    
    if (clubsWithoutRegionTags.length > 0) {
      console.log('\nClubs missing region tags:');
      clubsWithoutRegionTags.forEach(club => {
        console.log(`  - ${club.name} (${club.homeCity}) in ${club.league?.name}`);
      });
    }

    // Check region distribution
    const regionDistribution = {};
    clubsWithRegionTags.forEach(club => {
      regionDistribution[club.regionTag] = (regionDistribution[club.regionTag] || 0) + 1;
    });

    console.log('\nRegion Distribution:');
    Object.entries(regionDistribution).forEach(([region, count]) => {
      console.log(`  ${region}: ${count} clubs`);
    });

    console.log('\n✅ Region tags test completed successfully!');

  } catch (error) {
    console.error('Error testing region tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegionTags(); 