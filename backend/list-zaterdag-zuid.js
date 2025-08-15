const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listZaterdagZuidTeams() {
  console.log('📋 Zaterdag Zuid Teams - Complete List\n');

  try {
    // Get all Zaterdag Zuid leagues
    const zaterdagZuidLeagues = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Zuid'
      },
      include: {
        clubs: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    for (const league of zaterdagZuidLeagues) {
      console.log(`🏆 ${league.name}`);
      console.log(`   Division: ${league.division}`);
      console.log(`   Total Clubs: ${league.clubs.length}`);
      console.log('');
      
      if (league.clubs.length > 0) {
        console.log('   Clubs:');
        league.clubs.forEach((club, index) => {
          console.log(`   ${index + 1}. ${club.name} (${club.homeCity})`);
        });
      } else {
        console.log('   No clubs found');
      }
      
      console.log('');
      console.log('─'.repeat(80));
      console.log('');
    }

    // Summary
    const totalClubs = zaterdagZuidLeagues.reduce((sum, league) => sum + league.clubs.length, 0);
    console.log(`📊 SUMMARY:`);
    console.log(`Total Zaterdag Zuid leagues: ${zaterdagZuidLeagues.length}`);
    console.log(`Total Zaterdag Zuid clubs: ${totalClubs}`);
    
    // List by division
    console.log('\n📋 BY DIVISION:');
    const divisions = {};
    zaterdagZuidLeagues.forEach(league => {
      if (!divisions[league.division]) {
        divisions[league.division] = [];
      }
      league.clubs.forEach(club => {
        divisions[league.division].push(club);
      });
    });

    Object.entries(divisions).forEach(([division, clubs]) => {
      console.log(`\n${division} (${clubs.length} clubs):`);
      clubs.sort((a, b) => a.name.localeCompare(b.name)).forEach(club => {
        console.log(`  - ${club.name} (${club.homeCity})`);
      });
    });

  } catch (error) {
    console.error('Error listing Zaterdag Zuid teams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listZaterdagZuidTeams(); 