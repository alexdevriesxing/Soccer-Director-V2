const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testO21Leagues() {
  try {
    console.log('Testing O21 league structure...\n');

    // Get all O21 leagues
    const o21Leagues = await prisma.league.findMany({
      where: {
        tier: { startsWith: 'O21' }
      },
      include: {
        _count: {
          select: {
            clubs: true
          }
        }
      },
      orderBy: [
        { tier: 'asc' },
        { division: 'asc' }
      ]
    });

    console.log('All O21 Leagues:');
    console.log('================');
    
    o21Leagues.forEach(league => {
      console.log(`${league.name} (ID: ${league.id})`);
      console.log(`  Tier: ${league.tier}`);
      console.log(`  Division: ${league.division || 'N/A'}`);
      console.log(`  Region: ${league.region}`);
      console.log(`  Clubs: ${league._count.clubs}`);
      console.log('');
    });

    // Test the API structure
    console.log('API Structure Test:');
    console.log('===================');
    
    // Simulate the API grouping logic
    const leaguesByRegion = o21Leagues.reduce((acc, league) => {
      const region = league.region || 'Other';
      
      if (!acc[region]) {
        acc[region] = [];
      }
      
      acc[region].push({
        id: league.id,
        name: league.name,
        tier: league.tier,
        division: league.division,
        season: league.season,
        clubsCount: league._count.clubs
      });
      
      return acc;
    }, {});

    Object.entries(leaguesByRegion).forEach(([region, leagues]) => {
      console.log(`Region: ${region}`);
      leagues.forEach(league => {
        console.log(`  - ${league.name} (${league.tier}, Division: ${league.division || 'N/A'}, Clubs: ${league.clubsCount})`);
      });
      console.log('');
    });

    // Check specific O21_4 leagues
    console.log('O21_4 Tier Details:');
    console.log('===================');
    
    const o21_4Leagues = o21Leagues.filter(league => league.tier === 'O21_4');
    for (const league of o21_4Leagues) {
      console.log(`${league.name}:`);
      console.log(`  - Division: ${league.division}`);
      console.log(`  - Clubs: ${league._count.clubs}`);
      
      // Get club details
      const clubs = await prisma.club.findMany({
        where: { leagueId: league.id },
        select: { name: true }
      });
      
      if (clubs.length > 0) {
        console.log(`  - Club names: ${clubs.map(c => c.name).join(', ')}`);
      }
      console.log('');
    }

    console.log('✅ O21 league structure test completed');

  } catch (error) {
    console.error('Error testing O21 leagues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testO21Leagues(); 