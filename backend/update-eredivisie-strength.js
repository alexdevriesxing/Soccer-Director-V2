const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const eredivisieData = [
  {
    name: "PSV",
    position: 1,
    points: 79,
    goalsFor: 103,
    goalsAgainst: 39,
    boardExpectation: "Win the league and reach Champions League group stage"
  },
  {
    name: "Ajax",
    position: 2,
    points: 78,
    goalsFor: 67,
    goalsAgainst: 32,
    boardExpectation: "Challenge for the title and reach Champions League group stage"
  },
  {
    name: "Feyenoord",
    position: 3,
    points: 68,
    goalsFor: 76,
    goalsAgainst: 38,
    boardExpectation: "Finish in top 3 and qualify for European competition"
  },
  {
    name: "FC Utrecht",
    position: 4,
    points: 64,
    goalsFor: 62,
    goalsAgainst: 45,
    boardExpectation: "Finish in top 6 and qualify for European competition"
  },
  {
    name: "AZ",
    position: 5,
    points: 57,
    goalsFor: 58,
    goalsAgainst: 37,
    boardExpectation: "Finish in top 6 and qualify for European competition"
  },
  {
    name: "FC Twente",
    position: 6,
    points: 54,
    goalsFor: 62,
    goalsAgainst: 49,
    boardExpectation: "Finish in top 8 and challenge for European spots"
  },
  {
    name: "Go Ahead Eagles",
    position: 7,
    points: 51,
    goalsFor: 57,
    goalsAgainst: 55,
    boardExpectation: "Finish in top 10 and avoid relegation"
  },
  {
    name: "NEC",
    position: 8,
    points: 43,
    goalsFor: 51,
    goalsAgainst: 46,
    boardExpectation: "Finish in top 10 and avoid relegation"
  },
  {
    name: "SC Heerenveen",
    position: 9,
    points: 43,
    goalsFor: 42,
    goalsAgainst: 57,
    boardExpectation: "Finish in top 12 and avoid relegation"
  },
  {
    name: "PEC Zwolle",
    position: 10,
    points: 41,
    goalsFor: 43,
    goalsAgainst: 51,
    boardExpectation: "Finish in top 12 and avoid relegation"
  },
  {
    name: "Fortuna Sittard",
    position: 11,
    points: 41,
    goalsFor: 37,
    goalsAgainst: 54,
    boardExpectation: "Avoid relegation and finish in top 14"
  },
  {
    name: "Sparta Rotterdam",
    position: 12,
    points: 39,
    goalsFor: 39,
    goalsAgainst: 43,
    boardExpectation: "Avoid relegation and finish in top 14"
  },
  {
    name: "FC Groningen",
    position: 13,
    points: 39,
    goalsFor: 40,
    goalsAgainst: 53,
    boardExpectation: "Avoid relegation and finish in top 14"
  },
  {
    name: "Heracles Almelo",
    position: 14,
    points: 38,
    goalsFor: 42,
    goalsAgainst: 63,
    boardExpectation: "Avoid relegation and finish in top 15"
  },
  {
    name: "NAC Breda",
    position: 15,
    points: 33,
    goalsFor: 34,
    goalsAgainst: 58,
    boardExpectation: "Avoid relegation and finish in top 16"
  },
  {
    name: "Willem II",
    position: 16,
    points: 26,
    goalsFor: 34,
    goalsAgainst: 56,
    boardExpectation: "Avoid relegation and finish in top 16"
  },
  {
    name: "RKC Waalwijk",
    position: 17,
    points: 25,
    goalsFor: 44,
    goalsAgainst: 74,
    boardExpectation: "Avoid relegation and finish in top 17"
  },
  {
    name: "Almere City FC",
    position: 18,
    points: 22,
    goalsFor: 23,
    goalsAgainst: 64,
    boardExpectation: "Avoid relegation and finish in top 18"
  }
];

async function updateEredivisieStrength() {
  try {
    console.log('Starting Eredivisie strength and expectations update...');
    
    // Get the Eredivisie league
    const eredivisie = await prisma.league.findUnique({
      where: { id: 812 },
      include: { clubs: true }
    });
    
    if (!eredivisie) {
      throw new Error('Eredivisie league not found');
    }
    
    console.log(`Found Eredivisie with ${eredivisie.clubs.length} clubs`);
    
    // Update clubs with strength and expectations
    for (const clubData of eredivisieData) {
      const existingClub = eredivisie.clubs.find(club => club.name === clubData.name);
      
      if (!existingClub) {
        console.log(`Club ${clubData.name} not found, skipping...`);
        continue;
      }
      
      // Calculate relative strength based on position
      // 1st place = 85, 18th place = 65 (20 point range)
      const baseStrength = 85 - (clubData.position - 1) * 1.18;
      const strength = Math.round(baseStrength);
      
      // Calculate morale based on position (higher position = higher morale)
      const morale = Math.max(50, 90 - (clubData.position - 1) * 2);
      
      // Calculate form based on position
      const form = clubData.position <= 6 ? "Excellent" : 
                   clubData.position <= 10 ? "Good" : 
                   clubData.position <= 14 ? "Average" : "Poor";
      
      await prisma.club.update({
        where: { id: existingClub.id },
        data: {
          boardExpectation: clubData.boardExpectation,
          morale: morale,
          form: form,
          // Add some additional fields that might be useful
          // Note: These fields don't exist in the current schema but could be added
        }
      });
      
      console.log(`Updated ${clubData.name} (Position ${clubData.position}, Strength ~${strength}, Morale ${morale}, Form: ${form})`);
      console.log(`  Board Expectation: ${clubData.boardExpectation}`);
    }
    
    console.log('Eredivisie strength and expectations update completed successfully!');
    
  } catch (error) {
    console.error('Error updating Eredivisie strength:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEredivisieStrength(); 