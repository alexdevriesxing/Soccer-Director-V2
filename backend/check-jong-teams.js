const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJongTeams() {
  try {
    console.log('Checking Jong teams...');

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
      console.log(`${jongTeam.name} (ID: ${jongTeam.id}) - Parent Club: ${jongTeam.parentClub ? jongTeam.parentClub.name : 'NONE'} (Parent ID: ${jongTeam.parentClubId})`);
    }

    // Check which Jong teams don't have parent clubs
    const jongTeamsWithoutParent = jongTeams.filter(team => !team.parentClub);
    console.log(`\nJong teams without parent clubs: ${jongTeamsWithoutParent.length}`);
    jongTeamsWithoutParent.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
    });

  } catch (error) {
    console.error('Error checking Jong teams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJongTeams(); 