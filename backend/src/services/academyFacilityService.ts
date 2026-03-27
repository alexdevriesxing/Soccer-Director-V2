import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Academy Facility Service - uses in-memory storage since academyFacility model doesn't exist
interface AcademyFacility {
  id: number;
  clubId: number;
  name: string;
  level: number;
  capacity: number;
  condition: number;
  upgradeCost: number;
}

const facilitiesStore: Map<number, AcademyFacility> = new Map();
let nextFacilityId = 1;

// Initialize default facilities for a club
function getDefaultFacilities(clubId: number): AcademyFacility[] {
  return [
    { id: nextFacilityId++, clubId, name: 'Training Pitches', level: 1, capacity: 20, condition: 100, upgradeCost: 500000 },
    { id: nextFacilityId++, clubId, name: 'Youth Dormitory', level: 1, capacity: 15, condition: 100, upgradeCost: 300000 },
    { id: nextFacilityId++, clubId, name: 'Education Center', level: 1, capacity: 30, condition: 100, upgradeCost: 200000 },
    { id: nextFacilityId++, clubId, name: 'Medical Facility', level: 1, capacity: 10, condition: 100, upgradeCost: 400000 }
  ];
}

export async function getAcademyFacilities(clubId: number): Promise<AcademyFacility[]> {
  let facilities = Array.from(facilitiesStore.values()).filter(f => f.clubId === clubId);

  if (facilities.length === 0) {
    facilities = getDefaultFacilities(clubId);
    facilities.forEach(f => facilitiesStore.set(f.id, f));
  }

  return facilities;
}

export async function upgradeFacility(facilityId: number): Promise<AcademyFacility> {
  const facility = facilitiesStore.get(facilityId);
  if (!facility) throw new Error('Facility not found');

  // Check club finances
  const finances = await prisma.clubFinances.findUnique({
    where: { clubId: facility.clubId }
  });

  if (!finances || (finances.currentBalance || 0) < facility.upgradeCost) {
    throw new Error('Insufficient funds for upgrade');
  }

  // Deduct cost
  await prisma.clubFinances.update({
    where: { clubId: facility.clubId },
    data: { currentBalance: (finances.currentBalance || 0) - facility.upgradeCost }
  });

  // Upgrade facility
  facility.level += 1;
  facility.capacity = Math.floor(facility.capacity * 1.2);
  facility.upgradeCost = Math.floor(facility.upgradeCost * 1.5);
  facilitiesStore.set(facilityId, facility);

  return facility;
}

export async function maintainFacility(facilityId: number): Promise<AcademyFacility> {
  const facility = facilitiesStore.get(facilityId);
  if (!facility) throw new Error('Facility not found');

  facility.condition = 100;
  facilitiesStore.set(facilityId, facility);

  return facility;
}

export async function getAcademyOverview(clubId: number) {
  const facilities = await getAcademyFacilities(clubId);

  // Get youth players count
  const youthPlayers = await prisma.player.count({
    where: { currentClubId: clubId, age: { lt: 21 } }
  });

  const totalLevel = facilities.reduce((sum, f) => sum + f.level, 0);
  const avgCondition = facilities.reduce((sum, f) => sum + f.condition, 0) / facilities.length;

  return {
    facilities,
    youthPlayers,
    overallRating: Math.round((totalLevel / facilities.length) * 20),
    condition: Math.round(avgCondition),
    totalCapacity: facilities.reduce((sum, f) => sum + f.capacity, 0)
  };
}

export async function setFacilitySpecialization(facilityId: number, _specialization: string): Promise<AcademyFacility> {
  const facility = facilitiesStore.get(facilityId);
  if (!facility) throw new Error('Facility not found');
  // Stub: specialization logic not implemented in in-memory store yet
  return facility;
}

export async function getFacilitiesBySpecialization(clubId: number, _specialization: string): Promise<AcademyFacility[]> {
  const facilities = await getAcademyFacilities(clubId);
  // Stub: return all for now or filter if specialization property added
  return facilities;
}