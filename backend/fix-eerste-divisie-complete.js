const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const eersteDivisieData = [
  {
    name: "FC Volendam",
    position: 1,
    points: 82,
    goalsFor: 87,
    goalsAgainst: 48,
    homeCity: "Volendam",
    region: "West",
    boardExpectation: "Win the league and secure promotion to Eredivisie",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Excelsior Rotterdam",
    position: 2,
    points: 74,
    goalsFor: 74,
    goalsAgainst: 38,
    homeCity: "Rotterdam",
    region: "West",
    boardExpectation: "Challenge for promotion and finish in top 3",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Cambuur Leeuwarden",
    position: 3,
    points: 71,
    goalsFor: 63,
    goalsAgainst: 42,
    homeCity: "Leeuwarden",
    region: "Noord",
    boardExpectation: "Challenge for promotion and finish in top 4",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "ADO Den Haag",
    position: 4,
    points: 70,
    goalsFor: 69,
    goalsAgainst: 47,
    homeCity: "Den Haag",
    region: "West",
    boardExpectation: "Challenge for promotion and finish in top 6",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "FC Dordrecht",
    position: 5,
    points: 68,
    goalsFor: 69,
    goalsAgainst: 46,
    homeCity: "Dordrecht",
    region: "West",
    boardExpectation: "Challenge for promotion and finish in top 6",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "De Graafschap",
    position: 6,
    points: 65,
    goalsFor: 73,
    goalsAgainst: 50,
    homeCity: "Doetinchem",
    region: "Oost",
    boardExpectation: "Challenge for promotion and finish in top 8",
    homeKitShirt: "#ff6b6b",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Telstar",
    position: 7,
    points: 61,
    goalsFor: 69,
    goalsAgainst: 47,
    homeCity: "Velsen",
    region: "West",
    boardExpectation: "Finish in top 10 and avoid relegation",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff"
  },
  {
    name: "FC Emmen",
    position: 8,
    points: 56,
    goalsFor: 56,
    goalsAgainst: 53,
    homeCity: "Emmen",
    region: "Noord",
    boardExpectation: "Finish in top 10 and avoid relegation",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff"
  },
  {
    name: "FC Den Bosch",
    position: 9,
    points: 55,
    goalsFor: 53,
    goalsAgainst: 48,
    homeCity: "Den Bosch",
    region: "Zuid",
    boardExpectation: "Finish in top 12 and avoid relegation",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Jong AZ",
    position: 10,
    points: 52,
    goalsFor: 69,
    goalsAgainst: 63,
    homeCity: "Alkmaar",
    region: "West",
    boardExpectation: "Develop young players and finish in top 12",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff",
    isJongTeam: true,
    parentClubName: "AZ"
  },
  {
    name: "FC Eindhoven",
    position: 11,
    points: 51,
    goalsFor: 58,
    goalsAgainst: 64,
    homeCity: "Eindhoven",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 14",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Roda JC",
    position: 12,
    points: 49,
    goalsFor: 49,
    goalsAgainst: 57,
    homeCity: "Kerkrade",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 14",
    homeKitShirt: "#4ecdc4",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Helmond Sport",
    position: 13,
    points: 46,
    goalsFor: 53,
    goalsAgainst: 61,
    homeCity: "Helmond",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 15",
    homeKitShirt: "#45b7d1",
    awayKitShirt: "#ffffff"
  },
  {
    name: "VVV Venlo",
    position: 14,
    points: 41,
    goalsFor: 44,
    goalsAgainst: 69,
    homeCity: "Venlo",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 16",
    homeKitShirt: "#45b7d1",
    awayKitShirt: "#ffffff"
  },
  {
    name: "MVV Maastricht",
    position: 15,
    points: 40,
    goalsFor: 52,
    goalsAgainst: 59,
    homeCity: "Maastricht",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 16",
    homeKitShirt: "#45b7d1",
    awayKitShirt: "#ffffff"
  },
  {
    name: "TOP Oss",
    position: 16,
    points: 38,
    goalsFor: 31,
    goalsAgainst: 61,
    homeCity: "Oss",
    region: "Zuid",
    boardExpectation: "Avoid relegation and finish in top 17",
    homeKitShirt: "#45b7d1",
    awayKitShirt: "#ffffff"
  },
  {
    name: "Jong Ajax",
    position: 17,
    points: 36,
    goalsFor: 37,
    goalsAgainst: 52,
    homeCity: "Amsterdam",
    region: "West",
    boardExpectation: "Develop young players and avoid relegation",
    homeKitShirt: "#f9ca24",
    awayKitShirt: "#ffffff",
    isJongTeam: true,
    parentClubName: "Ajax"
  },
  {
    name: "Jong PSV",
    position: 18,
    points: 30,
    goalsFor: 55,
    goalsAgainst: 86,
    homeCity: "Eindhoven",
    region: "Zuid",
    boardExpectation: "Develop young players and avoid relegation",
    homeKitShirt: "#f9ca24",
    awayKitShirt: "#ffffff",
    isJongTeam: true,
    parentClubName: "PSV"
  },
  {
    name: "Jong FC Utrecht",
    position: 19,
    points: 23,
    goalsFor: 31,
    goalsAgainst: 82,
    homeCity: "Utrecht",
    region: "Oost",
    boardExpectation: "Develop young players and avoid relegation",
    homeKitShirt: "#f9ca24",
    awayKitShirt: "#ffffff",
    isJongTeam: true,
    parentClubName: "FC Utrecht"
  },
  {
    name: "Vitesse",
    position: 20,
    points: 5,
    goalsFor: 54,
    goalsAgainst: 73,
    homeCity: "Arnhem",
    region: "Oost",
    boardExpectation: "Avoid relegation and rebuild the club",
    homeKitShirt: "#f9ca24",
    awayKitShirt: "#ffffff"
  }
];

async function fixEersteDivisieComplete() {
  try {
    console.log('Starting comprehensive Eerste Divisie fix...');
    
    // Get the Eerste Divisie league
    const eersteDivisie = await prisma.league.findUnique({
      where: { id: 813 },
      include: { clubs: true }
    });
    
    if (!eersteDivisie) {
      throw new Error('Eerste Divisie league not found');
    }
    
    console.log(`Found Eerste Divisie with ${eersteDivisie.clubs.length} clubs`);
    
    // Delete all existing clubs in the league
    console.log('Deleting existing clubs...');
    await prisma.club.deleteMany({
      where: { leagueId: 813 }
    });
    
    // Create new clubs with real data
    console.log('Creating new clubs with corrected data...');
    for (const clubData of eersteDivisieData) {
      // Calculate relative strength based on position
      const baseStrength = 75 - (clubData.position - 1) * 1.05;
      const strength = Math.round(baseStrength);
      
      // Calculate morale based on position (higher position = higher morale)
      const morale = Math.max(40, 85 - (clubData.position - 1) * 2.25);
      
      // Calculate form based on position
      const form = clubData.position <= 6 ? "Excellent" : 
                   clubData.position <= 10 ? "Good" : 
                   clubData.position <= 15 ? "Average" : "Poor";
      
      // Find parent club ID if it's a Jong team
      let parentClubId = null;
      if (clubData.isJongTeam && clubData.parentClubName) {
        const parentClub = await prisma.club.findFirst({ 
          where: { name: clubData.parentClubName } 
        });
        if (parentClub) {
          parentClubId = parentClub.id;
          console.log(`Found parent club ${clubData.parentClubName} (ID: ${parentClubId}) for ${clubData.name}`);
        } else {
          console.log(`Warning: Parent club ${clubData.parentClubName} not found for ${clubData.name}`);
        }
      }
      
      await prisma.club.create({
        data: {
          name: clubData.name,
          homeCity: clubData.homeCity,
          regionTag: clubData.region,
          leagueId: 813,
          boardExpectation: clubData.boardExpectation,
          morale: morale,
          form: form,
          homeKitShirt: clubData.homeKitShirt,
          awayKitShirt: clubData.awayKitShirt,
          isJongTeam: clubData.isJongTeam || false,
          parentClubId: parentClubId,
          noSameDivisionAsParent: clubData.isJongTeam || false,
          eligibleForPromotion: !clubData.isJongTeam // Jong teams cannot be promoted to Eredivisie
        }
      });
      
      console.log(`Created ${clubData.name} (Position ${clubData.position}, Points ${clubData.points})`);
      console.log(`  Home City: ${clubData.homeCity}, Region: ${clubData.region}`);
      console.log(`  Board Expectation: ${clubData.boardExpectation}`);
      if (clubData.isJongTeam) {
        console.log(`  O21 Team: Yes, Parent: ${clubData.parentClubName || 'Unknown'}`);
      }
    }
    
    console.log('Eerste Divisie comprehensive fix completed successfully!');
    
    // Verify the O21 logic is in place
    console.log('\nVerifying O21 team setup...');
    const jongTeams = await prisma.club.findMany({
      where: { 
        leagueId: 813,
        isJongTeam: true 
      },
      include: {
        parentClub: true
      }
    });
    
    console.log(`Found ${jongTeams.length} O21 teams in Eerste Divisie:`);
    jongTeams.forEach(team => {
      console.log(`  ${team.name} -> Parent: ${team.parentClub?.name || 'None'}`);
    });
    
  } catch (error) {
    console.error('Error fixing Eerste Divisie clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEersteDivisieComplete(); 