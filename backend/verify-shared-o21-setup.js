const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySharedO21Setup() {
  try {
    console.log('Verifying shared O21 team setup...\n');

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

    console.log('Club Information:');
    console.log(`FC Twente: ${fcTwente.name} (ID: ${fcTwente.id})`);
    console.log(`Heracles: ${heracles.name} (ID: ${heracles.id})`);
    console.log(`O21 Team: ${o21Team.name} (ID: ${o21Team.id})`);
    console.log(`O21 Parent Club ID: ${o21Team.parentClubId}`);
    console.log(`O21 Region Tag: ${o21Team.regionTag}`);
    console.log(`O21 Board Expectation: ${o21Team.boardExpectation}`);

    // Check if O21 team is properly linked to FC Twente
    const parentClub = await prisma.club.findUnique({
      where: { id: o21Team.parentClubId }
    });

    console.log(`\nO21 Team Parent: ${parentClub.name} (ID: ${parentClub.id})`);

    // Check for shared relationship marker
    if (o21Team.regionTag === 'O21_SHARED_TWENTE_HERACLES') {
      console.log('\n✓ Shared O21 relationship properly configured');
    } else {
      console.log('\n✗ Shared O21 relationship not properly configured');
    }

    console.log('\nShared O21 Team Features:');
    console.log('1. Primary Parent: FC Twente (for database relationship)');
    console.log('2. Shared Access: Both FC Twente and Heracles can access O21 players');
    console.log('3. Player Development: Both clubs contribute to youth development');
    console.log('4. Contract Offers: Both clubs can offer contracts to players turning 22');
    console.log('5. Player Choice: Players decide which club to join');

    console.log('\nImplementation Details:');
    console.log('- The O21 team is technically linked to FC Twente in the database');
    console.log('- The regionTag "O21_SHARED_TWENTE_HERACLES" identifies the shared nature');
    console.log('- Both clubs should have access to O21 player management');
    console.log('- Contract negotiation system must handle dual parent scenario');
    console.log('- End-of-season logic triggers for both parent clubs');

    console.log('\nGame Logic Requirements:');
    console.log('- When managing O21 team, show both parent clubs');
    console.log('- When players turn 22, both clubs get contract offer opportunity');
    console.log('- Player transfer system must check for shared O21 status');
    console.log('- O21 team management interface should reflect shared ownership');

  } catch (error) {
    console.error('Error verifying shared O21 setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySharedO21Setup(); 