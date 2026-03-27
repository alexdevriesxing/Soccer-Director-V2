import { ClubOperationKey } from './contracts';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CareerSummary {
  id: string;
  managerName: string;
  controlledClubId: number;
  controlledClubName?: string;
  controlledLeagueName?: string | null;
  season: string;
  weekNumber: number;
  currentPhase: string;
  currentDate: string;
  activeLeagueId: number | null;
  updatedAt?: string;
  saveSlots?: Array<{
    slotName: string;
    isAuto: boolean;
    updatedAt: string;
    stateHash?: string;
  }>;
}

export interface ClubChoice {
  id: number;
  name: string;
  reputation: number;
  leagueId: number | null;
  leagueName: string;
  leagueTier: number | null;
  divisionType?: 'PRO' | 'AMATEUR';
  ageCategory?: 'SENIOR' | 'O21';
}

export interface CareerLeagueOption {
  leagueId: number;
  leagueName: string;
  leagueLevel: string;
  region: string | null;
  matchdayType: string | null;
  tier: number;
  divisionType: 'PRO' | 'AMATEUR';
  ageCategory: 'SENIOR' | 'O21';
  clubCount: number;
  isActiveLeague: boolean;
}

export interface StandingsRow {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  progressionStatus: string;
}

export interface LeagueRules {
  seasonPhase: {
    code: 'OPENING_WINDOW' | 'FIRST_HALF' | 'MIDSEASON_WINDOW' | 'SECOND_HALF' | 'RUN_IN' | 'FINAL_WEEK';
    label: string;
    note: string;
  };
  league: {
    id: number;
    name: string;
    level: string;
    region: string | null;
    matchdayType: string | null;
    tier: number;
    divisionType: 'PRO' | 'AMATEUR';
    ageCategory: 'SENIOR' | 'O21';
  };
  transitionGroup: string;
  promotion: {
    slots: number;
    targetLeagues: Array<{
      leagueId: number;
      name: string;
      tier: number;
    }>;
  };
  relegation: {
    slots: number;
    targetLeagues: Array<{
      leagueId: number;
      name: string;
      tier: number;
    }>;
  };
  registration: {
    competitionLabel: string;
    registrationLimit: number;
    minimumRegistered: number;
    overageLimit: number | null;
    notes: string[];
    window: {
      status: 'OPEN' | 'DEADLINE' | 'CLOSED';
      label: string;
      isOpen: boolean;
      opensWeekNumber: number;
      closesWeekNumber: number;
      nextOpenWeekNumber: number | null;
      weeksRemaining: number;
      note: string;
    };
  };
  transferWindow: {
    status: 'OPEN' | 'DEADLINE' | 'CLOSED';
    label: string;
    isOpen: boolean;
    opensWeekNumber: number;
    closesWeekNumber: number;
    nextOpenWeekNumber: number | null;
    weeksRemaining: number;
    note: string;
  };
  disciplinary: {
    suspensionRule: string;
    notes: string[];
  };
  notes: string[];
}

export interface CareerState extends CareerSummary {
  club?: {
    id: number;
    name: string;
    leagueId?: number;
    reputation?: number;
    balance?: number;
    transferBudget?: number;
  };
  clubState?: {
    morale: number;
    fitnessTrend: number;
    boardConfidence: number;
    budgetBalance: number;
    form: string;
  };
  pendingEvents: number;
  urgentPendingEvents: number;
  nextUserFixture?: {
    id: string;
    homeClubId: number;
    awayClubId: number;
    weekNumber: number;
    status: string;
    leagueId: number;
    matchDate?: string;
    homeScore?: number | null;
    awayScore?: number | null;
    isUserClubFixture?: boolean;
    homeClubName?: string;
    awayClubName?: string;
    leagueName?: string | null;
    leagueTier?: number | null;
    isControlledClubHome?: boolean | null;
    opponentClubId?: number | null;
    opponentClubName?: string | null;
  };
  boardStatus?: BoardStatusSnapshot;
  clubPulseSummary?: ClubPulseSummary;
  lastContractWeekWrapDigest?: ContractWeekWrapDigest | null;
  latestMatchInsight?: {
    fixtureId: string;
    matchDate: string | null;
    opponentClubName: string | null;
    scoreline: string;
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendedWeekPlan: {
      trainingFocus: string;
      rotationIntensity: string;
      tacticalMentality: string;
    };
  } | null;
  weekPlan?: {
    trainingFocus: string;
    rotationIntensity: string;
    tacticalMentality: string;
    transferStance: string;
    scoutingPriority: string;
  };
  pendingActions: {
    needsWeekPlan: boolean;
    needsEventResponses: boolean;
    needsMatchPrep: boolean;
  };
}

export interface ContractWeekWrapDigestPlayer {
  id: number;
  name: string;
  position: string;
}

export interface ContractWeekWrapDigest {
  wrappedWeekNumber: number | null;
  nextWeekNumber: number | null;
  wrappedAt: string;
  expiredCount: number;
  releasedPlayers: ContractWeekWrapDigestPlayer[];
  releasedWageRelief: number;
  emergencySignings: number;
  emergencySigningCost: number;
  netBudgetDelta: number;
  moraleDelta: number;
  boardDelta: number;
  squadBefore: number;
  squadAfterRelease: number;
  squadAfterTopUp: number;
}

export interface BoardObjectiveSnapshot {
  id: string;
  title: string;
  target: string;
  current: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'FAILED';
  progressPct: number;
  weight: number;
}

export interface BoardStatusSnapshot {
  boardConfidence: number;
  boardRiskLevel: 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL';
  jobSecurity: 'SECURE' | 'STABLE' | 'UNSTABLE' | 'UNDER_REVIEW' | 'CRITICAL';
  jobSecurityScore: number;
  reviewWindowWeeks: number | null;
  summary: string;
  objectives: BoardObjectiveSnapshot[];
  standingsContext: {
    leagueId: number | null;
    leagueName: string | null;
    leagueTier: number | null;
    position: number | null;
    clubCount: number;
    points: number;
    pointsPerGame: number;
    played: number;
  };
}

export interface ClubPulseHeadline {
  id: string;
  category: 'BOARD' | 'FANS' | 'MEDIA' | 'MATCH' | 'CONTRACT' | 'TRANSFER' | 'CLUB';
  tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  title: string;
  summary: string;
  weekNumber: number | null;
  createdAt: string | null;
}

export interface ClubPulseSummary {
  fanSentimentScore: number;
  fanSentimentLabel: 'DISCONNECTED' | 'RESTLESS' | 'STEADY' | 'ENGAGED' | 'EUPHORIC';
  fanSummary: string;
  mediaPressureScore: number;
  mediaPressureLabel: 'QUIET' | 'WATCHING' | 'LOUD' | 'FEVERED';
  mediaSummary: string;
  projectedAttendance: number | null;
  projectedAttendancePct: number | null;
  topHeadline: string | null;
}

export interface ClubPulseSnapshot extends ClubPulseSummary {
  boardStatus: BoardStatusSnapshot;
  headlines: ClubPulseHeadline[];
  recentResults: Array<{
    fixtureId: string;
    opponentClubName: string | null;
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    scoreline: string;
    matchDate: string | null;
  }>;
}

export interface InboxEvent {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  urgency: string;
  options: Array<{
    id: string;
    label: string;
    acceptanceRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    acceptanceHint?: string;
    boardPolicyLevel?: 'SOFT' | 'HARD';
    boardPolicyWarning?: string;
    effects: {
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
    };
  }>;
  status: string;
  deadline: string;
  resolutionNote?: string;
}

export interface InboxRespondResult {
  eventId: string;
  option: InboxEvent['options'][number];
  pendingEvents: number;
  contractAction?: {
    action: 'RENEW' | 'RELEASE' | 'PROMISE' | 'COUNTER' | 'REJECT';
    playerId: number;
    playerName: string;
    years?: number;
    compensationWeeks?: number;
    weeklyWage?: number;
    contractEnd?: string;
    budgetImpact?: number;
    requestedYears?: number;
    requestedWageAdjustmentPct?: number;
    counterYears?: number;
    counterWageAdjustmentPct?: number;
    boardDelta?: number;
    playerMoraleDelta?: number;
    note?: string;
    followUpEventId?: string;
  } | null;
}

export interface HighlightItem {
  id: string;
  minute: number;
  eventType: string;
  teamSide?: 'home' | 'away';
  actorId?: number | null;
  commentary: string;
  animationPreset: string;
  cameraPath?: string | null;
  payload?: Record<string, unknown> | null;
  xThreatRank?: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  isDecisive: boolean;
}

export interface LiveMatchState {
  currentMinute: number;
  segment: 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'FULL_TIME';
  currentStartingPlayerIds: number[];
  currentBenchPlayerIds: number[];
  substitutionsUsed: number;
  substitutionLimit: number;
  remainingSubstitutions: number;
  tacticalChangesUsed: number;
  tacticalChangeLimit: number;
  remainingTacticalChanges: number;
  halftimeTalkUsed: boolean;
  halftimeTalkChoice: 'PRAISE' | 'DEMAND_MORE' | 'CALM_FOCUS' | null;
  mentality: 'BALANCED' | 'POSITIVE' | 'ALL_OUT_ATTACK' | 'PROTECT_LEAD';
  pressing: 'STANDARD' | 'HIGH_PRESS' | 'MID_BLOCK' | 'DROP_OFF';
  possessionSwing: number;
}

export interface MatchPayload {
  fixture: {
    id: string;
    homeClubId: number;
    awayClubId: number;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    leagueId: number;
    weekNumber?: number;
    matchDate?: string;
    isUserClubFixture?: boolean;
    homeClubName?: string;
    awayClubName?: string;
    leagueName?: string | null;
    leagueTier?: number | null;
    isControlledClubHome?: boolean | null;
    opponentClubId?: number | null;
    opponentClubName?: string | null;
  };
  match: {
    status: string;
    homeScore: number;
    awayScore: number;
    homeXg: number;
    awayXg: number;
    homePossession: number;
    awayPossession: number;
    matchPrep?: {
      formation: '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '5-3-2';
      lineupPolicy: string;
      benchPriority: string;
      preMatchInstruction: string;
      startingPlayerIds?: number[];
      benchPlayerIds?: number[];
      captainPlayerId?: number | null;
      startersAverageAbility?: number;
      startersAverageFitness?: number;
      benchAverageAbility?: number;
      selectionWarnings?: Array<{
        code: string;
        severity: 'INFO' | 'WARN';
        playerId: number | null;
        message: string;
      }>;
    };
    liveState?: LiveMatchState;
    interventions: Array<Record<string, unknown>>;
  } | null;
  highlights: HighlightItem[];
}

export interface PostMatchPayload {
  fixtureId: string;
  fixture?: {
    id: string;
    homeClubId: number;
    awayClubId: number;
    leagueId: number;
    weekNumber: number;
    status: string;
    matchDate: string;
    homeScore: number | null;
    awayScore: number | null;
    homeClubName: string;
    awayClubName: string;
    leagueName: string | null;
    leagueTier: number | null;
    isControlledClubHome: boolean | null;
    opponentClubId: number | null;
    opponentClubName: string | null;
  };
  score: {
    home: number;
    away: number;
  };
  xg: {
    home: number;
    away: number;
  };
  possession: {
    home: number;
    away: number;
  };
  clubState?: {
    morale: number;
    boardConfidence: number;
    fitnessTrend: number;
    budgetBalance: number;
  };
  standingsPreview: Array<{
    position: number;
    clubId: number;
    clubName: string;
    played: number;
    points: number;
    goalDifference: number;
    progressionStatus: string;
  }>;
  playerImpact?: {
    averageMorale: number;
    averageFitness: number;
    averageForm: number;
    injuredCount: number;
    suspendedCount: number;
  } | null;
  playerRatings?: {
    averageRating: number;
    topPerformer: {
      playerId: number;
      playerName: string;
      rating: number;
      summary: string;
    } | null;
    biggestConcern: {
      playerId: number;
      playerName: string;
      rating: number;
      summary: string;
    } | null;
    rows: Array<{
      playerId: number;
      playerName: string;
      position: string;
      role: 'STARTER' | 'SUBSTITUTE' | 'UNUSED_BENCH';
      minutes: number;
      rating: number;
      summary: string;
      goals: number;
      shots: number;
      shotsOnTarget: number;
      xg: number;
      yellowCards: number;
      redCard: boolean;
      subbedOn: boolean;
      subbedOff: boolean;
    }>;
  } | null;
  chanceQuality?: {
    summary: string;
    verdict: 'DESERVED_MORE' | 'EDGED_IT' | 'EVEN' | 'SECOND_BEST' | 'CLINICAL_EDGE';
    home: {
      shots: number;
      shotsOnTarget: number;
      bigChances: number;
      totalShotXg: number;
      averageShotXg: number;
      bestChanceXg: number;
      woodwork: number;
      blockedShots: number;
      offsides: number;
      penaltiesScored: number;
      penaltiesMissed: number;
    };
    away: {
      shots: number;
      shotsOnTarget: number;
      bigChances: number;
      totalShotXg: number;
      averageShotXg: number;
      bestChanceXg: number;
      woodwork: number;
      blockedShots: number;
      offsides: number;
      penaltiesScored: number;
      penaltiesMissed: number;
    };
  } | null;
  tacticalFeedback?: {
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    recommendedWeekPlan: {
      trainingFocus: string;
      rotationIntensity: string;
      tacticalMentality: string;
    };
    interventionRead: {
      usedHalftimeTalk: boolean;
      usedSubstitution: boolean;
      usedTacticalShifts: boolean;
      verdict: string;
    };
  } | null;
  interventionImpact?: {
    totalInterventions: number;
    aggregate: {
      directNetGoalDelta: number;
      directNetXgDelta: number;
      windowNetGoalDelta: number;
      windowNetXThreatDelta: number;
      directGoalsFromInterventions: number;
    };
    windows: Array<{
      index: number;
      type: string;
      minute: number;
      nextMinute: number | null;
      windowEndMinute: number;
      intensity: number | null;
      note: string | null;
      directEventType: string | null;
      directNetGoalDelta: number;
      directNetXgDelta: number;
      windowGoalsFor: number;
      windowGoalsAgainst: number;
      windowXThreatFor: number;
      windowXThreatAgainst: number;
      windowNetGoalDelta: number;
      windowNetXThreatDelta: number;
    }>;
  } | null;
  latestPlannerInsight?: {
    fixtureId: string;
    matchDate: string | null;
    opponentClubName: string | null;
    scoreline: string;
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendedWeekPlan: {
      trainingFocus: string;
      rotationIntensity: string;
      tacticalMentality: string;
    };
  } | null;
  appliedChanges: boolean;
}

export interface SquadPlayer {
  id: number;
  fullName: string;
  position: string;
  effectivePosition?: string | null;
  age?: number | null;
  currentAbility?: number | null;
  potentialAbility?: number | null;
  weeklyWage?: number | null;
  marketValue?: number | null;
  contractStart?: string | null;
  contractEnd?: string | null;
  contractYearsRemaining?: number;
  contractRisk?: 'STABLE' | 'WATCH' | 'CRITICAL';
  morale: number;
  fitness: number;
  form: number;
  isInjured: boolean;
  injuryWeeks: number;
  isSuspended: boolean;
  suspensionId?: string | null;
  suspensionReason?: string | null;
  suspensionIssuedWeekNumber?: number | null;
  suspensionSourceFixtureId?: string | null;
  suspensionMatchesRemaining?: number | null;
  suspensionNote?: string | null;
  developmentDelta: number;
  assignedRole?: 'STARTER' | 'ROTATION' | 'DEPTH' | null;
  registrationStatus?: 'REGISTERED' | 'UNREGISTERED';
  registrationNote?: string | null;
  eligibilityCode?: 'ELIGIBLE' | 'UNREGISTERED' | 'OVERAGE_LIMIT' | 'INJURED' | 'SUSPENDED';
  eligibilityNote?: string | null;
  isEligibleForNextFixture?: boolean;
  managerDirectiveCode?: 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE' | null;
  managerDirectiveLabel?: string | null;
  retrainingTargetPosition?: string | null;
  retrainingProgressPct?: number | null;
  retrainingReadyForMatchPrep?: boolean;
}

export interface SquadPlayerProfile {
  playerId: number;
  fullName: string;
  position: string;
  effectivePosition?: string | null;
  age: number | null;
  currentAbility: number | null;
  potentialAbility: number | null;
  weeklyWage: number | null;
  marketValue: number | null;
  availability: {
    status: 'AVAILABLE' | 'INJURED' | 'SUSPENDED';
    note: string;
    isInjured: boolean;
    injuryWeeks: number;
    isSuspended: boolean;
    suspension: {
      suspensionId: string;
      matchesRemaining: number;
      reason: string;
      issuedWeekNumber: number;
      sourceFixtureId: string | null;
      note: string;
    } | null;
    managerDirective: {
      directiveId: string;
      directiveCode: 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE';
      label: string;
      note: string;
      setWeekNumber: number;
      expiresWeekNumber: number;
      weeksRemaining: number;
      sourceAction: string | null;
    } | null;
  };
  registration: {
    isRegistered: boolean;
    competitionLabel: string;
    registeredCount: number;
    registrationLimit: number;
    minimumRegistered: number;
    overageCount: number;
    overageLimit: number | null;
    eligibilityCode: 'ELIGIBLE' | 'UNREGISTERED' | 'OVERAGE_LIMIT' | 'INJURED' | 'SUSPENDED';
    eligibilityNote: string;
    note: string;
    rulesNotes: string[];
    window: {
      status: 'OPEN' | 'DEADLINE' | 'CLOSED';
      label: string;
      isOpen: boolean;
      opensWeekNumber: number;
      closesWeekNumber: number;
      nextOpenWeekNumber: number | null;
      weeksRemaining: number;
      note: string;
    };
  };
  performance: {
    morale: number;
    fitness: number;
    form: number;
    developmentDelta: number;
  };
  medical: {
    rehabStatus: 'FIT' | 'MONITOR' | 'REHAB' | 'RETURNING';
    workloadRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    workloadScore: number;
    recoveryRecommendation: string;
    availabilityRecommendation: 'FULLY_AVAILABLE' | 'LIMITED_MINUTES' | 'REST_RECOVERY' | 'NO_SELECTION';
    riskFactors: string[];
    recommendedPlanCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS';
    activePlan: {
      planId: string;
      planCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS';
      label: string;
      note: string;
      setWeekNumber: number;
      expiresWeekNumber: number;
      weeksRemaining: number;
      sourceAction: string | null;
      projectedEffects: {
        moraleDelta: number;
        fitnessDelta: number;
        formDelta: number;
        injuryRecoveryBoost: number;
        injuryRiskDelta: number;
        fatigueModifier: number;
        availabilityRecommendation: 'FULLY_AVAILABLE' | 'LIMITED_MINUTES' | 'REST_RECOVERY' | 'NO_SELECTION';
        summary: string;
      };
    } | null;
  };
  squadContext: {
    squadSize: number;
    squadAbilityRank: number;
    positionCount: number;
    depthRankAtPosition: number | null;
    roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT';
    playingTimeExpectation: 'KEY_PLAYER' | 'IMPORTANT' | 'ROTATION' | 'SPORADIC' | 'DEVELOPMENT';
    recommendation: string;
    assignedRole: 'STARTER' | 'ROTATION' | 'DEPTH' | null;
    recommendedAssignedRole: 'STARTER' | 'ROTATION' | 'DEPTH';
    roleMismatch: boolean;
    rolePressureNote: string;
  };
  contract: {
    contractStart: string | null;
    contractEnd: string | null;
    yearsRemaining: number;
    daysRemaining: number | null;
    risk: 'STABLE' | 'WATCH' | 'CRITICAL';
    recommendation: string;
    suggestedRenewalYears: number;
    suggestedWageAdjustmentPct: number;
  };
  pendingContractTalk: {
    eventId: string;
    stage: 'WARNING' | 'COUNTER' | 'FALLOUT';
    title: string;
    urgency: string;
    deadline: string;
  } | null;
  playingTimePromise: {
    promiseId: string;
    promiseType: 'BENCH_WINDOW';
    promisedRoleAssignment: 'STARTER' | 'ROTATION' | 'DEPTH';
    createdWeekNumber: number;
    dueWeekNumber: number;
    reaffirmCount: number;
    weeksUntilDue: number;
    status: 'ON_TRACK' | 'DUE' | 'OVERDUE';
    sourceEventId: string | null;
    matchdaySquadCount: number;
    appearanceCount: number;
    startCount: number;
    unusedBenchCount: number;
    totalMinutes: number;
    lastUsedWeekNumber: number | null;
    lastUsageSummary: string | null;
    summary: string;
  } | null;
  developmentPlan: {
    planId: string;
    focus: 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL';
    target: 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION';
    setWeekNumber: number;
    sourceEventId: string | null;
    projectedEffects: {
      moraleDelta: number;
      fitnessDelta: number;
      formDelta: number;
      developmentDelta: number;
      summary: string;
    };
  } | null;
  retraining: {
    planId: string;
    currentPosition: string;
    effectivePosition: string;
    targetPosition: string;
    progressPct: number;
    weeklyProgressPct: number;
    readiness: 'NOT_READY' | 'EMERGENCY_COVER' | 'READY';
    setWeekNumber: number;
    estimatedWeeksRemaining: number;
    sourceEventId: string | null;
    summary: string;
  } | null;
  recentHistory: {
    roleChanges: Array<{
      occurredAt: string;
      roleAssignment: 'STARTER' | 'ROTATION' | 'DEPTH';
      previousRoleAssignment: 'STARTER' | 'ROTATION' | 'DEPTH' | null;
      expectedRole: 'STARTER' | 'ROTATION' | 'DEPTH' | null;
      moraleDelta: number;
      boardDelta: number;
      sourceReason: string | null;
      summary: string;
    }>;
    developmentPlanChanges: Array<{
      occurredAt: string;
      focus: 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL';
      target: 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION';
      previousFocus: 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL' | null;
      previousTarget: 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION' | null;
      immediateMoraleDelta: number;
      summary: string;
    }>;
    medicalPlanChanges: Array<{
      occurredAt: string;
      action: 'SET' | 'CLEAR';
      planCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS' | null;
      previousPlanCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS' | null;
      expiresWeekNumber: number | null;
      immediateFitnessDelta: number;
      immediateMoraleDelta: number;
      immediateFormDelta: number;
      summary: string;
    }>;
    retrainingChanges: Array<{
      occurredAt: string;
      action: 'SET' | 'PROGRESS' | 'COMPLETE' | 'CLEAR';
      currentPosition: string | null;
      targetPosition: string | null;
      progressPct: number | null;
      weeklyProgressPct: number | null;
      summary: string;
    }>;
    promiseTimeline: Array<{
      occurredAt: string;
      action: 'CREATE' | 'HONOR' | 'REAFFIRM' | 'CLOSE';
      promiseKind: 'BENCH_WINDOW' | null;
      dueWeekNumber: number | null;
      resolvedWeekNumber: number | null;
      sourceAction: string | null;
      summary: string;
    }>;
  };
}

export interface SquadRoleAssignmentResult {
  playerId: number;
  playerName: string;
  roleAssignment: 'STARTER' | 'ROTATION' | 'DEPTH';
  previousRoleAssignment: 'STARTER' | 'ROTATION' | 'DEPTH';
  expectedRole?: 'STARTER' | 'ROTATION' | 'DEPTH';
  moraleDelta: number;
  boardDelta: number;
  note: string;
}

export interface SquadDevelopmentPlanResult {
  playerId: number;
  playerName: string;
  focus: 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL';
  target: 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION';
  previousFocus: 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL' | null;
  previousTarget: 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION' | null;
  immediateMoraleDelta?: number;
  projectedEffects: {
    moraleDelta: number;
    fitnessDelta: number;
    formDelta: number;
    developmentDelta: number;
    summary: string;
  };
  note: string;
}

export interface SquadMedicalPlanResult {
  playerId: number;
  playerName: string;
  action: 'SET' | 'CLEAR';
  planCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS' | null;
  previousPlanCode: 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS' | null;
  expiresWeekNumber: number | null;
  immediateMoraleDelta: number;
  immediateFitnessDelta: number;
  immediateFormDelta: number;
  workloadRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rehabStatus: 'FIT' | 'MONITOR' | 'REHAB' | 'RETURNING';
  availabilityRecommendation: 'FULLY_AVAILABLE' | 'LIMITED_MINUTES' | 'REST_RECOVERY' | 'NO_SELECTION';
  projectedEffects?: {
    moraleDelta: number;
    fitnessDelta: number;
    formDelta: number;
    injuryRecoveryBoost: number;
    injuryRiskDelta: number;
    fatigueModifier: number;
    availabilityRecommendation: 'FULLY_AVAILABLE' | 'LIMITED_MINUTES' | 'REST_RECOVERY' | 'NO_SELECTION';
    summary: string;
  };
  note: string;
}

export interface SquadPlayerStatusActionResult {
  playerId: number;
  playerName: string;
  action: 'REST_RECOVERY' | 'LIMIT_MINUTES' | 'DISCIPLINARY_NOTE' | 'CLEAR_DIRECTIVE';
  directiveCode: 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE' | null;
  previousDirectiveCode: 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE' | null;
  moraleDelta: number;
  fitnessDelta: number;
  formDelta: number;
  boardDelta: number;
  expiresWeekNumber: number | null;
  note: string;
}

export interface SquadRegistrationActionResult {
  playerId: number;
  playerName: string;
  action: 'REGISTER' | 'UNREGISTER';
  isRegistered: boolean;
  registeredCount: number;
  registrationLimit: number;
  overageCount: number;
  overageLimit: number | null;
  moraleDelta: number;
  boardDelta: number;
  note: string;
}

export interface SquadRetrainingResult {
  playerId: number;
  playerName: string;
  action: 'SET' | 'CLEAR';
  currentPosition: string;
  effectivePosition: string;
  targetPosition: string | null;
  progressPct: number | null;
  weeklyProgressPct: number | null;
  immediateMoraleDelta: number;
  note: string;
}

export interface ClubOperationFinanceDescriptor {
  key: ClubOperationKey;
  label: string;
  level: number;
  maxLevel: number;
  upgradeCost: number | null;
  weeklyOperatingCost: number;
  currentEffectSummary: string;
  nextLevelEffectSummary: string | null;
  canUpgrade: boolean;
}

export interface ClubOperationsFinanceSummary {
  operations: ClubOperationFinanceDescriptor[];
  totalWeeklyOperatingCost: number;
  projectedWeeklyCommercialIncome: number;
  projectedWeeklyNetImpact: number;
}

export interface ClubOperationsUpgradeResult {
  operationKey: ClubOperationKey;
  operationLabel: string;
  previousLevel: number;
  newLevel: number;
  upgradeCost: number;
  operatingBalanceAfter: number;
  boardConfidenceAfter: number;
  clubOperations: ClubOperationsFinanceSummary;
  note: string;
}

export interface FinanceSnapshot {
  clubId: number;
  clubName: string;
  financialStatus: number;
  baseBalance: number;
  v2BudgetDelta: number;
  operatingBalance: number;
  transferBudget: number;
  wageBudget: number;
  weeklyWageBill: number;
  annualWageProjection: number;
  boardConfidence: number;
  morale: number;
  fitnessTrend: number;
  boardRiskLevel?: 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL';
  plannedStrategyDelta?: number;
  clubOperations: ClubOperationsFinanceSummary;
  activeWeekPlan?: {
    transferStance: string;
    scoutingPriority: string;
    tacticalMentality: string;
    rotationIntensity: string;
    trainingFocus: string;
  } | null;
}

export interface TransferMarketTarget {
  playerId: number;
  fullName: string;
  age: number | null;
  position: string;
  currentAbility: number | null;
  potentialAbility: number | null;
  marketValue: number;
  weeklyWage: number;
  sellerClubId: number;
  sellerClubName: string;
  sellerLeagueId: number | null;
  sellerTier: number | null;
  askingFee: number;
  scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH';
  fitScore: number;
  isAffordable: boolean;
  budgetGap: number;
  isShortlisted: boolean;
  scoutingReport: TransferScoutingReport | null;
  activeNegotiationId: string | null;
  agentPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  sellerStance: 'OPEN' | 'RELUCTANT' | 'AGGRESSIVE';
}

export interface TransferOutgoingTarget {
  playerId: number;
  fullName: string;
  age: number | null;
  position: string;
  currentAbility: number | null;
  potentialAbility: number | null;
  marketValue: number;
  weeklyWage: number;
  estimatedFee: number;
  netBudgetSwing: number;
  recommended: boolean;
}

export interface TransferMarketPayload {
  scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH';
  positionFilter: string | null;
  affordableOnly: boolean;
  seasonPhase: {
    code: 'OPENING_WINDOW' | 'FIRST_HALF' | 'MIDSEASON_WINDOW' | 'SECOND_HALF' | 'RUN_IN' | 'FINAL_WEEK';
    label: string;
    note: string;
  };
  transferWindow: {
    status: 'OPEN' | 'DEADLINE' | 'CLOSED';
    label: string;
    isOpen: boolean;
    opensWeekNumber: number;
    closesWeekNumber: number;
    nextOpenWeekNumber: number | null;
    weeksRemaining: number;
    note: string;
  };
  availableBudget: number;
  shortlistCount: number;
  targets: TransferMarketTarget[];
  shortlistedTargets: TransferMarketTarget[];
  activeNegotiations: TransferNegotiationSummary[];
  incomingLoans: TransferIncomingLoanSummary[];
  outgoingTargets: TransferOutgoingTarget[];
}

export interface TransferScoutingReport {
  playerId: number;
  scoutedAtWeekNumber: number;
  confidence: number;
  recommendation: 'PRIORITY' | 'MONITOR' | 'VALUE_LOAN' | 'AVOID';
  style: string;
  squadRoleProjection: 'STARTER' | 'ROTATION' | 'PROSPECT';
  summary: string;
  strengths: string[];
  risks: string[];
  agentPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  sellerStance: 'OPEN' | 'RELUCTANT' | 'AGGRESSIVE';
  recommendedBidFee: number;
  recommendedWeeklyWage: number;
  recommendedLoanFee: number;
  recommendedWageContributionPct: number;
  recommendedBuyOptionFee: number | null;
}

export interface TransferNegotiationTerms {
  transferFee: number | null;
  weeklyWage: number;
  loanFee: number | null;
  wageContributionPct: number | null;
  buyOptionFee: number | null;
  sellOnPct: number | null;
  loanDurationWeeks: number | null;
}

export interface TransferNegotiationSummary {
  negotiationId: string;
  playerId: number;
  playerName: string;
  position: string;
  sellerClubId: number;
  sellerClubName: string;
  kind: 'PERMANENT' | 'LOAN';
  stage: 'INITIAL' | 'COUNTERED';
  status: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  agentPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  sellerStance: 'OPEN' | 'RELUCTANT' | 'AGGRESSIVE';
  requestedAtWeekNumber: number;
  deadlineWeekNumber: number;
  latestOffer: TransferNegotiationTerms;
  counterOffer: TransferNegotiationTerms | null;
  note: string;
  clauseSummary: string[];
}

export interface TransferIncomingLoanSummary {
  loanId: number;
  playerId: number;
  playerName: string;
  position: string;
  fromClubId: number;
  fromClubName: string;
  endDate: string | null;
  weeksRemaining: number;
  weeklyWage: number;
  wageContributionPct: number;
  buyOptionFee: number | null;
  canTriggerBuyOption: boolean;
}

export interface TransferShortlistResult {
  playerId: number;
  playerName: string;
  shortlisted: boolean;
  shortlistCount: number;
  note: string;
}

export interface TransferScoutResult {
  playerId: number;
  playerName: string;
  report: TransferScoutingReport;
  note: string;
}

export interface TransferLoanDealResult {
  loanId: number;
  playerId: number;
  playerName: string;
  position: string;
  fromClubId: number;
  fromClubName: string;
  loanFee: number;
  weeklyWage: number;
  wageContributionPct: number;
  buyOptionFee: number | null;
  budgetAfter: number;
  endDate: string;
}

export interface TransferNegotiationResult {
  outcome: 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'WITHDRAWN';
  playerId: number;
  playerName: string;
  kind: 'PERMANENT' | 'LOAN';
  note: string;
  permanentDeal: TransferDealResult | null;
  loanDeal: TransferLoanDealResult | null;
  negotiation: TransferNegotiationSummary | null;
}

export interface TransferLoanBuyOptionResult {
  loanId: number;
  playerId: number;
  playerName: string;
  position: string;
  buyOptionFee: number;
  weeklyWage: number;
  budgetAfter: number;
  boardConfidenceAfter: number;
}

export interface TransferDealResult {
  playerId: number;
  playerName: string;
  position: string;
  fromClubId: number;
  fromClubName: string;
  transferFee: number;
  weeklyWage: number;
  signingCost: number;
  budgetAfter: number;
  boardConfidenceAfter: number;
  scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH';
}

export interface TransferSaleResult {
  playerId: number;
  playerName: string;
  position: string;
  toClubId: number;
  toClubName: string;
  transferFee: number;
  wageRelief: number;
  budgetImpact: number;
  budgetAfter: number;
  boardConfidenceAfter: number;
}

export interface ContractActionResult {
  playerId: number;
  playerName: string;
  action: 'RENEW' | 'RELEASE';
  years?: number;
  compensationWeeks?: number;
  weeklyWage?: number;
  contractEnd?: string;
  budgetImpact: number;
  budgetAfter: number;
  boardConfidenceAfter: number;
}
