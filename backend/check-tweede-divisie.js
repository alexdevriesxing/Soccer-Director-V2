const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTweedeDivisie() {
  try {
    console.log('Checking current Tweede Divisie clubs...');

    // Get Tweede Divisie league
    const tweedeDivisie = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'Tweede Divisie'
        }
      },
      include: {
        clubs: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!tweedeDivisie) {
      console.log('Tweede Divisie league not found');
      return;
    }

    console.log(`\\nTweede Divisie League: ${tweedeDivisie.name} (ID: ${tweedeDivisie.id})`);
    console.log(`Current clubs (${tweedeDivisie.clubs.length}):`);
    
    tweedeDivisie.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (ID: ${club.id})`);
      console.log(`   - Home City: ${club.homeCity}`);
      console.log(`   - Region Tag: ${club.regionTag}`);
      console.log(`   - Board Expectation: ${club.boardExpectation}`);
      console.log(`   - Kit Colors: ${club.homeKitShirt}/${club.awayKitShirt}`);
      console.log(`   - Is Jong Team: ${club.isJongTeam}`);
      console.log(`   - Parent Club ID: ${club.parentClubId}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking Tweede Divisie:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTweedeDivisie(); 