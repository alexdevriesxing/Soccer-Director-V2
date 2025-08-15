const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVierdeDivisieB() {
  try {
    console.log('Checking current Vierde Divisie B clubs...');

    // Get Vierde Divisie B league
    const vierdeDivisieB = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'Vierde Divisie B'
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

    if (!vierdeDivisieB) {
      console.log('Vierde Divisie B league not found');
      return;
    }

    console.log(`\nVierde Divisie B League: ${vierdeDivisieB.name} (ID: ${vierdeDivisieB.id})`);
    console.log(`Current clubs (${vierdeDivisieB.clubs.length}):`);
    
    vierdeDivisieB.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} - ${club.homeCity || 'Unknown'} (${club.regionTag || 'No region'})`);
    });

  } catch (error) {
    console.error('Error checking Vierde Divisie B:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVierdeDivisieB(); 