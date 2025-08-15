import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Real Dutch cities with regions
const DUTCH_CITIES = [
  // North Holland
  { name: 'Amsterdam', region: 'North Holland' },
  { name: 'Haarlem', region: 'North Holland' },
  { name: 'Alkmaar', region: 'North Holland' },
  { name: 'Zaandam', region: 'North Holland' },
  { name: 'Hoorn', region: 'North Holland' },
  
  // South Holland
  { name: 'Rotterdam', region: 'South Holland' },
  { name: 'The Hague', region: 'South Holland' },
  { name: 'Leiden', region: 'South Holland' },
  { name: 'Dordrecht', region: 'South Holland' },
  { name: 'Gouda', region: 'South Holland' },
  
  // North Brabant
  { name: 'Eindhoven', region: 'North Brabant' },
  { name: 'Tilburg', region: 'North Brabant' },
  { name: 'Breda', region: 'North Brabant' },
  { name: '"s-Hertogenbosch"', region: 'North Brabant' },
  { name: 'Helmond', region: 'North Brabant' },
  
  // More cities...
  { name: 'Utrecht', region: 'Utrecht' },
  { name: 'Groningen', region: 'Groningen' },
  { name: 'Nijmegen', region: 'Gelderland' },
  { name: 'Enschede', region: 'Overijssel' },
  { name: 'Zwolle', region: 'Overijssel' },
  { name: 'Leeuwarden', region: 'Friesland' },
  { name: 'Maastricht', region: 'Limburg' },
  { name: 'Middelburg', region: 'Zeeland' },
  { name: 'Lelystad', region: 'Flevoland' },
  { name: 'Assen', region: 'Drenthe' },
];

// Common Dutch club name parts
const CLUB_PREFIXES = [
  'SV', 'VV', 'FC', 'AFC', 'HFC', 'RKSV', 'RKAV', 'RKVV', 'DVC', 'HSC', 'DWS', 'EVV',
  'SC', 'VVV', 'RKSV', 'RKVV', 'VV', 'RKSV', 'VV', 'RKVV', 'VV', 'RKSV', 'VV'
];

const CLUB_NAMES = [
  'Achilles', 'Ajax', 'Alkmaar', 'Almelo', 'Amersfoort', 'Apeldoorn',
  'Barendrecht', 'Blauw-Wit', 'Breda', 'Capelle', 'Dordrecht', 'Dronten',
  'Eindhoven', 'Emmen', 'Enschede', 'Excelsior', 'Feyenoord', 'Fortuna',
  'Go Ahead', 'Groningen', 'Haarlem', 'Heerenveen', 'Helmond', 'Heracles',
  'Katwijk', 'Leeuwarden', 'Maastricht', 'NAC', 'NEC', 'Noordwijk',
  'Oss', 'PSV', 'Roda', 'Sparta', 'Telstar', 'Twente', 'Utrecht',
  'Venlo', 'Vitesse', 'Volendam', 'VVV', 'Waalwijk', 'Willem II', 'Zwolle'
];

// Common kit colors for Dutch clubs
const KIT_COLORS = [
  { primary: '#E30613', secondary: '#FFFFFF' }, // Red/White
  { primary: '#0051BA', secondary: '#FFFFFF' }, // Blue/White
  { primary: '#F36F21', secondary: '#000000' }, // Orange/Black
  { primary: '#00A94F', secondary: '#FFFFFF' }, // Green/White
  { primary: '#000000', secondary: '#FFCC00' }, // Black/Yellow
  { primary: '#8B0000', secondary: '#FFD700' }, // Burgundy/Gold
  { primary: '#0033A0', secondary: '#E4002B' }, // Blue/Red
  { primary: '#512D6D', secondary: '#FFFFFF' }, // Purple/White
  { primary: '#FF6B6B', secondary: '#4ECDC4' }, // Coral/Teal
  { primary: '#2C3E50', secondary: '#E74C3C' }, // Navy/Red
];

// Board expectations based on league level
const getBoardExpectations = (level: string) => {
  switch(level) {
    case 'EREDIVISIE':
      return {
        leaguePosition: faker.number.int({ min: 1, max: 18 }),
        cupPerformance: 'Quarter Finals',
        europeanQualification: faker.datatype.boolean(),
        youthDevelopment: faker.number.int({ min: 3, max: 5 }),
        financialStability: faker.number.int({ min: 7, max: 10 })
      };
    case 'KKD':
      return {
        leaguePosition: faker.number.int({ min: 1, max: 20 }),
        cupPerformance: 'Round of 16',
        promotionPush: true,
        youthDevelopment: faker.number.int({ min: 4, max: 7 }),
        financialStability: faker.number.int({ min: 5, max: 8 })
      };
    default:
      return {
        leaguePosition: faker.number.int({ min: 1, max: 18 }),
        cupPerformance: 'Early Rounds',
        youthDevelopment: faker.number.int({ min: 5, max: 8 }),
        financialStability: faker.number.int({ min: 3, max: 7 })
      };
  }
};

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.matchEvent.deleteMany(),
    prisma.fixture.deleteMany(),
    prisma.teamInCompetition.deleteMany(),
    prisma.competition.deleteMany(),
    prisma.player.deleteMany(),
    prisma.club.deleteMany(),
  ]);

  // Create competitions
  const competitions = [
    { 
      name: 'Eredivisie', 
      level: 'EREDIVISIE', 
      teams: 18,
      promotionSpots: 0,
      relegationSpots: 2,
      playoffSpots: 4
    },
    { 
      name: 'Eerste Divisie', 
      level: 'KKD', 
      teams: 20,
      promotionSpots: 2,
      relegationSpots: 0,
      playoffSpots: 8
    },
    { 
      name: 'Tweede Divisie', 
      level: 'TWEEDE_DIVISIE', 
      teams: 18,
      promotionSpots: 2,
      relegationSpots: 2,
      playoffSpots: 4
    },
    { 
      name: 'Derde Divisie Zaterdag', 
      level: 'ZATERDAG_AMATEURS', 
      teams: 18,
      promotionSpots: 2,
      relegationSpots: 2,
      playoffSpots: 4
    },
    { 
      name: 'Derde Divisie Zondag', 
      level: 'ZONDAG_AMATEURS', 
      teams: 18,
      promotionSpots: 2,
      relegationSpots: 2,
      playoffSpots: 4
    },
  ];

  // Helper function to generate realistic club names
  const generateClubName = (cityName: string, index: number): string => {
    const cityPrefix = cityName.split(' ')[0].toLowerCase();
    const isBigCity = ['amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven'].includes(cityPrefix);
    
    if (isBigCity) {
      // Big cities often have multiple clubs with different prefixes
      const prefix = faker.helpers.arrayElement(CLUB_PREFIXES);
      const suffix = index > 0 ? ` ${index + 1}` : '';
      return `${prefix} ${cityName}${suffix}`.trim();
    }
    
    // For smaller cities, use a more traditional name
    const prefix = faker.helpers.arrayElement(CLUB_PREFIXES);
    const name = faker.helpers.arrayElement(CLUB_NAMES);
    return `${prefix} ${name}`;
  };

  // Create all competitions
  for (const comp of competitions) {
    console.log(`\nCreating ${comp.name}...`);
    
    const createdComp = await prisma.competition.create({
      data: {
        name: comp.name,
        type: 'LEAGUE',
        level: comp.level as any,
        season: '2024/2025',
        country: 'Netherlands',
        promotionSpots: comp.promotionSpots,
        relegationSpots: comp.relegationSpots,
        playoffSpots: comp.playoffSpots,
      }
    });

    // Shuffle cities to distribute them randomly
    const shuffledCities = [...DUTCH_CITIES].sort(() => 0.5 - Math.random());
    
    // Create clubs for this competition
    for (let i = 0; i < comp.teams; i++) {
      const city = shuffledCities[i % shuffledCities.length];
      const levelValue = comp.level === 'EREDIVISIE' ? 1 :
                       comp.level === 'KKD' ? 2 :
                       comp.level === 'TWEEDE_DIVISIE' ? 3 : 4;
      
      // Generate realistic club data
      const clubName = generateClubName(city.name, i);
      const colors = faker.helpers.arrayElement(KIT_COLORS);
      const capacity = faker.number.int({ 
        min: 5000 * (6 - levelValue), 
        max: 15000 * (6 - levelValue) 
      });
      
      const reputation = 100 - (15 * levelValue) + faker.number.int({ min: -5, max: 5 });
      const financialStatus = 100 - (20 * levelValue) + faker.number.int({ min: -10, max: 10 });
      
      const boardExpectations = getBoardExpectations(comp.level);
      
      // Create club with enhanced details
      const club = await prisma.club.create({
        data: {
          name: clubName,
          city: city.name,
          region: city.region,
          stadium: `${city.name} Stadion`,
          capacity: capacity,
          yearFounded: faker.number.int({ min: 1880, max: 1950 }),
          reputation: Math.max(1, Math.min(100, reputation)),
          financialStatus: Math.max(1, Math.min(100, financialStatus)),
          kitColors: colors,
          boardExpectations: boardExpectations,
          trainingFacilities: faker.number.int({ min: 1, max: 10 }),
          youthFacilities: faker.number.int({ min: 1, max: 10 }),
          youthRecruitment: faker.number.int({ min: 1, max: 10 }),
          transferBudget: faker.number.int({ 
            min: 100000 * (6 - levelValue), 
            max: 5000000 * (6 - levelValue) 
          }),
          wageBudget: faker.number.int({ 
            min: 50000 * (6 - levelValue), 
            max: 2000000 * (6 - levelValue) 
          }),
        }
      });

      // Add club to competition
      await prisma.teamInCompetition.create({
        data: {
          teamId: club.id,
          competitionId: createdComp.id,
          position: i + 1,
          points: 0,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
        }
      });

      console.log(`  - ${clubName} (${city.name}) - ${colors.primary}/${colors.secondary}`);
    }
  }

  console.log('Successfully seeded Dutch football league structure');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
