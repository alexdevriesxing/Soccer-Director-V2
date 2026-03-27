import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface IntakeResult {
  message: string;
  players: any[];
}

export const generateYouthIntake = async (clubId: number): Promise<IntakeResult> => {
  // 1. Get Club Facilities
  const facility = await prisma.clubFacility.findUnique({
    where: { clubId }
  });

  const academyLevel = facility?.youthAcademy || 5; // Default to 5/20 if not found
  const youthCoaching = facility?.youthFacilities || 5;

  // 2. Determine number of players (random between 5 and 10)
  const numPlayers = Math.floor(Math.random() * 6) + 5;
  const newPlayers: any[] = [];

  const currentYear = new Date().getFullYear();

  // 3. Generate Players
  for (let i = 0; i < numPlayers; i++) {
    // Quality influenced by academy level (1-20)
    // Base potential = 60 + (AcademyLevel * 5) + Random(-20 to +20)
    // Max roughly 180 for top academy, Min 40 for poor academy

    // Higher variance for "Golden Generation" chance?
    const isGem = Math.random() < (academyLevel / 200); // 10% chance at level 20

    const basePA = 60 + (academyLevel * 4);
    let potentialAbility = basePA + (Math.random() * 40 - 20);

    if (isGem) {
      potentialAbility = Math.min(195, Math.max(140, potentialAbility + 40));
    }

    potentialAbility = Math.floor(Math.min(200, Math.max(10, potentialAbility)));

    // Current Ability usually 30-50% of PA for youth
    // Boost CA slightly if youth coaching is good
    const coachingBoost = youthCoaching / 100; // 0.05 to 0.2
    const currentAbility = Math.floor(potentialAbility * (0.25 + coachingBoost + (Math.random() * 0.15)));

    // Attributes - Simplified generation
    const positions = ['GK', 'DEF', 'MID', 'FWD']; // Simplified for now
    const position = positions[Math.floor(Math.random() * positions.length)];

    // Names
    const firstNames = ['Jan', 'Piet', 'Kees', 'Erik', 'Marco', 'Sven', 'Lars', 'Tom', 'Daan', 'Jens'];
    const lastNames = ['de Jong', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: new Date(`${currentYear - 16}-01-01`), // Approx 16 years old
        age: 16,
        nationality: 'Netherlands',
        position,
        preferredPositions: JSON.stringify([position]),
        currentClubId: clubId,

        // Abilities
        currentAbility,
        potentialAbility,

        // Physical
        pace: Math.floor(Math.random() * 15) + 1,
        acceleration: Math.floor(Math.random() * 15) + 1,
        stamina: Math.floor(Math.random() * 10) + 5,
        naturalFitness: 10,
        strength: Math.floor(Math.random() * 10) + 1,

        // Technical
        finishing: Math.floor(Math.random() * 15) + 1,
        passing: Math.floor(Math.random() * 15) + 1,
        tackling: Math.floor(Math.random() * 15) + 1,
        technique: Math.floor(Math.random() * 15) + 1,

        // Mental
        determination: Math.floor(Math.random() * 20) + 1,
        workRate: Math.floor(Math.random() * 20) + 1,

        // Goalkeeping (low if not GK)
        reflexes: position === 'GK' ? Math.floor(Math.random() * 15) + 5 : 1,

        contractStart: new Date(),
        contractEnd: new Date(`${currentYear + 2}-06-30`), // 2 year youth contract
        weeklyWage: 100, // standard youth wage

        value: currentAbility * 1000 // Simple value formula
      }
    });

    newPlayers.push(player);
  }

  return {
    message: `Generated ${newPlayers.length} youth players for intake`,
    players: newPlayers
  };
};

export const automateIntake = async (clubId: number) => {
  // Wrapper for automation
  return generateYouthIntake(clubId);
};