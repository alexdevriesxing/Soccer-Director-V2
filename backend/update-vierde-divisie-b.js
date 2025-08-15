const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vierde Divisie B clubs data
const vierdeDivisieBClubs = [
  { name: 'VV Zwaluwen', homeCity: 'Vlaardingen', regionTag: 'ZaterdagZuid', boardExpectation: 'Promotion', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
  { name: 'XerxesDZB', homeCity: 'Rotterdam', regionTag: 'ZaterdagZuid', boardExpectation: 'Promotion', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'SV Poortugaal', homeCity: 'Poortugaal', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#5f27cd', awayKitShirt: '#00d2d3' },
  { name: 'VV LRC Leerdam', homeCity: 'Leerdam', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'RKVV Westlandia', homeCity: 'Naaldwijk', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
  { name: 'VV Capelle', homeCity: 'Capelle aan den IJssel', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'RKAVV', homeCity: 'Leidschendam', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
  { name: 'VV Heerjansdam', homeCity: 'Heerjansdam', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'SC Feyenoord', homeCity: 'Rotterdam', regionTag: 'ZaterdagZuid', boardExpectation: 'Mid-table', homeKitShirt: '#5f27cd', awayKitShirt: '#00d2d3' },
  { name: 'RKSV Halsteren', homeCity: 'Halsteren', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
  { name: 'VV Achilles Veen', homeCity: 'Veen', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'HBS', homeCity: 'Den Haag', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#5f27cd', awayKitShirt: '#00d2d3' },
  { name: 'Forum Sport', homeCity: 'Voorburg', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
  { name: 'GVV Unitas', homeCity: 'Gorinchem', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff9ff3', awayKitShirt: '#54a0ff' },
  { name: 'VV WNC', homeCity: 'Waardenburg', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#5f27cd', awayKitShirt: '#00d2d3' },
  { name: 'RVVH', homeCity: 'Ridderkerk', regionTag: 'ZaterdagZuid', boardExpectation: 'Avoid relegation', homeKitShirt: '#ff6b6b', awayKitShirt: '#4ecdc4' },
];

async function updateVierdeDivisieB() {
  try {
    console.log('Updating Vierde Divisie B clubs...');

    // Get Vierde Divisie B league
    const vierdeDivisieB = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie B' // Use an exact match for better precision
      }
    });

    if (!vierdeDivisieB) {
      console.log('Vierde Divisie B league not found');
      return;
    }

    console.log(`Found Vierde Divisie B league: ${vierdeDivisieB.name} (ID: ${vierdeDivisieB.id})`);

    // Get existing clubs in this league
    const existingClubs = await prisma.club.findMany({
      where: {
        leagueId: vierdeDivisieB.id
      }
    });

    console.log(`Found ${existingClubs.length} existing clubs`);

    // Update or create clubs
    for (const clubData of vierdeDivisieBClubs) {
      // Check if club already exists
      const existingClub = existingClubs.find(club => club.name === clubData.name);
      
      const updateData = {
        homeCity: clubData.homeCity,
        regionTag: clubData.regionTag,
        boardExpectation: clubData.boardExpectation,
        homeKitShirt: clubData.homeKitShirt,
        awayKitShirt: clubData.awayKitShirt,
        isJongTeam: false,
        parentClubId: null,
        morale: Math.floor(Math.random() * 30) + 60, // 60-90
        form: `${Math.floor(Math.random() * 20) + 60}` // 60-80 as string
      };

      if (existingClub) {
        // Update existing club
        await prisma.club.update({
          where: { id: existingClub.id },
          data: updateData
        });
        console.log(`Updated: ${clubData.name}`);
      } else {
        // Create new club
        await prisma.club.create({
          data: {
            name: clubData.name,
            leagueId: vierdeDivisieB.id,
            ...updateData
          }
        });
        console.log(`Created: ${clubData.name}`);
      }
    }

    // Remove clubs not in the new list
    const newClubNames = vierdeDivisieBClubs.map(club => club.name);
    const clubsToRemove = existingClubs.filter(club => !newClubNames.includes(club.name));
    for (const club of clubsToRemove) {
      try {
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`Deleted: ${club.name}`);
      } catch (err) {
        console.log(`Could not delete ${club.name} (likely due to foreign key constraints):`, err.message);
      }
    }

    // Verify the update
    const updatedClubs = await prisma.club.findMany({
      where: {
        leagueId: vierdeDivisieB.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\nVerification: ${updatedClubs.length} clubs in Vierde Divisie B`);
    updatedClubs.forEach(club => {
      console.log(`${club.name} - ${club.homeCity} (${club.regionTag})`);
    });

    console.log('\n✅ Vierde Divisie B clubs updated successfully!');

  } catch (error) {
    console.error('Error updating Vierde Divisie B clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVierdeDivisieB(); 