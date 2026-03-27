import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Daan', 'Milan', 'Noah', 'Sem', 'Lars', 'Jens', 'Finn', 'Ruben', 'Luuk', 'Timo',
  'Sam', 'Niels', 'Wout', 'Bas', 'Koen', 'Bram', 'Levi', 'Gijs', 'Kyan', 'Sven',
  'Thijs', 'Mats', 'Jurre', 'Teun', 'Jelle', 'Pepijn', 'Floris', 'Max', 'Julian', 'Tijn'
];

const LAST_NAMES = [
  'van Dijk', 'de Jong', 'Bakker', 'Jansen', 'de Vries', 'Smit', 'Visser', 'Meijer', 'Bos', 'Mulder',
  'Vos', 'Peeters', 'Kok', 'Kuipers', 'Dekker', 'van der Meer', 'van den Berg', 'van Leeuwen', 'Hendriks', 'Hoekstra',
  'van Loon', 'Pieters', 'de Boer', 'Schouten', 'van der Heijden', 'Brouwer', 'Kramer', 'Dijkstra', 'de Graaf', 'Kuijt'
];

const POSITION_TEMPLATE = [
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

interface SeedOptions {
  minSquadSize: number;
  dryRun: boolean;
  includeInactive: boolean;
  limit?: number;
  clubId?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function stringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv: string[]): SeedOptions {
  const opts: SeedOptions = {
    minSquadSize: 22,
    dryRun: false,
    includeInactive: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--min' && next) {
      opts.minSquadSize = Math.max(1, Number(next) || 22);
      i += 1;
    } else if (arg === '--limit' && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed) && parsed > 0) {
        opts.limit = Math.floor(parsed);
      }
      i += 1;
    } else if (arg === '--club-id' && next) {
      const parsed = Number(next);
      if (Number.isFinite(parsed) && parsed > 0) {
        opts.clubId = Math.floor(parsed);
      }
      i += 1;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--include-inactive') {
      opts.includeInactive = true;
    }
  }

  return opts;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const thisYear = new Date().getFullYear();

  const where = {
    leagueId: { not: null as number | null },
    ...(options.includeInactive ? {} : { isActive: true }),
    ...(options.clubId ? { id: options.clubId } : {})
  };

  const clubs = await prisma.club.findMany({
    where,
    select: { id: true, name: true, reputation: true },
    orderBy: { id: 'asc' },
    ...(options.limit ? { take: options.limit } : {})
  });

  let processedClubs = 0;
  let toppedUpClubs = 0;
  let createdPlayers = 0;

  for (const club of clubs) {
    processedClubs += 1;

    const existingCount = await prisma.player.count({
      where: { currentClubId: club.id }
    });

    if (existingCount >= options.minSquadSize) {
      continue;
    }

    const needed = options.minSquadSize - existingCount;
    toppedUpClubs += 1;
    createdPlayers += needed;

    if (options.dryRun) {
      continue;
    }

    const seed = stringToSeed(`dev-squad:${club.id}:${existingCount}:${options.minSquadSize}`);
    const random = mulberry32(seed);
    const repInfluence = (club.reputation ?? 50) / 100;

    const rows = Array.from({ length: needed }, (_, idx) => {
      const playerOrdinal = existingCount + idx;
      const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
      const position = POSITION_TEMPLATE[playerOrdinal % POSITION_TEMPLATE.length];
      const age = 17 + Math.floor(random() * 18);
      const dobYear = thisYear - age;
      const dobMonth = Math.floor(random() * 12);
      const dobDay = 1 + Math.floor(random() * 28);
      const baseAbility = ABILITY_BASE_BY_POSITION[position] ?? 72;
      const abilityBand = Math.round(baseAbility * (0.86 + repInfluence * 0.28));
      const currentAbility = clamp(Math.round(abilityBand + random() * 22 - 6), 45, 155);
      const potentialAbility = clamp(currentAbility + Math.round(4 + random() * 24), currentAbility, 190);
      const weeklyWage = Math.round(650 + currentAbility * 36 + random() * 1800);
      const marketValue = Math.round((currentAbility * currentAbility) * (390 + random() * 340));

      return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: new Date(dobYear, dobMonth, dobDay),
        nationality: 'Netherlands',
        currentClubId: club.id,
        position,
        preferredPositions: JSON.stringify([position]),
        preferredFoot: random() < 0.24 ? 'LEFT' : 'RIGHT',
        currentAbility,
        potentialAbility,
        weeklyWage,
        value: marketValue,
        morale: 55,
        happiness: 55,
        isInjured: false,
        isSuspended: false
      };
    });

    await prisma.player.createMany({ data: rows });
  }

  console.log(
    `[seed:dev-squads] clubs=${processedClubs} toppedUp=${toppedUpClubs} playersCreated=${createdPlayers} dryRun=${options.dryRun}`
  );
}

main()
  .catch((error) => {
    console.error('[seed:dev-squads] failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
