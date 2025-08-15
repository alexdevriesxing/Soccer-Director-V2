const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkO21Divisie4A() {
  try {
    console.log('Checking current O21 Divisie 4A clubs...');

    // Get O21 Divisie 4A league
    const o21Divisie4A = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'O21 Divisie 4A'
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

    if (!o21Divisie4A) {
      console.log('O21 Divisie 4A league not found');
      return;
    }

    console.log(`\nO21 Divisie 4A League: ${o21Divisie4A.name} (ID: ${o21Divisie4A.id})`);
    console.log(`Current clubs (${o21Divisie4A.clubs.length}):`);
    
    o21Divisie4A.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (ID: ${club.id})`);
    });

  } catch (error) {
    console.error('Error checking O21 Divisie 4A:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkO21Divisie4A(); 