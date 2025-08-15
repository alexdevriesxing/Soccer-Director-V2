const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVierdeDivisieA() {
  try {
    console.log('Checking current Vierde Divisie A clubs...');

    // Get Vierde Divisie A league
    const vierdeDivisieA = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'Vierde Divisie A'
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

    if (!vierdeDivisieA) {
      console.log('Vierde Divisie A league not found');
      return;
    }

    console.log(`\nVierde Divisie A League: ${vierdeDivisieA.name} (ID: ${vierdeDivisieA.id})`);
    console.log(`Current clubs (${vierdeDivisieA.clubs.length}):`);
    
    vierdeDivisieA.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} - ${club.homeCity || 'Unknown'} (${club.regionTag || 'No region'})`);
    });

  } catch (error) {
    console.error('Error checking Vierde Divisie A:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVierdeDivisieA(); 