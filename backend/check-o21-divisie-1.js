const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkO21Divisie1() {
  try {
    console.log('Checking current O21 Divisie 1 clubs...');

    // Get O21 Divisie 1 league
    const o21Divisie1 = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'O21 Divisie 1'
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

    if (!o21Divisie1) {
      console.log('O21 Divisie 1 league not found');
      return;
    }

    console.log(`\nO21 Divisie 1 League: ${o21Divisie1.name} (ID: ${o21Divisie1.id})`);
    console.log(`Current clubs (${o21Divisie1.clubs.length}):`);
    
    o21Divisie1.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} - ${club.homeCity || 'Unknown'} (${club.regionTag || 'No region'})`);
    });

  } catch (error) {
    console.error('Error checking O21 Divisie 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkO21Divisie1(); 