import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getFacilitiesForClub(clubId: number) {
  // Fetch all facilities for the club
  const facilities = await prisma.facility.findMany({
    where: { clubId },
    select: {
      id: true,
      name: true,
      type: true,
      level: true,
      capacity: true,
      maintenanceCost: true,
      upgradeCost: true,
      effects: true,
    },
  });
  return facilities;
}

export async function upgradeFacility(facilityId: number) {
  // Get the facility and club
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw new Error('Facility not found');
  if (facility.level >= 5) throw new Error('Facility is already at max level');
  const club = await prisma.club.findUnique({ where: { id: facility.clubId }, include: { finances: { orderBy: { week: 'desc' }, take: 1 } } });
  if (!club) throw new Error('Club not found');
  const upgradeCost = facility.upgradeCost;
  const finances = club.finances[0];
  if (!finances || finances.balance < upgradeCost) throw new Error('Insufficient funds');
  // Deduct cost from club finances
  await prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { decrement: upgradeCost } } });
  // Upgrade the facility
  const upgraded = await prisma.facility.update({ where: { id: facilityId }, data: { level: { increment: 1 } } });
  // Optionally: recalculate effects, costs, etc.
  return upgraded;
}

export async function getUpgradeProgress(clubId: number) {
  // Fetch all facilities for the club
  const facilities = await prisma.facility.findMany({ where: { clubId } });
  // Fetch all upgrade requests for the club
  const upgrades = await prisma.facilityUpgradeRequest.findMany({
    where: { facility: { clubId } },
    orderBy: { requestedAt: 'desc' }
  });
  // Map upgrades by facilityId
  const upgradesByFacility: Record<number, any> = {};
  for (const upgrade of upgrades) {
    upgradesByFacility[upgrade.facilityId] = upgrade;
  }
  // Build progress info for each facility
  const progress = facilities.map((facility: any) => {
    const upgrade = upgradesByFacility[facility.id];
    let status = 'idle';
    let estimatedCompletion = null;
    if (upgrade && upgrade.status === 'in_progress') {
      status = 'in_progress';
      // Assume upgrades take 7 days from requestedAt
      estimatedCompletion = new Date(new Date(upgrade.requestedAt).getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    return {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      level: facility.level,
      status,
      estimatedCompletion
    };
  });
  return progress;
} 