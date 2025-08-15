import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dutchClubs = [
    'Ajax',
    'PSV',
    'Feyenoord',
    'AZ Alkmaar',
    'FC Utrecht',
    'Vitesse',
    'FC Twente',
    'SC Heerenveen',
    'Heracles Almelo',
    'FC Groningen',
    'Willem II',
    'PEC Zwolle',
    'Sparta Rotterdam',
    'Fortuna Sittard',
    'RKC Waalwijk',
    'Go Ahead Eagles',
    'NEC Nijmegen',
    'FC Emmen',
    'Excelsior',
    'SC Cambuur'
  ];

  // Clear existing clubs and related data
  await prisma.transferOffer.deleteMany();
  await prisma.transferListing.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();

  // Create Dutch clubs
  const createdClubs = await Promise.all(
    dutchClubs.map(name => 
      prisma.club.create({
        data: { name }
      })
    )
  );

  console.log('Created Dutch clubs:', createdClubs.map(c => c.name).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
