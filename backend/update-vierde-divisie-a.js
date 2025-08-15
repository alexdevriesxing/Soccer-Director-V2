const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Vierde Divisie A clubs data with positions, points, goals, etc.
const vierdeDivisieAClubs = [
  {
    name: 'VV Scherpenzeel',
    position: 1,
    played: 30,
    won: 19,
    drawn: 4,
    lost: 7,
    points: 61,
    goalsFor: 58,
    goalsAgainst: 36,
    homeCity: 'Scherpenzeel',
    regionTag: 'ZaterdagOost',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'JOS Watergraafsmeer',
    position: 2,
    played: 30,
    won: 17,
    drawn: 4,
    lost: 9,
    points: 55,
    goalsFor: 59,
    goalsAgainst: 37,
    homeCity: 'Amsterdam',
    regionTag: 'ZaterdagOost',
    boardExpectation: 'Promotion',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Kampong',
    position: 3,
    played: 30,
    won: 14,
    drawn: 6,
    lost: 10,
    points: 48,
    goalsFor: 43,
    goalsAgainst: 33,
    homeCity: 'Utrecht',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#5f27cd',
    awayKitShirt: '#00d2d3',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV SJC',
    position: 4,
    played: 30,
    won: 14,
    drawn: 6,
    lost: 10,
    points: 48,
    goalsFor: 49,
    goalsAgainst: 49,
    homeCity: 'Noordwijk',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VV Hoogland',
    position: 5,
    played: 30,
    won: 12,
    drawn: 9,
    lost: 9,
    points: 45,
    goalsFor: 47,
    goalsAgainst: 41,
    homeCity: 'Hoogland',
    regionTag: 'ZondagWest1',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'AFC \'34',
    position: 6,
    played: 30,
    won: 11,
    drawn: 10,
    lost: 9,
    points: 43,
    goalsFor: 49,
    goalsAgainst: 42,
    homeCity: 'Alkmaar',
    regionTag: 'ZondagNoord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'HVV Hollandia',
    position: 7,
    played: 30,
    won: 12,
    drawn: 6,
    lost: 12,
    points: 42,
    goalsFor: 53,
    goalsAgainst: 45,
    homeCity: 'Hoorn',
    regionTag: 'ZondagNoord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'AVV Swift',
    position: 8,
    played: 30,
    won: 10,
    drawn: 12,
    lost: 8,
    points: 42,
    goalsFor: 46,
    goalsAgainst: 42,
    homeCity: 'Amsterdam',
    regionTag: 'ZaterdagNoord',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'SDV Barneveld',
    position: 9,
    played: 30,
    won: 11,
    drawn: 9,
    lost: 10,
    points: 42,
    goalsFor: 39,
    goalsAgainst: 43,
    homeCity: 'Barneveld',
    regionTag: 'ZaterdagOost',
    boardExpectation: 'Mid-table',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Purmersteijn',
    position: 10,
    played: 30,
    won: 12,
    drawn: 3,
    lost: 15,
    points: 39,
    goalsFor: 53,
    goalsAgainst: 52,
    homeCity: 'Purmerend',
    regionTag: 'ZondagNoord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'ODIN \'59',
    position: 11,
    played: 30,
    won: 11,
    drawn: 6,
    lost: 13,
    points: 39,
    goalsFor: 50,
    goalsAgainst: 55,
    homeCity: 'Heemskerk',
    regionTag: 'ZaterdagNoord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'DVVA',
    position: 12,
    played: 30,
    won: 12,
    drawn: 3,
    lost: 15,
    points: 39,
    goalsFor: 37,
    goalsAgainst: 48,
    homeCity: 'Amsterdam',
    regionTag: 'ZaterdagNoord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'VVOG Harderwijk',
    position: 13,
    played: 30,
    won: 12,
    drawn: 1,
    lost: 17,
    points: 37,
    goalsFor: 42,
    goalsAgainst: 53,
    homeCity: 'Harderwijk',
    regionTag: 'ZaterdagOost',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Ter Leede',
    position: 14,
    played: 30,
    won: 7,
    drawn: 13,
    lost: 10,
    points: 34,
    goalsFor: 36,
    goalsAgainst: 48,
    homeCity: 'Sassenheim',
    regionTag: 'ZaterdagZuid',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'Kolping Boys',
    position: 15,
    played: 30,
    won: 8,
    drawn: 4,
    lost: 18,
    points: 28,
    goalsFor: 40,
    goalsAgainst: 54,
    homeCity: 'Oudorp',
    regionTag: 'ZondagNoord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff6b6b',
    awayKitShirt: '#4ecdc4',
    isJongTeam: false,
    parentClubId: null
  },
  {
    name: 'HSV De Zuidvogels',
    position: 16,
    played: 30,
    won: 8,
    drawn: 4,
    lost: 18,
    points: 28,
    goalsFor: 34,
    goalsAgainst: 57,
    homeCity: 'Huizen',
    regionTag: 'ZaterdagNoord',
    boardExpectation: 'Avoid relegation',
    homeKitShirt: '#ff9ff3',
    awayKitShirt: '#54a0ff',
    isJongTeam: false,
    parentClubId: null
  }
];

async function updateVierdeDivisieA() {
  try {
    console.log('Updating Vierde Divisie A clubs...');

    // Get Vierde Divisie A league
    const vierdeDivisieA = await prisma.league.findFirst({
      where: {
        name: 'Vierde Divisie A' // Use an exact match for better precision
      }
    });

    if (!vierdeDivisieA) {
      console.log('Vierde Divisie A league not found');
      return;
    }

    console.log(`Found Vierde Divisie A league: ${vierdeDivisieA.name} (ID: ${vierdeDivisieA.id})`);

    // Get existing clubs in this league
    const existingClubs = await prisma.club.findMany({
      where: {
        leagueId: vierdeDivisieA.id
      }
    });

    console.log(`Found ${existingClubs.length} existing clubs`);

    // Update or create clubs
    for (const clubData of vierdeDivisieAClubs) {
      // Check if club already exists
      const existingClub = existingClubs.find(club => club.name === clubData.name);
      
      const updateData = {
        homeCity: clubData.homeCity,
        regionTag: clubData.regionTag,
        boardExpectation: clubData.boardExpectation,
        homeKitShirt: clubData.homeKitShirt,
        awayKitShirt: clubData.awayKitShirt,
        isJongTeam: clubData.isJongTeam,
        parentClubId: clubData.parentClubId,
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
            leagueId: vierdeDivisieA.id,
            ...updateData
          }
        });
        console.log(`Created: ${clubData.name}`);
      }
    }

    // Remove clubs not in the new list
    const newClubNames = vierdeDivisieAClubs.map(club => club.name);
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
        leagueId: vierdeDivisieA.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\nVerification: ${updatedClubs.length} clubs in Vierde Divisie A`);
    updatedClubs.forEach(club => {
      console.log(`${club.name} - ${club.homeCity} (${club.regionTag})`);
    });

    console.log('\n✅ Vierde Divisie A clubs updated successfully!');

  } catch (error) {
    console.error('Error updating Vierde Divisie A clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVierdeDivisieA(); 