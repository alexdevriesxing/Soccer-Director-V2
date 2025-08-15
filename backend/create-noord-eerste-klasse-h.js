const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNoordEersteKlasseH() {
  try {
    console.log('Creating Noord Eerste Klasse H...\n');

    // First, find and delete any existing Noord Eerste Klasse H leagues
    const existingLeagues = await prisma.league.findMany({
      where: {
        OR: [
          { name: 'Noord Eerste Klasse H' },
          { name: 'Eerste Klasse H', region: 'Noord' },
          { name: 'Zondag Noord 1e klasse H' },
          { name: 'Zaterdag Noord 1e klasse H' }
        ]
      },
      include: {
        clubs: true
      }
    });

    console.log(`Found ${existingLeagues.length} existing leagues to clean up...`);

    // Delete all clubs from these leagues first (to handle foreign key constraints)
    for (const league of existingLeagues) {
      if (league.clubs.length > 0) {
        console.log(`Deleting ${league.clubs.length} clubs from ${league.name}...`);
        
        // Delete all related data for each club
        for (const club of league.clubs) {
          await prisma.$transaction([
            // Delete all related data in the correct order
            prisma.player.deleteMany({ where: { clubId: club.id } }),
            prisma.clubFinances.deleteMany({ where: { clubId: club.id } }),
            prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } }),
            prisma.fixture.deleteMany({ 
              where: { 
                OR: [
                  { homeClubId: club.id },
                  { awayClubId: club.id }
                ]
              } 
            }),
            prisma.gateReceipt.deleteMany({ where: { clubId: club.id } }),
            prisma.sponsorship.deleteMany({ where: { clubId: club.id } }),
            prisma.facility.deleteMany({ where: { clubId: club.id } }),
            prisma.staff.deleteMany({ where: { clubId: club.id } }),
            prisma.staffContract.deleteMany({ where: { clubId: club.id } }),
            prisma.clubFormation.deleteMany({ where: { clubId: club.id } }),
            prisma.clubStrategy.deleteMany({ where: { clubId: club.id } }),
            prisma.transfer.deleteMany({ 
              where: { 
                OR: [
                  { fromClubId: club.id },
                  { toClubId: club.id }
                ]
              } 
            }),
            prisma.loan.deleteMany({ 
              where: { 
                OR: [
                  { fromClubId: club.id },
                  { toClubId: club.id }
                ]
              } 
            }),
            prisma.mortgage.deleteMany({ where: { clubId: club.id } }),
            prisma.creditFacility.deleteMany({ where: { clubId: club.id } }),
            prisma.shareHolding.deleteMany({ where: { clubId: club.id } }),
            prisma.investorOffer.deleteMany({ where: { clubId: club.id } }),
            prisma.governmentBailout.deleteMany({ where: { clubId: club.id } }),
            prisma.regulatoryWarning.deleteMany({ where: { clubId: club.id } }),
            prisma.bankruptcyEvent.deleteMany({ where: { clubId: club.id } }),
            // Finally delete the club
            prisma.club.delete({ where: { id: club.id } })
          ]);
        }
      }
      
      // Delete the league
      await prisma.league.delete({ where: { id: league.id } });
      console.log(`Deleted league: ${league.name}`);
    }

    // Create the new league
    const league = await prisma.league.create({
      data: {
        name: 'Noord Eerste Klasse H',
        tier: 'AMATEUR',
        region: 'Noord',
        division: 'Eerste Klasse H',
        season: '2024/2025'
      }
    });

    console.log(`Created league: ${league.name} (ID: ${league.id})\n`);

    // Club data with stats from the user
    const clubsData = [
      { name: "PKC '83", position: 1, played: 26, won: 17, drawn: 6, lost: 3, points: 57, goalsFor: 80, goalsAgainst: 37 },
      { name: "Blauw Wit '34", position: 2, played: 26, won: 16, drawn: 3, lost: 7, points: 51, goalsFor: 67, goalsAgainst: 44 },
      { name: 'Broekster Boys', position: 3, played: 26, won: 15, drawn: 5, lost: 6, points: 50, goalsFor: 66, goalsAgainst: 40 },
      { name: 'Be Quick 1887', position: 4, played: 26, won: 14, drawn: 7, lost: 5, points: 49, goalsFor: 66, goalsAgainst: 30 },
      { name: 'VV Buitenpost', position: 5, played: 26, won: 14, drawn: 4, lost: 8, points: 46, goalsFor: 53, goalsAgainst: 41 },
      { name: 'Drachtster Boys', position: 6, played: 26, won: 12, drawn: 5, lost: 9, points: 41, goalsFor: 56, goalsAgainst: 44 },
      { name: 'Velocitas 1897', position: 7, played: 26, won: 12, drawn: 5, lost: 9, points: 41, goalsFor: 41, goalsAgainst: 43 },
      { name: 'CVV Oranje Nassau G', position: 8, played: 26, won: 12, drawn: 4, lost: 10, points: 40, goalsFor: 53, goalsAgainst: 47 },
      { name: 'VV Winsum', position: 9, played: 26, won: 10, drawn: 4, lost: 12, points: 34, goalsFor: 40, goalsAgainst: 54 },
      { name: 'WVV', position: 10, played: 26, won: 7, drawn: 7, lost: 12, points: 28, goalsFor: 38, goalsAgainst: 49 },
      { name: 'SC Stiens', position: 11, played: 26, won: 7, drawn: 5, lost: 14, points: 26, goalsFor: 30, goalsAgainst: 53 },
      { name: 'Heerenveense Boys', position: 12, played: 26, won: 7, drawn: 3, lost: 16, points: 24, goalsFor: 32, goalsAgainst: 57 },
      { name: 'Rolder Boys', position: 13, played: 26, won: 4, drawn: 2, lost: 20, points: 14, goalsFor: 31, goalsAgainst: 71 },
      { name: 'VV Roden', position: 14, played: 26, won: 3, drawn: 4, lost: 19, points: 13, goalsFor: 34, goalsAgainst: 77 }
    ];

    // Create clubs with their stats
    for (const clubData of clubsData) {
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          homeCity: clubData.name.includes('VV ') ? clubData.name.replace('VV ', '') : 
                   clubData.name.includes('SC ') ? clubData.name.replace('SC ', '') :
                   clubData.name.includes('CVV ') ? clubData.name.replace('CVV ', '') :
                   clubData.name.includes("'") ? clubData.name.split("'")[0].trim() : clubData.name,
          regionTag: 'Noord',
          boardExpectation: clubData.position <= 2 ? 'Promotion' : 
                           clubData.position <= 4 ? 'Play-off spot' : 
                           clubData.position <= 8 ? 'Mid-table finish' : 'Avoid relegation',
          morale: Math.max(40, 80 - (clubData.position - 1) * 3),
          form: '',
          leagueId: league.id
        }
      });

      // Create club stats
      await prisma.clubSeasonStats.create({
        data: {
          clubId: club.id,
          leagueId: league.id,
          season: '2024/2025',
          position: clubData.position,
          played: clubData.played,
          won: clubData.won,
          drawn: clubData.drawn,
          lost: clubData.lost,
          points: clubData.points,
          goalsFor: clubData.goalsFor,
          goalsAgainst: clubData.goalsAgainst,
          goalDifference: clubData.goalsFor - clubData.goalsAgainst
        }
      });

      console.log(`Created club: ${club.name} (Position: ${clubData.position}, Points: ${clubData.points})`);
    }

    console.log(`\nSuccessfully created Noord Eerste Klasse H with ${clubsData.length} clubs!`);
    console.log(`League ID: ${league.id}`);

  } catch (error) {
    console.error('Error creating Noord Eerste Klasse H:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNoordEersteKlasseH(); 