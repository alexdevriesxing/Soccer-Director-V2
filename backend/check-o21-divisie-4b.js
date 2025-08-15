const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkO21Divisie4B() {
  try {
    console.log('Checking current O21 Divisie 4B clubs...');

    // Get O21 Divisie 4B league
    const o21Divisie4B = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'O21 Divisie 4B'
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

    if (!o21Divisie4B) {
      console.log('O21 Divisie 4B league not found');
      return;
    }

    console.log(`\nO21 Divisie 4B League: ${o21Divisie4B.name} (ID: ${o21Divisie4B.id})`);
    console.log(`Current clubs (${o21Divisie4B.clubs.length}):`);
    
    o21Divisie4B.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (ID: ${club.id})`);
    });

  } catch (error) {
    console.error('Error checking O21 Divisie 4B:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkO21Divisie4B(); 