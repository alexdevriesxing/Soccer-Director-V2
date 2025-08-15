const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addO21Players() {
  try {
    console.log('Adding O21 players to Jong teams...');

    // Get all Jong teams
    const jongTeams = await prisma.club.findMany({
      where: {
        isJongTeam: true
      },
      include: {
        parentClub: true
      }
    });

    console.log(`Found ${jongTeams.length} Jong teams`);

    for (const jongTeam of jongTeams) {
      if (!jongTeam.parentClub) {
        console.log(`Skipping ${jongTeam.name} - no parent club`);
        continue;
      }

      console.log(`Adding players to ${jongTeam.name} (${jongTeam.parentClub.name})`);

      // Check current player count
      const currentPlayerCount = await prisma.player.count({
        where: { clubId: jongTeam.id }
      });

      if (currentPlayerCount >= 30) {
        console.log(`${jongTeam.name} already has ${currentPlayerCount} players, skipping...`);
        continue;
      }

      // Add players for each position
      const positions = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
      const ages = [16, 17, 18, 19, 20, 21]; // Mix of ages

      for (let i = 0; i < positions.length && currentPlayerCount + i < 30; i++) {
        const position = positions[i];
        const age = ages[Math.floor(Math.random() * ages.length)];
        
        // Generate player name
        const firstNames = ['Jan', 'Piet', 'Klaas', 'Henk', 'Willem', 'Johan', 'Marco', 'Ruud', 'Dennis', 'Patrick', 'Frank', 'Ronald', 'Edwin', 'Jaap', 'Clarence', 'Lars', 'Tim', 'Kevin', 'Mike', 'Tom'];
        const lastNames = ['van der Berg', 'Bakker', 'Visser', 'Smit', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Jansen', 'van der Berg', 'de Vries', 'van der Meer', 'Bakker', 'Smit', 'Jansen', 'Visser'];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;

        // Generate skill based on age and position
        const baseSkill = 45 + (age - 16) * 2; // 16yo = 45, 17yo = 47, etc.
        const skill = Math.min(75, baseSkill + Math.floor(Math.random() * 10));

        // Generate wage (lower for O21 players)
        const wage = 500 + Math.floor(Math.random() * 1000);

        // Contract expires in 2 years
        const contractExpiry = new Date();
        contractExpiry.setFullYear(contractExpiry.getFullYear() + 2);

        await prisma.player.create({
          data: {
            name: name,
            clubId: jongTeam.id,
            position: position,
            skill: skill,
            age: age,
            nationality: 'Netherlands',
            morale: 70 + Math.floor(Math.random() * 20),
            injured: false,
            internationalCaps: 0,
            onInternationalDuty: false,
            wage: wage,
            contractExpiry: contractExpiry
          }
        });

        console.log(`  Added ${name} (${position}, age ${age}, skill ${skill})`);
      }
    }

    console.log('O21 players added successfully!');
  } catch (error) {
    console.error('Error adding O21 players:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addO21Players(); 