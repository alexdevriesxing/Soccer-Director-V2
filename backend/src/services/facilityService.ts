import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Facility types and their upgrade properties
const FACILITY_TYPES = ['stadium', 'trainingGround', 'youthAcademy', 'youthFacilities', 'scoutingNetwork'] as const;

interface FacilityInfo {
  id: string;
  name: string;
  type: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  effects: string;
}

function getFacilityInfo(type: string, level: number): Omit<FacilityInfo, 'id'> {
  const facilityNames: Record<string, string> = {
    stadiumLevel: 'Stadium',
    trainingGround: 'Training Ground',
    youthAcademy: 'Youth Academy',
    youthFacilities: 'Youth Facilities',
    scoutingNetwork: 'Scouting Network'
  };

  const baseUpgradeCost = 500000;
  return {
    name: facilityNames[type] || type,
    type,
    level,
    maxLevel: 5,
    upgradeCost: baseUpgradeCost * level * (level + 1),
    effects: `Level ${level} - Improves ${type} effectiveness by ${level * 10}%`
  };
}

export async function getFacilitiesForClub(clubId: number): Promise<FacilityInfo[]> {
  // Fetch ClubFacility for the club
  const clubFacility = await prisma.clubFacility.findUnique({
    where: { clubId }
  });

  if (!clubFacility) {
    // Return default facilities
    return FACILITY_TYPES.map((type, _i) => ({
      id: `${clubId}-${type}`,
      ...getFacilityInfo(type, 1)
    }));
  }

  // Map ClubFacility fields to facility array
  return [
    { id: `${clubId}-stadium`, ...getFacilityInfo('stadiumLevel', clubFacility.stadiumLevel) },
    { id: `${clubId}-training`, ...getFacilityInfo('trainingGround', clubFacility.trainingGround) },
    { id: `${clubId}-academy`, ...getFacilityInfo('youthAcademy', clubFacility.youthAcademy) },
    { id: `${clubId}-youth`, ...getFacilityInfo('youthFacilities', clubFacility.youthFacilities) },
    { id: `${clubId}-scouting`, ...getFacilityInfo('scoutingNetwork', clubFacility.scoutingNetwork) }
  ];
}

export async function upgradeFacility(facilityId: string) {
  // Parse clubId and facility type from facilityId (format: "clubId-type")
  const [clubIdStr, facilityType] = facilityId.split('-');
  const clubId = parseInt(clubIdStr, 10);

  if (!clubId || !facilityType) throw new Error('Invalid facility ID');

  // Get or create club facility
  let clubFacility = await prisma.clubFacility.findUnique({ where: { clubId } });

  if (!clubFacility) {
    clubFacility = await prisma.clubFacility.create({
      data: { clubId }
    });
  }

  // Map facility type to field name
  const fieldMap: Record<string, keyof typeof clubFacility> = {
    'stadium': 'stadiumLevel',
    'training': 'trainingGround',
    'academy': 'youthAcademy',
    'youth': 'youthFacilities',
    'scouting': 'scoutingNetwork'
  };

  const field = fieldMap[facilityType];
  if (!field) throw new Error('Unknown facility type');

  const currentLevel = clubFacility[field] as number;
  if (currentLevel >= 5) throw new Error('Facility is already at max level');

  // Upgrade the facility
  const updateData: Record<string, number> = {};
  updateData[field] = currentLevel + 1;

  const upgraded = await prisma.clubFacility.update({
    where: { clubId },
    data: updateData
  });

  return {
    facilityId,
    type: facilityType,
    newLevel: (upgraded as any)[field],
    message: `${facilityType} upgraded to level ${(upgraded as any)[field]}`
  };
}

export async function getUpgradeProgress(clubId: number) {
  const facilities = await getFacilitiesForClub(clubId);

  // Upgrade progress feature - return current state (no pending upgrades in this stub)
  return facilities.map(facility => ({
    id: facility.id,
    name: facility.name,
    type: facility.type,
    level: facility.level,
    status: 'idle' as const,
    estimatedCompletion: null
  }));
}