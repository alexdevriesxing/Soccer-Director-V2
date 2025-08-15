// Academy Facility Service
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getFacilitiesForClub = async (clubId: number) => {
  return prisma.academyFacility.findMany({ where: { clubId } });
};

export const upgradeFacility = async (facilityId: number) => {
  // Get the facility and club
  const facility = await prisma.academyFacility.findUnique({ where: { id: facilityId } });
  if (!facility) throw new Error('Facility not found');
  if (facility.level >= 5) throw new Error('Facility is already at max level');
  const club = await prisma.club.findUnique({ where: { id: facility.clubId }, include: { finances: { orderBy: { week: 'desc' }, take: 1 } } });
  if (!club) throw new Error('Club not found');
  // Calculate upgrade cost (e.g., 10,000 per level)
  const upgradeCost = 10000 * (facility.level + 1);
  const finances = club.finances[0];
  if (!finances || finances.balance < upgradeCost) throw new Error('Insufficient funds');
  // Deduct cost from club finances
  await prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { decrement: upgradeCost } } });
  // Upgrade the facility
  const upgraded = await prisma.academyFacility.update({ where: { id: facilityId }, data: { level: { increment: 1 } } });
  // TODO: Apply facility effects (e.g., boost youth development, reduce injuries)
  return upgraded;
};

// Set or update a facility's specialization
export const setFacilitySpecialization = async (facilityId: number, specialization: string) => {
  return prisma.academyFacility.update({
    where: { id: facilityId },
    data: { specialization }
  });
};

// Get all facilities for a club with a specific specialization
export const getFacilitiesBySpecialization = async (clubId: number, specialization: string) => {
  return prisma.academyFacility.findMany({ where: { clubId, specialization } });
};

// Automation logic placeholder
export const automateFacilityUpgrades = async (clubId: number) => {
  const facilities = await prisma.academyFacility.findMany({ where: { clubId } });
  for (const facility of facilities) {
    if ((facility.level ?? 0) < 3) {
      const existing = await prisma.facilityUpgradeRequest.findFirst({ where: { facilityId: facility.id, status: 'pending' } });
      if (!existing) {
        await prisma.facilityUpgradeRequest.create({ data: { facilityId: facility.id, requestedAt: new Date(), status: 'pending' } });
      }
    }
  }
  return { scheduled: facilities.filter((f: any) => (f.level ?? 0) < 3).length };
}; 