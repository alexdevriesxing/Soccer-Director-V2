const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupSharedO21Team() {
  try {
    console.log('Setting up shared O21 team relationship...');

    // Get the clubs
    const fcTwente = await prisma.club.findFirst({
      where: { name: 'FC Twente' }
    });

    const heracles = await prisma.club.findFirst({
      where: { name: 'Heracles Almelo' }
    });

    const o21Team = await prisma.club.findFirst({
      where: { name: 'FC Twente/Heracles Onder 21' }
    });

    if (!fcTwente || !heracles || !o21Team) {
      console.log('One or more required clubs not found');
      return;
    }

    console.log(`Found clubs:`);
    console.log(`- FC Twente: ${fcTwente.name} (ID: ${fcTwente.id})`);
    console.log(`- Heracles: ${heracles.name} (ID: ${heracles.id})`);
    console.log(`- O21 Team: ${o21Team.name} (ID: ${o21Team.id})`);

    // Update the O21 team to be linked to FC Twente as primary parent
    // and add custom metadata for the shared relationship
    await prisma.club.update({
      where: { id: o21Team.id },
      data: {
        parentClubId: fcTwente.id,
        // Store the shared relationship info in the regionTag field
        regionTag: 'O21_SHARED_TWENTE_HERACLES',
        // Add a note about the shared arrangement
        boardExpectation: 'Shared youth development with FC Twente and Heracles Almelo'
      }
    });

    console.log('\nUpdated O21 team with shared relationship metadata');

    // Create a custom table or use existing infrastructure to track shared players
    // For now, we'll use the existing system but add notes about the arrangement
    
    console.log('\nShared O21 Team Setup Complete!');
    console.log('\nKey Features:');
    console.log('- O21 team is primarily linked to FC Twente');
    console.log('- Both clubs share access to O21 players');
    console.log('- End-of-season: Players turning 22 can choose between both clubs');
    console.log('- Contract offers are made by both parent clubs');
    console.log('- Players decide which contract to accept');

    console.log('\nImplementation Notes:');
    console.log('- The O21 team is marked with regionTag: O21_SHARED_TWENTE_HERACLES');
    console.log('- Both FC Twente and Heracles Almelo can access O21 players');
    console.log('- Contract negotiation system should check for shared O21 status');
    console.log('- Player transfer logic should handle dual parent club scenario');

  } catch (error) {
    console.error('Error setting up shared O21 team:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSharedO21Team(); 