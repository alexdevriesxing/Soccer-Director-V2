const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restructureO21Divisie4() {
  try {
    console.log('Restructuring O21 Divisie 4...\n');

    // Find and delete the old O21_4 league
    const oldO21_4League = await prisma.league.findFirst({
      where: { 
        tier: 'O21_4',
        name: 'O21 Divisie 4'
      },
      include: { clubs: true }
    });

    if (oldO21_4League) {
      console.log(`Found old O21_4 league with ${oldO21_4League.clubs.length} clubs`);
      
      // Delete all clubs in the old league (with related data)
      for (const club of oldO21_4League.clubs) {
        // Delete related data first
        await prisma.player.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({
          where: {
            OR: [
              { homeClubId: club.id },
              { awayClubId: club.id }
            ]
          }
        });
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.sponsorship.deleteMany({ where: { clubId: club.id } });
        await prisma.facility.deleteMany({ where: { clubId: club.id } });
        await prisma.staff.deleteMany({ where: { clubId: club.id } });
        await prisma.clubFormation.deleteMany({ where: { clubId: club.id } });
        await prisma.clubStrategy.deleteMany({ where: { clubId: club.id } });
        await prisma.transfer.deleteMany({
          where: {
            OR: [
              { fromClubId: club.id },
              { toClubId: club.id }
            ]
          }
        });
        await prisma.loan.deleteMany({
          where: {
            OR: [
              { fromClubId: club.id },
              { toClubId: club.id }
            ]
          }
        });
        await prisma.gateReceipt.deleteMany({ where: { clubId: club.id } });
        await prisma.mortgage.deleteMany({ where: { clubId: club.id } });
        await prisma.creditFacility.deleteMany({ where: { clubId: club.id } });
        await prisma.shareHolding.deleteMany({ where: { clubId: club.id } });
        await prisma.investorOffer.deleteMany({ where: { clubId: club.id } });
        await prisma.governmentBailout.deleteMany({ where: { clubId: club.id } });
        await prisma.regulatoryWarning.deleteMany({ where: { clubId: club.id } });
        await prisma.bankruptcyEvent.deleteMany({ where: { clubId: club.id } });
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        
        // Finally delete the club
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`  Deleted club: ${club.name}`);
      }
      
      // Delete the old league
      await prisma.league.delete({ where: { id: oldO21_4League.id } });
      console.log('  Deleted old O21_4 league');
    } else {
      console.log('No old O21_4 league found');
    }

    // Create O21 Divisie 4A
    const o21_4aLeague = await prisma.league.create({
      data: {
        name: 'O21 Divisie 4A',
        tier: 'O21_4',
        region: 'O21',
        division: 'Divisie 4A',
        season: '2024/2025'
      }
    });

    console.log(`Created O21 Divisie 4A (ID: ${o21_4aLeague.id})`);

    // Define the clubs for 4A
    const clubs4AData = [
      { name: 'AFC O21', position: 1, played: 12, won: 10, drawn: 1, lost: 1, points: 31, goalsFor: 44, goalsAgainst: 14 },
      { name: 'HHC Hardenberg O21', position: 2, played: 12, won: 7, drawn: 0, lost: 5, points: 21, goalsFor: 30, goalsAgainst: 21 },
      { name: 'Zeeburgia O21', position: 3, played: 12, won: 5, drawn: 4, lost: 3, points: 19, goalsFor: 24, goalsAgainst: 24 },
      { name: 'AFC\'34 O21', position: 4, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 22, goalsAgainst: 28 },
      { name: 'Hollandia O21', position: 5, played: 12, won: 4, drawn: 3, lost: 5, points: 15, goalsFor: 28, goalsAgainst: 28 },
      { name: 'Kon. HFC O21', position: 6, played: 12, won: 4, drawn: 2, lost: 6, points: 14, goalsFor: 29, goalsAgainst: 34 },
      { name: 'DEM O21', position: 7, played: 12, won: 4, drawn: 1, lost: 7, points: 13, goalsFor: 24, goalsAgainst: 29 },
      { name: 'De Dijk O21', position: 8, played: 12, won: 3, drawn: 0, lost: 9, points: 9, goalsFor: 18, goalsAgainst: 41 }
    ];

    console.log('\nAdding clubs to O21 Divisie 4A...');

    for (const clubData of clubs4AData) {
      // Check if club already exists
      let existingClub = await prisma.club.findFirst({
        where: { name: clubData.name }
      });

      let clubId;
      if (existingClub) {
        // Update existing club
        await prisma.club.update({
          where: { id: existingClub.id },
          data: {
            league: { connect: { id: o21_4aLeague.id } },
            regionTag: 'O21',
            isJongTeam: true
          }
        });
        clubId = existingClub.id;
        console.log(`  Updated existing club: ${clubData.name}`);
      } else {
        // Create new club
        const newClub = await prisma.club.create({
          data: {
            name: clubData.name,
            leagueId: o21_4aLeague.id,
            regionTag: 'O21',
            isJongTeam: true,
            finances: {
              create: {
                balance: 50000 + Math.floor(Math.random() * 100000),
                sponsorshipTotal: 5000 + Math.floor(Math.random() * 15000),
                gateReceiptsTotal: 2000 + Math.floor(Math.random() * 8000),
                season: '2024/2025',
                week: 1,
                transferBudget: 10000,
                wageBudget: 5000
              }
            }
          }
        });
        clubId = newClub.id;
        console.log(`  Created new club: ${clubData.name}`);
      }

      // Upsert ClubSeasonStats for this club/league/season
      await prisma.clubSeasonStats.upsert({
        where: {
          clubId_leagueId_season: {
            clubId,
            leagueId: o21_4aLeague.id,
            season: '2024/2025'
          }
        },
        update: {
          position: clubData.position,
          played: clubData.played,
          won: clubData.won,
          drawn: clubData.drawn,
          lost: clubData.lost,
          points: clubData.points,
          goalsFor: clubData.goalsFor,
          goalsAgainst: clubData.goalsAgainst,
          goalDifference: clubData.goalsFor - clubData.goalsAgainst
        },
        create: {
          clubId,
          leagueId: o21_4aLeague.id,
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
      console.log(`    Set stats for ${clubData.name}`);
    }

    // Create O21 Divisie 4B (empty for now)
    const o21_4bLeague = await prisma.league.create({
      data: {
        name: 'O21 Divisie 4B',
        tier: 'O21_4',
        region: 'O21',
        division: 'Divisie 4B',
        season: '2024/2025'
      }
    });

    console.log(`\nCreated O21 Divisie 4B (ID: ${o21_4bLeague.id}) - empty for now`);

    // Add clubs to O21 Divisie 4B
    const clubs4BData = [
      { name: 'VVV O21', position: 1, played: 12, won: 11, drawn: 0, lost: 1, points: 33, goalsFor: 47, goalsAgainst: 9 },
      { name: 'Quick Boys O21', position: 2, played: 11, won: 6, drawn: 1, lost: 4, points: 19, goalsFor: 35, goalsAgainst: 25 },
      { name: 'Hercules O21', position: 3, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 26, goalsAgainst: 25 },
      { name: 'Westlandia O21', position: 4, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 24, goalsAgainst: 28 },
      { name: 'Alphense Boys O21', position: 5, played: 12, won: 5, drawn: 1, lost: 6, points: 16, goalsFor: 25, goalsAgainst: 38 },
      { name: 'Excelsior M. O21', position: 6, played: 11, won: 4, drawn: 1, lost: 6, points: 13, goalsFor: 24, goalsAgainst: 33 },
      { name: 'Alexandria’66 O21', position: 7, played: 12, won: 3, drawn: 4, lost: 5, points: 13, goalsFor: 29, goalsAgainst: 38 },
      { name: 'Spartaan’20 O21', position: 8, played: 12, won: 3, drawn: 1, lost: 8, points: 10, goalsFor: 14, goalsAgainst: 28 }
    ];

    console.log('\nAdding clubs to O21 Divisie 4B...');

    for (const clubData of clubs4BData) {
      // Check if club already exists
      let existingClub = await prisma.club.findFirst({
        where: { name: clubData.name }
      });

      let clubId;
      if (existingClub) {
        // Update existing club
        await prisma.club.update({
          where: { id: existingClub.id },
          data: {
            league: { connect: { id: o21_4bLeague.id } },
            regionTag: 'O21',
            isJongTeam: true
          }
        });
        clubId = existingClub.id;
        console.log(`  Updated existing club: ${clubData.name}`);
      } else {
        // Create new club
        const newClub = await prisma.club.create({
          data: {
            name: clubData.name,
            leagueId: o21_4bLeague.id,
            regionTag: 'O21',
            isJongTeam: true,
            finances: {
              create: {
                balance: 50000 + Math.floor(Math.random() * 100000),
                sponsorshipTotal: 5000 + Math.floor(Math.random() * 15000),
                gateReceiptsTotal: 2000 + Math.floor(Math.random() * 8000),
                season: '2024/2025',
                week: 1,
                transferBudget: 10000,
                wageBudget: 5000
              }
            }
          }
        });
        clubId = newClub.id;
        console.log(`  Created new club: ${clubData.name}`);
      }

      // Upsert ClubSeasonStats for this club/league/season
      await prisma.clubSeasonStats.upsert({
        where: {
          clubId_leagueId_season: {
            clubId,
            leagueId: o21_4bLeague.id,
            season: '2024/2025'
          }
        },
        update: {
          position: clubData.position,
          played: clubData.played,
          won: clubData.won,
          drawn: clubData.drawn,
          lost: clubData.lost,
          points: clubData.points,
          goalsFor: clubData.goalsFor,
          goalsAgainst: clubData.goalsAgainst,
          goalDifference: clubData.goalsFor - clubData.goalsAgainst
        },
        create: {
          clubId,
          leagueId: o21_4bLeague.id,
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
      console.log(`    Set stats for ${clubData.name}`);
    }

    // Verify the new structure
    const newO21_4Leagues = await prisma.league.findMany({
      where: { tier: 'O21_4' },
      include: { clubs: true }
    });

    console.log(`\n✅ Successfully restructured O21 Divisie 4`);
    console.log(`New O21_4 leagues: ${newO21_4Leagues.length}`);
    
    newO21_4Leagues.forEach(league => {
      console.log(`  ${league.name}: ${league.clubs.length} clubs`);
    });

    // Show 4A table
    const league4AWithClubs = await prisma.league.findUnique({
      where: { id: o21_4aLeague.id },
      include: { clubs: true }
    });

    console.log('\nO21 Divisie 4A table:');
    console.log('Pos | Club | P | W | D | L | Pts | GF | GA | GD');
    console.log('----|------|---|----|----|----|-----|----|----|----');
    
    for (const club of league4AWithClubs.clubs) {
      const stats = await prisma.clubSeasonStats.findUnique({
        where: {
          clubId_leagueId_season: {
            clubId: club.id,
            leagueId: o21_4aLeague.id,
            season: '2024/2025'
          }
        }
      });
      if (stats) {
        console.log(`${stats.position.toString().padStart(3)} | ${club.name.padEnd(20)} | ${stats.played} | ${stats.won} | ${stats.drawn} | ${stats.lost} | ${stats.points.toString().padStart(3)} | ${stats.goalsFor.toString().padStart(2)} | ${stats.goalsAgainst.toString().padStart(2)} | ${stats.goalDifference > 0 ? '+' : ''}${stats.goalDifference}`);
      }
    }

  } catch (error) {
    console.error('Error restructuring O21 Divisie 4:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restructureO21Divisie4(); 