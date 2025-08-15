const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkO21Divisie3() {
  try {
    console.log('Checking current O21 Divisie 3 clubs...');

    // Get O21 Divisie 3 league
    const o21Divisie3 = await prisma.league.findFirst({
      where: {
        name: {
          contains: 'O21 Divisie 3'
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

    if (!o21Divisie3) {
      console.log('O21 Divisie 3 league not found');
      return;
    }

    console.log(`\nO21 Divisie 3 League: ${o21Divisie3.name} (ID: ${o21Divisie3.id})`);
    console.log(`Current clubs (${o21Divisie3.clubs.length}):`);
    
    o21Divisie3.clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.name} (ID: ${club.id})`);
    });

  } catch (error) {
    console.error('Error checking O21 Divisie 3:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkO21Divisie3(); 