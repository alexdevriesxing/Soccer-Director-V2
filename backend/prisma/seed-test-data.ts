import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.transferOffer.deleteMany();
  await prisma.transferListing.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();

  // Create test clubs
  const [arsenal, manCity] = await Promise.all([
    prisma.club.create({
      data: {
        name: 'Arsenal FC',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Manchester City',
      },
    })
  ]);

  // Create test players
  const [saka, haaland] = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Bukayo Saka',
        currentClub: {
          connect: { id: arsenal.id }
        }
      },
    }),
    prisma.player.create({
      data: {
        name: 'Erling Haaland',
        currentClub: {
          connect: { id: manCity.id }
        }
      },
    })
  ]);

  // Create a transfer listing
  const listing = await prisma.transferListing.create({
    data: {
      playerId: saka.id,
      clubId: arsenal.id,
      askingPrice: 100000000, // £100m
      listingType: 'TRANSFER',
      status: 'ACTIVE',
      deadline: new Date('2024-08-31T23:59:59Z')
    }
  });

  // Create a transfer offer
  await prisma.transferOffer.create({
    data: {
      playerId: saka.id,
      fromClubId: manCity.id,
      toClubId: arsenal.id,
      listingId: listing.id,
      status: 'PENDING',
      amount: 90000000, // £90m
      message: 'Interested in signing Saka',
      initiator: 'user'
    }
  });

  console.log('Test data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
