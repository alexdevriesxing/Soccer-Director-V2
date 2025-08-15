const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testZaterdagZuid() {
  console.log('Testing Zaterdag Zuid Structure...\n');

  try {
    // Get all Zaterdag Zuid leagues
    const zaterdagZuidLeagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Zuid'
      },
      include: {
        clubs: true
      }
    });

    console.log(`Found ${zaterdagZuidLeagues.length} Zaterdag Zuid leagues:\n`);

    let totalClubs = 0;

    for (const league of zaterdagZuidLeagues) {
      console.log(`🏆 ${league.name}`);
      console.log(`   Division: ${league.division}`);
      console.log(`   Clubs: ${league.clubs.length}`);
      
      if (league.clubs.length > 0) {
        const avgMorale = league.clubs.reduce((sum, club) => sum + club.morale, 0) / league.clubs.length;
        console.log(`   Average Morale: ${Math.round(avgMorale)}`);
        
        // Show top 3 clubs by morale
        const topClubs = league.clubs
          .sort((a, b) => b.morale - a.morale)
          .slice(0, 3);
        
        console.log(`   Top Clubs:`);
        topClubs.forEach((club, index) => {
          console.log(`     ${index + 1}. ${club.name} (${club.homeCity}) - Morale: ${club.morale}`);
        });
      }
      
      totalClubs += league.clubs.length;
      console.log('');
    }

    console.log(`Total clubs in Zaterdag Zuid: ${totalClubs}`);

    // Check if Willem II (amateurs) was added correctly
    const willemIIAmateurs = await prisma.club.findFirst({
      where: {
        name: 'Willem II (amateurs)'
      }
    });

    if (willemIIAmateurs) {
      console.log(`✅ Willem II (amateurs) found in league: ${willemIIAmateurs.leagueId}`);
    } else {
      console.log('❌ Willem II (amateurs) not found');
    }

    // Check for other clubs that should have (amateurs) suffix
    const clubsToCheck = [
      'MVV \'58',
      'NAC \'67',
      'Roda Boys/B'
    ];

    console.log('\nChecking clubs that might need (amateurs) suffix:');
    for (const clubName of clubsToCheck) {
      const club = await prisma.club.findFirst({
        where: {
          name: clubName
        }
      });
      
      if (club) {
        console.log(`✅ ${clubName} found`);
      } else {
        console.log(`❌ ${clubName} not found`);
      }
    }

    console.log('\n✅ Zaterdag Zuid structure test completed successfully!');

  } catch (error) {
    console.error('Error testing Zaterdag Zuid structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testZaterdagZuid(); 