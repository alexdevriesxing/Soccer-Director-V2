export const MATCH_FORMATIONS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2'] as const;
export type MatchFormation = typeof MATCH_FORMATIONS[number];

export type MatchPrepPositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT';
export interface MatchPrepPositionCounts {
  GK: number;
  DEF: number;
  MID: number;
  ATT: number;
}

export const MATCH_FORMATION_CONFIGS: Record<MatchFormation, {
  label: string;
  summary: string;
  starterTargets: MatchPrepPositionCounts;
}> = {
  '4-3-3': {
    label: '4-3-3',
    summary: 'Wide front three with balanced midfield control.',
    starterTargets: { GK: 1, DEF: 4, MID: 3, ATT: 3 }
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    summary: 'Double pivot with extra central control behind one striker.',
    starterTargets: { GK: 1, DEF: 4, MID: 5, ATT: 1 }
  },
  '4-4-2': {
    label: '4-4-2',
    summary: 'Classic two-bank structure with a strike pair.',
    starterTargets: { GK: 1, DEF: 4, MID: 4, ATT: 2 }
  },
  '3-5-2': {
    label: '3-5-2',
    summary: 'Three center-backs with midfield overload and two forwards.',
    starterTargets: { GK: 1, DEF: 3, MID: 5, ATT: 2 }
  },
  '5-3-2': {
    label: '5-3-2',
    summary: 'Low-risk back five with compact midfield support.',
    starterTargets: { GK: 1, DEF: 5, MID: 3, ATT: 2 }
  }
};

export const MATCH_LINEUP_POLICIES = ['BEST_XI', 'BALANCED', 'ROTATE', 'YOUTH_BET'] as const;
export type MatchLineupPolicy = typeof MATCH_LINEUP_POLICIES[number];

export const MATCH_LINEUP_POLICY_DETAILS: Record<MatchLineupPolicy, { label: string; summary: string }> = {
  BEST_XI: { label: 'Best XI', summary: 'Maximises pure quality and immediate output.' },
  BALANCED: { label: 'Balanced', summary: 'Blends quality and conditioning for stable performance.' },
  ROTATE: { label: 'Rotate Squad', summary: 'Prioritises freshness and spreads minutes wider.' },
  YOUTH_BET: { label: 'Youth Bet', summary: 'Takes upside risks on lower-established players.' }
};

export const MATCH_BENCH_PRIORITIES = ['IMPACT', 'BALANCED', 'DEFENSIVE', 'YOUTH'] as const;
export type MatchBenchPriority = typeof MATCH_BENCH_PRIORITIES[number];

export const MATCH_BENCH_PRIORITY_DETAILS: Record<MatchBenchPriority, { label: string; summary: string }> = {
  IMPACT: { label: 'Impact', summary: 'Leans toward game-changing attackers and quick injections of quality.' },
  BALANCED: { label: 'Balanced', summary: 'Maintains cover across every line with no heavy bias.' },
  DEFENSIVE: { label: 'Defensive Cover', summary: 'Loads the bench with security and protection options.' },
  YOUTH: { label: 'Youth Minutes', summary: 'Creates a path for developing players to get involved.' }
};

export const MATCH_PRE_MATCH_INSTRUCTIONS = [
  'BALANCED',
  'FOCUS_POSSESSION',
  'COUNTER_ATTACK',
  'HIGH_PRESS',
  'LOW_BLOCK',
  'SET_PIECES'
] as const;
export type MatchPreMatchInstruction = typeof MATCH_PRE_MATCH_INSTRUCTIONS[number];

export const MATCH_PRE_MATCH_INSTRUCTION_DETAILS: Record<MatchPreMatchInstruction, { label: string; summary: string }> = {
  BALANCED: { label: 'Balanced', summary: 'Keeps risk and control in a neutral middle ground.' },
  FOCUS_POSSESSION: { label: 'Focus Possession', summary: 'Values control, rhythm, and patient circulation.' },
  COUNTER_ATTACK: { label: 'Counter Attack', summary: 'Accepts lower possession to attack open space faster.' },
  HIGH_PRESS: { label: 'High Press', summary: 'Pushes the line up to force turnovers and increase chaos.' },
  LOW_BLOCK: { label: 'Low Block', summary: 'Defends deeper and trades territory for compactness.' },
  SET_PIECES: { label: 'Set Pieces', summary: 'Tilts chance creation toward dead-ball situations.' }
};

export const MATCH_AUTO_PRESETS = ['BEST_XI', 'ROTATE'] as const;
export type MatchAutoPreset = typeof MATCH_AUTO_PRESETS[number];

export const DEVELOPMENT_PLAN_FOCUSES = ['TECHNICAL', 'PHYSICAL', 'TACTICAL', 'MENTAL'] as const;
export type DevelopmentPlanFocus = typeof DEVELOPMENT_PLAN_FOCUSES[number];

export const DEVELOPMENT_PLAN_TARGETS = [
  'FIRST_TEAM_PUSH',
  'MATCH_SHARPNESS',
  'LONG_TERM_UPSIDE',
  'INJURY_PREVENTION'
] as const;
export type DevelopmentPlanTarget = typeof DEVELOPMENT_PLAN_TARGETS[number];

export const SQUAD_ROLE_ASSIGNMENTS = ['STARTER', 'ROTATION', 'DEPTH'] as const;
export type SquadRoleAssignment = typeof SQUAD_ROLE_ASSIGNMENTS[number];

export const PLAYER_STATUS_DIRECTIVES = ['REST_RECOVERY', 'LIMIT_MINUTES', 'DISCIPLINARY_NOTE', 'CLEAR_DIRECTIVE'] as const;
export type PlayerStatusDirectiveAction = typeof PLAYER_STATUS_DIRECTIVES[number];

export type ActivePlayerDirectiveCode = 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE';

export const PLAYER_MEDICAL_PLAN_CODES = [
  'REHAB_CONSERVATIVE',
  'PHASED_RETURN',
  'RECOVERY_FOCUS',
  'INJURY_PREVENTION',
  'MATCH_SHARPNESS'
] as const;
export type ActivePlayerMedicalPlanCode = typeof PLAYER_MEDICAL_PLAN_CODES[number];

export const PLAYER_MEDICAL_PLAN_ACTIONS = [...PLAYER_MEDICAL_PLAN_CODES, 'CLEAR_PLAN'] as const;
export type PlayerMedicalPlanAction = typeof PLAYER_MEDICAL_PLAN_ACTIONS[number];

export const SQUAD_REGISTRATION_ACTIONS = ['REGISTER', 'UNREGISTER'] as const;
export type SquadRegistrationAction = typeof SQUAD_REGISTRATION_ACTIONS[number];

export const RETRAINABLE_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LW', 'RW', 'CF', 'ST'] as const;
export type RetrainablePosition = typeof RETRAINABLE_POSITIONS[number];

export const CLUB_OPERATION_KEYS = [
  'TRAINING_COMPLEX',
  'MEDICAL_DEPARTMENT',
  'RECRUITMENT_NETWORK',
  'COMMERCIAL_TEAM'
] as const;
export type ClubOperationKey = typeof CLUB_OPERATION_KEYS[number];
