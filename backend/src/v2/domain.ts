export const V2_PHASES = {
  PLANNING: 'PLANNING',
  EVENT: 'EVENT',
  MATCH_PREP: 'MATCH_PREP',
  MATCH: 'MATCH',
  POST_MATCH: 'POST_MATCH',
  WEEK_WRAP: 'WEEK_WRAP',
  TERMINATED: 'TERMINATED'
} as const;

export type V2Phase = (typeof V2_PHASES)[keyof typeof V2_PHASES];

export const V2_URGENCY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type V2Urgency = (typeof V2_URGENCY)[keyof typeof V2_URGENCY];

export const V2_FIXTURE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;

export type V2FixtureStatus = (typeof V2_FIXTURE_STATUS)[keyof typeof V2_FIXTURE_STATUS];

export const V2_MATCH_STATUS = {
  PENDING: 'PENDING',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED'
} as const;

export type V2MatchStatus = (typeof V2_MATCH_STATUS)[keyof typeof V2_MATCH_STATUS];

export const V2_INTERVENTION_TYPES = {
  MENTALITY_SHIFT: 'MENTALITY_SHIFT',
  PRESSING_INTENSITY: 'PRESSING_INTENSITY',
  SUBSTITUTION_TRIGGER: 'SUBSTITUTION_TRIGGER',
  HALFTIME_TEAM_TALK: 'HALFTIME_TEAM_TALK'
} as const;

export type V2InterventionType = (typeof V2_INTERVENTION_TYPES)[keyof typeof V2_INTERVENTION_TYPES];

export const V2_LINEUP_POLICIES = {
  BEST_XI: 'BEST_XI',
  BALANCED: 'BALANCED',
  ROTATE: 'ROTATE',
  YOUTH_BET: 'YOUTH_BET'
} as const;

export type V2LineupPolicy = (typeof V2_LINEUP_POLICIES)[keyof typeof V2_LINEUP_POLICIES];

export const V2_BENCH_PRIORITIES = {
  IMPACT: 'IMPACT',
  BALANCED: 'BALANCED',
  DEFENSIVE: 'DEFENSIVE',
  YOUTH: 'YOUTH'
} as const;

export type V2BenchPriority = (typeof V2_BENCH_PRIORITIES)[keyof typeof V2_BENCH_PRIORITIES];

export const V2_PRE_MATCH_INSTRUCTIONS = {
  BALANCED: 'BALANCED',
  FOCUS_POSSESSION: 'FOCUS_POSSESSION',
  COUNTER_ATTACK: 'COUNTER_ATTACK',
  HIGH_PRESS: 'HIGH_PRESS',
  LOW_BLOCK: 'LOW_BLOCK',
  SET_PIECES: 'SET_PIECES'
} as const;

export type V2PreMatchInstruction = (typeof V2_PRE_MATCH_INSTRUCTIONS)[keyof typeof V2_PRE_MATCH_INSTRUCTIONS];

export const V2_FORMATIONS = {
  FOUR_THREE_THREE: '4-3-3',
  FOUR_TWO_THREE_ONE: '4-2-3-1',
  FOUR_FOUR_TWO: '4-4-2',
  THREE_FIVE_TWO: '3-5-2',
  FIVE_THREE_TWO: '5-3-2'
} as const;

export type V2Formation = (typeof V2_FORMATIONS)[keyof typeof V2_FORMATIONS];

export interface WeekPlanPayload {
  trainingFocus: string;
  rotationIntensity: string;
  tacticalMentality: string;
  transferStance: string;
  scoutingPriority: string;
}

export interface EventEffectPayload {
  moraleDelta?: number;
  boardDelta?: number;
  fanDelta?: number;
  mediaDelta?: number;
  fitnessTrendDelta?: number;
  budgetDelta?: number;
  playerMoraleDelta?: number;
  playerFitnessDelta?: number;
  playerFormDelta?: number;
  playerDevelopmentDelta?: number;
  transferAction?: 'SIGN_STARTER' | 'SIGN_PROSPECT' | 'SELL_FRINGE';
  scoutingOutcome?: 'LOCAL_DISCOVERY' | 'NATIONAL_SHORTLIST' | 'INTERNATIONAL_BREAKTHROUGH' | 'YOUTH_INTAKE_SPIKE';
}

export interface EventOption {
  id: string;
  label: string;
  effects: EventEffectPayload;
  acceptanceRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  acceptanceHint?: string;
  boardPolicyLevel?: 'SOFT' | 'HARD';
  boardPolicyWarning?: string;
}

export interface InterventionPayload {
  type: V2InterventionType;
  intensity?: number;
  minute?: number;
  note?: string;
  outPlayerId?: number;
  inPlayerId?: number;
  teamTalk?: 'PRAISE' | 'DEMAND_MORE' | 'CALM_FOCUS';
  substitutionReason?: 'FRESH_LEGS' | 'TACTICAL_TWEAK' | 'PROTECT_BOOKING';
}

export interface MatchPrepPayload {
  formation?: V2Formation;
  lineupPolicy?: V2LineupPolicy;
  benchPriority?: V2BenchPriority;
  preMatchInstruction?: V2PreMatchInstruction;
  startingPlayerIds?: number[];
  benchPlayerIds?: number[];
  captainPlayerId?: number;
}

export interface MatchSimulationResult {
  homeScore: number;
  awayScore: number;
  homeXg: number;
  awayXg: number;
  homePossession: number;
  awayPossession: number;
  highlights: Array<{
    minute: number;
    eventType: string;
    teamSide?: 'home' | 'away';
    actorId?: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    animationPreset: string;
    cameraPath: string;
    commentary: string;
    xThreatRank: number;
    isDecisive: boolean;
    payload: Record<string, unknown>;
  }>;
}
