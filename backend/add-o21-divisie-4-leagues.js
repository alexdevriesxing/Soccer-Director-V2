const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addO21Divisie4Leagues() {
  try {
    let o21Divisie4A = await prisma.league.findFirst({ where: { name: 'O21 Divisie 4A' } });
    if (!o21Divisie4A) {
      o21Divisie4A = await prisma.league.create({
        data: {
          name: 'O21 Divisie 4A',
          tier: '4',
          region: 'O21',
          season: '2024/25',
        }
      });
      console.log('Created O21 Divisie 4A league');
    } else {
      console.log('O21 Divisie 4A league already exists');
    }

    let o21Divisie4B = await prisma.league.findFirst({ where: { name: 'O21 Divisie 4B' } });
    if (!o21Divisie4B) {
      o21Divisie4B = await prisma.league.create({
        data: {
          name: 'O21 Divisie 4B',
          tier: '4',
          region: 'O21',
          season: '2024/25',
        }
      });
      console.log('Created O21 Divisie 4B league');
    } else {
      console.log('O21 Divisie 4B league already exists');
    }
  } catch (error) {
    console.error('Error creating O21 Divisie 4 leagues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Divisie4Leagues(); 