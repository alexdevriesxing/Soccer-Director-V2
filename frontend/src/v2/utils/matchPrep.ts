import {
  MatchAutoPreset,
  MatchBenchPriority,
  MatchFormation,
  MATCH_FORMATIONS,
  MATCH_FORMATION_CONFIGS,
  MatchPrepPositionCounts,
  MatchPrepPositionGroup
} from '../contracts';
import { SquadPlayer } from '../types';

export const STARTING_XI_SIZE = 11;
export const BENCH_SIZE = 7;
export const MIN_BENCH_SIZE = 3;

export const EMPTY_MATCH_PREP_POSITION_COUNTS: MatchPrepPositionCounts = {
  GK: 0,
  DEF: 0,
  MID: 0,
  ATT: 0
};

export function extractCareerIdFromMatchId(matchId: string | undefined): string | null {
  if (!matchId) return null;
  const marker = ':fx:';
  const markerIndex = matchId.indexOf(marker);
  if (markerIndex <= 0) return null;
  return matchId.slice(0, markerIndex);
}

export function toNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function isPlayerUnavailable(player: SquadPlayer): boolean {
  return Boolean(
    player.isInjured
    || player.isSuspended
    || player.isEligibleForNextFixture === false
    || player.eligibilityCode === 'UNREGISTERED'
    || player.eligibilityCode === 'OVERAGE_LIMIT'
  );
}

export function hasRestRecoveryDirective(player: SquadPlayer): boolean {
  return player.managerDirectiveCode === 'REST_RECOVERY';
}

export function hasLimitedMinutesDirective(player: SquadPlayer): boolean {
  return player.managerDirectiveCode === 'LIMITED_MINUTES';
}

export function hasDisciplinaryDirective(player: SquadPlayer): boolean {
  return player.managerDirectiveCode === 'DISCIPLINARY_NOTE';
}

export function resolvePlayerStatus(player: SquadPlayer): string {
  if (player.isInjured) {
    return `Injured (${Math.max(1, toNumber(player.injuryWeeks, 1))}w)`;
  }
  if (player.isSuspended) {
    const matchesRemaining = Math.max(1, toNumber(player.suspensionMatchesRemaining, 1));
    return `Suspended (${matchesRemaining} match${matchesRemaining === 1 ? '' : 'es'})`;
  }
  if (player.eligibilityCode === 'OVERAGE_LIMIT') {
    return 'Ineligible (overage slot)';
  }
  if (player.eligibilityCode === 'UNREGISTERED' || player.isEligibleForNextFixture === false) {
    return 'Unregistered';
  }
  if (player.managerDirectiveLabel) {
    return `Available • ${player.managerDirectiveLabel}`;
  }
  if (player.retrainingReadyForMatchPrep && player.retrainingTargetPosition) {
    return `Available • Cover at ${player.retrainingTargetPosition}`;
  }
  return 'Available';
}

export function resolvePositionGroup(position: string | null | undefined): MatchPrepPositionGroup {
  const normalized = String(position || '').trim().toUpperCase();
  if (!normalized) {
    return 'MID';
  }
  if (normalized.includes('GK') || normalized === 'GOALKEEPER') {
    return 'GK';
  }

  const isDefender =
    normalized.includes('CB') ||
    normalized.includes('RB') ||
    normalized.includes('LB') ||
    normalized.includes('RWB') ||
    normalized.includes('LWB') ||
    normalized.includes('WB') ||
    normalized.includes('SW') ||
    normalized.includes('BACK') ||
    normalized.includes('DEF');
  if (isDefender) {
    return 'DEF';
  }

  const isAttacker =
    normalized.includes('ST') ||
    normalized.includes('CF') ||
    normalized.includes('FW') ||
    normalized.includes('RW') ||
    normalized.includes('LW') ||
    normalized.includes('RF') ||
    normalized.includes('LF') ||
    normalized.includes('ATT') ||
    normalized.includes('SS');
  if (isAttacker) {
    return 'ATT';
  }

  return 'MID';
}

function selectionScore(player: SquadPlayer, preset: MatchAutoPreset, forBench = false, benchPriority: MatchBenchPriority = 'BALANCED'): number {
  const ability = toNumber(player.currentAbility, 60);
  const fitness = toNumber(player.fitness, 80);
  const form = toNumber(player.form, 50);
  let score: number;

  if (preset === 'ROTATE') {
    score = fitness * 1.3 + form * 0.8 + ability * 0.55;
  } else {
    score = ability * 1.25 + fitness * 0.7 + form * 0.35;
  }

  if (!forBench) {
    if (hasRestRecoveryDirective(player)) score -= 1000;
    else if (hasLimitedMinutesDirective(player)) score -= 120;
    else if (hasDisciplinaryDirective(player)) score -= 8;
    return score;
  }

  let benchScore = score;
  const positionGroup = resolvePlayerGroup(player);
  switch (benchPriority) {
    case 'IMPACT':
      benchScore += ability * 0.35;
      break;
    case 'DEFENSIVE':
      benchScore += positionGroup === 'DEF' || positionGroup === 'GK' ? 16 : 0;
      break;
    case 'YOUTH':
      benchScore += (100 - ability) * 0.22;
      break;
    case 'BALANCED':
    default:
      benchScore += ability * 0.08 + fitness * 0.08;
      break;
  }

  if (hasRestRecoveryDirective(player)) benchScore -= 180;
  else if (hasLimitedMinutesDirective(player)) benchScore += 28;
  else if (hasDisciplinaryDirective(player)) benchScore -= 4;

  return benchScore;
}

function resolveBenchTargets(benchPriority: MatchBenchPriority): MatchPrepPositionCounts {
  switch (benchPriority) {
    case 'IMPACT':
      return { GK: 1, DEF: 1, MID: 2, ATT: 3 };
    case 'DEFENSIVE':
      return { GK: 1, DEF: 3, MID: 2, ATT: 1 };
    case 'YOUTH':
      return { GK: 1, DEF: 1, MID: 2, ATT: 3 };
    case 'BALANCED':
    default:
      return { GK: 1, DEF: 2, MID: 2, ATT: 2 };
  }
}

function resolvePlayerGroup(player: SquadPlayer): MatchPrepPositionGroup {
  return resolvePositionGroup(player.effectivePosition ?? player.position);
}

function addTopPlayersForGroup(
  rankedPlayers: SquadPlayer[],
  group: MatchPrepPositionGroup,
  count: number,
  selected: Set<number>,
  destination: number[]
) {
  let added = 0;
  for (const player of rankedPlayers) {
    if (added >= count) {
      break;
    }
    if (selected.has(player.id) || resolvePlayerGroup(player) !== group) {
      continue;
    }
    selected.add(player.id);
    destination.push(player.id);
    added += 1;
  }
}

export function countSelectedFormationGroups(
  playerIds: number[],
  squadById: Map<number, SquadPlayer>
): MatchPrepPositionCounts {
  const counts: MatchPrepPositionCounts = { ...EMPTY_MATCH_PREP_POSITION_COUNTS };
  for (const playerId of playerIds) {
    const player = squadById.get(playerId);
    if (!player) {
      continue;
    }
    counts[resolvePlayerGroup(player)] += 1;
  }
  return counts;
}

export function selectionMatchesFormation(
  playerIds: number[],
  squadById: Map<number, SquadPlayer>,
  formation: MatchFormation
): { counts: MatchPrepPositionCounts; required: MatchPrepPositionCounts; valid: boolean } {
  const counts = countSelectedFormationGroups(playerIds, squadById);
  const required = MATCH_FORMATION_CONFIGS[formation].starterTargets;
  const valid = (['GK', 'DEF', 'MID', 'ATT'] as const).every((group) => counts[group] === required[group]);
  return { counts, required, valid };
}

export function buildAutoSelection(
  players: SquadPlayer[],
  formation: MatchFormation,
  preset: MatchAutoPreset,
  benchPriority: MatchBenchPriority
) {
  const availablePlayers = players.filter((player) => !isPlayerUnavailable(player));
  const rankedStarters = [...availablePlayers].sort((a, b) => {
    const scoreDelta = selectionScore(b, preset, false, benchPriority) - selectionScore(a, preset, false, benchPriority);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return a.id - b.id;
  });

  const rankedBench = [...availablePlayers].sort((a, b) => {
    const scoreDelta = selectionScore(b, preset, true, benchPriority) - selectionScore(a, preset, true, benchPriority);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return a.id - b.id;
  });

  const selected = new Set<number>();
  const starters: number[] = [];
  const formationTargets = MATCH_FORMATION_CONFIGS[formation].starterTargets;

  for (const group of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    addTopPlayersForGroup(rankedStarters, group, formationTargets[group], selected, starters);
  }

  for (const player of rankedStarters) {
    if (starters.length >= STARTING_XI_SIZE) {
      break;
    }
    if (selected.has(player.id)) {
      continue;
    }
    if (resolvePositionGroup(player.position) === 'GK' && formationTargets.GK <= 1) {
      continue;
    }
    selected.add(player.id);
    starters.push(player.id);
  }

  for (const player of rankedStarters) {
    if (starters.length >= STARTING_XI_SIZE) {
      break;
    }
    if (selected.has(player.id)) {
      continue;
    }
    selected.add(player.id);
    starters.push(player.id);
  }

  const bench: number[] = [];
  const benchTargets = resolveBenchTargets(benchPriority);
  for (const group of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    addTopPlayersForGroup(rankedBench, group, benchTargets[group], selected, bench);
  }

  for (const player of rankedBench) {
    if (bench.length >= BENCH_SIZE) {
      break;
    }
    if (selected.has(player.id)) {
      continue;
    }
    selected.add(player.id);
    bench.push(player.id);
  }

  const captain = starters[0] ?? null;

  return { starters, bench, captain };
}

export function resolvePlayableAutoSelection(
  players: SquadPlayer[],
  preferredFormation: MatchFormation,
  preset: MatchAutoPreset,
  benchPriority: MatchBenchPriority
) {
  const squadById = new Map(players.map((player) => [player.id, player]));
  const candidateFormations = [
    preferredFormation,
    ...MATCH_FORMATIONS.filter((formation) => formation !== preferredFormation)
  ];

  for (const formation of candidateFormations) {
    const selection = buildAutoSelection(players, formation, preset, benchPriority);
    const formationCheck = selectionMatchesFormation(selection.starters, squadById, formation);
    const hasRestRecoveryStarter = selection.starters.some((playerId) => {
      const player = squadById.get(playerId);
      return player ? hasRestRecoveryDirective(player) : false;
    });
    if (
      selection.starters.length === STARTING_XI_SIZE &&
      selection.bench.length >= MIN_BENCH_SIZE &&
      formationCheck.valid &&
      !hasRestRecoveryStarter
    ) {
      return {
        formation,
        ...selection
      };
    }
  }

  return null;
}
