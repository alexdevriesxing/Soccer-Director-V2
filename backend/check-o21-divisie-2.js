const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkO21Divisie2() {
  try {
    console.log('Checking current O21 Divisie 2 clubs...');

    // Get O21 Divisie 2 league
    const o21Divisie2 = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'O21 Divisie 2'
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

    if (!o21Divisie2) {
      console.log('O21 Divisie 2 league not found');
      return;
    }

    console.log(`\nO21 Divisie 2 League: ${o21Divisie2.name} (ID: ${o21Divisie2.id})`);
    console.log(`Current clubs (${o21Divisie2.clubs.length}):`);
    
    o21Divisie2.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (ID: ${club.id})`);
    });

  } catch (error) {
    console.error('Error checking O21 Divisie 2:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkO21Divisie2(); 