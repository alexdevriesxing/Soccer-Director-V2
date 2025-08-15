const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('Starting cleanup of deleted clubs and O21 divisions...\n');

    // 1. Remove any "deleted clubs" leagues and their clubs
    const deletedClubsLeagues = await prisma.league.findMany({
      where: {
        OR: [
          { name: { contains: 'Deleted Clubs' } },
          { name: { contains: 'deleted clubs' } },
          { name: { contains: 'DELETED' } }
        ]
      }
    });

    for (const league of deletedClubsLeagues) {
      console.log(`Found deleted clubs league: ${league.name} (ID: ${league.id})`);
      
      // Delete all clubs and related data in this league
      const leagueClubs = await prisma.club.findMany({ where: { leagueId: league.id } });
      for (const club of leagueClubs) {
        // Delete all possible related data
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({ where: { OR: [{ homeClubId: club.id }, { awayClubId: club.id }] } });
        await prisma.gateReceipt.deleteMany({ where: { clubId: club.id } });
        await prisma.sponsorship.deleteMany({ where: { clubId: club.id } });
        await prisma.facility.deleteMany({ where: { clubId: club.id } });
        await prisma.staff.deleteMany({ where: { clubId: club.id } });
        await prisma.staffContract.deleteMany({ where: { clubId: club.id } });
        await prisma.clubFormation.deleteMany({ where: { clubId: club.id } });
        await prisma.clubStrategy.deleteMany({ where: { clubId: club.id } });
        await prisma.transfer.deleteMany({ where: { OR: [{ fromClubId: club.id }, { toClubId: club.id }] } });
        await prisma.loan.deleteMany({ where: { OR: [{ fromClubId: club.id }, { toClubId: club.id }] } });
        await prisma.mortgage.deleteMany({ where: { clubId: club.id } });
        await prisma.creditFacility.deleteMany({ where: { clubId: club.id } });
        await prisma.shareHolding.deleteMany({ where: { clubId: club.id } });
        await prisma.investorOffer.deleteMany({ where: { clubId: club.id } });
        await prisma.governmentBailout.deleteMany({ where: { clubId: club.id } });
        await prisma.regulatoryWarning.deleteMany({ where: { clubId: club.id } });
        await prisma.bankruptcyEvent.deleteMany({ where: { clubId: club.id } });
        
        // Delete players associated with this club
        await prisma.player.deleteMany({ where: { clubId: club.id } });
        
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`  Deleted club: ${club.name}`);
      }
      await prisma.league.delete({ where: { id: league.id } });
      console.log(`  Deleted league: ${league.name}`);
    }

    // 2. Find and remove O21 Divisie 4A that only has AFC'34 O21
    const o21_4aLeagues = await prisma.league.findMany({
      where: {
        name: 'O21 Divisie 4A',
        tier: 'O21_4'
      },
      include: {
        clubs: true
      }
    });

    for (const league of o21_4aLeagues) {
      if (league.clubs.length === 1 && league.clubs[0].name === 'AFC\'34 O21') {
        console.log(`Found O21 Divisie 4A with only AFC'34 O21 (ID: ${league.id})`);
        
        // Delete the club and related data
        const club = league.clubs[0];
        await prisma.clubFinances.deleteMany({ where: { clubId: club.id } });
        await prisma.clubSeasonStats.deleteMany({ where: { clubId: club.id } });
        await prisma.fixture.deleteMany({ where: { OR: [{ homeClubId: club.id }, { awayClubId: club.id }] } });
        await prisma.gateReceipt.deleteMany({ where: { clubId: club.id } });
        await prisma.sponsorship.deleteMany({ where: { clubId: club.id } });
        await prisma.facility.deleteMany({ where: { clubId: club.id } });
        await prisma.staff.deleteMany({ where: { clubId: club.id } });
        await prisma.staffContract.deleteMany({ where: { clubId: club.id } });
        await prisma.clubFormation.deleteMany({ where: { clubId: club.id } });
        await prisma.clubStrategy.deleteMany({ where: { clubId: club.id } });
        await prisma.transfer.deleteMany({ where: { OR: [{ fromClubId: club.id }, { toClubId: club.id }] } });
        await prisma.loan.deleteMany({ where: { OR: [{ fromClubId: club.id }, { toClubId: club.id }] } });
        await prisma.mortgage.deleteMany({ where: { clubId: club.id } });
        await prisma.creditFacility.deleteMany({ where: { clubId: club.id } });
        await prisma.shareHolding.deleteMany({ where: { clubId: club.id } });
        await prisma.investorOffer.deleteMany({ where: { clubId: club.id } });
        await prisma.governmentBailout.deleteMany({ where: { clubId: club.id } });
        await prisma.regulatoryWarning.deleteMany({ where: { clubId: club.id } });
        await prisma.bankruptcyEvent.deleteMany({ where: { clubId: club.id } });
        await prisma.player.deleteMany({ where: { clubId: club.id } });
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`  Deleted club: ${club.name}`);
        
        // Delete the league
        await prisma.league.delete({ where: { id: league.id } });
        console.log(`  Deleted league: O21 Divisie 4A`);
      }
    }

    // 3. Remove empty O21 Divisie 4B
    const o21_4bLeagues = await prisma.league.findMany({
      where: {
        name: 'O21 Divisie 4B',
        tier: 'O21_4'
      },
      include: {
        clubs: true
      }
    });

    for (const league of o21_4bLeagues) {
      if (league.clubs.length === 0) {
        console.log(`Found empty O21 Divisie 4B (ID: ${league.id})`);
        await prisma.league.delete({ where: { id: league.id } });
        console.log(`  Deleted empty league: O21 Divisie 4B`);
      }
    }

    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 