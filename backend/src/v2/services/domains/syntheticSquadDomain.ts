import { Prisma } from '@prisma/client';
import { clamp, mulberry32, pick, stringToSeed } from '../../helpers';
import { MatchPrepPositionGroup, resolveMatchPrepPositionGroup } from './matchPrepDomain';

const SYNTHETIC_FIRST_NAMES = [
  'Daan', 'Milan', 'Noah', 'Sem', 'Lars', 'Jens', 'Finn', 'Ruben', 'Luuk', 'Timo',
  'Sam', 'Niels', 'Wout', 'Bas', 'Koen', 'Bram', 'Levi', 'Gijs', 'Kyan', 'Sven'
];

const SYNTHETIC_LAST_NAMES = [
  'van Dijk', 'de Jong', 'Bakker', 'Jansen', 'de Vries', 'Smit', 'Visser', 'Meijer', 'Bos', 'Mulder',
  'Vos', 'Peeters', 'Kok', 'Kuipers', 'Dekker', 'van der Meer', 'van den Berg', 'van Leeuwen', 'Hendriks', 'Hoekstra'
];

export const SYNTHETIC_POSITION_TEMPLATE = [
  'GK', 'GK', 'GK',
  'RB', 'LB', 'CB', 'CB', 'RWB', 'LWB',
  'DM', 'CM', 'CM', 'AM', 'RW', 'LW',
  'ST', 'ST', 'CF',
  'CB', 'CM', 'RW', 'ST'
];

const ABILITY_BASE_BY_POSITION: Record<string, number> = {
  GK: 72,
  CB: 74,
  RB: 73,
  LB: 73,
  RWB: 72,
  LWB: 72,
  DM: 75,
  CM: 76,
  AM: 77,
  RW: 76,
  LW: 76,
  ST: 78,
  CF: 77
};

export type SyntheticPlayerProfile = 'squad' | 'starter' | 'prospect' | 'depth';

export interface SyntheticPlayerOptions {
  profile?: SyntheticPlayerProfile;
  positionHint?: string;
  nationality?: string;
  ageMin?: number;
  ageMax?: number;
  referenceYear?: number;
}

export function buildSyntheticPlayerPayload(
  clubId: number,
  random: () => number,
  options?: SyntheticPlayerOptions
): Prisma.PlayerCreateManyInput {
  const profile = options?.profile ?? 'squad';
  const thisYear = Math.max(2024, Math.round(options?.referenceYear ?? new Date().getFullYear()));
  const firstName = pick(SYNTHETIC_FIRST_NAMES, random);
  const lastName = pick(SYNTHETIC_LAST_NAMES, random);
  const position = options?.positionHint ?? pick(SYNTHETIC_POSITION_TEMPLATE, random);
  const baseAbility = ABILITY_BASE_BY_POSITION[position] ?? 72;

  let minAge = 17;
  let maxAge = 35;
  let abilityFloor = baseAbility - 6;
  let abilityCeiling = baseAbility + 18;
  let potentialExtraMin = 4;
  let potentialExtraMax = 26;
  let wageBase = 650;
  let wageScale = 38;
  let valueFactorMin = 420;
  let valueFactorMax = 750;
  let contractYearsMin = 2;
  let contractYearsMax = 4;

  if (profile === 'starter') {
    minAge = 22;
    maxAge = 31;
    abilityFloor = baseAbility + 4;
    abilityCeiling = baseAbility + 18;
    potentialExtraMin = 2;
    potentialExtraMax = 12;
    wageBase = 1200;
    wageScale = 52;
    valueFactorMin = 520;
    valueFactorMax = 920;
    contractYearsMin = 3;
    contractYearsMax = 5;
  } else if (profile === 'prospect') {
    minAge = 16;
    maxAge = 21;
    abilityFloor = baseAbility - 12;
    abilityCeiling = baseAbility + 4;
    potentialExtraMin = 12;
    potentialExtraMax = 30;
    wageBase = 480;
    wageScale = 24;
    valueFactorMin = 360;
    valueFactorMax = 690;
    contractYearsMin = 3;
    contractYearsMax = 5;
  } else if (profile === 'depth') {
    minAge = 19;
    maxAge = 29;
    abilityFloor = baseAbility - 10;
    abilityCeiling = baseAbility + 6;
    potentialExtraMin = 5;
    potentialExtraMax = 15;
    wageBase = 520;
    wageScale = 30;
    valueFactorMin = 380;
    valueFactorMax = 700;
    contractYearsMin = 1;
    contractYearsMax = 3;
  }

  if (Number.isFinite(options?.ageMin)) {
    minAge = Math.max(16, Math.round(options?.ageMin ?? minAge));
  }
  if (Number.isFinite(options?.ageMax)) {
    maxAge = Math.max(minAge, Math.round(options?.ageMax ?? maxAge));
  }

  const age = minAge + Math.floor(random() * (maxAge - minAge + 1));
  const dobYear = thisYear - age;
  const dobMonth = Math.floor(random() * 12);
  const dobDay = 1 + Math.floor(random() * 28);
  const currentAbility = clamp(Math.round(abilityFloor + random() * (abilityCeiling - abilityFloor + 1)), 40, 155);
  const potentialAbility = clamp(
    currentAbility + Math.round(potentialExtraMin + random() * (potentialExtraMax - potentialExtraMin + 1)),
    currentAbility,
    190
  );
  const weeklyWage = Math.round(wageBase + currentAbility * wageScale + random() * 2200);
  const value = Math.round((currentAbility * currentAbility) * (valueFactorMin + random() * (valueFactorMax - valueFactorMin)));
  const contractYears = contractYearsMin + Math.floor(random() * (contractYearsMax - contractYearsMin + 1));
  const contractStartYear = thisYear - (random() < 0.4 ? 1 : 0);
  const contractStart = new Date(Date.UTC(contractStartYear, 6, 1));
  const contractEnd = new Date(Date.UTC(contractStartYear + contractYears, 5, 30));

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    dateOfBirth: new Date(dobYear, dobMonth, dobDay),
    contractStart,
    contractEnd,
    currentClubId: clubId,
    position,
    preferredPositions: JSON.stringify([position]),
    preferredFoot: random() < 0.25 ? 'LEFT' : 'RIGHT',
    nationality: options?.nationality ?? 'Netherlands',
    currentAbility,
    potentialAbility,
    weeklyWage,
    value,
    morale: 55,
    happiness: 55,
    isInjured: false,
    isSuspended: false
  };
}

export function planControlledClubSquadBalanceRepairs(context: {
  careerId: string;
  controlledClubId: number;
  players: Array<{ id: number; position: string | null }>;
}): Prisma.PlayerCreateManyInput[] {
  const { careerId, controlledClubId, players } = context;
  if (players.length === 0) {
    return [];
  }

  const targetShape: Array<{ group: MatchPrepPositionGroup; positionHint: string }> = [
    { group: 'GK', positionHint: 'GK' },
    { group: 'GK', positionHint: 'GK' },
    { group: 'DEF', positionHint: 'RB' },
    { group: 'DEF', positionHint: 'LB' },
    { group: 'DEF', positionHint: 'CB' },
    { group: 'DEF', positionHint: 'CB' },
    { group: 'DEF', positionHint: 'RWB' },
    { group: 'DEF', positionHint: 'LWB' },
    { group: 'MID', positionHint: 'DM' },
    { group: 'MID', positionHint: 'CM' },
    { group: 'MID', positionHint: 'CM' },
    { group: 'MID', positionHint: 'AM' },
    { group: 'MID', positionHint: 'CM' },
    { group: 'MID', positionHint: 'DM' },
    { group: 'ATT', positionHint: 'RW' },
    { group: 'ATT', positionHint: 'LW' },
    { group: 'ATT', positionHint: 'ST' },
    { group: 'ATT', positionHint: 'CF' }
  ];

  const counts: Record<MatchPrepPositionGroup, number> = {
    GK: 0,
    DEF: 0,
    MID: 0,
    ATT: 0
  };
  for (const player of players) {
    counts[resolveMatchPrepPositionGroup(player.position)] += 1;
  }

  const desiredCounts = targetShape.reduce<Record<MatchPrepPositionGroup, number>>(
    (accumulator, slot) => {
      accumulator[slot.group] += 1;
      return accumulator;
    },
    { GK: 0, DEF: 0, MID: 0, ATT: 0 }
  );

  const plannedCounts = { ...counts };
  const createdPlayers: Prisma.PlayerCreateManyInput[] = [];
  for (const [slotIndex, slot] of targetShape.entries()) {
    if (plannedCounts[slot.group] >= desiredCounts[slot.group]) {
      continue;
    }
    const random = mulberry32(
      stringToSeed(`${careerId}:club:${controlledClubId}:balance-repair:${slot.group}:${slot.positionHint}:${slotIndex}`)
    );
    createdPlayers.push(
      buildSyntheticPlayerPayload(controlledClubId, random, {
        profile: 'squad',
        positionHint: slot.positionHint
      })
    );
    plannedCounts[slot.group] += 1;
  }

  return createdPlayers;
}
