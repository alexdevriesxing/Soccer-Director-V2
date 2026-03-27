import {
  MatchPrepPayload,
  V2BenchPriority,
  V2Formation,
  V2LineupPolicy,
  V2PreMatchInstruction,
  V2_BENCH_PRIORITIES,
  V2_FORMATIONS,
  V2_LINEUP_POLICIES,
  V2_PRE_MATCH_INSTRUCTIONS
} from '../../domain';

export type MatchPrepPositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT';
export type ManagerDirectiveCode = 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE';

export interface MatchPrepSelectionWarning {
  code: string;
  severity: 'INFO' | 'WARN';
  playerId: number | null;
  message: string;
}

export interface MatchPrepPositionCounts {
  GK: number;
  DEF: number;
  MID: number;
  ATT: number;
}

export interface MatchPrepFormationConfig {
  label: string;
  summary: string;
  starterTargets: MatchPrepPositionCounts;
}

export const EMPTY_MATCH_PREP_POSITION_COUNTS: MatchPrepPositionCounts = {
  GK: 0,
  DEF: 0,
  MID: 0,
  ATT: 0
};

export const MATCH_PREP_FORMATION_CONFIGS: Record<V2Formation, MatchPrepFormationConfig> = {
  [V2_FORMATIONS.FOUR_THREE_THREE]: {
    label: '4-3-3',
    summary: 'Wide front three with balanced midfield control.',
    starterTargets: { GK: 1, DEF: 4, MID: 3, ATT: 3 }
  },
  [V2_FORMATIONS.FOUR_TWO_THREE_ONE]: {
    label: '4-2-3-1',
    summary: 'Double pivot with extra central control behind one striker.',
    starterTargets: { GK: 1, DEF: 4, MID: 5, ATT: 1 }
  },
  [V2_FORMATIONS.FOUR_FOUR_TWO]: {
    label: '4-4-2',
    summary: 'Classic two-bank structure with a strike pair.',
    starterTargets: { GK: 1, DEF: 4, MID: 4, ATT: 2 }
  },
  [V2_FORMATIONS.THREE_FIVE_TWO]: {
    label: '3-5-2',
    summary: 'Three center-backs with midfield overload and two forwards.',
    starterTargets: { GK: 1, DEF: 3, MID: 5, ATT: 2 }
  },
  [V2_FORMATIONS.FIVE_THREE_TWO]: {
    label: '5-3-2',
    summary: 'Low-risk back five with compact midfield support.',
    starterTargets: { GK: 1, DEF: 5, MID: 3, ATT: 2 }
  }
};

export interface ResolvedMatchPrep {
  formation: V2Formation;
  lineupPolicy: V2LineupPolicy;
  benchPriority: V2BenchPriority;
  preMatchInstruction: V2PreMatchInstruction;
  startingPlayerIds: number[];
  benchPlayerIds: number[];
  captainPlayerId: number | null;
  startersAverageAbility: number;
  startersAverageFitness: number;
  benchAverageAbility: number;
  selectionWarnings: MatchPrepSelectionWarning[];
}

export interface MatchPrepCandidate {
  id: number;
  position: string;
  ability: number;
  fitness: number;
  group: MatchPrepPositionGroup;
  managerDirectiveCode?: ManagerDirectiveCode | null;
}

export interface ActiveStatusDirectiveLike {
  directiveCode: ManagerDirectiveCode;
  playerName: string;
}

function parsePlayerId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parsePlayerIdList(value: unknown, limit: number): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids: number[] = [];
  const seen = new Set<number>();
  for (const row of value) {
    const parsed = parsePlayerId(row);
    if (parsed === null || seen.has(parsed)) {
      continue;
    }
    seen.add(parsed);
    ids.push(parsed);
    if (ids.length >= limit) {
      break;
    }
  }

  return ids;
}

function cloneCounts(counts: MatchPrepPositionCounts): MatchPrepPositionCounts {
  return {
    GK: counts.GK,
    DEF: counts.DEF,
    MID: counts.MID,
    ATT: counts.ATT
  };
}

function addTopCandidatesForGroup(
  rankedCandidates: MatchPrepCandidate[],
  group: MatchPrepPositionGroup,
  count: number,
  selected: Set<number>,
  destination: number[]
) {
  if (count <= 0) {
    return;
  }

  let added = 0;
  for (const candidate of rankedCandidates) {
    if (added >= count) {
      break;
    }
    if (selected.has(candidate.id) || candidate.group !== group) {
      continue;
    }
    selected.add(candidate.id);
    destination.push(candidate.id);
    added += 1;
  }
}

function resolveBenchTargets(benchPriority: V2BenchPriority): MatchPrepPositionCounts {
  switch (benchPriority) {
    case V2_BENCH_PRIORITIES.IMPACT:
      return { GK: 1, DEF: 1, MID: 2, ATT: 3 };
    case V2_BENCH_PRIORITIES.DEFENSIVE:
      return { GK: 1, DEF: 3, MID: 2, ATT: 1 };
    case V2_BENCH_PRIORITIES.YOUTH:
      return { GK: 1, DEF: 1, MID: 2, ATT: 3 };
    case V2_BENCH_PRIORITIES.BALANCED:
    default:
      return { GK: 1, DEF: 2, MID: 2, ATT: 2 };
  }
}

export function createDefaultMatchPrep(): ResolvedMatchPrep {
  return {
    formation: V2_FORMATIONS.FOUR_THREE_THREE,
    lineupPolicy: V2_LINEUP_POLICIES.BALANCED,
    benchPriority: V2_BENCH_PRIORITIES.BALANCED,
    preMatchInstruction: V2_PRE_MATCH_INSTRUCTIONS.BALANCED,
    startingPlayerIds: [],
    benchPlayerIds: [],
    captainPlayerId: null,
    startersAverageAbility: 0,
    startersAverageFitness: 0,
    benchAverageAbility: 0,
    selectionWarnings: []
  };
}

export function resolveMatchPrepPayload(payload?: MatchPrepPayload): ResolvedMatchPrep {
  const defaults = createDefaultMatchPrep();
  if (!payload) {
    return defaults;
  }

  const formation = payload.formation ?? defaults.formation;
  const lineupPolicy = payload.lineupPolicy ?? defaults.lineupPolicy;
  const benchPriority = payload.benchPriority ?? defaults.benchPriority;
  const preMatchInstruction = payload.preMatchInstruction ?? defaults.preMatchInstruction;
  const startingPlayerIds = parsePlayerIdList(payload.startingPlayerIds, 11);
  const benchPlayerIds = parsePlayerIdList(payload.benchPlayerIds, 7);
  const captainPlayerId = parsePlayerId(payload.captainPlayerId);

  if (!Object.values(V2_FORMATIONS).includes(formation)) {
    throw new Error(`Invalid formation: ${formation}`);
  }
  if (!Object.values(V2_LINEUP_POLICIES).includes(lineupPolicy)) {
    throw new Error(`Invalid lineup policy: ${lineupPolicy}`);
  }
  if (!Object.values(V2_BENCH_PRIORITIES).includes(benchPriority)) {
    throw new Error(`Invalid bench priority: ${benchPriority}`);
  }
  if (!Object.values(V2_PRE_MATCH_INSTRUCTIONS).includes(preMatchInstruction)) {
    throw new Error(`Invalid pre-match instruction: ${preMatchInstruction}`);
  }

  return {
    formation,
    lineupPolicy,
    benchPriority,
    preMatchInstruction,
    startingPlayerIds,
    benchPlayerIds,
    captainPlayerId,
    startersAverageAbility: 0,
    startersAverageFitness: 0,
    benchAverageAbility: 0,
    selectionWarnings: []
  };
}

export function resolveMatchPrepPositionGroup(position: string | null | undefined): MatchPrepPositionGroup {
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

function scoreMatchPrepCandidate(
  candidate: MatchPrepCandidate,
  lineupPolicy: V2LineupPolicy,
  benchPriority: V2BenchPriority,
  forBench = false
): number {
  const ability = candidate.ability;
  const fitness = candidate.fitness;
  let score = ability * 1.1 + fitness * 0.9;

  switch (lineupPolicy) {
    case V2_LINEUP_POLICIES.BEST_XI:
      score = ability * 1.3 + fitness * 0.7;
      break;
    case V2_LINEUP_POLICIES.ROTATE:
      score = ability * 0.8 + fitness * 1.2;
      break;
    case V2_LINEUP_POLICIES.YOUTH_BET:
      score = ability * 0.75 + fitness * 1.05 + (100 - ability) * 0.15;
      break;
    case V2_LINEUP_POLICIES.BALANCED:
    default:
      score = ability * 1.1 + fitness * 0.9;
      break;
  }

  if (!forBench) {
    if (candidate.managerDirectiveCode === 'REST_RECOVERY') {
      score -= 1000;
    } else if (candidate.managerDirectiveCode === 'LIMITED_MINUTES') {
      score -= 120;
    } else if (candidate.managerDirectiveCode === 'DISCIPLINARY_NOTE') {
      score -= 8;
    }
    return score;
  }

  let benchScore = score;
  switch (benchPriority) {
    case V2_BENCH_PRIORITIES.IMPACT:
      benchScore += ability * 0.35;
      break;
    case V2_BENCH_PRIORITIES.DEFENSIVE:
      benchScore += candidate.group === 'DEF' || candidate.group === 'GK' ? 16 : 0;
      break;
    case V2_BENCH_PRIORITIES.YOUTH:
      benchScore += (100 - ability) * 0.22;
      break;
    case V2_BENCH_PRIORITIES.BALANCED:
    default:
      benchScore += ability * 0.08 + fitness * 0.08;
      break;
  }

  if (candidate.managerDirectiveCode === 'REST_RECOVERY') {
    benchScore -= 180;
  } else if (candidate.managerDirectiveCode === 'LIMITED_MINUTES') {
    benchScore += 28;
  } else if (candidate.managerDirectiveCode === 'DISCIPLINARY_NOTE') {
    benchScore -= 4;
  }

  return benchScore;
}

export function countMatchPrepGroups(
  playerIds: number[],
  candidateByPlayerId: Map<number, Pick<MatchPrepCandidate, 'group'>>
): MatchPrepPositionCounts {
  const counts = cloneCounts(EMPTY_MATCH_PREP_POSITION_COUNTS);
  for (const playerId of playerIds) {
    const candidate = candidateByPlayerId.get(playerId);
    if (!candidate) {
      continue;
    }
    counts[candidate.group] += 1;
  }
  return counts;
}

export function buildAutoMatchSelection(
  candidates: MatchPrepCandidate[],
  formation: V2Formation,
  lineupPolicy: V2LineupPolicy,
  benchPriority: V2BenchPriority
): { startingPlayerIds: number[]; benchPlayerIds: number[] } {
  const rankedStarters = [...candidates].sort((a, b) => {
    const scoreDelta = scoreMatchPrepCandidate(b, lineupPolicy, benchPriority) - scoreMatchPrepCandidate(a, lineupPolicy, benchPriority);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return a.id - b.id;
  });

  const rankedBench = [...candidates].sort((a, b) => {
    const scoreDelta = scoreMatchPrepCandidate(b, lineupPolicy, benchPriority, true) - scoreMatchPrepCandidate(a, lineupPolicy, benchPriority, true);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return a.id - b.id;
  });

  const formationTargets = MATCH_PREP_FORMATION_CONFIGS[formation].starterTargets;
  const selected = new Set<number>();
  const startingPlayerIds: number[] = [];

  for (const group of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    addTopCandidatesForGroup(rankedStarters, group, formationTargets[group], selected, startingPlayerIds);
  }

  for (const candidate of rankedStarters) {
    if (startingPlayerIds.length >= 11) {
      break;
    }
    if (selected.has(candidate.id)) {
      continue;
    }
    if (candidate.group === 'GK' && formationTargets.GK <= 1) {
      continue;
    }
    selected.add(candidate.id);
    startingPlayerIds.push(candidate.id);
  }

  for (const candidate of rankedStarters) {
    if (startingPlayerIds.length >= 11) {
      break;
    }
    if (selected.has(candidate.id)) {
      continue;
    }
    selected.add(candidate.id);
    startingPlayerIds.push(candidate.id);
  }

  const benchPlayerIds: number[] = [];
  const benchTargets = resolveBenchTargets(benchPriority);
  for (const group of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    addTopCandidatesForGroup(rankedBench, group, benchTargets[group], selected, benchPlayerIds);
  }

  for (const candidate of rankedBench) {
    if (benchPlayerIds.length >= 7) {
      break;
    }
    if (selected.has(candidate.id)) {
      continue;
    }
    selected.add(candidate.id);
    benchPlayerIds.push(candidate.id);
  }

  return {
    startingPlayerIds,
    benchPlayerIds
  };
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseMatchPrepSelectionWarnings(raw: unknown): MatchPrepSelectionWarning[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const rows: MatchPrepSelectionWarning[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const code = toNullableString(record.code);
    const message = toNullableString(record.message);
    const severityRaw = (toNullableString(record.severity) || 'WARN').toUpperCase();
    const severity = severityRaw === 'INFO' ? 'INFO' : 'WARN';
    const playerIdRaw = toFiniteNumber(record.playerId);
    if (!code || !message) continue;
    rows.push({
      code,
      message,
      severity,
      playerId: playerIdRaw !== null ? Math.round(playerIdRaw) : null
    });
    if (rows.length >= 16) break;
  }
  return rows;
}

export function buildMatchPrepSelectionWarnings(
  startingPlayerIds: number[],
  benchPlayerIds: number[],
  activeStatusDirectives: Map<number, ActiveStatusDirectiveLike>
): MatchPrepSelectionWarning[] {
  const warnings: MatchPrepSelectionWarning[] = [];

  for (const playerId of startingPlayerIds) {
    const directive = activeStatusDirectives.get(playerId);
    if (!directive) continue;
    if (directive.directiveCode === 'LIMITED_MINUTES') {
      warnings.push({
        code: 'LIMITED_MINUTES_STARTER',
        severity: 'WARN',
        playerId,
        message: `${directive.playerName} is set to Limited Minutes but is in the Starting XI. Consider moving them to the bench.`
      });
    } else if (directive.directiveCode === 'DISCIPLINARY_NOTE') {
      warnings.push({
        code: 'DISCIPLINARY_NOTE_STARTER',
        severity: 'INFO',
        playerId,
        message: `${directive.playerName} has an active disciplinary note and is selected to start. Monitor morale risk.`
      });
    }
  }

  for (const playerId of benchPlayerIds) {
    const directive = activeStatusDirectives.get(playerId);
    if (!directive) continue;
    if (directive.directiveCode === 'REST_RECOVERY') {
      warnings.push({
        code: 'REST_RECOVERY_BENCH',
        severity: 'WARN',
        playerId,
        message: `${directive.playerName} is on Rest & Recovery but listed on the bench. Use only if necessary.`
      });
    } else if (directive.directiveCode === 'DISCIPLINARY_NOTE') {
      warnings.push({
        code: 'DISCIPLINARY_NOTE_BENCH',
        severity: 'INFO',
        playerId,
        message: `${directive.playerName} has an active disciplinary note and is listed on the bench.`
      });
    }
  }

  return warnings.slice(0, 12);
}
