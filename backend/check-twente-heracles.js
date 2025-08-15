const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTwenteHeracles() {
  try {
    console.log('Checking for FC Twente and Heracles Almelo clubs...');

    // Search for FC Twente
    const fcTwente = await prisma.club.findFirst({
      where: {
        name: {
          contains: 'FC Twente'
        }
      }
    });

    // Search for Heracles
    const heracles = await prisma.club.findFirst({
      where: {
        name: {
          contains: 'Heracles'
        }
      }
    });

    console.log('\nFC Twente:', fcTwente ? `${fcTwente.name} (ID: ${fcTwente.id})` : 'Not found');
    console.log('Heracles:', heracles ? `${heracles.name} (ID: ${heracles.id})` : 'Not found');

    // Also check the O21 team
    const o21Team = await prisma.club.findFirst({
      where: {
        name: 'FC Twente/Heracles Onder 21'
      }
    });

    console.log('O21 Team:', o21Team ? `${o21Team.name} (ID: ${o21Team.id})` : 'Not found');

  } catch (error) {
    console.error('Error checking clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTwenteHeracles(); 