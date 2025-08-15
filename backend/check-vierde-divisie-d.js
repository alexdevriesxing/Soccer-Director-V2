const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVierdeDivisieD() {
  try {
    console.log('Checking current Vierde Divisie D clubs...');

    // Get Vierde Divisie D league
    const vierdeDivisieD = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'Vierde Divisie D'
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

    if (!vierdeDivisieD) {
      console.log('Vierde Divisie D league not found');
      return;
    }

    console.log(`\nVierde Divisie D League: ${vierdeDivisieD.name} (ID: ${vierdeDivisieD.id})`);
    console.log(`Current clubs (${vierdeDivisieD.clubs.length}):`);
    
    vierdeDivisieD.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} - ${club.homeCity || 'Unknown'} (${club.regionTag || 'No region'})`);
    });

  } catch (error) {
    console.error('Error checking Vierde Divisie D:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVierdeDivisieD(); 