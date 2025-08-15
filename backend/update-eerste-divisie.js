const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const eersteDivisieData = [
  {
    name: "FC Volendam",
    position: 1,
    points: 82,
    goalsFor: 87,
    goalsAgainst: 48,
    boardExpectation: "Win the league and secure promotion to Eredivisie"
  },
  {
    name: "Excelsior Rotterdam",
    position: 2,
    points: 74,
    goalsFor: 74,
    goalsAgainst: 38,
    boardExpectation: "Challenge for promotion and finish in top 3"
  },
  {
    name: "Cambuur Leeuwarden",
    position: 3,
    points: 71,
    goalsFor: 63,
    goalsAgainst: 42,
    boardExpectation: "Challenge for promotion and finish in top 4"
  },
  {
    name: "ADO Den Haag",
    position: 4,
    points: 70,
    goalsFor: 69,
    goalsAgainst: 47,
    boardExpectation: "Challenge for promotion and finish in top 6"
  },
  {
    name: "FC Dordrecht",
    position: 5,
    points: 68,
    goalsFor: 69,
    goalsAgainst: 46,
    boardExpectation: "Challenge for promotion and finish in top 6"
  },
  {
    name: "De Graafschap",
    position: 6,
    points: 65,
    goalsFor: 73,
    goalsAgainst: 50,
    boardExpectation: "Challenge for promotion and finish in top 8"
  },
  {
    name: "Telstar",
    position: 7,
    points: 61,
    goalsFor: 69,
    goalsAgainst: 47,
    boardExpectation: "Finish in top 10 and avoid relegation"
  },
  {
    name: "FC Emmen",
    position: 8,
    points: 56,
    goalsFor: 56,
    goalsAgainst: 53,
    boardExpectation: "Finish in top 10 and avoid relegation"
  },
  {
    name: "FC Den Bosch",
    position: 9,
    points: 55,
    goalsFor: 53,
    goalsAgainst: 48,
    boardExpectation: "Finish in top 12 and avoid relegation"
  },
  {
    name: "Jong AZ",
    position: 10,
    points: 52,
    goalsFor: 69,
    goalsAgainst: 63,
    boardExpectation: "Develop young players and finish in top 12"
  },
  {
    name: "FC Eindhoven",
    position: 11,
    points: 51,
    goalsFor: 58,
    goalsAgainst: 64,
    boardExpectation: "Avoid relegation and finish in top 14"
  },
  {
    name: "Roda JC",
    position: 12,
    points: 49,
    goalsFor: 49,
    goalsAgainst: 57,
    boardExpectation: "Avoid relegation and finish in top 14"
  },
  {
    name: "Helmond Sport",
    position: 13,
    points: 46,
    goalsFor: 53,
    goalsAgainst: 61,
    boardExpectation: "Avoid relegation and finish in top 15"
  },
  {
    name: "VVV Venlo",
    position: 14,
    points: 41,
    goalsFor: 44,
    goalsAgainst: 69,
    boardExpectation: "Avoid relegation and finish in top 16"
  },
  {
    name: "MVV Maastricht",
    position: 15,
    points: 40,
    goalsFor: 52,
    goalsAgainst: 59,
    boardExpectation: "Avoid relegation and finish in top 16"
  },
  {
    name: "TOP Oss",
    position: 16,
    points: 38,
    goalsFor: 31,
    goalsAgainst: 61,
    boardExpectation: "Avoid relegation and finish in top 17"
  },
  {
    name: "Jong Ajax",
    position: 17,
    points: 36,
    goalsFor: 37,
    goalsAgainst: 52,
    boardExpectation: "Develop young players and avoid relegation"
  },
  {
    name: "Jong PSV",
    position: 18,
    points: 30,
    goalsFor: 55,
    goalsAgainst: 86,
    boardExpectation: "Develop young players and avoid relegation"
  },
  {
    name: "Jong FC Utrecht",
    position: 19,
    points: 23,
    goalsFor: 31,
    goalsAgainst: 82,
    boardExpectation: "Develop young players and avoid relegation"
  },
  {
    name: "Vitesse",
    position: 20,
    points: 5,
    goalsFor: 54,
    goalsAgainst: 73,
    boardExpectation: "Avoid relegation and rebuild the club"
  }
];

async function updateEersteDivisie() {
  try {
    console.log('Starting Eerste Divisie clubs update...');
    
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
    console.log('Creating new clubs with real data...');
    for (const clubData of eersteDivisieData) {
      // Calculate relative strength based on position
      // 1st place = 75, 20th place = 55 (20 point range)
      const baseStrength = 75 - (clubData.position - 1) * 1.05;
      const strength = Math.round(baseStrength);
      
      // Calculate morale based on position (higher position = higher morale)
      const morale = Math.max(40, 85 - (clubData.position - 1) * 2.25);
      
      // Calculate form based on position
      const form = clubData.position <= 6 ? "Excellent" : 
                   clubData.position <= 10 ? "Good" : 
                   clubData.position <= 15 ? "Average" : "Poor";
      
      // Determine home city based on club name
      let homeCity = "Unknown";
      if (clubData.name.includes("Rotterdam")) homeCity = "Rotterdam";
      else if (clubData.name.includes("Leeuwarden")) homeCity = "Leeuwarden";
      else if (clubData.name.includes("Den Haag")) homeCity = "Den Haag";
      else if (clubData.name.includes("Dordrecht")) homeCity = "Dordrecht";
      else if (clubData.name.includes("Deventer")) homeCity = "Deventer";
      else if (clubData.name.includes("Velsen")) homeCity = "Velsen";
      else if (clubData.name.includes("Emmen")) homeCity = "Emmen";
      else if (clubData.name.includes("Den Bosch")) homeCity = "Den Bosch";
      else if (clubData.name.includes("Eindhoven")) homeCity = "Eindhoven";
      else if (clubData.name.includes("Kerkrade")) homeCity = "Kerkrade";
      else if (clubData.name.includes("Helmond")) homeCity = "Helmond";
      else if (clubData.name.includes("Venlo")) homeCity = "Venlo";
      else if (clubData.name.includes("Maastricht")) homeCity = "Maastricht";
      else if (clubData.name.includes("Oss")) homeCity = "Oss";
      else if (clubData.name.includes("Amsterdam")) homeCity = "Amsterdam";
      else if (clubData.name.includes("Eindhoven")) homeCity = "Eindhoven";
      else if (clubData.name.includes("Utrecht")) homeCity = "Utrecht";
      else if (clubData.name.includes("Arnhem")) homeCity = "Arnhem";
      else if (clubData.name.includes("Volendam")) homeCity = "Volendam";
      
      // Determine region based on home city
      let region = "West";
      if (["Leeuwarden", "Emmen", "Groningen"].includes(homeCity)) region = "Noord";
      else if (["Kerkrade", "Maastricht", "Venlo", "Helmond", "Eindhoven", "Den Bosch", "Oss"].includes(homeCity)) region = "Zuid";
      else if (["Arnhem", "Utrecht"].includes(homeCity)) region = "Oost";
      
      await prisma.club.create({
        data: {
          name: clubData.name,
          homeCity: homeCity,
          regionTag: region,
          leagueId: 813,
          boardExpectation: clubData.boardExpectation,
          morale: morale,
          form: form,
          // Add kit colors (basic colors for now)
          homeKitShirt: clubData.position <= 6 ? "#ff6b6b" : 
                       clubData.position <= 12 ? "#4ecdc4" : 
                       clubData.position <= 16 ? "#45b7d1" : "#f9ca24",
          awayKitShirt: "#ffffff"
        }
      });
      
      console.log(`Created ${clubData.name} (Position ${clubData.position}, Points ${clubData.points}, Strength ~${strength}, Morale ${morale}, Form: ${form})`);
      console.log(`  Home City: ${homeCity}, Region: ${region}`);
      console.log(`  Board Expectation: ${clubData.boardExpectation}`);
    }
    
    console.log('Eerste Divisie clubs update completed successfully!');
    
  } catch (error) {
    console.error('Error updating Eerste Divisie clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEersteDivisie(); 