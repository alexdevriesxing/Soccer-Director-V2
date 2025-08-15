const { PrismaClient } = require('@prisma/client');
const { PromotionRelegationService } = require('./dist/services/promotionRelegationService');

const prisma = new PrismaClient();

async function testZaterdagNoordStructure() {
  try {
    console.log('🔍 Testing Zaterdag Noord Structure...\n');

    // Get all Zaterdag Noord leagues
    const zaterdagNoordLeagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Noord'
      },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            homeCity: true,
            morale: true,
            form: true
          }
        }
      },
      orderBy: [
        { division: 'asc' }
      ]
    });

    console.log(`📊 Found ${zaterdagNoordLeagues.length} Zaterdag Noord leagues:\n`);

    // Display league structure
    zaterdagNoordLeagues.forEach(league => {
      console.log(`🏆 ${league.name}`);
      console.log(`   Division: ${league.division}`);
      console.log(`   Clubs: ${league.clubs.length}`);
      console.log(`   Average Morale: ${league.clubs.length > 0 
        ? Math.round(league.clubs.reduce((sum, club) => sum + club.morale, 0) / league.clubs.length)
        : 0}`);
      
      // Show top 3 clubs by morale
      const topClubs = league.clubs
        .sort((a, b) => b.morale - a.morale)
        .slice(0, 3);
      
      if (topClubs.length > 0) {
        console.log(`   Top Clubs:`);
        topClubs.forEach((club, index) => {
          console.log(`     ${index + 1}. ${club.name} (${club.homeCity}) - Morale: ${club.morale}`);
        });
      }
      console.log('');
    });

    // Test promotion and relegation
    console.log('🔄 Testing Promotion and Relegation System...\n');

    const result = await PromotionRelegationService.handleZaterdagNoordPromotionRelegation();

    console.log(`✅ Promotion and Relegation Results:`);
    console.log(`   Promoted Clubs: ${result.promotedClubs.length}`);
    console.log(`   Relegated Clubs: ${result.relegatedClubs.length}\n`);

    if (result.promotedClubs.length > 0) {
      console.log('📈 Promoted Clubs:');
      for (const promotion of result.promotedClubs) {
        const club = await prisma.club.findUnique({
          where: { id: promotion.clubId },
          include: { league: true }
        });
        const fromLeague = await prisma.league.findUnique({
          where: { id: promotion.fromLeagueId }
        });
        const toLeague = await prisma.league.findUnique({
          where: { id: promotion.toLeagueId }
        });
        
        console.log(`   ${club.name} (${club.homeCity}): ${fromLeague.name} → ${toLeague.name}`);
      }
      console.log('');
    }

    if (result.relegatedClubs.length > 0) {
      console.log('📉 Relegated Clubs:');
      for (const relegation of result.relegatedClubs) {
        const club = await prisma.club.findUnique({
          where: { id: relegation.clubId },
          include: { league: true }
        });
        const fromLeague = await prisma.league.findUnique({
          where: { id: relegation.fromLeagueId }
        });
        const toLeague = await prisma.league.findUnique({
          where: { id: relegation.toLeagueId }
        });
        
        console.log(`   ${club.name} (${club.homeCity}): ${fromLeague.name} → ${toLeague.name}`);
      }
      console.log('');
    }

    // Get updated stats
    console.log('📊 Updated League Statistics:\n');
    const updatedLeagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Noord'
      },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            morale: true
          }
        }
      },
      orderBy: [
        { division: 'asc' }
      ]
    });

    updatedLeagues.forEach(league => {
      console.log(`🏆 ${league.name}: ${league.clubs.length} clubs`);
    });

    console.log('\n✅ Zaterdag Noord structure test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Zaterdag Noord structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testZaterdagNoordStructure(); 