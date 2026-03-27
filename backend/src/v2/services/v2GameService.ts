import { Prisma, PrismaClient, V2Career, V2ClubState, V2Fixture, V2Match } from '@prisma/client';
import path from 'node:path';
import {
  EventOption,
  InterventionPayload,
  MatchPrepPayload,
  MatchSimulationResult,
  WeekPlanPayload,
  V2InterventionType
} from '../domain';
import {
  V2_BENCH_PRIORITIES,
  V2_FIXTURE_STATUS,
  V2_FORMATIONS,
  V2_INTERVENTION_TYPES,
  V2_LINEUP_POLICIES,
  V2_MATCH_STATUS,
  V2_PRE_MATCH_INSTRUCTIONS,
  V2_PHASES,
  V2_URGENCY
} from '../domain';
import {
  addDays,
  chunked,
  clamp,
  hashJson,
  hashJsonLegacy,
  mulberry32,
  pick,
  shuffled,
  stringToSeed
} from '../helpers';
import {
  buildAutoMatchSelection,
  buildMatchPrepSelectionWarnings,
  countMatchPrepGroups,
  createDefaultMatchPrep,
  MATCH_PREP_FORMATION_CONFIGS,
  MatchPrepCandidate,
  MatchPrepPositionGroup,
  parseMatchPrepSelectionWarnings,
  ResolvedMatchPrep,
  resolveMatchPrepPayload,
  resolveMatchPrepPositionGroup
} from './domains/matchPrepDomain';
import {
  buildContractWarningPromiseLabel,
  buildContractWarningReleaseLabel,
  buildContractWarningRenewalPackages,
  ContractWarningRoleTier,
  assessContractRenewalBoardPolicy,
  assessContractWarningRenewalOffer,
  getContractWarningNegotiationRoundFromEventId,
  resolveContractWarningAgentStance,
  resolveContractWarningBoardStance,
  resolveContractWarningReleaseCompensationWeeks,
  resolveContractWarningRoleTier
} from './domains/contractWarningDomain';
import { StrategicPlanEffects, deriveStrategicPlanEffects } from './domains/strategicPlanDomain';
import {
  buildClubOperationsFinanceSummary,
  ClubOperationKey,
  ClubOperationsLevels,
  getClubOperationLabel,
  getClubOperationUpgradeCost,
  normalizeClubOperationKey,
  normalizeClubOperationsLevels,
  resolveClubOperationsPerformanceModifiers
} from './domains/clubOperationsDomain';
import {
  buildSyntheticPlayerPayload,
  planControlledClubSquadBalanceRepairs,
  SYNTHETIC_POSITION_TEMPLATE
} from './domains/syntheticSquadDomain';
import {
  compressSaveSnapshotPayload,
  MAX_MANUAL_SAVE_SLOTS_PER_CAREER,
  normalizeSaveSnapshot,
  parseSaveSnapshot,
  SaveSnapshot
} from './saveSlotCodec';

type Scoreline = { homeScore: number; awayScore: number };

interface FixturePairing {
  week: number;
  homeClubId: number;
  awayClubId: number;
}

interface MatchInterventionState {
  prep: ResolvedMatchPrep;
  live: LiveMatchState;
  entries: Array<Record<string, unknown>>;
}

type LiveMatchSegment = 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'FULL_TIME';
type LiveMentality = 'BALANCED' | 'POSITIVE' | 'ALL_OUT_ATTACK' | 'PROTECT_LEAD';
type LivePressing = 'STANDARD' | 'HIGH_PRESS' | 'MID_BLOCK' | 'DROP_OFF';
type HalftimeTalkChoice = 'PRAISE' | 'DEMAND_MORE' | 'CALM_FOCUS';

interface LiveMatchState {
  currentMinute: number;
  segment: LiveMatchSegment;
  currentStartingPlayerIds: number[];
  currentBenchPlayerIds: number[];
  substitutionsUsed: number;
  substitutionLimit: number;
  tacticalChangesUsed: number;
  tacticalChangeLimit: number;
  halftimeTalkUsed: boolean;
  halftimeTalkChoice: HalftimeTalkChoice | null;
  mentality: LiveMentality;
  pressing: LivePressing;
  possessionSwing: number;
}

interface NormalizedInterventionEntry {
  type: string;
  minute: number;
  intensity: number | null;
  note: string | null;
  createdAt: string | null;
  eventType: string | null;
  directEffect: {
    scoreForBefore: number | null;
    scoreAgainstBefore: number | null;
    scoreForAfter: number | null;
    scoreAgainstAfter: number | null;
    xgForBefore: number | null;
    xgAgainstBefore: number | null;
    xgForAfter: number | null;
    xgAgainstAfter: number | null;
    netGoalDelta: number;
    netXgDelta: number;
  } | null;
}

interface InterventionImpactWindow {
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
}

interface InterventionImpactTelemetry {
  totalInterventions: number;
  aggregate: {
    directNetGoalDelta: number;
    directNetXgDelta: number;
    windowNetGoalDelta: number;
    windowNetXThreatDelta: number;
    directGoalsFromInterventions: number;
  };
  windows: InterventionImpactWindow[];
}

interface ChanceQualitySideSummary {
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
}

interface ChanceQualitySummary {
  summary: string;
  verdict: 'DESERVED_MORE' | 'EDGED_IT' | 'EVEN' | 'SECOND_BEST' | 'CLINICAL_EDGE';
  home: ChanceQualitySideSummary;
  away: ChanceQualitySideSummary;
}

interface PlayerRatingRow {
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
}

interface PlayerRatingsSummary {
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
  rows: PlayerRatingRow[];
}

interface RecommendedWeekPlan {
  trainingFocus: string;
  rotationIntensity: string;
  tacticalMentality: string;
}

interface TacticalFeedbackSummary {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  recommendedWeekPlan: RecommendedWeekPlan;
  interventionRead: {
    usedHalftimeTalk: boolean;
    usedSubstitution: boolean;
    usedTacticalShifts: boolean;
    verdict: string;
  };
}

interface PlannerMatchInsight {
  fixtureId: string;
  matchDate: string | null;
  opponentClubName: string | null;
  scoreline: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendedWeekPlan: RecommendedWeekPlan;
}

interface PostMatchAnalyticsBundle {
  playerRatings: PlayerRatingsSummary | null;
  chanceQuality: ChanceQualitySummary;
  tacticalFeedback: TacticalFeedbackSummary;
  plannerInsight: PlannerMatchInsight;
}

interface LeagueTransitionMeta {
  id: number;
  name: string;
  level: string;
  region: string | null;
  matchdayType: string | null;
  tier: number;
}

interface PromotionCandidate {
  clubId: number;
  fromLeagueId: number;
}

interface CareerLeagueOption {
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

interface TransferMarketTarget {
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
  agentPressure: TransferAgentPressure;
  sellerStance: TransferSellerStance;
}

interface TransferOutgoingTarget {
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

interface TransferCandidateRow {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string | null;
  dateOfBirth: Date | null;
  age: number | null;
  position: string;
  currentAbility: number | null;
  potentialAbility: number | null;
  weeklyWage: number | null;
  value: number | null;
  contractEnd: Date | null;
  currentClubId: number | null;
  currentClub: {
    id: number;
    name: string;
    leagueId: number | null;
    league: {
      tier: number;
    } | null;
  } | null;
}

type TransferAgentPressure = 'LOW' | 'MEDIUM' | 'HIGH';
type TransferSellerStance = 'OPEN' | 'RELUCTANT' | 'AGGRESSIVE';
type TransferOfferKind = 'PERMANENT' | 'LOAN';
type TransferNegotiationStage = 'INITIAL' | 'COUNTERED';
type TransferNegotiationStatus = 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

interface TransferScoutingReport {
  playerId: number;
  scoutedAtWeekNumber: number;
  confidence: number;
  recommendation: 'PRIORITY' | 'MONITOR' | 'VALUE_LOAN' | 'AVOID';
  style: string;
  squadRoleProjection: 'STARTER' | 'ROTATION' | 'PROSPECT';
  summary: string;
  strengths: string[];
  risks: string[];
  agentPressure: TransferAgentPressure;
  sellerStance: TransferSellerStance;
  recommendedBidFee: number;
  recommendedWeeklyWage: number;
  recommendedLoanFee: number;
  recommendedWageContributionPct: number;
  recommendedBuyOptionFee: number | null;
}

interface TransferNegotiationTerms {
  transferFee: number | null;
  weeklyWage: number;
  loanFee: number | null;
  wageContributionPct: number | null;
  buyOptionFee: number | null;
  sellOnPct: number | null;
  loanDurationWeeks: number | null;
}

interface TransferNegotiationSummary {
  negotiationId: string;
  playerId: number;
  playerName: string;
  position: string;
  sellerClubId: number;
  sellerClubName: string;
  kind: TransferOfferKind;
  stage: TransferNegotiationStage;
  status: TransferNegotiationStatus;
  agentPressure: TransferAgentPressure;
  sellerStance: TransferSellerStance;
  requestedAtWeekNumber: number;
  deadlineWeekNumber: number;
  latestOffer: TransferNegotiationTerms;
  counterOffer: TransferNegotiationTerms | null;
  note: string;
  clauseSummary: string[];
}

interface TransferIncomingLoanSummary {
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

interface TransferShortlistEntry {
  playerId: number;
  addedAtWeekNumber: number;
}

interface TransferLoanAuditSnapshot {
  loanId: number;
  playerId: number;
  action: 'START' | 'RETURNED' | 'PURCHASED';
  originalWeeklyWage: number;
  wageContributionPct: number;
  buyOptionFee: number | null;
}

type BoardObjectiveStatus = 'ON_TRACK' | 'AT_RISK' | 'FAILED';
type BoardJobSecurity = 'SECURE' | 'STABLE' | 'UNSTABLE' | 'UNDER_REVIEW' | 'CRITICAL';

interface BoardObjectiveSnapshot {
  id: string;
  title: string;
  target: string;
  current: string;
  status: BoardObjectiveStatus;
  progressPct: number;
  weight: number;
}

interface BoardStatusSnapshot {
  boardConfidence: number;
  boardRiskLevel: 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL';
  jobSecurity: BoardJobSecurity;
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

type ClubPulseHeadlineTone = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
type ClubPulseHeadlineCategory = 'BOARD' | 'FANS' | 'MEDIA' | 'MATCH' | 'CONTRACT' | 'TRANSFER' | 'CLUB';
type FanSentimentLabel = 'DISCONNECTED' | 'RESTLESS' | 'STEADY' | 'ENGAGED' | 'EUPHORIC';
type MediaPressureLabel = 'QUIET' | 'WATCHING' | 'LOUD' | 'FEVERED';

interface ClubPulseHeadline {
  id: string;
  category: ClubPulseHeadlineCategory;
  tone: ClubPulseHeadlineTone;
  title: string;
  summary: string;
  weekNumber: number | null;
  createdAt: string | null;
}

interface ClubPulseSummary {
  fanSentimentScore: number;
  fanSentimentLabel: FanSentimentLabel;
  fanSummary: string;
  mediaPressureScore: number;
  mediaPressureLabel: MediaPressureLabel;
  mediaSummary: string;
  projectedAttendance: number | null;
  projectedAttendancePct: number | null;
  topHeadline: string | null;
}

interface ClubPulseRecentResult {
  fixtureId: string;
  opponentClubName: string | null;
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  scoreline: string;
  matchDate: string | null;
}

interface ClubPulseSnapshot extends ClubPulseSummary {
  boardStatus: BoardStatusSnapshot;
  headlines: ClubPulseHeadline[];
  recentResults: ClubPulseRecentResult[];
}

interface V2FixturePresentation {
  id: string;
  homeClubId: number;
  awayClubId: number;
  weekNumber: number;
  status: string;
  leagueId: number;
  matchDate: Date;
  homeScore: number | null;
  awayScore: number | null;
  isUserClubFixture: boolean;
  homeClubName: string;
  awayClubName: string;
  leagueName: string | null;
  leagueTier: number | null;
  isControlledClubHome: boolean | null;
  opponentClubId: number | null;
  opponentClubName: string | null;
}

interface BoardReviewOutcome {
  boardDelta: number;
  previousBoardConfidence: number;
  newBoardConfidence: number;
  failedObjectives: number;
  atRiskObjectives: number;
  jobSecurity: BoardJobSecurity;
  reviewWindowWeeks: number | null;
  dismissed: boolean;
  dismissalReason: string | null;
}

interface ContractWeekWrapOutcome {
  expiredCount: number;
  releasedPlayerIds: number[];
  releasedPlayers: Array<{
    id: number;
    name: string;
    position: string;
  }>;
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

interface ContractWeekWrapDigest {
  wrappedWeekNumber: number | null;
  nextWeekNumber: number | null;
  wrappedAt: string;
  expiredCount: number;
  releasedPlayers: Array<{
    id: number;
    name: string;
    position: string;
  }>;
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

interface WeeklyEventTemplate {
  title: string;
  description: string;
  options: EventOption[];
  urgency?: string;
  deadlineDays?: number;
}

interface InboxEventCreateRow {
  id: string;
  careerId: string;
  weekNumber: number;
  title: string;
  description: string;
  urgency: string;
  options: string;
  deadline: Date;
  status: string;
  autoResolved: boolean;
}

interface EventSideEffectOutcome {
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
  };
}

interface ParsedContractWarningOption {
  action: 'RENEW' | 'RELEASE' | 'PROMISE';
  playerId: number;
  years?: number;
  wageAdjustmentPct?: number;
  compensationWeeks?: number;
}

const CONTRACT_WARNING_PROMISE_COOLDOWN_WEEKS = 1;
const RETRAINABLE_POSITIONS: RetrainablePosition[] = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LW', 'RW', 'CF', 'ST'];
const RETRAINING_MATCH_PREP_READY_PROGRESS = 70;

type SquadRoleAssignment = 'STARTER' | 'ROTATION' | 'DEPTH';
type PlayingTimePromiseStatus = 'ON_TRACK' | 'DUE' | 'OVERDUE';
type DevelopmentPlanFocus = 'TECHNICAL' | 'PHYSICAL' | 'TACTICAL' | 'MENTAL';
type DevelopmentPlanTarget = 'FIRST_TEAM_PUSH' | 'MATCH_SHARPNESS' | 'LONG_TERM_UPSIDE' | 'INJURY_PREVENTION';
type PlayerStatusDirectiveCode = 'REST_RECOVERY' | 'LIMITED_MINUTES' | 'DISCIPLINARY_NOTE';
type MedicalPlanCode = 'REHAB_CONSERVATIVE' | 'PHASED_RETURN' | 'RECOVERY_FOCUS' | 'INJURY_PREVENTION' | 'MATCH_SHARPNESS';
type MedicalAvailabilityRecommendation = 'FULLY_AVAILABLE' | 'LIMITED_MINUTES' | 'REST_RECOVERY' | 'NO_SELECTION';
type MedicalWorkloadRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type SquadRegistrationAction = 'REGISTER' | 'UNREGISTER';
type SquadRegistrationCompetitionCategory = 'PRO_SENIOR' | 'AMATEUR_SENIOR' | 'O21';
type SquadEligibilityCode = 'ELIGIBLE' | 'UNREGISTERED' | 'OVERAGE_LIMIT' | 'INJURED' | 'SUSPENDED';
type CompetitionWindowStatus = 'OPEN' | 'DEADLINE' | 'CLOSED';
type CompetitionSeasonPhaseCode =
  | 'OPENING_WINDOW'
  | 'FIRST_HALF'
  | 'MIDSEASON_WINDOW'
  | 'SECOND_HALF'
  | 'RUN_IN'
  | 'FINAL_WEEK';
type RetrainablePosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DM'
  | 'CM'
  | 'AM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'ST';

interface SquadRegistrationRules {
  competitionCategory: SquadRegistrationCompetitionCategory;
  label: string;
  registrationLimit: number;
  minimumRegistered: number;
  overageLimit: number | null;
  notes: string[];
}

interface SquadRegistrationSnapshot {
  rules: SquadRegistrationRules;
  registeredPlayerIds: Set<number>;
  registeredCount: number;
  overageCount: number;
  manualOverride: boolean;
  byPlayerId: Map<number, {
    isRegistered: boolean;
    overageSlotUsed: boolean;
    note: string;
  }>;
}

interface CompetitionWindowState {
  status: CompetitionWindowStatus;
  label: string;
  isOpen: boolean;
  opensWeekNumber: number;
  closesWeekNumber: number;
  nextOpenWeekNumber: number | null;
  weeksRemaining: number;
  note: string;
}

interface CompetitionSeasonPhase {
  code: CompetitionSeasonPhaseCode;
  label: string;
  note: string;
}

interface CompetitionWindowSnapshot {
  finalWeekNumber: number;
  seasonPhase: CompetitionSeasonPhase;
  registrationWindow: CompetitionWindowState;
  transferWindow: CompetitionWindowState;
}

interface ActivePlayerSuspension {
  suspensionId: string;
  playerId: number;
  playerName: string;
  matchesRemaining: number;
  reason: string;
  issuedWeekNumber: number;
  sourceFixtureId: string | null;
  note: string;
  isLegacyFallback?: boolean;
}

interface ActivePlayingTimePromise {
  promiseId: string;
  playerId: number;
  playerName: string;
  promisedRoleAssignment: SquadRoleAssignment;
  createdWeekNumber: number;
  dueWeekNumber: number;
  reaffirmCount: number;
  sourceEventId: string | null;
}

interface ParsedPlayingTimePromiseFollowUpOption {
  action: 'PROMOTE' | 'REAFFIRM' | 'CLOSE';
  playerId: number;
  originWeekNumber: number;
}

interface ActivePlayerDevelopmentPlan {
  planId: string;
  playerId: number;
  playerName: string;
  focus: DevelopmentPlanFocus;
  target: DevelopmentPlanTarget;
  setWeekNumber: number;
  sourceEventId: string | null;
}

interface ActivePlayerStatusDirective {
  directiveId: string;
  playerId: number;
  playerName: string;
  directiveCode: PlayerStatusDirectiveCode;
  setWeekNumber: number;
  expiresWeekNumber: number;
  sourceAction: string | null;
}

interface ActivePlayerMedicalPlan {
  planId: string;
  playerId: number;
  playerName: string;
  planCode: MedicalPlanCode;
  setWeekNumber: number;
  expiresWeekNumber: number;
  sourceAction: string | null;
}

interface ActivePlayerRetrainingPlan {
  planId: string;
  playerId: number;
  playerName: string;
  currentPosition: RetrainablePosition;
  targetPosition: RetrainablePosition;
  progressPct: number;
  weeklyProgressPct: number;
  setWeekNumber: number;
  sourceEventId: string | null;
}

interface PlayerMatchUsageSummary {
  matchdaySquadCount: number;
  appearanceCount: number;
  startCount: number;
  unusedBenchCount: number;
  totalMinutes: number;
  lastFixtureId: string | null;
  lastWeekNumber: number | null;
  lastRole: 'STARTER' | 'SUBSTITUTE' | 'UNUSED_BENCH' | null;
  lastSummary: string | null;
}

interface SquadPlayerRecentHistorySummary {
  roleChanges: Array<{
    occurredAt: string;
    roleAssignment: SquadRoleAssignment;
    previousRoleAssignment: SquadRoleAssignment | null;
    expectedRole: SquadRoleAssignment | null;
    moraleDelta: number;
    boardDelta: number;
    sourceReason: string | null;
    summary: string;
  }>;
  developmentPlanChanges: Array<{
    occurredAt: string;
    focus: DevelopmentPlanFocus;
    target: DevelopmentPlanTarget;
    previousFocus: DevelopmentPlanFocus | null;
    previousTarget: DevelopmentPlanTarget | null;
    immediateMoraleDelta: number;
    summary: string;
  }>;
  medicalPlanChanges: Array<{
    occurredAt: string;
    action: 'SET' | 'CLEAR';
    planCode: MedicalPlanCode | null;
    previousPlanCode: MedicalPlanCode | null;
    expiresWeekNumber: number | null;
    immediateFitnessDelta: number;
    immediateMoraleDelta: number;
    immediateFormDelta: number;
    summary: string;
  }>;
  retrainingChanges: Array<{
    occurredAt: string;
    action: 'SET' | 'PROGRESS' | 'COMPLETE' | 'CLEAR';
    currentPosition: RetrainablePosition | null;
    targetPosition: RetrainablePosition | null;
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
}

type DbClient = PrismaClient | Prisma.TransactionClient;

class V2GameService {
  private prisma: PrismaClient;

  constructor() {
    const defaultDbPath = path.resolve(__dirname, '../../../prisma/dev.db');
    const sqliteUrlBase = process.env.V2_DATABASE_URL || `file:${defaultDbPath}`;
    const sqliteUrl = sqliteUrlBase.includes('socket_timeout=')
      ? sqliteUrlBase
      : `${sqliteUrlBase}${sqliteUrlBase.includes('?') ? '&' : '?'}connection_limit=1&socket_timeout=30`;

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: sqliteUrl
        }
      }
    });
  }

  public async listCareers() {
    const careers = await this.prisma.v2Career.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        saveSlots: {
          select: {
            slotName: true,
            isAuto: true,
            updatedAt: true,
            stateHash: true
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    const controlledClubIds = [...new Set(careers.map((career) => career.controlledClubId))];
    const clubs = controlledClubIds.length
      ? await this.prisma.club.findMany({
        where: { id: { in: controlledClubIds } },
        select: {
          id: true,
          name: true,
          league: {
            select: {
              name: true,
              level: true
            }
          }
        }
      })
      : [];
    const clubById = new Map(clubs.map((club) => [club.id, club]));

    return careers.map((career) => {
      const controlledClub = clubById.get(career.controlledClubId);
      return {
        id: career.id,
        managerName: career.managerName,
        controlledClubId: career.controlledClubId,
        controlledClubName: controlledClub?.name ?? `Club #${career.controlledClubId}`,
        controlledLeagueName: controlledClub?.league?.name ?? controlledClub?.league?.level ?? null,
        season: career.season,
        weekNumber: career.weekNumber,
        currentPhase: career.currentPhase,
        currentDate: career.currentDate,
        activeLeagueId: career.activeLeagueId,
        updatedAt: career.updatedAt,
        saveSlots: career.saveSlots
      };
    });
  }

  public async deleteCareer(careerId: string) {
    const career = await this.prisma.v2Career.findUnique({
      where: { id: careerId },
      select: {
        id: true,
        managerName: true
      }
    });

    if (!career) {
      throw new Error('Career not found.');
    }

    await this.prisma.v2Career.delete({
      where: { id: careerId }
    });

    return {
      id: career.id,
      managerName: career.managerName,
      deleted: true
    };
  }

  public async getBoardStatus(careerId: string) {
    const career = await this.requireCareer(careerId);
    return this.buildBoardStatus(career);
  }

  public async getClubPulse(careerId: string) {
    const career = await this.requireCareer(careerId);
    return this.buildClubPulseSnapshot(career);
  }

  public async listClubChoices() {
    const clubs = await this.prisma.club.findMany({
      where: {
        isActive: true,
        leagueId: { not: null }
      },
      select: {
        id: true,
        name: true,
        reputation: true,
        leagueId: true,
        league: {
          select: {
            id: true,
            name: true,
            level: true,
            tier: true
          }
        }
      }
    });

    return clubs
      .sort((a, b) => {
        const tierA = a.league?.tier ?? 999;
        const tierB = b.league?.tier ?? 999;
        if (tierA !== tierB) {
          return tierA - tierB;
        }
        return a.name.localeCompare(b.name);
      })
      .map((club) => ({
        id: club.id,
        name: club.name,
        reputation: club.reputation ?? 50,
        leagueId: club.leagueId,
        leagueName: club.league?.name ?? club.league?.level ?? 'Unknown League',
        leagueTier: club.league?.tier ?? null,
        divisionType: (club.league?.tier ?? 999) <= 2 ? 'PRO' : 'AMATEUR',
        ageCategory: this.isO21League({
          name: club.league?.name ?? '',
          level: club.league?.level ?? '',
          region: null
        })
          ? 'O21'
          : 'SENIOR'
      }));
  }

  public async createCareer(input: { managerName: string; controlledClubId: number }) {
    const managerName = input.managerName.trim();
    if (!managerName) {
      throw new Error('Manager name is required.');
    }

    const controlledClub = await this.prisma.club.findUnique({
      where: { id: input.controlledClubId },
      select: { id: true, leagueId: true }
    });

    if (!controlledClub) {
      throw new Error('Controlled club not found.');
    }

    const baseYear = new Date().getFullYear();
    const season = `${baseYear}/${baseYear + 1}`;
    const startDate = new Date(baseYear, 6, 1, 12, 0, 0, 0);

    const career = await this.prisma.v2Career.create({
      data: {
        managerName,
        controlledClubId: controlledClub.id,
        currentDate: startDate,
        currentPhase: V2_PHASES.PLANNING,
        season,
        weekNumber: 1,
        activeLeagueId: controlledClub.leagueId ?? null
      }
    });

    const leagues = await this.prisma.league.findMany({
      where: { isActive: true },
      select: {
        id: true,
        clubs: {
          select: {
            id: true
          }
        }
      }
    });
    const prioritizedLeagues = [...leagues].sort((a, b) => {
      const aControlled = a.id === controlledClub.leagueId ? 1 : 0;
      const bControlled = b.id === controlledClub.leagueId ? 1 : 0;
      if (aControlled !== bControlled) {
        return bControlled - aControlled;
      }
      return a.id - b.id;
    });

    const leagueStates: Array<{
      id: string;
      careerId: string;
      leagueId: number;
      clubId: number;
      position: number;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
      progressionStatus: string;
    }> = [];

    const clubStates: Array<{
      id: string;
      careerId: string;
      clubId: number;
      morale: number;
      fitnessTrend: number;
      boardConfidence: number;
      budgetBalance: number;
      injuriesSummary: string;
      form: string;
    }> = [];

    const fixtures: Array<{
      id: string;
      careerId: string;
      leagueId: number;
      homeClubId: number;
      awayClubId: number;
      matchDate: Date;
      weekNumber: number;
      status: string;
      isUserClubFixture: boolean;
    }> = [];

    const clubSeen = new Set<number>();

    let totalFixtures = 0;
    const MAX_TOTAL_FIXTURES = 120000;

    for (const league of prioritizedLeagues) {
      const isControlledLeague = league.id === controlledClub.leagueId;
      const leagueClubIds = league.clubs.map((club) => club.id);
      if (leagueClubIds.length < 2) {
        continue;
      }

      const seed = `${career.id}:${league.id}:${leagueClubIds.join('-')}`;
      const random = mulberry32(stringToSeed(seed));
      const orderedClubs = shuffled(leagueClubIds, random);

      orderedClubs.forEach((clubId, idx) => {
        leagueStates.push({
          id: `${career.id}:ls:${league.id}:${clubId}`,
          careerId: career.id,
          leagueId: league.id,
          clubId,
          position: idx + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          progressionStatus: 'STABLE'
        });

        if (!clubSeen.has(clubId)) {
          clubStates.push({
            id: `${career.id}:cs:${clubId}`,
            careerId: career.id,
            clubId,
            morale: 55,
            fitnessTrend: 0,
            boardConfidence: 55,
            budgetBalance: 0,
            injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
            form: 'NNNNN'
          });
          clubSeen.add(clubId);
        }
      });

      const schedule = this.createScalableLeagueSchedule(orderedClubs, random);
      schedule.forEach((pairing) => {
        if (!isControlledLeague && totalFixtures >= MAX_TOTAL_FIXTURES) {
          return;
        }
        fixtures.push({
          id: `${career.id}:fx:${league.id}:${pairing.week}:${pairing.homeClubId}:${pairing.awayClubId}`,
          careerId: career.id,
          leagueId: league.id,
          homeClubId: pairing.homeClubId,
          awayClubId: pairing.awayClubId,
          matchDate: addDays(startDate, (pairing.week - 1) * 7 + (league.id % 5)),
          weekNumber: pairing.week,
          status: V2_FIXTURE_STATUS.SCHEDULED,
          isUserClubFixture:
            pairing.homeClubId === career.controlledClubId || pairing.awayClubId === career.controlledClubId
        });
        totalFixtures += 1;
      });

      if (!isControlledLeague && totalFixtures >= MAX_TOTAL_FIXTURES) {
        break;
      }
    }

    if (!clubSeen.has(career.controlledClubId)) {
      clubStates.push({
        id: `${career.id}:cs:${career.controlledClubId}`,
        careerId: career.id,
        clubId: career.controlledClubId,
        morale: 55,
        fitnessTrend: 0,
        boardConfidence: 55,
        budgetBalance: 0,
        injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
        form: 'NNNNN'
      });
      clubSeen.add(career.controlledClubId);
    }

    for (const chunk of chunked(leagueStates, 200)) {
      await this.prisma.v2LeagueState.createMany({ data: chunk });
    }

    for (const chunk of chunked(clubStates, 200)) {
      await this.prisma.v2ClubState.createMany({ data: chunk });
    }

    for (const chunk of chunked(fixtures, 200)) {
      await this.prisma.v2Fixture.createMany({ data: chunk });
    }

    await this.ensureControlledClubSquad(career.id, career.controlledClubId);
    await this.ensureControlledClubSquadBalance(career.id, career.controlledClubId);
    await this.ensureControlledClubRegistrationViability(career, career.controlledClubId);
    await this.ensureControlledClubContracts(career, career.controlledClubId);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId);

    await this.addAudit(career.id, 'CAREER', `Career created for manager ${managerName}.`, {
      controlledClubId: career.controlledClubId,
      leagueCount: leagues.length
    });

    await this.persistSaveSlot(career.id, 'autosave', true);

    return this.getCareerState(career.id);
  }

  public async getCareerState(careerId: string) {
    const career = await this.prisma.v2Career.findUnique({
      where: { id: careerId }
    });

    if (!career) {
      throw new Error('Career not found.');
    }

    const [club, clubState, pendingEvents, nextUserFixture, weekPlan, lastContractWeekWrapDigest, latestCompletedUserFixture] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          name: true,
          leagueId: true,
          reputation: true,
          balance: true,
          transferBudget: true
        }
      }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        }
      }),
      this.prisma.v2InboxEvent.count({
        where: {
          careerId: career.id,
          weekNumber: career.weekNumber,
          status: 'PENDING'
        }
      }),
      this.prisma.v2Fixture.findFirst({
        where: {
          careerId: career.id,
          weekNumber: career.weekNumber,
          isUserClubFixture: true
        },
        orderBy: { matchDate: 'asc' }
      }),
      this.prisma.v2WeekPlan.findUnique({
        where: {
          careerId_weekNumber: {
            careerId: career.id,
            weekNumber: career.weekNumber
          }
        }
      }),
      this.getLastContractWeekWrapDigest(career.id)
      ,
      this.prisma.v2Fixture.findFirst({
        where: {
          careerId: career.id,
          isUserClubFixture: true,
          status: V2_FIXTURE_STATUS.COMPLETED
        },
        orderBy: [{ weekNumber: 'desc' }, { matchDate: 'desc' }]
      })
    ]);

    const urgentPendingEvents = await this.prisma.v2InboxEvent.count({
      where: {
        careerId: career.id,
        weekNumber: career.weekNumber,
        status: 'PENDING',
        urgency: V2_URGENCY.HIGH
      }
    });

    const resolvedClubState = clubState ?? await this.prisma.v2ClubState.upsert({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      update: {},
      create: {
        id: `${career.id}:cs:${career.controlledClubId}`,
        careerId: career.id,
        clubId: career.controlledClubId,
        morale: 55,
        fitnessTrend: 0,
        boardConfidence: 55,
        budgetBalance: 0,
        injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
        form: 'NNNNN'
      }
    });

    const nextUserFixturePresentation = nextUserFixture
      ? await this.toFixturePresentation(nextUserFixture, career.controlledClubId)
      : null;

    const boardStatus = await this.buildBoardStatus(career, resolvedClubState);
    const clubPulseSummary = await this.buildClubPulseSummary(career, resolvedClubState, boardStatus);
    const latestMatchInsight = latestCompletedUserFixture
      ? await this.buildLatestPlannerMatchInsight(career, latestCompletedUserFixture)
      : null;

    return {
      id: career.id,
      managerName: career.managerName,
      controlledClubId: career.controlledClubId,
      currentDate: career.currentDate,
      currentPhase: career.currentPhase,
      season: career.season,
      weekNumber: career.weekNumber,
      activeLeagueId: career.activeLeagueId,
      club,
      clubState: resolvedClubState,
      pendingEvents,
      urgentPendingEvents,
      nextUserFixture: nextUserFixturePresentation,
      boardStatus,
      clubPulseSummary,
      weekPlan,
      lastContractWeekWrapDigest,
      latestMatchInsight,
      pendingActions: {
        needsWeekPlan: career.currentPhase !== V2_PHASES.TERMINATED && !weekPlan,
        needsEventResponses: career.currentPhase !== V2_PHASES.TERMINATED && pendingEvents > 0,
        needsMatchPrep: career.currentPhase === V2_PHASES.MATCH_PREP
      }
    };
  }

  public async submitWeekPlan(careerId: string, plan: WeekPlanPayload) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'submit a week plan');

    const payload: WeekPlanPayload = {
      trainingFocus: plan.trainingFocus || 'BALANCED',
      rotationIntensity: plan.rotationIntensity || 'MEDIUM',
      tacticalMentality: plan.tacticalMentality || 'BALANCED',
      transferStance: plan.transferStance || 'OPPORTUNISTIC',
      scoutingPriority: plan.scoutingPriority || 'LOCAL'
    };

    const upserted = await this.prisma.v2WeekPlan.upsert({
      where: {
        careerId_weekNumber: {
          careerId,
          weekNumber: career.weekNumber
        }
      },
      update: {
        trainingFocus: payload.trainingFocus,
        rotationIntensity: payload.rotationIntensity,
        tacticalMentality: payload.tacticalMentality,
        transferStance: payload.transferStance,
        scoutingPriority: payload.scoutingPriority,
        submittedAt: new Date()
      },
      create: {
        id: `${careerId}:wp:${career.weekNumber}`,
        careerId,
        weekNumber: career.weekNumber,
        trainingFocus: payload.trainingFocus,
        rotationIntensity: payload.rotationIntensity,
        tacticalMentality: payload.tacticalMentality,
        transferStance: payload.transferStance,
        scoutingPriority: payload.scoutingPriority,
        submittedAt: new Date()
      }
    });

    await this.prisma.v2Career.update({
      where: { id: careerId },
      data: { currentPhase: V2_PHASES.PLANNING }
    });

    await this.addAudit(careerId, 'WEEK_PLAN', 'Week plan submitted.', payload as unknown as Record<string, unknown>);
    await this.persistSaveSlot(careerId, 'autosave', true);

    return upserted;
  }

  public async advanceWeek(careerId: string) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'advance the week');

    if (career.currentPhase === V2_PHASES.POST_MATCH || career.currentPhase === V2_PHASES.WEEK_WRAP) {
      await this.wrapCurrentWeek(career);
      return this.getCareerState(careerId);
    }

    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Finish the guided match and process post-match before advancing.');
    }

    if (career.currentPhase === V2_PHASES.MATCH_PREP) {
      const pendingFixture = await this.prisma.v2Fixture.findFirst({
        where: {
          careerId: career.id,
          weekNumber: career.weekNumber,
          isUserClubFixture: true,
          status: {
            in: [
              V2_FIXTURE_STATUS.READY,
              V2_FIXTURE_STATUS.SCHEDULED,
              V2_FIXTURE_STATUS.IN_PROGRESS
            ]
          }
        }
      });

      if (pendingFixture) {
        throw new Error('Start and complete your user fixture before advancing.');
      }

      await this.prisma.v2Career.update({
        where: { id: career.id },
        data: { currentPhase: V2_PHASES.WEEK_WRAP }
      });

      await this.addAudit(career.id, 'WEEK_ADVANCE', 'No pending fixture in match prep, moving to week wrap.', {
        weekNumber: career.weekNumber
      });

      return this.getCareerState(career.id);
    }

    if (career.currentPhase === V2_PHASES.EVENT) {
      await this.autoResolveUrgentEvents(career.id, career.weekNumber, career.currentDate);

      const [pendingEvents, userFixture] = await Promise.all([
        this.prisma.v2InboxEvent.count({
          where: {
            careerId: career.id,
            weekNumber: career.weekNumber,
            status: 'PENDING'
          }
        }),
        this.prisma.v2Fixture.findFirst({
          where: {
            careerId: career.id,
            weekNumber: career.weekNumber,
            isUserClubFixture: true
          }
        })
      ]);

      const nextPhase = pendingEvents > 0
        ? V2_PHASES.EVENT
        : userFixture
          ? V2_PHASES.MATCH_PREP
          : V2_PHASES.WEEK_WRAP;

      if (nextPhase !== V2_PHASES.EVENT) {
        await this.prisma.v2Career.update({
          where: { id: career.id },
          data: { currentPhase: nextPhase }
        });
      }

      await this.addAudit(career.id, 'WEEK_ADVANCE', 'Week advanced from event phase.', {
        weekNumber: career.weekNumber,
        pendingEvents,
        nextPhase
      });

      return this.getCareerState(career.id);
    }

    await this.applyWeekPlanEffects(career.id, career.weekNumber, career.controlledClubId);
    await this.autoResolveUrgentEvents(career.id, career.weekNumber, career.currentDate);
    await this.ensureWeeklyEvents(career.id, career.weekNumber, career.currentDate);
    await this.simulateAiFixturesForWeek(career.id, career.weekNumber);

    const userFixture = await this.prisma.v2Fixture.findFirst({
      where: {
        careerId: career.id,
        weekNumber: career.weekNumber,
        isUserClubFixture: true
      }
    });

    if (userFixture && userFixture.status === V2_FIXTURE_STATUS.SCHEDULED) {
      await this.prisma.v2Fixture.update({
        where: { id: userFixture.id },
        data: { status: V2_FIXTURE_STATUS.READY }
      });
    }

    const pendingEvents = await this.prisma.v2InboxEvent.count({
      where: {
        careerId: career.id,
        weekNumber: career.weekNumber,
        status: 'PENDING'
      }
    });

    const nextPhase = pendingEvents > 0
      ? V2_PHASES.EVENT
      : userFixture
        ? V2_PHASES.MATCH_PREP
        : V2_PHASES.WEEK_WRAP;

    await this.prisma.v2Career.update({
      where: { id: career.id },
      data: { currentPhase: nextPhase }
    });

    await this.addAudit(career.id, 'WEEK_ADVANCE', 'Week advanced from planning phase.', {
      weekNumber: career.weekNumber,
      pendingEvents,
      nextPhase
    });

    return this.getCareerState(career.id);
  }

  public async listInbox(careerId: string, status?: string) {
    await this.requireCareer(careerId);

    const events = await this.prisma.v2InboxEvent.findMany({
      where: {
        careerId,
        ...(status ? { status } : {})
      },
      orderBy: [{ weekNumber: 'desc' }, { createdAt: 'desc' }]
    });

    return events.map((event) => ({
      ...event,
      options: JSON.parse(event.options || '[]') as EventOption[]
    }));
  }

  public async respondToEvent(careerId: string, eventId: string, optionId: string) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'respond to inbox events');

    const event = await this.prisma.v2InboxEvent.findFirst({
      where: {
        id: eventId,
        careerId
      }
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status !== 'PENDING') {
      throw new Error('Event already resolved.');
    }

    const options = JSON.parse(event.options || '[]') as EventOption[];
    const chosen = options.find((option) => option.id === optionId);
    if (!chosen) {
      throw new Error('Invalid event option.');
    }

    const effects = chosen.effects || {};
    const sideEffectOutcome = await this.prisma.$transaction(async (tx): Promise<EventSideEffectOutcome | null> => {
      await tx.v2EventDecision.create({
        data: {
          id: `${event.id}:decision`,
          eventId: event.id,
          careerId,
          optionId: chosen.id,
          optionLabel: chosen.label,
          effects: JSON.stringify(effects),
          decidedAt: new Date()
        }
      });

      await tx.v2InboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'RESOLVED',
          resolutionNote: chosen.label,
          resolvedAt: new Date(),
          autoResolved: false
        }
      });

      await this.applyClubEffects(tx, careerId, career.controlledClubId, effects);
      return this.applyEventOptionSideEffects(tx, career, event.id, chosen.id, effects);
    });

    const pending = await this.prisma.v2InboxEvent.count({
      where: {
        careerId,
        weekNumber: career.weekNumber,
        status: 'PENDING'
      }
    });

    const userFixture = await this.prisma.v2Fixture.findFirst({
      where: {
        careerId,
        weekNumber: career.weekNumber,
        isUserClubFixture: true
      }
    });

    if (pending === 0) {
      await this.prisma.v2Career.update({
        where: { id: careerId },
        data: {
          currentPhase: userFixture ? V2_PHASES.MATCH_PREP : V2_PHASES.WEEK_WRAP
        }
      });
    }

    await this.addAudit(careerId, 'EVENT', `Resolved event ${event.id}.`, {
      optionId: chosen.id,
      effects
    });

    const fanDelta = Math.round(this.toFiniteNumber(effects.fanDelta) ?? 0);
    const mediaDelta = Math.round(this.toFiniteNumber(effects.mediaDelta) ?? 0);
    if (fanDelta !== 0 || mediaDelta !== 0) {
      await this.addAudit(careerId, 'CLUB_PULSE', `Pulse reaction: ${event.title}`, {
        sourceEventId: event.id,
        title: event.title,
        optionId: chosen.id,
        optionLabel: chosen.label,
        weekNumber: career.weekNumber,
        fanDelta,
        mediaDelta
      });
    }

    if (sideEffectOutcome?.contractAction) {
      const action = sideEffectOutcome.contractAction;
      const negotiationRound = getContractWarningNegotiationRoundFromEventId(event.id);
      if (action.action === 'RENEW') {
        await this.addAudit(careerId, 'CONTRACT', `Renewed ${action.playerName} from inbox contract warning.`, {
          source: 'INBOX_CONTRACT_WARNING',
          sourceEventId: event.id,
          playerId: action.playerId,
          weekNumber: career.weekNumber,
          negotiationRound,
          negotiationOutcome: 'ACCEPT',
          years: action.years,
          weeklyWage: action.weeklyWage,
          contractEnd: action.contractEnd,
          budgetImpact: action.budgetImpact
        });
      } else if (action.action === 'RELEASE') {
        await this.addAudit(careerId, 'CONTRACT', `Released ${action.playerName} from inbox contract warning.`, {
          source: 'INBOX_CONTRACT_WARNING',
          sourceEventId: event.id,
          playerId: action.playerId,
          weekNumber: career.weekNumber,
          negotiationRound,
          negotiationOutcome: 'RELEASE',
          compensationWeeks: action.compensationWeeks,
          budgetImpact: action.budgetImpact
        });
      } else if (action.action === 'COUNTER') {
        await this.addAudit(careerId, 'CONTRACT', `Agent countered renewal terms for ${action.playerName}.`, {
          source: 'INBOX_CONTRACT_WARNING',
          sourceEventId: event.id,
          playerId: action.playerId,
          weekNumber: career.weekNumber,
          negotiationRound,
          negotiationOutcome: 'COUNTER',
          requestedYears: action.requestedYears,
          requestedWageAdjustmentPct: action.requestedWageAdjustmentPct,
          counterYears: action.counterYears,
          counterWageAdjustmentPct: action.counterWageAdjustmentPct,
          boardDelta: action.boardDelta,
          playerMoraleDelta: action.playerMoraleDelta
        });
      } else if (action.action === 'REJECT') {
        await this.addAudit(careerId, 'CONTRACT', `Contract talks stalled for ${action.playerName} after renewal offer.`, {
          source: 'INBOX_CONTRACT_WARNING',
          sourceEventId: event.id,
          playerId: action.playerId,
          weekNumber: career.weekNumber,
          negotiationRound,
          negotiationOutcome: 'REJECT',
          requestedYears: action.requestedYears,
          requestedWageAdjustmentPct: action.requestedWageAdjustmentPct,
          followUpEventId: action.followUpEventId,
          boardDelta: action.boardDelta,
          playerMoraleDelta: action.playerMoraleDelta
        });
      } else {
        await this.addAudit(careerId, 'CONTRACT', `Promised contract review to ${action.playerName}.`, {
          source: 'INBOX_CONTRACT_WARNING',
          sourceEventId: event.id,
          playerId: action.playerId,
          weekNumber: career.weekNumber,
          negotiationRound,
          negotiationOutcome: 'PROMISE'
        });
      }
    }

    return {
      eventId: event.id,
      option: chosen,
      pendingEvents: pending,
      contractAction: sideEffectOutcome?.contractAction ?? null
    };
  }

  public async startMatch(careerId: string, fixtureId: string, payload?: MatchPrepPayload) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'start a guided match');

    const fixture = await this.prisma.v2Fixture.findFirst({
      where: {
        id: fixtureId,
        careerId
      }
    });

    if (!fixture) {
      throw new Error('Fixture not found.');
    }

    if (!fixture.isUserClubFixture) {
      throw new Error('Only user-club fixtures can be started in guided mode.');
    }

    const prep = await this.resolveMatchPrepForCareer(career, payload);
    const simulation = await this.runGuidedSimulation(career, fixture, prep);
    const interventionState: MatchInterventionState = {
      prep,
      live: this.createInitialLiveMatchState(prep),
      entries: []
    };

    const matchId = `${career.id}:match:${fixture.id}`;
    await this.prisma.$transaction(async (tx) => {
      await tx.v2Match.upsert({
        where: { fixtureId: fixture.id },
        update: {
          status: V2_MATCH_STATUS.LIVE,
          homeScore: simulation.homeScore,
          awayScore: simulation.awayScore,
          homeXg: simulation.homeXg,
          awayXg: simulation.awayXg,
          homePossession: simulation.homePossession,
          awayPossession: simulation.awayPossession,
          startedAt: new Date(),
          seed: `${career.id}:${fixture.id}:${career.weekNumber}`,
          interventions: this.serializeInterventionState(interventionState)
        },
        create: {
          id: matchId,
          careerId: career.id,
          fixtureId: fixture.id,
          status: V2_MATCH_STATUS.LIVE,
          homeScore: simulation.homeScore,
          awayScore: simulation.awayScore,
          homeXg: simulation.homeXg,
          awayXg: simulation.awayXg,
          homePossession: simulation.homePossession,
          awayPossession: simulation.awayPossession,
          startedAt: new Date(),
          seed: `${career.id}:${fixture.id}:${career.weekNumber}`,
          interventions: this.serializeInterventionState(interventionState)
        }
      });

      await tx.v2Highlight.deleteMany({ where: { matchId } });
      await tx.v2Highlight.createMany({
        data: simulation.highlights.map((highlight, idx) => ({
          id: `${matchId}:hl:${idx + 1}`,
          matchId,
          minute: highlight.minute,
          eventType: highlight.eventType,
          teamSide: highlight.teamSide ?? null,
          actorId: highlight.actorId ?? null,
          fromX: highlight.fromX,
          fromY: highlight.fromY,
          toX: highlight.toX,
          toY: highlight.toY,
          animationPreset: highlight.animationPreset,
          cameraPath: highlight.cameraPath,
          commentary: highlight.commentary,
          xThreatRank: highlight.xThreatRank,
          isDecisive: highlight.isDecisive,
          payload: JSON.stringify(highlight.payload)
        }))
      });

      await tx.v2Fixture.update({
        where: { id: fixture.id },
        data: {
          status: V2_FIXTURE_STATUS.IN_PROGRESS,
          homeScore: simulation.homeScore,
          awayScore: simulation.awayScore
        }
      });

      await tx.v2Career.update({
        where: { id: career.id },
        data: { currentPhase: V2_PHASES.MATCH }
      });
    });

    await this.addAudit(career.id, 'MATCH', `Started guided match ${fixture.id}.`, {
      fixtureId,
      homeScore: simulation.homeScore,
      awayScore: simulation.awayScore,
      prep
    });

    await this.persistSaveSlot(career.id, 'autosave', true);

    return this.getMatchHighlights(career.id, fixture.id);
  }

  public async intervene(careerId: string, fixtureId: string, payload: InterventionPayload) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'use an in-match intervention');
    this.assertInterventionType(payload.type);

    const fixture = await this.prisma.v2Fixture.findFirst({
      where: { id: fixtureId, careerId }
    });
    if (!fixture) {
      throw new Error('Fixture not found for intervention.');
    }

    const match = await this.prisma.v2Match.findUnique({ where: { fixtureId } });
    if (!match) {
      throw new Error('Match must be started before interventions are applied.');
    }

    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const interventions = [...interventionState.entries];
    if (interventionState.live.segment === 'FULL_TIME') {
      throw new Error('Match is already at full time. No further live decisions are available.');
    }

    const userIsHome = fixture.homeClubId === career.controlledClubId;
    const userSide = userIsHome ? 'home' : 'away';
    const minute = payload.minute ?? (
      payload.type === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK
        ? 46
        : interventionState.live.segment === 'HALFTIME'
          ? 52
          : Math.min(89, interventionState.live.currentMinute + 2)
    );
    const interventionRandom = mulberry32(stringToSeed(`${match.id}:${interventions.length}:${payload.type}:${minute}`));

    let homeScore = match.homeScore;
    let awayScore = match.awayScore;
    let homeXg = match.homeXg;
    let awayXg = match.awayXg;

    const scoreForBefore = userIsHome ? match.homeScore : match.awayScore;
    const scoreAgainstBefore = userIsHome ? match.awayScore : match.homeScore;
    const xgForBefore = userIsHome ? match.homeXg : match.awayXg;
    const xgAgainstBefore = userIsHome ? match.awayXg : match.homeXg;

    let eventType = 'TACTICAL_SHIFT';
    let commentary = 'Manager makes a live tactical call.';
    let decisive = false;
    let actorId: number | undefined;
    let note = payload.note ?? null;
    let teamXgDelta = 0;
    let opponentXgDelta = 0;
    let possessionSwingDelta = 0;
    let nextLive = interventionState.live;
    const highlightPayload: Record<string, unknown> = { interventionType: payload.type };

    if (payload.type === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK) {
      if (interventionState.live.segment !== 'HALFTIME' || interventionState.live.halftimeTalkUsed) {
        throw new Error('Halftime talk is only available once during the halftime interval.');
      }

      const teamTalk = payload.teamTalk ?? 'DEMAND_MORE';
      actorId = interventionState.prep.captainPlayerId ?? interventionState.live.currentStartingPlayerIds[0];
      eventType = 'HALFTIME';

      if (teamTalk === 'PRAISE') {
        commentary = 'Halftime praise steadies the dressing room and reinforces the plan.';
        teamXgDelta = 0.06;
        opponentXgDelta = -0.01;
        possessionSwingDelta = 1;
      } else if (teamTalk === 'CALM_FOCUS') {
        commentary = 'Halftime reset calms the group and sharpens the next-pass decision making.';
        teamXgDelta = 0.04;
        opponentXgDelta = -0.03;
        possessionSwingDelta = 2;
      } else {
        commentary = 'Demanding more at halftime raises urgency and pushes the team forward.';
        teamXgDelta = 0.11;
        opponentXgDelta = 0.03;
      }

      note = note ?? teamTalk;
      nextLive = this.advanceLiveMatchState(
        interventionState.live,
        {
          halftimeTalkUsed: true,
          halftimeTalkChoice: teamTalk,
          possessionSwing: clamp(interventionState.live.possessionSwing + possessionSwingDelta, -12, 12)
        },
        payload.type
      );
      highlightPayload.teamTalk = teamTalk;
    } else if (payload.type === V2_INTERVENTION_TYPES.SUBSTITUTION_TRIGGER) {
      if (interventionState.live.substitutionsUsed >= interventionState.live.substitutionLimit) {
        throw new Error(`Substitution limit reached (${interventionState.live.substitutionLimit}).`);
      }

      const activeIds = [
        ...interventionState.live.currentStartingPlayerIds,
        ...interventionState.live.currentBenchPlayerIds
      ];
      const [playerRows, playerStates] = await Promise.all([
        this.prisma.player.findMany({
          where: { id: { in: activeIds } },
          select: { id: true, fullName: true, currentAbility: true }
        }),
        this.prisma.v2PlayerState.findMany({
          where: { careerId, playerId: { in: activeIds } },
          select: { playerId: true, fitness: true, isSuspended: true, isInjured: true }
        })
      ]);

      const playerById = new Map(playerRows.map((row) => [row.id, row]));
      const stateByPlayerId = new Map(playerStates.map((row) => [row.playerId, row]));
      const currentStarterIds = [...interventionState.live.currentStartingPlayerIds];
      const currentBenchIds = interventionState.live.currentBenchPlayerIds.filter((playerId) => {
        const row = stateByPlayerId.get(playerId);
        return !row?.isSuspended && !row?.isInjured;
      });

      let outPlayerId = Number(payload.outPlayerId);
      let inPlayerId = Number(payload.inPlayerId);
      if (!Number.isFinite(outPlayerId) || !currentStarterIds.includes(outPlayerId)) {
        outPlayerId = [...currentStarterIds]
          .sort((left, right) => (stateByPlayerId.get(left)?.fitness ?? 80) - (stateByPlayerId.get(right)?.fitness ?? 80))[0];
      }
      if (!Number.isFinite(inPlayerId) || !currentBenchIds.includes(inPlayerId)) {
        inPlayerId = [...currentBenchIds]
          .sort((left, right) => (playerById.get(right)?.currentAbility ?? 60) - (playerById.get(left)?.currentAbility ?? 60))[0];
      }

      if (!Number.isFinite(outPlayerId) || !Number.isFinite(inPlayerId)) {
        throw new Error('No valid substitution combination is available.');
      }
      if (!currentStarterIds.includes(outPlayerId)) {
        throw new Error('Selected outgoing player is not on the current pitch.');
      }
      if (!currentBenchIds.includes(inPlayerId)) {
        throw new Error('Selected incoming player is not on the current bench.');
      }

      const substitutionReason = payload.substitutionReason ?? 'FRESH_LEGS';
      const outPlayer = playerById.get(outPlayerId);
      const inPlayer = playerById.get(inPlayerId);
      const abilitySwing = ((inPlayer?.currentAbility ?? 60) - (outPlayer?.currentAbility ?? 60)) / 100;

      eventType = 'SUBSTITUTION';
      actorId = inPlayerId;
      if (substitutionReason === 'TACTICAL_TWEAK') {
        commentary = `${inPlayer?.fullName ?? `#${inPlayerId}`} is introduced for tactical balance, replacing ${outPlayer?.fullName ?? `#${outPlayerId}`}.`;
        teamXgDelta = 0.08 + abilitySwing * 0.1;
      } else if (substitutionReason === 'PROTECT_BOOKING') {
        commentary = `${outPlayer?.fullName ?? `#${outPlayerId}`} is withdrawn to manage risk; ${inPlayer?.fullName ?? `#${inPlayerId}`} takes over.`;
        teamXgDelta = 0.02 + abilitySwing * 0.04;
        opponentXgDelta = -0.03;
      } else {
        commentary = `${inPlayer?.fullName ?? `#${inPlayerId}`} replaces ${outPlayer?.fullName ?? `#${outPlayerId}`} to inject fresh legs.`;
        teamXgDelta = 0.05 + abilitySwing * 0.06;
      }

      note = note ?? substitutionReason;
      nextLive = this.advanceLiveMatchState(
        interventionState.live,
        {
          substitutionsUsed: interventionState.live.substitutionsUsed + 1,
          currentStartingPlayerIds: currentStarterIds.map((playerId) => (playerId === outPlayerId ? inPlayerId : playerId)),
          currentBenchPlayerIds: interventionState.live.currentBenchPlayerIds
            .filter((playerId) => playerId !== inPlayerId)
            .concat(outPlayerId)
            .slice(0, 7)
        },
        payload.type
      );

      highlightPayload.outPlayerId = outPlayerId;
      highlightPayload.inPlayerId = inPlayerId;
      highlightPayload.outPlayerName = outPlayer?.fullName ?? null;
      highlightPayload.inPlayerName = inPlayer?.fullName ?? null;
      highlightPayload.substitutionReason = substitutionReason;
    } else if (payload.type === V2_INTERVENTION_TYPES.MENTALITY_SHIFT) {
      if (interventionState.live.tacticalChangesUsed >= interventionState.live.tacticalChangeLimit) {
        throw new Error(`Tactical change limit reached (${interventionState.live.tacticalChangeLimit}).`);
      }

      const intensity = clamp(payload.intensity ?? 2, -1, 3);
      let mentality: LiveMentality = 'BALANCED';
      if (intensity <= 0) mentality = 'PROTECT_LEAD';
      else if (intensity === 1) mentality = 'POSITIVE';
      else if (intensity >= 3) mentality = 'ALL_OUT_ATTACK';

      if (mentality === 'PROTECT_LEAD') {
        commentary = 'The team drops into a more protective mentality to manage the scoreline.';
        teamXgDelta = 0.03;
        opponentXgDelta = -0.04;
        possessionSwingDelta = -2;
      } else if (mentality === 'ALL_OUT_ATTACK') {
        commentary = 'The manager throws numbers forward and commits fully to the chase.';
        teamXgDelta = 0.16;
        opponentXgDelta = 0.07;
        possessionSwingDelta = 2;
      } else if (mentality === 'POSITIVE') {
        commentary = 'A positive mentality tweak raises the tempo and pushes the front line higher.';
        teamXgDelta = 0.09;
        opponentXgDelta = 0.02;
        possessionSwingDelta = 1;
      } else {
        commentary = 'The tactical tone is reset toward balance to stabilize the rhythm.';
        teamXgDelta = 0.05;
      }

      eventType = 'TACTICAL_SHIFT';
      if (interventionRandom() < 0.08 + Math.max(0, intensity) * 0.035) {
        eventType = 'GOAL';
        commentary = 'The mentality change immediately opens a finishing chance and the move is converted.';
        decisive = true;
        if (userIsHome) homeScore += 1;
        else awayScore += 1;
      }

      actorId = this.resolveHighlightActorId(interventionState.prep, userSide, userSide, interventionRandom, eventType);
      note = note ?? mentality;
      nextLive = this.advanceLiveMatchState(
        interventionState.live,
        {
          tacticalChangesUsed: interventionState.live.tacticalChangesUsed + 1,
          mentality,
          possessionSwing: clamp(interventionState.live.possessionSwing + possessionSwingDelta, -12, 12)
        },
        payload.type
      );
      highlightPayload.mentality = mentality;
    } else if (payload.type === V2_INTERVENTION_TYPES.PRESSING_INTENSITY) {
      if (interventionState.live.tacticalChangesUsed >= interventionState.live.tacticalChangeLimit) {
        throw new Error(`Tactical change limit reached (${interventionState.live.tacticalChangeLimit}).`);
      }

      const intensity = clamp(payload.intensity ?? 2, 1, 3);
      const pressing: LivePressing = intensity >= 3 ? 'HIGH_PRESS' : intensity === 2 ? 'MID_BLOCK' : 'DROP_OFF';
      if (pressing === 'HIGH_PRESS') {
        commentary = 'The press is ratcheted up to force hurried decisions in the build-up.';
        teamXgDelta = 0.12;
        opponentXgDelta = 0.05;
        possessionSwingDelta = 1;
      } else if (pressing === 'DROP_OFF') {
        commentary = 'The line drops and the press is softened to close the dangerous central spaces.';
        teamXgDelta = 0.03;
        opponentXgDelta = -0.05;
        possessionSwingDelta = -2;
      } else {
        commentary = 'The side settles into a compact mid-block to improve rest-defense without giving up all initiative.';
        teamXgDelta = 0.06;
        opponentXgDelta = -0.01;
      }

      eventType = 'TURNOVER_CHANCE';
      if (interventionRandom() < 0.07 + intensity * 0.03) {
        eventType = 'GOAL';
        commentary = 'The pressing adjustment creates a turnover and the chance is finished.';
        decisive = true;
        if (userIsHome) homeScore += 1;
        else awayScore += 1;
      }

      actorId = this.resolveHighlightActorId(interventionState.prep, userSide, userSide, interventionRandom, eventType);
      note = note ?? pressing;
      nextLive = this.advanceLiveMatchState(
        interventionState.live,
        {
          tacticalChangesUsed: interventionState.live.tacticalChangesUsed + 1,
          pressing,
          possessionSwing: clamp(interventionState.live.possessionSwing + possessionSwingDelta, -12, 12)
        },
        payload.type
      );
      highlightPayload.pressing = pressing;
    }

    teamXgDelta = Number(teamXgDelta.toFixed(2));
    opponentXgDelta = Number(opponentXgDelta.toFixed(2));
    if (userIsHome) {
      homeXg += teamXgDelta;
      awayXg += opponentXgDelta;
    } else {
      awayXg += teamXgDelta;
      homeXg += opponentXgDelta;
    }

    const scoreForAfter = userIsHome ? homeScore : awayScore;
    const scoreAgainstAfter = userIsHome ? awayScore : homeScore;
    const xgForAfter = userIsHome ? homeXg : awayXg;
    const xgAgainstAfter = userIsHome ? awayXg : homeXg;

    interventions.push({
      type: payload.type,
      intensity: payload.intensity ?? null,
      minute,
      note,
      createdAt: new Date().toISOString(),
      eventType,
      directEffect: {
        scoreForBefore,
        scoreAgainstBefore,
        scoreForAfter,
        scoreAgainstAfter,
        xgForBefore: Number(xgForBefore.toFixed(2)),
        xgAgainstBefore: Number(xgAgainstBefore.toFixed(2)),
        xgForAfter: Number(xgForAfter.toFixed(2)),
        xgAgainstAfter: Number(xgAgainstAfter.toFixed(2)),
        netGoalDelta: scoreForAfter - scoreForBefore,
        netXgDelta: Number((xgForAfter - xgForBefore).toFixed(2))
      }
    });
    interventionState.entries = interventions;
    interventionState.live = nextLive;

    const interventionActorId = actorId
      ?? this.resolveHighlightActorId(interventionState.prep, userSide, userSide, interventionRandom, eventType);

    const highlightId = `${match.id}:hl:iv:${interventions.length}`;
    await this.prisma.$transaction(async (tx) => {
      await tx.v2Match.update({
        where: { id: match.id },
        data: {
          interventions: this.serializeInterventionState(interventionState),
          homeScore,
          awayScore,
          homeXg,
          awayXg
        }
      });

      await tx.v2Fixture.update({
        where: { id: fixture.id },
        data: { homeScore, awayScore }
      });

      await tx.v2Highlight.create({
        data: {
          id: highlightId,
          matchId: match.id,
          minute,
          eventType,
          teamSide: userSide,
          actorId: interventionActorId ?? null,
          animationPreset:
            payload.type === V2_INTERVENTION_TYPES.SUBSTITUTION_TRIGGER
              ? 'substitution_swap'
              : payload.type === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK
                ? 'team_talk_huddle'
                : 'intervention_momentum',
          cameraPath: payload.type === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK ? 'TACTICAL_BOARD' : 'MIDFIELD_SWEEP',
          commentary,
          xThreatRank: eventType === 'GOAL' ? 0.94 : payload.type === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK ? 0.28 : 0.66,
          isDecisive: decisive,
          fromX: userSide === 'home' ? 42 : 58,
          fromY: 52,
          toX: userSide === 'home' ? 79 : 21,
          toY: 49,
          payload: JSON.stringify({
            ...highlightPayload,
            teamXgDelta,
            opponentXgDelta,
            directEffect: {
              scoreForBefore,
              scoreAgainstBefore,
              scoreForAfter,
              scoreAgainstAfter,
              xgForBefore: Number(xgForBefore.toFixed(2)),
              xgAgainstBefore: Number(xgAgainstBefore.toFixed(2)),
              xgForAfter: Number(xgForAfter.toFixed(2)),
              xgAgainstAfter: Number(xgAgainstAfter.toFixed(2))
            }
          })
        }
      });
    });

    await this.addAudit(career.id, 'INTERVENTION', `Intervention ${payload.type} used.`, {
      fixtureId,
      minute,
      homeScore,
      awayScore,
      liveSegment: nextLive.segment,
      substitutionsUsed: nextLive.substitutionsUsed,
      tacticalChangesUsed: nextLive.tacticalChangesUsed,
      halftimeTalkUsed: nextLive.halftimeTalkUsed
    });

    return this.getMatchHighlights(career.id, fixtureId);
  }

  public async getMatchHighlights(careerId: string, fixtureId: string) {
    const career = await this.requireCareer(careerId);

    const fixture = await this.prisma.v2Fixture.findFirst({
      where: { id: fixtureId, careerId }
    });

    if (!fixture) {
      throw new Error('Fixture not found.');
    }

    const match = await this.prisma.v2Match.findUnique({
      where: { fixtureId }
    });

    const fixturePresentation = await this.toFixturePresentation(fixture, career.controlledClubId);

    if (!match) {
      return {
        fixture: fixturePresentation,
        match: null,
        highlights: []
      };
    }

    const highlights = await this.prisma.v2Highlight.findMany({
      where: { matchId: match.id },
      orderBy: [{ minute: 'asc' }, { xThreatRank: 'desc' }]
    });
    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const visibleHighlights = this.getVisibleLiveHighlights(
      highlights.map((highlight) => ({
        ...highlight,
        payload: JSON.parse((highlight.payload as string) || '{}')
      })),
      interventionState.live
    );
    const visibleMetrics = this.buildVisibleLiveMetrics(visibleHighlights, match.homePossession, interventionState.live);

    return {
      fixture: fixturePresentation,
      match: {
        ...match,
        homeScore: visibleMetrics.homeScore,
        awayScore: visibleMetrics.awayScore,
        homeXg: visibleMetrics.homeXg,
        awayXg: visibleMetrics.awayXg,
        homePossession: visibleMetrics.homePossession,
        awayPossession: visibleMetrics.awayPossession,
        interventions: interventionState.entries,
        matchPrep: interventionState.prep,
        liveState: {
          ...interventionState.live,
          remainingSubstitutions: Math.max(0, interventionState.live.substitutionLimit - interventionState.live.substitutionsUsed),
          remainingTacticalChanges: Math.max(0, interventionState.live.tacticalChangeLimit - interventionState.live.tacticalChangesUsed)
        }
      },
      highlights: visibleHighlights
    };
  }

  public async getPostMatch(careerId: string, fixtureId: string) {
    const career = await this.requireCareer(careerId);

    const fixture = await this.prisma.v2Fixture.findFirst({
      where: { id: fixtureId, careerId }
    });

    if (!fixture) {
      throw new Error('Fixture not found for post-match processing.');
    }

    const match = await this.prisma.v2Match.findUnique({ where: { fixtureId } });
    if (!match) {
      throw new Error('Match record not found.');
    }

    let appliedChanges = false;

    if (match.status !== V2_MATCH_STATUS.COMPLETED) {
      await this.prisma.$transaction(async (tx) => {
        await tx.v2Match.update({
          where: { id: match.id },
          data: {
            status: V2_MATCH_STATUS.COMPLETED,
            completedAt: new Date()
          }
        });

        await tx.v2Fixture.update({
          where: { id: fixture.id },
          data: {
            status: V2_FIXTURE_STATUS.COMPLETED,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          }
        });

        await this.applyFixtureResultToStandings(
          tx,
          career.id,
          fixture.leagueId,
          fixture.homeClubId,
          fixture.awayClubId,
          match.homeScore,
          match.awayScore
        );

        await this.recalculateLeaguePositions(tx, career.id, [fixture.leagueId]);

        const userIsHome = fixture.homeClubId === career.controlledClubId;
        const userGoals = userIsHome ? match.homeScore : match.awayScore;
        const oppGoals = userIsHome ? match.awayScore : match.homeScore;
        const delta = this.computePostMatchDelta(userGoals, oppGoals);

        await this.applyClubEffects(tx, career.id, career.controlledClubId, delta);
        await this.applyPostMatchClubForm(
          tx,
          career.id,
          career.controlledClubId,
          userGoals > oppGoals ? 'W' : userGoals < oppGoals ? 'L' : 'D'
        );
        await this.applyPostMatchPlayerEffects(tx, career, fixture, match);
        await this.recordControlledClubMatchUsage(tx, career, fixture, match);
        await this.resolvePlayingTimePromisesFromMatchUsage(tx, career, fixture);

        await tx.v2Career.update({
          where: { id: career.id },
          data: { currentPhase: V2_PHASES.POST_MATCH }
        });
      });

      appliedChanges = true;
    }

    await this.addAudit(career.id, 'POST_MATCH', `Post-match processed for ${fixture.id}.`, {
      fixtureId,
      appliedChanges
    });

    const userTeamSide: 'home' | 'away' = fixture.homeClubId === career.controlledClubId ? 'home' : 'away';
    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const interventions = this.normalizeInterventionEntries(interventionState.entries);

    const [clubState, standings, playerStates, matchHighlights, squadPlayers] = await Promise.all([
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        }
      }),
      this.prisma.v2LeagueState.findMany({
        where: { careerId: career.id, leagueId: fixture.leagueId },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' }
        ],
        take: 10
      })
      ,
      this.prisma.v2PlayerState.findMany({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId
        },
        select: {
          playerId: true,
          morale: true,
          fitness: true,
          form: true,
          isInjured: true,
          isSuspended: true
        }
      }),
      this.prisma.v2Highlight.findMany({
        where: { matchId: match.id },
        select: {
          minute: true,
          eventType: true,
          teamSide: true,
          xThreatRank: true,
          payload: true,
          actorId: true
        },
        orderBy: [{ minute: 'asc' }, { xThreatRank: 'desc' }]
      }),
      this.prisma.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: {
          id: true,
          fullName: true,
          position: true
        }
      })
    ]);

    const standingsClubIds = standings.map((row) => row.clubId);
    const standingClubs = standingsClubIds.length > 0
      ? await this.prisma.club.findMany({
        where: { id: { in: standingsClubIds } },
        select: { id: true, name: true }
      })
      : [];
    const standingClubMap = new Map(standingClubs.map((club) => [club.id, club.name]));

    const fixturePresentation = await this.toFixturePresentation(fixture, career.controlledClubId);
    const interventionImpact = this.buildInterventionImpactTelemetry(interventions, matchHighlights, userTeamSide);
    const analytics = this.buildPostMatchAnalytics(
      career,
      fixture,
      match,
      interventionState,
      matchHighlights,
      squadPlayers,
      playerStates,
      interventionImpact
    );

    return {
      fixtureId: fixture.id,
      fixture: fixturePresentation,
      score: {
        home: match.homeScore,
        away: match.awayScore
      },
      xg: {
        home: match.homeXg,
        away: match.awayXg
      },
      possession: {
        home: match.homePossession,
        away: match.awayPossession
      },
      clubState,
      playerImpact: this.summarizePlayerImpact(playerStates),
      playerRatings: analytics.playerRatings,
      chanceQuality: analytics.chanceQuality,
      tacticalFeedback: analytics.tacticalFeedback,
      standingsPreview: standings.map((row, idx) => ({
        position: idx + 1,
        clubId: row.clubId,
        clubName: standingClubMap.get(row.clubId) ?? `Club ${row.clubId}`,
        played: row.played,
        points: row.points,
        goalDifference: row.goalDifference,
        progressionStatus: row.progressionStatus
      })),
      interventionImpact,
      latestPlannerInsight: analytics.plannerInsight,
      appliedChanges
    };
  }

  public async getStandings(careerId: string, leagueId: number) {
    await this.requireCareer(careerId);

    const rows = await this.prisma.v2LeagueState.findMany({
      where: {
        careerId,
        leagueId
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' },
        { clubId: 'asc' }
      ]
    });

    const clubIds = rows.map((row) => row.clubId);
    const clubs = await this.prisma.club.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true }
    });

    const clubMap = new Map(clubs.map((club) => [club.id, club.name]));

    return rows.map((row, index) => ({
      position: index + 1,
      clubId: row.clubId,
      clubName: clubMap.get(row.clubId) ?? `Club ${row.clubId}`,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
      progressionStatus: row.progressionStatus
    }));
  }

  public async listCareerLeagues(careerId: string): Promise<CareerLeagueOption[]> {
    const career = await this.requireCareer(careerId);

    const grouped = await this.prisma.v2LeagueState.groupBy({
      by: ['leagueId'],
      where: { careerId },
      _count: { _all: true }
    });
    if (grouped.length === 0) {
      return [];
    }

    const leagueIds = grouped.map((row) => row.leagueId);
    const leagues = await this.prisma.league.findMany({
      where: { id: { in: leagueIds } },
      select: {
        id: true,
        name: true,
        level: true,
        region: true,
        matchdayType: true,
        tier: true
      }
    });

    const countByLeague = new Map(grouped.map((row) => [row.leagueId, row._count._all]));
    return leagues
      .sort((a, b) =>
        a.tier - b.tier ||
        (a.region ?? '').localeCompare(b.region ?? '') ||
        (a.matchdayType ?? '').localeCompare(b.matchdayType ?? '') ||
        a.name.localeCompare(b.name)
      )
      .map((league) => ({
        leagueId: league.id,
        leagueName: league.name,
        leagueLevel: league.level,
        region: league.region,
        matchdayType: league.matchdayType,
        tier: league.tier,
        divisionType: league.tier <= 2 ? 'PRO' : 'AMATEUR',
        ageCategory: this.isO21League(league) ? 'O21' : 'SENIOR',
        clubCount: countByLeague.get(league.id) ?? 0,
        isActiveLeague: league.id === career.activeLeagueId
      }));
  }

  public async getLeagueRules(careerId: string, leagueId: number) {
    const career = await this.requireCareer(careerId);

    const grouped = await this.prisma.v2LeagueState.groupBy({
      by: ['leagueId'],
      where: { careerId },
      _count: { _all: true }
    });
    if (grouped.length === 0) {
      throw new Error('No league state found for this career.');
    }

    const leagueIds = grouped.map((row) => row.leagueId);
    const leagues = await this.prisma.league.findMany({
      where: { id: { in: leagueIds } },
      select: {
        id: true,
        name: true,
        level: true,
        region: true,
        matchdayType: true,
        tier: true
      }
    });

    const selected = leagues.find((league) => league.id === leagueId);
    if (!selected) {
      throw new Error('League is not part of this career.');
    }

    const groupedByKey = this.groupLeaguesForSeasonTransition(leagues);
    const groupKey = this.getSeasonTransitionGroupKey(selected);
    const inGroup = groupedByKey.get(groupKey) ?? [];
    const tiersInGroup = Array.from(new Set(inGroup.map((league) => league.tier))).sort((a, b) => a - b);

    const upperTier = tiersInGroup
      .filter((tier) => tier < selected.tier)
      .sort((a, b) => b - a)[0];
    const lowerTier = tiersInGroup
      .filter((tier) => tier > selected.tier)
      .sort((a, b) => a - b)[0];

    const upperLeagues = Number.isFinite(upperTier)
      ? inGroup.filter((league) => league.tier === upperTier)
      : [];
    const lowerLeagues = Number.isFinite(lowerTier)
      ? inGroup.filter((league) => league.tier === lowerTier)
      : [];
    const sameTierLeagues = inGroup.filter((league) => league.tier === selected.tier);

    const promotionSlots = upperLeagues.length > 0 && upperTier === selected.tier - 1
      ? this.getSeasonTransitionSlots(
        groupKey,
        upperTier,
        selected.tier,
        upperLeagues.length,
        sameTierLeagues.length
      )
      : 0;
    const relegationSlots = lowerLeagues.length > 0 && lowerTier === selected.tier + 1
      ? this.getSeasonTransitionSlots(
        groupKey,
        selected.tier,
        lowerTier,
        sameTierLeagues.length,
        lowerLeagues.length
      )
      : 0;

    const notes: string[] = [];
    if (groupKey === 'O21') {
      notes.push('O21 promotion/relegation is isolated from the senior pyramid.');
      notes.push('O21 Divisie 4A and 4B feed into O21 Divisie 3.');
      notes.push('Promotion and relegation only occur between adjacent O21 tiers.');
    } else if (groupKey === 'NATIONAL') {
      notes.push('National tiers use direct promotion/relegation between adjacent levels.');
    } else {
      notes.push('Regional transitions are limited to leagues in the same region and matchday type.');
    }

    if (selected.tier <= 2) {
      notes.push('This league is classified as Professional.');
    } else {
      notes.push('This league is classified as Amateur.');
    }

    const registrationRules = this.resolveSquadRegistrationRules(selected);
    const competitionWindows = await this.resolveCompetitionWindowSnapshot(career, this.prisma);

    return {
      league: {
        id: selected.id,
        name: selected.name,
        level: selected.level,
        region: selected.region,
        matchdayType: selected.matchdayType,
        tier: selected.tier,
        divisionType: selected.tier <= 2 ? 'PRO' : 'AMATEUR',
        ageCategory: this.isO21League(selected) ? 'O21' : 'SENIOR'
      },
      transitionGroup: groupKey,
      promotion: {
        slots: promotionSlots,
        targetLeagues: upperLeagues
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((league) => ({
            leagueId: league.id,
            name: league.name,
            tier: league.tier
          }))
      },
      relegation: {
        slots: relegationSlots,
        targetLeagues: lowerLeagues
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((league) => ({
            leagueId: league.id,
            name: league.name,
            tier: league.tier
          }))
      },
      seasonPhase: competitionWindows.seasonPhase,
      registration: {
        competitionLabel: registrationRules.label,
        registrationLimit: registrationRules.registrationLimit,
        minimumRegistered: registrationRules.minimumRegistered,
        overageLimit: registrationRules.overageLimit,
        notes: registrationRules.notes,
        window: competitionWindows.registrationWindow
      },
      transferWindow: competitionWindows.transferWindow,
      disciplinary: {
        suspensionRule: 'Straight red cards and second-booking dismissals trigger a one-match suspension in the active league.',
        notes: [
          'Suspensions are served against the next league fixture for your controlled club.',
          'Suspended players are excluded from match prep until the ban is served.'
        ]
      },
      notes
    };
  }

  public async getSquad(careerId: string) {
    const career = await this.requireCareer(careerId);
    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22);
    await this.ensureControlledClubRegistrationViability(career, career.controlledClubId);
    await this.ensureControlledClubContracts(career, career.controlledClubId);
    const [roleAssignmentsByPlayer, activeStatusDirectivesByPlayer, activeRetrainingPlansByPlayer, activeSuspensionsByPlayer] = await Promise.all([
      this.getSquadRoleAssignmentsMap(career.id),
      this.getActivePlayerStatusDirectiveMap(career.id, career.weekNumber, this.prisma),
      this.getActivePlayerRetrainingPlanMap(career.id, this.prisma),
      this.getActivePlayerSuspensionMap(career.id, this.prisma)
    ]);

    const players = await this.prisma.player.findMany({
      where: { currentClubId: career.controlledClubId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        position: true,
        dateOfBirth: true,
        age: true,
        currentAbility: true,
        potentialAbility: true,
        weeklyWage: true,
        value: true,
        contractStart: true,
        contractEnd: true
      },
      orderBy: [
        { currentAbility: 'desc' },
        { potentialAbility: 'desc' },
        { id: 'asc' }
      ]
    });

    const playerIds = players.map((player) => player.id);
    if (playerIds.length === 0) {
      return [];
    }

    const registrationSnapshot = await this.getSquadRegistrationSnapshot(
      career,
      players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        fullName: player.fullName,
        position: player.position,
        dateOfBirth: player.dateOfBirth,
        age: player.age,
        currentAbility: player.currentAbility,
        potentialAbility: player.potentialAbility
      })),
      this.prisma
    );

    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId);
    const stateRows = await this.prisma.v2PlayerState.findMany({
      where: {
        careerId,
        playerId: { in: playerIds }
      }
    });
    const stateMap = new Map(stateRows.map((row) => [row.playerId, row]));

    return players.map((player) => {
      const state = stateMap.get(player.id);
      const assignedRole = roleAssignmentsByPlayer.get(player.id)?.roleAssignment ?? null;
      const activeDirective = activeStatusDirectivesByPlayer.get(player.id) ?? null;
      const retrainingPlan = activeRetrainingPlansByPlayer.get(player.id) ?? null;
      const activeSuspension = activeSuspensionsByPlayer.get(player.id)
        ?? (state?.isSuspended
          ? this.buildLegacySuspensionFallback(career.id, player.id, player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(), career.weekNumber)
          : null);
      const actualAge = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
      const registrationState = registrationSnapshot.byPlayerId.get(player.id) ?? {
        isRegistered: false,
        overageSlotUsed: false,
        note: 'Not registered for the active competition.'
      };
      const effectivePosition = retrainingPlan && retrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
        ? retrainingPlan.targetPosition
        : player.position;
      const eligibilityCode: SquadEligibilityCode = state?.isInjured
        ? 'INJURED'
        : activeSuspension
          ? 'SUSPENDED'
          : registrationState.isRegistered
            ? 'ELIGIBLE'
            : registrationSnapshot.rules.competitionCategory === 'O21' && actualAge > 21
              ? 'OVERAGE_LIMIT'
              : 'UNREGISTERED';
      const eligibilityNote = eligibilityCode === 'INJURED'
        ? `Unavailable for roughly ${Math.max(1, Number(state?.injuryWeeks ?? 1))} more week(s).`
        : eligibilityCode === 'SUSPENDED'
          ? activeSuspension?.note || 'Unavailable due to suspension.'
          : eligibilityCode === 'OVERAGE_LIMIT'
            ? registrationState.note || 'Not eligible: all overage slots are currently used in this O21 competition.'
            : eligibilityCode === 'UNREGISTERED'
              ? registrationState.note || 'Not registered for the active competition.'
              : retrainingPlan && retrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
                ? `Eligible. Retraining cover at ${retrainingPlan.targetPosition} is now available for match prep.`
                : 'Eligible for the next fixture.';
      return {
        id: player.id,
        fullName: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(),
        position: player.position,
        effectivePosition,
        age: actualAge,
        currentAbility: player.currentAbility,
        potentialAbility: player.potentialAbility,
        weeklyWage: player.weeklyWage,
        marketValue: player.value,
        contractStart: player.contractStart,
        contractEnd: player.contractEnd,
        contractYearsRemaining: player.contractEnd
          ? Math.max(0, player.contractEnd.getUTCFullYear() - career.currentDate.getUTCFullYear())
          : 0,
        contractRisk: this.resolveContractRisk(player.contractEnd, career.currentDate),
        morale: state?.morale ?? 50,
        fitness: state?.fitness ?? 90,
        form: state?.form ?? 50,
        isInjured: state?.isInjured ?? false,
        injuryWeeks: state?.injuryWeeks ?? 0,
        isSuspended: Boolean(activeSuspension),
        suspensionId: activeSuspension?.suspensionId ?? null,
        suspensionReason: activeSuspension?.reason ?? null,
        suspensionIssuedWeekNumber: activeSuspension?.issuedWeekNumber ?? null,
        suspensionSourceFixtureId: activeSuspension?.sourceFixtureId ?? null,
        suspensionMatchesRemaining: activeSuspension?.matchesRemaining ?? null,
        suspensionNote: activeSuspension?.note ?? null,
        developmentDelta: state?.developmentDelta ?? 0,
        assignedRole,
        registrationStatus: registrationState.isRegistered ? 'REGISTERED' : 'UNREGISTERED',
        registrationNote: registrationState.note,
        eligibilityCode,
        eligibilityNote,
        isEligibleForNextFixture: eligibilityCode === 'ELIGIBLE',
        managerDirectiveCode: activeDirective?.directiveCode ?? null,
        managerDirectiveLabel: activeDirective ? this.getPlayerStatusDirectiveLabel(activeDirective.directiveCode) : null,
        retrainingTargetPosition: retrainingPlan?.targetPosition ?? null,
        retrainingProgressPct: retrainingPlan?.progressPct ?? null,
        retrainingReadyForMatchPrep: Boolean(retrainingPlan && retrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS)
      };
    });
  }

  public async getSquadPlayerProfile(careerId: string, playerId: number) {
    const career = await this.requireCareer(careerId);
    const squad = await this.getSquad(careerId);
    const player = squad.find((row) => Number(row.id) === Number(playerId));

    if (!player) {
      throw new Error('Player not found in current squad.');
    }

    const millisPerDay = 1000 * 60 * 60 * 24;
    const contractEnd = player.contractEnd ? new Date(player.contractEnd) : null;
    const contractStart = player.contractStart ? new Date(player.contractStart) : null;
    const contractDaysRemaining = contractEnd
      ? Math.max(0, Math.floor((contractEnd.getTime() - career.currentDate.getTime()) / millisPerDay))
      : null;

    const abilitySorted = [...squad].sort((a, b) =>
      (Number(b.currentAbility ?? 0) - Number(a.currentAbility ?? 0))
      || (Number(b.potentialAbility ?? 0) - Number(a.potentialAbility ?? 0))
      || (Number(a.id) - Number(b.id))
    );
    const squadAbilityRank = Math.max(1, abilitySorted.findIndex((row) => row.id === player.id) + 1);

    const positionPeers = squad
      .filter((row) => (row.position || '').toUpperCase() === (player.position || '').toUpperCase())
      .sort((a, b) =>
        (Number(b.currentAbility ?? 0) - Number(a.currentAbility ?? 0))
        || (Number(b.potentialAbility ?? 0) - Number(a.potentialAbility ?? 0))
        || (Number(a.id) - Number(b.id))
      );
    const depthRankAtPosition = positionPeers.length > 0
      ? Math.max(1, positionPeers.findIndex((row) => row.id === player.id) + 1)
      : null;
    const positionCount = positionPeers.length;

    const age = Number(player.age ?? 0);
    const ability = Number(player.currentAbility ?? 60);
    const potentialAbility = Number(player.potentialAbility ?? ability);
    const upsideGap = Math.max(0, potentialAbility - ability);

    let roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT' = 'DEPTH';
    if (age > 0 && age <= 21 && upsideGap >= 8) {
      roleTier = 'PROSPECT';
    } else if (squadAbilityRank <= 3 || ability >= 82) {
      roleTier = 'STAR';
    } else if (squadAbilityRank <= 8 || depthRankAtPosition === 1) {
      roleTier = 'STARTER';
    } else if (squadAbilityRank <= 15 || (depthRankAtPosition !== null && depthRankAtPosition <= 2)) {
      roleTier = 'ROTATION';
    }

    const playingTimeExpectation = roleTier === 'STAR'
      ? 'KEY_PLAYER'
      : roleTier === 'STARTER'
        ? 'IMPORTANT'
        : roleTier === 'ROTATION'
          ? 'ROTATION'
          : roleTier === 'PROSPECT'
            ? 'DEVELOPMENT'
            : 'SPORADIC';
    const recommendedAssignedRole: SquadRoleAssignment = roleTier === 'STAR' || roleTier === 'STARTER'
      ? 'STARTER'
      : roleTier === 'ROTATION'
        ? 'ROTATION'
        : 'DEPTH';
    const currentAssignedRole = (player as typeof player & { assignedRole?: SquadRoleAssignment | null }).assignedRole ?? null;
    const roleMismatch = currentAssignedRole && currentAssignedRole !== recommendedAssignedRole;
    const rolePressureNote = roleMismatch
      ? currentAssignedRole === 'DEPTH' && recommendedAssignedRole === 'STARTER'
        ? 'Current assigned squad role is below expectation for this player and may create morale/board pressure.'
        : currentAssignedRole === 'STARTER' && recommendedAssignedRole === 'DEPTH'
          ? 'Current assigned squad role is above expected contribution; board may question the hierarchy if results dip.'
          : 'Current assigned squad role differs from the modelled recommendation.'
      : 'Assigned squad role aligns with the current squad recommendation.';

    const baseAvailabilityStatus = player.isInjured
      ? 'INJURED'
      : player.isSuspended
        ? 'SUSPENDED'
        : 'AVAILABLE';
    const baseAvailabilityNote = player.isInjured
      ? `Unavailable for roughly ${Math.max(1, Number(player.injuryWeeks ?? 1))} more week(s).`
      : player.isSuspended
        ? player.suspensionNote || 'Unavailable due to suspension.'
        : 'Available for selection this week.';

    const suggestedRenewalYears = roleTier === 'STAR'
      ? (age > 0 && age <= 28 ? 4 : 3)
      : roleTier === 'PROSPECT'
        ? 3
        : roleTier === 'STARTER'
          ? 3
          : roleTier === 'ROTATION'
            ? 2
            : 1;
    const suggestedWageAdjustmentPct = roleTier === 'STAR'
      ? (player.contractRisk === 'CRITICAL' ? 12 : 8)
      : roleTier === 'PROSPECT'
        ? (player.contractRisk === 'CRITICAL' ? 8 : 5)
        : roleTier === 'STARTER'
          ? (player.contractRisk === 'CRITICAL' ? 8 : 5)
          : roleTier === 'ROTATION'
            ? 4
            : 2;

    let contractRecommendation = 'Contract is stable. Reassess later in the season.';
    if (!contractEnd) {
      contractRecommendation = 'Missing contract expiry date. Review contract data before making squad decisions.';
    } else if ((player.contractRisk === 'CRITICAL' || (contractDaysRemaining ?? 999) <= 30) && (roleTier === 'STAR' || roleTier === 'STARTER' || roleTier === 'PROSPECT')) {
      contractRecommendation = 'High priority renewal: open talks immediately to avoid a disruptive exit.';
    } else if (player.contractRisk === 'CRITICAL') {
      contractRecommendation = 'Decide soon: renew on value terms or plan a clean release to protect squad planning.';
    } else if (player.contractRisk === 'WATCH' || (contractDaysRemaining ?? 999) <= 120) {
      contractRecommendation = 'Start a structured contract conversation in the next few weeks.';
    }

    const squadRoleRecommendation = roleTier === 'STAR'
      ? 'Use as a core starter and protect morale with clear role communication.'
      : roleTier === 'STARTER'
        ? 'Keep in the starting group and monitor form/fitness balance.'
        : roleTier === 'ROTATION'
          ? 'Useful rotation option. Manage minutes based on form and tactical fit.'
          : roleTier === 'PROSPECT'
            ? 'Prioritize development minutes and avoid long bench stretches.'
            : 'Depth player. Evaluate contract cost versus squad flexibility.';

    const pendingContractEvents = await this.prisma.v2InboxEvent.findMany({
      where: {
        careerId,
        weekNumber: career.weekNumber,
        status: 'PENDING',
        id: { contains: `:contract:${player.id}` }
      },
      select: {
        id: true,
        title: true,
        urgency: true,
        deadline: true
      }
    });

    const stageRank = { WARNING: 1, COUNTER: 2, FALLOUT: 3 } as const;
    const pendingContractTalk = pendingContractEvents
      .map((event) => {
        let stage: 'WARNING' | 'COUNTER' | 'FALLOUT' = 'WARNING';
        if (/:reject-fallout$/.test(event.id)) {
          stage = 'FALLOUT';
        } else if (/:counter(?::\d+)?$/.test(event.id)) {
          stage = 'COUNTER';
        }
        return {
          eventId: event.id,
          stage,
          title: event.title,
          urgency: event.urgency,
          deadline: event.deadline
        };
      })
      .sort((a, b) => {
        if (stageRank[b.stage] !== stageRank[a.stage]) {
          return stageRank[b.stage] - stageRank[a.stage];
        }
        return a.deadline.getTime() - b.deadline.getTime();
      })[0] ?? null;

    const [activePlayingTimePromiseMap, activeDevelopmentPlanMap, activeStatusDirectiveMap, activeMedicalPlanMap, activeRetrainingPlanMap, registrationSnapshot, competitionWindows] = await Promise.all([
      this.getActivePlayingTimePromiseMap(career.id, this.prisma),
      this.getActivePlayerDevelopmentPlanMap(career.id, this.prisma),
      this.getActivePlayerStatusDirectiveMap(career.id, career.weekNumber, this.prisma),
      this.getActivePlayerMedicalPlanMap(career.id, career.weekNumber, this.prisma),
      this.getActivePlayerRetrainingPlanMap(career.id, this.prisma),
      this.getSquadRegistrationSnapshot(
        career,
        squad.map((row) => ({
          id: row.id,
          firstName: '',
          lastName: '',
          fullName: row.fullName,
          position: row.position,
          dateOfBirth: null,
          age: row.age,
          currentAbility: row.currentAbility,
          potentialAbility: row.potentialAbility
        })),
        this.prisma
      ),
      this.resolveCompetitionWindowSnapshot(career, this.prisma)
    ]);
    const activePlayingTimePromise = activePlayingTimePromiseMap.get(player.id) ?? null;
    const activeDevelopmentPlan = activeDevelopmentPlanMap.get(player.id) ?? null;
    const activeStatusDirective = activeStatusDirectiveMap.get(player.id) ?? null;
    const activeMedicalPlan = activeMedicalPlanMap.get(player.id) ?? null;
    const activeRetrainingPlan = activeRetrainingPlanMap.get(player.id) ?? null;
    const availabilityStatus = baseAvailabilityStatus;
    const availabilityNoteParts = [baseAvailabilityNote];
    if (activeStatusDirective) {
      availabilityNoteParts.push(`Manager directive: ${this.getPlayerStatusDirectiveProfileNote(activeStatusDirective.directiveCode)}`);
    }
    if (activeMedicalPlan) {
      availabilityNoteParts.push(`Medical plan: ${this.getPlayerMedicalPlanProfileNote(activeMedicalPlan.planCode, player.isInjured, player.injuryWeeks)}`);
    }
    const availabilityNote = availabilityNoteParts.join(' ');
    const registrationState = registrationSnapshot.byPlayerId.get(player.id) ?? {
      isRegistered: false,
      overageSlotUsed: false,
      note: 'Not registered for the active competition.'
    };
    const effectivePosition = activeRetrainingPlan && activeRetrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
      ? activeRetrainingPlan.targetPosition
      : player.position;
    const baseEligibilityCode: SquadEligibilityCode = registrationState.isRegistered
      ? 'ELIGIBLE'
      : registrationSnapshot.rules.competitionCategory === 'O21' && age > 21
        ? 'OVERAGE_LIMIT'
        : 'UNREGISTERED';
    const eligibilityCode: SquadEligibilityCode = player.isInjured
      ? 'INJURED'
      : player.isSuspended
        ? 'SUSPENDED'
        : baseEligibilityCode;
    const eligibilityNote = eligibilityCode === 'INJURED'
      ? `Unavailable for roughly ${Math.max(1, Number(player.injuryWeeks ?? 1))} more week(s).`
      : eligibilityCode === 'SUSPENDED'
        ? player.suspensionNote || 'Unavailable due to suspension.'
        : eligibilityCode === 'OVERAGE_LIMIT'
          ? registrationState.note || 'No overage slot is currently available for this player in the active O21 competition.'
          : eligibilityCode === 'UNREGISTERED'
            ? registrationState.note || 'This player is not currently registered for the active competition.'
            : activeRetrainingPlan && activeRetrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
              ? `Eligible. Retraining cover at ${activeRetrainingPlan.targetPosition} is now available for match prep.`
              : 'Eligible for the next fixture.';
    const promiseUsage = activePlayingTimePromise
      ? await this.getPlayerMatchUsageSummaryMap(
        career.id,
        [player.id],
        activePlayingTimePromise.createdWeekNumber,
        this.prisma
      )
      : new Map<number, PlayerMatchUsageSummary>();
    const playingTimePromise = activePlayingTimePromise
      ? (() => {
        const usage = promiseUsage.get(player.id) ?? {
          matchdaySquadCount: 0,
          appearanceCount: 0,
          startCount: 0,
          unusedBenchCount: 0,
          totalMinutes: 0,
          lastFixtureId: null,
          lastWeekNumber: null,
          lastRole: null,
          lastSummary: null
        };
        const weeksUntilDue = activePlayingTimePromise.dueWeekNumber - career.weekNumber;
        const status: PlayingTimePromiseStatus = weeksUntilDue < 0
          ? 'OVERDUE'
          : weeksUntilDue === 0
            ? 'DUE'
            : 'ON_TRACK';
        const summary = usage.matchdaySquadCount > 0
          ? `Recent match usage recorded: ${usage.matchdaySquadCount} matchday squad inclusion(s), ${usage.appearanceCount} appearance(s), ${usage.totalMinutes} total minute(s). Promise should clear after post-match review.`
          : status === 'OVERDUE'
            ? `Bench/rotation promise is overdue. No matchday squad inclusion has been recorded since week ${activePlayingTimePromise.createdWeekNumber}.`
            : status === 'DUE'
              ? `Bench/rotation promise is due this week. No matchday squad inclusion has been recorded yet.`
              : `Bench/rotation promise is active. No matchday squad inclusion has been recorded yet. Deadline: week ${activePlayingTimePromise.dueWeekNumber}.`;
        return {
          promiseId: activePlayingTimePromise.promiseId,
          promiseType: 'BENCH_WINDOW' as const,
          promisedRoleAssignment: activePlayingTimePromise.promisedRoleAssignment,
          createdWeekNumber: activePlayingTimePromise.createdWeekNumber,
          dueWeekNumber: activePlayingTimePromise.dueWeekNumber,
          reaffirmCount: activePlayingTimePromise.reaffirmCount,
          weeksUntilDue,
          status,
          sourceEventId: activePlayingTimePromise.sourceEventId,
          matchdaySquadCount: usage.matchdaySquadCount,
          appearanceCount: usage.appearanceCount,
          startCount: usage.startCount,
          unusedBenchCount: usage.unusedBenchCount,
          totalMinutes: usage.totalMinutes,
          lastUsedWeekNumber: usage.lastWeekNumber,
          lastUsageSummary: usage.lastSummary,
          summary
        };
      })()
      : null;
    const developmentPlan = activeDevelopmentPlan
      ? (() => {
        const projectedEffects = this.getDevelopmentPlanProjectedEffects({
          focus: activeDevelopmentPlan.focus,
          target: activeDevelopmentPlan.target,
          age,
          isInjured: Boolean(player.isInjured),
          isSuspended: Boolean(player.isSuspended),
          roleTier
        });
        return {
          planId: activeDevelopmentPlan.planId,
          focus: activeDevelopmentPlan.focus,
          target: activeDevelopmentPlan.target,
          setWeekNumber: activeDevelopmentPlan.setWeekNumber,
          sourceEventId: activeDevelopmentPlan.sourceEventId,
          projectedEffects
        };
      })()
      : null;
    const medical = this.buildPlayerMedicalSnapshot({
      fitness: Number(player.fitness ?? 90),
      form: Number(player.form ?? 50),
      isInjured: Boolean(player.isInjured),
      injuryWeeks: Math.max(0, Number(player.injuryWeeks ?? 0)),
      isSuspended: Boolean(player.isSuspended),
      roleTier,
      assignedRole: currentAssignedRole,
      activeDirective: activeStatusDirective,
      activeDevelopmentPlan,
      activeMedicalPlan,
      currentWeekNumber: career.weekNumber
    });
    const recentHistory = await this.getSquadPlayerRecentHistorySummary(career.id, player.id, this.prisma);

    return {
      playerId: player.id,
      fullName: player.fullName,
      position: player.position,
      effectivePosition,
      age: player.age ?? null,
      currentAbility: player.currentAbility ?? null,
      potentialAbility: player.potentialAbility ?? null,
      weeklyWage: player.weeklyWage ?? null,
      marketValue: player.marketValue ?? null,
      availability: {
        status: availabilityStatus,
        note: availabilityNote,
        isInjured: Boolean(player.isInjured),
        injuryWeeks: Number(player.injuryWeeks ?? 0),
        isSuspended: Boolean(player.isSuspended),
        suspension: player.isSuspended
          ? {
            suspensionId: player.suspensionId ?? `${career.id}:susp:legacy:${player.id}`,
            matchesRemaining: Math.max(1, Number(player.suspensionMatchesRemaining ?? 1)),
            reason: player.suspensionReason ?? 'Match suspension',
            issuedWeekNumber: Math.max(1, Number(player.suspensionIssuedWeekNumber ?? career.weekNumber)),
            sourceFixtureId: player.suspensionSourceFixtureId ?? null,
            note: player.suspensionNote || 'Unavailable due to suspension.'
          }
          : null,
        managerDirective: activeStatusDirective
          ? {
            directiveId: activeStatusDirective.directiveId,
            directiveCode: activeStatusDirective.directiveCode,
            label: this.getPlayerStatusDirectiveLabel(activeStatusDirective.directiveCode),
            note: this.getPlayerStatusDirectiveProfileNote(activeStatusDirective.directiveCode),
            setWeekNumber: activeStatusDirective.setWeekNumber,
            expiresWeekNumber: activeStatusDirective.expiresWeekNumber,
            weeksRemaining: Math.max(0, activeStatusDirective.expiresWeekNumber - career.weekNumber),
            sourceAction: activeStatusDirective.sourceAction
          }
          : null
      },
      registration: {
        isRegistered: registrationState.isRegistered,
        competitionLabel: registrationSnapshot.rules.label,
        registeredCount: registrationSnapshot.registeredCount,
        registrationLimit: registrationSnapshot.rules.registrationLimit,
        minimumRegistered: registrationSnapshot.rules.minimumRegistered,
        overageCount: registrationSnapshot.overageCount,
        overageLimit: registrationSnapshot.rules.overageLimit,
        eligibilityCode,
        eligibilityNote,
        note: registrationState.note,
        rulesNotes: registrationSnapshot.rules.notes,
        window: competitionWindows.registrationWindow
      },
      performance: {
        morale: Number(player.morale ?? 50),
        fitness: Number(player.fitness ?? 90),
        form: Number(player.form ?? 50),
        developmentDelta: Number(player.developmentDelta ?? 0)
      },
      medical,
      squadContext: {
        squadSize: squad.length,
        squadAbilityRank,
        positionCount,
        depthRankAtPosition,
        roleTier,
        playingTimeExpectation,
        recommendation: squadRoleRecommendation,
        assignedRole: currentAssignedRole,
        recommendedAssignedRole,
        roleMismatch: Boolean(roleMismatch),
        rolePressureNote
      },
        contract: {
        contractStart: contractStart ? contractStart.toISOString() : null,
        contractEnd: contractEnd ? contractEnd.toISOString() : null,
        yearsRemaining: Number(player.contractYearsRemaining ?? 0),
        daysRemaining: contractDaysRemaining,
        risk: player.contractRisk ?? 'STABLE',
        recommendation: contractRecommendation,
        suggestedRenewalYears,
        suggestedWageAdjustmentPct
      },
      retraining: activeRetrainingPlan
        ? {
          planId: activeRetrainingPlan.planId,
          currentPosition: activeRetrainingPlan.currentPosition,
          effectivePosition,
          targetPosition: activeRetrainingPlan.targetPosition,
          progressPct: activeRetrainingPlan.progressPct,
          weeklyProgressPct: activeRetrainingPlan.weeklyProgressPct,
          readiness: activeRetrainingPlan.progressPct >= 100
            ? 'READY'
            : activeRetrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
              ? 'EMERGENCY_COVER'
              : 'NOT_READY',
          setWeekNumber: activeRetrainingPlan.setWeekNumber,
          estimatedWeeksRemaining: Math.max(
            0,
            Math.ceil((100 - activeRetrainingPlan.progressPct) / Math.max(1, activeRetrainingPlan.weeklyProgressPct))
          ),
          sourceEventId: activeRetrainingPlan.sourceEventId,
          summary: activeRetrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
            ? `${player.fullName} can now be used as emergency cover at ${activeRetrainingPlan.targetPosition} while retraining continues.`
            : `${player.fullName} is retraining from ${activeRetrainingPlan.currentPosition} toward ${activeRetrainingPlan.targetPosition}.`
        }
        : null,
      pendingContractTalk: pendingContractTalk
        ? {
          ...pendingContractTalk,
          deadline: pendingContractTalk.deadline.toISOString()
        }
        : null,
      playingTimePromise,
      developmentPlan,
      recentHistory
    };
  }

  public async getFinances(careerId: string) {
    const career = await this.requireCareer(careerId);
    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22);

    const [club, clubState, wageRows, weekPlan] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          name: true,
          balance: true,
          transferBudget: true,
          wageBudget: true,
          financialStatus: true
        }
      }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId,
            clubId: career.controlledClubId
          }
        }
      }),
      this.prisma.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: { weeklyWage: true }
      }),
      this.prisma.v2WeekPlan.findUnique({
        where: {
          careerId_weekNumber: {
            careerId,
            weekNumber: career.weekNumber
          }
        }
      })
    ]);
    const clubOperations = buildClubOperationsFinanceSummary(
      await this.getClubOperationsLevels(career.id, this.prisma)
    );

    const weeklyWageBill = wageRows.reduce((sum, player) => sum + (player.weeklyWage ?? 0), 0);
    const annualWageProjection = weeklyWageBill * 52;

    const baseBalance = club?.balance ?? 0;
    const v2BudgetDelta = clubState?.budgetBalance ?? 0;
    const operatingBalance = baseBalance + v2BudgetDelta;
    const boardConfidence = clubState?.boardConfidence ?? 50;
    const planEffects = weekPlan
      ? deriveStrategicPlanEffects(
        {
          trainingFocus: weekPlan.trainingFocus,
          rotationIntensity: weekPlan.rotationIntensity,
          tacticalMentality: weekPlan.tacticalMentality,
          transferStance: weekPlan.transferStance,
          scoutingPriority: weekPlan.scoutingPriority
        },
        {
          operatingBalance,
          boardConfidence
        }
      )
      : null;
    const fallbackClubName = `Club #${career.controlledClubId}`;

    return {
      clubId: club?.id ?? career.controlledClubId,
      clubName: club?.name ?? fallbackClubName,
      financialStatus: club?.financialStatus ?? 50,
      baseBalance,
      v2BudgetDelta,
      operatingBalance,
      transferBudget: club?.transferBudget ?? 0,
      wageBudget: club?.wageBudget ?? 0,
      weeklyWageBill,
      annualWageProjection,
      boardConfidence,
      morale: clubState?.morale ?? 50,
      fitnessTrend: clubState?.fitnessTrend ?? 0,
      boardRiskLevel: this.getBoardRiskLevel(boardConfidence),
      plannedStrategyDelta: planEffects?.budgetDelta ?? 0,
      clubOperations,
      activeWeekPlan: weekPlan
        ? {
          transferStance: weekPlan.transferStance,
          scoutingPriority: weekPlan.scoutingPriority,
          tacticalMentality: weekPlan.tacticalMentality,
          rotationIntensity: weekPlan.rotationIntensity,
          trainingFocus: weekPlan.trainingFocus
        }
        : null
    };
  }

  public async upgradeClubOperation(careerId: string, operationKeyInput: string) {
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'upgrade club operations');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Club operations cannot be changed during live matches.');
    }

    const operationKey = normalizeClubOperationKey(operationKeyInput);
    if (!operationKey) {
      throw new Error('Invalid club operation selection.');
    }

    const levels = await this.getClubOperationsLevels(career.id, this.prisma);
    const previousLevel = levels[operationKey];
    const upgradeCost = getClubOperationUpgradeCost(operationKey, previousLevel);
    if (upgradeCost === null) {
      throw new Error(`${getClubOperationLabel(operationKey)} is already at the maximum level.`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const [club, clubState] = await Promise.all([
        tx.club.findUnique({
          where: { id: career.controlledClubId },
          select: {
            id: true,
            balance: true
          }
        }),
        tx.v2ClubState.upsert({
          where: {
            careerId_clubId: {
              careerId: career.id,
              clubId: career.controlledClubId
            }
          },
          create: {
            id: `${career.id}:cs:${career.controlledClubId}`,
            careerId: career.id,
            clubId: career.controlledClubId,
            morale: 55,
            fitnessTrend: 0,
            boardConfidence: 55,
            budgetBalance: 0,
            injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
            form: 'NNNNN'
          },
          update: {}
        })
      ]);

      if (!club) {
        throw new Error('Controlled club not found.');
      }

      const operatingBalance = (club.balance ?? 0) + clubState.budgetBalance;
      if (upgradeCost > operatingBalance) {
        throw new Error(`Insufficient operating balance for the ${getClubOperationLabel(operationKey)} upgrade.`);
      }

      const nextLevels: ClubOperationsLevels = {
        ...levels,
        [operationKey]: previousLevel + 1
      };
      const boardDelta = operationKey === 'COMMERCIAL_TEAM' ? 0 : 1;

      await this.applyClubEffects(tx, career.id, career.controlledClubId, {
        budgetDelta: -upgradeCost,
        boardDelta
      });

      await this.writeAudit(tx, career.id, 'CLUB_OPERATIONS', `Upgraded ${getClubOperationLabel(operationKey)} to level ${previousLevel + 1}.`, {
        source: 'CLUB_OPERATIONS_UPGRADE',
        operationKey,
        operationLabel: getClubOperationLabel(operationKey),
        previousLevel,
        newLevel: previousLevel + 1,
        upgradeCost,
        weekNumber: career.weekNumber,
        levels: nextLevels
      });

      const updatedClubState = await tx.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        select: {
          budgetBalance: true,
          boardConfidence: true
        }
      });

      return {
        operationKey,
        operationLabel: getClubOperationLabel(operationKey),
        previousLevel,
        newLevel: previousLevel + 1,
        upgradeCost,
        operatingBalanceAfter: (club.balance ?? 0) + Number(updatedClubState?.budgetBalance ?? 0),
        boardConfidenceAfter: Number(updatedClubState?.boardConfidence ?? 50),
        clubOperations: buildClubOperationsFinanceSummary(nextLevels),
        note: `${getClubOperationLabel(operationKey)} upgraded to level ${previousLevel + 1}.`
      };
    });

    return result;
  }

  public async getTransferMarket(
    careerId: string,
    options?: {
      limit?: number;
      position?: string;
      affordableOnly?: boolean;
    }
  ) {
    const career = await this.requireCareer(careerId);
    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22);
    await this.ensureControlledClubContracts(career, career.controlledClubId);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId);

    const [club, clubState, weekPlan, squad] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          balance: true,
          transferBudget: true,
          leagueId: true
        }
      }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId,
            clubId: career.controlledClubId
          }
        },
        select: {
          budgetBalance: true
        }
      }),
      this.prisma.v2WeekPlan.findUnique({
        where: {
          careerId_weekNumber: {
            careerId,
            weekNumber: career.weekNumber
          }
        },
        select: {
          scoutingPriority: true
        }
      }),
      this.prisma.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dateOfBirth: true,
          age: true,
          position: true,
          currentAbility: true,
          potentialAbility: true,
          weeklyWage: true,
          value: true,
          contractEnd: true
        }
      })
    ]);
    const league = (career.activeLeagueId ?? club?.leagueId)
      ? await this.prisma.league.findUnique({
        where: { id: career.activeLeagueId ?? club?.leagueId ?? -1 },
        select: { tier: true }
      })
      : null;

    const scoutingPriority = weekPlan?.scoutingPriority ?? 'NATIONAL';
    const limit = clamp(Math.floor(options?.limit ?? 24), 5, 80);
    const requestedPosition = (options?.position ?? '').trim().toUpperCase();
    const positionFilter = requestedPosition && requestedPosition !== 'ALL' ? requestedPosition : null;
    const affordableOnly = Boolean(options?.affordableOnly);
    const competitionWindows = await this.resolveCompetitionWindowSnapshot(career, this.prisma);

    const controlledTier = league?.tier ?? 10;
    const operatingBalance = (club?.balance ?? 0) + (clubState?.budgetBalance ?? 0);
    const transferHeadroom = (club?.transferBudget ?? 0) + Math.max(0, clubState?.budgetBalance ?? 0);
    const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));

    const positionDemand = new Map<string, { count: number; avgAbility: number }>();
    for (const player of squad) {
      const key = player.position?.toUpperCase() || 'UNK';
      const current = positionDemand.get(key) ?? { count: 0, avgAbility: 0 };
      const ability = player.currentAbility ?? 60;
      const nextCount = current.count + 1;
      positionDemand.set(key, {
        count: nextCount,
        avgAbility: ((current.avgAbility * current.count) + ability) / nextCount
      });
    }

    const scoutingTag = this.resolveTransferScoutingTag(scoutingPriority);
    let candidates = await this.fetchTransferMarketCandidates(
      career,
      controlledTier,
      scoutingTag,
      positionFilter
    );
    let shortlist = this.buildTransferMarketShortlist(
      candidates,
      career,
      controlledTier,
      availableBudget,
      positionDemand,
      scoutingTag,
      affordableOnly
    );

    if (shortlist.length === 0) {
      await this.seedTransferMarketPool(
        career,
        controlledTier,
        scoutingTag,
        positionFilter,
        Math.max(limit * 4, 48)
      );
      candidates = await this.fetchTransferMarketCandidates(
        career,
        controlledTier,
        scoutingTag,
        positionFilter
      );
      shortlist = this.buildTransferMarketShortlist(
        candidates,
        career,
        controlledTier,
        availableBudget,
        positionDemand,
        scoutingTag,
        affordableOnly
      );
    }

    const [shortlistMap, scoutingReports, activeNegotiationMap, incomingLoans] = await Promise.all([
      this.getActiveTransferShortlistMap(career.id, this.prisma),
      this.getTransferScoutingReportMap(career.id, this.prisma),
      this.getActiveTransferNegotiationMap(career.id, this.prisma),
      this.getActiveIncomingLoanSummaries(career, this.prisma)
    ]);

    const activeNegotiationByPlayer = new Map<number, TransferNegotiationSummary>();
    const activeNegotiations = Array.from(activeNegotiationMap.values())
      .filter((negotiation) => negotiation.status === 'ACTIVE')
      .sort((left, right) =>
        left.deadlineWeekNumber - right.deadlineWeekNumber ||
        left.playerName.localeCompare(right.playerName)
      );

    for (const negotiation of activeNegotiations) {
      if (!activeNegotiationByPlayer.has(negotiation.playerId)) {
        activeNegotiationByPlayer.set(negotiation.playerId, negotiation);
      }
    }

    const enrichedTargets = shortlist.map((target) => {
      const scoutingReport = scoutingReports.get(target.playerId) ?? null;
      const activeNegotiation = activeNegotiationByPlayer.get(target.playerId) ?? null;
      const agentPressure = scoutingReport?.agentPressure ?? this.resolveTransferAgentPressure({
        currentAbility: target.currentAbility,
        potentialAbility: target.potentialAbility,
        age: target.age,
        scoutingTag
      });
      const sellerStance = scoutingReport?.sellerStance ?? this.resolveTransferSellerStance({
        askingFee: target.askingFee,
        marketValue: target.marketValue,
        currentAbility: target.currentAbility,
        sellerTier: target.sellerTier,
        controlledTier
      });

      return {
        ...target,
        isShortlisted: shortlistMap.has(target.playerId),
        scoutingReport,
        activeNegotiationId: activeNegotiation?.negotiationId ?? null,
        agentPressure,
        sellerStance
      };
    });

    const activeLoanPlayerIds = new Set<number>(incomingLoans.map((loan) => loan.playerId));

    const averageSquadAbility = squad.length > 0
      ? squad.reduce((sum, player) => sum + (player.currentAbility ?? 60), 0) / squad.length
      : 60;
    const outgoingTargets: TransferOutgoingTarget[] = squad
      .filter((player) => !activeLoanPlayerIds.has(player.id))
      .map((player) => {
        const estimatedFee = this.estimateOutgoingTransferFee(
          {
            playerId: player.id,
            marketValue: player.value,
            currentAbility: player.currentAbility,
            contractEnd: player.contractEnd,
            buyerTier: controlledTier
          },
          {
            careerId: career.id,
            weekNumber: career.weekNumber,
            controlledTier
          }
        );
        const weeklyWage = Math.max(450, Math.round(player.weeklyWage ?? 0));
        const netBudgetSwing = estimatedFee + Math.round(weeklyWage * 8);
        const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
        const ability = player.currentAbility ?? 60;
        const recommended = (
          squad.length > 24 && ability <= averageSquadAbility - 4
        ) || (
          age !== null && age >= 32 && ability <= averageSquadAbility + 2
        );

        return {
          playerId: player.id,
          fullName: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(),
          age,
          position: player.position,
          currentAbility: player.currentAbility,
          potentialAbility: player.potentialAbility,
          marketValue: Math.round(player.value ?? Math.max(50000, ability * 47000)),
          weeklyWage,
          estimatedFee,
          netBudgetSwing,
          recommended
        };
      })
      .sort((left, right) => {
        if (left.recommended !== right.recommended) {
          return left.recommended ? -1 : 1;
        }
        return right.estimatedFee - left.estimatedFee || (right.currentAbility ?? 0) - (left.currentAbility ?? 0);
      });

    const shortlistedTargets = enrichedTargets
      .filter((target) => target.isShortlisted)
      .sort((left, right) => {
        const leftNegotiation = left.activeNegotiationId ? 1 : 0;
        const rightNegotiation = right.activeNegotiationId ? 1 : 0;
        if (leftNegotiation !== rightNegotiation) {
          return rightNegotiation - leftNegotiation;
        }
        return right.fitScore - left.fitScore || left.fullName.localeCompare(right.fullName);
      });

    return {
      scoutingTag,
      positionFilter,
      affordableOnly,
      seasonPhase: competitionWindows.seasonPhase,
      transferWindow: competitionWindows.transferWindow,
      availableBudget,
      shortlistCount: shortlistedTargets.length,
      targets: enrichedTargets.slice(0, limit),
      shortlistedTargets,
      activeNegotiations,
      incomingLoans,
      outgoingTargets: outgoingTargets.slice(0, Math.max(limit, 24))
    };
  }

  public async signTransferTarget(careerId: string, playerId: number) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'sign transfer targets');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Transfers are blocked during live matches.');
    }
    await this.assertTransferWindowOpen(career, this.prisma);

    const deal = await this.prisma.$transaction(async (tx) => {
      await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22, tx);
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

      const [club, currentLeague, weekPlan, existingSquadCount, player] = await Promise.all([
        tx.club.findUnique({
          where: { id: career.controlledClubId },
          select: {
            id: true,
            name: true,
            balance: true,
            transferBudget: true
          }
        }),
        tx.league.findUnique({
          where: { id: career.activeLeagueId ?? -1 },
          select: { tier: true }
        }),
        tx.v2WeekPlan.findUnique({
          where: {
            careerId_weekNumber: {
              careerId,
              weekNumber: career.weekNumber
            }
          },
          select: { transferStance: true, scoutingPriority: true }
        }),
        tx.player.count({
          where: { currentClubId: career.controlledClubId }
        }),
        tx.player.findUnique({
          where: { id: playerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            position: true,
            currentAbility: true,
            potentialAbility: true,
            weeklyWage: true,
            value: true,
            contractEnd: true,
            currentClubId: true,
            currentClub: {
              select: {
                id: true,
                name: true,
                league: { select: { tier: true } }
              }
            }
          }
        })
      ]);

      if (!club) {
        throw new Error('Controlled club not found.');
      }
      if (!player || !player.currentClubId || !player.currentClub) {
        throw new Error('Transfer target not found.');
      }
      if (player.currentClubId === career.controlledClubId) {
        throw new Error('Player already belongs to your club.');
      }
      if (existingSquadCount >= 38) {
        throw new Error('Squad is full. Sell or release players before signing new ones.');
      }

      const clubState = await tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      });

      const controlledTier = currentLeague?.tier ?? 10;
      const transferFee = this.estimateTransferFee(
        {
          playerId: player.id,
          marketValue: player.value,
          currentAbility: player.currentAbility,
          contractEnd: player.contractEnd,
          sellerTier: player.currentClub.league?.tier ?? null
        },
        {
          careerId: career.id,
          weekNumber: career.weekNumber,
          controlledTier
        }
      );
      const offeredWage = this.estimateTransferWage(player.weeklyWage, player.id, career.id, career.weekNumber);
      const signingCost = transferFee + Math.round(offeredWage * 4);

      const operatingBalance = (club.balance ?? 0) + clubState.budgetBalance;
      const transferHeadroom = (club.transferBudget ?? 0) + Math.max(0, clubState.budgetBalance);
      const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));

      if (transferFee > transferHeadroom || signingCost > availableBudget) {
        throw new Error('Insufficient transfer budget for this deal.');
      }

      const contractStart = new Date(career.currentDate);
      const contractYears = this.resolveContractYearsFromStance(weekPlan?.transferStance ?? 'OPPORTUNISTIC');
      const contractEnd = new Date(contractStart);
      contractEnd.setFullYear(contractEnd.getFullYear() + contractYears);

      await tx.player.update({
        where: { id: player.id },
        data: {
          currentClubId: career.controlledClubId,
          contractStart,
          contractEnd,
          weeklyWage: offeredWage,
          value: Math.round(Math.max(player.value ?? transferFee * 0.95, transferFee * 1.05))
        }
      });

      const boardDelta = transferFee <= Math.round((player.value ?? transferFee) * 1.05) ? 1 : -1;
      const updatedClubState = await tx.v2ClubState.update({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        data: {
          budgetBalance: { decrement: signingCost },
          boardConfidence: clamp(clubState.boardConfidence + boardDelta, 0, 100),
          morale: clamp(clubState.morale + (boardDelta > 0 ? 1 : 0), 0, 100)
        }
      });

      await tx.v2PlayerState.upsert({
        where: {
          careerId_playerId: {
            careerId: career.id,
            playerId: player.id
          }
        },
        create: {
          id: `${career.id}:ps:${player.id}`,
          careerId: career.id,
          playerId: player.id,
          clubId: career.controlledClubId,
          morale: 60,
          fitness: 90,
          form: 55,
          isInjured: false,
          injuryWeeks: 0,
          isSuspended: false,
          developmentDelta: 1
        },
        update: {
          clubId: career.controlledClubId,
          morale: 60,
          fitness: 90,
          form: 55,
          isInjured: false,
          injuryWeeks: 0,
          isSuspended: false
        }
      });

      return {
        playerId: player.id,
        playerName: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(),
        position: player.position,
        fromClubId: player.currentClub.id,
        fromClubName: player.currentClub.name,
        transferFee,
        weeklyWage: offeredWage,
        signingCost,
        budgetAfter: (club.balance ?? 0) + updatedClubState.budgetBalance,
        boardConfidenceAfter: updatedClubState.boardConfidence,
        scoutingTag: this.resolveTransferScoutingTag(weekPlan?.scoutingPriority ?? 'NATIONAL')
      };
    });

    await this.addAudit(career.id, 'TRANSFER', `Signed ${deal.playerName} from ${deal.fromClubName}.`, {
      playerId: deal.playerId,
      transferFee: deal.transferFee,
      weeklyWage: deal.weeklyWage,
      signingCost: deal.signingCost,
      fromClubId: deal.fromClubId
    });

    return deal;
  }

  public async sellTransferTarget(careerId: string, playerId: number) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'sell squad players');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Transfers are blocked during live matches.');
    }
    await this.assertTransferWindowOpen(career, this.prisma);

    const sale = await this.prisma.$transaction(async (tx) => {
      await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 18, tx);
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

      const [club, weekPlan, squadCount, player, activeLoan] = await Promise.all([
        tx.club.findUnique({
          where: { id: career.controlledClubId },
          select: {
            id: true,
            name: true,
            balance: true,
            transferBudget: true,
            leagueId: true
          }
        }),
        tx.v2WeekPlan.findUnique({
          where: {
            careerId_weekNumber: {
              careerId,
              weekNumber: career.weekNumber
            }
          },
          select: {
            transferStance: true
          }
        }),
        tx.player.count({
          where: { currentClubId: career.controlledClubId }
        }),
        tx.player.findUnique({
          where: { id: playerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            currentClubId: true,
            position: true,
            currentAbility: true,
            weeklyWage: true,
            value: true,
            contractEnd: true
          }
        }),
        tx.loan.findFirst({
          where: {
            playerId,
            toClubId: career.controlledClubId,
            status: 'active'
          },
          select: { id: true }
        })
      ]);

      if (!club) {
        throw new Error('Controlled club not found.');
      }
      if (!player || player.currentClubId !== career.controlledClubId) {
        throw new Error('Only players from your current squad can be sold.');
      }
      if (activeLoan) {
        throw new Error('Loaned-in players must be purchased or returned before they can be sold.');
      }
      if (squadCount <= 18) {
        throw new Error('Squad depth too low. Keep at least 18 players.');
      }

      const league = (career.activeLeagueId ?? club.leagueId)
        ? await tx.league.findUnique({
          where: { id: career.activeLeagueId ?? club.leagueId ?? -1 },
          select: { tier: true }
        })
        : null;
      const controlledTier = league?.tier ?? 10;

      const clubState = await tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      });

      const buyerCandidates = await tx.club.findMany({
        where: {
          id: { not: career.controlledClubId },
          leagueId: { not: null },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          league: {
            select: {
              tier: true
            }
          }
        },
        take: 2000
      });

      if (buyerCandidates.length === 0) {
        throw new Error('No buyer clubs available for outgoing transfer.');
      }

      const tierCloseBuyers = buyerCandidates.filter(
        (candidate) => Math.abs((candidate.league?.tier ?? controlledTier) - controlledTier) <= 3
      );
      const buyerPool = tierCloseBuyers.length >= 10 ? tierCloseBuyers : buyerCandidates;
      const buyerRandom = mulberry32(stringToSeed(`${career.id}:${career.weekNumber}:sell:${player.id}`));
      const buyer = buyerPool[Math.floor(buyerRandom() * buyerPool.length)];

      const transferFee = this.estimateOutgoingTransferFee(
        {
          playerId: player.id,
          marketValue: player.value,
          currentAbility: player.currentAbility,
          contractEnd: player.contractEnd,
          buyerTier: buyer.league?.tier ?? controlledTier
        },
        {
          careerId: career.id,
          weekNumber: career.weekNumber,
          controlledTier
        }
      );

      const wageRelief = Math.max(0, Math.round((player.weeklyWage ?? 0) * 8));
      const budgetImpact = transferFee + wageRelief;

      const newContractStart = new Date(career.currentDate);
      const nextWage = Math.max(450, Math.round((player.weeklyWage ?? 900) * (0.92 + buyerRandom() * 0.12)));
      const nextValue = Math.round(Math.max(25000, transferFee * (0.9 + buyerRandom() * 0.15)));

      await tx.player.update({
        where: { id: player.id },
        data: {
          currentClubId: buyer.id,
          weeklyWage: nextWage,
          contractStart: newContractStart,
          value: nextValue
        }
      });

      let boardDelta = transferFee >= Math.round((player.value ?? transferFee) * 0.9) ? 2 : 0;
      if ((weekPlan?.transferStance ?? '').toUpperCase() === 'SELL_TO_BALANCE') {
        boardDelta += 1;
      }
      if ((player.currentAbility ?? 60) >= 83) {
        boardDelta -= 1;
      }

      const moraleDelta = (player.currentAbility ?? 60) >= 84 ? -2 : (player.currentAbility ?? 60) <= 68 ? 1 : 0;
      const updatedClubState = await tx.v2ClubState.update({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        data: {
          budgetBalance: { increment: budgetImpact },
          boardConfidence: clamp(clubState.boardConfidence + boardDelta, 0, 100),
          morale: clamp(clubState.morale + moraleDelta, 0, 100)
        }
      });

      await tx.v2PlayerState.deleteMany({
        where: {
          careerId: career.id,
          playerId: player.id
        }
      });

      return {
        playerId: player.id,
        playerName: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(),
        position: player.position,
        toClubId: buyer.id,
        toClubName: buyer.name,
        transferFee,
        wageRelief,
        budgetImpact,
        budgetAfter: (club.balance ?? 0) + updatedClubState.budgetBalance,
        boardConfidenceAfter: updatedClubState.boardConfidence
      };
    });

    await this.addAudit(career.id, 'TRANSFER', `Sold ${sale.playerName} to ${sale.toClubName}.`, {
      playerId: sale.playerId,
      transferFee: sale.transferFee,
      wageRelief: sale.wageRelief,
      budgetImpact: sale.budgetImpact,
      toClubId: sale.toClubId
    });

    return sale;
  }

  public async setTransferShortlistStatus(
    careerId: string,
    payload: { playerId: number; shortlisted?: boolean }
  ) {
    const playerId = Number(payload.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'manage the transfer shortlist');

    const target = await this.getTransferOfferContext(career, playerId, this.prisma);
    const shortlist = await this.getActiveTransferShortlistMap(career.id, this.prisma);
    const currentlyShortlisted = shortlist.has(playerId);
    const shortlisted = typeof payload.shortlisted === 'boolean'
      ? payload.shortlisted
      : !currentlyShortlisted;

    if (shortlisted !== currentlyShortlisted) {
      await this.addAudit(
        career.id,
        'TRANSFER_SHORTLIST',
        `${shortlisted ? 'Added' : 'Removed'} ${target.playerName} ${shortlisted ? 'to' : 'from'} the shortlist.`,
        {
          playerId,
          playerName: target.playerName,
          sellerClubId: target.target.sellerClubId,
          sellerClubName: target.target.sellerClubName,
          weekNumber: career.weekNumber,
          action: shortlisted ? 'ADD' : 'REMOVE'
        }
      );
    }

    return {
      playerId,
      playerName: target.playerName,
      shortlisted,
      shortlistCount: shortlisted
        ? shortlist.size + (currentlyShortlisted ? 0 : 1)
        : Math.max(0, shortlist.size - (currentlyShortlisted ? 1 : 0)),
      note: shortlisted
        ? `${target.playerName} added to the shortlist.`
        : `${target.playerName} removed from the shortlist.`
    };
  }

  public async requestTransferScoutingReport(careerId: string, playerId: number) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'request scouting reports');
    const target = await this.getTransferOfferContext(career, playerId, this.prisma);
    const clubOperationsLevels = await this.getClubOperationsLevels(career.id, this.prisma);
    const report = this.buildTransferScoutingReport({
      career,
      target: target.target,
      controlledTier: target.controlledTier,
      availableBudget: target.availableBudget,
      clubOperationsLevels
    });

    await this.addAudit(career.id, 'TRANSFER_SCOUT', `Scouting report requested for ${target.playerName}.`, {
      playerId,
      playerName: target.playerName,
      report
    });

    return {
      playerId,
      playerName: target.playerName,
      report,
      note: `Scouting report filed for ${target.playerName}.`
    };
  }

  public async submitTransferOffer(
    careerId: string,
    payload: {
      playerId: number;
      kind: string;
      transferFee?: number;
      weeklyWage?: number;
      loanFee?: number;
      wageContributionPct?: number;
      buyOptionFee?: number;
      loanDurationWeeks?: number;
      sellOnPct?: number;
    }
  ) {
    const playerId = Number(payload.playerId);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const kind = String(payload.kind || 'PERMANENT').trim().toUpperCase() === 'LOAN'
      ? 'LOAN'
      : 'PERMANENT';
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'submit transfer offers');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Transfers are blocked during live matches.');
    }
    await this.assertTransferWindowOpen(career, this.prisma);

    const outcome = await this.prisma.$transaction(async (tx) => {
      const activeNegotiations = await this.getActiveTransferNegotiationMap(career.id, tx);
      const activeForPlayer = Array.from(activeNegotiations.values()).find((negotiation) => negotiation.playerId === playerId);
      if (activeForPlayer) {
        throw new Error('Resolve the current negotiation for this player before sending another offer.');
      }

      const context = await this.getTransferOfferContext(career, playerId, tx);
      const clubOperationsLevels = await this.getClubOperationsLevels(career.id, tx);
      const existingReport = (await this.getTransferScoutingReportMap(career.id, tx)).get(playerId) ?? null;
      const report = existingReport ?? this.buildTransferScoutingReport({
        career,
        target: context.target,
        controlledTier: context.controlledTier,
        availableBudget: context.availableBudget,
        clubOperationsLevels
      });
      const terms = this.normalizeTransferNegotiationTerms(kind, payload as unknown as Record<string, unknown>, context.target.weeklyWage);
      const immediateCost = kind === 'LOAN'
        ? Math.max(0, Math.round(Number(terms.loanFee ?? 0))) + Math.round(terms.weeklyWage * 4)
        : Math.max(0, Math.round(Number(terms.transferFee ?? 0))) + Math.round(terms.weeklyWage * 4);
      if (immediateCost > context.availableBudget) {
        throw new Error('Offer exceeds the currently available transfer budget.');
      }

      const evaluation = this.evaluateInitialTransferOffer(context, kind, terms, report);
      if (evaluation.outcome === 'ACCEPTED') {
        if (kind === 'LOAN') {
          const loanDeal = await this.finalizeIncomingLoanTx(tx, career, context, terms);
          await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Offer accepted for ${context.playerName}.`, {
            negotiation: {
              negotiationId: `${career.id}:neg:${playerId}:${career.weekNumber}:accepted`,
              playerId,
              playerName: context.playerName,
              position: context.player.position,
              sellerClubId: context.target.sellerClubId,
              sellerClubName: context.target.sellerClubName,
              kind,
              stage: 'INITIAL',
              status: 'ACCEPTED',
              agentPressure: report.agentPressure,
              sellerStance: report.sellerStance,
              requestedAtWeekNumber: career.weekNumber,
              deadlineWeekNumber: career.weekNumber,
              latestOffer: terms,
              counterOffer: null,
              note: evaluation.note,
              clauseSummary: this.buildTransferClauseSummary(terms, kind)
            }
          });

          return {
            outcome: 'ACCEPTED' as const,
            playerId,
            playerName: context.playerName,
            kind,
            note: evaluation.note,
            permanentDeal: null,
            loanDeal,
            negotiation: null
          };
        }

        const permanentDeal = await this.finalizePermanentTransferTx(tx, career, context, terms);
        await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Offer accepted for ${context.playerName}.`, {
          negotiation: {
            negotiationId: `${career.id}:neg:${playerId}:${career.weekNumber}:accepted`,
            playerId,
            playerName: context.playerName,
            position: context.player.position,
            sellerClubId: context.target.sellerClubId,
            sellerClubName: context.target.sellerClubName,
            kind,
            stage: 'INITIAL',
            status: 'ACCEPTED',
            agentPressure: report.agentPressure,
            sellerStance: report.sellerStance,
            requestedAtWeekNumber: career.weekNumber,
            deadlineWeekNumber: career.weekNumber,
            latestOffer: terms,
            counterOffer: null,
            note: evaluation.note,
            clauseSummary: this.buildTransferClauseSummary(terms, kind)
          }
        });

        return {
          outcome: 'ACCEPTED' as const,
          playerId,
          playerName: context.playerName,
          kind,
          note: evaluation.note,
          permanentDeal,
          loanDeal: null,
          negotiation: null
        };
      }

      if (evaluation.outcome === 'COUNTERED' && evaluation.counterTerms) {
        const negotiationId = `${career.id}:neg:${playerId}:${Date.now()}`;
        const negotiation: TransferNegotiationSummary = {
          negotiationId,
          playerId,
          playerName: context.playerName,
          position: context.player.position,
          sellerClubId: context.target.sellerClubId,
          sellerClubName: context.target.sellerClubName,
          kind,
          stage: 'COUNTERED',
          status: 'ACTIVE',
          agentPressure: report.agentPressure,
          sellerStance: report.sellerStance,
          requestedAtWeekNumber: career.weekNumber,
          deadlineWeekNumber: career.weekNumber + 1,
          latestOffer: terms,
          counterOffer: evaluation.counterTerms,
          note: evaluation.note,
          clauseSummary: this.buildTransferClauseSummary(evaluation.counterTerms, kind)
        };

        await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Counteroffer received for ${context.playerName}.`, {
          negotiation
        });

        return {
          outcome: 'COUNTERED' as const,
          playerId,
          playerName: context.playerName,
          kind,
          note: evaluation.note,
          permanentDeal: null,
          loanDeal: null,
          negotiation
        };
      }

      await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Offer rejected for ${context.playerName}.`, {
        negotiation: {
          negotiationId: `${career.id}:neg:${playerId}:${Date.now()}:rejected`,
          playerId,
          playerName: context.playerName,
          position: context.player.position,
          sellerClubId: context.target.sellerClubId,
          sellerClubName: context.target.sellerClubName,
          kind,
          stage: 'INITIAL',
          status: 'REJECTED',
          agentPressure: report.agentPressure,
          sellerStance: report.sellerStance,
          requestedAtWeekNumber: career.weekNumber,
          deadlineWeekNumber: career.weekNumber,
          latestOffer: terms,
          counterOffer: null,
          note: evaluation.note,
          clauseSummary: this.buildTransferClauseSummary(terms, kind)
        }
      });

      return {
        outcome: 'REJECTED' as const,
        playerId,
        playerName: context.playerName,
        kind,
        note: evaluation.note,
        permanentDeal: null,
        loanDeal: null,
        negotiation: null
      };
    });

    if (outcome.permanentDeal) {
      await this.addAudit(career.id, 'TRANSFER', `Signed ${outcome.permanentDeal.playerName} from ${outcome.permanentDeal.fromClubName}.`, {
        playerId: outcome.permanentDeal.playerId,
        transferFee: outcome.permanentDeal.transferFee,
        weeklyWage: outcome.permanentDeal.weeklyWage,
        signingCost: outcome.permanentDeal.signingCost,
        fromClubId: outcome.permanentDeal.fromClubId
      });
    }

    return outcome;
  }

  public async respondToTransferOffer(
    careerId: string,
    payload: {
      negotiationId: string;
      action: string;
      transferFee?: number;
      weeklyWage?: number;
      loanFee?: number;
      wageContributionPct?: number;
      buyOptionFee?: number;
      loanDurationWeeks?: number;
    }
  ) {
    const negotiationId = String(payload.negotiationId || '').trim();
    if (!negotiationId) {
      throw new Error('negotiationId is required.');
    }

    const action = String(payload.action || '').trim().toUpperCase();
    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'respond to transfer negotiations');
    if (action !== 'WITHDRAW') {
      await this.assertTransferWindowOpen(career, this.prisma);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const activeNegotiations = await this.getActiveTransferNegotiationMap(career.id, tx);
      const negotiation = activeNegotiations.get(negotiationId);
      if (!negotiation) {
        throw new Error('Active negotiation not found.');
      }

      if (action === 'WITHDRAW') {
        await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Negotiation withdrawn for ${negotiation.playerName}.`, {
          negotiation: {
            ...negotiation,
            status: 'WITHDRAWN',
            note: 'You withdrew from the negotiation.'
          }
        });
        return {
          outcome: 'WITHDRAWN' as const,
          playerId: negotiation.playerId,
          playerName: negotiation.playerName,
          kind: negotiation.kind,
          note: 'Negotiation withdrawn.',
          permanentDeal: null,
          loanDeal: null,
          negotiation: null
        };
      }

      if (action !== 'ACCEPT_COUNTER' && action !== 'REVISE') {
        throw new Error('Unsupported negotiation response action.');
      }

      const context = await this.getTransferOfferContext(career, negotiation.playerId, tx);
      const counterTerms = negotiation.counterOffer;
      if (!counterTerms) {
        throw new Error('Negotiation does not have a counteroffer to respond to.');
      }

      const responseTerms = action === 'ACCEPT_COUNTER'
        ? counterTerms
        : this.normalizeTransferNegotiationTerms(
          negotiation.kind,
          payload as unknown as Record<string, unknown>,
          context.target.weeklyWage
        );

      const immediateCost = negotiation.kind === 'LOAN'
        ? Math.max(0, Math.round(Number(responseTerms.loanFee ?? 0))) + Math.round(responseTerms.weeklyWage * 4)
        : Math.max(0, Math.round(Number(responseTerms.transferFee ?? 0))) + Math.round(responseTerms.weeklyWage * 4);
      if (immediateCost > context.availableBudget) {
        throw new Error('Revised offer exceeds the currently available transfer budget.');
      }

      const accepted = this.evaluateCounterResponse(negotiation.kind, responseTerms, counterTerms);
      if (!accepted.accepted) {
        await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Counteroffer broke down for ${negotiation.playerName}.`, {
          negotiation: {
            ...negotiation,
            status: 'REJECTED',
            latestOffer: responseTerms,
            note: accepted.note
          }
        });
        return {
          outcome: 'REJECTED' as const,
          playerId: negotiation.playerId,
          playerName: negotiation.playerName,
          kind: negotiation.kind,
          note: accepted.note,
          permanentDeal: null,
          loanDeal: null,
          negotiation: null
        };
      }

      if (negotiation.kind === 'LOAN') {
        const loanDeal = await this.finalizeIncomingLoanTx(tx, career, context, responseTerms);
        await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Counter accepted for ${negotiation.playerName}.`, {
          negotiation: {
            ...negotiation,
            status: 'ACCEPTED',
            latestOffer: responseTerms,
            note: accepted.note
          }
        });

        return {
          outcome: 'ACCEPTED' as const,
          playerId: negotiation.playerId,
          playerName: negotiation.playerName,
          kind: negotiation.kind,
          note: accepted.note,
          permanentDeal: null,
          loanDeal,
          negotiation: null
        };
      }

      const permanentDeal = await this.finalizePermanentTransferTx(tx, career, context, responseTerms);
      await this.writeAudit(tx, career.id, 'TRANSFER_NEGOTIATION', `Counter accepted for ${negotiation.playerName}.`, {
        negotiation: {
          ...negotiation,
          status: 'ACCEPTED',
          latestOffer: responseTerms,
          note: accepted.note
        }
      });

      return {
        outcome: 'ACCEPTED' as const,
        playerId: negotiation.playerId,
        playerName: negotiation.playerName,
        kind: negotiation.kind,
        note: accepted.note,
        permanentDeal,
        loanDeal: null,
        negotiation: null
      };
    });

    if (result.permanentDeal) {
      await this.addAudit(career.id, 'TRANSFER', `Signed ${result.permanentDeal.playerName} from ${result.permanentDeal.fromClubName}.`, {
        playerId: result.permanentDeal.playerId,
        transferFee: result.permanentDeal.transferFee,
        weeklyWage: result.permanentDeal.weeklyWage,
        signingCost: result.permanentDeal.signingCost,
        fromClubId: result.permanentDeal.fromClubId
      });
    }

    return result;
  }

  public async triggerIncomingLoanBuyOption(careerId: string, loanId: number) {
    if (!Number.isFinite(loanId) || loanId <= 0) {
      throw new Error('Valid loanId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'trigger loan buy options');
    await this.assertTransferWindowOpen(career, this.prisma);

    const result = await this.prisma.$transaction(async (tx) => {
      const [loan, loanAuditMap] = await Promise.all([
        tx.loan.findUnique({
          where: { id: loanId },
          select: {
            id: true,
            playerId: true,
            fromClubId: true,
            toClubId: true,
            status: true,
            player: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                position: true,
                weeklyWage: true,
                value: true
              }
            },
            fromClub: {
              select: {
                name: true
              }
            }
          }
        }),
        this.getTransferLoanAuditMap(career.id, tx)
      ]);

      if (!loan || loan.toClubId !== career.controlledClubId || loan.status !== 'active') {
        throw new Error('Active incoming loan not found.');
      }
      const loanMeta = loanAuditMap.get(loan.id);
      const buyOptionFee = Math.max(0, Math.round(Number(loanMeta?.buyOptionFee ?? 0)));
      if (buyOptionFee <= 0) {
        throw new Error('This loan does not include a buy option.');
      }

      const club = await tx.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          balance: true,
          transferBudget: true
        }
      });
      const clubState = await tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      });

      const operatingBalance = (club?.balance ?? 0) + clubState.budgetBalance;
      const transferHeadroom = (club?.transferBudget ?? 0) + Math.max(0, clubState.budgetBalance);
      const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));
      if (buyOptionFee > availableBudget) {
        throw new Error('Insufficient transfer budget to trigger the buy option.');
      }

      const contractStart = new Date(career.currentDate);
      const contractEnd = new Date(contractStart);
      contractEnd.setFullYear(contractEnd.getFullYear() + 3);
      const newWeeklyWage = Math.max(450, Math.round((loan.player.weeklyWage ?? 900) * 1.08));
      const updatedClubState = await tx.v2ClubState.update({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        data: {
          budgetBalance: { decrement: buyOptionFee },
          boardConfidence: clamp(clubState.boardConfidence + 1, 0, 100)
        }
      });

      await tx.player.update({
        where: { id: loan.playerId },
        data: {
          currentClubId: career.controlledClubId,
          weeklyWage: newWeeklyWage,
          contractStart,
          contractEnd,
          value: Math.round(Math.max(loan.player.value ?? buyOptionFee, buyOptionFee * 1.04))
        }
      });
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'purchased',
          endDate: contractStart
        }
      });
      await this.writeAudit(tx, career.id, 'TRANSFER_LOAN', `Triggered buy option for ${loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim()}.`, {
        loanId: loan.id,
        playerId: loan.playerId,
        playerName: loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim(),
        fromClubId: loan.fromClubId,
        fromClubName: loan.fromClub.name,
        action: 'PURCHASED',
        originalWeeklyWage: loanMeta?.originalWeeklyWage ?? Math.max(450, Math.round(loan.player.weeklyWage ?? 900)),
        wageContributionPct: loanMeta?.wageContributionPct ?? 100,
        buyOptionFee
      });

      return {
        loanId: loan.id,
        playerId: loan.playerId,
        playerName: loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim(),
        position: loan.player.position,
        buyOptionFee,
        weeklyWage: newWeeklyWage,
        budgetAfter: (club?.balance ?? 0) + updatedClubState.budgetBalance,
        boardConfidenceAfter: updatedClubState.boardConfidence
      };
    });

    await this.addAudit(career.id, 'TRANSFER', `Triggered the buy option for ${result.playerName}.`, {
      playerId: result.playerId,
      loanId: result.loanId,
      transferFee: result.buyOptionFee,
      weeklyWage: result.weeklyWage
    });

    return result;
  }

  private evaluateInitialTransferOffer(
    context: Awaited<ReturnType<V2GameService['getTransferOfferContext']>>,
    kind: TransferOfferKind,
    terms: TransferNegotiationTerms,
    report: TransferScoutingReport
  ): { outcome: 'ACCEPTED' | 'COUNTERED' | 'REJECTED'; note: string; counterTerms: TransferNegotiationTerms | null } {
    if (kind === 'LOAN') {
      const demandedLoanFee = Math.max(0, Math.round(report.recommendedLoanFee));
      const demandedContributionPct = clamp(report.recommendedWageContributionPct, 0, 100);
      const demandedBuyOptionFee = report.recommendedBuyOptionFee ?? null;
      const offeredLoanFee = Math.max(0, Math.round(Number(terms.loanFee ?? 0)));
      const offeredContributionPct = clamp(Math.round(Number(terms.wageContributionPct ?? 0)), 0, 100);
      const offeredBuyOptionFee = Number(terms.buyOptionFee ?? 0);

      const loanFeeRatio = demandedLoanFee > 0 ? offeredLoanFee / demandedLoanFee : 1;
      const contributionDelta = offeredContributionPct - demandedContributionPct;
      const buyOptionSatisfied = demandedBuyOptionFee === null || offeredBuyOptionFee >= demandedBuyOptionFee * 0.92;

      if (loanFeeRatio >= 0.92 && contributionDelta >= 0 && buyOptionSatisfied) {
        return {
          outcome: 'ACCEPTED',
          note: `${context.target.sellerClubName} accepted the loan structure for ${context.playerName}.`,
          counterTerms: null
        };
      }

      if (loanFeeRatio >= 0.72 && contributionDelta >= -15) {
        const counterTerms: TransferNegotiationTerms = {
          transferFee: null,
          weeklyWage: Math.max(0, Math.round(context.target.weeklyWage * (Math.max(demandedContributionPct, offeredContributionPct) / 100))),
          loanFee: Math.max(demandedLoanFee, Math.round((offeredLoanFee + demandedLoanFee) / 2)),
          wageContributionPct: Math.max(demandedContributionPct, Math.min(100, offeredContributionPct + 6)),
          buyOptionFee: demandedBuyOptionFee,
          sellOnPct: null,
          loanDurationWeeks: terms.loanDurationWeeks ?? 24
        };
        return {
          outcome: 'COUNTERED',
          note: `${context.target.sellerClubName} want a stronger loan package for ${context.playerName}, especially on wage coverage${demandedBuyOptionFee ? ' and buy-option structure' : ''}.`,
          counterTerms
        };
      }

      return {
        outcome: 'REJECTED',
        note: `${context.target.sellerClubName} rejected the loan offer for ${context.playerName}. The package was too far from their terms.`,
        counterTerms: null
      };
    }

    const demandedFee = Math.max(25000, Math.round(report.recommendedBidFee));
    const demandedWage = Math.max(450, Math.round(report.recommendedWeeklyWage));
    const offeredFee = Math.max(0, Math.round(Number(terms.transferFee ?? 0)));
    const offeredWage = Math.max(450, Math.round(terms.weeklyWage));
    const feeRatio = offeredFee / demandedFee;
    const wageRatio = offeredWage / demandedWage;

    if (feeRatio >= 0.97 && wageRatio >= 0.96) {
      return {
        outcome: 'ACCEPTED',
        note: `${context.target.sellerClubName} accepted the permanent offer for ${context.playerName}.`,
        counterTerms: null
      };
    }

    if (feeRatio >= 0.84 && wageRatio >= 0.88) {
      const counterTerms: TransferNegotiationTerms = {
        transferFee: Math.max(demandedFee, Math.round((offeredFee + demandedFee) / 2 / 1000) * 1000),
        weeklyWage: Math.max(demandedWage, Math.round((offeredWage + demandedWage) / 2)),
        loanFee: null,
        wageContributionPct: null,
        buyOptionFee: null,
        sellOnPct: null,
        loanDurationWeeks: null
      };
      return {
        outcome: 'COUNTERED',
        note: `${context.target.sellerClubName} are open to a deal for ${context.playerName}, but they want the fee and wage package moved closer to their demand.`,
        counterTerms
      };
    }

    return {
      outcome: 'REJECTED',
      note: `${context.target.sellerClubName} rejected the bid for ${context.playerName}. The package was well below their valuation.`,
      counterTerms: null
    };
  }

  private evaluateCounterResponse(
    kind: TransferOfferKind,
    offeredTerms: TransferNegotiationTerms,
    counterTerms: TransferNegotiationTerms
  ): { accepted: boolean; note: string } {
    if (kind === 'LOAN') {
      const loanAccepted = Math.max(0, Math.round(Number(offeredTerms.loanFee ?? 0))) >= Math.max(0, Math.round(Number(counterTerms.loanFee ?? 0)))
        && Math.round(Number(offeredTerms.wageContributionPct ?? 0)) >= Math.round(Number(counterTerms.wageContributionPct ?? 0))
        && (
          Number(counterTerms.buyOptionFee ?? 0) <= 0 ||
          Math.max(0, Math.round(Number(offeredTerms.buyOptionFee ?? 0))) >= Math.max(0, Math.round(Number(counterTerms.buyOptionFee ?? 0)))
        );
      return loanAccepted
        ? {
          accepted: true,
          note: 'The selling club accepted the revised loan package.'
        }
        : {
          accepted: false,
          note: 'The revised loan package still fell short of the counter terms, and talks collapsed.'
        };
    }

    const accepted = Math.max(0, Math.round(Number(offeredTerms.transferFee ?? 0))) >= Math.max(0, Math.round(Number(counterTerms.transferFee ?? 0)))
      && Math.round(offeredTerms.weeklyWage) >= Math.round(counterTerms.weeklyWage);
    return accepted
      ? {
        accepted: true,
        note: 'The counter terms were met and the permanent deal was approved.'
      }
      : {
        accepted: false,
        note: 'The revised package still fell short of the counter terms, and the player side walked away.'
      };
  }

  private async getTransferOfferContext(
    career: V2Career,
    playerId: number,
    tx: DbClient
  ) {
    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22, tx);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

    const [club, clubState, weekPlan, currentLeague, player] = await Promise.all([
      tx.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          name: true,
          balance: true,
          transferBudget: true,
          leagueId: true
        }
      }),
      tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      }),
      tx.v2WeekPlan.findUnique({
        where: {
          careerId_weekNumber: {
            careerId: career.id,
            weekNumber: career.weekNumber
          }
        },
        select: {
          transferStance: true,
          scoutingPriority: true
        }
      }),
      tx.league.findUnique({
        where: { id: career.activeLeagueId ?? -1 },
        select: { tier: true }
      }),
      tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dateOfBirth: true,
          age: true,
          position: true,
          currentAbility: true,
          potentialAbility: true,
          weeklyWage: true,
          value: true,
          contractEnd: true,
          currentClubId: true,
          currentClub: {
            select: {
              id: true,
              name: true,
              leagueId: true,
              league: {
                select: {
                  tier: true
                }
              }
            }
          }
        }
      })
    ]);

    if (!club) {
      throw new Error('Controlled club not found.');
    }
    if (!player || !player.currentClubId || !player.currentClub) {
      throw new Error('Transfer target not found.');
    }
    if (player.currentClubId === career.controlledClubId) {
      throw new Error('Player already belongs to your club.');
    }

    const controlledTier = currentLeague?.tier ?? 10;
    const askingFee = this.estimateTransferFee(
      {
        playerId: player.id,
        marketValue: player.value,
        currentAbility: player.currentAbility,
        contractEnd: player.contractEnd,
        sellerTier: player.currentClub.league?.tier ?? null
      },
      {
        careerId: career.id,
        weekNumber: career.weekNumber,
        controlledTier
      }
    );
    const weeklyWage = this.estimateTransferWage(player.weeklyWage, player.id, career.id, career.weekNumber);
    const operatingBalance = (club.balance ?? 0) + clubState.budgetBalance;
    const transferHeadroom = (club.transferBudget ?? 0) + Math.max(0, clubState.budgetBalance);
    const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));
    const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
    const scoutingTag = this.resolveTransferScoutingTag(weekPlan?.scoutingPriority ?? 'NATIONAL');
    const marketValue = Math.round(player.value ?? Math.max(80000, (player.currentAbility ?? 60) * 50000));
    const target: TransferMarketTarget = {
      playerId: player.id,
      fullName: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim(),
      age,
      position: player.position,
      currentAbility: player.currentAbility,
      potentialAbility: player.potentialAbility,
      marketValue,
      weeklyWage,
      sellerClubId: player.currentClub.id,
      sellerClubName: player.currentClub.name,
      sellerLeagueId: player.currentClub.leagueId ?? null,
      sellerTier: player.currentClub.league?.tier ?? null,
      askingFee,
      scoutingTag,
      fitScore: clamp(
        Math.round(50 + ((player.currentAbility ?? 60) - 62) * 0.9 + ((player.potentialAbility ?? 65) - 65) * 0.4),
        1,
        99
      ),
      isAffordable: askingFee <= availableBudget,
      budgetGap: Math.max(0, askingFee - availableBudget),
      isShortlisted: false,
      scoutingReport: null,
      activeNegotiationId: null,
      agentPressure: this.resolveTransferAgentPressure({
        currentAbility: player.currentAbility,
        potentialAbility: player.potentialAbility,
        age,
        scoutingTag
      }),
      sellerStance: this.resolveTransferSellerStance({
        askingFee,
        marketValue,
        currentAbility: player.currentAbility,
        sellerTier: player.currentClub.league?.tier ?? controlledTier,
        controlledTier
      })
    };

    return {
      club,
      clubState,
      weekPlan,
      controlledTier,
      availableBudget,
      transferHeadroom,
      player,
      playerName: target.fullName,
      target
    };
  }

  private normalizeTransferNegotiationTerms(
    kind: TransferOfferKind,
    payload: Record<string, unknown>,
    baseWeeklyWage: number
  ): TransferNegotiationTerms {
    if (kind === 'LOAN') {
      const wageContributionPct = clamp(Math.round(Number(payload.wageContributionPct ?? 70)), 0, 100);
      const weeklyWage = Math.max(0, Math.round(baseWeeklyWage * (wageContributionPct / 100)));
      return {
        transferFee: null,
        weeklyWage,
        loanFee: Math.max(0, Math.round(Number(payload.loanFee ?? 0))),
        wageContributionPct,
        buyOptionFee: Number.isFinite(Number(payload.buyOptionFee))
          ? Math.max(0, Math.round(Number(payload.buyOptionFee)))
          : null,
        sellOnPct: null,
        loanDurationWeeks: clamp(Math.round(Number(payload.loanDurationWeeks ?? 24)), 4, 52)
      };
    }

    return {
      transferFee: Math.max(0, Math.round(Number(payload.transferFee ?? 0))),
      weeklyWage: clamp(Math.round(Number(payload.weeklyWage ?? baseWeeklyWage)), 450, 500000),
      loanFee: null,
      wageContributionPct: null,
      buyOptionFee: null,
      sellOnPct: Number.isFinite(Number(payload.sellOnPct))
        ? clamp(Math.round(Number(payload.sellOnPct)), 0, 30)
        : null,
      loanDurationWeeks: null
    };
  }

  private async finalizePermanentTransferTx(
    tx: DbClient,
    career: V2Career,
    context: Awaited<ReturnType<V2GameService['getTransferOfferContext']>>,
    terms: TransferNegotiationTerms
  ) {
    const transferFee = Math.max(0, Math.round(Number(terms.transferFee ?? 0)));
    const weeklyWage = clamp(Math.round(terms.weeklyWage), 450, 500000);
    const signingCost = transferFee + Math.round(weeklyWage * 4);
    const operatingBalance = (context.club.balance ?? 0) + context.clubState.budgetBalance;
    const transferHeadroom = (context.club.transferBudget ?? 0) + Math.max(0, context.clubState.budgetBalance);
    const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));

    if (transferFee > transferHeadroom || signingCost > availableBudget) {
      throw new Error('Insufficient transfer budget for this deal.');
    }

    const contractStart = new Date(career.currentDate);
    const contractYears = this.resolveContractYearsFromStance(context.weekPlan?.transferStance ?? 'OPPORTUNISTIC');
    const contractEnd = new Date(contractStart);
    contractEnd.setFullYear(contractEnd.getFullYear() + contractYears);

    await tx.player.update({
      where: { id: context.player.id },
      data: {
        currentClubId: career.controlledClubId,
        contractStart,
        contractEnd,
        weeklyWage,
        value: Math.round(Math.max(context.player.value ?? transferFee * 0.95, transferFee * 1.03))
      }
    });

    const boardDelta = transferFee <= Math.round((context.player.value ?? transferFee) * 1.05) ? 1 : -1;
    const updatedClubState = await tx.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      data: {
        budgetBalance: { decrement: signingCost },
        boardConfidence: clamp(context.clubState.boardConfidence + boardDelta, 0, 100),
        morale: clamp(context.clubState.morale + (boardDelta > 0 ? 1 : 0), 0, 100)
      }
    });

    await tx.v2PlayerState.upsert({
      where: {
        careerId_playerId: {
          careerId: career.id,
          playerId: context.player.id
        }
      },
      create: {
        id: `${career.id}:ps:${context.player.id}`,
        careerId: career.id,
        playerId: context.player.id,
        clubId: career.controlledClubId,
        morale: 60,
        fitness: 90,
        form: 55,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false,
        developmentDelta: 1
      },
      update: {
        clubId: career.controlledClubId,
        morale: 60,
        fitness: 90,
        form: 55,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false
      }
    });

    return {
      playerId: context.player.id,
      playerName: context.playerName,
      position: context.player.position,
      fromClubId: context.target.sellerClubId,
      fromClubName: context.target.sellerClubName,
      transferFee,
      weeklyWage,
      signingCost,
      budgetAfter: (context.club.balance ?? 0) + updatedClubState.budgetBalance,
      boardConfidenceAfter: updatedClubState.boardConfidence,
      scoutingTag: context.target.scoutingTag
    };
  }

  private async finalizeIncomingLoanTx(
    tx: DbClient,
    career: V2Career,
    context: Awaited<ReturnType<V2GameService['getTransferOfferContext']>>,
    terms: TransferNegotiationTerms
  ) {
    const loanFee = Math.max(0, Math.round(Number(terms.loanFee ?? 0)));
    const weeklyWage = Math.max(0, Math.round(terms.weeklyWage));
    const signingCost = loanFee + Math.round(weeklyWage * 4);
    const operatingBalance = (context.club.balance ?? 0) + context.clubState.budgetBalance;
    const transferHeadroom = (context.club.transferBudget ?? 0) + Math.max(0, context.clubState.budgetBalance);
    const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));

    if (signingCost > availableBudget) {
      throw new Error('Insufficient transfer budget for this loan package.');
    }

    const startDate = new Date(career.currentDate);
    const endDate = addDays(startDate, (terms.loanDurationWeeks ?? 24) * 7);

    await tx.player.update({
      where: { id: context.player.id },
      data: {
        currentClubId: career.controlledClubId,
        contractStart: startDate,
        weeklyWage
      }
    });

    const loan = await tx.loan.create({
      data: {
        playerId: context.player.id,
        fromClubId: context.target.sellerClubId,
        toClubId: career.controlledClubId,
        startDate,
        endDate,
        status: 'active'
      }
    });

    const boardDelta = loanFee <= Math.round(context.target.askingFee * 0.15) ? 1 : 0;
    const updatedClubState = await tx.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      data: {
        budgetBalance: { decrement: signingCost },
        boardConfidence: clamp(context.clubState.boardConfidence + boardDelta, 0, 100)
      }
    });

    await tx.v2PlayerState.upsert({
      where: {
        careerId_playerId: {
          careerId: career.id,
          playerId: context.player.id
        }
      },
      create: {
        id: `${career.id}:ps:${context.player.id}`,
        careerId: career.id,
        playerId: context.player.id,
        clubId: career.controlledClubId,
        morale: 58,
        fitness: 88,
        form: 52,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false,
        developmentDelta: 2
      },
      update: {
        clubId: career.controlledClubId
      }
    });

    await this.writeAudit(tx, career.id, 'TRANSFER_LOAN', `Loaned in ${context.playerName} from ${context.target.sellerClubName}.`, {
      loanId: loan.id,
      playerId: context.player.id,
      playerName: context.playerName,
      fromClubId: context.target.sellerClubId,
      fromClubName: context.target.sellerClubName,
      action: 'START',
      originalWeeklyWage: Math.max(450, Math.round(context.player.weeklyWage ?? context.target.weeklyWage)),
      wageContributionPct: terms.wageContributionPct ?? 100,
      buyOptionFee: terms.buyOptionFee ?? null
    });

    return {
      loanId: loan.id,
      playerId: context.player.id,
      playerName: context.playerName,
      position: context.player.position,
      fromClubId: context.target.sellerClubId,
      fromClubName: context.target.sellerClubName,
      loanFee,
      weeklyWage,
      wageContributionPct: terms.wageContributionPct ?? 100,
      buyOptionFee: terms.buyOptionFee ?? null,
      budgetAfter: (context.club.balance ?? 0) + updatedClubState.budgetBalance,
      endDate: endDate.toISOString()
    };
  }

  private async processIncomingLoanReturnsAtWeekWrap(
    tx: DbClient,
    career: V2Career,
    nextReferenceDate: Date
  ) {
    const [activeLoans, loanAuditMap] = await Promise.all([
      tx.loan.findMany({
        where: {
          toClubId: career.controlledClubId,
          status: 'active'
        },
        select: {
          id: true,
          playerId: true,
          fromClubId: true,
          endDate: true,
          player: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true
            }
          },
          fromClub: {
            select: {
              name: true
            }
          }
        }
      }),
      this.getTransferLoanAuditMap(career.id, tx)
    ]);

    const returnedPlayerIds: number[] = [];
    for (const loan of activeLoans) {
      if (!loan.endDate || loan.endDate.getTime() > nextReferenceDate.getTime()) {
        continue;
      }
      const loanMeta = loanAuditMap.get(loan.id);
      await tx.player.update({
        where: { id: loan.playerId },
        data: {
          currentClubId: loan.fromClubId,
          weeklyWage: loanMeta?.originalWeeklyWage ?? undefined
        }
      });
      await tx.v2PlayerState.deleteMany({
        where: {
          careerId: career.id,
          playerId: loan.playerId
        }
      });
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'returned'
        }
      });
      await this.writeAudit(tx, career.id, 'TRANSFER_LOAN', `Loan for ${loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim()} ended and the player returned to ${loan.fromClub.name}.`, {
        loanId: loan.id,
        playerId: loan.playerId,
        playerName: loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim(),
        fromClubId: loan.fromClubId,
        fromClubName: loan.fromClub.name,
        action: 'RETURNED',
        originalWeeklyWage: loanMeta?.originalWeeklyWage ?? 900,
        wageContributionPct: loanMeta?.wageContributionPct ?? 100,
        buyOptionFee: loanMeta?.buyOptionFee ?? null
      });
      returnedPlayerIds.push(loan.playerId);
    }

    return {
      returnedCount: returnedPlayerIds.length,
      returnedPlayerIds
    };
  }

  private async renewSquadContractTx(
    tx: DbClient,
    career: V2Career,
    playerId: number,
    options: { years: number; wageAdjustmentPct: number }
  ) {
    const years = clamp(Math.round(options.years), 1, 5);
    const wageAdjustmentPct = clamp(options.wageAdjustmentPct, -10, 35);

    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 18, tx);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

    const [club, player, clubState] = await Promise.all([
      tx.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          balance: true,
          transferBudget: true
        }
      }),
      tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          currentClubId: true,
          weeklyWage: true,
          contractStart: true,
          contractEnd: true,
          currentAbility: true
        }
      }),
      tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      })
    ]);

    if (!club) {
      throw new Error('Controlled club not found.');
    }
    if (!player || player.currentClubId !== career.controlledClubId) {
      throw new Error('Only players from your current squad can be renewed.');
    }

    const currentWage = Math.max(450, Math.round(player.weeklyWage ?? 950));
    const nextWage = Math.max(450, Math.round(currentWage * (1 + wageAdjustmentPct / 100)));
    const wageDelta = nextWage - currentWage;
    const signingBonus = Math.round(Math.max(0, nextWage) * 3);
    const projectedCost = Math.max(0, Math.round(wageDelta * 12)) + signingBonus;

    const operatingBalance = (club.balance ?? 0) + clubState.budgetBalance;
    const transferHeadroom = (club.transferBudget ?? 0) + Math.max(0, clubState.budgetBalance);
    const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));
    if (projectedCost > availableBudget) {
      throw new Error('Insufficient budget to complete renewal at the requested terms.');
    }

    const nextContractStart = player.contractStart ?? new Date(career.currentDate);
    const extensionBase = player.contractEnd && player.contractEnd > career.currentDate
      ? new Date(player.contractEnd)
      : new Date(career.currentDate);
    extensionBase.setUTCFullYear(extensionBase.getUTCFullYear() + years);

    await tx.player.update({
      where: { id: player.id },
      data: {
        contractStart: nextContractStart,
        contractEnd: extensionBase,
        weeklyWage: nextWage,
        value: Math.round(Math.max(25000, (player.currentAbility ?? 60) * 52000))
      }
    });

    const boardDelta = projectedCost <= Math.round((player.currentAbility ?? 60) * 11000) ? 1 : -1;
    const updatedClubState = await tx.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      data: {
        budgetBalance: { decrement: projectedCost },
        boardConfidence: clamp(clubState.boardConfidence + boardDelta, 0, 100),
        morale: clamp(clubState.morale + 1, 0, 100)
      }
    });

    const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim();
    return {
      playerId: player.id,
      playerName,
      action: 'RENEW' as const,
      years,
      weeklyWage: nextWage,
      contractEnd: extensionBase.toISOString(),
      budgetImpact: -projectedCost,
      budgetAfter: (club.balance ?? 0) + updatedClubState.budgetBalance,
      boardConfidenceAfter: updatedClubState.boardConfidence
    };
  }

  private async releaseSquadPlayerTx(
    tx: DbClient,
    career: V2Career,
    playerId: number,
    options: { compensationWeeks: number }
  ) {
    const compensationWeeks = clamp(Math.round(options.compensationWeeks), 2, 26);

    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 18, tx);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

    const [club, player, clubState, squadCount] = await Promise.all([
      tx.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          balance: true,
          transferBudget: true
        }
      }),
      tx.player.findUnique({
        where: { id: playerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          currentClubId: true,
          weeklyWage: true,
          currentAbility: true
        }
      }),
      tx.v2ClubState.upsert({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        },
        create: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: 55,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        },
        update: {}
      }),
      tx.player.count({
        where: { currentClubId: career.controlledClubId }
      })
    ]);

    if (!club) {
      throw new Error('Controlled club not found.');
    }
    if (!player || player.currentClubId !== career.controlledClubId) {
      throw new Error('Only players from your current squad can be released.');
    }
    if (squadCount <= 18) {
      throw new Error('Squad depth too low. Keep at least 18 players.');
    }

    const weeklyWage = Math.max(450, Math.round(player.weeklyWage ?? 900));
    const compensationCost = Math.round(weeklyWage * compensationWeeks);
    const wageRelief = Math.round(weeklyWage * 10);
    const budgetImpact = wageRelief - compensationCost;

    await tx.player.update({
      where: { id: player.id },
      data: {
        currentClubId: null,
        contractEnd: new Date(career.currentDate),
        weeklyWage: Math.round(weeklyWage * 0.5),
        value: Math.round(Math.max(15000, (player.currentAbility ?? 60) * 32000))
      }
    });

    await tx.v2PlayerState.deleteMany({
      where: {
        careerId: career.id,
        playerId: player.id
      }
    });

    let boardDelta = -1;
    if ((player.currentAbility ?? 60) <= 68) {
      boardDelta += 2;
    }
    if (budgetImpact < 0) {
      boardDelta -= 1;
    }

    const updatedClubState = await tx.v2ClubState.update({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      data: {
        budgetBalance: { increment: budgetImpact },
        boardConfidence: clamp(clubState.boardConfidence + boardDelta, 0, 100),
        morale: clamp(clubState.morale - ((player.currentAbility ?? 60) >= 82 ? 2 : 0), 0, 100)
      }
    });

    const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim();
    return {
      playerId: player.id,
      playerName,
      action: 'RELEASE' as const,
      compensationWeeks,
      budgetImpact,
      budgetAfter: (club.balance ?? 0) + updatedClubState.budgetBalance,
      boardConfidenceAfter: updatedClubState.boardConfidence
    };
  }

  public async renewSquadContract(
    careerId: string,
    playerId: number,
    options?: { years?: number; wageAdjustmentPct?: number }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'renew contracts');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Contract actions are blocked during live matches.');
    }

    const years = clamp(Math.round(options?.years ?? 2), 1, 5);
    const wageAdjustmentPct = clamp(options?.wageAdjustmentPct ?? 6, -10, 35);

    const result = await this.prisma.$transaction(async (tx) =>
      this.renewSquadContractTx(tx, career, playerId, { years, wageAdjustmentPct })
    );

    await this.addAudit(career.id, 'CONTRACT', `Renewed ${result.playerName} for ${result.years} years.`, {
      playerId: result.playerId,
      years: result.years,
      weeklyWage: result.weeklyWage,
      budgetImpact: result.budgetImpact
    });

    return result;
  }

  public async releaseSquadPlayer(
    careerId: string,
    playerId: number,
    options?: { compensationWeeks?: number }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'release players');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Contract actions are blocked during live matches.');
    }

    const compensationWeeks = clamp(Math.round(options?.compensationWeeks ?? 8), 2, 26);
    const released = await this.prisma.$transaction(async (tx) =>
      this.releaseSquadPlayerTx(tx, career, playerId, { compensationWeeks })
    );

    await this.addAudit(career.id, 'CONTRACT', `Released ${released.playerName} from squad.`, {
      playerId: released.playerId,
      compensationWeeks: released.compensationWeeks,
      budgetImpact: released.budgetImpact
    });

    return released;
  }

  public async assignSquadRole(
    careerId: string,
    playerId: number,
    payload?: { roleAssignment?: string }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const normalizedRole = String(payload?.roleAssignment || '').trim().toUpperCase();
    if (!['STARTER', 'ROTATION', 'DEPTH'].includes(normalizedRole)) {
      throw new Error('roleAssignment must be one of STARTER, ROTATION, DEPTH.');
    }
    const roleAssignment = normalizedRole as SquadRoleAssignment;

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'assign squad roles');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Squad role changes are blocked during live matches.');
    }

    const profileBefore = await this.getSquadPlayerProfile(careerId, playerId);
    const previousRoleAssignment = profileBefore.squadContext.assignedRole ?? profileBefore.squadContext.recommendedAssignedRole;
    if (previousRoleAssignment === roleAssignment) {
      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        roleAssignment,
        previousRoleAssignment,
        moraleDelta: 0,
        boardDelta: 0,
        note: 'Squad role already set to the selected assignment.'
      };
    }

    const expectedRole = profileBefore.squadContext.recommendedAssignedRole;
    const roleWeight = { DEPTH: 0, ROTATION: 1, STARTER: 2 } as const;
    const delta = roleWeight[roleAssignment] - roleWeight[previousRoleAssignment];

    let moraleDelta = 0;
    if (delta >= 2) moraleDelta = 3;
    else if (delta === 1) moraleDelta = 2;
    else if (delta === -1) moraleDelta = -2;
    else if (delta <= -2) moraleDelta = -4;

    if (profileBefore.squadContext.roleTier === 'STAR' && roleAssignment !== 'STARTER') {
      moraleDelta -= 1;
    }
    if (profileBefore.squadContext.roleTier === 'PROSPECT' && roleAssignment === 'DEPTH') {
      moraleDelta -= 1;
    }
    if (profileBefore.squadContext.roleTier === 'PROSPECT' && roleAssignment === 'ROTATION') {
      moraleDelta += 1;
    }
    moraleDelta = clamp(moraleDelta, -6, 4);

    let boardDelta = 0;
    if (roleAssignment === expectedRole) {
      boardDelta += (profileBefore.squadContext.roleTier === 'STAR' || profileBefore.squadContext.roleTier === 'STARTER') ? 1 : 0;
    } else if (roleWeight[roleAssignment] < roleWeight[expectedRole]) {
      boardDelta -= (profileBefore.squadContext.roleTier === 'STAR' || profileBefore.squadContext.roleTier === 'STARTER') ? 2 : 1;
    } else if (roleWeight[roleAssignment] > roleWeight[expectedRole]) {
      boardDelta -= (profileBefore.squadContext.roleTier === 'DEPTH' ? 1 : 0);
    }
    if (profileBefore.contract.risk === 'CRITICAL' && roleAssignment === 'DEPTH' && roleWeight[expectedRole] >= roleWeight.ROTATION) {
      boardDelta -= 1;
    }
    boardDelta = clamp(boardDelta, -4, 2);

    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);
      await tx.v2PlayerState.updateMany({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId,
          playerId
        },
        data: {
          morale: { increment: moraleDelta },
          ...(profileBefore.squadContext.roleTier === 'PROSPECT' && roleAssignment !== 'DEPTH'
            ? { developmentDelta: { increment: 1 } }
            : {})
        }
      });

      await this.applyClubEffects(tx, career.id, career.controlledClubId, {
        boardDelta
      });
    });

    await this.addAudit(career.id, 'SQUAD_ROLE', `Updated squad role for ${profileBefore.fullName}.`, {
      source: 'SQUAD_ROLE_ASSIGNMENT',
      weekNumber: career.weekNumber,
      playerId,
      playerName: profileBefore.fullName,
      roleAssignment,
      previousRoleAssignment,
      expectedRole,
      moraleDelta,
      boardDelta,
      roleTier: profileBefore.squadContext.roleTier,
      contractRisk: profileBefore.contract.risk
    });

    const note = boardDelta < 0
      ? 'Role updated, but board expectation pressure increased due to the current hierarchy choice.'
      : moraleDelta < 0
        ? 'Role updated, but the player reacted negatively to the reduced status.'
        : 'Role updated successfully.';

    return {
      playerId: profileBefore.playerId,
      playerName: profileBefore.fullName,
      roleAssignment,
      previousRoleAssignment,
      expectedRole,
      moraleDelta,
      boardDelta,
      note
    };
  }

  public async setPlayerDevelopmentPlan(
    careerId: string,
    playerId: number,
    payload?: { focus?: string; target?: string }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const focus = (String(payload?.focus || '').trim().toUpperCase() || null) as DevelopmentPlanFocus | null;
    const target = (String(payload?.target || '').trim().toUpperCase() || null) as DevelopmentPlanTarget | null;
    const validFocuses: DevelopmentPlanFocus[] = ['TECHNICAL', 'PHYSICAL', 'TACTICAL', 'MENTAL'];
    const validTargets: DevelopmentPlanTarget[] = ['FIRST_TEAM_PUSH', 'MATCH_SHARPNESS', 'LONG_TERM_UPSIDE', 'INJURY_PREVENTION'];

    if (!focus || !validFocuses.includes(focus)) {
      throw new Error(`focus must be one of ${validFocuses.join(', ')}.`);
    }
    if (!target || !validTargets.includes(target)) {
      throw new Error(`target must be one of ${validTargets.join(', ')}.`);
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'set player development plans');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Development plan changes are blocked during live matches.');
    }

    const profileBefore = await this.getSquadPlayerProfile(careerId, playerId);
    const previousPlan = (await this.getActivePlayerDevelopmentPlanMap(career.id, this.prisma)).get(playerId) ?? null;

    if (previousPlan?.focus === focus && previousPlan?.target === target) {
      const projected = this.getDevelopmentPlanProjectedEffects({
        focus,
        target,
        age: Number(profileBefore.age ?? 24),
        isInjured: profileBefore.availability.isInjured,
        isSuspended: profileBefore.availability.isSuspended,
        roleTier: profileBefore.squadContext.roleTier
      });
      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        focus,
        target,
        previousFocus: previousPlan.focus,
        previousTarget: previousPlan.target,
        projectedEffects: projected,
        note: 'Development plan already set to the selected focus and target.'
      };
    }

    const projected = this.getDevelopmentPlanProjectedEffects({
      focus,
      target,
      age: Number(profileBefore.age ?? 24),
      isInjured: profileBefore.availability.isInjured,
      isSuspended: profileBefore.availability.isSuspended,
      roleTier: profileBefore.squadContext.roleTier
    });

    const immediateMoraleDelta = target === 'FIRST_TEAM_PUSH'
      ? 1
      : target === 'LONG_TERM_UPSIDE' && profileBefore.squadContext.roleTier === 'STAR'
        ? -1
        : 0;

    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);
      if (immediateMoraleDelta !== 0) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId
          },
          data: {
            morale: { increment: immediateMoraleDelta }
          }
        });
      }

      await this.writeAudit(tx, career.id, 'PLAYER_DEVELOPMENT_PLAN', `Updated development plan for ${profileBefore.fullName}.`, {
        source: 'PLAYER_DEVELOPMENT_PLAN_SET',
        planId: `${career.id}:devplan:${playerId}:${career.weekNumber}`,
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        focus,
        target,
        previousFocus: previousPlan?.focus ?? null,
        previousTarget: previousPlan?.target ?? null,
        sourceEventId: null,
        immediateMoraleDelta
      });
    });

    return {
      playerId: profileBefore.playerId,
      playerName: profileBefore.fullName,
      focus,
      target,
      previousFocus: previousPlan?.focus ?? null,
      previousTarget: previousPlan?.target ?? null,
      immediateMoraleDelta,
      projectedEffects: projected,
      note: immediateMoraleDelta > 0
        ? 'Development plan set. The player is encouraged by the new progression path.'
        : immediateMoraleDelta < 0
          ? 'Development plan set, but the player may prefer a more immediate match-focused role.'
        : 'Development plan set.'
    };
  }

  public async setPlayerMedicalPlan(
    careerId: string,
    playerId: number,
    payload?: { planCode?: string }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const normalizedPlanCode = String(payload?.planCode || '').trim().toUpperCase();
    const validActions = ['REHAB_CONSERVATIVE', 'PHASED_RETURN', 'RECOVERY_FOCUS', 'INJURY_PREVENTION', 'MATCH_SHARPNESS', 'CLEAR_PLAN'] as const;
    if (!validActions.includes(normalizedPlanCode as typeof validActions[number])) {
      throw new Error(`planCode must be one of ${validActions.join(', ')}.`);
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'set player medical plans');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Medical plan changes are blocked during live matches.');
    }

    const profileBefore = await this.getSquadPlayerProfile(careerId, playerId);
    const previousPlan = (await this.getActivePlayerMedicalPlanMap(career.id, career.weekNumber, this.prisma)).get(playerId) ?? null;

    if (normalizedPlanCode === 'CLEAR_PLAN') {
      if (!previousPlan) {
        return {
          playerId: profileBefore.playerId,
          playerName: profileBefore.fullName,
          action: 'CLEAR',
          planCode: null,
          previousPlanCode: null,
          expiresWeekNumber: null,
          immediateMoraleDelta: 0,
          immediateFitnessDelta: 0,
          immediateFormDelta: 0,
          workloadRisk: profileBefore.medical.workloadRisk,
          rehabStatus: profileBefore.medical.rehabStatus,
          availabilityRecommendation: profileBefore.medical.availabilityRecommendation,
          note: 'No active medical plan is set for this player.'
        };
      }

      await this.addAudit(career.id, 'PLAYER_MEDICAL_PLAN', `Cleared medical plan for ${profileBefore.fullName}.`, {
        source: 'PLAYER_MEDICAL_PLAN_CLEAR',
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        previousPlanCode: previousPlan.planCode,
        clearedPlanId: previousPlan.planId
      });

      const nextMedical = this.buildPlayerMedicalSnapshot({
        fitness: profileBefore.performance.fitness,
        form: profileBefore.performance.form,
        isInjured: profileBefore.availability.isInjured,
        injuryWeeks: profileBefore.availability.injuryWeeks,
        isSuspended: profileBefore.availability.isSuspended,
        roleTier: profileBefore.squadContext.roleTier,
        assignedRole: profileBefore.squadContext.assignedRole,
        activeDirective: profileBefore.availability.managerDirective
          ? {
            directiveId: profileBefore.availability.managerDirective.directiveId,
            playerId,
            playerName: profileBefore.fullName,
            directiveCode: profileBefore.availability.managerDirective.directiveCode,
            setWeekNumber: profileBefore.availability.managerDirective.setWeekNumber,
            expiresWeekNumber: profileBefore.availability.managerDirective.expiresWeekNumber,
            sourceAction: profileBefore.availability.managerDirective.sourceAction
          }
          : null,
        activeDevelopmentPlan: profileBefore.developmentPlan
          ? {
            planId: profileBefore.developmentPlan.planId,
            playerId,
            playerName: profileBefore.fullName,
            focus: profileBefore.developmentPlan.focus,
            target: profileBefore.developmentPlan.target,
            setWeekNumber: profileBefore.developmentPlan.setWeekNumber,
            sourceEventId: profileBefore.developmentPlan.sourceEventId
          }
          : null,
        activeMedicalPlan: null,
        currentWeekNumber: career.weekNumber
      });

      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: 'CLEAR',
        planCode: null,
        previousPlanCode: previousPlan.planCode,
        expiresWeekNumber: null,
        immediateMoraleDelta: 0,
        immediateFitnessDelta: 0,
        immediateFormDelta: 0,
        workloadRisk: nextMedical.workloadRisk,
        rehabStatus: nextMedical.rehabStatus,
        availabilityRecommendation: nextMedical.availabilityRecommendation,
        note: 'Medical plan cleared. Player returns to standard training and recovery handling.'
      };
    }

    const planCode = this.normalizeMedicalPlanCode(normalizedPlanCode);
    if (!planCode) {
      throw new Error('Invalid medical plan selection.');
    }

    const projectedEffects = this.getMedicalPlanProjectedEffects({
      planCode,
      isInjured: profileBefore.availability.isInjured,
      injuryWeeks: profileBefore.availability.injuryWeeks,
      fitness: profileBefore.performance.fitness
    });

    if (previousPlan?.planCode === planCode && previousPlan.expiresWeekNumber >= career.weekNumber) {
      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: 'SET',
        planCode,
        previousPlanCode: previousPlan.planCode,
        expiresWeekNumber: previousPlan.expiresWeekNumber,
        immediateMoraleDelta: 0,
        immediateFitnessDelta: 0,
        immediateFormDelta: 0,
        workloadRisk: profileBefore.medical.workloadRisk,
        rehabStatus: profileBefore.medical.rehabStatus,
        availabilityRecommendation: projectedEffects.availabilityRecommendation,
        projectedEffects,
        note: 'Medical plan already matches the selected program.'
      };
    }

    const immediateMoraleDelta: number = planCode === 'REHAB_CONSERVATIVE'
      ? (profileBefore.availability.isInjured ? 1 : 0)
      : planCode === 'RECOVERY_FOCUS'
        ? (profileBefore.performance.fitness < 76 ? 1 : 0)
        : planCode === 'MATCH_SHARPNESS'
          ? 1
          : 0;
    const immediateFitnessDelta: number = planCode === 'REHAB_CONSERVATIVE'
      ? 2
      : planCode === 'RECOVERY_FOCUS'
        ? 2
        : planCode === 'INJURY_PREVENTION'
          ? 1
          : planCode === 'PHASED_RETURN'
            ? 1
            : -1;
    const immediateFormDelta: number = planCode === 'MATCH_SHARPNESS'
      ? 1
      : planCode === 'PHASED_RETURN'
        ? 1
        : planCode === 'REHAB_CONSERVATIVE'
          ? -1
          : 0;
    const durationWeeks = this.getMedicalPlanDurationWeeks(planCode, profileBefore.availability.isInjured);
    const expiresWeekNumber = career.weekNumber + durationWeeks - 1;
    const planId = `${career.id}:medical:${playerId}:${career.weekNumber}:${planCode.toLowerCase()}`;

    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

      const playerStateUpdate: Prisma.V2PlayerStateUpdateManyMutationInput = {};
      if (immediateMoraleDelta !== 0) playerStateUpdate.morale = { increment: immediateMoraleDelta };
      if (immediateFitnessDelta !== 0) playerStateUpdate.fitness = { increment: immediateFitnessDelta };
      if (immediateFormDelta !== 0) playerStateUpdate.form = { increment: immediateFormDelta };

      if (Object.keys(playerStateUpdate).length > 0) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId
          },
          data: playerStateUpdate
        });
      }

      await this.writeAudit(tx, career.id, 'PLAYER_MEDICAL_PLAN', `Updated medical plan for ${profileBefore.fullName}.`, {
        source: 'PLAYER_MEDICAL_PLAN_SET',
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        planId,
        planCode,
        previousPlanCode: previousPlan?.planCode ?? null,
        setWeekNumber: career.weekNumber,
        expiresWeekNumber,
        sourceAction: 'SQUAD_PROFILE_MEDICAL_ACTION',
        immediateMoraleDelta,
        immediateFitnessDelta,
        immediateFormDelta,
        availabilityStatusBefore: profileBefore.availability.status
      });
    });

    const nextMedical = this.buildPlayerMedicalSnapshot({
      fitness: clamp(profileBefore.performance.fitness + immediateFitnessDelta, 40, 100),
      form: clamp(profileBefore.performance.form + immediateFormDelta, 0, 100),
      isInjured: profileBefore.availability.isInjured,
      injuryWeeks: profileBefore.availability.injuryWeeks,
      isSuspended: profileBefore.availability.isSuspended,
      roleTier: profileBefore.squadContext.roleTier,
      assignedRole: profileBefore.squadContext.assignedRole,
      activeDirective: profileBefore.availability.managerDirective
        ? {
          directiveId: profileBefore.availability.managerDirective.directiveId,
          playerId,
          playerName: profileBefore.fullName,
          directiveCode: profileBefore.availability.managerDirective.directiveCode,
          setWeekNumber: profileBefore.availability.managerDirective.setWeekNumber,
          expiresWeekNumber: profileBefore.availability.managerDirective.expiresWeekNumber,
          sourceAction: profileBefore.availability.managerDirective.sourceAction
        }
        : null,
      activeDevelopmentPlan: profileBefore.developmentPlan
        ? {
          planId: profileBefore.developmentPlan.planId,
          playerId,
          playerName: profileBefore.fullName,
          focus: profileBefore.developmentPlan.focus,
          target: profileBefore.developmentPlan.target,
          setWeekNumber: profileBefore.developmentPlan.setWeekNumber,
          sourceEventId: profileBefore.developmentPlan.sourceEventId
        }
        : null,
      activeMedicalPlan: {
        planId,
        playerId,
        playerName: profileBefore.fullName,
        planCode,
        setWeekNumber: career.weekNumber,
        expiresWeekNumber,
        sourceAction: 'SQUAD_PROFILE_MEDICAL_ACTION'
      },
      currentWeekNumber: career.weekNumber
    });

    return {
      playerId: profileBefore.playerId,
      playerName: profileBefore.fullName,
      action: 'SET',
      planCode,
      previousPlanCode: previousPlan?.planCode ?? null,
      expiresWeekNumber,
      immediateMoraleDelta,
      immediateFitnessDelta,
      immediateFormDelta,
      workloadRisk: nextMedical.workloadRisk,
      rehabStatus: nextMedical.rehabStatus,
      availabilityRecommendation: nextMedical.availabilityRecommendation,
      projectedEffects,
      note: this.getPlayerMedicalPlanSetNote(planCode, profileBefore.availability.isInjured, projectedEffects.availabilityRecommendation)
    };
  }

  public async setPlayerStatusDirective(
    careerId: string,
    playerId: number,
    payload?: { action?: string }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const normalizedAction = String(payload?.action || '').trim().toUpperCase();
    const validActions = ['REST_RECOVERY', 'LIMIT_MINUTES', 'DISCIPLINARY_NOTE', 'CLEAR_DIRECTIVE'] as const;
    if (!validActions.includes(normalizedAction as typeof validActions[number])) {
      throw new Error(`action must be one of ${validActions.join(', ')}.`);
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'set player status directives');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Player status actions are blocked during live matches.');
    }

    const profileBefore = await this.getSquadPlayerProfile(careerId, playerId);
    const activeDirective = (await this.getActivePlayerStatusDirectiveMap(career.id, career.weekNumber, this.prisma)).get(playerId) ?? null;

    if (normalizedAction === 'CLEAR_DIRECTIVE') {
      if (!activeDirective) {
        return {
          playerId: profileBefore.playerId,
          playerName: profileBefore.fullName,
          action: normalizedAction,
          directiveCode: null,
          previousDirectiveCode: null,
          moraleDelta: 0,
          fitnessDelta: 0,
          formDelta: 0,
          boardDelta: 0,
          expiresWeekNumber: null,
          note: 'No active manager directive is set for this player.'
        };
      }

      await this.addAudit(career.id, 'PLAYER_STATUS', `Cleared manager status directive for ${profileBefore.fullName}.`, {
        source: 'PLAYER_STATUS_CLEAR',
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        action: normalizedAction,
        clearedDirectiveId: activeDirective.directiveId,
        previousDirectiveCode: activeDirective.directiveCode
      });

      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: normalizedAction,
        directiveCode: null,
        previousDirectiveCode: activeDirective.directiveCode,
        moraleDelta: 0,
        fitnessDelta: 0,
        formDelta: 0,
        boardDelta: 0,
        expiresWeekNumber: null,
        note: 'Manager directive cleared. Player returns to default availability handling.'
      };
    }

    const directiveCode: PlayerStatusDirectiveCode = normalizedAction === 'LIMIT_MINUTES'
      ? 'LIMITED_MINUTES'
      : normalizedAction as PlayerStatusDirectiveCode;
    const previousDirectiveCode = activeDirective?.directiveCode ?? null;
    if (previousDirectiveCode === directiveCode && (activeDirective?.expiresWeekNumber ?? 0) >= career.weekNumber) {
      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: normalizedAction,
        directiveCode,
        previousDirectiveCode,
        moraleDelta: 0,
        fitnessDelta: 0,
        formDelta: 0,
        boardDelta: 0,
        expiresWeekNumber: activeDirective?.expiresWeekNumber ?? career.weekNumber,
        note: 'Manager directive already active for this player.'
      };
    }

    let moraleDelta = 0;
    let fitnessDelta = 0;
    let formDelta = 0;
    let boardDelta = 0;
    let note = 'Manager directive applied.';
    const expiresWeekNumber = career.weekNumber;

    if (directiveCode === 'REST_RECOVERY') {
      fitnessDelta = profileBefore.availability.isInjured ? 1 : 4;
      formDelta = -1;
      moraleDelta = profileBefore.squadContext.roleTier === 'STAR' ? 0 : 1;
      note = profileBefore.availability.isInjured || profileBefore.availability.isSuspended
        ? 'Recovery rest directive logged. The player is already unavailable, so this mainly adjusts conditioning emphasis.'
        : 'Recovery rest directive set for this week. Fitness should improve, but short-term sharpness may dip.';
    } else if (directiveCode === 'LIMITED_MINUTES') {
      fitnessDelta = profileBefore.availability.isInjured ? 1 : 2;
      formDelta = -1;
      moraleDelta = (profileBefore.squadContext.roleTier === 'STAR' || profileBefore.squadContext.roleTier === 'STARTER') ? -1 : 0;
      note = 'Limited-minutes directive set for this week. Workload is reduced to manage readiness.';
    } else if (directiveCode === 'DISCIPLINARY_NOTE') {
      moraleDelta = -3;
      formDelta = -1;
      boardDelta = 1;
      note = 'Disciplinary note recorded. Board appreciates control, but the player reacts negatively.';
    }

    moraleDelta = clamp(moraleDelta, -6, 4);
    fitnessDelta = clamp(fitnessDelta, -4, 6);
    formDelta = clamp(formDelta, -4, 2);
    boardDelta = clamp(boardDelta, -2, 2);

    const directiveId = `${career.id}:psd:${playerId}:${career.weekNumber}:${directiveCode.toLowerCase()}`;
    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);
      const playerStateUpdate: Prisma.V2PlayerStateUpdateManyMutationInput = {};
      if (moraleDelta !== 0) playerStateUpdate.morale = { increment: moraleDelta };
      if (fitnessDelta !== 0) playerStateUpdate.fitness = { increment: fitnessDelta };
      if (formDelta !== 0) playerStateUpdate.form = { increment: formDelta };

      if (Object.keys(playerStateUpdate).length > 0) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId
          },
          data: playerStateUpdate
        });
      }

      if (boardDelta !== 0) {
        await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta });
      }

      await this.writeAudit(tx, career.id, 'PLAYER_STATUS', `Updated player status directive for ${profileBefore.fullName}.`, {
        source: 'PLAYER_STATUS_SET',
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        directiveId,
        directiveCode,
        action: normalizedAction,
        previousDirectiveCode,
        setWeekNumber: career.weekNumber,
        expiresWeekNumber,
        sourceAction: 'SQUAD_PROFILE_STATUS_ACTION',
        moraleDelta,
        fitnessDelta,
        formDelta,
        boardDelta,
        availabilityStatusBefore: profileBefore.availability.status
      });
    });

    return {
      playerId: profileBefore.playerId,
      playerName: profileBefore.fullName,
      action: normalizedAction,
      directiveCode,
      previousDirectiveCode,
      moraleDelta,
      fitnessDelta,
      formDelta,
      boardDelta,
      expiresWeekNumber,
      note
    };
  }

  public async setPlayerRegistration(
    careerId: string,
    playerId: number,
    payload?: { action?: string }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const normalizedAction = String(payload?.action || '').trim().toUpperCase();
    if (normalizedAction !== 'REGISTER' && normalizedAction !== 'UNREGISTER') {
      throw new Error('action must be one of REGISTER, UNREGISTER.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'manage squad registration');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Registration changes are blocked during live matches.');
    }
    const competitionWindows = await this.resolveCompetitionWindowSnapshot(career, this.prisma);
    if (!competitionWindows.registrationWindow.isOpen) {
      throw new Error(`Registration window is closed. ${competitionWindows.registrationWindow.note}`);
    }

    const squad = await this.getSquad(careerId);
    const player = squad.find((row) => row.id === playerId);
    if (!player) {
      throw new Error('Player not found in current squad.');
    }

    const registrationSnapshot = await this.getSquadRegistrationSnapshot(
      career,
      squad.map((row) => ({
        id: row.id,
        firstName: '',
        lastName: '',
        fullName: row.fullName,
        position: row.position,
        dateOfBirth: null,
        age: row.age,
        currentAbility: row.currentAbility,
        potentialAbility: row.potentialAbility
      })),
      this.prisma
    );

    const isRegistered = registrationSnapshot.registeredPlayerIds.has(playerId);
    if (normalizedAction === 'REGISTER' && isRegistered) {
      return {
        playerId,
        playerName: player.fullName,
        action: normalizedAction as SquadRegistrationAction,
        isRegistered: true,
        registeredCount: registrationSnapshot.registeredCount,
        registrationLimit: registrationSnapshot.rules.registrationLimit,
        overageCount: registrationSnapshot.overageCount,
        overageLimit: registrationSnapshot.rules.overageLimit,
        moraleDelta: 0,
        boardDelta: 0,
        note: 'Player is already registered for the active competition.'
      };
    }
    if (normalizedAction === 'UNREGISTER' && !isRegistered) {
      return {
        playerId,
        playerName: player.fullName,
        action: normalizedAction as SquadRegistrationAction,
        isRegistered: false,
        registeredCount: registrationSnapshot.registeredCount,
        registrationLimit: registrationSnapshot.rules.registrationLimit,
        overageCount: registrationSnapshot.overageCount,
        overageLimit: registrationSnapshot.rules.overageLimit,
        moraleDelta: 0,
        boardDelta: 0,
        note: 'Player is already outside the active registration list.'
      };
    }

    const nextRegisteredPlayerIds = new Set<number>(registrationSnapshot.registeredPlayerIds);
    const playerAge = Number(player.age ?? 24);
    if (normalizedAction === 'REGISTER') {
      if (registrationSnapshot.registeredCount >= registrationSnapshot.rules.registrationLimit) {
        throw new Error(`Registration list is full (${registrationSnapshot.rules.registrationLimit}). Unregister another player first.`);
      }
      if (
        registrationSnapshot.rules.competitionCategory === 'O21'
        && playerAge > 21
        && (registrationSnapshot.rules.overageLimit ?? 0) > 0
        && registrationSnapshot.overageCount >= (registrationSnapshot.rules.overageLimit ?? 0)
      ) {
        throw new Error('No overage slot is available for this player in the current O21 competition.');
      }
      nextRegisteredPlayerIds.add(playerId);
    } else {
      if (registrationSnapshot.registeredCount <= registrationSnapshot.rules.minimumRegistered) {
        throw new Error(`Keep at least ${registrationSnapshot.rules.minimumRegistered} registered players available.`);
      }
      nextRegisteredPlayerIds.delete(playerId);
    }

    const nextOverageCount = registrationSnapshot.rules.competitionCategory === 'O21'
      ? Array.from(nextRegisteredPlayerIds).filter((id) => {
        const row = squad.find((candidate) => candidate.id === id);
        return Number(row?.age ?? 24) > 21;
      }).length
      : 0;
    const moraleDelta = normalizedAction === 'REGISTER' ? 1 : (Number(player.currentAbility ?? 60) >= 78 ? -1 : 0);
    const boardDelta = normalizedAction === 'UNREGISTER' && Number(player.currentAbility ?? 60) >= 82 ? -1 : 0;

    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);
      if (moraleDelta !== 0) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId
          },
          data: {
            morale: { increment: moraleDelta }
          }
        });
      }
      if (boardDelta !== 0) {
        await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta });
      }

      await this.writeAudit(tx, career.id, 'SQUAD_REGISTRATION', `${normalizedAction === 'REGISTER' ? 'Registered' : 'Unregistered'} ${player.fullName} for the active competition.`, {
        source: 'SQUAD_REGISTRATION_SET',
        action: normalizedAction,
        weekNumber: career.weekNumber,
        playerId,
        playerName: player.fullName,
        registrationLimit: registrationSnapshot.rules.registrationLimit,
        minimumRegistered: registrationSnapshot.rules.minimumRegistered,
        overageLimit: registrationSnapshot.rules.overageLimit,
        overageCount: nextOverageCount,
        registeredPlayerIds: Array.from(nextRegisteredPlayerIds).sort((a, b) => a - b),
        moraleDelta,
        boardDelta
      });
    });

    return {
      playerId,
      playerName: player.fullName,
      action: normalizedAction as SquadRegistrationAction,
      isRegistered: normalizedAction === 'REGISTER',
      registeredCount: nextRegisteredPlayerIds.size,
      registrationLimit: registrationSnapshot.rules.registrationLimit,
      overageCount: nextOverageCount,
      overageLimit: registrationSnapshot.rules.overageLimit,
      moraleDelta,
      boardDelta,
      note: normalizedAction === 'REGISTER'
        ? 'Player added to the active competition list.'
        : 'Player removed from the active competition list.'
    };
  }

  public async setPlayerRetrainingPlan(
    careerId: string,
    playerId: number,
    payload?: { targetPosition?: string | null }
  ) {
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw new Error('Valid playerId is required.');
    }

    const career = await this.requireCareer(careerId);
    this.assertCareerPlayable(career, 'set player retraining plans');
    if (career.currentPhase === V2_PHASES.MATCH) {
      throw new Error('Retraining changes are blocked during live matches.');
    }

    const profileBefore = await this.getSquadPlayerProfile(careerId, playerId);
    const currentPosition = this.normalizeRetrainablePosition(profileBefore.position);
    if (!currentPosition) {
      throw new Error('This player position cannot be managed through the retraining system.');
    }

    const activePlan = (await this.getActivePlayerRetrainingPlanMap(career.id, this.prisma)).get(playerId) ?? null;
    const rawTargetPosition = String(payload?.targetPosition || '').trim().toUpperCase();
    if (!rawTargetPosition) {
      if (!activePlan) {
        return {
          playerId: profileBefore.playerId,
          playerName: profileBefore.fullName,
          action: 'CLEAR' as const,
          currentPosition,
          effectivePosition: profileBefore.effectivePosition ?? profileBefore.position,
          targetPosition: null,
          progressPct: null,
          weeklyProgressPct: null,
          immediateMoraleDelta: 0,
          note: 'No active retraining plan to clear.'
        };
      }

      await this.addAudit(career.id, 'PLAYER_RETRAINING', `Cleared retraining plan for ${profileBefore.fullName}.`, {
        source: 'PLAYER_RETRAINING_CLEAR',
        playerId,
        playerName: profileBefore.fullName,
        currentPosition,
        targetPosition: activePlan.targetPosition,
        progressPct: activePlan.progressPct,
        weekNumber: career.weekNumber
      });

      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: 'CLEAR' as const,
        currentPosition,
        effectivePosition: profileBefore.position,
        targetPosition: null,
        progressPct: null,
        weeklyProgressPct: null,
        immediateMoraleDelta: 0,
        note: 'Retraining plan cleared.'
      };
    }

    const targetPosition = this.normalizeRetrainablePosition(rawTargetPosition);
    if (!targetPosition) {
      throw new Error(`targetPosition must be one of ${RETRAINABLE_POSITIONS.join(', ')}.`);
    }
    if (targetPosition === currentPosition) {
      throw new Error('Target position must differ from the player’s current natural position.');
    }
    if (activePlan?.targetPosition === targetPosition) {
      return {
        playerId: profileBefore.playerId,
        playerName: profileBefore.fullName,
        action: 'SET' as const,
        currentPosition,
        effectivePosition: activePlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS ? activePlan.targetPosition : profileBefore.position,
        targetPosition,
        progressPct: activePlan.progressPct,
        weeklyProgressPct: activePlan.weeklyProgressPct,
        immediateMoraleDelta: 0,
        note: 'Retraining plan already targets the selected position.'
      };
    }

    const weeklyProgressPct = this.computeWeeklyRetrainingProgressPct({
      currentPosition,
      targetPosition,
      age: Number(profileBefore.age ?? 24),
      roleTier: profileBefore.squadContext.roleTier
    });
    const immediateMoraleDelta = this.computeImmediateRetrainingMoraleDelta({
      currentPosition,
      targetPosition,
      roleTier: profileBefore.squadContext.roleTier
    });

    await this.prisma.$transaction(async (tx) => {
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);
      if (immediateMoraleDelta !== 0) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId
          },
          data: {
            morale: { increment: immediateMoraleDelta }
          }
        });
      }

      await this.writeAudit(tx, career.id, 'PLAYER_RETRAINING', `Updated retraining plan for ${profileBefore.fullName}.`, {
        source: 'PLAYER_RETRAINING_SET',
        planId: `${career.id}:retrain:${playerId}:${career.weekNumber}`,
        weekNumber: career.weekNumber,
        playerId,
        playerName: profileBefore.fullName,
        currentPosition,
        targetPosition,
        previousTargetPosition: activePlan?.targetPosition ?? null,
        progressPct: 0,
        weeklyProgressPct,
        immediateMoraleDelta
      });
    });

    return {
      playerId: profileBefore.playerId,
      playerName: profileBefore.fullName,
      action: 'SET' as const,
      currentPosition,
      effectivePosition: profileBefore.position,
      targetPosition,
      progressPct: 0,
      weeklyProgressPct,
      immediateMoraleDelta,
      note: immediateMoraleDelta < 0
        ? 'Retraining plan set. The player may need reassurance while adapting to the new role.'
        : 'Retraining plan set.'
    };
  }

  public async saveSlot(careerId: string, slotName: string) {
    await this.requireCareer(careerId);
    if (!slotName.trim()) {
      throw new Error('Slot name is required.');
    }

    const saveSlot = await this.persistSaveSlot(careerId, slotName.trim(), false);
    await this.addAudit(careerId, 'SAVE', `Manual save written to slot ${slotName}.`, {
      slotName
    });
    return saveSlot;
  }

  public async loadSlot(careerId: string, slotName: string) {
    await this.requireCareer(careerId);

    const slotId = `${careerId}:${slotName}`;
    const slot = await this.prisma.v2SaveSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      throw new Error('Save slot not found.');
    }

    const snapshot = normalizeSaveSnapshot(parseSaveSnapshot(String(slot.snapshot)));

    if (
      !snapshot.career ||
      typeof snapshot.career.currentDate !== 'string' ||
      typeof snapshot.career.currentPhase !== 'string' ||
      typeof snapshot.career.season !== 'string' ||
      !Number.isFinite(snapshot.career.weekNumber)
    ) {
      throw new Error('Save slot snapshot is malformed and cannot be loaded.');
    }

    const snapshotHash = hashJson(snapshot);
    const legacySnapshotHash = hashJsonLegacy(snapshot);
    if (slot.stateHash && slot.stateHash !== snapshotHash && slot.stateHash !== legacySnapshotHash) {
      throw new Error('Save slot integrity check failed. Snapshot hash mismatch.');
    }

    const toDate = (value: unknown) => {
      const parsed = new Date(String(value));
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.v2Career.update({
        where: { id: careerId },
        data: {
          currentDate: new Date(snapshot.career.currentDate),
          currentPhase: snapshot.career.currentPhase,
          season: snapshot.career.season,
          weekNumber: snapshot.career.weekNumber,
          activeLeagueId: snapshot.career.activeLeagueId
        }
      });

      await tx.v2ClubState.deleteMany({ where: { careerId } });
      if (snapshot.clubStates.length > 0) {
        for (const batch of chunked(snapshot.clubStates, 500)) {
          await tx.v2ClubState.createMany({
            data: batch.map((row) => ({
              id: String(row.id),
              careerId,
              clubId: Number(row.clubId),
              morale: Number(row.morale),
              fitnessTrend: Number(row.fitnessTrend),
              boardConfidence: Number(row.boardConfidence),
              budgetBalance: Number(row.budgetBalance),
              injuriesSummary: String(row.injuriesSummary),
              form: String(row.form),
              createdAt: toDate(row.createdAt),
              updatedAt: toDate(row.updatedAt)
            }))
          });
        }
      }

      await tx.v2LeagueState.deleteMany({ where: { careerId } });
      if (snapshot.leagueStates.length > 0) {
        for (const batch of chunked(snapshot.leagueStates, 500)) {
          await tx.v2LeagueState.createMany({
            data: batch.map((row) => ({
              id: String(row.id),
              careerId,
              leagueId: Number(row.leagueId),
              clubId: Number(row.clubId),
              position: Number(row.position),
              played: Number(row.played),
              won: Number(row.won),
              drawn: Number(row.drawn),
              lost: Number(row.lost),
              goalsFor: Number(row.goalsFor),
              goalsAgainst: Number(row.goalsAgainst),
              goalDifference: Number(row.goalDifference),
              points: Number(row.points),
              progressionStatus: String(row.progressionStatus),
              createdAt: toDate(row.createdAt),
              updatedAt: toDate(row.updatedAt)
            }))
          });
        }
      }

      await tx.v2PlayerState.deleteMany({ where: { careerId } });
      if (snapshot.playerStates.length > 0) {
        for (const batch of chunked(snapshot.playerStates, 500)) {
          await tx.v2PlayerState.createMany({
            data: batch.map((row) => ({
              id: String(row.id),
              careerId,
              playerId: Number(row.playerId),
              clubId: Number(row.clubId),
              morale: Number(row.morale),
              fitness: Number(row.fitness),
              form: Number(row.form),
              isInjured: Boolean(row.isInjured),
              injuryWeeks: Number(row.injuryWeeks),
              isSuspended: Boolean(row.isSuspended),
              developmentDelta: Number(row.developmentDelta),
              createdAt: toDate(row.createdAt),
              updatedAt: toDate(row.updatedAt)
            }))
          });
        }
      }

      await tx.v2Fixture.deleteMany({ where: { careerId } });
      if (snapshot.fixtures.length > 0) {
        for (const batch of chunked(snapshot.fixtures, 500)) {
          await tx.v2Fixture.createMany({
            data: batch.map((row) => ({
              id: String(row.id),
              careerId,
              leagueId: Number(row.leagueId),
              homeClubId: Number(row.homeClubId),
              awayClubId: Number(row.awayClubId),
              matchDate: new Date(String(row.matchDate)),
              weekNumber: Number(row.weekNumber),
              status: String(row.status),
              homeScore: row.homeScore === null ? null : Number(row.homeScore),
              awayScore: row.awayScore === null ? null : Number(row.awayScore),
              isUserClubFixture: Boolean(row.isUserClubFixture),
              createdAt: toDate(row.createdAt),
              updatedAt: toDate(row.updatedAt)
            }))
          });
        }
      }

      await tx.v2WeekPlan.deleteMany({ where: { careerId } });
      if (snapshot.weekPlans.length > 0) {
        await tx.v2WeekPlan.createMany({
          data: snapshot.weekPlans.map((row) => ({
            id: String(row.id),
            careerId,
            weekNumber: Number(row.weekNumber),
            trainingFocus: String(row.trainingFocus),
            rotationIntensity: String(row.rotationIntensity),
            tacticalMentality: String(row.tacticalMentality),
            transferStance: String(row.transferStance),
            scoutingPriority: String(row.scoutingPriority),
            submittedAt: toDate(row.submittedAt),
            createdAt: toDate(row.createdAt),
            updatedAt: toDate(row.updatedAt)
          }))
        });
      }

      await tx.v2EventDecision.deleteMany({ where: { careerId } });
      await tx.v2InboxEvent.deleteMany({ where: { careerId } });

      if (snapshot.inboxEvents.length > 0) {
        await tx.v2InboxEvent.createMany({
          data: snapshot.inboxEvents.map((row) => ({
            id: String(row.id),
            careerId,
            weekNumber: Number(row.weekNumber),
            title: String(row.title),
            description: String(row.description),
            urgency: String(row.urgency),
            options: String(row.options),
            deadline: toDate(row.deadline),
            status: String(row.status),
            autoResolved: Boolean(row.autoResolved),
            resolutionNote: row.resolutionNote ? String(row.resolutionNote) : null,
            resolvedAt: row.resolvedAt ? toDate(row.resolvedAt) : null,
            createdAt: toDate(row.createdAt),
            updatedAt: toDate(row.updatedAt)
          }))
        });
      }

      if (snapshot.eventDecisions.length > 0) {
        await tx.v2EventDecision.createMany({
          data: snapshot.eventDecisions.map((row) => ({
            id: String(row.id),
            eventId: String(row.eventId),
            careerId,
            optionId: String(row.optionId),
            optionLabel: String(row.optionLabel),
            effects: String(row.effects),
            decidedAt: toDate(row.decidedAt),
            createdAt: toDate(row.createdAt)
          }))
        });
      }

      await tx.v2Highlight.deleteMany({
        where: {
          match: {
            careerId
          }
        }
      });
      await tx.v2Match.deleteMany({ where: { careerId } });

      if (snapshot.matches.length > 0) {
        await tx.v2Match.createMany({
          data: snapshot.matches.map((row) => ({
            id: String(row.id),
            careerId,
            fixtureId: String(row.fixtureId),
            status: String(row.status),
            homeScore: Number(row.homeScore),
            awayScore: Number(row.awayScore),
            homeXg: Number(row.homeXg),
            awayXg: Number(row.awayXg),
            homePossession: Number(row.homePossession),
            awayPossession: Number(row.awayPossession),
            interventions: row.interventions ? String(row.interventions) : null,
            seed: row.seed ? String(row.seed) : null,
            startedAt: row.startedAt ? toDate(row.startedAt) : null,
            completedAt: row.completedAt ? toDate(row.completedAt) : null,
            createdAt: toDate(row.createdAt),
            updatedAt: toDate(row.updatedAt)
          }))
        });
      }

      if (snapshot.highlights.length > 0) {
        await tx.v2Highlight.createMany({
          data: snapshot.highlights.map((row) => ({
            id: String(row.id),
            matchId: String(row.matchId),
            minute: Number(row.minute),
            eventType: String(row.eventType),
            teamSide: row.teamSide ? String(row.teamSide) : null,
            actorId: row.actorId === null ? null : Number(row.actorId),
            fromX: row.fromX === null ? null : Number(row.fromX),
            fromY: row.fromY === null ? null : Number(row.fromY),
            toX: row.toX === null ? null : Number(row.toX),
            toY: row.toY === null ? null : Number(row.toY),
            animationPreset: String(row.animationPreset),
            cameraPath: row.cameraPath ? String(row.cameraPath) : null,
            commentary: String(row.commentary),
            xThreatRank: Number(row.xThreatRank),
            isDecisive: Boolean(row.isDecisive),
            payload: row.payload ? String(row.payload) : null,
            createdAt: toDate(row.createdAt)
          }))
        });
      }

      await tx.v2SaveSlot.update({
        where: { id: slot.id },
        data: { lastPlayedAt: new Date() }
      });
    });

    await this.addAudit(careerId, 'LOAD', `Loaded save slot ${slotName}.`, {
      slotName,
      stateHash: slot.stateHash
    });

    return {
      slotName,
      stateHash: slot.stateHash,
      career: await this.getCareerState(careerId)
    };
  }

  private async requireCareer(careerId: string): Promise<V2Career> {
    const career = await this.prisma.v2Career.findUnique({
      where: { id: careerId }
    });

    if (!career) {
      throw new Error('Career not found.');
    }
    return career;
  }

  private async toFixturePresentation(
    fixture: Pick<V2Fixture, 'id' | 'homeClubId' | 'awayClubId' | 'weekNumber' | 'status' | 'leagueId' | 'matchDate' | 'homeScore' | 'awayScore' | 'isUserClubFixture'>,
    controlledClubId?: number
  ): Promise<V2FixturePresentation> {
    const [clubs, league] = await Promise.all([
      this.prisma.club.findMany({
        where: {
          id: {
            in: [fixture.homeClubId, fixture.awayClubId]
          }
        },
        select: {
          id: true,
          name: true
        }
      }),
      this.prisma.league.findUnique({
        where: { id: fixture.leagueId },
        select: {
          id: true,
          name: true,
          tier: true
        }
      })
    ]);

    const clubMap = new Map(clubs.map((club) => [club.id, club.name]));
    const homeClubName = clubMap.get(fixture.homeClubId) ?? `Club ${fixture.homeClubId}`;
    const awayClubName = clubMap.get(fixture.awayClubId) ?? `Club ${fixture.awayClubId}`;

    const hasControlledClub = Number.isFinite(controlledClubId);
    const isControlledClubHome = hasControlledClub
      ? fixture.homeClubId === controlledClubId
      : null;

    let opponentClubId: number | null = null;
    let opponentClubName: string | null = null;
    if (hasControlledClub && isControlledClubHome !== null) {
      opponentClubId = isControlledClubHome ? fixture.awayClubId : fixture.homeClubId;
      opponentClubName = isControlledClubHome ? awayClubName : homeClubName;
    }

    return {
      id: fixture.id,
      homeClubId: fixture.homeClubId,
      awayClubId: fixture.awayClubId,
      weekNumber: fixture.weekNumber,
      status: fixture.status,
      leagueId: fixture.leagueId,
      matchDate: fixture.matchDate,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      isUserClubFixture: fixture.isUserClubFixture,
      homeClubName,
      awayClubName,
      leagueName: league?.name ?? null,
      leagueTier: league?.tier ?? null,
      isControlledClubHome,
      opponentClubId,
      opponentClubName
    };
  }

  private async ensureControlledClubSquad(
    careerId: string,
    controlledClubId: number,
    minimumSize = 22,
    db: DbClient = this.prisma
  ) {
    const clubExists = await db.club.count({
      where: { id: controlledClubId }
    });
    if (clubExists === 0) {
      return;
    }

    const existingCount = await db.player.count({
      where: { currentClubId: controlledClubId }
    });

    if (existingCount >= minimumSize) {
      return;
    }

    const needed = minimumSize - existingCount;
    const players = Array.from({ length: needed }, (_, idx) => {
      const random = mulberry32(stringToSeed(`${careerId}:club:${controlledClubId}:squad-seed:${idx}`));
      return buildSyntheticPlayerPayload(controlledClubId, random, {
        profile: 'squad',
        positionHint: SYNTHETIC_POSITION_TEMPLATE[idx % SYNTHETIC_POSITION_TEMPLATE.length]
      });
    });

    if (players.length > 0) {
      await db.player.createMany({ data: players });
    }
  }

  private async ensureControlledClubSquadIfMissing(
    careerId: string,
    controlledClubId: number,
    minimumSize = 22,
    db: DbClient = this.prisma
  ) {
    const existingCount = await db.player.count({
      where: { currentClubId: controlledClubId }
    });

    if (existingCount > 0) {
      return;
    }

    await this.ensureControlledClubSquad(careerId, controlledClubId, minimumSize, db);
  }

  private async ensureControlledClubSquadBalance(
    careerId: string,
    controlledClubId: number,
    db: DbClient = this.prisma
  ) {
    const players = await db.player.findMany({
      where: { currentClubId: controlledClubId },
      select: {
        id: true,
        position: true
      },
      orderBy: { id: 'asc' }
    });

    if (players.length === 0) {
      return;
    }

    const createdPlayers = planControlledClubSquadBalanceRepairs({
      careerId,
      controlledClubId,
      players
    });
    if (createdPlayers.length > 0) {
      await db.player.createMany({ data: createdPlayers });
    }
  }

  private async ensureControlledClubRegistrationViability(
    career: Pick<V2Career, 'id' | 'currentDate' | 'activeLeagueId'>,
    controlledClubId: number,
    db: DbClient = this.prisma
  ) {
    const players = await db.player.findMany({
      where: { currentClubId: controlledClubId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        position: true,
        dateOfBirth: true,
        age: true,
        currentAbility: true,
        potentialAbility: true
      },
      orderBy: [
        { currentAbility: 'desc' },
        { potentialAbility: 'desc' },
        { id: 'asc' }
      ]
    });

    if (players.length === 0) {
      return;
    }

    const registrationSnapshot = await this.getSquadRegistrationSnapshot(career, players, db);
    if (registrationSnapshot.rules.competitionCategory !== 'O21') {
      return;
    }

    const missingRegisteredCount = Math.max(
      0,
      Number(registrationSnapshot.rules.minimumRegistered ?? 18) - registrationSnapshot.registeredCount
    );
    if (missingRegisteredCount <= 0) {
      return;
    }

    const registerableGroupCounts: Record<MatchPrepPositionGroup, number> = {
      GK: 0,
      DEF: 0,
      MID: 0,
      ATT: 0
    };
    for (const player of players) {
      if (!registrationSnapshot.registeredPlayerIds.has(player.id)) {
        continue;
      }
      registerableGroupCounts[resolveMatchPrepPositionGroup(player.position)] += 1;
    }

    const registrationTemplate = [
      'GK', 'GK',
      'RB', 'LB', 'CB', 'CB', 'RWB', 'LWB',
      'DM', 'CM', 'CM', 'AM', 'CM', 'DM',
      'RW', 'LW', 'ST', 'CF'
    ] as const;
    const desiredGroupCounts = registrationTemplate.reduce<Record<MatchPrepPositionGroup, number>>(
      (accumulator, positionHint) => {
        accumulator[resolveMatchPrepPositionGroup(positionHint)] += 1;
        return accumulator;
      },
      { GK: 0, DEF: 0, MID: 0, ATT: 0 }
    );

    const createdPlayers: Prisma.PlayerCreateManyInput[] = [];
    const appendRepair = (positionHint: string, seedSuffix: string) => {
      const random = mulberry32(
        stringToSeed(`${career.id}:club:${controlledClubId}:registration-repair:${seedSuffix}:${createdPlayers.length}`)
      );
      createdPlayers.push(
        buildSyntheticPlayerPayload(controlledClubId, random, {
          profile: 'squad',
          positionHint,
          ageMin: 16,
          ageMax: 20,
          referenceYear: career.currentDate.getUTCFullYear()
        })
      );
      registerableGroupCounts[resolveMatchPrepPositionGroup(positionHint)] += 1;
    };

    for (const [slotIndex, positionHint] of registrationTemplate.entries()) {
      if (createdPlayers.length >= missingRegisteredCount) {
        break;
      }
      const group = resolveMatchPrepPositionGroup(positionHint);
      if (registerableGroupCounts[group] >= desiredGroupCounts[group]) {
        continue;
      }
      appendRepair(positionHint, `template:${slotIndex}:${group}`);
    }

    let fillerIndex = 0;
    while (createdPlayers.length < missingRegisteredCount) {
      const positionHint = registrationTemplate[fillerIndex % registrationTemplate.length];
      appendRepair(positionHint, `depth:${fillerIndex}`);
      fillerIndex += 1;
    }

    if (createdPlayers.length > 0) {
      await db.player.createMany({ data: createdPlayers });
    }
  }

  private async ensureControlledClubContracts(
    career: Pick<V2Career, 'id' | 'currentDate'>,
    controlledClubId: number,
    db: DbClient = this.prisma
  ) {
    const players = await db.player.findMany({
      where: {
        currentClubId: controlledClubId,
        OR: [{ contractStart: null }, { contractEnd: null }]
      },
      select: {
        id: true,
        dateOfBirth: true,
        age: true,
        contractStart: true,
        contractEnd: true
      }
    });

    for (const player of players) {
      const updateData: Prisma.PlayerUpdateInput = {};
      const random = mulberry32(stringToSeed(`${career.id}:contract-backfill:${player.id}`));
      const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
      const years = age <= 21
        ? 3 + Math.floor(random() * 3)
        : age >= 32
          ? 1 + Math.floor(random() * 2)
          : 2 + Math.floor(random() * 3);

      const preferredStartYear = career.currentDate.getUTCFullYear() - (random() < 0.35 ? 1 : 0);
      const existingEnd = player.contractEnd ?? null;
      const inferredStart = existingEnd
        ? new Date(Date.UTC(existingEnd.getUTCFullYear() - years, 6, 1))
        : new Date(Date.UTC(preferredStartYear, 6, 1));
      const contractStart = player.contractStart ?? inferredStart;
      let contractEnd = player.contractEnd ?? new Date(Date.UTC(contractStart.getUTCFullYear() + years, 5, 30));

      if (contractEnd.getTime() <= contractStart.getTime()) {
        contractEnd = new Date(Date.UTC(contractStart.getUTCFullYear() + Math.max(1, years), 5, 30));
      }

      if (!player.contractStart) {
        updateData.contractStart = contractStart;
      }
      if (!player.contractEnd) {
        updateData.contractEnd = contractEnd;
      }

      if (Object.keys(updateData).length > 0) {
        await db.player.update({
          where: { id: player.id },
          data: updateData
        });
      }
    }
  }

  private async ensureV2PlayerStatesForClub(careerId: string, clubId: number, db: DbClient = this.prisma) {
    const players = await db.player.findMany({
      where: { currentClubId: clubId },
      select: { id: true, currentClubId: true }
    });

    if (players.length === 0) {
      return;
    }

    const playerIds = players.map((player) => player.id);
    const existingRows = await db.v2PlayerState.findMany({
      where: {
        careerId,
        playerId: { in: playerIds }
      },
      select: { playerId: true }
    });

    const existingIds = new Set(existingRows.map((row) => row.playerId));
    const missingPlayers = players.filter((player) => !existingIds.has(player.id));
    if (missingPlayers.length === 0) {
      return;
    }

    await db.v2PlayerState.createMany({
      data: missingPlayers.map((player) => ({
        id: `${careerId}:ps:${player.id}`,
        careerId,
        playerId: player.id,
        clubId: player.currentClubId ?? clubId,
        morale: 55,
        fitness: 90,
        form: 50,
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false,
        developmentDelta: 0
      }))
    });
  }

  private async createSyntheticRecruit(
    tx: DbClient,
    careerId: string,
    clubId: number,
    random: () => number,
    options?: {
      profile?: 'starter' | 'prospect' | 'depth';
      positionHint?: string;
      nationality?: string;
      morale?: number;
      fitness?: number;
      form?: number;
      developmentDelta?: number;
    }
  ) {
    const payload = buildSyntheticPlayerPayload(clubId, random, {
      profile: options?.profile ?? 'depth',
      positionHint: options?.positionHint,
      nationality: options?.nationality
    });
    const created = await tx.player.create({
      data: payload,
      select: {
        id: true,
        weeklyWage: true
      }
    });

    await tx.v2PlayerState.create({
      data: {
        id: `${careerId}:ps:${created.id}`,
        careerId,
        playerId: created.id,
        clubId,
        morale: clamp(options?.morale ?? 58, 20, 100),
        fitness: clamp(options?.fitness ?? 88, 35, 100),
        form: clamp(options?.form ?? 52, 0, 100),
        isInjured: false,
        injuryWeeks: 0,
        isSuspended: false,
        developmentDelta: clamp(options?.developmentDelta ?? 2, -30, 60)
      }
    });

    return {
      id: created.id,
      weeklyWage: Math.max(450, Math.round(created.weeklyWage ?? payload.weeklyWage ?? 900))
    };
  }

  private async applyPlayerStateDeltas(
    tx: DbClient,
    careerId: string,
    clubId: number,
    deltas: {
      moraleDelta?: number;
      fitnessDelta?: number;
      formDelta?: number;
      developmentDelta?: number;
    },
    random: () => number
  ) {
    const hasDelta = Object.values(deltas).some((value) => Number(value ?? 0) !== 0);
    if (!hasDelta) {
      return;
    }

    const rows = await tx.v2PlayerState.findMany({
      where: {
        careerId,
        clubId
      },
      orderBy: { playerId: 'asc' }
    });

    if (rows.length === 0) {
      return;
    }

    for (const row of rows) {
      const moraleNoise = Math.floor(random() * 3) - 1;
      const fitnessNoise = Math.floor(random() * 3) - 1;
      const formNoise = Math.floor(random() * 3) - 1;

      await tx.v2PlayerState.update({
        where: { id: row.id },
        data: {
          morale: clamp(row.morale + (deltas.moraleDelta ?? 0) + moraleNoise, 20, 100),
          fitness: clamp(row.fitness + (deltas.fitnessDelta ?? 0) + fitnessNoise, 35, 100),
          form: clamp(row.form + (deltas.formDelta ?? 0) + formNoise, 0, 100),
          developmentDelta: clamp(row.developmentDelta + (deltas.developmentDelta ?? 0), -30, 60)
        }
      });
    }
  }

  private async applyEventOptionSideEffects(
    tx: DbClient,
    career: V2Career,
    eventId: string,
    optionId: string,
    effects: EventOption['effects']
  ): Promise<EventSideEffectOutcome | null> {
    const random = mulberry32(stringToSeed(`${career.id}:${eventId}:${optionId}`));
    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 22, tx);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

    await this.applyPlayerStateDeltas(
      tx,
      career.id,
      career.controlledClubId,
      {
        moraleDelta: effects.playerMoraleDelta,
        fitnessDelta: effects.playerFitnessDelta,
        formDelta: effects.playerFormDelta,
        developmentDelta: effects.playerDevelopmentDelta
      },
      random
    );

    const squad = await tx.player.findMany({
      where: { currentClubId: career.controlledClubId },
      select: {
        id: true,
        currentAbility: true,
        potentialAbility: true,
        value: true
      },
      orderBy: [{ currentAbility: 'asc' }, { id: 'asc' }]
    });

    const action = effects.transferAction;
    if (action === 'SELL_FRINGE' && squad.length > 18) {
      const candidate = squad[0];
      if (candidate) {
        const saleValue = Math.round((candidate.value ?? 85000) * (0.3 + random() * 0.2));
        await tx.player.update({
          where: { id: candidate.id },
          data: { currentClubId: null }
        });
        await tx.v2PlayerState.deleteMany({
          where: {
            careerId: career.id,
            playerId: candidate.id
          }
        });
        await this.applyClubEffects(tx, career.id, career.controlledClubId, {
          budgetDelta: saleValue,
          moraleDelta: -1
        });
      }
    } else if (action === 'SIGN_STARTER' && squad.length < 34) {
      await this.createSyntheticRecruit(tx, career.id, career.controlledClubId, random, {
        profile: 'starter',
        morale: 62,
        fitness: 92,
        form: 58,
        developmentDelta: 3
      });
    } else if (action === 'SIGN_PROSPECT' && squad.length < 34) {
      await this.createSyntheticRecruit(tx, career.id, career.controlledClubId, random, {
        profile: 'prospect',
        morale: 59,
        fitness: 90,
        form: 51,
        developmentDelta: 6
      });
    }

    const contractWarningAction = this.parseContractWarningOptionId(optionId);
    if (contractWarningAction) {
      const contractOutcome = await this.applyContractWarningOptionSideEffect(tx, career, eventId, contractWarningAction);
      if (contractOutcome) {
        await tx.v2PlayerState.updateMany({
          where: { careerId: career.id, clubId: career.controlledClubId, form: { gt: 100 } },
          data: { form: 100 }
        });
        await tx.v2PlayerState.updateMany({
          where: { careerId: career.id, clubId: career.controlledClubId, morale: { gt: 100 } },
          data: { morale: 100 }
        });
        await tx.v2PlayerState.updateMany({
          where: { careerId: career.id, clubId: career.controlledClubId, developmentDelta: { gt: 60 } },
          data: { developmentDelta: 60 }
        });
        return { contractAction: contractOutcome };
      }
    }

    if (optionId === 'promise_bench') {
      await this.createPlayingTimePromiseFromBenchEvent(tx, career, eventId);
    }

    const playingTimePromiseFollowUpAction = this.parsePlayingTimePromiseFollowUpOptionId(optionId);
    if (playingTimePromiseFollowUpAction) {
      await this.applyPlayingTimePromiseFollowUpOption(tx, career, eventId, playingTimePromiseFollowUpAction);
    }

    const scoutingOutcome = effects.scoutingOutcome;
    if (scoutingOutcome === 'LOCAL_DISCOVERY') {
      const latestSquad = await tx.player.count({
        where: { currentClubId: career.controlledClubId }
      });
      if (latestSquad < 32) {
        await this.createSyntheticRecruit(tx, career.id, career.controlledClubId, random, {
          profile: 'depth',
          morale: 57,
          fitness: 90,
          form: 50,
          developmentDelta: 3
        });
      }
    } else if (scoutingOutcome === 'NATIONAL_SHORTLIST') {
      const playerIds = await tx.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: { id: true, potentialAbility: true },
        orderBy: [{ potentialAbility: 'desc' }, { id: 'asc' }],
        take: 4
      });
      for (const player of playerIds) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            playerId: player.id
          },
          data: {
            developmentDelta: { increment: 2 },
            form: { increment: 1 }
          }
        });
      }
    } else if (scoutingOutcome === 'INTERNATIONAL_BREAKTHROUGH') {
      const latestSquad = await tx.player.count({
        where: { currentClubId: career.controlledClubId }
      });
      if (latestSquad < 34) {
        await this.createSyntheticRecruit(tx, career.id, career.controlledClubId, random, {
          profile: 'prospect',
          nationality: pick(['Brazil', 'Argentina', 'Portugal', 'Belgium', 'France', 'Spain'], random),
          morale: 61,
          fitness: 91,
          form: 53,
          developmentDelta: 8
        });
      }
    } else if (scoutingOutcome === 'YOUTH_INTAKE_SPIKE') {
      const topProspects = await tx.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: { id: true, potentialAbility: true, dateOfBirth: true },
        orderBy: [
          { potentialAbility: 'desc' },
          { dateOfBirth: 'desc' }
        ],
        take: 5
      });
      for (const player of topProspects) {
        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            playerId: player.id
          },
          data: {
            developmentDelta: { increment: 3 },
            morale: { increment: 1 }
          }
        });
      }
    }

    await tx.v2PlayerState.updateMany({
      where: { careerId: career.id, clubId: career.controlledClubId, form: { gt: 100 } },
      data: { form: 100 }
    });
    await tx.v2PlayerState.updateMany({
      where: { careerId: career.id, clubId: career.controlledClubId, morale: { gt: 100 } },
      data: { morale: 100 }
    });
    await tx.v2PlayerState.updateMany({
      where: { careerId: career.id, clubId: career.controlledClubId, developmentDelta: { gt: 60 } },
      data: { developmentDelta: 60 }
    });

    return null;
  }

  private parseContractWarningOptionId(optionId: string): ParsedContractWarningOption | null {
    if (!optionId.startsWith('contract_warn:')) {
      return null;
    }

    const parts = optionId.split(':');
    if (parts.length < 3) {
      return null;
    }

    const action = String(parts[1] || '').trim().toLowerCase();
    const playerId = Number(parts[2]);
    if (!Number.isFinite(playerId) || playerId <= 0) {
      return null;
    }

    if (action === 'renew') {
      const years = Number(parts[3]);
      const wageAdjustmentPct = Number(parts[4]);
      if (!Number.isFinite(years) || !Number.isFinite(wageAdjustmentPct)) {
        return null;
      }
      return {
        action: 'RENEW',
        playerId,
        years: clamp(Math.round(years), 1, 5),
        wageAdjustmentPct: clamp(Math.round(wageAdjustmentPct), -10, 35)
      };
    }

    if (action === 'release') {
      const compensationWeeks = Number(parts[3]);
      if (!Number.isFinite(compensationWeeks)) {
        return null;
      }
      return {
        action: 'RELEASE',
        playerId,
        compensationWeeks: clamp(Math.round(compensationWeeks), 2, 26)
      };
    }

    if (action === 'promise') {
      return {
        action: 'PROMISE',
        playerId
      };
    }

    return null;
  }

  private async applyContractWarningOptionSideEffect(
    tx: DbClient,
    career: V2Career,
    sourceEventId: string,
    action: ParsedContractWarningOption
  ): Promise<EventSideEffectOutcome['contractAction'] | null> {
    if (action.action === 'RENEW') {
      const [club, player, clubState] = await Promise.all([
        tx.club.findUnique({
          where: { id: career.controlledClubId },
          select: {
            id: true,
            balance: true,
            transferBudget: true
          }
        }),
        tx.player.findUnique({
          where: { id: action.playerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            currentClubId: true,
            dateOfBirth: true,
            age: true,
            position: true,
            currentAbility: true,
            weeklyWage: true,
            contractEnd: true
          }
        }),
        tx.v2ClubState.upsert({
          where: {
            careerId_clubId: {
              careerId: career.id,
              clubId: career.controlledClubId
            }
          },
          create: {
            id: `${career.id}:cs:${career.controlledClubId}`,
            careerId: career.id,
            clubId: career.controlledClubId,
            morale: 55,
            fitnessTrend: 0,
            boardConfidence: 55,
            budgetBalance: 0,
            injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
            form: 'NNNNN'
          },
          update: {}
        })
      ]);

      if (!club) {
        throw new Error('Controlled club not found.');
      }
      if (!player || player.currentClubId !== career.controlledClubId) {
        throw new Error('Contract warning target is no longer in your squad.');
      }

      const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim();
      const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
      const ability = Number(player.currentAbility ?? 60);
      const currentWeeklyWage = Math.max(450, Math.round(player.weeklyWage ?? 900));
      const roleTier = resolveContractWarningRoleTier(ability, age);
      const daysRemaining = player.contractEnd
        ? Math.max(0, Math.floor((player.contractEnd.getTime() - career.currentDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 999;
      const leverageMemoryScore = (await this.getContractWarningLeverageMemoryMap(career.id, career.weekNumber, tx))
        .get(player.id)?.score ?? 0;
      const packages = buildContractWarningRenewalPackages({
        daysRemaining,
        roleTier
      });

      const offeredIndex = packages.findIndex((pkg) =>
        pkg.years === (action.years ?? 0) && pkg.wageAdjustmentPct === (action.wageAdjustmentPct ?? 0)
      );
      const safeOfferedIndex = offeredIndex >= 0 ? offeredIndex : 0;
      const negotiationRound = getContractWarningNegotiationRoundFromEventId(sourceEventId);
      const boardPolicy = assessContractRenewalBoardPolicy({
        roleTier,
        boardRiskLevel: this.getBoardRiskLevel(clubState.boardConfidence),
        clubBalance: club.balance ?? 0,
        budgetBalance: clubState.budgetBalance,
        transferBudget: club.transferBudget ?? 0,
        currentWeeklyWage,
        years: action.years ?? packages[safeOfferedIndex]?.years ?? 2,
        wageAdjustmentPct: action.wageAdjustmentPct ?? packages[safeOfferedIndex]?.wageAdjustmentPct ?? 0,
        ability,
        negotiationRound
      });
      if (boardPolicy.level === 'HARD') {
        throw new Error(boardPolicy.warning || 'Board wage policy blocks this offer at the current terms.');
      }
      const negotiationAssessment = assessContractWarningRenewalOffer({
        roleTier,
        daysRemaining,
        ability,
        offeredIndex: safeOfferedIndex,
        packageCount: packages.length,
        negotiationRound,
        leverageMemoryScore
      });
      const requiredIndex = negotiationAssessment.requiredIndex;

      if (negotiationAssessment.outcome !== 'ACCEPT') {
        const boardRisk = this.getBoardRiskLevel(clubState.boardConfidence);
        const requestedYears = action.years ?? packages[safeOfferedIndex]?.years ?? 2;
        const requestedWageAdjustmentPct = action.wageAdjustmentPct ?? packages[safeOfferedIndex]?.wageAdjustmentPct ?? 0;
        const counterPackage = packages[requiredIndex] ?? packages[packages.length - 1];
        const hardReject = negotiationAssessment.outcome === 'REJECT';
        const escalation = clamp(negotiationRound, 0, 2);

        const playerMoraleDelta = hardReject
          ? (roleTier === 'CORE' || roleTier === 'PROSPECT' ? -4 : -3) - escalation
          : (roleTier === 'CORE' || roleTier === 'PROSPECT' ? -2 : -1) - Math.min(escalation, 1);
        const boardDelta = hardReject
          ? (boardRisk === 'PRESSURE' || boardRisk === 'CRITICAL' ? -3 : -2) - escalation
          : (boardRisk === 'PRESSURE' || boardRisk === 'CRITICAL' ? -2 : -1) - Math.min(escalation, 1);

        await tx.v2PlayerState.updateMany({
          where: {
            careerId: career.id,
            clubId: career.controlledClubId,
            playerId: player.id
          },
          data: {
            morale: { increment: playerMoraleDelta },
            ...(roleTier === 'PROSPECT' && hardReject ? { developmentDelta: { decrement: 1 } } : {})
          }
        });

        await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta });

        if (!hardReject) {
          const counterYears = counterPackage?.years ?? requestedYears;
          const counterWageAdjustmentPct = counterPackage?.wageAdjustmentPct ?? requestedWageAdjustmentPct;
          const releaseCompensationWeeks = resolveContractWarningReleaseCompensationWeeks({
            ability,
            roleTier
          });
          const followUpEventId = await this.createContractWarningCounterOfferInboxEvent(tx, career, sourceEventId, {
            player: {
              id: player.id,
              firstName: player.firstName,
              lastName: player.lastName,
              fullName: player.fullName,
              position: player.position,
              currentAbility: ability,
              age,
              dateOfBirth: player.dateOfBirth,
              weeklyWage: currentWeeklyWage,
              contractEnd: player.contractEnd
            },
            roleTier,
            daysRemaining,
            boardConfidence: clubState.boardConfidence,
            operatingBalance: (club.balance ?? 0) + clubState.budgetBalance,
            clubBalance: club.balance ?? 0,
            budgetBalance: clubState.budgetBalance,
            transferBudget: club.transferBudget ?? 0,
            counterYears,
            counterWageAdjustmentPct,
            releaseCompensationWeeks,
            leverageMemoryScore
          });

          return {
            action: 'COUNTER',
            playerId: player.id,
            playerName,
            requestedYears,
            requestedWageAdjustmentPct,
            counterYears,
            counterWageAdjustmentPct,
            boardDelta,
            playerMoraleDelta,
            note: `Agent rejected the initial terms and countered for ${counterYears} year(s) at +${counterWageAdjustmentPct}% wage.${negotiationRound >= 1 ? ' Leverage has hardened after repeated low offers.' : ''} Counter-demand added to Inbox.`,
            followUpEventId
          };
        }

        const followUpEventId = await this.createContractWarningRejectFalloutInboxEvent(tx, career, sourceEventId, {
          player: {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            fullName: player.fullName,
            position: player.position,
            currentAbility: ability,
            age,
            weeklyWage: currentWeeklyWage,
            contractEnd: player.contractEnd
          },
          roleTier,
          daysRemaining,
          boardConfidence: clubState.boardConfidence,
          operatingBalance: (club.balance ?? 0) + clubState.budgetBalance,
          negotiationRound
        });

        return {
          action: 'REJECT',
          playerId: player.id,
          playerName,
          requestedYears,
          requestedWageAdjustmentPct,
          boardDelta,
          playerMoraleDelta,
          note: `Talks stalled after a low offer. Agent leverage increased and the player reacted negatively. Contract fallout added to Inbox.${negotiationRound >= 1 ? ' Media and dressing-room pressure are rising after repeated low offers.' : ''}`,
          followUpEventId
        };
      }

      const renewed = await this.renewSquadContractTx(tx, career, action.playerId, {
        years: action.years ?? 2,
        wageAdjustmentPct: action.wageAdjustmentPct ?? 6
      });
      return {
        action: 'RENEW',
        playerId: renewed.playerId,
        playerName: renewed.playerName,
        years: renewed.years,
        weeklyWage: renewed.weeklyWage,
        contractEnd: renewed.contractEnd,
        budgetImpact: renewed.budgetImpact,
        requestedYears: action.years ?? renewed.years,
        requestedWageAdjustmentPct: action.wageAdjustmentPct ?? undefined
      };
    }

    if (action.action === 'RELEASE') {
      const released = await this.releaseSquadPlayerTx(tx, career, action.playerId, {
        compensationWeeks: action.compensationWeeks ?? 6
      });
      return {
        action: 'RELEASE',
        playerId: released.playerId,
        playerName: released.playerName,
        compensationWeeks: released.compensationWeeks,
        budgetImpact: released.budgetImpact
      };
    }

    const player = await tx.player.findUnique({
      where: { id: action.playerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        currentClubId: true
      }
    });

    if (!player || player.currentClubId !== career.controlledClubId) {
      throw new Error('Contract warning target is no longer in your squad.');
    }

    await tx.v2PlayerState.updateMany({
      where: {
        careerId: career.id,
        clubId: career.controlledClubId,
        playerId: player.id
      },
      data: {
        morale: { increment: 2 },
        developmentDelta: { increment: 1 }
      }
    });

    await this.applyClubEffects(tx, career.id, career.controlledClubId, {
      boardDelta: -1
    });

    const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim();
    return {
      action: 'PROMISE',
      playerId: player.id,
      playerName
    };
  }

  private async buildContractWarningEvents(
    career: V2Career,
    weekNumber: number,
    currentDate: Date,
    context: { boardConfidence: number; operatingBalance: number; clubBalance: number; budgetBalance: number; transferBudget: number }
  ): Promise<InboxEventCreateRow[]> {
    const millisPerDay = 1000 * 60 * 60 * 24;
    const warningWindowDays = 180;
    const maxWarningsPerWeek = 2;

    const suppressedPlayerIds = await this.getSuppressedContractWarningPlayerIds(career.id, weekNumber);
    const leverageMemoryByPlayer = await this.getContractWarningLeverageMemoryMap(career.id, weekNumber);

    const players = await this.prisma.player.findMany({
      where: {
        currentClubId: career.controlledClubId,
        contractEnd: { not: null },
        ...(suppressedPlayerIds.size > 0 ? { id: { notIn: Array.from(suppressedPlayerIds) } } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        age: true,
        dateOfBirth: true,
        position: true,
        currentAbility: true,
        weeklyWage: true,
        contractEnd: true
      }
    });

    const candidates = players
      .map((player) => {
        const contractEnd = player.contractEnd;
        if (!contractEnd) {
          return null;
        }
        const daysRemaining = Math.floor((contractEnd.getTime() - currentDate.getTime()) / millisPerDay);
        if (daysRemaining < 1 || daysRemaining > warningWindowDays) {
          return null;
        }
        return {
          ...player,
          contractEnd,
          daysRemaining
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => {
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining;
        }
        const abilityA = Number(a.currentAbility ?? 60);
        const abilityB = Number(b.currentAbility ?? 60);
        if (abilityA !== abilityB) {
          return abilityB - abilityA;
        }
        return a.id - b.id;
      })
      .slice(0, maxWarningsPerWeek);

    if (candidates.length === 0) {
      return [];
    }

    return candidates.map((player) => {
      const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim();
      const contractEndIso = player.contractEnd.toISOString().slice(0, 10);
      const playerAge = this.resolvePlayerAge(player.dateOfBirth, currentDate, player.age, player.id);
      const weeklyWage = Math.max(450, Math.round(player.weeklyWage ?? 900));
      const roleTier = resolveContractWarningRoleTier(player.currentAbility ?? 60, playerAge);
      const boardStance = resolveContractWarningBoardStance(this.getBoardRiskLevel(context.boardConfidence), context.operatingBalance, roleTier);
      const agentStance = resolveContractWarningAgentStance({
        daysRemaining: player.daysRemaining,
        age: playerAge,
        ability: player.currentAbility ?? 60,
        roleTier
      });
      const urgency = player.daysRemaining <= 45 ? V2_URGENCY.MEDIUM : V2_URGENCY.LOW;
      const deadline = addDays(currentDate, player.daysRemaining <= 30 ? 2 : 4);
      const renewalPackages = buildContractWarningRenewalPackages({
        daysRemaining: player.daysRemaining,
        roleTier
      });
      const releaseCompensationWeeks = resolveContractWarningReleaseCompensationWeeks({
        ability: player.currentAbility ?? 60,
        roleTier
      });
      const promiseLabel = buildContractWarningPromiseLabel({
        daysRemaining: player.daysRemaining,
        roleTier,
        boardRiskLevel: this.getBoardRiskLevel(context.boardConfidence)
      });
      const releaseLabel = buildContractWarningReleaseLabel({
        compensationWeeks: releaseCompensationWeeks,
        roleTier,
        boardRiskLevel: this.getBoardRiskLevel(context.boardConfidence)
      });
      const options: EventOption[] = [
        ...renewalPackages.map((pkg, pkgIndex) => {
          const negotiationAssessment = assessContractWarningRenewalOffer({
            roleTier,
            daysRemaining: player.daysRemaining,
            ability: player.currentAbility ?? 60,
            offeredIndex: pkgIndex,
            packageCount: renewalPackages.length,
            negotiationRound: 0,
            leverageMemoryScore: leverageMemoryByPlayer.get(player.id)?.score ?? 0
          });
          const boardPolicy = assessContractRenewalBoardPolicy({
            roleTier,
            boardRiskLevel: this.getBoardRiskLevel(context.boardConfidence),
            clubBalance: context.clubBalance,
            budgetBalance: context.budgetBalance,
            transferBudget: context.transferBudget,
            currentWeeklyWage: weeklyWage,
            years: pkg.years,
            wageAdjustmentPct: pkg.wageAdjustmentPct,
            ability: player.currentAbility ?? 60,
            negotiationRound: 0
          });
          return {
            id: `contract_warn:renew:${player.id}:${pkg.years}:${pkg.wageAdjustmentPct}`,
            label: pkg.label,
            effects: {},
            acceptanceRisk: negotiationAssessment.acceptanceRisk,
            acceptanceHint: negotiationAssessment.acceptanceHint,
            ...(boardPolicy.level !== 'NONE' ? {
              boardPolicyLevel: boardPolicy.level,
              boardPolicyWarning: boardPolicy.warning || undefined
            } : {})
          };
        }),
        {
          id: `contract_warn:promise:${player.id}`,
          label: promiseLabel,
          effects: {}
        },
        {
          id: `contract_warn:release:${player.id}:${releaseCompensationWeeks}`,
          label: releaseLabel,
          effects: {}
        }
      ];

      return {
        id: `${career.id}:ev:${weekNumber}:contract:${player.id}`,
        careerId: career.id,
        weekNumber,
        title: `Contract Decision Needed: ${playerName}`,
        description: `${player.position} | Age ${playerAge} | Wage EUR ${weeklyWage.toLocaleString()} / week | ${roleTier}. Contract expires on ${contractEndIso} (${player.daysRemaining} day${player.daysRemaining === 1 ? '' : 's'} remaining). Agent stance: ${agentStance} Board stance: ${boardStance}`,
        urgency,
        options: JSON.stringify(options),
        deadline,
        status: 'PENDING',
        autoResolved: false
      };
    });
  }

  private getContractWarningNegotiationBaseEventId(eventId: string): string {
    if (/:counter:\d+$/.test(eventId)) {
      return eventId.replace(/:counter:\d+$/, '');
    }
    if (/:counter$/.test(eventId)) {
      return eventId.replace(/:counter$/, '');
    }
    return eventId;
  }

  private buildContractWarningCounterEventId(sourceEventId: string, round: number): string {
    const baseEventId = this.getContractWarningNegotiationBaseEventId(sourceEventId);
    const safeRound = Math.max(1, Math.round(round));
    return `${baseEventId}:counter:${safeRound}`;
  }

  private async createContractWarningCounterOfferInboxEvent(
    tx: DbClient,
    career: V2Career,
    sourceEventId: string,
    context: {
      player: {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string | null;
        position: string;
        currentAbility: number;
        age: number;
        dateOfBirth: Date | null;
        weeklyWage: number;
        contractEnd: Date | null;
      };
      roleTier: 'CORE' | 'ROTATION' | 'FRINGE' | 'PROSPECT' | 'VETERAN';
      daysRemaining: number;
      boardConfidence: number;
      operatingBalance: number;
      clubBalance: number;
      budgetBalance: number;
      transferBudget: number;
      counterYears: number;
      counterWageAdjustmentPct: number;
      releaseCompensationWeeks: number;
      leverageMemoryScore?: number;
    }
  ): Promise<string> {
    const nextNegotiationRound = getContractWarningNegotiationRoundFromEventId(sourceEventId) + 1;
    const playerName = context.player.fullName?.trim() || `${context.player.firstName} ${context.player.lastName}`.trim();
    const contractEnd = context.player.contractEnd ?? addDays(career.currentDate, Math.max(14, context.daysRemaining));
    const contractEndIso = contractEnd.toISOString().slice(0, 10);
    const urgency = context.daysRemaining <= 21
      ? V2_URGENCY.HIGH
      : context.daysRemaining <= 45
        ? V2_URGENCY.MEDIUM
        : V2_URGENCY.LOW;

    const boardRiskLevel = this.getBoardRiskLevel(context.boardConfidence);
    const boardStance = resolveContractWarningBoardStance(
      boardRiskLevel,
      context.operatingBalance,
      context.roleTier
    );
    const agentStance = `Agent has submitted a counter-demand for ${context.counterYears} year(s) at +${context.counterWageAdjustmentPct}% wage and expects a quick response.`;
    const packages = buildContractWarningRenewalPackages({
      daysRemaining: context.daysRemaining,
      roleTier: context.roleTier
    });
    const counterPackageIndex = packages.findIndex((pkg) =>
      pkg.years === context.counterYears && pkg.wageAdjustmentPct === context.counterWageAdjustmentPct
    );
    const counterRisk = assessContractWarningRenewalOffer({
      roleTier: context.roleTier,
      daysRemaining: context.daysRemaining,
      ability: context.player.currentAbility,
      offeredIndex: counterPackageIndex >= 0 ? counterPackageIndex : Math.max(0, packages.length - 1),
      packageCount: packages.length,
      negotiationRound: getContractWarningNegotiationRoundFromEventId(sourceEventId) + 1,
      leverageMemoryScore: context.leverageMemoryScore ?? 0
    });
    const counterBoardPolicy = assessContractRenewalBoardPolicy({
      roleTier: context.roleTier,
      boardRiskLevel,
      clubBalance: context.clubBalance,
      budgetBalance: context.budgetBalance,
      transferBudget: context.transferBudget,
      currentWeeklyWage: context.player.weeklyWage,
      years: context.counterYears,
      wageAdjustmentPct: context.counterWageAdjustmentPct,
      ability: context.player.currentAbility,
      negotiationRound: nextNegotiationRound
    });

    const options: EventOption[] = [
      {
        id: `contract_warn:renew:${context.player.id}:${context.counterYears}:${context.counterWageAdjustmentPct}`,
        label: `Accept agent counter: ${context.counterYears}-year deal (+${context.counterWageAdjustmentPct}% wage)`,
        effects: {},
        acceptanceRisk: counterRisk.acceptanceRisk,
        acceptanceHint: counterRisk.acceptanceHint,
        ...(counterBoardPolicy.level !== 'NONE' ? {
          boardPolicyLevel: counterBoardPolicy.level,
          boardPolicyWarning: counterBoardPolicy.warning || undefined
        } : {})
      },
      ...(packages
        .filter((pkg) =>
          pkg.years === context.counterYears && pkg.wageAdjustmentPct === context.counterWageAdjustmentPct
            ? false
            : pkg.wageAdjustmentPct <= context.counterWageAdjustmentPct
        )
        .sort((a, b) => b.wageAdjustmentPct - a.wageAdjustmentPct || b.years - a.years)
        .slice(0, 1)
        .map((pkg) => {
          const pkgIndex = packages.findIndex((candidate) =>
            candidate.years === pkg.years && candidate.wageAdjustmentPct === pkg.wageAdjustmentPct
          );
          const revisedRisk = assessContractWarningRenewalOffer({
            roleTier: context.roleTier,
            daysRemaining: context.daysRemaining,
            ability: context.player.currentAbility,
            offeredIndex: pkgIndex >= 0 ? pkgIndex : 0,
            packageCount: packages.length,
            negotiationRound: nextNegotiationRound,
            leverageMemoryScore: context.leverageMemoryScore ?? 0
          });
          const revisedBoardPolicy = assessContractRenewalBoardPolicy({
            roleTier: context.roleTier,
            boardRiskLevel,
            clubBalance: context.clubBalance,
            budgetBalance: context.budgetBalance,
            transferBudget: context.transferBudget,
            currentWeeklyWage: context.player.weeklyWage,
            years: pkg.years,
            wageAdjustmentPct: pkg.wageAdjustmentPct,
            ability: context.player.currentAbility,
            negotiationRound: nextNegotiationRound
          });
          return {
            id: `contract_warn:renew:${context.player.id}:${pkg.years}:${pkg.wageAdjustmentPct}`,
            label: `Push back with revised offer: ${pkg.years}-year deal (+${pkg.wageAdjustmentPct}% wage)`,
            effects: {},
            acceptanceRisk: revisedRisk.acceptanceRisk,
            acceptanceHint: revisedRisk.acceptanceHint,
            ...(revisedBoardPolicy.level !== 'NONE' ? {
              boardPolicyLevel: revisedBoardPolicy.level,
              boardPolicyWarning: revisedBoardPolicy.warning || undefined
            } : {})
          } as EventOption;
        })),
      {
        id: `contract_warn:promise:${context.player.id}`,
        label: buildContractWarningPromiseLabel({
          daysRemaining: context.daysRemaining,
          roleTier: context.roleTier,
          boardRiskLevel
        }),
        effects: {}
      },
      {
        id: `contract_warn:release:${context.player.id}:${context.releaseCompensationWeeks}`,
        label: buildContractWarningReleaseLabel({
          compensationWeeks: context.releaseCompensationWeeks,
          roleTier: context.roleTier,
          boardRiskLevel
        }),
        effects: {}
      }
    ];

    const followUpEventId = this.buildContractWarningCounterEventId(sourceEventId, nextNegotiationRound);
    const description =
      `${context.player.position} | Age ${context.player.age} | Wage EUR ${Math.max(450, Math.round(context.player.weeklyWage)).toLocaleString()} / week | ${context.roleTier}. `
      + `Contract expires on ${contractEndIso} (${context.daysRemaining} day${context.daysRemaining === 1 ? '' : 's'} remaining). `
      + `Agent stance: ${agentStance} Board stance: ${boardStance}`;

    await tx.v2InboxEvent.create({
      data: {
        id: followUpEventId,
        careerId: career.id,
        weekNumber: career.weekNumber,
        title: `Agent Counter-Demand (Round ${nextNegotiationRound}): ${playerName}`,
        description,
        urgency,
        options: JSON.stringify(options),
        deadline: addDays(career.currentDate, context.daysRemaining <= 14 ? 1 : 2),
        status: 'PENDING',
        autoResolved: false
      }
    });

    return followUpEventId;
  }

  private buildContractWarningRejectFalloutEventId(sourceEventId: string): string {
    const baseEventId = this.getContractWarningNegotiationBaseEventId(sourceEventId);
    return `${baseEventId}:reject-fallout`;
  }

  private async createContractWarningRejectFalloutInboxEvent(
    tx: DbClient,
    career: V2Career,
    sourceEventId: string,
    context: {
      player: {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string | null;
        position: string;
        currentAbility: number;
        age: number;
        weeklyWage: number;
        contractEnd: Date | null;
      };
      roleTier: ContractWarningRoleTier;
      daysRemaining: number;
      boardConfidence: number;
      operatingBalance: number;
      negotiationRound: number;
    }
  ): Promise<string> {
    const playerName = context.player.fullName?.trim() || `${context.player.firstName} ${context.player.lastName}`.trim();
    const contractEnd = context.player.contractEnd ?? addDays(career.currentDate, Math.max(7, context.daysRemaining));
    const contractEndIso = contractEnd.toISOString().slice(0, 10);
    const boardRiskLevel = this.getBoardRiskLevel(context.boardConfidence);
    const boardStance = resolveContractWarningBoardStance(
      boardRiskLevel,
      context.operatingBalance,
      context.roleTier
    );

    const coreOrProspect = context.roleTier === 'CORE' || context.roleTier === 'PROSPECT';
    const urgency = (coreOrProspect && context.daysRemaining <= 45) || boardRiskLevel === 'PRESSURE' || boardRiskLevel === 'CRITICAL'
      ? V2_URGENCY.HIGH
      : V2_URGENCY.MEDIUM;

    const boardCalmDelta = boardRiskLevel === 'PRESSURE' || boardRiskLevel === 'CRITICAL' ? 2 : 1;
    const dressingRoomBoost = coreOrProspect ? 2 : 1;
    const repeatedTalksPenalty = context.negotiationRound >= 1 ? 1 : 0;

    const options: EventOption[] = [
      {
        id: `contract_reject_fallout:${context.player.id}:board`,
        label: 'Brief the board and defend the wage structure',
        effects: {
          boardDelta: boardCalmDelta,
          moraleDelta: coreOrProspect ? -1 : 0,
          playerMoraleDelta: coreOrProspect ? -1 : 0
        }
      },
      {
        id: `contract_reject_fallout:${context.player.id}:locker_room`,
        label: 'Meet the dressing-room leaders and reset expectations',
        effects: {
          moraleDelta: 2 - Math.min(1, repeatedTalksPenalty),
          playerMoraleDelta: dressingRoomBoost,
          boardDelta: -1
        }
      },
      {
        id: `contract_reject_fallout:${context.player.id}:media`,
        label: 'Control the media line and avoid escalation',
        effects: {
          moraleDelta: 1,
          boardDelta: boardRiskLevel === 'STABLE' ? 1 : 0,
          budgetDelta: repeatedTalksPenalty > 0 ? -5000 : 0
        }
      }
    ];

    const titlePrefix = coreOrProspect ? 'Contract Fallout (Key Player)' : 'Contract Fallout';
    const description =
      `${context.player.position} | ${context.roleTier} | Age ${context.player.age} | Wage EUR ${Math.max(450, Math.round(context.player.weeklyWage)).toLocaleString()} / week. `
      + `Talks stalled and the contract still expires on ${contractEndIso} (${context.daysRemaining} day${context.daysRemaining === 1 ? '' : 's'} remaining). `
      + `Board stance: ${boardStance} `
      + `${coreOrProspect ? 'Senior players are asking for clarity on the club plan.' : 'Squad members are watching how the situation is handled.'} `
      + `Local media have started asking whether the club can manage the contract situation${context.negotiationRound >= 1 ? ' after repeated rounds of talks' : ''}.`;

    const falloutEventId = this.buildContractWarningRejectFalloutEventId(sourceEventId);
    await tx.v2InboxEvent.create({
      data: {
        id: falloutEventId,
        careerId: career.id,
        weekNumber: career.weekNumber,
        title: `${titlePrefix}: ${playerName}`,
        description,
        urgency,
        options: JSON.stringify(options),
        deadline: addDays(career.currentDate, urgency === V2_URGENCY.HIGH ? 1 : 2),
        status: 'PENDING',
        autoResolved: false
      }
    });

    return falloutEventId;
  }

  private extractContractWarningPlayerIdsFromOptions(optionsJson: string | null | undefined): number[] {
    if (!optionsJson || typeof optionsJson !== 'string') {
      return [];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(optionsJson);
    } catch {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    const ids = new Set<number>();
    for (const row of parsed) {
      const optionId = typeof row === 'object' && row !== null ? (row as { id?: unknown }).id : null;
      if (typeof optionId !== 'string') {
        continue;
      }
      const parsedContractOption = this.parseContractWarningOptionId(optionId);
      if (parsedContractOption?.playerId) {
        ids.add(parsedContractOption.playerId);
      }
    }

    return Array.from(ids);
  }

  private parseAuditMetadataRecord(raw: string | null | undefined): Record<string, unknown> | null {
    if (!raw || typeof raw !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private async resolveCompetitionWindowSnapshot(
    career: Pick<V2Career, 'id' | 'weekNumber'>,
    dbClient: DbClient = this.prisma
  ): Promise<CompetitionWindowSnapshot> {
    const maxWeekAggregate = await dbClient.v2Fixture.aggregate({
      where: { careerId: career.id },
      _max: { weekNumber: true }
    });
    const finalWeekNumber = Math.max(4, Number(maxWeekAggregate._max.weekNumber ?? 38));
    const openingWindowEnd = Math.min(finalWeekNumber, Math.max(3, Math.min(4, Math.floor(finalWeekNumber * 0.12) + 1)));
    const midWindowStart = Math.min(
      finalWeekNumber,
      Math.max(openingWindowEnd + 4, Math.round(finalWeekNumber / 2) - 1)
    );
    const midWindowEnd = Math.min(finalWeekNumber, midWindowStart + 2);
    const windows = [
      {
        start: 1,
        end: openingWindowEnd,
        label: 'Opening window'
      },
      {
        start: midWindowStart,
        end: midWindowEnd,
        label: 'Midseason window'
      }
    ].filter((window, index, all) =>
      window.start <= window.end
      && (index === 0 || window.start > all[index - 1].end)
    );

    return {
      finalWeekNumber,
      seasonPhase: this.resolveCompetitionSeasonPhase(
        career.weekNumber,
        finalWeekNumber,
        openingWindowEnd,
        midWindowStart,
        midWindowEnd
      ),
      registrationWindow: this.buildCompetitionWindowState('Registration', career.weekNumber, windows),
      transferWindow: this.buildCompetitionWindowState('Transfer', career.weekNumber, windows)
    };
  }

  private buildCompetitionWindowState(
    windowName: 'Registration' | 'Transfer',
    currentWeekNumber: number,
    windows: Array<{ start: number; end: number; label: string }>
  ): CompetitionWindowState {
    const activeWindow = windows.find((window) => currentWeekNumber >= window.start && currentWeekNumber <= window.end) ?? null;
    const nextWindow = windows.find((window) => window.start > currentWeekNumber) ?? null;
    const fallbackWindow = activeWindow ?? nextWindow ?? windows[windows.length - 1] ?? {
      start: 1,
      end: 1,
      label: 'Season window'
    };
    const isOpen = Boolean(activeWindow);
    const status: CompetitionWindowStatus = activeWindow
      ? currentWeekNumber >= activeWindow.end
        ? 'DEADLINE'
        : 'OPEN'
      : 'CLOSED';
    const currentLabel = activeWindow?.label ?? nextWindow?.label ?? fallbackWindow.label;
    const note = activeWindow
      ? status === 'DEADLINE'
        ? `${windowName} window closes after this week. Finalize business now.`
        : `${windowName} window is open through week ${activeWindow.end}.`
      : nextWindow
        ? `${windowName} window is closed. It reopens in week ${nextWindow.start}.`
        : `${windowName} window is closed for the rest of the season.`;

    return {
      status,
      label: activeWindow
        ? `${windowName} ${status === 'DEADLINE' ? 'Deadline' : 'Open'}`
        : `${windowName} Closed`,
      isOpen,
      opensWeekNumber: activeWindow?.start ?? fallbackWindow.start,
      closesWeekNumber: activeWindow?.end ?? fallbackWindow.end,
      nextOpenWeekNumber: isOpen ? null : nextWindow?.start ?? null,
      weeksRemaining: activeWindow
        ? Math.max(0, activeWindow.end - currentWeekNumber)
        : nextWindow
          ? Math.max(0, nextWindow.start - currentWeekNumber)
          : 0,
      note: `${currentLabel}: ${note}`
    };
  }

  private resolveCompetitionSeasonPhase(
    currentWeekNumber: number,
    finalWeekNumber: number,
    openingWindowEnd: number,
    midWindowStart: number,
    midWindowEnd: number
  ): CompetitionSeasonPhase {
    const runInStart = Math.max(midWindowEnd + 1, finalWeekNumber - 4);
    if (currentWeekNumber <= openingWindowEnd) {
      return {
        code: 'OPENING_WINDOW',
        label: 'Opening Window',
        note: 'Early-season squad registration and transfer business are still live.'
      };
    }
    if (currentWeekNumber < midWindowStart) {
      return {
        code: 'FIRST_HALF',
        label: 'First Half',
        note: 'League positions are settling and rule windows are currently shut.'
      };
    }
    if (currentWeekNumber <= midWindowEnd) {
      return {
        code: 'MIDSEASON_WINDOW',
        label: 'Midseason Window',
        note: 'The winter rules window is open for registration and transfer moves.'
      };
    }
    if (currentWeekNumber >= finalWeekNumber) {
      return {
        code: 'FINAL_WEEK',
        label: 'Final Week',
        note: 'The season is closing. Competition outcomes will lock after this round.'
      };
    }
    if (currentWeekNumber >= runInStart) {
      return {
        code: 'RUN_IN',
        label: 'Run-In',
        note: 'The final stretch is underway. Selection discipline and suspension management matter most now.'
      };
    }
    return {
      code: 'SECOND_HALF',
      label: 'Second Half',
      note: 'The league has moved beyond the midseason window and table momentum is taking shape.'
    };
  }

  private buildPlayerSuspensionId(careerId: string, fixtureId: string, playerId: number) {
    return `${careerId}:susp:${fixtureId}:${playerId}`;
  }

  private async assertTransferWindowOpen(career: Pick<V2Career, 'id' | 'weekNumber'>, dbClient: DbClient = this.prisma) {
    const competitionWindows = await this.resolveCompetitionWindowSnapshot(career, dbClient);
    if (!competitionWindows.transferWindow.isOpen) {
      throw new Error(`Transfer window is closed. ${competitionWindows.transferWindow.note}`);
    }
    return competitionWindows.transferWindow;
  }

  private buildSuspensionNote(reason: string, matchesRemaining: number) {
    const normalizedReason = String(reason || 'Suspension').trim();
    const nextFixtureLabel = matchesRemaining === 1 ? 'the next league fixture' : `the next ${matchesRemaining} league fixtures`;
    return `${normalizedReason}. Unavailable for ${nextFixtureLabel}.`;
  }

  private buildLegacySuspensionFallback(
    careerId: string,
    playerId: number,
    playerName: string,
    currentWeekNumber: number
  ): ActivePlayerSuspension {
    return {
      suspensionId: `${careerId}:susp:legacy:${playerId}`,
      playerId,
      playerName,
      matchesRemaining: 1,
      reason: 'Legacy carry-over suspension',
      issuedWeekNumber: Math.max(1, currentWeekNumber - 1),
      sourceFixtureId: null,
      note: this.buildSuspensionNote('Legacy carry-over suspension', 1),
      isLegacyFallback: true
    };
  }

  private async getActivePlayerSuspensionMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayerSuspension>> {
    const activeByPlayer = new Map<number, ActivePlayerSuspension>();
    const resolvedSuspensionIds = new Set<string>();

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_DISCIPLINE',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 512,
      select: { metadata: true }
    });

    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const source = this.toNullableString(metadata.source);
      const suspensionId = this.toNullableString(metadata.suspensionId);
      if (!source || !suspensionId) {
        continue;
      }

      if (source === 'MATCH_SUSPENSION_SERVED') {
        resolvedSuspensionIds.add(suspensionId);
        continue;
      }

      if (source !== 'MATCH_SUSPENSION_SET' || resolvedSuspensionIds.has(suspensionId)) {
        continue;
      }

      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0 || activeByPlayer.has(playerId)) {
        continue;
      }

      const matchesRemaining = Math.max(0, Math.round(this.toFiniteNumber(metadata.matchesRemaining) ?? 0));
      if (matchesRemaining <= 0) {
        continue;
      }

      const issuedWeekNumber = Math.max(1, Math.round(this.toFiniteNumber(metadata.issuedWeekNumber) ?? 1));
      const playerName = this.toNullableString(metadata.playerName) || `Player ${playerId}`;
      const reason = this.toNullableString(metadata.reason) || 'Match suspension';
      activeByPlayer.set(playerId, {
        suspensionId,
        playerId,
        playerName,
        matchesRemaining,
        reason,
        issuedWeekNumber,
        sourceFixtureId: this.toNullableString(metadata.sourceFixtureId),
        note: this.buildSuspensionNote(reason, matchesRemaining)
      });
    }

    return activeByPlayer;
  }

  private resolveTransferAgentPressure(context: {
    currentAbility: number | null | undefined;
    potentialAbility: number | null | undefined;
    age: number | null | undefined;
    scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH';
  }): TransferAgentPressure {
    const ability = Number(context.currentAbility ?? 60);
    const potential = Number(context.potentialAbility ?? Math.max(ability, 65));
    const age = Number(context.age ?? 25);
    let pressureScore = 0;
    if (ability >= 81) pressureScore += 2;
    else if (ability >= 74) pressureScore += 1;
    if (potential >= 86) pressureScore += 2;
    else if (potential >= 80) pressureScore += 1;
    if (age <= 21) pressureScore += 1;
    if (context.scoutingTag === 'INTERNATIONAL') pressureScore += 1;
    if (context.scoutingTag === 'YOUTH' && age <= 20) pressureScore += 1;
    if (pressureScore >= 4) return 'HIGH';
    if (pressureScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  private resolveTransferSellerStance(context: {
    askingFee: number;
    marketValue: number;
    currentAbility: number | null | undefined;
    sellerTier: number | null | undefined;
    controlledTier: number;
  }): TransferSellerStance {
    const ability = Number(context.currentAbility ?? 60);
    const sellerTier = Number(context.sellerTier ?? context.controlledTier);
    let pressureScore = 0;
    if (context.askingFee >= Math.round(context.marketValue * 1.15)) pressureScore += 2;
    else if (context.askingFee >= Math.round(context.marketValue * 1.02)) pressureScore += 1;
    if (ability >= 82) pressureScore += 2;
    else if (ability >= 74) pressureScore += 1;
    if (sellerTier < context.controlledTier) pressureScore -= 1;
    if (sellerTier > context.controlledTier) pressureScore += 1;
    if (pressureScore >= 4) return 'AGGRESSIVE';
    if (pressureScore >= 2) return 'RELUCTANT';
    return 'OPEN';
  }

  private buildTransferClauseSummary(
    terms: TransferNegotiationTerms,
    kind: TransferOfferKind
  ): string[] {
    const clauses: string[] = [];
    if (kind === 'LOAN') {
      if (Number(terms.loanDurationWeeks ?? 0) > 0) {
        clauses.push(`${terms.loanDurationWeeks} week loan`);
      }
      if (Number(terms.wageContributionPct ?? 0) > 0) {
        clauses.push(`${terms.wageContributionPct}% wage contribution`);
      }
      if (Number(terms.buyOptionFee ?? 0) > 0) {
        clauses.push(`buy option EUR ${Number(terms.buyOptionFee).toLocaleString()}`);
      }
    } else if (Number(terms.sellOnPct ?? 0) > 0) {
      clauses.push(`${terms.sellOnPct}% sell-on clause`);
    }
    return clauses;
  }

  private buildTransferScoutingStyle(position: string, age: number | null, potentialAbility: number | null): string {
    const normalized = String(position || '').trim().toUpperCase();
    const ageValue = Number(age ?? 25);
    const potential = Number(potentialAbility ?? 70);
    if (normalized === 'GK') return potential >= 80 ? 'Sweeper keeper with upside' : 'Reliable line goalkeeper';
    if (normalized === 'CB') return ageValue <= 23 ? 'Front-foot defender with development runway' : 'Set-piece dominant centre-back';
    if (normalized === 'RB' || normalized === 'LB') return potential >= 80 ? 'High-motor overlapping full-back' : 'Positionally disciplined full-back';
    if (normalized === 'DM') return 'Ball-winning screen who stabilises transitions';
    if (normalized === 'CM') return potential >= 82 ? 'Progressive central midfielder' : 'Box-to-box facilitator';
    if (normalized === 'AM') return 'Final-third creator between the lines';
    if (normalized === 'RW' || normalized === 'LW') return potential >= 82 ? 'Direct wide runner with upside' : 'Wide carrier who attacks isolated defenders';
    return ageValue <= 22 ? 'Mobile forward with development headroom' : 'Penalty-box finisher';
  }

  private buildTransferScoutingReport(context: {
    career: V2Career;
    target: TransferMarketTarget;
    controlledTier: number;
    availableBudget: number;
    clubOperationsLevels?: ClubOperationsLevels;
  }): TransferScoutingReport {
    const clubOperationModifiers = resolveClubOperationsPerformanceModifiers(
      normalizeClubOperationsLevels(context.clubOperationsLevels)
    );
    const age = context.target.age;
    const ability = Number(context.target.currentAbility ?? 60);
    const potential = Number(context.target.potentialAbility ?? Math.max(ability, 65));
    const agentPressure = this.resolveTransferAgentPressure({
      currentAbility: context.target.currentAbility,
      potentialAbility: context.target.potentialAbility,
      age,
      scoutingTag: context.target.scoutingTag
    });
    const sellerStance = this.resolveTransferSellerStance({
      askingFee: context.target.askingFee,
      marketValue: context.target.marketValue,
      currentAbility: context.target.currentAbility,
      sellerTier: context.target.sellerTier,
      controlledTier: context.controlledTier
    });
    const confidenceBase = context.target.scoutingTag === 'LOCAL'
      ? 86
      : context.target.scoutingTag === 'NATIONAL'
        ? 80
        : context.target.scoutingTag === 'YOUTH'
          ? 73
          : 68;
    const confidence = clamp(
      confidenceBase
        + (potential - ability) / 3
        + ((context.target.fitScore + clubOperationModifiers.scoutingFitBonus) - 65) / 6
        + clubOperationModifiers.scoutingConfidenceBonus,
      55,
      96
    );
    const squadRoleProjection = ability >= 80
      ? 'STARTER'
      : ability >= 70
        ? 'ROTATION'
        : 'PROSPECT';
    const style = this.buildTransferScoutingStyle(context.target.position, age, context.target.potentialAbility);
    const strengths = [
      context.target.fitScore >= 78
        ? `Immediate upgrade profile for ${context.target.position}.`
        : `Covers the current ${context.target.position} depth gap.`,
      potential - ability >= 7
        ? 'Development ceiling remains strong.'
        : 'Should stabilise performance level immediately.',
      clubOperationModifiers.scoutingConfidenceBonus > 0
        ? 'Recruitment staff produced an above-baseline live report.'
        : 'Recruitment team view is still at base coverage depth.',
      agentPressure === 'LOW'
        ? 'Negotiation posture should stay controlled.'
        : 'Agent camp expects a decisive move.'
    ];
    const risks = [
      sellerStance === 'AGGRESSIVE'
        ? 'Selling club is likely to hold firm on price.'
        : sellerStance === 'RELUCTANT'
          ? 'Selling club wants near-market compensation.'
          : 'Selling club could still be persuaded by the right structure.',
      context.target.isAffordable
        ? 'Wage growth needs to stay within structure.'
        : `Budget gap still sits at EUR ${context.target.budgetGap.toLocaleString()}.`,
      context.target.scoutingTag === 'INTERNATIONAL'
        ? 'Adaptation risk is higher from the broader scouting scope.'
        : context.target.scoutingTag === 'YOUTH'
          ? 'Readiness risk remains higher than the headline upside.'
          : 'Projection is based on limited live observation.'
    ];
    const recommendedBidFee = Math.round(
      context.target.askingFee * (
        sellerStance === 'OPEN' ? 0.94 : sellerStance === 'RELUCTANT' ? 0.99 : 1.04
      ) / 1000
    ) * 1000;
    const recommendedWeeklyWage = Math.round(context.target.weeklyWage * (
      agentPressure === 'LOW' ? 0.98 : agentPressure === 'MEDIUM' ? 1.04 : 1.1
    ));
    const requestedLoanFee = Math.round((context.target.askingFee * (
      context.target.currentAbility && context.target.currentAbility >= 78 ? 0.14 : 0.09
    )) / 1000) * 1000;
    const requestedWageContributionPct = agentPressure === 'LOW' ? 55 : agentPressure === 'MEDIUM' ? 72 : 88;
    const maxQuarterlyContributionBudget = Math.max(
      0,
      Math.round(Math.max(0, context.availableBudget) * (context.target.isAffordable ? 0.58 : 0.42))
    );
    const affordableContributionPct = context.target.weeklyWage > 0
      ? clamp(
        Math.floor((maxQuarterlyContributionBudget / Math.max(1, context.target.weeklyWage * 4)) * 100),
        0,
        requestedWageContributionPct
      )
      : requestedWageContributionPct;
    const recommendedWageContributionPct = context.availableBudget > 0 && !context.target.isAffordable
      ? affordableContributionPct
      : requestedWageContributionPct;
    const projectedLoanWage = Math.max(
      0,
      Math.round(context.target.weeklyWage * (recommendedWageContributionPct / 100))
    );
    const maxAffordableLoanFee = Math.max(0, context.availableBudget - (projectedLoanWage * 4));
    const recommendedLoanFee = context.availableBudget > 0 && !context.target.isAffordable
      ? Math.min(requestedLoanFee, Math.max(0, Math.floor(maxAffordableLoanFee / 1000) * 1000))
      : requestedLoanFee;
    const loanPackageFitsBudget = recommendedLoanFee + (projectedLoanWage * 4) <= Math.max(0, context.availableBudget);
    const recommendation = context.target.fitScore >= 82 && context.target.isAffordable
      ? 'PRIORITY'
      : context.target.scoutingTag === 'YOUTH' || potential - ability >= 8 || (!context.target.isAffordable && loanPackageFitsBudget)
        ? 'VALUE_LOAN'
        : context.target.fitScore >= 68
          ? 'MONITOR'
          : 'AVOID';
    const requestedBuyOptionFee = recommendation === 'VALUE_LOAN' || age !== null && age <= 22
      ? Math.round(context.target.askingFee * 1.03 / 1000) * 1000
      : null;
    const recommendedBuyOptionFee = !loanPackageFitsBudget || recommendedLoanFee <= 0
      ? null
      : requestedBuyOptionFee;

    return {
      playerId: context.target.playerId,
      scoutedAtWeekNumber: context.career.weekNumber,
      confidence,
      recommendation,
      style,
      squadRoleProjection,
      summary: `${context.target.fullName} profiles as a ${style.toLowerCase()} and grades as a ${recommendation.toLowerCase().replace('_', ' ')} action.`,
      strengths,
      risks,
      agentPressure,
      sellerStance,
      recommendedBidFee,
      recommendedWeeklyWage,
      recommendedLoanFee,
      recommendedWageContributionPct,
      recommendedBuyOptionFee
    };
  }

  private async getActiveTransferShortlistMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, TransferShortlistEntry>> {
    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'TRANSFER_SHORTLIST'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 400
    });

    const shortlist = new Map<number, TransferShortlistEntry>();
    const seen = new Set<number>();
    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      const playerId = Number(metadata?.playerId);
      if (!Number.isFinite(playerId) || playerId <= 0 || seen.has(playerId)) {
        continue;
      }
      seen.add(playerId);
      if (String(metadata?.action || '').toUpperCase() !== 'ADD') {
        continue;
      }
      shortlist.set(playerId, {
        playerId,
        addedAtWeekNumber: clamp(Math.round(Number(metadata?.weekNumber ?? 0)), 0, 99)
      });
    }
    return shortlist;
  }

  private async getTransferScoutingReportMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, TransferScoutingReport>> {
    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'TRANSFER_SCOUT'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 400
    });

    const reports = new Map<number, TransferScoutingReport>();
    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      const playerId = Number(metadata?.playerId);
      if (!Number.isFinite(playerId) || playerId <= 0 || reports.has(playerId)) {
        continue;
      }
      const report = metadata?.report;
      if (!report || typeof report !== 'object') {
        continue;
      }
      reports.set(playerId, report as TransferScoutingReport);
    }
    return reports;
  }

  private async getClubOperationsLevels(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<ClubOperationsLevels> {
    const audit = await dbClient.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'CLUB_OPERATIONS'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });

    if (!audit) {
      return normalizeClubOperationsLevels(null);
    }

    const metadata = this.parseAuditMetadataRecord(audit.metadata);
    return normalizeClubOperationsLevels(
      metadata?.levels && typeof metadata.levels === 'object'
        ? (metadata.levels as Partial<Record<ClubOperationKey, number>>)
        : null
    );
  }

  private async applyClubOperationsWeeklyEffects(
    tx: DbClient,
    careerId: string,
    clubId: number
  ) {
    const levels = await this.getClubOperationsLevels(careerId, tx);
    const modifiers = resolveClubOperationsPerformanceModifiers(levels);
    if (modifiers.projectedWeeklyNetImpact === 0) {
      return;
    }

    await this.applyClubEffects(tx, careerId, clubId, {
      budgetDelta: modifiers.projectedWeeklyNetImpact
    });
  }

  private async getActiveTransferNegotiationMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<string, TransferNegotiationSummary>> {
    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'TRANSFER_NEGOTIATION'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 600
    });

    const negotiations = new Map<string, TransferNegotiationSummary>();
    const closedNegotiationIds = new Set<string>();
    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      const negotiation = metadata?.negotiation;
      if (!negotiation || typeof negotiation !== 'object') {
        continue;
      }
      const summary = negotiation as TransferNegotiationSummary;
      if (!summary.negotiationId) {
        continue;
      }

      if (summary.status !== 'ACTIVE') {
        closedNegotiationIds.add(summary.negotiationId);
        negotiations.delete(summary.negotiationId);
        continue;
      }

      if (!closedNegotiationIds.has(summary.negotiationId) && !negotiations.has(summary.negotiationId)) {
        negotiations.set(summary.negotiationId, summary);
      }
    }
    return negotiations;
  }

  private async getTransferLoanAuditMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, TransferLoanAuditSnapshot>> {
    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'TRANSFER_LOAN'
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 400
    });

    const snapshots = new Map<number, TransferLoanAuditSnapshot>();
    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      const loanId = Number(metadata?.loanId);
      if (!Number.isFinite(loanId) || loanId <= 0 || snapshots.has(loanId)) {
        continue;
      }
      const actionRaw = String(metadata?.action || '').toUpperCase();
      const action = actionRaw === 'RETURNED' || actionRaw === 'PURCHASED' ? actionRaw : 'START';
      snapshots.set(loanId, {
        loanId,
        playerId: Number(metadata?.playerId),
        action,
        originalWeeklyWage: Math.max(450, Math.round(Number(metadata?.originalWeeklyWage ?? 900))),
        wageContributionPct: clamp(Math.round(Number(metadata?.wageContributionPct ?? 100)), 0, 100),
        buyOptionFee: Number.isFinite(Number(metadata?.buyOptionFee))
          ? Math.max(0, Math.round(Number(metadata?.buyOptionFee)))
          : null
      });
    }
    return snapshots;
  }

  private async getActiveIncomingLoanSummaries(
    career: V2Career,
    dbClient: DbClient = this.prisma
  ): Promise<TransferIncomingLoanSummary[]> {
    const [loans, loanAuditMap] = await Promise.all([
      dbClient.loan.findMany({
        where: {
          toClubId: career.controlledClubId,
          status: 'active'
        },
        select: {
          id: true,
          playerId: true,
          fromClubId: true,
          startDate: true,
          endDate: true,
          player: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
              position: true,
              weeklyWage: true
            }
          },
          fromClub: {
            select: {
              name: true
            }
          }
        },
        orderBy: [{ endDate: 'asc' }, { id: 'asc' }]
      }),
      this.getTransferLoanAuditMap(career.id, dbClient)
    ]);

    const millisPerWeek = 1000 * 60 * 60 * 24 * 7;
    return loans.map((loan) => {
      const audit = loanAuditMap.get(loan.id);
      const endDate = loan.endDate ? new Date(loan.endDate) : null;
      const weeksRemaining = endDate
        ? Math.max(0, Math.ceil((endDate.getTime() - career.currentDate.getTime()) / millisPerWeek))
        : 0;
      return {
        loanId: loan.id,
        playerId: loan.playerId,
        playerName: loan.player.fullName?.trim() || `${loan.player.firstName} ${loan.player.lastName}`.trim(),
        position: loan.player.position,
        fromClubId: loan.fromClubId,
        fromClubName: loan.fromClub.name,
        endDate: endDate?.toISOString() ?? null,
        weeksRemaining,
        weeklyWage: Math.max(450, Math.round(loan.player.weeklyWage ?? 900)),
        wageContributionPct: audit?.wageContributionPct ?? 100,
        buyOptionFee: audit?.buyOptionFee ?? null,
        canTriggerBuyOption: Number(audit?.buyOptionFee ?? 0) > 0
      };
    });
  }

  private normalizeRetrainablePosition(value: string | null | undefined): RetrainablePosition | null {
    const normalized = String(value || '').trim().toUpperCase();
    return RETRAINABLE_POSITIONS.includes(normalized as RetrainablePosition)
      ? normalized as RetrainablePosition
      : null;
  }

  private getPositionFamily(position: RetrainablePosition): 'GK' | 'DEF' | 'MID' | 'ATT' {
    if (position === 'GK') return 'GK';
    if (position === 'CB' || position === 'LB' || position === 'RB' || position === 'LWB' || position === 'RWB') return 'DEF';
    if (position === 'DM' || position === 'CM' || position === 'AM') return 'MID';
    return 'ATT';
  }

  private computeWeeklyRetrainingProgressPct(context: {
    currentPosition: RetrainablePosition;
    targetPosition: RetrainablePosition;
    age: number;
    roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT';
  }) {
    const sameFamily = this.getPositionFamily(context.currentPosition) === this.getPositionFamily(context.targetPosition);
    const age = Math.max(16, Math.round(context.age || 24));
    let progress = sameFamily ? 18 : 11;
    if (age <= 21) progress += 4;
    else if (age >= 29) progress -= 3;
    if (context.roleTier === 'PROSPECT') progress += 2;
    if (context.roleTier === 'STAR' && !sameFamily) progress -= 1;
    return clamp(progress, 6, 24);
  }

  private computeImmediateRetrainingMoraleDelta(context: {
    currentPosition: RetrainablePosition;
    targetPosition: RetrainablePosition;
    roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT';
  }) {
    const sameFamily = this.getPositionFamily(context.currentPosition) === this.getPositionFamily(context.targetPosition);
    if (context.roleTier === 'PROSPECT') {
      return sameFamily ? 1 : 0;
    }
    if (!sameFamily && context.roleTier === 'STAR') {
      return -1;
    }
    return sameFamily ? 1 : 0;
  }

  private resolveSquadRegistrationRules(league: { name: string; tier: number; level: string; region: string | null } | null): SquadRegistrationRules {
    if (league && this.isO21League(league)) {
      return {
        competitionCategory: 'O21',
        label: league.name || 'O21 registration',
        registrationLimit: 22,
        minimumRegistered: 18,
        overageLimit: 3,
        notes: [
          'Only registered players are eligible for O21 fixtures.',
          'A maximum of 3 overage players can be included in the active list.'
        ]
      };
    }
    if ((league?.tier ?? 5) <= 2) {
      return {
        competitionCategory: 'PRO_SENIOR',
        label: league?.name || 'Professional registration',
        registrationLimit: 22,
        minimumRegistered: 18,
        overageLimit: null,
        notes: [
          'Only registered players are eligible for league fixtures.',
          'Keep at least 18 registered players available for matchday depth.'
        ]
      };
    }
    return {
      competitionCategory: 'AMATEUR_SENIOR',
      label: league?.name || 'Senior registration',
      registrationLimit: 25,
      minimumRegistered: 18,
      overageLimit: null,
      notes: [
        'Only registered players are eligible for league fixtures.',
        'Amateur leagues allow a wider registration list.'
      ]
    };
  }

  private async getSquadRegistrationSnapshot(
    career: Pick<V2Career, 'id' | 'currentDate' | 'activeLeagueId'>,
    squadPlayers: Array<{
      id: number;
      firstName: string;
      lastName: string;
      fullName: string | null;
      position: string;
      dateOfBirth: Date | null;
      age: number | null;
      currentAbility: number | null;
      potentialAbility: number | null;
    }>,
    dbClient: DbClient = this.prisma
  ): Promise<SquadRegistrationSnapshot> {
    const league = career.activeLeagueId
      ? await dbClient.league.findUnique({
        where: { id: career.activeLeagueId },
        select: { id: true, name: true, tier: true, level: true, region: true }
      })
      : null;
    const rules = this.resolveSquadRegistrationRules(league);
    const agesByPlayer = new Map<number, number>();
    for (const player of squadPlayers) {
      agesByPlayer.set(player.id, this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id));
    }

    const latestSnapshotAudit = await dbClient.v2AuditLog.findFirst({
      where: {
        careerId: career.id,
        category: 'SQUAD_REGISTRATION',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      select: { metadata: true }
    });

    let registeredPlayerIds = new Set<number>();
    let manualOverride = false;
    const metadata = this.parseAuditMetadataRecord(latestSnapshotAudit?.metadata);
    const snapshotIds = Array.isArray(metadata?.registeredPlayerIds)
      ? (metadata?.registeredPlayerIds as unknown[])
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [];

    if (snapshotIds.length > 0) {
      manualOverride = true;
      for (const playerId of snapshotIds) {
        if (!squadPlayers.some((player) => player.id === playerId)) {
          continue;
        }
        registeredPlayerIds.add(playerId);
      }
    } else {
      const rankedPlayers = [...squadPlayers].sort((a, b) =>
        (Number(b.currentAbility ?? 0) - Number(a.currentAbility ?? 0))
        || (Number(b.potentialAbility ?? 0) - Number(a.potentialAbility ?? 0))
        || a.id - b.id
      );
      const preferred = rules.competitionCategory === 'O21'
        ? [
          ...rankedPlayers.filter((player) => (agesByPlayer.get(player.id) ?? 24) <= 21),
          ...rankedPlayers.filter((player) => (agesByPlayer.get(player.id) ?? 24) > 21)
        ]
        : rankedPlayers;
      for (const player of preferred) {
        if (registeredPlayerIds.size >= rules.registrationLimit) {
          break;
        }
        const isOverage = rules.competitionCategory === 'O21' && (agesByPlayer.get(player.id) ?? 24) > 21;
        const currentOverage = Array.from(registeredPlayerIds).filter((id) => (agesByPlayer.get(id) ?? 24) > 21).length;
        if (isOverage && currentOverage >= (rules.overageLimit ?? 0)) {
          continue;
        }
        registeredPlayerIds.add(player.id);
      }
    }

    const overageCount = Array.from(registeredPlayerIds).filter((id) => (agesByPlayer.get(id) ?? 24) > 21).length;
    const byPlayerId = new Map<number, { isRegistered: boolean; overageSlotUsed: boolean; note: string }>();
    for (const player of squadPlayers) {
      const age = agesByPlayer.get(player.id) ?? 24;
      const isRegistered = registeredPlayerIds.has(player.id);
      const overageSlotUsed = rules.competitionCategory === 'O21' && age > 21 && isRegistered;
      let note = isRegistered
        ? 'Registered for the active competition.'
        : 'Outside the active competition list.';
      if (!isRegistered && rules.competitionCategory === 'O21' && age > 21) {
        note = overageCount >= (rules.overageLimit ?? 0)
          ? 'Not registered: all overage slots are currently used.'
          : 'Not registered: this player requires one of the limited overage slots.';
      }
      byPlayerId.set(player.id, {
        isRegistered,
        overageSlotUsed,
        note
      });
    }

    return {
      rules,
      registeredPlayerIds,
      registeredCount: registeredPlayerIds.size,
      overageCount,
      manualOverride,
      byPlayerId
    };
  }

  private async getSquadRoleAssignmentsMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, { roleAssignment: SquadRoleAssignment; weekNumber: number | null }>> {
    const assignments = new Map<number, { roleAssignment: SquadRoleAssignment; weekNumber: number | null }>();

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'SQUAD_ROLE',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 256,
      select: {
        metadata: true
      }
    });

    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }
      if (this.toNullableString(metadata.source) !== 'SQUAD_ROLE_ASSIGNMENT') {
        continue;
      }
      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0 || assignments.has(playerId)) {
        continue;
      }
      const role = (this.toNullableString(metadata.roleAssignment) || '').toUpperCase();
      if (role !== 'STARTER' && role !== 'ROTATION' && role !== 'DEPTH') {
        continue;
      }
      const weekNumberRaw = this.toFiniteNumber(metadata.weekNumber);
      assignments.set(playerId, {
        roleAssignment: role as SquadRoleAssignment,
        weekNumber: weekNumberRaw !== null ? Math.round(weekNumberRaw) : null
      });
    }

    return assignments;
  }

  private parsePlayingTimePromiseFollowUpOptionId(optionId: string): ParsedPlayingTimePromiseFollowUpOption | null {
    if (!optionId.startsWith('playtime_promise:')) {
      return null;
    }

    const parts = optionId.split(':');
    if (parts.length < 4) {
      return null;
    }

    const actionRaw = String(parts[1] || '').trim().toLowerCase();
    const playerId = Number(parts[2]);
    const originWeekNumber = Number(parts[3]);
    if (!Number.isFinite(playerId) || playerId <= 0 || !Number.isFinite(originWeekNumber) || originWeekNumber <= 0) {
      return null;
    }

    const action = actionRaw === 'promote'
      ? 'PROMOTE'
      : actionRaw === 'reaffirm'
        ? 'REAFFIRM'
        : actionRaw === 'close'
          ? 'CLOSE'
          : null;

    if (!action) {
      return null;
    }

    return {
      action,
      playerId: Math.round(playerId),
      originWeekNumber: Math.round(originWeekNumber)
    };
  }

  private async getActivePlayingTimePromiseMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayingTimePromise>> {
    const activeByPlayer = new Map<number, ActivePlayingTimePromise>();

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_PROMISE',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 512,
      select: { metadata: true }
    });

    for (const audit of [...audits].reverse()) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const source = this.toNullableString(metadata.source);
      if (source === 'PLAYING_TIME_PROMISE_CREATE') {
        const playerIdRaw = this.toFiniteNumber(metadata.playerId);
        const createdWeekRaw = this.toFiniteNumber(metadata.createdWeekNumber);
        const dueWeekRaw = this.toFiniteNumber(metadata.dueWeekNumber);
        const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
        const createdWeekNumber = createdWeekRaw !== null ? Math.round(createdWeekRaw) : 0;
        const dueWeekNumber = dueWeekRaw !== null ? Math.round(dueWeekRaw) : 0;
        if (playerId <= 0 || createdWeekNumber <= 0 || dueWeekNumber <= 0) {
          continue;
        }
        const promisedRole = (this.toNullableString(metadata.promisedRoleAssignment) || 'ROTATION').toUpperCase();
        if (promisedRole !== 'STARTER' && promisedRole !== 'ROTATION' && promisedRole !== 'DEPTH') {
          continue;
        }
        activeByPlayer.set(playerId, {
          promiseId: this.toNullableString(metadata.promiseId) || `${careerId}:ptp:${playerId}:${createdWeekNumber}`,
          playerId,
          playerName: this.toNullableString(metadata.playerName) || `Player ${playerId}`,
          promisedRoleAssignment: promisedRole as SquadRoleAssignment,
          createdWeekNumber,
          dueWeekNumber,
          reaffirmCount: Math.max(0, Math.round(this.toFiniteNumber(metadata.reaffirmCount) ?? 0)),
          sourceEventId: this.toNullableString(metadata.sourceEventId)
        });
        continue;
      }

      if (source !== 'PLAYING_TIME_PROMISE_REVIEW') {
        continue;
      }

      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const originWeekRaw = this.toFiniteNumber(metadata.originWeekNumber);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      const originWeekNumber = originWeekRaw !== null ? Math.round(originWeekRaw) : 0;
      if (playerId <= 0 || originWeekNumber <= 0) {
        continue;
      }

      const existing = activeByPlayer.get(playerId);
      if (!existing || existing.createdWeekNumber !== originWeekNumber) {
        continue;
      }

      const action = (this.toNullableString(metadata.action) || '').toUpperCase();
      if (action === 'REAFFIRM') {
        const newDueWeekNumber = Math.max(
          existing.dueWeekNumber + 1,
          Math.round(this.toFiniteNumber(metadata.newDueWeekNumber) ?? (existing.dueWeekNumber + 1))
        );
        existing.dueWeekNumber = newDueWeekNumber;
        existing.reaffirmCount = Math.max(existing.reaffirmCount + 1, Math.round(this.toFiniteNumber(metadata.reaffirmCount) ?? (existing.reaffirmCount + 1)));
        continue;
      }

      if (action === 'HONOR' || action === 'CLOSE') {
        activeByPlayer.delete(playerId);
      }
    }

    return activeByPlayer;
  }

  private async getActivePlayerDevelopmentPlanMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayerDevelopmentPlan>> {
    const planByPlayer = new Map<number, ActivePlayerDevelopmentPlan>();

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_DEVELOPMENT_PLAN',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 512,
      select: { metadata: true }
    });

    for (const audit of [...audits].reverse()) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }
      if (this.toNullableString(metadata.source) !== 'PLAYER_DEVELOPMENT_PLAN_SET') {
        continue;
      }

      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0) {
        continue;
      }

      const focus = (this.toNullableString(metadata.focus) || '').toUpperCase();
      const target = (this.toNullableString(metadata.target) || '').toUpperCase();
      if (!['TECHNICAL', 'PHYSICAL', 'TACTICAL', 'MENTAL'].includes(focus)) {
        continue;
      }
      if (!['FIRST_TEAM_PUSH', 'MATCH_SHARPNESS', 'LONG_TERM_UPSIDE', 'INJURY_PREVENTION'].includes(target)) {
        continue;
      }

      const setWeekRaw = this.toFiniteNumber(metadata.weekNumber);
      planByPlayer.set(playerId, {
        planId: this.toNullableString(metadata.planId) || `${careerId}:devplan:${playerId}:${Math.round(setWeekRaw ?? 1)}`,
        playerId,
        playerName: this.toNullableString(metadata.playerName) || `Player ${playerId}`,
        focus: focus as DevelopmentPlanFocus,
        target: target as DevelopmentPlanTarget,
        setWeekNumber: Math.max(1, Math.round(setWeekRaw ?? 1)),
        sourceEventId: this.toNullableString(metadata.sourceEventId)
      });
    }

    return planByPlayer;
  }

  private async getActivePlayerRetrainingPlanMap(
    careerId: string,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayerRetrainingPlan>> {
    const planByPlayer = new Map<number, ActivePlayerRetrainingPlan>();

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_RETRAINING',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 768,
      select: { metadata: true }
    });

    for (const audit of [...audits].reverse()) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const source = (this.toNullableString(metadata.source) || '').toUpperCase();
      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0) {
        continue;
      }

      if (source === 'PLAYER_RETRAINING_CLEAR' || source === 'PLAYER_RETRAINING_COMPLETE') {
        planByPlayer.delete(playerId);
        continue;
      }

      if (source !== 'PLAYER_RETRAINING_SET' && source !== 'PLAYER_RETRAINING_PROGRESS') {
        continue;
      }

      const currentPosition = this.normalizeRetrainablePosition(this.toNullableString(metadata.currentPosition));
      const targetPosition = this.normalizeRetrainablePosition(this.toNullableString(metadata.targetPosition));
      if (!currentPosition || !targetPosition) {
        continue;
      }

      const setWeekRaw = this.toFiniteNumber(metadata.setWeekNumber);
      const progressPctRaw = this.toFiniteNumber(metadata.progressPct);
      const weeklyProgressPctRaw = this.toFiniteNumber(metadata.weeklyProgressPct);
      const existing = planByPlayer.get(playerId);
      planByPlayer.set(playerId, {
        planId: this.toNullableString(metadata.planId) || existing?.planId || `${careerId}:retrain:${playerId}:${Math.max(1, Math.round(setWeekRaw ?? 1))}`,
        playerId,
        playerName: this.toNullableString(metadata.playerName) || existing?.playerName || `Player ${playerId}`,
        currentPosition,
        targetPosition,
        progressPct: clamp(Math.round(progressPctRaw ?? existing?.progressPct ?? 0), 0, 100),
        weeklyProgressPct: clamp(Math.round(weeklyProgressPctRaw ?? existing?.weeklyProgressPct ?? 10), 1, 30),
        setWeekNumber: Math.max(1, Math.round(setWeekRaw ?? existing?.setWeekNumber ?? 1)),
        sourceEventId: this.toNullableString(metadata.sourceEventId) || existing?.sourceEventId || null
      });
    }

    return planByPlayer;
  }

  private async getPlayerMatchUsageSummaryMap(
    careerId: string,
    playerIds: number[],
    sinceWeekNumber: number,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, PlayerMatchUsageSummary>> {
    const targetIds = Array.from(new Set(playerIds.filter((playerId) => Number.isInteger(playerId) && playerId > 0)));
    const summaryByPlayer = new Map<number, PlayerMatchUsageSummary>();
    if (targetIds.length === 0) {
      return summaryByPlayer;
    }

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'MATCH_USAGE',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'asc' },
      take: 2048,
      select: {
        metadata: true
      }
    });

    const minWeekNumber = Math.max(1, Math.round(sinceWeekNumber || 1));
    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }
      if ((this.toNullableString(metadata.source) || '').toUpperCase() !== 'MATCH_USAGE_SUMMARY') {
        continue;
      }

      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (!targetIds.includes(playerId)) {
        continue;
      }

      const weekNumberRaw = this.toFiniteNumber(metadata.weekNumber);
      const weekNumber = weekNumberRaw !== null ? Math.round(weekNumberRaw) : 0;
      if (weekNumber < minWeekNumber) {
        continue;
      }

      const entry = summaryByPlayer.get(playerId) ?? {
        matchdaySquadCount: 0,
        appearanceCount: 0,
        startCount: 0,
        unusedBenchCount: 0,
        totalMinutes: 0,
        lastFixtureId: null,
        lastWeekNumber: null,
        lastRole: null,
        lastSummary: null
      };

      const inMatchdaySquad = Boolean(metadata.inMatchdaySquad);
      const started = Boolean(metadata.started);
      const minutesPlayed = Math.max(0, Math.round(this.toFiniteNumber(metadata.minutesPlayed) ?? 0));
      const roleRaw = (this.toNullableString(metadata.role) || '').toUpperCase();
      const role = roleRaw === 'STARTER' || roleRaw === 'SUBSTITUTE' || roleRaw === 'UNUSED_BENCH'
        ? roleRaw as PlayerMatchUsageSummary['lastRole']
        : null;

      if (inMatchdaySquad) {
        entry.matchdaySquadCount += 1;
      }
      if (minutesPlayed > 0) {
        entry.appearanceCount += 1;
      }
      if (started) {
        entry.startCount += 1;
      }
      if (role === 'UNUSED_BENCH') {
        entry.unusedBenchCount += 1;
      }
      entry.totalMinutes += minutesPlayed;
      entry.lastFixtureId = this.toNullableString(metadata.fixtureId);
      entry.lastWeekNumber = weekNumber;
      entry.lastRole = role;
      entry.lastSummary = this.toNullableString(metadata.summary);
      summaryByPlayer.set(playerId, entry);
    }

    return summaryByPlayer;
  }

  private async getActivePlayerStatusDirectiveMap(
    careerId: string,
    currentWeekNumber: number,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayerStatusDirective>> {
    const directiveByPlayer = new Map<number, ActivePlayerStatusDirective>();
    const normalizedCurrentWeek = Math.max(1, Math.round(Number(currentWeekNumber) || 1));

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_STATUS',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 512,
      select: { metadata: true }
    });

    for (const audit of [...audits].reverse()) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const source = (this.toNullableString(metadata.source) || '').toUpperCase();
      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0) {
        continue;
      }

      if (source === 'PLAYER_STATUS_CLEAR') {
        directiveByPlayer.delete(playerId);
        continue;
      }

      if (source !== 'PLAYER_STATUS_SET') {
        continue;
      }

      const directiveCodeRaw = (this.toNullableString(metadata.directiveCode) || '').toUpperCase();
      if (directiveCodeRaw !== 'REST_RECOVERY' && directiveCodeRaw !== 'LIMITED_MINUTES' && directiveCodeRaw !== 'DISCIPLINARY_NOTE') {
        continue;
      }

      const setWeekRaw = this.toFiniteNumber(metadata.setWeekNumber);
      const expiresWeekRaw = this.toFiniteNumber(metadata.expiresWeekNumber);
      const setWeekNumber = Math.max(1, Math.round(setWeekRaw ?? normalizedCurrentWeek));
      const expiresWeekNumber = Math.max(setWeekNumber, Math.round(expiresWeekRaw ?? setWeekNumber));
      if (expiresWeekNumber < normalizedCurrentWeek) {
        directiveByPlayer.delete(playerId);
        continue;
      }

      directiveByPlayer.set(playerId, {
        directiveId: this.toNullableString(metadata.directiveId) || `${careerId}:psd:${playerId}:${setWeekNumber}:${directiveCodeRaw.toLowerCase()}`,
        playerId,
        playerName: this.toNullableString(metadata.playerName) || `Player ${playerId}`,
        directiveCode: directiveCodeRaw as PlayerStatusDirectiveCode,
        setWeekNumber,
        expiresWeekNumber,
        sourceAction: this.toNullableString(metadata.sourceAction)
      });
    }

    return directiveByPlayer;
  }

  private async getActivePlayerMedicalPlanMap(
    careerId: string,
    currentWeekNumber: number,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, ActivePlayerMedicalPlan>> {
    const planByPlayer = new Map<number, ActivePlayerMedicalPlan>();
    const normalizedCurrentWeek = Math.max(1, Math.round(Number(currentWeekNumber) || 1));

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'PLAYER_MEDICAL_PLAN',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 768,
      select: { metadata: true }
    });

    for (const audit of [...audits].reverse()) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const source = (this.toNullableString(metadata.source) || '').toUpperCase();
      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0) {
        continue;
      }

      if (source === 'PLAYER_MEDICAL_PLAN_CLEAR') {
        planByPlayer.delete(playerId);
        continue;
      }
      if (source !== 'PLAYER_MEDICAL_PLAN_SET') {
        continue;
      }

      const planCode = this.normalizeMedicalPlanCode(this.toNullableString(metadata.planCode));
      if (!planCode) {
        continue;
      }

      const setWeekRaw = this.toFiniteNumber(metadata.setWeekNumber);
      const expiresWeekRaw = this.toFiniteNumber(metadata.expiresWeekNumber);
      const setWeekNumber = Math.max(1, Math.round(setWeekRaw ?? normalizedCurrentWeek));
      const expiresWeekNumber = Math.max(setWeekNumber, Math.round(expiresWeekRaw ?? setWeekNumber));
      if (expiresWeekNumber < normalizedCurrentWeek) {
        planByPlayer.delete(playerId);
        continue;
      }

      planByPlayer.set(playerId, {
        planId: this.toNullableString(metadata.planId) || `${careerId}:medical:${playerId}:${setWeekNumber}:${planCode.toLowerCase()}`,
        playerId,
        playerName: this.toNullableString(metadata.playerName) || `Player ${playerId}`,
        planCode,
        setWeekNumber,
        expiresWeekNumber,
        sourceAction: this.toNullableString(metadata.sourceAction)
      });
    }

    return planByPlayer;
  }

  private async getSquadPlayerRecentHistorySummary(
    careerId: string,
    playerId: number,
    dbClient: DbClient = this.prisma
  ): Promise<SquadPlayerRecentHistorySummary> {
    const summary: SquadPlayerRecentHistorySummary = {
      roleChanges: [],
      developmentPlanChanges: [],
      medicalPlanChanges: [],
      retrainingChanges: [],
      promiseTimeline: []
    };

    if (!Number.isFinite(Number(playerId)) || Number(playerId) <= 0) {
      return summary;
    }

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: {
          in: ['SQUAD_ROLE', 'PLAYER_DEVELOPMENT_PLAN', 'PLAYER_MEDICAL_PLAN', 'PLAYER_PROMISE', 'PLAYER_RETRAINING']
        },
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 256,
      select: {
        category: true,
        message: true,
        metadata: true,
        createdAt: true
      }
    });

    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }

      const metaPlayerIdRaw = this.toFiniteNumber(metadata.playerId);
      const metaPlayerId = metaPlayerIdRaw !== null ? Math.round(metaPlayerIdRaw) : 0;
      if (metaPlayerId !== Math.round(playerId)) {
        continue;
      }

      if (audit.category === 'SQUAD_ROLE') {
        if (summary.roleChanges.length >= 5) {
          continue;
        }
        if (this.toNullableString(metadata.source) !== 'SQUAD_ROLE_ASSIGNMENT') {
          continue;
        }
        const roleAssignment = (this.toNullableString(metadata.roleAssignment) || '').toUpperCase();
        const previousRoleAssignment = (this.toNullableString(metadata.previousRoleAssignment) || '').toUpperCase();
        const expectedRole = (this.toNullableString(metadata.expectedRole) || '').toUpperCase();
        if (!['STARTER', 'ROTATION', 'DEPTH'].includes(roleAssignment)) {
          continue;
        }
        summary.roleChanges.push({
          occurredAt: audit.createdAt.toISOString(),
          roleAssignment: roleAssignment as SquadRoleAssignment,
          previousRoleAssignment: ['STARTER', 'ROTATION', 'DEPTH'].includes(previousRoleAssignment)
            ? previousRoleAssignment as SquadRoleAssignment
            : null,
          expectedRole: ['STARTER', 'ROTATION', 'DEPTH'].includes(expectedRole)
            ? expectedRole as SquadRoleAssignment
            : null,
          moraleDelta: Math.round(this.toFiniteNumber(metadata.moraleDelta) ?? 0),
          boardDelta: Math.round(this.toFiniteNumber(metadata.boardDelta) ?? 0),
          sourceReason: this.toNullableString(metadata.sourceReason),
          summary: audit.message
        });
        continue;
      }

      if (audit.category === 'PLAYER_DEVELOPMENT_PLAN') {
        if (summary.developmentPlanChanges.length >= 5) {
          continue;
        }
        if (this.toNullableString(metadata.source) !== 'PLAYER_DEVELOPMENT_PLAN_SET') {
          continue;
        }
        const focus = (this.toNullableString(metadata.focus) || '').toUpperCase();
        const target = (this.toNullableString(metadata.target) || '').toUpperCase();
        const previousFocus = (this.toNullableString(metadata.previousFocus) || '').toUpperCase();
        const previousTarget = (this.toNullableString(metadata.previousTarget) || '').toUpperCase();
        if (!['TECHNICAL', 'PHYSICAL', 'TACTICAL', 'MENTAL'].includes(focus)) {
          continue;
        }
        if (!['FIRST_TEAM_PUSH', 'MATCH_SHARPNESS', 'LONG_TERM_UPSIDE', 'INJURY_PREVENTION'].includes(target)) {
          continue;
        }
        summary.developmentPlanChanges.push({
          occurredAt: audit.createdAt.toISOString(),
          focus: focus as DevelopmentPlanFocus,
          target: target as DevelopmentPlanTarget,
          previousFocus: ['TECHNICAL', 'PHYSICAL', 'TACTICAL', 'MENTAL'].includes(previousFocus)
            ? previousFocus as DevelopmentPlanFocus
            : null,
          previousTarget: ['FIRST_TEAM_PUSH', 'MATCH_SHARPNESS', 'LONG_TERM_UPSIDE', 'INJURY_PREVENTION'].includes(previousTarget)
            ? previousTarget as DevelopmentPlanTarget
            : null,
          immediateMoraleDelta: Math.round(this.toFiniteNumber(metadata.immediateMoraleDelta) ?? 0),
          summary: audit.message
        });
        continue;
      }

      if (audit.category === 'PLAYER_MEDICAL_PLAN') {
        if (summary.medicalPlanChanges.length >= 5) {
          continue;
        }
        const source = (this.toNullableString(metadata.source) || '').toUpperCase();
        if (source !== 'PLAYER_MEDICAL_PLAN_SET' && source !== 'PLAYER_MEDICAL_PLAN_CLEAR') {
          continue;
        }
        summary.medicalPlanChanges.push({
          occurredAt: audit.createdAt.toISOString(),
          action: source === 'PLAYER_MEDICAL_PLAN_SET' ? 'SET' : 'CLEAR',
          planCode: this.normalizeMedicalPlanCode(this.toNullableString(metadata.planCode)),
          previousPlanCode: this.normalizeMedicalPlanCode(this.toNullableString(metadata.previousPlanCode)),
          expiresWeekNumber: this.toFiniteNumber(metadata.expiresWeekNumber) !== null
            ? Math.round(this.toFiniteNumber(metadata.expiresWeekNumber) ?? 0)
            : null,
          immediateFitnessDelta: Math.round(this.toFiniteNumber(metadata.immediateFitnessDelta) ?? 0),
          immediateMoraleDelta: Math.round(this.toFiniteNumber(metadata.immediateMoraleDelta) ?? 0),
          immediateFormDelta: Math.round(this.toFiniteNumber(metadata.immediateFormDelta) ?? 0),
          summary: audit.message
        });
        continue;
      }

      if (audit.category === 'PLAYER_RETRAINING') {
        if (summary.retrainingChanges.length >= 6) {
          continue;
        }
        const source = (this.toNullableString(metadata.source) || '').toUpperCase();
        if (
          source !== 'PLAYER_RETRAINING_SET'
          && source !== 'PLAYER_RETRAINING_PROGRESS'
          && source !== 'PLAYER_RETRAINING_COMPLETE'
          && source !== 'PLAYER_RETRAINING_CLEAR'
        ) {
          continue;
        }
        const action = source === 'PLAYER_RETRAINING_SET'
          ? 'SET'
          : source === 'PLAYER_RETRAINING_PROGRESS'
            ? 'PROGRESS'
            : source === 'PLAYER_RETRAINING_COMPLETE'
              ? 'COMPLETE'
              : 'CLEAR';
        summary.retrainingChanges.push({
          occurredAt: audit.createdAt.toISOString(),
          action,
          currentPosition: this.normalizeRetrainablePosition(this.toNullableString(metadata.currentPosition)),
          targetPosition: this.normalizeRetrainablePosition(this.toNullableString(metadata.targetPosition)),
          progressPct: this.toFiniteNumber(metadata.progressPct) !== null ? Math.round(this.toFiniteNumber(metadata.progressPct) ?? 0) : null,
          weeklyProgressPct: this.toFiniteNumber(metadata.weeklyProgressPct) !== null ? Math.round(this.toFiniteNumber(metadata.weeklyProgressPct) ?? 0) : null,
          summary: audit.message
        });
        continue;
      }

      if (audit.category === 'PLAYER_PROMISE') {
        if (summary.promiseTimeline.length >= 8) {
          continue;
        }

        const source = (this.toNullableString(metadata.source) || '').toUpperCase();
        if (source !== 'PLAYING_TIME_PROMISE_CREATE' && source !== 'PLAYING_TIME_PROMISE_REVIEW') {
          continue;
        }

        const actionRaw = source === 'PLAYING_TIME_PROMISE_CREATE'
          ? 'CREATE'
          : ((this.toNullableString(metadata.action) || '').toUpperCase() || 'HONOR');
        const normalizedAction = actionRaw === 'HONOR' || actionRaw === 'REAFFIRM' || actionRaw === 'CLOSE' || actionRaw === 'CREATE'
          ? actionRaw as 'CREATE' | 'HONOR' | 'REAFFIRM' | 'CLOSE'
          : 'HONOR';
        const promiseKindRaw = (this.toNullableString(metadata.promiseKind) || '').toUpperCase();
        const promiseKind = promiseKindRaw === 'BENCH_WINDOW'
          ? 'BENCH_WINDOW' as const
          : null;
        const dueWeek = this.toFiniteNumber(metadata.dueWeekNumber);
        const resolvedWeek = this.toFiniteNumber(metadata.resolvedWeekNumber);
        const sourceAction = this.toNullableString(metadata.sourceAction);

        summary.promiseTimeline.push({
          occurredAt: audit.createdAt.toISOString(),
          action: normalizedAction,
          promiseKind,
          dueWeekNumber: dueWeek !== null ? Math.round(dueWeek) : null,
          resolvedWeekNumber: resolvedWeek !== null ? Math.round(resolvedWeek) : null,
          sourceAction,
          summary: audit.message
        });
      }
    }

    return summary;
  }

  private getPlayerStatusDirectiveLabel(directiveCode: PlayerStatusDirectiveCode) {
    if (directiveCode === 'REST_RECOVERY') return 'Rest & Recovery';
    if (directiveCode === 'LIMITED_MINUTES') return 'Limited Minutes';
    return 'Disciplinary Note';
  }

  private getPlayerStatusDirectiveProfileNote(directiveCode: PlayerStatusDirectiveCode) {
    if (directiveCode === 'REST_RECOVERY') {
      return 'Staff-managed recovery rest is active for this week (selection should be limited where possible).';
    }
    if (directiveCode === 'LIMITED_MINUTES') {
      return 'Short-term workload management is active (limit match minutes this week).';
    }
    return 'Player is under a disciplinary note review this week; morale impact may persist.';
  }

  private normalizeMedicalPlanCode(value: string | null | undefined): MedicalPlanCode | null {
    const normalized = String(value || '').trim().toUpperCase();
    if (
      normalized === 'REHAB_CONSERVATIVE'
      || normalized === 'PHASED_RETURN'
      || normalized === 'RECOVERY_FOCUS'
      || normalized === 'INJURY_PREVENTION'
      || normalized === 'MATCH_SHARPNESS'
    ) {
      return normalized as MedicalPlanCode;
    }
    return null;
  }

  private getPlayerMedicalPlanLabel(planCode: MedicalPlanCode) {
    if (planCode === 'REHAB_CONSERVATIVE') return 'Conservative Rehab';
    if (planCode === 'PHASED_RETURN') return 'Phased Return';
    if (planCode === 'RECOVERY_FOCUS') return 'Recovery Focus';
    if (planCode === 'INJURY_PREVENTION') return 'Injury Prevention';
    return 'Match Sharpness';
  }

  private getMedicalAvailabilityRecommendationLabel(recommendation: MedicalAvailabilityRecommendation) {
    if (recommendation === 'NO_SELECTION') return 'No Selection';
    if (recommendation === 'REST_RECOVERY') return 'Rest & Recovery';
    if (recommendation === 'LIMITED_MINUTES') return 'Limit Minutes';
    return 'Fully Available';
  }

  private getMedicalPlanDurationWeeks(planCode: MedicalPlanCode, isInjured: boolean) {
    if (planCode === 'REHAB_CONSERVATIVE') return isInjured ? 3 : 2;
    if (planCode === 'PHASED_RETURN') return isInjured ? 2 : 1;
    if (planCode === 'RECOVERY_FOCUS') return 1;
    if (planCode === 'INJURY_PREVENTION') return 2;
    return 2;
  }

  private getPlayerMedicalPlanProfileNote(planCode: MedicalPlanCode, isInjured: boolean, injuryWeeks: number) {
    if (planCode === 'REHAB_CONSERVATIVE') {
      return isInjured
        ? `Conservative rehab is active to shorten the layoff and protect against setbacks (${Math.max(1, injuryWeeks)} week(s) still estimated).`
        : 'Conservative rehab remains active to stabilize recovery load after a recent issue.';
    }
    if (planCode === 'PHASED_RETURN') {
      return isInjured
        ? 'Phased return is active. Staff are preparing a controlled step back toward match availability.'
        : 'Phased return is active. Selection should stay controlled while sharpness comes back.';
    }
    if (planCode === 'RECOVERY_FOCUS') {
      return 'Recovery focus is active this week to reduce accumulated load and rebuild fitness.';
    }
    if (planCode === 'INJURY_PREVENTION') {
      return 'Preventive medical work is active to lower the short-term breakdown risk.';
    }
    return 'Match sharpness work is active. Training load is tilted toward ball work and return rhythm.';
  }

  private getPlayerMedicalPlanSetNote(
    planCode: MedicalPlanCode,
    isInjured: boolean,
    availabilityRecommendation: MedicalAvailabilityRecommendation
  ) {
    const recommendationLabel = this.getMedicalAvailabilityRecommendationLabel(availabilityRecommendation);
    if (planCode === 'REHAB_CONSERVATIVE') {
      return isInjured
        ? `Conservative rehab started. Recovery should accelerate while medical staff keep the player out of risk zones. Availability guidance: ${recommendationLabel}.`
        : `Conservative recovery block started. Conditioning should improve with reduced short-term exposure. Availability guidance: ${recommendationLabel}.`;
    }
    if (planCode === 'PHASED_RETURN') {
      return `Phased return started. Staff will manage the player back toward selection gradually. Availability guidance: ${recommendationLabel}.`;
    }
    if (planCode === 'RECOVERY_FOCUS') {
      return `Recovery focus started. Weekly load is reduced to rebuild freshness. Availability guidance: ${recommendationLabel}.`;
    }
    if (planCode === 'INJURY_PREVENTION') {
      return `Preventive medical work started. The goal is to keep risk down without fully removing the player from the group. Availability guidance: ${recommendationLabel}.`;
    }
    return `Match sharpness program started. The player should regain rhythm quickly, but workload risk rises. Availability guidance: ${recommendationLabel}.`;
  }

  private getMedicalPlanProjectedEffects(context: {
    planCode: MedicalPlanCode;
    isInjured: boolean;
    injuryWeeks: number;
    fitness: number;
  }) {
    let moraleDelta = 0;
    let fitnessDelta = 0;
    let formDelta = 0;
    let injuryRecoveryBoost = 0;
    let injuryRiskDelta = 0;
    let fatigueModifier = 0;
    let availabilityRecommendation: MedicalAvailabilityRecommendation = 'FULLY_AVAILABLE';

    switch (context.planCode) {
      case 'REHAB_CONSERVATIVE':
        moraleDelta += context.isInjured ? 1 : 0;
        fitnessDelta += context.isInjured ? 3 : 2;
        formDelta -= 1;
        injuryRecoveryBoost += context.isInjured ? 1 : 0;
        injuryRiskDelta -= context.isInjured ? 0.03 : 0.02;
        fatigueModifier -= 2;
        availabilityRecommendation = context.isInjured || context.fitness < 74 ? 'REST_RECOVERY' : 'LIMITED_MINUTES';
        break;
      case 'PHASED_RETURN':
        fitnessDelta += 1;
        formDelta += 1;
        injuryRecoveryBoost += context.isInjured && context.injuryWeeks <= 2 ? 1 : 0;
        injuryRiskDelta += context.isInjured ? 0.02 : 0.01;
        fatigueModifier -= 1;
        availabilityRecommendation = context.isInjured && context.injuryWeeks > 1 ? 'NO_SELECTION' : 'LIMITED_MINUTES';
        break;
      case 'RECOVERY_FOCUS':
        moraleDelta += context.fitness < 76 ? 1 : 0;
        fitnessDelta += 3;
        formDelta -= 1;
        injuryRecoveryBoost += context.isInjured ? 1 : 0;
        injuryRiskDelta -= 0.02;
        fatigueModifier -= 2;
        availabilityRecommendation = context.fitness < 72 || context.isInjured ? 'REST_RECOVERY' : 'LIMITED_MINUTES';
        break;
      case 'INJURY_PREVENTION':
        moraleDelta += context.fitness < 70 ? 1 : 0;
        fitnessDelta += 2;
        injuryRecoveryBoost += context.isInjured ? 1 : 0;
        injuryRiskDelta -= 0.025;
        fatigueModifier -= 1;
        availabilityRecommendation = context.isInjured ? 'REST_RECOVERY' : context.fitness < 75 ? 'LIMITED_MINUTES' : 'FULLY_AVAILABLE';
        break;
      case 'MATCH_SHARPNESS':
        moraleDelta += 1;
        fitnessDelta -= 1;
        formDelta += context.isInjured ? 1 : 2;
        injuryRiskDelta += context.isInjured ? 0.02 : 0.015;
        fatigueModifier += 1;
        availabilityRecommendation = context.isInjured || context.fitness < 80 ? 'LIMITED_MINUTES' : 'FULLY_AVAILABLE';
        break;
      default:
        break;
    }

    moraleDelta = clamp(moraleDelta, -2, 3);
    fitnessDelta = clamp(fitnessDelta, -2, 4);
    formDelta = clamp(formDelta, -2, 3);
    injuryRecoveryBoost = clamp(injuryRecoveryBoost, 0, 2);
    fatigueModifier = clamp(fatigueModifier, -3, 2);
    injuryRiskDelta = clamp(injuryRiskDelta, -0.04, 0.04);

    const summaryParts: string[] = [];
    if (fitnessDelta !== 0) summaryParts.push(`Fitness ${fitnessDelta > 0 ? '+' : ''}${fitnessDelta}`);
    if (formDelta !== 0) summaryParts.push(`Form ${formDelta > 0 ? '+' : ''}${formDelta}`);
    if (moraleDelta !== 0) summaryParts.push(`Morale ${moraleDelta > 0 ? '+' : ''}${moraleDelta}`);
    if (injuryRecoveryBoost > 0) summaryParts.push(`Recovery +${injuryRecoveryBoost} week-step`);
    if (injuryRiskDelta !== 0) summaryParts.push(`Risk ${injuryRiskDelta > 0 ? '+' : ''}${Math.round(injuryRiskDelta * 1000) / 10}%`);

    return {
      moraleDelta,
      fitnessDelta,
      formDelta,
      injuryRecoveryBoost,
      injuryRiskDelta,
      fatigueModifier,
      availabilityRecommendation,
      summary: summaryParts.length > 0 ? `${summaryParts.join(' • ')} per week.` : 'Neutral medical impact.'
    };
  }

  private buildPlayerMedicalSnapshot(context: {
    fitness: number;
    form: number;
    isInjured: boolean;
    injuryWeeks: number;
    isSuspended: boolean;
    roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT';
    assignedRole: SquadRoleAssignment | null;
    activeDirective: ActivePlayerStatusDirective | null;
    activeDevelopmentPlan: ActivePlayerDevelopmentPlan | null;
    activeMedicalPlan: ActivePlayerMedicalPlan | null;
    currentWeekNumber: number;
  }) {
    const riskFactors: string[] = [];
    let workloadScore = 0;

    if (context.isInjured) {
      workloadScore += 45 + (Math.max(0, context.injuryWeeks) * 8);
      riskFactors.push(`Currently injured (${Math.max(1, context.injuryWeeks)} week(s) estimated).`);
    } else {
      workloadScore += clamp(82 - context.fitness, 0, 42);
      if (context.fitness < 72) {
        workloadScore += 12;
        riskFactors.push('Fitness is below the preferred match-readiness range.');
      } else if (context.fitness < 80) {
        riskFactors.push('Fitness is trending below ideal starter levels.');
      }
    }

    if (context.form < 45) {
      workloadScore += 5;
      riskFactors.push('Recent form is low, which can invite overtraining responses.');
    }
    if (context.isSuspended) {
      workloadScore += 4;
      riskFactors.push('Suspension interrupts rhythm and should be managed with controlled load.');
    }
    if (context.activeDevelopmentPlan?.target === 'MATCH_SHARPNESS') {
      workloadScore += 4;
      riskFactors.push('Development focus is pushing match sharpness this week.');
    } else if (context.activeDevelopmentPlan?.target === 'INJURY_PREVENTION') {
      workloadScore -= 4;
    }
    if (context.assignedRole === 'STARTER' && context.fitness < 78) {
      workloadScore += 8;
      riskFactors.push('Starter workload is heavy relative to current conditioning.');
    }
    if (context.roleTier === 'STAR' && context.fitness < 75) {
      workloadScore += 5;
      riskFactors.push('Key player status increases pressure to manage minutes correctly.');
    }
    if (context.activeDirective?.directiveCode === 'REST_RECOVERY') {
      workloadScore -= 10;
    } else if (context.activeDirective?.directiveCode === 'LIMITED_MINUTES') {
      workloadScore -= 6;
    }

    const activePlanProjected = context.activeMedicalPlan
      ? this.getMedicalPlanProjectedEffects({
        planCode: context.activeMedicalPlan.planCode,
        isInjured: context.isInjured,
        injuryWeeks: context.injuryWeeks,
        fitness: context.fitness
      })
      : null;

    if (activePlanProjected) {
      workloadScore += activePlanProjected.injuryRiskDelta > 0 ? 10 : activePlanProjected.injuryRiskDelta < 0 ? -8 : 0;
      if (activePlanProjected.injuryRiskDelta > 0) {
        riskFactors.push(`${this.getPlayerMedicalPlanLabel(context.activeMedicalPlan?.planCode as MedicalPlanCode)} increases short-term load risk.`);
      } else if (activePlanProjected.injuryRiskDelta < 0) {
        riskFactors.push(`${this.getPlayerMedicalPlanLabel(context.activeMedicalPlan?.planCode as MedicalPlanCode)} is actively reducing short-term risk.`);
      }
    }

    workloadScore = clamp(Math.round(workloadScore), 0, 100);
    const workloadRisk: MedicalWorkloadRisk = workloadScore >= 70
      ? 'CRITICAL'
      : workloadScore >= 45
        ? 'HIGH'
        : workloadScore >= 25
          ? 'MEDIUM'
          : 'LOW';

    const rehabStatus = context.isInjured
      ? (context.activeMedicalPlan?.planCode === 'PHASED_RETURN' ? 'RETURNING' : 'REHAB')
      : context.activeMedicalPlan?.planCode === 'PHASED_RETURN'
        ? 'RETURNING'
        : workloadRisk === 'HIGH' || workloadRisk === 'CRITICAL'
          ? 'MONITOR'
          : 'FIT';

    const recommendedPlanCode: MedicalPlanCode = context.isInjured
      ? (context.injuryWeeks <= 1 ? 'PHASED_RETURN' : 'REHAB_CONSERVATIVE')
      : context.fitness < 72
        ? 'RECOVERY_FOCUS'
        : workloadRisk === 'HIGH' || workloadRisk === 'CRITICAL'
          ? 'INJURY_PREVENTION'
          : context.form < 50 && context.fitness >= 78
            ? 'MATCH_SHARPNESS'
            : 'INJURY_PREVENTION';

    const availabilityRecommendation = activePlanProjected?.availabilityRecommendation
      ?? (context.isInjured
        ? (context.injuryWeeks > 1 ? 'NO_SELECTION' : 'REST_RECOVERY')
        : workloadRisk === 'CRITICAL'
          ? 'REST_RECOVERY'
          : workloadRisk === 'HIGH'
            ? 'LIMITED_MINUTES'
            : 'FULLY_AVAILABLE');

    const recoveryRecommendation = context.isInjured
      ? context.injuryWeeks <= 1
        ? 'Prepare a phased return and avoid a full 90-minute demand immediately.'
        : 'Keep the player in rehab until the layoff shortens. Avoid forcing selection.'
      : workloadRisk === 'CRITICAL'
        ? 'Immediate recovery intervention recommended before the next fixture.'
        : workloadRisk === 'HIGH'
          ? 'Manage minutes and reduce load this week to avoid an avoidable injury.'
          : workloadRisk === 'MEDIUM'
            ? 'Monitor training load. A preventive block is justified if the player is expected to start.'
            : 'Player can stay in the normal training flow with routine monitoring.';

    return {
      rehabStatus,
      workloadRisk,
      workloadScore,
      recoveryRecommendation,
      availabilityRecommendation,
      riskFactors: riskFactors.slice(0, 4),
      recommendedPlanCode,
      activePlan: context.activeMedicalPlan
        ? {
          planId: context.activeMedicalPlan.planId,
          planCode: context.activeMedicalPlan.planCode,
          label: this.getPlayerMedicalPlanLabel(context.activeMedicalPlan.planCode),
          note: this.getPlayerMedicalPlanProfileNote(
            context.activeMedicalPlan.planCode,
            context.isInjured,
            context.injuryWeeks
          ),
          setWeekNumber: context.activeMedicalPlan.setWeekNumber,
          expiresWeekNumber: context.activeMedicalPlan.expiresWeekNumber,
          weeksRemaining: Math.max(0, context.activeMedicalPlan.expiresWeekNumber - context.currentWeekNumber + 1),
          sourceAction: context.activeMedicalPlan.sourceAction,
          projectedEffects: activePlanProjected ?? this.getMedicalPlanProjectedEffects({
            planCode: context.activeMedicalPlan.planCode,
            isInjured: context.isInjured,
            injuryWeeks: context.injuryWeeks,
            fitness: context.fitness
          })
        }
        : null
    };
  }

  private getDevelopmentPlanProjectedEffects(context: {
    focus: DevelopmentPlanFocus;
    target: DevelopmentPlanTarget;
    age: number;
    isInjured: boolean;
    isSuspended: boolean;
    roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT';
  }) {
    const age = Number.isFinite(context.age) ? Math.round(context.age) : 24;
    let moraleDelta = 0;
    let fitnessDelta = 0;
    let formDelta = 0;
    let developmentDelta = 0;

    switch (context.focus) {
      case 'TECHNICAL':
        developmentDelta += 2;
        formDelta += 1;
        break;
      case 'PHYSICAL':
        fitnessDelta += 2;
        developmentDelta += 1;
        formDelta -= 1;
        break;
      case 'TACTICAL':
        formDelta += 2;
        developmentDelta += 1;
        break;
      case 'MENTAL':
        moraleDelta += 2;
        formDelta += 1;
        break;
      default:
        break;
    }

    switch (context.target) {
      case 'FIRST_TEAM_PUSH':
        formDelta += 1;
        moraleDelta += 1;
        fitnessDelta -= 1;
        if (context.roleTier === 'STAR') {
          moraleDelta -= 1;
        }
        break;
      case 'MATCH_SHARPNESS':
        formDelta += 2;
        fitnessDelta -= 1;
        break;
      case 'LONG_TERM_UPSIDE':
        developmentDelta += 2;
        formDelta -= 1;
        if (age <= 21 || context.roleTier === 'PROSPECT') {
          developmentDelta += 1;
        }
        break;
      case 'INJURY_PREVENTION':
        fitnessDelta += 2;
        moraleDelta += 1;
        formDelta -= 1;
        break;
      default:
        break;
    }

    if (context.isInjured) {
      if (context.target === 'INJURY_PREVENTION') {
        fitnessDelta += 1;
        moraleDelta += 1;
      } else {
        formDelta -= 1;
        if (context.target === 'MATCH_SHARPNESS') {
          moraleDelta -= 1;
        }
      }
    }

    if (context.isSuspended && context.target === 'FIRST_TEAM_PUSH') {
      moraleDelta -= 1;
    }

    moraleDelta = clamp(moraleDelta, -3, 4);
    fitnessDelta = clamp(fitnessDelta, -3, 4);
    formDelta = clamp(formDelta, -3, 4);
    developmentDelta = clamp(developmentDelta, -2, 5);

    const summaryParts: string[] = [];
    if (developmentDelta !== 0) summaryParts.push(`Development ${developmentDelta > 0 ? '+' : ''}${developmentDelta}`);
    if (formDelta !== 0) summaryParts.push(`Form ${formDelta > 0 ? '+' : ''}${formDelta}`);
    if (fitnessDelta !== 0) summaryParts.push(`Fitness ${fitnessDelta > 0 ? '+' : ''}${fitnessDelta}`);
    if (moraleDelta !== 0) summaryParts.push(`Morale ${moraleDelta > 0 ? '+' : ''}${moraleDelta}`);

    return {
      moraleDelta,
      fitnessDelta,
      formDelta,
      developmentDelta,
      summary: summaryParts.length > 0 ? `${summaryParts.join(' • ')} per week (before match/events).` : 'Balanced weekly impact.'
    };
  }

  private async applyMedicalPlanWeeklyEffects(
    tx: DbClient,
    careerId: string,
    clubId: number,
    currentWeekNumber: number
  ) {
    const activePlans = await this.getActivePlayerMedicalPlanMap(careerId, currentWeekNumber, tx);
    if (activePlans.size === 0) {
      return;
    }

    const playerIds = Array.from(activePlans.keys());
    const stateRows = await tx.v2PlayerState.findMany({
      where: {
        careerId,
        clubId,
        playerId: { in: playerIds }
      }
    });

    for (const state of stateRows) {
      const plan = activePlans.get(state.playerId);
      if (!plan) {
        continue;
      }

      const projected = this.getMedicalPlanProjectedEffects({
        planCode: plan.planCode,
        isInjured: Boolean(state.isInjured),
        injuryWeeks: Math.max(0, Number(state.injuryWeeks ?? 0)),
        fitness: Number(state.fitness ?? 90)
      });

      const nextMorale = clamp(state.morale + projected.moraleDelta, 20, 100);
      const nextFitness = clamp(state.fitness + projected.fitnessDelta, 40, 100);
      const nextForm = clamp(state.form + projected.formDelta, 0, 100);
      const nextInjuryWeeks = state.isInjured
        ? Math.max(0, Math.round(state.injuryWeeks) - projected.injuryRecoveryBoost)
        : Math.max(0, Math.round(state.injuryWeeks));

      await tx.v2PlayerState.update({
        where: { id: state.id },
        data: {
          morale: nextMorale,
          fitness: nextFitness,
          form: nextForm,
          injuryWeeks: nextInjuryWeeks,
          isInjured: nextInjuryWeeks > 0
        }
      });
    }
  }

  private async applyDevelopmentPlanWeeklyEffects(
    tx: DbClient,
    careerId: string,
    clubId: number
  ) {
    const activePlans = await this.getActivePlayerDevelopmentPlanMap(careerId, tx);
    if (activePlans.size === 0) {
      return;
    }

    const playerIds = Array.from(activePlans.keys());
    const [playerRows, stateRows] = await Promise.all([
      tx.player.findMany({
        where: { id: { in: playerIds }, currentClubId: clubId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          age: true,
          dateOfBirth: true,
          currentAbility: true,
          potentialAbility: true
        }
      }),
      tx.v2PlayerState.findMany({
        where: {
          careerId,
          clubId,
          playerId: { in: playerIds }
        }
      })
    ]);

    const stateByPlayerId = new Map(stateRows.map((row) => [row.playerId, row]));

    for (const player of playerRows) {
      const plan = activePlans.get(player.id);
      const state = stateByPlayerId.get(player.id);
      if (!plan || !state) {
        continue;
      }

      const age = this.resolvePlayerAge(player.dateOfBirth, new Date(), player.age, player.id);
      const ability = Number(player.currentAbility ?? 60);
      const potential = Number(player.potentialAbility ?? ability);
      const upsideGap = Math.max(0, potential - ability);
      const roleTier: 'STAR' | 'STARTER' | 'ROTATION' | 'DEPTH' | 'PROSPECT' = age <= 21 && upsideGap >= 8
        ? 'PROSPECT'
        : ability >= 82
          ? 'STAR'
          : ability >= 75
            ? 'STARTER'
            : ability >= 68
              ? 'ROTATION'
              : 'DEPTH';

      const deltas = this.getDevelopmentPlanProjectedEffects({
        focus: plan.focus,
        target: plan.target,
        age,
        isInjured: Boolean(state.isInjured),
        isSuspended: Boolean(state.isSuspended),
        roleTier
      });

      await tx.v2PlayerState.update({
        where: { id: state.id },
        data: {
          morale: clamp(state.morale + deltas.moraleDelta, 20, 100),
          fitness: clamp(state.fitness + deltas.fitnessDelta, 40, 100),
          form: clamp(state.form + deltas.formDelta, 0, 100),
          developmentDelta: clamp(state.developmentDelta + deltas.developmentDelta, -30, 60)
        }
      });
    }
  }

  private async applyRetrainingWeeklyEffects(
    tx: DbClient,
    careerId: string,
    clubId: number
  ) {
    const activePlans = await this.getActivePlayerRetrainingPlanMap(careerId, tx);
    if (activePlans.size === 0) {
      return;
    }

    const career = await tx.v2Career.findUnique({
      where: { id: careerId },
      select: { currentDate: true, weekNumber: true }
    });
    if (!career) {
      return;
    }

    const playerIds = Array.from(activePlans.keys());
    const [playerRows, stateRows] = await Promise.all([
      tx.player.findMany({
        where: { id: { in: playerIds }, currentClubId: clubId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          position: true
        }
      }),
      tx.v2PlayerState.findMany({
        where: {
          careerId,
          clubId,
          playerId: { in: playerIds }
        }
      })
    ]);

    const stateByPlayerId = new Map(stateRows.map((row) => [row.playerId, row]));
    for (const player of playerRows) {
      const plan = activePlans.get(player.id);
      const state = stateByPlayerId.get(player.id);
      if (!plan || !state) {
        continue;
      }

      const nextProgressPct = clamp(plan.progressPct + plan.weeklyProgressPct, 0, 100);
      const sameFamily = this.getPositionFamily(plan.currentPosition) === this.getPositionFamily(plan.targetPosition);
      const fitnessDelta = sameFamily ? 0 : -1;
      const developmentDelta = nextProgressPct >= 100 ? 2 : 1;
      const moraleDelta = nextProgressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS && plan.progressPct < RETRAINING_MATCH_PREP_READY_PROGRESS ? 1 : 0;
      const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${player.id}`;

      await tx.v2PlayerState.update({
        where: { id: state.id },
        data: {
          morale: clamp(state.morale + moraleDelta, 20, 100),
          fitness: clamp(state.fitness + fitnessDelta, 40, 100),
          developmentDelta: clamp(state.developmentDelta + developmentDelta, -30, 60)
        }
      });

      if (nextProgressPct >= 100) {
        await tx.player.update({
          where: { id: player.id },
          data: {
            position: plan.targetPosition
          }
        });
        await this.writeAudit(tx, careerId, 'PLAYER_RETRAINING', `Completed retraining for ${playerName}.`, {
          source: 'PLAYER_RETRAINING_COMPLETE',
          planId: plan.planId,
          weekNumber: career.weekNumber,
          playerId: player.id,
          playerName,
          currentPosition: plan.currentPosition,
          targetPosition: plan.targetPosition,
          progressPct: 100,
          weeklyProgressPct: plan.weeklyProgressPct
        });
        continue;
      }

      await this.writeAudit(tx, careerId, 'PLAYER_RETRAINING', `Retraining progress updated for ${playerName}.`, {
        source: 'PLAYER_RETRAINING_PROGRESS',
        planId: plan.planId,
        setWeekNumber: plan.setWeekNumber,
        weekNumber: career.weekNumber,
        playerId: player.id,
        playerName,
        currentPosition: plan.currentPosition,
        targetPosition: plan.targetPosition,
        progressPct: nextProgressPct,
        weeklyProgressPct: plan.weeklyProgressPct
      });
    }
  }

  private async createPlayingTimePromiseFromBenchEvent(
    tx: DbClient,
    career: V2Career,
    sourceEventId: string
  ) {
    const [players, states, activePromises] = await Promise.all([
      tx.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          position: true,
          dateOfBirth: true,
          age: true,
          currentAbility: true,
          potentialAbility: true
        }
      }),
      tx.v2PlayerState.findMany({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId
        },
        select: {
          playerId: true,
          isInjured: true,
          isSuspended: true
        }
      }),
      this.getActivePlayingTimePromiseMap(career.id, tx)
    ]);

    if (players.length === 0) {
      return;
    }

    const stateByPlayer = new Map(states.map((row) => [row.playerId, row]));
    const attackingPositions = new Set(['ST', 'CF', 'RW', 'LW', 'AM']);

    const candidate = [...players]
      .filter((player) => !activePromises.has(player.id))
      .map((player) => {
        const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
        const ability = Number(player.currentAbility ?? 60);
        const potential = Number(player.potentialAbility ?? ability);
        const upsideGap = Math.max(0, potential - ability);
        const state = stateByPlayer.get(player.id);
        const unavailablePenalty = (state?.isInjured || state?.isSuspended) ? 25 : 0;
        const attackingBonus = attackingPositions.has(String(player.position || '').toUpperCase()) ? 8 : 0;
        const youthBonus = age <= 21 ? 20 : age <= 24 ? 8 : 0;
        const score = upsideGap * 3 + youthBonus + attackingBonus - unavailablePenalty - Math.max(0, ability - 78);
        return { player, age, upsideGap, score };
      })
      .sort((a, b) =>
        b.score - a.score
        || b.upsideGap - a.upsideGap
        || a.age - b.age
        || Number(a.player.id) - Number(b.player.id)
      )[0];

    if (!candidate) {
      return;
    }

    const player = candidate.player;
    const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${player.id}`;
    const promiseId = `${career.id}:ptp:${player.id}:${career.weekNumber}`;

    await this.writeAudit(tx, career.id, 'PLAYER_PROMISE', `Playing-time promise created for ${playerName}.`, {
      source: 'PLAYING_TIME_PROMISE_CREATE',
      promiseId,
      promiseKind: 'BENCH_WINDOW',
      playerId: player.id,
      playerName,
      position: player.position,
      promisedRoleAssignment: 'ROTATION',
      createdWeekNumber: career.weekNumber,
      dueWeekNumber: career.weekNumber + 1,
      reaffirmCount: 0,
      sourceEventId
    });
  }

  private async applyPlayingTimePromiseFollowUpOption(
    tx: DbClient,
    career: V2Career,
    sourceEventId: string,
    action: ParsedPlayingTimePromiseFollowUpOption
  ) {
    const activePromise = (await this.getActivePlayingTimePromiseMap(career.id, tx)).get(action.playerId);
    if (!activePromise || activePromise.createdWeekNumber !== action.originWeekNumber) {
      return;
    }

    const [player, playerState] = await Promise.all([
      tx.player.findUnique({
        where: { id: action.playerId },
        select: {
          id: true,
          currentClubId: true,
          firstName: true,
          lastName: true,
          fullName: true,
          position: true
        }
      }),
      tx.v2PlayerState.findFirst({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId,
          playerId: action.playerId
        }
      })
    ]);

    if (!player || player.currentClubId !== career.controlledClubId || !playerState) {
      return;
    }

    const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${action.playerId}`;
    const roleAssignments = await this.getSquadRoleAssignmentsMap(career.id, tx);
    const previousRoleAssignment = roleAssignments.get(action.playerId)?.roleAssignment ?? 'DEPTH';
    const roleWeight = { DEPTH: 0, ROTATION: 1, STARTER: 2 } as const;

    if (action.action === 'PROMOTE') {
      const newRole = roleWeight[previousRoleAssignment] >= roleWeight[activePromise.promisedRoleAssignment]
        ? previousRoleAssignment
        : activePromise.promisedRoleAssignment;

      if (newRole !== previousRoleAssignment) {
        await tx.v2AuditLog.create({
          data: {
            id: `${career.id}:audit:${Date.now()}:${Math.floor(Math.random() * 10000)}`,
            careerId: career.id,
            category: 'SQUAD_ROLE',
            message: `Updated squad role for ${playerName}.`,
            metadata: JSON.stringify({
              source: 'SQUAD_ROLE_ASSIGNMENT',
              sourceReason: 'PLAYING_TIME_PROMISE_FOLLOW_UP',
              weekNumber: career.weekNumber,
              playerId: action.playerId,
              playerName,
              roleAssignment: newRole,
              previousRoleAssignment,
              expectedRole: activePromise.promisedRoleAssignment,
              moraleDelta: 2,
              boardDelta: 1,
              roleTier: 'PROMISE_CONTEXT'
            })
          }
        });
      }

      await tx.v2PlayerState.update({
        where: { id: playerState.id },
        data: {
          morale: clamp(playerState.morale + 2, 20, 100),
          developmentDelta: clamp(playerState.developmentDelta + 1, -30, 60)
        }
      });
      await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta: 1 });
      const newDueWeekNumber = Math.max(career.weekNumber + 1, activePromise.dueWeekNumber + 1);
      await this.writeAudit(tx, career.id, 'PLAYER_PROMISE', `Escalated playing-time promise action for ${playerName}.`, {
        source: 'PLAYING_TIME_PROMISE_REVIEW',
        action: 'REAFFIRM',
        promiseId: activePromise.promiseId,
        playerId: action.playerId,
        playerName,
        originWeekNumber: activePromise.createdWeekNumber,
        dueWeekNumber: activePromise.dueWeekNumber,
        newDueWeekNumber,
        reaffirmCount: activePromise.reaffirmCount + 1,
        resolvedWeekNumber: career.weekNumber,
        sourceEventId,
        sourceAction: 'PLAYTIME_PROMISE_PROMOTE'
      });
      return;
    }

    if (action.action === 'REAFFIRM') {
      const newDueWeekNumber = Math.max(career.weekNumber + 1, activePromise.dueWeekNumber + 1);
      await tx.v2PlayerState.update({
        where: { id: playerState.id },
        data: {
          morale: clamp(playerState.morale + 1, 20, 100)
        }
      });
      await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta: -1 });
      await this.writeAudit(tx, career.id, 'PLAYER_PROMISE', `Reaffirmed playing-time promise for ${playerName}.`, {
        source: 'PLAYING_TIME_PROMISE_REVIEW',
        action: 'REAFFIRM',
        promiseId: activePromise.promiseId,
        playerId: action.playerId,
        playerName,
        originWeekNumber: activePromise.createdWeekNumber,
        dueWeekNumber: activePromise.dueWeekNumber,
        newDueWeekNumber,
        reaffirmCount: activePromise.reaffirmCount + 1,
        resolvedWeekNumber: career.weekNumber,
        sourceEventId
      });
      return;
    }

    await tx.v2PlayerState.update({
      where: { id: playerState.id },
      data: {
        morale: clamp(playerState.morale - 3, 20, 100),
        form: clamp(playerState.form - 1, 0, 100)
      }
    });
    await this.applyClubEffects(tx, career.id, career.controlledClubId, { boardDelta: -1, moraleDelta: -1 });
    await this.writeAudit(tx, career.id, 'PLAYER_PROMISE', `Withdrew playing-time promise for ${playerName}.`, {
      source: 'PLAYING_TIME_PROMISE_REVIEW',
      action: 'CLOSE',
      promiseId: activePromise.promiseId,
      playerId: action.playerId,
      playerName,
      originWeekNumber: activePromise.createdWeekNumber,
      dueWeekNumber: activePromise.dueWeekNumber,
      resolvedWeekNumber: career.weekNumber,
      sourceEventId,
      sourceAction: 'PLAYTIME_PROMISE_CLOSE'
    });
  }

  private async buildPlayingTimePromiseFollowUpEvents(
    career: V2Career,
    weekNumber: number,
    currentDate: Date
  ): Promise<InboxEventCreateRow[]> {
    const activePromises = await this.getActivePlayingTimePromiseMap(career.id, this.prisma);
    if (activePromises.size === 0) {
      return [];
    }

    const playerIds = Array.from(activePromises.keys());
    const [players, playerStates] = await Promise.all([
      this.prisma.player.findMany({
        where: {
          id: { in: playerIds },
          currentClubId: career.controlledClubId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          position: true
        }
      }),
      this.prisma.v2PlayerState.findMany({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId,
          playerId: { in: playerIds }
        },
        select: {
          playerId: true,
          morale: true,
          isInjured: true,
          isSuspended: true
        }
      })
    ]);

    const playerById = new Map(players.map((row) => [row.id, row]));
    const stateByPlayerId = new Map(playerStates.map((row) => [row.playerId, row]));

    const rows: InboxEventCreateRow[] = [];
    for (const promise of activePromises.values()) {
      if (weekNumber < promise.dueWeekNumber) {
        continue;
      }

      const player = playerById.get(promise.playerId);
      if (!player) {
        continue;
      }

      const usageSummary = (await this.getPlayerMatchUsageSummaryMap(
        career.id,
        [promise.playerId],
        promise.createdWeekNumber,
        this.prisma
      )).get(promise.playerId);
      if ((usageSummary?.matchdaySquadCount ?? 0) > 0) {
        continue;
      }

      const state = stateByPlayerId.get(promise.playerId);
      const overdueWeeks = Math.max(0, weekNumber - promise.dueWeekNumber);
      const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${promise.playerId}`;
      const urgency = overdueWeeks > 0 || Number(state?.morale ?? 50) < 46
        ? V2_URGENCY.HIGH
        : V2_URGENCY.MEDIUM;
      const availabilityNote = state?.isInjured
        ? 'Player is injured, which may justify a short extension of the promise.'
        : state?.isSuspended
          ? 'Player is suspended, which may justify a short extension of the promise.'
          : 'No matchday squad inclusion has been recorded since the promise was made.';

      rows.push({
        id: `${career.id}:ev:${weekNumber}:ptp:${promise.playerId}:${promise.createdWeekNumber}`,
        careerId: career.id,
        weekNumber,
        title: `Playing-Time Promise Check: ${playerName}`,
        description: `${player.position || 'Player'} was promised a bench/rotation window by week ${promise.dueWeekNumber}. Matchday inclusions: ${usageSummary?.matchdaySquadCount ?? 0}. ${availabilityNote}`,
        urgency,
        options: JSON.stringify([
          {
            id: `playtime_promise:promote:${promise.playerId}:${promise.createdWeekNumber}`,
            label: 'Promote to rotation role now.',
            effects: {}
          },
          {
            id: `playtime_promise:reaffirm:${promise.playerId}:${promise.createdWeekNumber}`,
            label: 'Reaffirm the promise and extend by one week.',
            effects: {}
          },
          {
            id: `playtime_promise:close:${promise.playerId}:${promise.createdWeekNumber}`,
            label: 'Withdraw the promise and accept fallout.',
            effects: {}
          }
        ]),
        deadline: addDays(currentDate, urgency === V2_URGENCY.HIGH ? 1 : 2),
        status: 'PENDING',
        autoResolved: false
      });
    }

    return rows;
  }

  private async applyPlayingTimePromiseWeeklyPressure(
    tx: DbClient,
    careerId: string,
    clubId: number,
    weekNumber: number
  ) {
    const activePromises = await this.getActivePlayingTimePromiseMap(careerId, tx);
    if (activePromises.size === 0) {
      return;
    }

    const promisePlayerIds = Array.from(activePromises.keys());
    const [playerStates, players] = await Promise.all([
      tx.v2PlayerState.findMany({
        where: {
          careerId,
          clubId,
          playerId: { in: promisePlayerIds }
        }
      }),
      tx.player.findMany({
        where: {
          id: { in: promisePlayerIds },
          currentClubId: clubId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true
        }
      })
    ]);

    const playerStateByPlayerId = new Map(playerStates.map((row) => [row.playerId, row]));
    const playerById = new Map(players.map((row) => [row.id, row]));
    let accumulatedBoardDelta = 0;

    for (const promise of activePromises.values()) {
      const playerState = playerStateByPlayerId.get(promise.playerId);
      const player = playerById.get(promise.playerId);
      if (!playerState || !player) {
        continue;
      }

      const usageSummary = (await this.getPlayerMatchUsageSummaryMap(
        careerId,
        [promise.playerId],
        promise.createdWeekNumber,
        tx
      )).get(promise.playerId);
      if ((usageSummary?.matchdaySquadCount ?? 0) > 0) {
        continue;
      }

      if (weekNumber < promise.dueWeekNumber) {
        continue;
      }

      const overdueWeeks = Math.max(0, weekNumber - promise.dueWeekNumber);
      const moralePenalty = overdueWeeks > 0 ? 2 + Math.min(1, promise.reaffirmCount) : 1;
      if (moralePenalty > 0) {
        await tx.v2PlayerState.update({
          where: { id: playerState.id },
          data: {
            morale: clamp(playerState.morale - moralePenalty, 20, 100)
          }
        });
      }
      if (overdueWeeks > 0) {
        accumulatedBoardDelta -= 1;
      }
    }

    if (accumulatedBoardDelta !== 0) {
      await this.applyClubEffects(tx, careerId, clubId, { boardDelta: accumulatedBoardDelta });
    }
  }

  private async getContractWarningLeverageMemoryMap(
    careerId: string,
    currentWeekNumber: number,
    dbClient: DbClient = this.prisma
  ): Promise<Map<number, { score: number; counters: number; rejects: number; lastWeekNumber: number | null }>> {
    const memoryByPlayer = new Map<number, { score: number; counters: number; rejects: number; lastWeekNumber: number | null }>();

    if (!Number.isFinite(Number(currentWeekNumber)) || Number(currentWeekNumber) <= 1) {
      return memoryByPlayer;
    }

    const audits = await dbClient.v2AuditLog.findMany({
      where: {
        careerId,
        category: 'CONTRACT',
        metadata: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 192,
      select: {
        metadata: true
      }
    });

    for (const audit of audits) {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      if (!metadata) {
        continue;
      }
      if (this.toNullableString(metadata.source) !== 'INBOX_CONTRACT_WARNING') {
        continue;
      }

      const playerIdRaw = this.toFiniteNumber(metadata.playerId);
      const playerId = playerIdRaw !== null ? Math.round(playerIdRaw) : 0;
      if (playerId <= 0) {
        continue;
      }

      const weekNumberRaw = this.toFiniteNumber(metadata.weekNumber);
      const sourceWeek = weekNumberRaw !== null ? Math.round(weekNumberRaw) : 0;
      if (sourceWeek <= 0 || sourceWeek >= currentWeekNumber) {
        continue;
      }

      const negotiationOutcome = (this.toNullableString(metadata.negotiationOutcome) || '').toUpperCase();
      let baseScore = 0;
      if (negotiationOutcome === 'COUNTER') {
        baseScore = 2;
      } else if (negotiationOutcome === 'REJECT') {
        baseScore = 3;
      }
      if (baseScore <= 0) {
        continue;
      }

      const weeksAgo = Math.max(1, currentWeekNumber - sourceWeek);
      let weightedScore = baseScore;
      if (weeksAgo >= 3) {
        weightedScore -= 1;
      }
      if (weeksAgo >= 5) {
        weightedScore -= 1;
      }
      if (weightedScore <= 0) {
        continue;
      }

      const existing = memoryByPlayer.get(playerId) ?? { score: 0, counters: 0, rejects: 0, lastWeekNumber: null };
      existing.score = clamp(existing.score + weightedScore, 0, 4);
      if (negotiationOutcome === 'COUNTER') {
        existing.counters += 1;
      }
      if (negotiationOutcome === 'REJECT') {
        existing.rejects += 1;
      }
      existing.lastWeekNumber = existing.lastWeekNumber === null
        ? sourceWeek
        : Math.max(existing.lastWeekNumber, sourceWeek);
      memoryByPlayer.set(playerId, existing);
    }

    return memoryByPlayer;
  }

  private async getSuppressedContractWarningPlayerIds(careerId: string, currentWeekNumber: number): Promise<Set<number>> {
    const suppressed = new Set<number>();

    const pendingWarnings = await this.prisma.v2InboxEvent.findMany({
      where: {
        careerId,
        status: 'PENDING',
        weekNumber: { lt: currentWeekNumber }
      },
      select: {
        options: true
      }
    });

    for (const event of pendingWarnings) {
      for (const playerId of this.extractContractWarningPlayerIdsFromOptions(event.options)) {
        suppressed.add(playerId);
      }
    }

    const promiseDecisions = await this.prisma.v2EventDecision.findMany({
      where: {
        careerId,
        optionId: { startsWith: 'contract_warn:promise:' }
      },
      select: {
        optionId: true,
        event: {
          select: {
            weekNumber: true
          }
        }
      },
      orderBy: {
        decidedAt: 'desc'
      },
      take: 64
    });

    for (const decision of promiseDecisions) {
      const parsed = this.parseContractWarningOptionId(decision.optionId);
      if (!parsed || parsed.action !== 'PROMISE') {
        continue;
      }
      const sourceWeek = Number(decision.event?.weekNumber ?? 0);
      if (!Number.isFinite(sourceWeek) || sourceWeek <= 0) {
        continue;
      }
      if (currentWeekNumber <= sourceWeek + CONTRACT_WARNING_PROMISE_COOLDOWN_WEEKS) {
        suppressed.add(parsed.playerId);
      }
    }

    return suppressed;
  }

  private createRoundRobinSchedule(clubIds: number[]): FixturePairing[] {
    const teams = [...clubIds];
    if (teams.length % 2 !== 0) {
      teams.push(-1);
    }

    const rounds = teams.length - 1;
    const half = teams.length / 2;
    const rotating = [...teams];
    const fixtures: FixturePairing[] = [];

    for (let round = 0; round < rounds; round += 1) {
      for (let i = 0; i < half; i += 1) {
        const home = rotating[i];
        const away = rotating[rotating.length - 1 - i];
        if (home === -1 || away === -1) {
          continue;
        }

        const flip = round % 2 === 0;
        fixtures.push({
          week: round + 1,
          homeClubId: flip ? home : away,
          awayClubId: flip ? away : home
        });
      }

      const [first, ...rest] = rotating;
      rest.unshift(rest.pop() as number);
      rotating.splice(0, rotating.length, first, ...rest);
    }

    const mirrorFixtures = fixtures.map((fixture) => ({
      week: fixture.week + rounds,
      homeClubId: fixture.awayClubId,
      awayClubId: fixture.homeClubId
    }));

    return [...fixtures, ...mirrorFixtures];
  }

  private createScalableLeagueSchedule(clubIds: number[], random: () => number): FixturePairing[] {
    const teamCount = clubIds.length;

    if (teamCount <= 24) {
      return this.createRoundRobinSchedule(clubIds);
    }

    if (teamCount <= 48) {
      return this.createSingleRoundRobinSchedule(clubIds);
    }

    // Very large tiers are simulated using a bounded schedule to keep
    // full-pyramid week advancement responsive.
    const weeks = 34;
    const fixtures: FixturePairing[] = [];
    const baseTeams = [...clubIds];

    for (let week = 1; week <= weeks; week += 1) {
      const weeklyTeams = shuffled(baseTeams, random);
      if (weeklyTeams.length % 2 !== 0) {
        weeklyTeams.push(-1);
      }

      for (let i = 0; i < weeklyTeams.length; i += 2) {
        const a = weeklyTeams[i];
        const b = weeklyTeams[i + 1];

        if (a === -1 || b === -1) {
          continue;
        }

        const homeFirst = (week + i) % 2 === 0;
        fixtures.push({
          week,
          homeClubId: homeFirst ? a : b,
          awayClubId: homeFirst ? b : a
        });
      }
    }

    return fixtures;
  }

  private createSingleRoundRobinSchedule(clubIds: number[]): FixturePairing[] {
    const full = this.createRoundRobinSchedule(clubIds);
    const rounds = clubIds.length % 2 === 0 ? clubIds.length - 1 : clubIds.length;
    return full.filter((fixture) => fixture.week <= rounds);
  }

  private async applyWeekPlanEffects(careerId: string, weekNumber: number, clubId: number) {
    const plan = await this.prisma.v2WeekPlan.findUnique({
      where: {
        careerId_weekNumber: {
          careerId,
          weekNumber
        }
      }
    });

    if (!plan) {
      await this.ensureV2PlayerStatesForClub(careerId, clubId);
      await this.prisma.$transaction(async (tx) => {
        await this.applyClubOperationsWeeklyEffects(tx, careerId, clubId);
        await this.applyMedicalPlanWeeklyEffects(tx, careerId, clubId, weekNumber);
        await this.applyDevelopmentPlanWeeklyEffects(tx, careerId, clubId);
        await this.applyRetrainingWeeklyEffects(tx, careerId, clubId);
        await this.applyPlayingTimePromiseWeeklyPressure(tx, careerId, clubId, weekNumber);
      });
      return;
    }

    const [club, clubState] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: clubId },
        select: { balance: true }
      }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId,
            clubId
          }
        }
      })
    ]);

    const operatingBalance = (club?.balance ?? 0) + (clubState?.budgetBalance ?? 0);
    const boardConfidence = clubState?.boardConfidence ?? 50;
    const payload: WeekPlanPayload = {
      trainingFocus: plan.trainingFocus,
      rotationIntensity: plan.rotationIntensity,
      tacticalMentality: plan.tacticalMentality,
      transferStance: plan.transferStance,
      scoutingPriority: plan.scoutingPriority
    };
    const strategic = deriveStrategicPlanEffects(payload, {
      operatingBalance,
      boardConfidence
    });

    await this.ensureV2PlayerStatesForClub(careerId, clubId);
    const random = mulberry32(stringToSeed(`${careerId}:plan-effects:${weekNumber}`));
    await this.prisma.$transaction(async (tx) => {
      await this.applyClubOperationsWeeklyEffects(tx, careerId, clubId);
      await this.applyClubEffects(tx, careerId, clubId, {
        moraleDelta: strategic.moraleDelta,
        boardDelta: strategic.boardDelta,
        fitnessTrendDelta: strategic.fitnessTrendDelta,
        budgetDelta: strategic.budgetDelta
      });
      await this.applyPlayerStatePlanEffects(tx, careerId, clubId, strategic, random);
      await this.applyMedicalPlanWeeklyEffects(tx, careerId, clubId, weekNumber);
      await this.applyDevelopmentPlanWeeklyEffects(tx, careerId, clubId);
      await this.applyRetrainingWeeklyEffects(tx, careerId, clubId);
      await this.applyPlayingTimePromiseWeeklyPressure(tx, careerId, clubId, weekNumber);
    });
  }

  private async applyPlayerStatePlanEffects(
    tx: DbClient,
    careerId: string,
    clubId: number,
    effects: StrategicPlanEffects,
    random: () => number
  ) {
    const career = await tx.v2Career.findUnique({
      where: { id: careerId },
      select: { weekNumber: true }
    });
    const rows = await tx.v2PlayerState.findMany({
      where: {
        careerId,
        clubId
      },
      orderBy: { playerId: 'asc' }
    });
    const activeMedicalPlans = await this.getActivePlayerMedicalPlanMap(careerId, career?.weekNumber ?? 1, tx);
    const activeSuspensions = await this.getActivePlayerSuspensionMap(careerId, tx);
    const clubOperationModifiers = resolveClubOperationsPerformanceModifiers(
      await this.getClubOperationsLevels(careerId, tx)
    );

    for (const row of rows) {
      let fitness = row.fitness + effects.playerFitnessDelta + clubOperationModifiers.trainingFitnessBonus + (Math.floor(random() * 3) - 1);
      let form = row.form + effects.playerFormDelta + (Math.floor(random() * 3) - 1);
      let morale = row.morale + Math.sign(effects.moraleDelta) + (random() < 0.12 ? -1 : 0);
      let developmentDelta = row.developmentDelta + effects.playerDevelopmentDelta + clubOperationModifiers.trainingDevelopmentBonus;
      let isInjured = row.isInjured;
      let injuryWeeks = row.injuryWeeks;
      let isSuspended = activeSuspensions.has(row.playerId) || row.isSuspended;
      const activeMedicalPlan = activeMedicalPlans.get(row.playerId) ?? null;
      const medicalProjectedEffects = activeMedicalPlan
        ? this.getMedicalPlanProjectedEffects({
          planCode: activeMedicalPlan.planCode,
          isInjured,
          injuryWeeks,
          fitness
        })
        : null;

      if (isInjured) {
        injuryWeeks = Math.max(0, injuryWeeks - 1 - clubOperationModifiers.medicalRecoveryBonus);
        if (injuryWeeks === 0) {
          isInjured = false;
        }
        fitness += 2 + clubOperationModifiers.medicalFitnessBonus;
      } else {
        const injuryChance = clamp(
          effects.injuryRisk + (fitness < 65 ? 0.05 : 0) + (medicalProjectedEffects?.injuryRiskDelta ?? 0) + clubOperationModifiers.injuryRiskDelta,
          0.002,
          0.3
        );
        if (random() < injuryChance) {
          isInjured = true;
          injuryWeeks = 1 + Math.floor(random() * 3);
          fitness -= 8;
          morale -= 2;
        }
      }

      fitness = clamp(fitness, 40, 100);
      form = clamp(form, 0, 100);
      morale = clamp(morale, 20, 100);
      developmentDelta = clamp(developmentDelta, -30, 60);

      await tx.v2PlayerState.update({
        where: { id: row.id },
        data: {
          morale,
          fitness,
          form,
          isInjured,
          injuryWeeks,
          isSuspended,
          developmentDelta
        }
      });
    }
  }

  private async autoResolveUrgentEvents(careerId: string, weekNumber: number, currentDate: Date) {
    const overdueUrgent = await this.prisma.v2InboxEvent.findMany({
      where: {
        careerId,
        status: 'PENDING',
        urgency: V2_URGENCY.HIGH,
        OR: [
          { weekNumber: { lt: weekNumber } },
          { deadline: { lte: currentDate } }
        ]
      }
    });

    for (const event of overdueUrgent) {
      const penaltyOption: EventOption = {
        id: 'AUTO_PENALTY',
        label: 'No action taken in time.',
        effects: {
          moraleDelta: -3,
          boardDelta: -4,
          budgetDelta: -50000,
          fitnessTrendDelta: -1
        }
      };

      await this.prisma.$transaction(async (tx) => {
        await tx.v2EventDecision.create({
          data: {
            id: `${event.id}:auto`,
            eventId: event.id,
            careerId,
            optionId: penaltyOption.id,
            optionLabel: penaltyOption.label,
            effects: JSON.stringify(penaltyOption.effects),
            decidedAt: new Date()
          }
        });

        await tx.v2InboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'RESOLVED',
            autoResolved: true,
            resolutionNote: penaltyOption.label,
            resolvedAt: new Date()
          }
        });

        const career = await tx.v2Career.findUnique({ where: { id: careerId } });
        if (career) {
          await this.applyClubEffects(tx, careerId, career.controlledClubId, penaltyOption.effects);
        }
      });
    }
  }

  private async ensureWeeklyEvents(careerId: string, weekNumber: number, currentDate: Date) {
    const existing = await this.prisma.v2InboxEvent.count({
      where: {
        careerId,
        weekNumber
      }
    });

    if (existing > 0) {
      return;
    }

    const career = await this.requireCareer(careerId);

    const [club, clubState, plan] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: { balance: true, transferBudget: true }
      }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId,
            clubId: career.controlledClubId
          }
        }
      }),
      this.prisma.v2WeekPlan.findUnique({
        where: {
          careerId_weekNumber: {
            careerId,
            weekNumber
          }
        }
      })
    ]);

    const operatingBalance = (club?.balance ?? 0) + (clubState?.budgetBalance ?? 0);
    const boardConfidence = clubState?.boardConfidence ?? 50;
    const clubBalance = club?.balance ?? 0;
    const budgetBalance = clubState?.budgetBalance ?? 0;
    const transferBudget = club?.transferBudget ?? 0;
    const resolvedClubState = clubState ?? {
      morale: 55,
      fitnessTrend: 0,
      boardConfidence: 55,
      budgetBalance: 0,
      form: 'NNNNN'
    } as V2ClubState;
    const boardStatus = await this.buildBoardStatus(career, resolvedClubState);
    const clubPulseSummary = await this.buildClubPulseSummary(career, resolvedClubState, boardStatus);

    const seed = `${careerId}:week:${weekNumber}`;
    const random = mulberry32(stringToSeed(seed));
    const templates = this.getEventTemplates({
      plan: plan
        ? {
          trainingFocus: plan.trainingFocus,
          rotationIntensity: plan.rotationIntensity,
          tacticalMentality: plan.tacticalMentality,
          transferStance: plan.transferStance,
          scoutingPriority: plan.scoutingPriority
        }
        : null,
      operatingBalance,
      boardConfidence,
      boardStatus,
      clubPulseSummary
    });
    const strategicCandidates = templates.filter((template) => template.urgency || template.deadlineDays === 1);
    const totalEvents = 2 + Math.floor(random() * 4) + (boardConfidence < 35 ? 1 : 0);

    const rows: InboxEventCreateRow[] = [];

    if (strategicCandidates.length > 0) {
      const strategic = pick(strategicCandidates, random);
      rows.push({
        id: `${careerId}:ev:${weekNumber}:1`,
        careerId,
        weekNumber,
        title: strategic.title,
        description: strategic.description,
        urgency: strategic.urgency ?? V2_URGENCY.MEDIUM,
        options: JSON.stringify(strategic.options),
        deadline: addDays(currentDate, strategic.deadlineDays ?? 2),
        status: 'PENDING',
        autoResolved: false
      });
    }

    for (let idx = rows.length; idx < totalEvents; idx += 1) {
      const template = pick(templates, random);
      const urgencyRoll = random();
      const urgency = template.urgency
        ?? (urgencyRoll > 0.78 ? V2_URGENCY.HIGH : urgencyRoll > 0.4 ? V2_URGENCY.MEDIUM : V2_URGENCY.LOW);
      const deadlineDays = template.deadlineDays ?? (1 + Math.floor(random() * 4));

      rows.push({
        id: `${careerId}:ev:${weekNumber}:${idx + 1}`,
        careerId,
        weekNumber,
        title: template.title,
        description: template.description,
        urgency,
        options: JSON.stringify(template.options),
        deadline: addDays(currentDate, deadlineDays),
        status: 'PENDING',
        autoResolved: false
      });
    }

    const contractWarnings = await this.buildContractWarningEvents(career, weekNumber, currentDate, {
      boardConfidence,
      operatingBalance,
      clubBalance,
      budgetBalance,
      transferBudget
    });
    rows.push(...contractWarnings);

    const playingTimePromiseFollowUps = await this.buildPlayingTimePromiseFollowUpEvents(career, weekNumber, currentDate);
    rows.push(...playingTimePromiseFollowUps);

    await this.prisma.v2InboxEvent.createMany({ data: rows });
    await this.addAudit(career.id, 'EVENT', 'Weekly events generated.', {
      weekNumber,
      eventCount: rows.length,
      contractWarningCount: contractWarnings.length,
      playingTimePromiseFollowUpCount: playingTimePromiseFollowUps.length,
      boardRiskLevel: this.getBoardRiskLevel(boardConfidence),
      operatingBalance,
      fanSentimentScore: clubPulseSummary.fanSentimentScore,
      mediaPressureScore: clubPulseSummary.mediaPressureScore
    });
  }

  private getEventTemplates(context: {
    plan: WeekPlanPayload | null;
    operatingBalance: number;
    boardConfidence: number;
    boardStatus: BoardStatusSnapshot;
    clubPulseSummary: ClubPulseSummary;
  }): WeeklyEventTemplate[] {
    const templates: WeeklyEventTemplate[] = [
      {
        title: 'Captain Requests Extra Recovery Session',
        description: 'Senior players want the workload reduced after a congested schedule.',
        options: [
          {
            id: 'accept_recovery',
            label: 'Approve recovery focus this week.',
            effects: { moraleDelta: 2, fitnessTrendDelta: 2 }
          },
          {
            id: 'reject_recovery',
            label: 'Keep intensity high to maintain edge.',
            effects: { moraleDelta: -2, fitnessTrendDelta: -1, boardDelta: 1 }
          }
        ]
      },
      {
        title: 'Board Proposes Short-Term Sponsorship Activation',
        description: 'Commercial team wants media duties before matchday.',
        options: [
          {
            id: 'accept_sponsor',
            label: 'Approve sponsorship activation.',
            effects: { budgetDelta: 120000, fitnessTrendDelta: -1, boardDelta: 2 }
          },
          {
            id: 'decline_sponsor',
            label: 'Reject to protect prep quality.',
            effects: { moraleDelta: 1, boardDelta: -2 }
          }
        ]
      },
      {
        title: 'Promising Academy Forward Pushes for Bench Role',
        description: 'The player wants a place in the next match squad.',
        options: [
          {
            id: 'promise_bench',
            label: 'Promise a bench appearance window.',
            effects: {
              moraleDelta: 1,
              boardDelta: 1,
              playerMoraleDelta: 1,
              playerDevelopmentDelta: 2,
              scoutingOutcome: 'YOUTH_INTAKE_SPIKE'
            }
          },
          {
            id: 'delay_promotion',
            label: 'Delay and keep current hierarchy.',
            effects: { moraleDelta: -1, boardDelta: 1, playerMoraleDelta: -1 }
          }
        ]
      },
      {
        title: 'Medical Team Flags Elevated Injury Risk',
        description: 'Physio report suggests reducing press intensity for key starters.',
        options: [
          {
            id: 'follow_medical',
            label: 'Follow medical advice strictly.',
            effects: { fitnessTrendDelta: 3, moraleDelta: 1 }
          },
          {
            id: 'override_medical',
            label: 'Override and keep tactical plan.',
            effects: { fitnessTrendDelta: -2, boardDelta: 1 }
          }
        ]
      }
    ];

    if (context.plan?.transferStance === 'SELL_TO_BALANCE') {
      templates.push({
        title: 'Sporting Director Lines Up Discount Sale',
        description: 'A buyer is ready to move quickly for a regular starter if the fee is reduced.',
        options: [
          {
            id: 'sell_fast',
            label: 'Accept reduced fee to stabilize books now.',
            effects: {
              budgetDelta: 180000,
              boardDelta: 2,
              moraleDelta: -2,
              playerMoraleDelta: -1,
              transferAction: 'SELL_FRINGE'
            }
          },
          {
            id: 'hold_price',
            label: 'Hold valuation and delay the move.',
            effects: { budgetDelta: -25000, boardDelta: -2, moraleDelta: 1 }
          }
        ]
      });
    }

    if (context.plan?.transferStance === 'INVEST') {
      templates.push({
        title: 'High-Value Target Becomes Available',
        description: 'Agent offers a marquee player but requires premium fees and wage commitment.',
        options: [
          {
            id: 'push_deal',
            label: 'Push aggressively to close the deal.',
            effects: {
              budgetDelta: -160000,
              moraleDelta: 2,
              boardDelta: context.operatingBalance > 200000 ? 1 : -2,
              transferAction: 'SIGN_STARTER',
              playerMoraleDelta: 1,
              playerFormDelta: 1
            }
          },
          {
            id: 'walk_away',
            label: 'Walk away and preserve financial flexibility.',
            effects: { boardDelta: -1, moraleDelta: -1 }
          }
        ]
      });
    }

    if (context.plan?.scoutingPriority === 'LOCAL') {
      templates.push({
        title: 'Regional Scout Flags Low-Cost Opportunity',
        description: 'A nearby club has a flexible release clause for a role player.',
        options: [
          {
            id: 'regional_followup',
            label: 'Send analyst team for immediate follow-up.',
            effects: {
              budgetDelta: -12000,
              boardDelta: 1,
              moraleDelta: 1,
              scoutingOutcome: 'LOCAL_DISCOVERY',
              playerDevelopmentDelta: 1
            }
          },
          {
            id: 'regional_pass',
            label: 'Skip and keep scouting resources focused elsewhere.',
            effects: { boardDelta: -1 }
          }
        ]
      });
    }

    if (context.plan?.scoutingPriority === 'NATIONAL') {
      templates.push({
        title: 'Domestic Recruitment Window Opens',
        description: 'Multiple national prospects are available but require travel-heavy reports.',
        options: [
          {
            id: 'national_expand',
            label: 'Expand scouting trips for broad coverage.',
            effects: {
              budgetDelta: -35000,
              boardDelta: 2,
              scoutingOutcome: 'NATIONAL_SHORTLIST',
              playerDevelopmentDelta: 2
            }
          },
          {
            id: 'national_trim',
            label: 'Limit spend and prioritize only two targets.',
            effects: { budgetDelta: -12000, boardDelta: 0 }
          }
        ]
      });
    }

    if (context.plan?.scoutingPriority === 'INTERNATIONAL') {
      templates.push({
        title: 'International Scouting Budget Overrun',
        description: 'Travel and visa expenses exceeded plan after late fixture changes.',
        urgency: V2_URGENCY.HIGH,
        deadlineDays: 1,
        options: [
          {
            id: 'approve_overrun',
            label: 'Approve additional funds to keep targets active.',
            effects: {
              budgetDelta: -80000,
              boardDelta: 1,
              moraleDelta: 1,
              scoutingOutcome: 'INTERNATIONAL_BREAKTHROUGH',
              transferAction: 'SIGN_PROSPECT',
              playerDevelopmentDelta: 3
            }
          },
          {
            id: 'cut_overseas',
            label: 'Cut overseas coverage and refocus domestically.',
            effects: { boardDelta: -2, moraleDelta: -1, budgetDelta: 20000 }
          }
        ]
      });
    }

    if (context.plan?.scoutingPriority === 'YOUTH') {
      templates.push({
        title: 'Youth Invitational Request',
        description: 'Academy staff request extra resources for a national youth showcase.',
        options: [
          {
            id: 'fund_youth_trip',
            label: 'Fund full youth showcase coverage.',
            effects: {
              budgetDelta: -30000,
              boardDelta: 1,
              moraleDelta: 2,
              scoutingOutcome: 'YOUTH_INTAKE_SPIKE',
              playerDevelopmentDelta: 3,
              playerMoraleDelta: 1
            }
          },
          {
            id: 'skip_youth_trip',
            label: 'Skip this cycle and conserve resources.',
            effects: { boardDelta: -2, moraleDelta: -1 }
          }
        ]
      });
    }

    if (context.boardConfidence < 35) {
      templates.push({
        title: 'Board Ultimatum: Immediate Stabilization Plan',
        description: 'Directors demand immediate confidence recovery measures before next fixture.',
        urgency: V2_URGENCY.HIGH,
        deadlineDays: 1,
        options: [
          {
            id: 'appease_board',
            label: 'Approve emergency spending controls and media alignment.',
            effects: { boardDelta: 3, moraleDelta: -1, budgetDelta: -70000 }
          },
          {
            id: 'challenge_board',
            label: 'Defend current strategy and reject interference.',
            effects: { boardDelta: -4, moraleDelta: 1, budgetDelta: 20000 }
          }
        ]
      });
    }

    if (context.boardStatus.jobSecurity === 'UNDER_REVIEW' || context.boardStatus.jobSecurity === 'CRITICAL') {
      templates.push({
        title: 'Board Requests Private Review Meeting',
        description: 'Directors want a short-term recovery plan and tighter public messaging before the next fixture.',
        urgency: V2_URGENCY.HIGH,
        deadlineDays: 1,
        options: [
          {
            id: 'board_review_align',
            label: 'Present a measured recovery plan and align all messaging.',
            effects: { boardDelta: 2, mediaDelta: -3, fanDelta: 1, moraleDelta: -1 }
          },
          {
            id: 'board_review_deflect',
            label: 'Defend the squad and push back on public pressure.',
            effects: { boardDelta: -2, mediaDelta: 4, fanDelta: 2, moraleDelta: 1 }
          }
        ]
      });
    }

    if (context.clubPulseSummary.mediaPressureScore >= 58) {
      templates.push({
        title: 'Press Room Demands Accountability',
        description: 'Local media are framing the week as a test of your control. Decide how visible you want to be.',
        urgency: context.clubPulseSummary.mediaPressureScore >= 72 ? V2_URGENCY.HIGH : V2_URGENCY.MEDIUM,
        deadlineDays: 1,
        options: [
          {
            id: 'media_face_press',
            label: 'Front the press and explain the current plan.',
            effects: { mediaDelta: -6, fanDelta: 1, boardDelta: 1, moraleDelta: -1 }
          },
          {
            id: 'media_shield_squad',
            label: 'Keep the squad behind closed doors and limit access.',
            effects: { mediaDelta: 2, fanDelta: -1, moraleDelta: 1 }
          }
        ]
      });
    }

    if (context.clubPulseSummary.fanSentimentScore <= 44) {
      templates.push({
        title: 'Supporter Group Requests Emergency Q&A',
        description: 'Supporters want clarity on results and direction before matchday.',
        urgency: context.clubPulseSummary.fanSentimentScore <= 30 ? V2_URGENCY.HIGH : V2_URGENCY.MEDIUM,
        deadlineDays: 2,
        options: [
          {
            id: 'fans_meet_supporters',
            label: 'Meet supporter representatives and explain the plan.',
            effects: { fanDelta: 5, mediaDelta: -2, boardDelta: 1, moraleDelta: -1 }
          },
          {
            id: 'fans_keep_distance',
            label: 'Keep distance and let results repair the relationship.',
            effects: { fanDelta: -5, mediaDelta: 3, boardDelta: -1, moraleDelta: 1 }
          }
        ]
      });
    } else if (context.clubPulseSummary.fanSentimentScore >= 72) {
      templates.push({
        title: 'Fan Momentum Builds Ahead of Matchday',
        description: 'The crowd is buying into the project and the commercial team wants to amplify it.',
        options: [
          {
            id: 'fans_amplify_momentum',
            label: 'Lean into the momentum with a visible club push.',
            effects: { fanDelta: 3, mediaDelta: -1, budgetDelta: 45000, moraleDelta: 1 }
          },
          {
            id: 'fans_keep_focus',
            label: 'Keep the squad quiet and preserve training focus.',
            effects: { fanDelta: -1, boardDelta: 1, moraleDelta: 1 }
          }
        ]
      });
    }

    if (context.operatingBalance < -150000) {
      templates.push({
        title: 'Finance Office Warns of Liquidity Strain',
        description: 'Cashflow projections show immediate action is needed to avoid payroll pressure.',
        urgency: V2_URGENCY.HIGH,
        deadlineDays: 1,
        options: [
          {
            id: 'emergency_cut',
            label: 'Freeze discretionary spend and defer bonuses.',
            effects: { budgetDelta: 90000, boardDelta: 2, moraleDelta: -2 }
          },
          {
            id: 'short_term_credit',
            label: 'Take short-term credit to maintain operations.',
            effects: { budgetDelta: 40000, boardDelta: -2, moraleDelta: 1 }
          }
        ]
      });
    }

    return templates;
  }

  private async simulateAiFixturesForWeek(careerId: string, weekNumber: number) {
    const fixtures = await this.prisma.v2Fixture.findMany({
      where: {
        careerId,
        weekNumber,
        isUserClubFixture: false,
        status: {
          in: [V2_FIXTURE_STATUS.SCHEDULED, V2_FIXTURE_STATUS.READY]
        }
      }
    });

    if (fixtures.length === 0) {
      return;
    }

    const clubIds = new Set<number>();
    fixtures.forEach((fixture) => {
      clubIds.add(fixture.homeClubId);
      clubIds.add(fixture.awayClubId);
    });

    const clubs = await this.prisma.club.findMany({
      where: { id: { in: Array.from(clubIds) } },
      select: { id: true, reputation: true }
    });
    const repByClub = new Map(clubs.map((club) => [club.id, club.reputation ?? 50]));

    await this.prisma.$transaction(async (tx) => {
      const touchedLeagues = new Set<number>();

      for (const fixture of fixtures) {
        const random = mulberry32(stringToSeed(`${careerId}:${fixture.id}:${weekNumber}`));
        const scoreline = this.simulateScoreline(
          repByClub.get(fixture.homeClubId) ?? 50,
          repByClub.get(fixture.awayClubId) ?? 50,
          random
        );

        await tx.v2Fixture.update({
          where: { id: fixture.id },
          data: {
            status: V2_FIXTURE_STATUS.COMPLETED,
            homeScore: scoreline.homeScore,
            awayScore: scoreline.awayScore
          }
        });

        await tx.v2Match.upsert({
          where: { fixtureId: fixture.id },
          update: {
            status: V2_MATCH_STATUS.COMPLETED,
            homeScore: scoreline.homeScore,
            awayScore: scoreline.awayScore,
            homeXg: Number((scoreline.homeScore + random()).toFixed(2)),
            awayXg: Number((scoreline.awayScore + random()).toFixed(2)),
            homePossession: 50,
            awayPossession: 50,
            completedAt: new Date()
          },
          create: {
            id: `${careerId}:match:${fixture.id}`,
            careerId,
            fixtureId: fixture.id,
            status: V2_MATCH_STATUS.COMPLETED,
            homeScore: scoreline.homeScore,
            awayScore: scoreline.awayScore,
            homeXg: Number((scoreline.homeScore + random()).toFixed(2)),
            awayXg: Number((scoreline.awayScore + random()).toFixed(2)),
            homePossession: 50,
            awayPossession: 50,
            completedAt: new Date(),
            interventions: JSON.stringify([])
          }
        });

        await this.applyFixtureResultToStandings(
          tx,
          careerId,
          fixture.leagueId,
          fixture.homeClubId,
          fixture.awayClubId,
          scoreline.homeScore,
          scoreline.awayScore
        );

        touchedLeagues.add(fixture.leagueId);
      }

      await this.recalculateLeaguePositions(tx, careerId, Array.from(touchedLeagues));
    });
  }

  private simulateScoreline(homeStrength: number, awayStrength: number, random: () => number): Scoreline {
    const homeBias = 0.14;
    const relative = (homeStrength - awayStrength) / 60;
    const homeLambda = clamp(1.02 + relative + homeBias, 0.25, 2.7);
    const awayLambda = clamp(0.92 - relative, 0.2, 2.5);

    const homeScore = this.poisson(homeLambda, random);
    const awayScore = this.poisson(awayLambda, random);
    return { homeScore, awayScore };
  }

  private poisson(lambda: number, random: () => number): number {
    const limit = Math.exp(-lambda);
    let p = 1;
    let k = 0;
    while (p > limit && k < 7) {
      k += 1;
      p *= random();
    }
    return Math.max(0, k - 1);
  }

  private async runGuidedSimulation(
    career: V2Career,
    fixture: V2Fixture,
    prep: ResolvedMatchPrep
  ): Promise<MatchSimulationResult> {
    const [homeClub, awayClub, controlledState] = await Promise.all([
      this.prisma.club.findUnique({ where: { id: fixture.homeClubId }, select: { reputation: true } }),
      this.prisma.club.findUnique({ where: { id: fixture.awayClubId }, select: { reputation: true } }),
      this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        }
      })
    ]);

    const seed = `${career.id}:${fixture.id}:${career.weekNumber}`;
    const random = mulberry32(stringToSeed(seed));

    const homeBase = homeClub?.reputation ?? 50;
    const awayBase = awayClub?.reputation ?? 50;
    const userIsHome = fixture.homeClubId === career.controlledClubId;
    const moraleInfluence = (controlledState?.morale ?? 55) / 100;
    const prepModifiers = this.computePrepModifiers(prep);
    const userStrengthDelta = prepModifiers.strengthDelta;

    const homeStrength = userIsHome
      ? (homeBase * moraleInfluence) + userStrengthDelta
      : homeBase;
    const awayStrength = userIsHome
      ? awayBase
      : (awayBase * moraleInfluence) + userStrengthDelta;

    const baseKeyMomentCount = 7 + Math.floor(random() * 5);
    const keyMomentCount = clamp(baseKeyMomentCount + prepModifiers.keyMomentDelta, 6, 13);
    const minutes = shuffled(
      Array.from({ length: 85 }, (_, idx) => idx + 5),
      random
    ).slice(0, keyMomentCount).sort((a, b) => a - b);

    let homeScore = 0;
    let awayScore = 0;
    let homeXg = 0;
    let awayXg = 0;

    const highlights: MatchSimulationResult['highlights'] = [];
    const userTeamSide: 'home' | 'away' = userIsHome ? 'home' : 'away';

    for (const minute of minutes) {
      let teamBias = 0.5 + (homeStrength - awayStrength) / 120;
      teamBias += userIsHome ? prepModifiers.attackBias : -prepModifiers.attackBias;
      teamBias = clamp(teamBias, 0.22, 0.78);
      const homeAttack = random() < teamBias;
      const teamSide = homeAttack ? 'home' : 'away';
      const eventActorId = this.resolveHighlightActorId(prep, teamSide, userTeamSide, random, 'BIG_CHANCE');
      const qualityBoost = teamSide === userTeamSide ? prepModifiers.chanceQualityBoost : 0;
      const quality = clamp(
        0.08 + random() * 0.46 +
          (homeAttack ? homeStrength - awayStrength : awayStrength - homeStrength) / 520 +
          qualityBoost * 0.85,
        0.06,
        0.75
      );
      const shotXg = Number((quality * 0.85).toFixed(2));

      if (teamSide === 'home') {
        homeXg += shotXg;
      } else {
        awayXg += shotXg;
      }

      const scoreSuppression = clamp(1 - (homeScore + awayScore) * 0.08, 0.55, 1);
      const blowoutSuppression = clamp(1 - Math.abs(homeScore - awayScore) * 0.11, 0.58, 1);
      const goalThreshold = clamp((0.11 + quality * 0.36) * scoreSuppression * blowoutSuppression, 0.08, 0.35);
      const roll = random();

      let eventType = 'BIG_CHANCE';
      let animationPreset = 'chance_build_up';
      let commentary = 'Dangerous build-up develops into a chance.';
      let decisive = false;

      if (roll < goalThreshold) {
        eventType = 'GOAL';
        animationPreset = 'goal_finish';
        commentary = teamSide === 'home'
          ? 'Home side finishes clinically and scores.'
          : 'Away side punishes the defense with a composed finish.';
        decisive = true;

        if (teamSide === 'home') {
          homeScore += 1;
        } else {
          awayScore += 1;
        }
      } else if (roll < goalThreshold + 0.23) {
        eventType = 'SAVE';
        animationPreset = 'goalkeeper_save';
        commentary = 'A strong save keeps the scoreline intact.';
      } else if (roll < goalThreshold + 0.35) {
        eventType = 'WOODWORK';
        animationPreset = 'shot_woodwork';
        commentary = 'The effort crashes off the frame of the goal.';
      } else if (roll < goalThreshold + 0.47) {
        eventType = 'BLOCKED_SHOT';
        animationPreset = 'defensive_block';
        commentary = 'A defender steps across and blocks the shot at the last second.';
      } else if (roll < goalThreshold + 0.58) {
        eventType = 'OFFSIDE';
        animationPreset = 'offside_flag';
        commentary = 'The move breaks down as the flag goes up for offside.';
      } else {
        eventType = 'MISS';
        animationPreset = 'shot_wide';
        commentary = 'The shot flashes wide of the post.';
      }

      highlights.push({
        minute,
        eventType,
        teamSide,
        actorId: eventActorId,
        fromX: teamSide === 'home' ? 58 : 42,
        fromY: 52 + (random() * 20 - 10),
        toX: teamSide === 'home' ? 88 : 12,
        toY: 50 + (random() * 18 - 9),
        animationPreset,
        cameraPath: 'SIDELINE_TO_BOX',
        commentary,
        xThreatRank: Number(quality.toFixed(3)),
        isDecisive: decisive,
        payload: {
          quality: Number(quality.toFixed(3)),
          shotXg
        }
      });

      if (random() < 0.022) {
        const cardTeamSide: 'home' | 'away' = random() < 0.5 ? 'home' : 'away';
        const cardType = random() < 0.11 ? 'RED_CARD' : 'YELLOW_CARD';
        highlights.push({
          minute: Math.min(90, minute + 1),
          eventType: cardType,
          teamSide: cardTeamSide,
          actorId: this.resolveHighlightActorId(prep, cardTeamSide, userTeamSide, random, cardType),
          fromX: 50,
          fromY: 50,
          toX: 50,
          toY: 50,
          animationPreset: 'card_display',
          cameraPath: 'REFEREE_FOCUS',
          commentary: 'Disciplinary action from the referee.',
          xThreatRank: 0.25,
          isDecisive: true,
          payload: {}
        });
      }

      if (random() < (0.012 + prepModifiers.setPieceBonus * 0.2)) {
        const penaltySide = random() < 0.5 ? 'home' : 'away';
        const scored = random() < 0.74;
        const penaltyEventType = scored ? 'PENALTY_GOAL' : 'PENALTY_MISS';

        highlights.push({
          minute: Math.min(90, minute + 2),
          eventType: penaltyEventType,
          teamSide: penaltySide,
          actorId: this.resolveHighlightActorId(prep, penaltySide, userTeamSide, random, penaltyEventType),
          fromX: penaltySide === 'home' ? 83 : 17,
          fromY: 50,
          toX: penaltySide === 'home' ? 95 : 5,
          toY: 50,
          animationPreset: 'penalty_sequence',
          cameraPath: 'PENALTY_SPOT',
          commentary: scored ? 'Penalty converted with confidence.' : 'Penalty missed under pressure.',
          xThreatRank: 0.9,
          isDecisive: true,
          payload: { scored }
        });

        if (scored) {
          if (penaltySide === 'home') {
            homeScore += 1;
            homeXg += 0.74;
          } else {
            awayScore += 1;
            awayXg += 0.74;
          }
        }
      }
    }

    let homePossession = Math.round(50 + (homeStrength - awayStrength) / 3);
    homePossession += userIsHome ? prepModifiers.possessionBias : -prepModifiers.possessionBias;
    homePossession = clamp(homePossession, 35, 65);

    const decisiveEvents = highlights.filter((highlight) =>
      highlight.eventType === 'GOAL' ||
      highlight.eventType === 'RED_CARD' ||
      highlight.eventType === 'PENALTY_GOAL' ||
      highlight.eventType === 'PENALTY_MISS'
    );

    const ranked = [...highlights]
      .sort((a, b) => b.xThreatRank - a.xThreatRank)
      .slice(0, 14);

    const selected = [...decisiveEvents, ...ranked]
      .sort((a, b) => a.minute - b.minute)
      .filter((highlight, idx, arr) => {
        if (idx === 0) return true;
        const prev = arr[idx - 1];
        return !(prev.minute === highlight.minute && prev.eventType === highlight.eventType && prev.teamSide === highlight.teamSide);
      });

    selected.push({
      minute: 45,
      eventType: 'HALFTIME',
      fromX: 50,
      fromY: 50,
      toX: 50,
      toY: 50,
      animationPreset: 'team_talk_huddle',
      cameraPath: 'TACTICAL_BOARD',
      commentary: 'Halftime arrives with both managers preparing their next move.',
      xThreatRank: 0.18,
      isDecisive: false,
      payload: {}
    });
    selected.push({
      minute: 90,
      eventType: 'FULL_TIME',
      fromX: 50,
      fromY: 50,
      toX: 50,
      toY: 50,
      animationPreset: 'full_time_whistle',
      cameraPath: 'MIDFIELD_SWEEP',
      commentary: 'Full time. The match management phase is over.',
      xThreatRank: 0.16,
      isDecisive: false,
      payload: {}
    });

    selected.sort((a, b) => a.minute - b.minute || b.xThreatRank - a.xThreatRank);

    return {
      homeScore,
      awayScore,
      homeXg: Number(homeXg.toFixed(2)),
      awayXg: Number(awayXg.toFixed(2)),
      homePossession,
      awayPossession: 100 - homePossession,
      highlights: selected
    };
  }

  private async wrapCurrentWeek(career: V2Career) {
    const loanLifecycle = await this.prisma.$transaction((tx) =>
      this.processIncomingLoanReturnsAtWeekWrap(tx, career, addDays(career.currentDate, 7))
    );
    const contractWeekWrap = await this.processExpiredContractsAtWeekWrap(career);

    if (contractWeekWrap.expiredCount > 0 || contractWeekWrap.emergencySignings > 0) {
      await this.addAudit(
        career.id,
        'CONTRACT',
        `Week wrap contract lifecycle processed (${contractWeekWrap.expiredCount} expired, ${contractWeekWrap.emergencySignings} emergency signings).`,
        {
          ...contractWeekWrap,
          weekNumber: career.weekNumber
        }
      );
    }

    const maxWeek = await this.prisma.v2Fixture.aggregate({
      where: { careerId: career.id },
      _max: { weekNumber: true }
    });

    const finalWeek = maxWeek._max.weekNumber ?? 38;
    let nextWeek = career.weekNumber + 1;
    let nextSeason = career.season;
    let nextDate = addDays(career.currentDate, 7);
    let activeLeagueId = career.activeLeagueId;
    let seasonTransition: Record<string, unknown> | null = null;
    const boardReview = await this.applyBoardReviewAtWeekWrap(career);

    if (boardReview.dismissed) {
      await this.prisma.v2Career.update({
        where: { id: career.id },
        data: {
          currentPhase: V2_PHASES.TERMINATED
        }
      });

      await this.persistSaveSlot(career.id, 'autosave', true);
      await this.addAudit(career.id, 'BOARD', 'Board terminated manager role at week wrap.', {
        previousWeek: career.weekNumber,
        boardReview
      });
      return;
    }

    if (nextWeek > finalWeek) {
      const [start, end] = career.season.split('/').map((year) => Number(year));
      const nextStart = Number.isFinite(start) ? start + 1 : new Date().getFullYear() + 1;
      const nextEnd = Number.isFinite(end) ? end + 1 : nextStart + 1;
      nextSeason = `${nextStart}/${nextEnd}`;
      nextWeek = 1;

      const transition = await this.prepareNextSeason(career, nextSeason);
      nextDate = transition.seasonStartDate;
      activeLeagueId = transition.activeLeagueId;
      seasonTransition = {
        promotedCount: transition.promotedCount,
        relegatedCount: transition.relegatedCount,
        fixtureCount: transition.fixtureCount
      };
    }

    await this.prisma.v2Career.update({
      where: { id: career.id },
      data: {
        weekNumber: nextWeek,
        currentDate: nextDate,
        currentPhase: V2_PHASES.PLANNING,
        season: nextSeason,
        activeLeagueId
      }
    });

    await this.persistSaveSlot(career.id, 'autosave', true);
    await this.addAudit(career.id, 'WEEK_WRAP', 'Week wrapped and moved to planning phase.', {
      previousWeek: career.weekNumber,
      nextWeek,
      seasonTransition,
      boardReview,
      contractWeekWrap,
      loanLifecycle
    });
  }

  private async processExpiredContractsAtWeekWrap(career: V2Career): Promise<ContractWeekWrapOutcome> {
    const defaultOutcome: ContractWeekWrapOutcome = {
      expiredCount: 0,
      releasedPlayerIds: [],
      releasedPlayers: [],
      releasedWageRelief: 0,
      emergencySignings: 0,
      emergencySigningCost: 0,
      netBudgetDelta: 0,
      moraleDelta: 0,
      boardDelta: 0,
      squadBefore: 0,
      squadAfterRelease: 0,
      squadAfterTopUp: 0
    };

    return this.prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({
        where: { id: career.controlledClubId },
        select: { id: true }
      });
      if (!club) {
        return defaultOutcome;
      }

      await this.ensureControlledClubContracts(career, career.controlledClubId, tx);
      await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

      const [clubState, squadRows] = await Promise.all([
        tx.v2ClubState.upsert({
          where: {
            careerId_clubId: {
              careerId: career.id,
              clubId: career.controlledClubId
            }
          },
          create: {
            id: `${career.id}:cs:${career.controlledClubId}`,
            careerId: career.id,
            clubId: career.controlledClubId,
            morale: 55,
            fitnessTrend: 0,
            boardConfidence: 55,
            budgetBalance: 0,
            injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
            form: 'NNNNN'
          },
          update: {}
        }),
        tx.player.findMany({
          where: { currentClubId: career.controlledClubId },
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            position: true,
            weeklyWage: true,
            currentAbility: true,
            contractEnd: true
          }
        })
      ]);

      const referenceTime = career.currentDate.getTime();
      const expiredPlayers = squadRows.filter((player) => {
        if (!player.contractEnd) {
          return false;
        }
        return player.contractEnd.getTime() <= referenceTime;
      });

      const releasedPlayerIds = expiredPlayers.map((player) => player.id);
      const releasedPlayers = expiredPlayers.map((player) => ({
        id: player.id,
        name: player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${player.id}`,
        position: (player.position || 'UNK').toUpperCase()
      }));
      let releasedWageRelief = 0;
      for (const player of expiredPlayers) {
        const weeklyWage = Math.max(450, Math.round(player.weeklyWage ?? 900));
        releasedWageRelief += Math.round(weeklyWage * 8);

        await tx.player.update({
          where: { id: player.id },
          data: {
            currentClubId: null,
            contractEnd: career.currentDate,
            weeklyWage: Math.round(Math.max(350, weeklyWage * 0.45)),
            value: Math.round(Math.max(15000, (player.currentAbility ?? 60) * 30000))
          }
        });
      }

      if (releasedPlayerIds.length > 0) {
        await tx.v2PlayerState.deleteMany({
          where: {
            careerId: career.id,
            playerId: { in: releasedPlayerIds }
          }
        });
      }

      const minimumPlayableSquad = 18;
      const squadBefore = squadRows.length;
      const squadAfterRelease = squadBefore - releasedPlayerIds.length;
      const emergencyNeeded = Math.max(0, minimumPlayableSquad - squadAfterRelease);

      let emergencySignings = 0;
      let emergencySigningCost = 0;
      for (let idx = 0; idx < emergencyNeeded; idx += 1) {
        const random = mulberry32(stringToSeed(`${career.id}:${career.weekNumber}:week-wrap:topup:${idx}`));
        const recruit = await this.createSyntheticRecruit(tx, career.id, career.controlledClubId, random, {
          profile: 'depth',
          morale: 58,
          fitness: 90,
          form: 50,
          developmentDelta: 2
        });
        emergencySignings += 1;
        emergencySigningCost += Math.round(Math.max(450, recruit.weeklyWage) * 6);
      }

      const starDepartures = expiredPlayers.filter((player) => (player.currentAbility ?? 60) >= 82).length;
      const moraleDrop = releasedPlayerIds.length > 0
        ? Math.max(1, Math.round(releasedPlayerIds.length * 0.65 + starDepartures * 0.8))
        : 0;
      const moraleBoostFromSignings = emergencySignings > 0 ? Math.min(3, Math.round(emergencySignings * 0.35)) : 0;
      const moraleDelta = clamp(-moraleDrop + moraleBoostFromSignings, -15, 2);

      const boardPenalty = releasedPlayerIds.length > 0
        ? Math.min(8, Math.round(releasedPlayerIds.length * 0.55 + starDepartures))
        : 0;
      const boardRecovery = emergencySignings > 0 ? 1 : 0;
      const boardDelta = clamp(-boardPenalty + boardRecovery, -10, 2);
      const netBudgetDelta = releasedWageRelief - emergencySigningCost;

      if (releasedPlayerIds.length > 0 || emergencySignings > 0 || netBudgetDelta !== 0 || moraleDelta !== 0 || boardDelta !== 0) {
        await tx.v2ClubState.update({
          where: { id: clubState.id },
          data: {
            budgetBalance: { increment: netBudgetDelta },
            morale: clamp(clubState.morale + moraleDelta, 0, 100),
            boardConfidence: clamp(clubState.boardConfidence + boardDelta, 0, 100)
          }
        });
      }

      return {
        expiredCount: releasedPlayerIds.length,
        releasedPlayerIds,
        releasedPlayers,
        releasedWageRelief,
        emergencySignings,
        emergencySigningCost,
        netBudgetDelta,
        moraleDelta,
        boardDelta,
        squadBefore,
        squadAfterRelease,
        squadAfterTopUp: squadAfterRelease + emergencySignings
      };
    });
  }

  private async getLastContractWeekWrapDigest(careerId: string): Promise<ContractWeekWrapDigest | null> {
    const audit = await this.prisma.v2AuditLog.findFirst({
      where: {
        careerId,
        category: 'WEEK_WRAP'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        metadata: true
      }
    });

    if (!audit?.metadata) {
      return null;
    }

    let parsedMetadata: unknown;
    try {
      parsedMetadata = JSON.parse(audit.metadata);
    } catch {
      return null;
    }

    if (!parsedMetadata || typeof parsedMetadata !== 'object') {
      return null;
    }

    const metadata = parsedMetadata as Record<string, unknown>;
    if (!metadata.contractWeekWrap || typeof metadata.contractWeekWrap !== 'object') {
      return null;
    }
    const contractWeekWrap = metadata.contractWeekWrap as Record<string, unknown>;

    const expiredCount = Math.max(0, Math.round(this.toFiniteNumber(contractWeekWrap.expiredCount) ?? 0));
    const emergencySignings = Math.max(0, Math.round(this.toFiniteNumber(contractWeekWrap.emergencySignings) ?? 0));
    if (expiredCount <= 0 && emergencySignings <= 0) {
      return null;
    }

    const releasedPlayerIds = Array.isArray(contractWeekWrap.releasedPlayerIds)
      ? Array.from(new Set(
          contractWeekWrap.releasedPlayerIds
            .map((value) => this.toFiniteNumber(value))
            .filter((value): value is number => value !== null)
            .map((value) => Math.round(value))
            .filter((value) => value > 0)
        ))
      : [];

    const releasedPlayersFromMetadata = Array.isArray(contractWeekWrap.releasedPlayers)
      ? contractWeekWrap.releasedPlayers
          .filter((value): value is Record<string, unknown> => !!value && typeof value === 'object')
          .map((value) => {
            const id = this.toFiniteNumber(value.id);
            const name = this.toNullableString(value.name);
            const position = (this.toNullableString(value.position) ?? 'UNK').toUpperCase();
            if (id === null || !name) {
              return null;
            }
            return {
              id: Math.round(id),
              name,
              position
            };
          })
          .filter((value): value is ContractWeekWrapDigest['releasedPlayers'][number] => value !== null)
      : [];

    let releasedPlayers = releasedPlayersFromMetadata;
    if (releasedPlayers.length === 0 && releasedPlayerIds.length > 0) {
      const rows = await this.prisma.player.findMany({
        where: { id: { in: releasedPlayerIds } },
        select: {
          id: true,
          fullName: true,
          firstName: true,
          lastName: true,
          position: true
        }
      });
      const byId = new Map(rows.map((row) => [
        row.id,
        {
          id: row.id,
          name: row.fullName?.trim() || `${row.firstName} ${row.lastName}`.trim() || `Player ${row.id}`,
          position: (row.position || 'UNK').toUpperCase()
        }
      ] as const));
      releasedPlayers = releasedPlayerIds
        .map((id) => byId.get(id))
        .filter((value): value is ContractWeekWrapDigest['releasedPlayers'][number] => Boolean(value));
    }

    return {
      wrappedWeekNumber: this.toFiniteNumber(metadata.previousWeek) !== null ? Math.round(this.toFiniteNumber(metadata.previousWeek) as number) : null,
      nextWeekNumber: this.toFiniteNumber(metadata.nextWeek) !== null ? Math.round(this.toFiniteNumber(metadata.nextWeek) as number) : null,
      wrappedAt: audit.createdAt.toISOString(),
      expiredCount,
      releasedPlayers,
      releasedWageRelief: Math.round(this.toFiniteNumber(contractWeekWrap.releasedWageRelief) ?? 0),
      emergencySignings,
      emergencySigningCost: Math.round(this.toFiniteNumber(contractWeekWrap.emergencySigningCost) ?? 0),
      netBudgetDelta: Math.round(this.toFiniteNumber(contractWeekWrap.netBudgetDelta) ?? 0),
      moraleDelta: Math.round(this.toFiniteNumber(contractWeekWrap.moraleDelta) ?? 0),
      boardDelta: Math.round(this.toFiniteNumber(contractWeekWrap.boardDelta) ?? 0),
      squadBefore: Math.max(0, Math.round(this.toFiniteNumber(contractWeekWrap.squadBefore) ?? 0)),
      squadAfterRelease: Math.max(0, Math.round(this.toFiniteNumber(contractWeekWrap.squadAfterRelease) ?? 0)),
      squadAfterTopUp: Math.max(0, Math.round(this.toFiniteNumber(contractWeekWrap.squadAfterTopUp) ?? 0))
    };
  }

  private async prepareNextSeason(career: V2Career, season: string): Promise<{
    activeLeagueId: number | null;
    seasonStartDate: Date;
    promotedCount: number;
    relegatedCount: number;
    fixtureCount: number;
  }> {
    const standings = await this.prisma.v2LeagueState.findMany({
      where: { careerId: career.id },
      select: {
        leagueId: true,
        clubId: true,
        points: true,
        goalDifference: true,
        goalsFor: true
      }
    });

    const [startYearRaw] = season.split('/');
    const startYear = Number(startYearRaw);
    const seasonStartDate = Number.isFinite(startYear)
      ? new Date(startYear, 6, 1, 12, 0, 0, 0)
      : addDays(career.currentDate, 7);

    if (standings.length === 0) {
      return {
        activeLeagueId: career.activeLeagueId,
        seasonStartDate,
        promotedCount: 0,
        relegatedCount: 0,
        fixtureCount: 0
      };
    }

    const leagueIds = Array.from(new Set(standings.map((row) => row.leagueId)));
    const leagues = await this.prisma.league.findMany({
      where: { id: { in: leagueIds } },
      select: {
        id: true,
        name: true,
        level: true,
        region: true,
        matchdayType: true,
        tier: true
      }
    });
    const orderedLeagues = [...leagues].sort((a, b) =>
      a.tier - b.tier ||
      (a.region ?? '').localeCompare(b.region ?? '') ||
      (a.matchdayType ?? '').localeCompare(b.matchdayType ?? '') ||
      a.name.localeCompare(b.name)
    );

    const membershipByLeague = new Map<number, number[]>();
    for (const league of orderedLeagues) {
      const sorted = standings
        .filter((row) => row.leagueId === league.id)
        .sort((a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor ||
          a.clubId - b.clubId
        );
      membershipByLeague.set(league.id, sorted.map((row) => row.clubId));
    }

    const progressionByClub = new Map<number, string>();
    const movedClubs = new Set<number>();
    let promotedCount = 0;
    let relegatedCount = 0;

    const leaguesByGroup = this.groupLeaguesForSeasonTransition(orderedLeagues);
    for (const groupLeagues of leaguesByGroup.values()) {
      const tiers = Array.from(new Set(groupLeagues.map((league) => league.tier))).sort((a, b) => a - b);

      for (let tierIndex = 0; tierIndex < tiers.length - 1; tierIndex += 1) {
        const upperTier = tiers[tierIndex];
        const lowerTier = tiers[tierIndex + 1];

        if (lowerTier !== upperTier + 1) {
          continue;
        }

        const upperLeagues = groupLeagues
          .filter((league) => league.tier === upperTier)
          .sort((a, b) => a.name.localeCompare(b.name));
        const lowerLeagues = groupLeagues
          .filter((league) => league.tier === lowerTier)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (upperLeagues.length === 0 || lowerLeagues.length === 0) {
          continue;
        }

        const groupKey = this.getSeasonTransitionGroupKey(upperLeagues[0]);
        const targetSlots = this.getSeasonTransitionSlots(
          groupKey,
          upperTier,
          lowerTier,
          upperLeagues.length,
          lowerLeagues.length
        );
        if (targetSlots <= 0) {
          continue;
        }

        for (let upperIndex = 0; upperIndex < upperLeagues.length; upperIndex += 1) {
          const upperLeague = upperLeagues[upperIndex];
          const upperMembership = membershipByLeague.get(upperLeague.id) ?? [];
          if (upperMembership.length < 3) {
            continue;
          }

          const upperCandidates = upperMembership.filter((clubId) => !movedClubs.has(clubId));
          if (upperCandidates.length < 3) {
            continue;
          }

          const assignedLowerLeagues = lowerLeagues.filter(
            (_league, lowerIndex) => lowerIndex % upperLeagues.length === upperIndex
          );
          const lowerScope = assignedLowerLeagues.length > 0 ? assignedLowerLeagues : lowerLeagues;
          const promotionCandidates = this.collectPromotionCandidates(
            lowerScope,
            membershipByLeague,
            movedClubs
          );
          if (promotionCandidates.length === 0) {
            continue;
          }

          const slots = Math.min(targetSlots, upperCandidates.length - 1, promotionCandidates.length);
          if (slots <= 0) {
            continue;
          }

          const relegated = upperCandidates.slice(-slots);
          const promoted = promotionCandidates.slice(0, slots);

          membershipByLeague.set(
            upperLeague.id,
            [
              ...upperMembership.filter((clubId) => !relegated.includes(clubId)),
              ...promoted.map((entry) => entry.clubId)
            ]
          );

          promoted.forEach((entry, moveIndex) => {
            const lowerMembership = membershipByLeague.get(entry.fromLeagueId) ?? [];
            const relegatedClubId = relegated[moveIndex];
            membershipByLeague.set(
              entry.fromLeagueId,
              [...lowerMembership.filter((clubId) => clubId !== entry.clubId), relegatedClubId]
            );
          });

          promoted.forEach((entry) => {
            movedClubs.add(entry.clubId);
            if (!progressionByClub.has(entry.clubId)) {
              progressionByClub.set(entry.clubId, 'PROMOTED');
            }
          });

          relegated.forEach((clubId) => {
            movedClubs.add(clubId);
            if (!progressionByClub.has(clubId)) {
              progressionByClub.set(clubId, 'RELEGATED');
            }
          });

          promotedCount += promoted.length;
          relegatedCount += relegated.length;
        }
      }
    }

    const leagueStateRows: Array<{
      id: string;
      careerId: string;
      leagueId: number;
      clubId: number;
      position: number;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
      progressionStatus: string;
    }> = [];

    const fixtureRows: Array<{
      id: string;
      careerId: string;
      leagueId: number;
      homeClubId: number;
      awayClubId: number;
      matchDate: Date;
      weekNumber: number;
      status: string;
      isUserClubFixture: boolean;
    }> = [];

    let activeLeagueId: number | null = career.activeLeagueId;
    let totalFixtures = 0;
    const MAX_TOTAL_FIXTURES = 120000;

    for (const league of orderedLeagues) {
      const clubs = membershipByLeague.get(league.id) ?? [];
      if (clubs.length === 0) {
        continue;
      }

      clubs.forEach((clubId, idx) => {
        leagueStateRows.push({
          id: `${career.id}:ls:${league.id}:${clubId}`,
          careerId: career.id,
          leagueId: league.id,
          clubId,
          position: idx + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          progressionStatus: progressionByClub.get(clubId) ?? 'STABLE'
        });
      });

      if (clubs.includes(career.controlledClubId)) {
        activeLeagueId = league.id;
      }

      if (clubs.length < 2) {
        continue;
      }

      const seed = `${career.id}:${league.id}:${season}:${clubs.join('-')}`;
      const random = mulberry32(stringToSeed(seed));
      const orderedClubs = shuffled(clubs, random);
      const schedule = this.createScalableLeagueSchedule(orderedClubs, random);

      for (const pairing of schedule) {
        if (totalFixtures >= MAX_TOTAL_FIXTURES) {
          break;
        }

        fixtureRows.push({
          id: `${career.id}:fx:${league.id}:${pairing.week}:${pairing.homeClubId}:${pairing.awayClubId}`,
          careerId: career.id,
          leagueId: league.id,
          homeClubId: pairing.homeClubId,
          awayClubId: pairing.awayClubId,
          matchDate: addDays(seasonStartDate, (pairing.week - 1) * 7 + (league.id % 5)),
          weekNumber: pairing.week,
          status: V2_FIXTURE_STATUS.SCHEDULED,
          isUserClubFixture:
            pairing.homeClubId === career.controlledClubId || pairing.awayClubId === career.controlledClubId
        });

        totalFixtures += 1;
      }

      if (totalFixtures >= MAX_TOTAL_FIXTURES) {
        break;
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.v2Highlight.deleteMany({
        where: {
          match: {
            careerId: career.id
          }
        }
      });
      await tx.v2Match.deleteMany({ where: { careerId: career.id } });
      await tx.v2Fixture.deleteMany({ where: { careerId: career.id } });
      await tx.v2WeekPlan.deleteMany({ where: { careerId: career.id } });
      await tx.v2EventDecision.deleteMany({ where: { careerId: career.id } });
      await tx.v2InboxEvent.deleteMany({ where: { careerId: career.id } });
      await tx.v2LeagueState.deleteMany({ where: { careerId: career.id } });

      for (const batch of chunked(leagueStateRows, 500)) {
        await tx.v2LeagueState.createMany({ data: batch });
      }

      for (const batch of chunked(fixtureRows, 500)) {
        await tx.v2Fixture.createMany({ data: batch });
      }

      await tx.v2ClubState.updateMany({
        where: { careerId: career.id },
        data: { form: 'NNNNN' }
      });
    });

    return {
      activeLeagueId,
      seasonStartDate,
      promotedCount,
      relegatedCount,
      fixtureCount: fixtureRows.length
    };
  }

  private isO21League(league: Pick<LeagueTransitionMeta, 'name' | 'level' | 'region'>): boolean {
    const haystack = `${league.name} ${league.level} ${league.region ?? ''}`.toLowerCase();
    return /\b(o21|onder\s*21|u21)\b/.test(haystack);
  }

  private getSeasonTransitionGroupKey(league: LeagueTransitionMeta): string {
    if (this.isO21League(league)) {
      return 'O21';
    }

    if (league.tier <= 5) {
      return 'NATIONAL';
    }

    const region = (league.region ?? 'UNKNOWN').toUpperCase();
    const matchdayType = (league.matchdayType ?? 'MIXED').toUpperCase();
    return `${region}:${matchdayType}`;
  }

  private groupLeaguesForSeasonTransition(leagues: LeagueTransitionMeta[]): Map<string, LeagueTransitionMeta[]> {
    const byGroup = new Map<string, LeagueTransitionMeta[]>();

    for (const league of leagues) {
      const key = this.getSeasonTransitionGroupKey(league);
      const current = byGroup.get(key) ?? [];
      current.push(league);
      byGroup.set(key, current);
    }

    return byGroup;
  }

  private getSeasonTransitionSlots(
    groupKey: string,
    upperTier: number,
    lowerTier: number,
    upperLeagueCount: number,
    lowerLeagueCount: number
  ): number {
    if (groupKey === 'O21') {
      if (upperTier === 13 && lowerTier === 14) {
        return Math.min(2, lowerLeagueCount);
      }
      return 2;
    }

    if (groupKey === 'NATIONAL' && upperTier <= 2) {
      return 2;
    }

    if (upperLeagueCount === 0 || lowerLeagueCount === 0) {
      return 0;
    }

    return 2;
  }

  private collectPromotionCandidates(
    lowerLeagues: LeagueTransitionMeta[],
    membershipByLeague: Map<number, number[]>,
    movedClubs: Set<number>
  ): PromotionCandidate[] {
    const pools = lowerLeagues.map((league) => ({
      leagueId: league.id,
      clubs: (membershipByLeague.get(league.id) ?? []).filter((clubId) => !movedClubs.has(clubId))
    }));

    const candidates: PromotionCandidate[] = [];
    let depth = 0;
    let appended = true;

    while (appended) {
      appended = false;
      for (const pool of pools) {
        if (depth >= pool.clubs.length) {
          continue;
        }
        candidates.push({
          clubId: pool.clubs[depth],
          fromLeagueId: pool.leagueId
        });
        appended = true;
      }
      depth += 1;
    }

    return candidates;
  }

  private async applyFixtureResultToStandings(
    tx: DbClient,
    careerId: string,
    leagueId: number,
    homeClubId: number,
    awayClubId: number,
    homeScore: number,
    awayScore: number
  ) {
    const homeWin = homeScore > awayScore;
    const awayWin = awayScore > homeScore;

    await tx.v2LeagueState.update({
      where: {
        careerId_leagueId_clubId: {
          careerId,
          leagueId,
          clubId: homeClubId
        }
      },
      data: {
        played: { increment: 1 },
        won: { increment: homeWin ? 1 : 0 },
        drawn: { increment: homeWin || awayWin ? 0 : 1 },
        lost: { increment: awayWin ? 1 : 0 },
        goalsFor: { increment: homeScore },
        goalsAgainst: { increment: awayScore },
        goalDifference: { increment: homeScore - awayScore },
        points: { increment: homeWin ? 3 : awayWin ? 0 : 1 }
      }
    });

    await tx.v2LeagueState.update({
      where: {
        careerId_leagueId_clubId: {
          careerId,
          leagueId,
          clubId: awayClubId
        }
      },
      data: {
        played: { increment: 1 },
        won: { increment: awayWin ? 1 : 0 },
        drawn: { increment: homeWin || awayWin ? 0 : 1 },
        lost: { increment: homeWin ? 1 : 0 },
        goalsFor: { increment: awayScore },
        goalsAgainst: { increment: homeScore },
        goalDifference: { increment: awayScore - homeScore },
        points: { increment: awayWin ? 3 : homeWin ? 0 : 1 }
      }
    });
  }

  private async recalculateLeaguePositions(tx: DbClient, careerId: string, leagueIds: number[]) {
    for (const leagueId of leagueIds) {
      const rows = await tx.v2LeagueState.findMany({
        where: {
          careerId,
          leagueId
        },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
          { clubId: 'asc' }
        ]
      });

      for (let i = 0; i < rows.length; i += 1) {
        await tx.v2LeagueState.update({
          where: { id: rows[i].id },
          data: { position: i + 1 }
        });
      }
    }
  }

  private computePostMatchDelta(userGoals: number, oppGoals: number) {
    if (userGoals > oppGoals) {
      return {
        moraleDelta: 4,
        boardDelta: 3,
        budgetDelta: 90000,
        fitnessTrendDelta: -1
      };
    }
    if (userGoals < oppGoals) {
      return {
        moraleDelta: -3,
        boardDelta: -3,
        budgetDelta: 0,
        fitnessTrendDelta: -2
      };
    }
    return {
      moraleDelta: 1,
      boardDelta: 0,
      budgetDelta: 25000,
      fitnessTrendDelta: -1
    };
  }

  private async applyPostMatchClubForm(
    tx: DbClient,
    careerId: string,
    clubId: number,
    result: 'W' | 'D' | 'L'
  ) {
    const row = await tx.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId
        }
      }
    });

    if (!row) {
      return;
    }

    const normalized = (row.form || 'NNNNN')
      .toUpperCase()
      .replace(/[^WDLN]/g, 'N')
      .padEnd(5, 'N')
      .slice(0, 5);
    const nextForm = `${result}${normalized}`.slice(0, 5);

    await tx.v2ClubState.update({
      where: { id: row.id },
      data: { form: nextForm }
    });
  }

  private async applyPostMatchPlayerEffects(
    tx: DbClient,
    career: V2Career,
    fixture: V2Fixture,
    match: V2Match
  ) {
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId, tx);

    const stateRows = await tx.v2PlayerState.findMany({
      where: {
        careerId: career.id,
        clubId: career.controlledClubId
      },
      orderBy: { playerId: 'asc' }
    });
    const activeMedicalPlans = await this.getActivePlayerMedicalPlanMap(career.id, career.weekNumber, tx);
    const activeSuspensionsBefore = await this.getActivePlayerSuspensionMap(career.id, tx);

    if (stateRows.length === 0) {
      return;
    }
    const playerNameRows = await tx.player.findMany({
      where: {
        id: { in: stateRows.map((row) => row.playerId) }
      },
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true
      }
    });
    const playerNameById = new Map(
      playerNameRows.map((row) => [
        row.id,
        row.fullName?.trim() || `${row.firstName} ${row.lastName}`.trim() || `Player ${row.id}`
      ])
    );
    for (const row of stateRows) {
      if (!row.isSuspended || activeSuspensionsBefore.has(row.playerId)) {
        continue;
      }
      activeSuspensionsBefore.set(
        row.playerId,
        this.buildLegacySuspensionFallback(
          career.id,
          row.playerId,
          playerNameById.get(row.playerId) ?? `Player ${row.playerId}`,
          career.weekNumber
        )
      );
    }
    const stateByPlayerId = new Map(stateRows.map((row) => [row.playerId, row]));

    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const ranked = [...stateRows].sort((a, b) =>
      (b.fitness + b.form * 0.6 + b.morale * 0.4) - (a.fitness + a.form * 0.6 + a.morale * 0.4)
    );

    const validIds = new Set(ranked.map((row) => row.playerId));
    const startingPlayerIds = interventionState.prep.startingPlayerIds
      .filter((playerId) => validIds.has(playerId))
      .slice(0, 11);
    const resolvedStarters = startingPlayerIds.length === 11
      ? startingPlayerIds
      : ranked.slice(0, 11).map((row) => row.playerId);
    const starterSet = new Set(resolvedStarters);

    const benchPlayerIds = interventionState.prep.benchPlayerIds
      .filter((playerId) => validIds.has(playerId) && !starterSet.has(playerId))
      .slice(0, 12);
    const resolvedBench = benchPlayerIds.length > 0
      ? benchPlayerIds
      : ranked.filter((row) => !starterSet.has(row.playerId)).slice(0, 7).map((row) => row.playerId);
    const benchSet = new Set(resolvedBench);
    const liveStarterSet = new Set(
      interventionState.live.currentStartingPlayerIds.filter((playerId) => validIds.has(playerId))
    );
    const subbedOnSet = new Set(
      [...liveStarterSet].filter((playerId) => !starterSet.has(playerId))
    );
    const subbedOffSet = new Set(
      [...starterSet].filter((playerId) => !liveStarterSet.has(playerId))
    );

    const userIsHome = fixture.homeClubId === career.controlledClubId;
    const userSide: 'home' | 'away' = userIsHome ? 'home' : 'away';
    const userGoals = userIsHome ? match.homeScore : match.awayScore;
    const oppGoals = userIsHome ? match.awayScore : match.homeScore;
    const resultMoraleDelta = userGoals > oppGoals ? 2 : userGoals < oppGoals ? -2 : 0;
    const resultFormDelta = userGoals > oppGoals ? 3 : userGoals < oppGoals ? -3 : 1;

    const userHighlights = await tx.v2Highlight.findMany({
      where: {
        matchId: match.id,
        teamSide: userSide
      },
      select: {
        eventType: true,
        actorId: true
      }
    });
    const suspendedFromCards = new Set<number>();
    const goalsByPlayer = new Map<number, number>();
    const penaltyMissByPlayer = new Set<number>();
    const yellowCardsByPlayer = new Map<number, number>();

    let unknownRedCards = 0;
    for (const highlight of userHighlights) {
      const actorId = highlight.actorId ?? undefined;
      if (highlight.eventType === 'RED_CARD') {
        if (actorId && stateByPlayerId.has(actorId)) {
          suspendedFromCards.add(actorId);
        } else {
          unknownRedCards += 1;
        }
        continue;
      }

      if (!actorId || !stateByPlayerId.has(actorId)) {
        continue;
      }

      if (highlight.eventType === 'GOAL' || highlight.eventType === 'PENALTY_GOAL') {
        goalsByPlayer.set(actorId, (goalsByPlayer.get(actorId) ?? 0) + 1);
      } else if (highlight.eventType === 'PENALTY_MISS') {
        penaltyMissByPlayer.add(actorId);
      } else if (highlight.eventType === 'YELLOW_CARD') {
        yellowCardsByPlayer.set(actorId, (yellowCardsByPlayer.get(actorId) ?? 0) + 1);
      }
    }

    if (unknownRedCards > 0) {
      const fallbackTargets = [...resolvedStarters];
      while (unknownRedCards > 0 && fallbackTargets.length > 0) {
        const fallbackPlayerId = fallbackTargets.shift() as number;
        if (!suspendedFromCards.has(fallbackPlayerId)) {
          suspendedFromCards.add(fallbackPlayerId);
          unknownRedCards -= 1;
        }
      }
    }
    const random = mulberry32(stringToSeed(`${career.id}:${match.id}:post-player`));
    const clubOperationModifiers = resolveClubOperationsPerformanceModifiers(
      await this.getClubOperationsLevels(career.id, tx)
    );
    const newSuspensionsByPlayer = new Map<number, ActivePlayerSuspension>();

    let injuriesTotal = 0;
    let severeInjuries = 0;

    for (const row of stateRows) {
      const role = starterSet.has(row.playerId)
        ? 'starter'
        : benchSet.has(row.playerId)
          ? 'bench'
          : 'reserve';

      let fitness = row.fitness;
      let form = row.form;
      let morale = row.morale;
      let isInjured = row.isInjured;
      let injuryWeeks = row.injuryWeeks;
      let isSuspended = false;
      let developmentDelta = row.developmentDelta;
      const activeMedicalPlan = activeMedicalPlans.get(row.playerId) ?? null;
      const medicalProjectedEffects = activeMedicalPlan
        ? this.getMedicalPlanProjectedEffects({
          planCode: activeMedicalPlan.planCode,
          isInjured,
          injuryWeeks,
          fitness
        })
        : null;

      if (isInjured) {
        injuryWeeks = Math.max(0, injuryWeeks - 1 - clubOperationModifiers.medicalRecoveryBonus);
        if (injuryWeeks === 0) {
          isInjured = false;
        }
        fitness += (role === 'starter' ? -2 : 3) + clubOperationModifiers.medicalFitnessBonus;
      } else {
        let fatigue = 0;
        if (role === 'starter') {
          fatigue = 7 + Math.floor(random() * 5);
          if (interventionState.prep.preMatchInstruction === V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS) {
            fatigue += 2;
          } else if (interventionState.prep.preMatchInstruction === V2_PRE_MATCH_INSTRUCTIONS.LOW_BLOCK) {
            fatigue -= 1;
          }
          if (subbedOffSet.has(row.playerId)) {
            fatigue = Math.max(3, fatigue - 3);
          }
        } else if (role === 'bench') {
          fatigue = 3 + Math.floor(random() * 3);
          if (subbedOnSet.has(row.playerId)) {
            fatigue += 2;
          }
        } else {
          fatigue = -1 + Math.floor(random() * 3);
        }
        fatigue += medicalProjectedEffects?.fatigueModifier ?? 0;
        fatigue -= clubOperationModifiers.postMatchFatigueRelief;
        fatigue = clamp(Math.round(fatigue), -2, 16);

        fitness -= fatigue;

        if (role !== 'reserve') {
          let injuryRisk = role === 'starter' ? 0.03 : 0.012;
          if (fitness < 72) {
            injuryRisk += 0.03;
          }
          if (interventionState.prep.preMatchInstruction === V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS && role === 'starter') {
            injuryRisk += 0.015;
          }
          injuryRisk += medicalProjectedEffects?.injuryRiskDelta ?? 0;
          injuryRisk += clubOperationModifiers.injuryRiskDelta;
          injuryRisk = clamp(injuryRisk, 0.002, 0.32);
          if (random() < injuryRisk) {
            isInjured = true;
            injuryWeeks = 1 + Math.floor(random() * 4);
            fitness -= 6;
            morale -= 2;
          }
        }
      }

      if (role === 'starter') {
        morale += resultMoraleDelta + (random() < 0.25 ? -1 : 0);
        form += resultFormDelta + (Math.floor(random() * 3) - 1);
        developmentDelta += 1;
      } else if (role === 'bench') {
        morale += Math.sign(resultMoraleDelta);
        form += Math.round(resultFormDelta / 2);
        if (subbedOnSet.has(row.playerId)) {
          morale += 1;
          form += 1;
        }
      } else {
        morale += resultMoraleDelta > 0 ? 1 : resultMoraleDelta < 0 ? -1 : 0;
        fitness += 1;
      }

      const goalsScored = goalsByPlayer.get(row.playerId) ?? 0;
      if (goalsScored > 0) {
        morale += clamp(goalsScored * 2, 0, 6);
        form += clamp(goalsScored * 3, 0, 10);
        developmentDelta += goalsScored >= 2 ? 2 : 1;
      }

      if (penaltyMissByPlayer.has(row.playerId)) {
        morale -= 3;
        form -= 2;
      }

      const yellowCards = yellowCardsByPlayer.get(row.playerId) ?? 0;
      if (yellowCards > 0) {
        morale -= yellowCards;
        form -= yellowCards >= 2 ? 2 : 0;
        if (yellowCards >= 2) {
          const playerName = playerNameById.get(row.playerId) ?? `Player ${row.playerId}`;
          newSuspensionsByPlayer.set(row.playerId, {
            suspensionId: this.buildPlayerSuspensionId(career.id, fixture.id, row.playerId),
            playerId: row.playerId,
            playerName,
            matchesRemaining: 1,
            reason: 'Dismissed for two yellow cards',
            issuedWeekNumber: career.weekNumber,
            sourceFixtureId: fixture.id,
            note: this.buildSuspensionNote('Dismissed for two yellow cards', 1)
          });
          isSuspended = true;
        }
      }

      if (suspendedFromCards.has(row.playerId)) {
        const playerName = playerNameById.get(row.playerId) ?? `Player ${row.playerId}`;
        newSuspensionsByPlayer.set(row.playerId, {
          suspensionId: this.buildPlayerSuspensionId(career.id, fixture.id, row.playerId),
          playerId: row.playerId,
          playerName,
          matchesRemaining: 1,
          reason: 'Sent off for a red card',
          issuedWeekNumber: career.weekNumber,
          sourceFixtureId: fixture.id,
          note: this.buildSuspensionNote('Sent off for a red card', 1)
        });
        isSuspended = true;
        morale -= 3;
        form -= 3;
      }

      fitness = clamp(fitness, 35, 100);
      form = clamp(form, 0, 100);
      morale = clamp(morale, 20, 100);
      developmentDelta = clamp(developmentDelta, -30, 60);

      await tx.v2PlayerState.update({
        where: { id: row.id },
        data: {
          fitness,
          form,
          morale,
          isInjured,
          injuryWeeks,
          isSuspended,
          developmentDelta
        }
      });

      if (isInjured) {
        injuriesTotal += 1;
        if (injuryWeeks >= 3) {
          severeInjuries += 1;
        }
      }
    }

    for (const suspension of activeSuspensionsBefore.values()) {
      await this.writeAudit(tx, career.id, 'PLAYER_DISCIPLINE', `${suspension.playerName} served a suspension.`, {
        source: 'MATCH_SUSPENSION_SERVED',
        suspensionId: suspension.suspensionId,
        playerId: suspension.playerId,
        playerName: suspension.playerName,
        fixtureId: fixture.id,
        servedWeekNumber: career.weekNumber,
        matchesRemainingAfter: 0,
        legacyFallback: Boolean(suspension.isLegacyFallback)
      });
    }

    for (const suspension of newSuspensionsByPlayer.values()) {
      await this.writeAudit(tx, career.id, 'PLAYER_DISCIPLINE', `${suspension.playerName} suspended: ${suspension.reason}.`, {
        source: 'MATCH_SUSPENSION_SET',
        suspensionId: suspension.suspensionId,
        playerId: suspension.playerId,
        playerName: suspension.playerName,
        matchesRemaining: suspension.matchesRemaining,
        reason: suspension.reason,
        issuedWeekNumber: suspension.issuedWeekNumber,
        sourceFixtureId: suspension.sourceFixtureId
      });
    }

    await tx.v2ClubState.upsert({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      },
      update: {
        injuriesSummary: JSON.stringify({ total: injuriesTotal, severe: severeInjuries })
      },
      create: {
        id: `${career.id}:cs:${career.controlledClubId}`,
        careerId: career.id,
        clubId: career.controlledClubId,
        morale: 55,
        fitnessTrend: 0,
        boardConfidence: 55,
        budgetBalance: 0,
        injuriesSummary: JSON.stringify({ total: injuriesTotal, severe: severeInjuries }),
        form: 'NNNNN'
      }
    });
  }

  private buildControlledClubMatchUsageRows(
    prep: ResolvedMatchPrep,
    substitutionHighlights: Array<{ minute: number; payload: string | null }>
  ) {
    const usageByPlayerId = new Map<number, {
      role: 'STARTER' | 'SUBSTITUTE' | 'UNUSED_BENCH';
      started: boolean;
      inMatchdaySquad: boolean;
      minutesPlayed: number;
      subbedOn: boolean;
      subbedOff: boolean;
    }>();

    for (const playerId of prep.startingPlayerIds) {
      usageByPlayerId.set(playerId, {
        role: 'STARTER',
        started: true,
        inMatchdaySquad: true,
        minutesPlayed: 90,
        subbedOn: false,
        subbedOff: false
      });
    }
    for (const playerId of prep.benchPlayerIds) {
      if (usageByPlayerId.has(playerId)) {
        continue;
      }
      usageByPlayerId.set(playerId, {
        role: 'UNUSED_BENCH',
        started: false,
        inMatchdaySquad: true,
        minutesPlayed: 0,
        subbedOn: false,
        subbedOff: false
      });
    }

    const orderedHighlights = [...substitutionHighlights].sort((a, b) => a.minute - b.minute);
    for (const highlight of orderedHighlights) {
      const payload = this.parseAuditMetadataRecord(highlight.payload);
      if (!payload) {
        continue;
      }
      const outPlayerId = Math.round(this.toFiniteNumber(payload.outPlayerId) ?? 0);
      const inPlayerId = Math.round(this.toFiniteNumber(payload.inPlayerId) ?? 0);
      if (outPlayerId > 0 && usageByPlayerId.has(outPlayerId)) {
        const row = usageByPlayerId.get(outPlayerId)!;
        row.subbedOff = true;
        row.minutesPlayed = Math.max(1, Math.min(row.minutesPlayed, highlight.minute - 1));
      }
      if (inPlayerId > 0) {
        const existing = usageByPlayerId.get(inPlayerId) ?? {
          role: 'UNUSED_BENCH' as const,
          started: false,
          inMatchdaySquad: true,
          minutesPlayed: 0,
          subbedOn: false,
          subbedOff: false
        };
        existing.role = 'SUBSTITUTE';
        existing.subbedOn = true;
        existing.minutesPlayed = Math.max(existing.minutesPlayed, Math.max(1, 91 - highlight.minute));
        usageByPlayerId.set(inPlayerId, existing);
      }
    }

    return usageByPlayerId;
  }

  private async recordControlledClubMatchUsage(
    tx: DbClient,
    career: V2Career,
    fixture: V2Fixture,
    match: V2Match
  ) {
    if (!fixture.isUserClubFixture) {
      return;
    }

    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const matchdayPlayerIds = Array.from(new Set([
      ...interventionState.prep.startingPlayerIds,
      ...interventionState.prep.benchPlayerIds
    ])).filter((playerId) => Number.isInteger(playerId) && playerId > 0);
    if (matchdayPlayerIds.length === 0) {
      return;
    }

    const [players, substitutionHighlights] = await Promise.all([
      tx.player.findMany({
        where: {
          id: { in: matchdayPlayerIds },
          currentClubId: career.controlledClubId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true
        }
      }),
      tx.v2Highlight.findMany({
        where: {
          matchId: match.id,
          eventType: 'SUBSTITUTION'
        },
        orderBy: { minute: 'asc' },
        select: {
          minute: true,
          payload: true
        }
      })
    ]);

    const playerById = new Map(players.map((row) => [row.id, row]));
    const usageByPlayerId = this.buildControlledClubMatchUsageRows(interventionState.prep, substitutionHighlights);
    for (const [playerId, usage] of usageByPlayerId.entries()) {
      const player = playerById.get(playerId);
      if (!player) {
        continue;
      }
      const playerName = player.fullName?.trim() || `${player.firstName} ${player.lastName}`.trim() || `Player ${playerId}`;
      const summary = usage.role === 'STARTER'
        ? `Started and logged ${usage.minutesPlayed} minute(s).`
        : usage.role === 'SUBSTITUTE'
          ? `Came on from the bench for ${usage.minutesPlayed} minute(s).`
          : 'Named on the bench but did not enter the match.';

      await this.writeAudit(tx, career.id, 'MATCH_USAGE', `Recorded match usage for ${playerName}.`, {
        source: 'MATCH_USAGE_SUMMARY',
        fixtureId: fixture.id,
        weekNumber: fixture.weekNumber,
        playerId,
        playerName,
        role: usage.role,
        started: usage.started,
        inMatchdaySquad: usage.inMatchdaySquad,
        minutesPlayed: usage.minutesPlayed,
        subbedOn: usage.subbedOn,
        subbedOff: usage.subbedOff,
        summary
      });
    }
  }

  private async resolvePlayingTimePromisesFromMatchUsage(
    tx: DbClient,
    career: V2Career,
    fixture: V2Fixture
  ) {
    const activePromises = await this.getActivePlayingTimePromiseMap(career.id, tx);
    if (activePromises.size === 0) {
      return;
    }

    const playerStates = await tx.v2PlayerState.findMany({
      where: {
        careerId: career.id,
        clubId: career.controlledClubId,
        playerId: { in: Array.from(activePromises.keys()) }
      }
    });
    const stateByPlayerId = new Map(playerStates.map((row) => [row.playerId, row]));
    let accumulatedBoardDelta = 0;

    for (const promise of activePromises.values()) {
      const usageSummary = (await this.getPlayerMatchUsageSummaryMap(
        career.id,
        [promise.playerId],
        promise.createdWeekNumber,
        tx
      )).get(promise.playerId);
      if (!usageSummary || usageSummary.matchdaySquadCount <= 0 || usageSummary.lastFixtureId !== fixture.id) {
        continue;
      }

      const playerState = stateByPlayerId.get(promise.playerId);
      if (playerState) {
        await tx.v2PlayerState.update({
          where: { id: playerState.id },
          data: {
            morale: clamp(playerState.morale + (usageSummary.appearanceCount > 0 ? 2 : 1), 20, 100),
            form: clamp(playerState.form + (usageSummary.appearanceCount > 0 ? 1 : 0), 0, 100)
          }
        });
      }

      accumulatedBoardDelta += usageSummary.appearanceCount > 0 ? 1 : 0;
      await this.writeAudit(tx, career.id, 'PLAYER_PROMISE', `Playing-time promise honored for ${promise.playerName}.`, {
        source: 'PLAYING_TIME_PROMISE_REVIEW',
        action: 'HONOR',
        promiseId: promise.promiseId,
        playerId: promise.playerId,
        playerName: promise.playerName,
        originWeekNumber: promise.createdWeekNumber,
        dueWeekNumber: promise.dueWeekNumber,
        resolvedWeekNumber: career.weekNumber,
        sourceAction: 'MATCHDAY_USAGE',
        fixtureId: fixture.id,
        matchdaySquadCount: usageSummary.matchdaySquadCount,
        appearanceCount: usageSummary.appearanceCount,
        totalMinutes: usageSummary.totalMinutes
      });
    }

    if (accumulatedBoardDelta !== 0) {
      await this.applyClubEffects(tx, career.id, career.controlledClubId, {
        boardDelta: accumulatedBoardDelta
      });
    }
  }

  private summarizePlayerImpact(
    rows: Array<{
      playerId?: number;
      morale: number;
      fitness: number;
      form: number;
      isInjured: boolean;
      isSuspended: boolean;
    }>
  ) {
    if (rows.length === 0) {
      return null;
    }

    const totals = rows.reduce((acc, row) => ({
      morale: acc.morale + row.morale,
      fitness: acc.fitness + row.fitness,
      form: acc.form + row.form,
      injured: acc.injured + (row.isInjured ? 1 : 0),
      suspended: acc.suspended + (row.isSuspended ? 1 : 0)
    }), { morale: 0, fitness: 0, form: 0, injured: 0, suspended: 0 });

    return {
      averageMorale: Number((totals.morale / rows.length).toFixed(1)),
      averageFitness: Number((totals.fitness / rows.length).toFixed(1)),
      averageForm: Number((totals.form / rows.length).toFixed(1)),
      injuredCount: totals.injured,
      suspendedCount: totals.suspended
    };
  }

  private async buildLatestPlannerMatchInsight(career: V2Career, fixture: V2Fixture): Promise<PlannerMatchInsight | null> {
    const match = await this.prisma.v2Match.findUnique({
      where: { fixtureId: fixture.id }
    });

    if (!match) {
      return null;
    }

    const [playerStates, matchHighlights, squadPlayers, fixturePresentation] = await Promise.all([
      this.prisma.v2PlayerState.findMany({
        where: {
          careerId: career.id,
          clubId: career.controlledClubId
        },
        select: {
          playerId: true,
          morale: true,
          fitness: true,
          form: true,
          isInjured: true,
          isSuspended: true
        }
      }),
      this.prisma.v2Highlight.findMany({
        where: { matchId: match.id },
        select: {
          minute: true,
          eventType: true,
          teamSide: true,
          xThreatRank: true,
          payload: true,
          actorId: true
        },
        orderBy: [{ minute: 'asc' }, { xThreatRank: 'desc' }]
      }),
      this.prisma.player.findMany({
        where: { currentClubId: career.controlledClubId },
        select: {
          id: true,
          fullName: true,
          position: true
        }
      }),
      this.toFixturePresentation(fixture, career.controlledClubId)
    ]);

    const interventionState = this.parseInterventionState(match.interventions as string | null);
    const interventions = this.normalizeInterventionEntries(interventionState.entries);
    const userTeamSide: 'home' | 'away' = fixture.homeClubId === career.controlledClubId ? 'home' : 'away';
    const interventionImpact = this.buildInterventionImpactTelemetry(interventions, matchHighlights, userTeamSide);

    return this.buildPostMatchAnalytics(
      career,
      fixture,
      match,
      interventionState,
      matchHighlights,
      squadPlayers,
      playerStates,
      interventionImpact,
      fixturePresentation
    ).plannerInsight;
  }

  private buildPostMatchAnalytics(
    career: V2Career,
    fixture: V2Fixture,
    match: V2Match,
    interventionState: MatchInterventionState,
    matchHighlights: Array<{
      minute: number;
      eventType: string;
      teamSide: string | null;
      xThreatRank: number;
      payload: unknown;
      actorId: number | null;
    }>,
    squadPlayers: Array<{
      id: number;
      fullName: string | null;
      position: string;
    }>,
    playerStates: Array<{
      playerId: number;
      morale: number;
      fitness: number;
      form: number;
      isInjured: boolean;
      isSuspended: boolean;
    }>,
    interventionImpact: InterventionImpactTelemetry | null,
    fixturePresentation?: {
      opponentClubName?: string | null;
      matchDate?: string | Date | null;
    } | null
  ): PostMatchAnalyticsBundle {
    const chanceQuality = this.buildChanceQualitySummary(fixture, match, matchHighlights, career.controlledClubId);
    const playerRatings = this.buildPlayerRatingsSummary(
      career,
      fixture,
      match,
      interventionState,
      matchHighlights,
      squadPlayers,
      playerStates
    );
    const tacticalFeedback = this.buildTacticalFeedbackSummary(
      career.controlledClubId,
      fixture,
      chanceQuality,
      this.summarizePlayerImpact(playerStates),
      interventionImpact,
      interventionState
    );
    const plannerInsight = this.buildPlannerMatchInsight(
      career,
      fixture,
      match,
      tacticalFeedback,
      fixturePresentation
    );

    return {
      playerRatings,
      chanceQuality,
      tacticalFeedback,
      plannerInsight
    };
  }

  private buildChanceQualitySummary(
    fixture: V2Fixture,
    match: V2Match,
    highlights: Array<{
      minute: number;
      eventType: string;
      teamSide: string | null;
      xThreatRank: number;
      payload: unknown;
      actorId: number | null;
    }>,
    controlledClubId: number
  ): ChanceQualitySummary {
    const shotEvents = new Set(['GOAL', 'SAVE', 'MISS', 'WOODWORK', 'BLOCKED_SHOT', 'PENALTY_GOAL', 'PENALTY_MISS']);
    const onTargetEvents = new Set(['GOAL', 'SAVE', 'PENALTY_GOAL']);
    const emptySide = (): ChanceQualitySideSummary => ({
      shots: 0,
      shotsOnTarget: 0,
      bigChances: 0,
      totalShotXg: 0,
      averageShotXg: 0,
      bestChanceXg: 0,
      woodwork: 0,
      blockedShots: 0,
      offsides: 0,
      penaltiesScored: 0,
      penaltiesMissed: 0
    });

    const summary = {
      home: emptySide(),
      away: emptySide()
    };

    for (const highlight of highlights) {
      const side = highlight.teamSide === 'home' || highlight.teamSide === 'away'
        ? highlight.teamSide
        : null;
      if (!side) {
        continue;
      }

      const sideSummary = summary[side];
      const payload = this.parseHighlightPayload(highlight.payload);
      const shotXg = clamp(
        this.toFiniteNumber(payload.shotXg)
          ?? ((this.toFiniteNumber(payload.quality) ?? highlight.xThreatRank ?? 0) * 0.85),
        0,
        1.25
      );

      if (highlight.eventType === 'OFFSIDE') {
        sideSummary.offsides += 1;
        continue;
      }

      if (!shotEvents.has(highlight.eventType)) {
        continue;
      }

      sideSummary.shots += 1;
      sideSummary.totalShotXg = Number((sideSummary.totalShotXg + shotXg).toFixed(2));
      sideSummary.bestChanceXg = Math.max(sideSummary.bestChanceXg, Number(shotXg.toFixed(2)));
      if (onTargetEvents.has(highlight.eventType)) {
        sideSummary.shotsOnTarget += 1;
      }
      if (highlight.eventType === 'WOODWORK') {
        sideSummary.woodwork += 1;
      }
      if (highlight.eventType === 'BLOCKED_SHOT') {
        sideSummary.blockedShots += 1;
      }
      if (highlight.eventType === 'PENALTY_GOAL') {
        sideSummary.penaltiesScored += 1;
      }
      if (highlight.eventType === 'PENALTY_MISS') {
        sideSummary.penaltiesMissed += 1;
      }
      if (shotXg >= 0.3 || (this.toFiniteNumber(payload.quality) ?? 0) >= 0.34) {
        sideSummary.bigChances += 1;
      }
    }

    summary.home.averageShotXg = summary.home.shots > 0 ? Number((summary.home.totalShotXg / summary.home.shots).toFixed(2)) : 0;
    summary.away.averageShotXg = summary.away.shots > 0 ? Number((summary.away.totalShotXg / summary.away.shots).toFixed(2)) : 0;

    const userIsHome = fixture.homeClubId === controlledClubId;
    const userSide = userIsHome ? summary.home : summary.away;
    const opponentSide = userIsHome ? summary.away : summary.home;
    const userGoals = userIsHome ? match.homeScore : match.awayScore;
    const opponentGoals = userIsHome ? match.awayScore : match.homeScore;
    const xgDiff = Number((userSide.totalShotXg - opponentSide.totalShotXg).toFixed(2));
    const goalDiff = userGoals - opponentGoals;

    let verdict: ChanceQualitySummary['verdict'] = 'EVEN';
    let overview = 'Chance quality was broadly even and the margins were small.';

    if (xgDiff >= 0.45 && goalDiff <= 0) {
      verdict = 'DESERVED_MORE';
      overview = 'The side created the cleaner openings, but the finishing did not match the threat created.';
    } else if (xgDiff >= 0.3) {
      verdict = 'EDGED_IT';
      overview = 'The side generated the better openings and generally edged the quality battle.';
    } else if (xgDiff <= -0.45 && goalDiff >= 0) {
      verdict = 'CLINICAL_EDGE';
      overview = 'The result leaned on efficiency because the opponent still produced the cleaner looks.';
    } else if (xgDiff <= -0.3) {
      verdict = 'SECOND_BEST';
      overview = 'The opponent got to better chances too often and the side spent too much of the match reacting.';
    }

    return {
      summary: overview,
      verdict,
      home: summary.home,
      away: summary.away
    };
  }

  private buildPlayerRatingsSummary(
    career: V2Career,
    fixture: V2Fixture,
    match: V2Match,
    interventionState: MatchInterventionState,
    highlights: Array<{
      minute: number;
      eventType: string;
      teamSide: string | null;
      xThreatRank: number;
      payload: unknown;
      actorId: number | null;
    }>,
    squadPlayers: Array<{
      id: number;
      fullName: string | null;
      position: string;
    }>,
    playerStates: Array<{
      playerId: number;
      morale: number;
      fitness: number;
      form: number;
      isInjured: boolean;
      isSuspended: boolean;
    }>
  ): PlayerRatingsSummary | null {
    const playerById = new Map(squadPlayers.map((player) => [player.id, player]));
    const stateByPlayerId = new Map(playerStates.map((row) => [row.playerId, row]));
    const starterIds = interventionState.prep.startingPlayerIds.filter((playerId) => playerById.has(playerId)).slice(0, 11);
    const benchIds = interventionState.prep.benchPlayerIds.filter((playerId) => playerById.has(playerId) && !starterIds.includes(playerId)).slice(0, 7);
    const participantIds = [...starterIds, ...benchIds];
    if (participantIds.length === 0) {
      return null;
    }

    const starterSet = new Set(starterIds);
    const userIsHome = fixture.homeClubId === career.controlledClubId;
    const userTeamSide: 'home' | 'away' = userIsHome ? 'home' : 'away';
    const userGoals = userIsHome ? match.homeScore : match.awayScore;
    const opponentGoals = userIsHome ? match.awayScore : match.homeScore;
    const resultDelta = userGoals > opponentGoals ? 0.25 : userGoals < opponentGoals ? -0.25 : 0;
    const shotEvents = new Set(['GOAL', 'SAVE', 'MISS', 'WOODWORK', 'BLOCKED_SHOT', 'PENALTY_GOAL', 'PENALTY_MISS']);
    const onTargetEvents = new Set(['GOAL', 'SAVE', 'PENALTY_GOAL']);

    const minutesOn = new Map<number, number>();
    const minutesOff = new Map<number, number>();
    const statsByPlayerId = new Map<number, {
      goals: number;
      shots: number;
      shotsOnTarget: number;
      xg: number;
      yellowCards: number;
      redCard: boolean;
    }>();

    for (const playerId of participantIds) {
      statsByPlayerId.set(playerId, {
        goals: 0,
        shots: 0,
        shotsOnTarget: 0,
        xg: 0,
        yellowCards: 0,
        redCard: false
      });
    }

    for (const highlight of highlights) {
      const side = highlight.teamSide === 'home' || highlight.teamSide === 'away'
        ? highlight.teamSide
        : null;
      if (side !== userTeamSide) {
        continue;
      }

      const payload = this.parseHighlightPayload(highlight.payload);
      if (highlight.eventType === 'SUBSTITUTION') {
        const outPlayerId = Number(this.toFiniteNumber(payload.outPlayerId));
        const inPlayerId = Number(this.toFiniteNumber(payload.inPlayerId));
        if (Number.isFinite(outPlayerId) && !minutesOff.has(outPlayerId)) {
          minutesOff.set(outPlayerId, clamp(Math.round(highlight.minute), 1, 90));
        }
        if (Number.isFinite(inPlayerId) && !minutesOn.has(inPlayerId)) {
          minutesOn.set(inPlayerId, clamp(Math.round(highlight.minute), 1, 90));
        }
        continue;
      }

      const actorId = highlight.actorId ?? null;
      if (!actorId || !statsByPlayerId.has(actorId)) {
        continue;
      }

      const stats = statsByPlayerId.get(actorId)!;
      const shotXg = clamp(
        this.toFiniteNumber(payload.shotXg)
          ?? ((this.toFiniteNumber(payload.quality) ?? highlight.xThreatRank ?? 0) * 0.85),
        0,
        1.25
      );

      if (shotEvents.has(highlight.eventType)) {
        stats.shots += 1;
        stats.xg = Number((stats.xg + shotXg).toFixed(2));
        if (onTargetEvents.has(highlight.eventType)) {
          stats.shotsOnTarget += 1;
        }
      }
      if (highlight.eventType === 'GOAL' || highlight.eventType === 'PENALTY_GOAL') {
        stats.goals += 1;
      }
      if (highlight.eventType === 'YELLOW_CARD') {
        stats.yellowCards += 1;
      }
      if (highlight.eventType === 'RED_CARD') {
        stats.redCard = true;
      }
    }

    const rows = participantIds.map((playerId) => {
      const player = playerById.get(playerId);
      const state = stateByPlayerId.get(playerId);
      const stats = statsByPlayerId.get(playerId)!;
      const wasStarter = starterSet.has(playerId);
      const minuteOn = minutesOn.get(playerId);
      const minuteOff = minutesOff.get(playerId);
      const minutes = wasStarter
        ? clamp(minuteOff ?? 90, 1, 90)
        : minuteOn
          ? clamp(90 - minuteOn, 1, 89)
          : 0;
      const subbedOn = !wasStarter && minutes > 0;
      const subbedOff = wasStarter && typeof minuteOff === 'number';
      const role: PlayerRatingRow['role'] = wasStarter
        ? 'STARTER'
        : subbedOn
          ? 'SUBSTITUTE'
          : 'UNUSED_BENCH';

      let rating = wasStarter ? 6.7 : subbedOn ? 6.4 : 6.0;
      rating += resultDelta * clamp(minutes / 90, 0.2, 1);
      rating += stats.goals * 1.2;
      rating += stats.shotsOnTarget * 0.12;
      rating += Math.min(0.85, stats.xg * 0.45);
      if (stats.shots >= 3) {
        rating += 0.12;
      }
      if (subbedOn) {
        rating += 0.1;
      }
      rating -= stats.yellowCards * 0.22;
      if (stats.redCard) {
        rating -= 1.15;
      }
      if (state?.isInjured && minutes > 0) {
        rating -= 0.35;
      }
      if (subbedOff && userGoals < opponentGoals) {
        rating -= 0.1;
      }

      rating = Number(clamp(Number(rating.toFixed(1)), 5.4, 9.8).toFixed(1));

      const summaryParts: string[] = [];
      if (stats.goals > 0) {
        summaryParts.push(`${stats.goals} goal${stats.goals === 1 ? '' : 's'}`);
      }
      if (stats.xg >= 0.35) {
        summaryParts.push(`${stats.xg.toFixed(2)} xG involvement`);
      }
      if (stats.yellowCards > 0) {
        summaryParts.push(stats.redCard ? 'sent off' : `booked ${stats.yellowCards}x`);
      }
      if (subbedOn) {
        summaryParts.push(`introduced on ${minuteOn}'`);
      } else if (subbedOff) {
        summaryParts.push(`off on ${minuteOff}'`);
      }
      if (summaryParts.length === 0) {
        summaryParts.push(minutes > 0 ? 'steady shift without a decisive action' : 'unused from the bench');
      }

      return {
        playerId,
        playerName: player?.fullName ?? `Player ${playerId}`,
        position: player?.position ?? '-',
        role,
        minutes,
        rating,
        summary: summaryParts.join(' | '),
        goals: stats.goals,
        shots: stats.shots,
        shotsOnTarget: stats.shotsOnTarget,
        xg: Number(stats.xg.toFixed(2)),
        yellowCards: stats.yellowCards,
        redCard: stats.redCard,
        subbedOn,
        subbedOff
      } satisfies PlayerRatingRow;
    }).sort((left, right) => right.rating - left.rating || right.minutes - left.minutes || left.playerName.localeCompare(right.playerName));

    const activeRows = rows.filter((row) => row.minutes > 0);
    const averageRating = activeRows.length > 0
      ? Number((activeRows.reduce((sum, row) => sum + row.rating, 0) / activeRows.length).toFixed(2))
      : Number((rows.reduce((sum, row) => sum + row.rating, 0) / rows.length).toFixed(2));

    return {
      averageRating,
      topPerformer: rows[0]
        ? {
          playerId: rows[0].playerId,
          playerName: rows[0].playerName,
          rating: rows[0].rating,
          summary: rows[0].summary
        }
        : null,
      biggestConcern: rows[rows.length - 1]
        ? {
          playerId: rows[rows.length - 1].playerId,
          playerName: rows[rows.length - 1].playerName,
          rating: rows[rows.length - 1].rating,
          summary: rows[rows.length - 1].summary
        }
        : null,
      rows
    };
  }

  private buildTacticalFeedbackSummary(
    controlledClubId: number,
    fixture: V2Fixture,
    chanceQuality: ChanceQualitySummary,
    playerImpact: {
      averageMorale: number;
      averageFitness: number;
      averageForm: number;
      injuredCount: number;
      suspendedCount: number;
    } | null,
    interventionImpact: InterventionImpactTelemetry | null,
    interventionState: MatchInterventionState
  ): TacticalFeedbackSummary {
    const userIsHome = fixture.homeClubId === controlledClubId;
    const userSide = userIsHome ? chanceQuality.home : chanceQuality.away;
    const opponentSide = userIsHome ? chanceQuality.away : chanceQuality.home;

    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    const attackConcern = userSide.totalShotXg < 0.95 || userSide.shots < 6;
    const defenseConcern = opponentSide.totalShotXg > 1.35 || opponentSide.bigChances >= userSide.bigChances + 2;
    const physicalConcern = Boolean(playerImpact && (playerImpact.averageFitness < 74 || playerImpact.injuredCount > 0));
    const interventionSwing = interventionImpact?.aggregate.windowNetXThreatDelta ?? 0;

    if (chanceQuality.verdict === 'DESERVED_MORE' || chanceQuality.verdict === 'EDGED_IT') {
      strengths.push(`The shape generated the better looks (${userSide.totalShotXg.toFixed(2)} xG vs ${opponentSide.totalShotXg.toFixed(2)}).`);
    }
    if (!defenseConcern) {
      strengths.push(`The defensive structure limited the opponent to ${opponentSide.bigChances} big chance${opponentSide.bigChances === 1 ? '' : 's'}.`);
    }
    if (interventionSwing > 0.18) {
      strengths.push('Second-half changes improved territorial pressure and lifted the threat level.');
    }

    if (attackConcern) {
      concerns.push('Chance creation was too light and the attack did not produce enough repeat pressure.');
    }
    if (defenseConcern) {
      concerns.push('The opponent still reached dangerous central areas too often.');
    }
    if (physicalConcern) {
      concerns.push('The squad paid a physical price, which raises the risk of a flat next week.');
    }

    let recommendedWeekPlan: RecommendedWeekPlan = {
      trainingFocus: 'BALANCED',
      rotationIntensity: 'MEDIUM',
      tacticalMentality: 'BALANCED'
    };

    if (attackConcern && defenseConcern) {
      recommendedWeekPlan = {
        trainingFocus: 'TACTICAL',
        rotationIntensity: physicalConcern ? 'HIGH' : 'MEDIUM',
        tacticalMentality: 'BALANCED'
      };
    } else if (defenseConcern) {
      recommendedWeekPlan = {
        trainingFocus: 'DEFENSIVE',
        rotationIntensity: physicalConcern ? 'HIGH' : 'MEDIUM',
        tacticalMentality: 'CAUTIOUS'
      };
    } else if (attackConcern) {
      recommendedWeekPlan = {
        trainingFocus: 'ATTACKING',
        rotationIntensity: physicalConcern ? 'HIGH' : 'MEDIUM',
        tacticalMentality: opponentSide.totalShotXg <= 1.1 ? 'AGGRESSIVE' : 'BALANCED'
      };
    } else if (physicalConcern) {
      recommendedWeekPlan = {
        trainingFocus: 'FITNESS',
        rotationIntensity: 'HIGH',
        tacticalMentality: 'BALANCED'
      };
    } else if (interventionSwing > 0.18) {
      recommendedWeekPlan = {
        trainingFocus: 'TACTICAL',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'BALANCED'
      };
    }

    recommendations.push(`Week Planner: set Training Focus to ${this.toTitleCase(recommendedWeekPlan.trainingFocus)}.`);
    recommendations.push(`Week Planner: set Rotation Intensity to ${this.toTitleCase(recommendedWeekPlan.rotationIntensity)}.`);
    recommendations.push(`Week Planner: keep Tactical Mentality ${this.toTitleCase(recommendedWeekPlan.tacticalMentality)} next week.`);

    let interventionVerdict = 'Interventions were broadly neutral in the flow of the match.';
    if (interventionImpact?.totalInterventions) {
      if (interventionSwing > 0.18) {
        interventionVerdict = 'Live changes improved momentum after the break.';
      } else if (interventionSwing < -0.12) {
        interventionVerdict = 'Live changes did not improve control and left the match state flat.';
      }
    }

    const summaryParts: string[] = [];
    summaryParts.push(chanceQuality.summary);
    if (physicalConcern) {
      summaryParts.push('Recovery management needs attention before the next fixture.');
    } else if (interventionSwing > 0.18) {
      summaryParts.push('The in-game adjustments were a positive signal for the next plan.');
    }

    return {
      summary: summaryParts.join(' '),
      strengths: strengths.slice(0, 3),
      concerns: concerns.slice(0, 3),
      recommendations,
      recommendedWeekPlan,
      interventionRead: {
        usedHalftimeTalk: interventionState.live.halftimeTalkUsed,
        usedSubstitution: interventionState.live.substitutionsUsed > 0,
        usedTacticalShifts: interventionState.live.tacticalChangesUsed > 0,
        verdict: interventionVerdict
      }
    };
  }

  private buildPlannerMatchInsight(
    career: V2Career,
    fixture: V2Fixture,
    match: V2Match,
    tacticalFeedback: TacticalFeedbackSummary,
    fixturePresentation?: {
      opponentClubName?: string | null;
      matchDate?: string | Date | null;
    } | null
  ): PlannerMatchInsight {
    const userIsHome = fixture.homeClubId === career.controlledClubId;
    const userGoals = userIsHome ? match.homeScore : match.awayScore;
    const opponentGoals = userIsHome ? match.awayScore : match.homeScore;
    const opponentClubName = fixturePresentation?.opponentClubName ?? null;

    return {
      fixtureId: fixture.id,
      matchDate: fixturePresentation?.matchDate
        ? new Date(fixturePresentation.matchDate).toISOString()
        : fixture.matchDate.toISOString(),
      opponentClubName,
      scoreline: `${userGoals}-${opponentGoals}${opponentClubName ? ` vs ${opponentClubName}` : ''}`,
      summary: tacticalFeedback.summary,
      strengths: tacticalFeedback.strengths.slice(0, 2),
      concerns: tacticalFeedback.concerns.slice(0, 2),
      recommendedWeekPlan: tacticalFeedback.recommendedWeekPlan
    };
  }

  private toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private async resolveMatchPrepForCareer(career: V2Career, payload?: MatchPrepPayload): Promise<ResolvedMatchPrep> {
    const base = resolveMatchPrepPayload(payload);

    await this.ensureControlledClubSquadIfMissing(career.id, career.controlledClubId, 18);
    await this.ensureControlledClubSquadBalance(career.id, career.controlledClubId);
    await this.ensureControlledClubRegistrationViability(career, career.controlledClubId);
    await this.ensureV2PlayerStatesForClub(career.id, career.controlledClubId);

    const squad = await this.prisma.player.findMany({
      where: { currentClubId: career.controlledClubId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        position: true,
        dateOfBirth: true,
        age: true,
        currentAbility: true,
        potentialAbility: true
      },
      orderBy: [{ currentAbility: 'desc' }, { id: 'asc' }]
    });

    if (squad.length < 11) {
      throw new Error('Controlled club does not have enough players for match preparation.');
    }

    const squadIds = squad.map((player) => player.id);
    const stateRows = await this.prisma.v2PlayerState.findMany({
      where: {
        careerId: career.id,
        playerId: { in: squadIds }
      },
      select: {
        playerId: true,
        fitness: true,
        isInjured: true,
        isSuspended: true
      }
    });
    const [activeStatusDirectives, activeRetrainingPlans, registrationSnapshot, activeSuspensions] = await Promise.all([
      this.getActivePlayerStatusDirectiveMap(career.id, career.weekNumber, this.prisma),
      this.getActivePlayerRetrainingPlanMap(career.id, this.prisma),
      this.getSquadRegistrationSnapshot(career, squad, this.prisma),
      this.getActivePlayerSuspensionMap(career.id, this.prisma)
    ]);

    const stateByPlayerId = new Map(stateRows.map((row) => [row.playerId, row]));
    const unavailableByPlayerId = new Map<number, 'INJURED' | 'SUSPENDED' | 'UNREGISTERED' | 'OVERAGE_LIMIT'>();
    for (const row of stateRows) {
      if (row.isInjured) {
        unavailableByPlayerId.set(row.playerId, 'INJURED');
      } else if (activeSuspensions.has(row.playerId) || row.isSuspended) {
        unavailableByPlayerId.set(row.playerId, 'SUSPENDED');
      }
    }
    for (const player of squad) {
      if (unavailableByPlayerId.has(player.id)) {
        continue;
      }
      const registrationState = registrationSnapshot.byPlayerId.get(player.id);
      if (!registrationState?.isRegistered) {
        const age = this.resolvePlayerAge(player.dateOfBirth, career.currentDate, player.age, player.id);
        unavailableByPlayerId.set(
          player.id,
          registrationSnapshot.rules.competitionCategory === 'O21' && age > 21 ? 'OVERAGE_LIMIT' : 'UNREGISTERED'
        );
      }
    }

    const squadMetrics: MatchPrepCandidate[] = squad.map((player) => {
      const state = stateByPlayerId.get(player.id);
      const activeDirective = activeStatusDirectives.get(player.id);
      const retrainingPlan = activeRetrainingPlans.get(player.id);
      const effectivePosition = retrainingPlan && retrainingPlan.progressPct >= RETRAINING_MATCH_PREP_READY_PROGRESS
        ? retrainingPlan.targetPosition
        : player.position;
      return {
        id: player.id,
        position: effectivePosition,
        ability: player.currentAbility ?? 60,
        fitness: state?.fitness ?? 90,
        group: resolveMatchPrepPositionGroup(effectivePosition),
        managerDirectiveCode: activeDirective?.directiveCode ?? null
      };
    });

    const availableMetrics = squadMetrics.filter((player) => !unavailableByPlayerId.has(player.id));
    if (availableMetrics.length < 14) {
      throw new Error('Not enough eligible players for match prep. At least 14 registered, non-injured, non-suspended players are required.');
    }

    const metricByPlayerId = new Map(squadMetrics.map((player) => [player.id, player]));
    const validPlayerIds = new Set(squadIds);
    const availablePlayerIds = new Set(availableMetrics.map((player) => player.id));
    const defaultSelection = buildAutoMatchSelection(availableMetrics, base.formation, base.lineupPolicy, base.benchPriority);

    const unavailableStarterSelections = base.startingPlayerIds.filter(
      (playerId) => validPlayerIds.has(playerId) && !availablePlayerIds.has(playerId)
    );
    if (unavailableStarterSelections.length > 0) {
      throw new Error('Starting XI includes ineligible players (injured, suspended, or not registered).');
    }

    const startingPlayerIds = (
      base.startingPlayerIds.length > 0 ? base.startingPlayerIds : defaultSelection.startingPlayerIds
    )
      .filter((playerId) => validPlayerIds.has(playerId) && availablePlayerIds.has(playerId));
    if (startingPlayerIds.length !== 11) {
      throw new Error('Match prep requires exactly 11 valid and available starting players.');
    }
    const starterGroupCounts = countMatchPrepGroups(startingPlayerIds, metricByPlayerId);
    const formationTargets = MATCH_PREP_FORMATION_CONFIGS[base.formation].starterTargets;
    const formationMatches = (['GK', 'DEF', 'MID', 'ATT'] as const).every(
      (group) => starterGroupCounts[group] === formationTargets[group]
    );
    if (!formationMatches) {
      throw new Error(
        `Starting XI does not satisfy formation ${base.formation}. Required DEF ${formationTargets.DEF} / MID ${formationTargets.MID} / ATT ${formationTargets.ATT}, got DEF ${starterGroupCounts.DEF} / MID ${starterGroupCounts.MID} / ATT ${starterGroupCounts.ATT}.`
      );
    }
    const restRecoveryStarterSelections = startingPlayerIds.filter(
      (playerId) => activeStatusDirectives.get(playerId)?.directiveCode === 'REST_RECOVERY'
    );
    if (restRecoveryStarterSelections.length > 0) {
      throw new Error('Starting XI includes players marked Rest & Recovery. Move them to the bench or clear the directive.');
    }

    const startingSet = new Set(startingPlayerIds);
    const unavailableBenchSelections = base.benchPlayerIds.filter(
      (playerId) => validPlayerIds.has(playerId) && !availablePlayerIds.has(playerId)
    );
    if (unavailableBenchSelections.length > 0) {
      throw new Error('Bench selection includes ineligible players (injured, suspended, or not registered).');
    }

    const benchPlayerIds = (
      base.benchPlayerIds.length > 0 ? base.benchPlayerIds : defaultSelection.benchPlayerIds
    )
      .filter((playerId) => validPlayerIds.has(playerId) && availablePlayerIds.has(playerId) && !startingSet.has(playerId))
      .slice(0, 12);
    if (benchPlayerIds.length < 3) {
      throw new Error('Match prep requires at least 3 valid and available bench players.');
    }

    if (base.captainPlayerId !== null && !startingSet.has(base.captainPlayerId)) {
      throw new Error('Captain must be one of the selected starting players.');
    }
    const captainPlayerId = base.captainPlayerId ?? startingPlayerIds[0] ?? null;

    const startersAverageAbility = this.computeAverageMetric(startingPlayerIds, metricByPlayerId, 'ability');
    const startersAverageFitness = this.computeAverageMetric(startingPlayerIds, metricByPlayerId, 'fitness');
    const benchAverageAbility = this.computeAverageMetric(benchPlayerIds, metricByPlayerId, 'ability');
    const selectionWarnings = buildMatchPrepSelectionWarnings(startingPlayerIds, benchPlayerIds, activeStatusDirectives);

    return {
      ...base,
      startingPlayerIds,
      benchPlayerIds,
      captainPlayerId,
      startersAverageAbility,
      startersAverageFitness,
      benchAverageAbility,
      selectionWarnings
    };
  }

  private computeAverageMetric(
    ids: number[],
    metricByPlayerId: Map<number, { ability: number; fitness: number }>,
    key: 'ability' | 'fitness'
  ): number {
    if (ids.length === 0) {
      return 0;
    }

    let total = 0;
    for (const playerId of ids) {
      const metric = metricByPlayerId.get(playerId);
      total += metric ? metric[key] : 0;
    }
    return total / ids.length;
  }

  private pickRandomPlayerId(ids: number[], random: () => number): number | undefined {
    if (ids.length === 0) {
      return undefined;
    }
    const index = Math.floor(random() * ids.length);
    return ids[Math.max(0, Math.min(ids.length - 1, index))];
  }

  private resolveHighlightActorId(
    prep: ResolvedMatchPrep,
    teamSide: 'home' | 'away',
    userTeamSide: 'home' | 'away',
    random: () => number,
    eventType: string
  ): number | undefined {
    if (teamSide !== userTeamSide) {
      return undefined;
    }

    if (eventType === 'PENALTY_GOAL' || eventType === 'PENALTY_MISS') {
      return prep.captainPlayerId ?? this.pickRandomPlayerId(prep.startingPlayerIds, random);
    }

    if (eventType === 'SUBSTITUTION') {
      return this.pickRandomPlayerId(prep.benchPlayerIds, random) ?? this.pickRandomPlayerId(prep.startingPlayerIds, random);
    }

    return this.pickRandomPlayerId(prep.startingPlayerIds, random)
      ?? prep.captainPlayerId
      ?? this.pickRandomPlayerId(prep.benchPlayerIds, random);
  }

  private createInitialLiveMatchState(prep: ResolvedMatchPrep): LiveMatchState {
    return {
      currentMinute: 45,
      segment: 'HALFTIME',
      currentStartingPlayerIds: [...prep.startingPlayerIds].slice(0, 11),
      currentBenchPlayerIds: [...prep.benchPlayerIds].slice(0, 7),
      substitutionsUsed: 0,
      substitutionLimit: 3,
      tacticalChangesUsed: 0,
      tacticalChangeLimit: 3,
      halftimeTalkUsed: false,
      halftimeTalkChoice: null,
      mentality: 'BALANCED',
      pressing: prep.preMatchInstruction === V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS
        ? 'HIGH_PRESS'
        : prep.preMatchInstruction === V2_PRE_MATCH_INSTRUCTIONS.LOW_BLOCK
          ? 'DROP_OFF'
          : 'STANDARD',
      possessionSwing: 0
    };
  }

  private normalizeLiveMatchState(raw: unknown, prep: ResolvedMatchPrep): LiveMatchState {
    const defaults = this.createInitialLiveMatchState(prep);
    if (!raw || typeof raw !== 'object') {
      return defaults;
    }

    const record = raw as Record<string, unknown>;
    const segment = String(record.segment || defaults.segment).toUpperCase();
    const normalizedSegment: LiveMatchSegment =
      segment === 'FIRST_HALF' || segment === 'HALFTIME' || segment === 'SECOND_HALF' || segment === 'FULL_TIME'
        ? segment
        : defaults.segment;

    const normalizeIds = (value: unknown, fallback: number[]) => {
      if (!Array.isArray(value)) {
        return [...fallback];
      }
      return value
        .map((entry) => Number(entry))
        .filter((entry) => Number.isFinite(entry));
    };

    const mentality = String(record.mentality || defaults.mentality).toUpperCase();
    const pressing = String(record.pressing || defaults.pressing).toUpperCase();
    const halftimeTalkChoice = String(record.halftimeTalkChoice || '').toUpperCase();

    return {
      currentMinute: clamp(Math.round(this.toFiniteNumber(record.currentMinute) ?? defaults.currentMinute), 1, 90),
      segment: normalizedSegment,
      currentStartingPlayerIds: normalizeIds(record.currentStartingPlayerIds, defaults.currentStartingPlayerIds).slice(0, 11),
      currentBenchPlayerIds: normalizeIds(record.currentBenchPlayerIds, defaults.currentBenchPlayerIds).slice(0, 7),
      substitutionsUsed: clamp(Math.round(this.toFiniteNumber(record.substitutionsUsed) ?? defaults.substitutionsUsed), 0, 5),
      substitutionLimit: clamp(Math.round(this.toFiniteNumber(record.substitutionLimit) ?? defaults.substitutionLimit), 1, 5),
      tacticalChangesUsed: clamp(Math.round(this.toFiniteNumber(record.tacticalChangesUsed) ?? defaults.tacticalChangesUsed), 0, 5),
      tacticalChangeLimit: clamp(Math.round(this.toFiniteNumber(record.tacticalChangeLimit) ?? defaults.tacticalChangeLimit), 1, 5),
      halftimeTalkUsed: Boolean(record.halftimeTalkUsed),
      halftimeTalkChoice:
        halftimeTalkChoice === 'PRAISE' || halftimeTalkChoice === 'DEMAND_MORE' || halftimeTalkChoice === 'CALM_FOCUS'
          ? halftimeTalkChoice as HalftimeTalkChoice
          : null,
      mentality:
        mentality === 'POSITIVE' || mentality === 'ALL_OUT_ATTACK' || mentality === 'PROTECT_LEAD'
          ? mentality as LiveMentality
          : 'BALANCED',
      pressing:
        pressing === 'HIGH_PRESS' || pressing === 'MID_BLOCK' || pressing === 'DROP_OFF'
          ? pressing as LivePressing
          : 'STANDARD',
      possessionSwing: clamp(this.toFiniteNumber(record.possessionSwing) ?? defaults.possessionSwing, -12, 12)
    };
  }

  private parseInterventionState(raw: string | null): MatchInterventionState {
    const defaults = createDefaultMatchPrep();
    const defaultLive = this.createInitialLiveMatchState(defaults);
    if (!raw) {
      return { prep: defaults, live: defaultLive, entries: [] };
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return {
          prep: defaults,
          live: defaultLive,
          entries: parsed.filter((row) => row && typeof row === 'object') as Array<Record<string, unknown>>
        };
      }

      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>;
        const entries = Array.isArray(record.entries)
          ? record.entries.filter((row) => row && typeof row === 'object') as Array<Record<string, unknown>>
          : [];

        let prep = defaults;
        if (record.prep && typeof record.prep === 'object') {
          prep = resolveMatchPrepPayload(record.prep as MatchPrepPayload);
          const prepRecord = record.prep as Record<string, unknown>;
          prep.selectionWarnings = parseMatchPrepSelectionWarnings(prepRecord.selectionWarnings);
        }

        const live = this.normalizeLiveMatchState(record.live, prep);
        return { prep, live, entries };
      }
    } catch {
      // Fall through to default empty state on malformed legacy payload.
    }

    return { prep: defaults, live: defaultLive, entries: [] };
  }

  private serializeInterventionState(state: MatchInterventionState): string {
    return JSON.stringify({
      prep: state.prep,
      live: state.live,
      entries: state.entries
    });
  }

  private toFiniteNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private parseHighlightPayload(raw: unknown): Record<string, unknown> {
    if (!raw) {
      return {};
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown;
        return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
      } catch {
        return {};
      }
    }
    return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  }

  private normalizeInterventionEntries(entries: Array<Record<string, unknown>>): NormalizedInterventionEntry[] {
    return entries
      .map((entry, index) => {
        const minuteRaw = this.toFiniteNumber(entry.minute);
        const minute = clamp(Math.round(minuteRaw ?? (60 + index * 5)), 1, 120);

        const type = this.toNullableString(entry.type) ?? 'UNKNOWN';
        const intensity = this.toFiniteNumber(entry.intensity);
        const note = this.toNullableString(entry.note);
        const createdAt = this.toNullableString(entry.createdAt);
        const eventType = this.toNullableString(entry.eventType);

        let directEffect: NormalizedInterventionEntry['directEffect'] = null;
        const rawDirect = entry.directEffect;
        if (rawDirect && typeof rawDirect === 'object') {
          const record = rawDirect as Record<string, unknown>;
          const scoreForBefore = this.toFiniteNumber(record.scoreForBefore);
          const scoreAgainstBefore = this.toFiniteNumber(record.scoreAgainstBefore);
          const scoreForAfter = this.toFiniteNumber(record.scoreForAfter);
          const scoreAgainstAfter = this.toFiniteNumber(record.scoreAgainstAfter);
          const xgForBefore = this.toFiniteNumber(record.xgForBefore);
          const xgAgainstBefore = this.toFiniteNumber(record.xgAgainstBefore);
          const xgForAfter = this.toFiniteNumber(record.xgForAfter);
          const xgAgainstAfter = this.toFiniteNumber(record.xgAgainstAfter);

          const netGoalDelta = this.toFiniteNumber(record.netGoalDelta)
            ?? ((scoreForAfter ?? scoreForBefore ?? 0) - (scoreForBefore ?? scoreForAfter ?? 0));
          const netXgDelta = this.toFiniteNumber(record.netXgDelta)
            ?? Number((((xgForAfter ?? xgForBefore ?? 0) - (xgForBefore ?? xgForAfter ?? 0))).toFixed(2));

          directEffect = {
            scoreForBefore,
            scoreAgainstBefore,
            scoreForAfter,
            scoreAgainstAfter,
            xgForBefore,
            xgAgainstBefore,
            xgForAfter,
            xgAgainstAfter,
            netGoalDelta,
            netXgDelta: Number(netXgDelta.toFixed(2))
          };
        }

        return {
          type,
          minute,
          intensity,
          note,
          createdAt,
          eventType,
          directEffect
        };
      })
      .sort((left, right) => left.minute - right.minute || left.type.localeCompare(right.type));
  }

  private buildInterventionImpactTelemetry(
    interventions: NormalizedInterventionEntry[],
    highlights: Array<{
      minute: number;
      eventType: string;
      teamSide: string | null;
      xThreatRank: number;
      payload: unknown;
    }>,
    userTeamSide: 'home' | 'away'
  ): InterventionImpactTelemetry | null {
    if (interventions.length === 0) {
      return null;
    }

    const goalEvents = new Set(['GOAL', 'PENALTY_GOAL']);
    const normalizedHighlights = highlights.map((row) => {
      const payload = this.parseHighlightPayload(row.payload);
      const taggedIntervention = typeof payload.interventionType === 'string';
      const teamSide = row.teamSide === 'home' || row.teamSide === 'away' ? row.teamSide : null;
      return {
        minute: Math.max(1, Math.round(this.toFiniteNumber(row.minute) ?? 1)),
        eventType: String(row.eventType || ''),
        teamSide,
        xThreatRank: this.toFiniteNumber(row.xThreatRank) ?? 0,
        taggedIntervention
      };
    });

    const nonInterventionHighlights = normalizedHighlights.filter((row) => !row.taggedIntervention);

    const windows: InterventionImpactWindow[] = interventions.map((entry, index) => {
      const nextMinute = index < interventions.length - 1 ? interventions[index + 1].minute : null;
      const windowEndMinute = nextMinute ? Math.max(entry.minute, nextMinute - 1) : 90;
      const windowRows = nonInterventionHighlights.filter((row) => row.minute >= entry.minute && row.minute <= windowEndMinute);

      let windowGoalsFor = 0;
      let windowGoalsAgainst = 0;
      let windowXThreatFor = 0;
      let windowXThreatAgainst = 0;

      for (const row of windowRows) {
        const isUserEvent = row.teamSide === userTeamSide;
        if (isUserEvent) {
          windowXThreatFor += row.xThreatRank;
        } else if (row.teamSide !== null) {
          windowXThreatAgainst += row.xThreatRank;
        }

        if (goalEvents.has(row.eventType)) {
          if (isUserEvent) {
            windowGoalsFor += 1;
          } else if (row.teamSide !== null) {
            windowGoalsAgainst += 1;
          }
        }
      }

      const directNetGoalDelta = entry.directEffect?.netGoalDelta ?? 0;
      const directNetXgDelta = Number((entry.directEffect?.netXgDelta ?? 0).toFixed(2));
      const windowNetGoalDelta = windowGoalsFor - windowGoalsAgainst;
      const windowNetXThreatDelta = Number((windowXThreatFor - windowXThreatAgainst).toFixed(3));

      return {
        index: index + 1,
        type: entry.type,
        minute: entry.minute,
        nextMinute,
        windowEndMinute,
        intensity: entry.intensity,
        note: entry.note,
        directEventType: entry.eventType,
        directNetGoalDelta,
        directNetXgDelta,
        windowGoalsFor,
        windowGoalsAgainst,
        windowXThreatFor: Number(windowXThreatFor.toFixed(3)),
        windowXThreatAgainst: Number(windowXThreatAgainst.toFixed(3)),
        windowNetGoalDelta,
        windowNetXThreatDelta
      };
    });

    const aggregate = windows.reduce(
      (acc, row) => ({
        directNetGoalDelta: acc.directNetGoalDelta + row.directNetGoalDelta,
        directNetXgDelta: acc.directNetXgDelta + row.directNetXgDelta,
        windowNetGoalDelta: acc.windowNetGoalDelta + row.windowNetGoalDelta,
        windowNetXThreatDelta: acc.windowNetXThreatDelta + row.windowNetXThreatDelta,
        directGoalsFromInterventions: acc.directGoalsFromInterventions + (
          row.directEventType && goalEvents.has(row.directEventType) && row.directNetGoalDelta > 0 ? 1 : 0
        )
      }),
      {
        directNetGoalDelta: 0,
        directNetXgDelta: 0,
        windowNetGoalDelta: 0,
        windowNetXThreatDelta: 0,
        directGoalsFromInterventions: 0
      }
    );

    return {
      totalInterventions: interventions.length,
      aggregate: {
        directNetGoalDelta: aggregate.directNetGoalDelta,
        directNetXgDelta: Number(aggregate.directNetXgDelta.toFixed(2)),
        windowNetGoalDelta: aggregate.windowNetGoalDelta,
        windowNetXThreatDelta: Number(aggregate.windowNetXThreatDelta.toFixed(3)),
        directGoalsFromInterventions: aggregate.directGoalsFromInterventions
      },
      windows
    };
  }

  private resolveLiveMatchSegment(minute: number, halftimeTalkUsed: boolean): LiveMatchSegment {
    if (minute >= 90) {
      return 'FULL_TIME';
    }
    if (minute <= 44) {
      return 'FIRST_HALF';
    }
    if (!halftimeTalkUsed && minute <= 45) {
      return 'HALFTIME';
    }
    return 'SECOND_HALF';
  }

  private advanceLiveMatchState(
    live: LiveMatchState,
    updates: Partial<LiveMatchState>,
    actionType: V2InterventionType
  ): LiveMatchState {
    const next: LiveMatchState = {
      ...live,
      ...updates,
      currentStartingPlayerIds: updates.currentStartingPlayerIds ?? [...live.currentStartingPlayerIds],
      currentBenchPlayerIds: updates.currentBenchPlayerIds ?? [...live.currentBenchPlayerIds]
    };

    if (actionType === V2_INTERVENTION_TYPES.HALFTIME_TEAM_TALK) {
      next.currentMinute = Math.max(next.currentMinute, 58);
      next.halftimeTalkUsed = true;
    } else if (live.segment === 'HALFTIME' && !live.halftimeTalkUsed) {
      next.currentMinute = Math.max(next.currentMinute, 63);
    } else if (live.currentMinute < 70) {
      next.currentMinute = Math.max(next.currentMinute, 72);
    } else if (live.currentMinute < 82) {
      next.currentMinute = Math.max(next.currentMinute, 84);
    } else {
      next.currentMinute = 90;
    }

    next.segment = this.resolveLiveMatchSegment(next.currentMinute, next.halftimeTalkUsed);
    return next;
  }

  private getVisibleLiveHighlights<
    T extends { minute: number; eventType: string; payload?: unknown }
  >(highlights: T[], live: LiveMatchState): T[] {
    return highlights.filter((highlight) => {
      const minute = Math.max(1, Math.round(this.toFiniteNumber(highlight.minute) ?? 1));
      if (minute <= live.currentMinute) {
        return true;
      }
      return highlight.eventType === 'HALFTIME' && live.currentMinute >= 45;
    });
  }

  private buildVisibleLiveMetrics(
    highlights: Array<{ eventType: string; teamSide?: string | null; payload?: unknown }>,
    baseHomePossession: number,
    live: LiveMatchState
  ) {
    let homeScore = 0;
    let awayScore = 0;
    let homeXg = 0;
    let awayXg = 0;

    for (const highlight of highlights) {
      const teamSide = highlight.teamSide === 'home' || highlight.teamSide === 'away' ? highlight.teamSide : null;
      const payload = this.parseHighlightPayload(highlight.payload);
      const shotXg = this.toFiniteNumber(payload.shotXg);
      const teamXgDelta = this.toFiniteNumber(payload.teamXgDelta);
      const opponentXgDelta = this.toFiniteNumber(payload.opponentXgDelta);

      if (teamSide) {
        if (highlight.eventType === 'GOAL' || highlight.eventType === 'PENALTY_GOAL') {
          if (teamSide === 'home') homeScore += 1;
          else awayScore += 1;
        }

        if (shotXg !== null) {
          if (teamSide === 'home') homeXg += shotXg;
          else awayXg += shotXg;
        } else if (highlight.eventType === 'PENALTY_GOAL' || highlight.eventType === 'PENALTY_MISS') {
          if (teamSide === 'home') homeXg += 0.74;
          else awayXg += 0.74;
        }

        if (teamXgDelta !== null) {
          if (teamSide === 'home') homeXg += teamXgDelta;
          else awayXg += teamXgDelta;
        }
        if (opponentXgDelta !== null) {
          if (teamSide === 'home') awayXg += opponentXgDelta;
          else homeXg += opponentXgDelta;
        }
      }
    }

    const homePossession = clamp(Math.round(baseHomePossession + live.possessionSwing), 30, 70);
    return {
      homeScore,
      awayScore,
      homeXg: Number(homeXg.toFixed(2)),
      awayXg: Number(awayXg.toFixed(2)),
      homePossession,
      awayPossession: 100 - homePossession
    };
  }

  private computePrepModifiers(prep: ResolvedMatchPrep): {
    strengthDelta: number;
    attackBias: number;
    chanceQualityBoost: number;
    possessionBias: number;
    keyMomentDelta: number;
    setPieceBonus: number;
  } {
    let strengthDelta = 0;
    let attackBias = 0;
    let chanceQualityBoost = 0;
    let possessionBias = 0;
    let keyMomentDelta = 0;
    let setPieceBonus = 0;

    switch (prep.lineupPolicy) {
      case V2_LINEUP_POLICIES.BEST_XI:
        strengthDelta += 6;
        chanceQualityBoost += 0.015;
        break;
      case V2_LINEUP_POLICIES.ROTATE:
        strengthDelta -= 4;
        break;
      case V2_LINEUP_POLICIES.YOUTH_BET:
        strengthDelta -= 6;
        attackBias += 0.01;
        keyMomentDelta += 1;
        break;
      default:
        break;
    }

    switch (prep.formation) {
      case V2_FORMATIONS.FOUR_TWO_THREE_ONE:
        possessionBias += 2;
        chanceQualityBoost += 0.01;
        break;
      case V2_FORMATIONS.FOUR_FOUR_TWO:
        attackBias += 0.01;
        setPieceBonus += 0.01;
        break;
      case V2_FORMATIONS.THREE_FIVE_TWO:
        possessionBias += 3;
        attackBias += 0.012;
        keyMomentDelta += 1;
        break;
      case V2_FORMATIONS.FIVE_THREE_TWO:
        strengthDelta += 2;
        attackBias -= 0.01;
        possessionBias -= 1;
        break;
      case V2_FORMATIONS.FOUR_THREE_THREE:
      default:
        attackBias += 0.008;
        chanceQualityBoost += 0.008;
        break;
    }

    switch (prep.benchPriority) {
      case V2_BENCH_PRIORITIES.IMPACT:
        attackBias += 0.02;
        chanceQualityBoost += 0.02;
        break;
      case V2_BENCH_PRIORITIES.DEFENSIVE:
        attackBias -= 0.01;
        possessionBias += 1;
        break;
      case V2_BENCH_PRIORITIES.YOUTH:
        strengthDelta -= 1;
        attackBias += 0.01;
        chanceQualityBoost += 0.01;
        keyMomentDelta += 1;
        break;
      default:
        break;
    }

    switch (prep.preMatchInstruction) {
      case V2_PRE_MATCH_INSTRUCTIONS.FOCUS_POSSESSION:
        possessionBias += 4;
        attackBias -= 0.015;
        break;
      case V2_PRE_MATCH_INSTRUCTIONS.COUNTER_ATTACK:
        possessionBias -= 3;
        attackBias += 0.025;
        chanceQualityBoost += 0.025;
        break;
      case V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS:
        possessionBias += 1;
        attackBias += 0.02;
        chanceQualityBoost += 0.02;
        keyMomentDelta += 2;
        break;
      case V2_PRE_MATCH_INSTRUCTIONS.LOW_BLOCK:
        possessionBias -= 4;
        attackBias -= 0.02;
        chanceQualityBoost -= 0.01;
        keyMomentDelta -= 1;
        break;
      case V2_PRE_MATCH_INSTRUCTIONS.SET_PIECES:
        setPieceBonus += 0.04;
        chanceQualityBoost += 0.01;
        break;
      default:
        break;
    }

    if (prep.startingPlayerIds.length > 0) {
      const abilityDelta = clamp(Math.round((prep.startersAverageAbility - 66) / 3), -5, 6);
      const fitnessBoost = clamp((prep.startersAverageFitness - 84) / 900, -0.02, 0.03);
      strengthDelta += abilityDelta;
      chanceQualityBoost += fitnessBoost;

      if (prep.benchPlayerIds.length < 5) {
        strengthDelta -= 1;
      } else {
        chanceQualityBoost += clamp((prep.benchAverageAbility - 62) / 800, -0.01, 0.02);
      }
    }

    return {
      strengthDelta,
      attackBias,
      chanceQualityBoost,
      possessionBias,
      keyMomentDelta,
      setPieceBonus
    };
  }

  private resolveTransferScoutingTag(
    scoutingPriority: string
  ): 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH' {
    const normalized = scoutingPriority.toUpperCase();
    if (normalized === 'LOCAL') return 'LOCAL';
    if (normalized === 'INTERNATIONAL') return 'INTERNATIONAL';
    if (normalized === 'YOUTH') return 'YOUTH';
    return 'NATIONAL';
  }

  private buildTransferScoutingWhere(
    career: V2Career,
    controlledTier: number,
    scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH',
    positionFilter: string | null
  ): Prisma.PlayerWhereInput {
    const where: Prisma.PlayerWhereInput = {
      currentClubId: { not: null },
      NOT: {
        currentClubId: career.controlledClubId
      },
      isInjured: false
    };

    if (positionFilter) {
      where.position = positionFilter;
    }

    if (scoutingTag === 'LOCAL') {
      if (career.activeLeagueId) {
        where.currentClub = {
          is: {
            leagueId: career.activeLeagueId
          }
        };
      }
      return where;
    }

    if (scoutingTag === 'NATIONAL') {
      where.currentClub = {
        is: {
          league: {
            tier: {
              gte: Math.max(1, controlledTier - 2),
              lte: Math.min(14, controlledTier + 2)
            }
          }
        }
      };
      return where;
    }

    if (scoutingTag === 'YOUTH') {
      const youthCutoff = new Date(career.currentDate);
      youthCutoff.setFullYear(youthCutoff.getFullYear() - 22);
      where.dateOfBirth = { gte: youthCutoff };
      where.currentClub = {
        is: {
          league: {
            tier: {
              lte: Math.min(14, controlledTier + 3)
            }
          }
        }
      };
      return where;
    }

    return where;
  }

  private async fetchTransferMarketCandidates(
    career: V2Career,
    controlledTier: number,
    scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH',
    positionFilter: string | null,
    db: DbClient = this.prisma
  ): Promise<TransferCandidateRow[]> {
    return db.player.findMany({
      where: this.buildTransferScoutingWhere(career, controlledTier, scoutingTag, positionFilter),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        dateOfBirth: true,
        age: true,
        position: true,
        currentAbility: true,
        potentialAbility: true,
        weeklyWage: true,
        value: true,
        contractEnd: true,
        currentClubId: true,
        currentClub: {
          select: {
            id: true,
            name: true,
            leagueId: true,
            league: {
              select: {
                tier: true
              }
            }
          }
        }
      },
      orderBy: [
        { currentAbility: 'desc' },
        { potentialAbility: 'desc' },
        { id: 'asc' }
      ],
      take: 420
    });
  }

  private buildTransferMarketShortlist(
    candidates: TransferCandidateRow[],
    career: V2Career,
    controlledTier: number,
    availableBudget: number,
    positionDemand: Map<string, { count: number; avgAbility: number }>,
    scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH',
    affordableOnly: boolean
  ): TransferMarketTarget[] {
    const shortlist: TransferMarketTarget[] = [];

    for (const candidate of candidates) {
      if (!candidate.currentClubId || candidate.currentClubId === career.controlledClubId) {
        continue;
      }
      if (!candidate.currentClub) {
        continue;
      }

      const askingFee = this.estimateTransferFee(
        {
          playerId: candidate.id,
          marketValue: candidate.value,
          currentAbility: candidate.currentAbility,
          contractEnd: candidate.contractEnd,
          sellerTier: candidate.currentClub.league?.tier ?? null
        },
        {
          careerId: career.id,
          weekNumber: career.weekNumber,
          controlledTier
        }
      );

      const wageDemand = this.estimateTransferWage(candidate.weeklyWage, candidate.id, career.id, career.weekNumber);
      const budgetGap = Math.max(0, askingFee - availableBudget);
      const isAffordable = budgetGap <= 0;
      if (affordableOnly && !isAffordable) {
        continue;
      }

      const roleDemand = positionDemand.get(candidate.position?.toUpperCase() || 'UNK');
      const countInSquad = roleDemand?.count ?? 0;
      const avgAbility = roleDemand?.avgAbility ?? 58;
      const scarcity = countInSquad <= 0 ? 20 : countInSquad === 1 ? 13 : countInSquad === 2 ? 7 : 0;
      const abilityLift = (candidate.currentAbility ?? 60) - avgAbility;
      const fitScore = clamp(
        Math.round(45 + scarcity + abilityLift * 0.8 + (candidate.potentialAbility ?? 65) * 0.08),
        1,
        99
      );

      shortlist.push({
        playerId: candidate.id,
        fullName: candidate.fullName?.trim() || `${candidate.firstName} ${candidate.lastName}`.trim(),
        age: this.resolvePlayerAge(candidate.dateOfBirth, career.currentDate, candidate.age, candidate.id),
        position: candidate.position,
        currentAbility: candidate.currentAbility,
        potentialAbility: candidate.potentialAbility,
        marketValue: Math.round(candidate.value ?? Math.max(80000, (candidate.currentAbility ?? 60) * 50000)),
        weeklyWage: wageDemand,
        sellerClubId: candidate.currentClub.id,
        sellerClubName: candidate.currentClub.name,
        sellerLeagueId: candidate.currentClub.leagueId ?? null,
        sellerTier: candidate.currentClub.league?.tier ?? null,
        askingFee,
        scoutingTag,
        fitScore,
        isAffordable,
        budgetGap,
        isShortlisted: false,
        scoutingReport: null,
        activeNegotiationId: null,
        agentPressure: this.resolveTransferAgentPressure({
          currentAbility: candidate.currentAbility,
          potentialAbility: candidate.potentialAbility,
          age: this.resolvePlayerAge(candidate.dateOfBirth, career.currentDate, candidate.age, candidate.id),
          scoutingTag
        }),
        sellerStance: this.resolveTransferSellerStance({
          askingFee,
          marketValue: Math.round(candidate.value ?? Math.max(80000, (candidate.currentAbility ?? 60) * 50000)),
          currentAbility: candidate.currentAbility,
          sellerTier: candidate.currentClub.league?.tier ?? controlledTier,
          controlledTier
        })
      });
    }

    shortlist.sort((left, right) => {
      if (left.isAffordable !== right.isAffordable) {
        return left.isAffordable ? -1 : 1;
      }
      return right.fitScore - left.fitScore || left.askingFee - right.askingFee || left.playerId - right.playerId;
    });

    return shortlist;
  }

  private async seedTransferMarketPool(
    career: V2Career,
    controlledTier: number,
    scoutingTag: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL' | 'YOUTH',
    positionFilter: string | null,
    minimumPool: number,
    db: DbClient = this.prisma
  ) {
    const targetPoolSize = clamp(Math.floor(minimumPool), 20, 220);
    const scopedWhere = this.buildTransferScoutingWhere(career, controlledTier, scoutingTag, positionFilter);
    const scopedCount = await db.player.count({ where: scopedWhere });
    if (scopedCount >= targetPoolSize) {
      return;
    }

    const needed = targetPoolSize - scopedCount;
    const tierWindow = {
      gte: Math.max(1, controlledTier - 2),
      lte: Math.min(14, controlledTier + 2)
    };

    const scopedClubWhere: Prisma.ClubWhereInput = {
      id: { not: career.controlledClubId },
      isActive: true,
      leagueId: { not: null }
    };
    if (scoutingTag === 'LOCAL' && career.activeLeagueId) {
      scopedClubWhere.leagueId = career.activeLeagueId;
    } else if (scoutingTag === 'NATIONAL' || scoutingTag === 'YOUTH') {
      scopedClubWhere.league = {
        is: {
          tier: tierWindow
        }
      };
    }

    let sellerClubs = await db.club.findMany({
      where: scopedClubWhere,
      select: { id: true },
      take: 320,
      orderBy: { id: 'asc' }
    });

    if (sellerClubs.length === 0) {
      sellerClubs = await db.club.findMany({
        where: {
          id: { not: career.controlledClubId },
          isActive: true,
          leagueId: { not: null }
        },
        select: { id: true },
        take: 320,
        orderBy: { id: 'asc' }
      });
    }

    if (sellerClubs.length === 0) {
      return;
    }

    const profileSequence = scoutingTag === 'YOUTH'
      ? (['prospect', 'prospect', 'depth'] as const)
      : (['starter', 'squad', 'depth', 'prospect'] as const);

    const players: Prisma.PlayerCreateManyInput[] = [];
    for (let idx = 0; idx < needed; idx += 1) {
      const sellerClub = sellerClubs[idx % sellerClubs.length];
      const random = mulberry32(
        stringToSeed(`${career.id}:${career.weekNumber}:transfer-seed:${scoutingTag}:${sellerClub.id}:${idx}`)
      );
      const positionHint = positionFilter ?? SYNTHETIC_POSITION_TEMPLATE[(sellerClub.id + idx) % SYNTHETIC_POSITION_TEMPLATE.length];
      players.push(
        buildSyntheticPlayerPayload(sellerClub.id, random, {
          profile: profileSequence[idx % profileSequence.length],
          positionHint
        })
      );
    }

    for (const batch of chunked(players, 200)) {
      await db.player.createMany({ data: batch });
    }
  }

  private estimateTransferFee(
    player: {
      playerId: number;
      marketValue: number | null;
      currentAbility: number | null;
      contractEnd: Date | null;
      sellerTier: number | null;
    },
    context: {
      careerId: string;
      weekNumber: number;
      controlledTier: number;
    }
  ): number {
    const random = mulberry32(stringToSeed(`${context.careerId}:${context.weekNumber}:fee:${player.playerId}`));
    const baseValue = Math.round(player.marketValue ?? Math.max(70000, (player.currentAbility ?? 60) * 52000));

    const nowYear = new Date().getFullYear();
    const contractYearsRemaining = player.contractEnd
      ? Math.max(0, player.contractEnd.getFullYear() - nowYear)
      : 1;
    const contractMultiplier = contractYearsRemaining >= 3
      ? 1.28
      : contractYearsRemaining === 2
        ? 1.15
        : contractYearsRemaining === 1
          ? 1.03
          : 0.9;

    const sellerTier = player.sellerTier ?? context.controlledTier;
    const tierDelta = sellerTier - context.controlledTier;
    const tierMultiplier = tierDelta < 0 ? 0.9 : tierDelta > 0 ? 1.08 : 1;
    const marketNoise = 0.92 + random() * 0.2;

    const estimated = baseValue * contractMultiplier * tierMultiplier * marketNoise;
    const rounded = Math.round(estimated / 1000) * 1000;
    return clamp(rounded, 25000, 120000000);
  }

  private estimateOutgoingTransferFee(
    player: {
      playerId: number;
      marketValue: number | null;
      currentAbility: number | null;
      contractEnd: Date | null;
      buyerTier: number;
    },
    context: {
      careerId: string;
      weekNumber: number;
      controlledTier: number;
    }
  ): number {
    const random = mulberry32(stringToSeed(`${context.careerId}:${context.weekNumber}:outgoing-fee:${player.playerId}`));
    const baseValue = Math.round(player.marketValue ?? Math.max(55000, (player.currentAbility ?? 60) * 46000));

    const nowYear = new Date().getFullYear();
    const contractYearsRemaining = player.contractEnd
      ? Math.max(0, player.contractEnd.getFullYear() - nowYear)
      : 1;
    const contractMultiplier = contractYearsRemaining >= 3
      ? 1.18
      : contractYearsRemaining === 2
        ? 1.08
        : contractYearsRemaining === 1
          ? 0.98
          : 0.88;

    const tierDelta = player.buyerTier - context.controlledTier;
    const tierMultiplier = tierDelta < 0 ? 0.9 : tierDelta > 0 ? 1.06 : 1;
    const marketNoise = 0.86 + random() * 0.22;

    const estimated = baseValue * contractMultiplier * tierMultiplier * marketNoise;
    const rounded = Math.round(estimated / 1000) * 1000;
    return clamp(rounded, 15000, 80000000);
  }

  private estimateTransferWage(
    baseWage: number | null | undefined,
    playerId: number,
    careerId: string,
    weekNumber: number
  ): number {
    const current = Math.max(450, Math.round(baseWage ?? 900));
    const random = mulberry32(stringToSeed(`${careerId}:${weekNumber}:wage:${playerId}`));
    const multiplier = 1.04 + random() * 0.2;
    return Math.round(current * multiplier);
  }

  private resolveContractYearsFromStance(transferStance: string): number {
    const normalized = transferStance.toUpperCase();
    if (normalized === 'INVEST') return 4;
    if (normalized === 'SELL_TO_BALANCE') return 2;
    return 3;
  }

  private resolveContractRisk(contractEnd: Date | null | undefined, referenceDate: Date): 'STABLE' | 'WATCH' | 'CRITICAL' {
    if (!contractEnd) {
      return 'CRITICAL';
    }

    const millisPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.floor((contractEnd.getTime() - referenceDate.getTime()) / millisPerDay);
    if (daysRemaining < 120) {
      return 'CRITICAL';
    }
    if (daysRemaining < 300) {
      return 'WATCH';
    }
    return 'STABLE';
  }

  private resolvePlayerAge(
    dateOfBirth: Date | null | undefined,
    referenceDate: Date,
    storedAge: number | null | undefined,
    playerId: number
  ): number {
    const computedAge = this.computeAgeAtDate(dateOfBirth, referenceDate);
    if (Number.isFinite(computedAge)) {
      return Number(computedAge);
    }

    if (Number.isFinite(storedAge)) {
      return clamp(Math.round(Number(storedAge)), 15, 60);
    }

    // Final deterministic fallback for corrupted legacy rows.
    const fallbackRandom = mulberry32(stringToSeed(`age:fallback:${playerId}`));
    return 17 + Math.floor(fallbackRandom() * 21); // 17..37
  }

  private computeAgeAtDate(dateOfBirth: Date | null | undefined, referenceDate: Date): number | null {
    if (!dateOfBirth) {
      return null;
    }
    if (Number.isNaN(dateOfBirth.getTime()) || Number.isNaN(referenceDate.getTime())) {
      return null;
    }

    let age = referenceDate.getUTCFullYear() - dateOfBirth.getUTCFullYear();
    const monthDiff = referenceDate.getUTCMonth() - dateOfBirth.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getUTCDate() < dateOfBirth.getUTCDate())) {
      age -= 1;
    }

    const normalizedAge = clamp(age, 15, 60);
    return Number.isFinite(normalizedAge) ? normalizedAge : null;
  }

  private assertInterventionType(type: string): asserts type is V2InterventionType {
    if (!Object.values(V2_INTERVENTION_TYPES).includes(type as V2InterventionType)) {
      throw new Error('Invalid intervention type.');
    }
  }

  private assertCareerPlayable(career: V2Career, action: string): void {
    if (career.currentPhase !== V2_PHASES.TERMINATED) {
      return;
    }
    throw new Error(`Career has been terminated by the board. You cannot ${action}.`);
  }

  private getBoardRiskLevel(boardConfidence: number): 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL' {
    if (boardConfidence < 30) return 'CRITICAL';
    if (boardConfidence < 45) return 'PRESSURE';
    if (boardConfidence < 60) return 'WATCH';
    return 'STABLE';
  }

  private async buildClubPulseSummary(
    career: V2Career,
    clubStateOverride?: V2ClubState,
    boardStatusOverride?: BoardStatusSnapshot
  ): Promise<ClubPulseSummary> {
    const snapshot = await this.buildClubPulseSnapshot(career, clubStateOverride, boardStatusOverride);
    return {
      fanSentimentScore: snapshot.fanSentimentScore,
      fanSentimentLabel: snapshot.fanSentimentLabel,
      fanSummary: snapshot.fanSummary,
      mediaPressureScore: snapshot.mediaPressureScore,
      mediaPressureLabel: snapshot.mediaPressureLabel,
      mediaSummary: snapshot.mediaSummary,
      projectedAttendance: snapshot.projectedAttendance,
      projectedAttendancePct: snapshot.projectedAttendancePct,
      topHeadline: snapshot.topHeadline
    };
  }

  private async buildClubPulseSnapshot(
    career: V2Career,
    clubStateOverride?: V2ClubState,
    boardStatusOverride?: BoardStatusSnapshot
  ): Promise<ClubPulseSnapshot> {
    const clubState = clubStateOverride
      ?? await this.prisma.v2ClubState.findUnique({
        where: {
          careerId_clubId: {
            careerId: career.id,
            clubId: career.controlledClubId
          }
        }
      })
      ?? null;
    const boardStatus = boardStatusOverride ?? await this.buildBoardStatus(career, clubState ?? undefined);

    const [club, recentFixtures, recentAudits] = await Promise.all([
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          id: true,
          name: true,
          averageAttendance: true
        }
      }),
      this.prisma.v2Fixture.findMany({
        where: {
          careerId: career.id,
          isUserClubFixture: true,
          status: V2_FIXTURE_STATUS.COMPLETED
        },
        orderBy: [{ weekNumber: 'desc' }, { matchDate: 'desc' }],
        take: 4
      }),
      this.prisma.v2AuditLog.findMany({
        where: {
          careerId: career.id,
          category: {
            in: ['CLUB_PULSE', 'CONTRACT', 'TRANSFER', 'CLUB_OPERATIONS', 'POST_MATCH', 'EVENT']
          }
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 14
      })
    ]);

    const recentFixturesPresentation = await Promise.all(
      recentFixtures.map((fixture) => this.toFixturePresentation(fixture, career.controlledClubId))
    );

    const recentResults: ClubPulseRecentResult[] = recentFixturesPresentation.map((fixture) => {
      const controlledHome = fixture.isControlledClubHome !== false;
      const goalsFor = controlledHome ? Number(fixture.homeScore ?? 0) : Number(fixture.awayScore ?? 0);
      const goalsAgainst = controlledHome ? Number(fixture.awayScore ?? 0) : Number(fixture.homeScore ?? 0);
      const outcome: ClubPulseRecentResult['outcome'] = goalsFor > goalsAgainst ? 'WIN' : goalsFor < goalsAgainst ? 'LOSS' : 'DRAW';
      return {
        fixtureId: fixture.id,
        opponentClubName: fixture.opponentClubName,
        outcome,
        scoreline: `${goalsFor}-${goalsAgainst}`,
        matchDate: fixture.matchDate?.toISOString?.() ?? null
      };
    });

    const pulseMemory = recentAudits.reduce((acc, audit, index) => {
      const metadata = this.parseAuditMetadataRecord(audit.metadata);
      const weight = index <= 2 ? 1.2 : index <= 5 ? 0.8 : 0.45;
      const fanDelta = this.toFiniteNumber(metadata?.fanDelta);
      const mediaDelta = this.toFiniteNumber(metadata?.mediaDelta);
      if (fanDelta) {
        acc.fan += fanDelta * weight;
      }
      if (mediaDelta) {
        acc.media += mediaDelta * weight;
      }
      return acc;
    }, { fan: 0, media: 0 });

    const morale = clubState?.morale ?? 50;
    const recentFormScore = recentResults.reduce((sum, result, index) => {
      const weight = index === 0 ? 1.15 : index === 1 ? 1 : 0.8;
      if (result.outcome === 'WIN') return sum + (9 * weight);
      if (result.outcome === 'DRAW') return sum + (1.5 * weight);
      return sum - (8 * weight);
    }, 0);
    const objectivePressure = boardStatus.objectives.reduce((sum, objective) => {
      if (objective.status === 'ON_TRACK') return sum + 1.2;
      if (objective.status === 'AT_RISK') return sum - 1.5;
      return sum - 3.5;
    }, 0);

    const fanSentimentScore = clamp(
      Math.round(
        52
        + ((morale - 50) * 0.7)
        + ((boardStatus.jobSecurityScore - 50) * 0.18)
        + recentFormScore
        + objectivePressure
        + pulseMemory.fan
      ),
      0,
      100
    );

    const mediaPressureScore = clamp(
      Math.round(
        44
        + ((55 - boardStatus.jobSecurityScore) * 0.34)
        + ((50 - morale) * 0.28)
        - (recentResults.filter((result) => result.outcome === 'WIN').length * 5)
        + (recentResults.filter((result) => result.outcome === 'LOSS').length * 8)
        + pulseMemory.media
        + (fanSentimentScore < 42 ? 5 : fanSentimentScore > 70 ? -4 : 0)
      ),
      0,
      100
    );

    const fanSentimentLabel = this.getFanSentimentLabel(fanSentimentScore);
    const mediaPressureLabel = this.getMediaPressureLabel(mediaPressureScore);
    const fanSummary = this.getFanSentimentSummary(fanSentimentLabel, recentResults, boardStatus);
    const mediaSummary = this.getMediaPressureSummary(mediaPressureLabel, boardStatus, recentResults);

    const averageAttendance = this.toFiniteNumber(club?.averageAttendance);
    const projectedAttendancePct = Number.isFinite(averageAttendance)
      ? clamp(
        Math.round(66 + ((fanSentimentScore - 50) * 0.5) - (Math.max(0, mediaPressureScore - 75) * 0.1)),
        52,
        112
      )
      : null;
    const projectedAttendance = Number.isFinite(averageAttendance) && Number.isFinite(projectedAttendancePct)
      ? Math.max(0, Math.round((Number(averageAttendance) * Number(projectedAttendancePct)) / 100))
      : null;

    const headlines = this.buildClubPulseHeadlines({
      career,
      boardStatus,
      clubName: club?.name ?? `Club ${career.controlledClubId}`,
      fanSentimentScore,
      fanSentimentLabel,
      fanSummary,
      mediaPressureScore,
      mediaPressureLabel,
      mediaSummary,
      recentResults,
      recentAudits
    });

    return {
      boardStatus,
      fanSentimentScore,
      fanSentimentLabel,
      fanSummary,
      mediaPressureScore,
      mediaPressureLabel,
      mediaSummary,
      projectedAttendance,
      projectedAttendancePct,
      topHeadline: headlines[0]?.title ?? null,
      headlines,
      recentResults
    };
  }

  private buildClubPulseHeadlines(context: {
    career: V2Career;
    boardStatus: BoardStatusSnapshot;
    clubName: string;
    fanSentimentScore: number;
    fanSentimentLabel: FanSentimentLabel;
    fanSummary: string;
    mediaPressureScore: number;
    mediaPressureLabel: MediaPressureLabel;
    mediaSummary: string;
    recentResults: ClubPulseRecentResult[];
    recentAudits: Array<{
      id: string;
      category: string;
      message: string;
      metadata: string | null;
      createdAt: Date;
    }>;
  }): ClubPulseHeadline[] {
    const headlines: ClubPulseHeadline[] = [];
    const boardTone: ClubPulseHeadlineTone = context.boardStatus.jobSecurity === 'SECURE' || context.boardStatus.jobSecurity === 'STABLE'
      ? 'POSITIVE'
      : context.boardStatus.jobSecurity === 'UNSTABLE'
        ? 'NEUTRAL'
        : 'NEGATIVE';

    headlines.push({
      id: `pulse-board-${context.career.id}-${context.career.weekNumber}`,
      category: 'BOARD',
      tone: boardTone,
      title: boardTone === 'NEGATIVE' ? 'Board scrutiny intensifies' : boardTone === 'POSITIVE' ? 'Board backing holds steady' : 'Board keeps weekly targets under review',
      summary: context.boardStatus.summary,
      weekNumber: context.career.weekNumber,
      createdAt: null
    });

    headlines.push({
      id: `pulse-fans-${context.career.id}-${context.career.weekNumber}`,
      category: 'FANS',
      tone: context.fanSentimentScore >= 62 ? 'POSITIVE' : context.fanSentimentScore <= 40 ? 'NEGATIVE' : 'NEUTRAL',
      title: context.fanSentimentScore >= 72
        ? 'Support inside the stadium is building'
        : context.fanSentimentScore <= 38
          ? 'Supporters are openly restless'
          : 'Fan mood remains finely balanced',
      summary: context.fanSummary,
      weekNumber: context.career.weekNumber,
      createdAt: null
    });

    headlines.push({
      id: `pulse-media-${context.career.id}-${context.career.weekNumber}`,
      category: 'MEDIA',
      tone: context.mediaPressureScore >= 68 ? 'NEGATIVE' : context.mediaPressureScore <= 34 ? 'POSITIVE' : 'NEUTRAL',
      title: context.mediaPressureScore >= 75
        ? 'Media pressure becomes a weekly storyline'
        : context.mediaPressureScore <= 34
          ? 'Media coverage stays calm around the club'
          : 'Press attention stays trained on the dugout',
      summary: context.mediaSummary,
      weekNumber: context.career.weekNumber,
      createdAt: null
    });

    const latestResult = context.recentResults[0];
    if (latestResult) {
      headlines.push({
        id: `pulse-match-${latestResult.fixtureId}`,
        category: 'MATCH',
        tone: latestResult.outcome === 'WIN' ? 'POSITIVE' : latestResult.outcome === 'LOSS' ? 'NEGATIVE' : 'NEUTRAL',
        title: latestResult.outcome === 'WIN'
          ? 'Latest result lifts the mood'
          : latestResult.outcome === 'LOSS'
            ? 'Latest result fuels outside noise'
            : 'Latest result leaves the story unresolved',
        summary: `${context.clubName} ${latestResult.scoreline} against ${latestResult.opponentClubName ?? 'the opposition'} in the last completed fixture.`,
        weekNumber: null,
        createdAt: latestResult.matchDate
      });
    }

    const latestAudit = context.recentAudits.find((audit) =>
      ['CONTRACT', 'TRANSFER', 'CLUB_OPERATIONS', 'POST_MATCH', 'CLUB_PULSE'].includes(audit.category)
    );
    if (latestAudit) {
      const metadata = this.parseAuditMetadataRecord(latestAudit.metadata);
      const weekNumber = Number.isFinite(this.toFiniteNumber(metadata?.weekNumber))
        ? Number(this.toFiniteNumber(metadata?.weekNumber))
        : null;
      headlines.push({
        id: `pulse-audit-${latestAudit.id}`,
        category: latestAudit.category === 'TRANSFER'
          ? 'TRANSFER'
          : latestAudit.category === 'CONTRACT'
            ? 'CONTRACT'
            : 'CLUB',
        tone: latestAudit.category === 'CLUB_PULSE'
          ? ((this.toFiniteNumber(metadata?.fanDelta) ?? 0) + ((this.toFiniteNumber(metadata?.mediaDelta) ?? 0) * -0.5) >= 0 ? 'POSITIVE' : 'NEGATIVE')
          : latestAudit.category === 'POST_MATCH'
            ? 'NEUTRAL'
            : 'NEUTRAL',
        title: latestAudit.category === 'TRANSFER'
          ? 'Transfer desk remains active'
          : latestAudit.category === 'CONTRACT'
            ? 'Contract desk shapes the weekly narrative'
            : latestAudit.category === 'CLUB_OPERATIONS'
              ? 'Club operations decision lands off the pitch'
              : 'Club storyline continues to move',
        summary: latestAudit.message,
        weekNumber,
        createdAt: latestAudit.createdAt.toISOString()
      });
    }

    return headlines.slice(0, 5);
  }

  private getFanSentimentLabel(score: number): FanSentimentLabel {
    if (score < 32) return 'DISCONNECTED';
    if (score < 46) return 'RESTLESS';
    if (score < 62) return 'STEADY';
    if (score < 78) return 'ENGAGED';
    return 'EUPHORIC';
  }

  private getMediaPressureLabel(score: number): MediaPressureLabel {
    if (score < 30) return 'QUIET';
    if (score < 52) return 'WATCHING';
    if (score < 72) return 'LOUD';
    return 'FEVERED';
  }

  private getFanSentimentSummary(
    label: FanSentimentLabel,
    recentResults: ClubPulseRecentResult[],
    boardStatus: BoardStatusSnapshot
  ): string {
    const wins = recentResults.filter((result) => result.outcome === 'WIN').length;
    const losses = recentResults.filter((result) => result.outcome === 'LOSS').length;
    if (label === 'EUPHORIC') {
      return `Support is surging. ${wins > 0 ? 'Recent wins have strengthened belief in the project.' : 'The crowd is backing the long-term direction.'}`;
    }
    if (label === 'ENGAGED') {
      return 'Supporters are behind the group and responding well to current momentum.';
    }
    if (label === 'STEADY') {
      return 'Support remains stable, but the crowd still needs proof before fully buying in.';
    }
    if (label === 'RESTLESS') {
      return `Patience is thinning. ${losses > 0 ? 'Recent dropped points have raised questions in the stands.' : 'Supporters want a clearer short-term response.'}`;
    }
    return boardStatus.jobSecurity === 'CRITICAL'
      ? 'The fanbase is detached and reacting badly to the current board pressure.'
      : 'The fanbase is detached and expects a visible shift soon.';
  }

  private getMediaPressureSummary(
    label: MediaPressureLabel,
    boardStatus: BoardStatusSnapshot,
    recentResults: ClubPulseRecentResult[]
  ): string {
    const latestResult = recentResults[0];
    if (label === 'QUIET') {
      return 'Coverage is calm. There is little appetite for a crisis narrative right now.';
    }
    if (label === 'WATCHING') {
      return 'Questions are forming, but the weekly line is still manageable.';
    }
    if (label === 'LOUD') {
      return latestResult?.outcome === 'LOSS'
        ? 'Recent results have sharpened the tone of the coverage and press conferences carry more risk.'
        : 'Press focus is rising and every public answer now shapes the weekly storyline.';
    }
    return boardStatus.jobSecurity === 'CRITICAL'
      ? 'The press is openly linking results to job security. Any misstep will travel quickly.'
      : 'Media coverage is intense and looking for signs of instability every week.';
  }

  private async applyBoardReviewAtWeekWrap(career: V2Career): Promise<BoardReviewOutcome> {
    const clubState = await this.prisma.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId: career.id,
          clubId: career.controlledClubId
        }
      }
    });

    const boardStatus = await this.buildBoardStatus(career, clubState ?? undefined);
    const failedObjectives = boardStatus.objectives.filter((objective) => objective.status === 'FAILED').length;
    const atRiskObjectives = boardStatus.objectives.filter((objective) => objective.status === 'AT_RISK').length;

    let boardDelta = 0;
    if (failedObjectives === 0 && atRiskObjectives === 0) {
      boardDelta += 1;
    } else {
      boardDelta -= failedObjectives * 2 + atRiskObjectives;
    }

    if (boardStatus.jobSecurity === 'UNDER_REVIEW') {
      boardDelta -= 1;
    } else if (boardStatus.jobSecurity === 'CRITICAL') {
      boardDelta -= 2;
    }

    const previousBoardConfidence = clubState?.boardConfidence ?? boardStatus.boardConfidence;
    const newBoardConfidence = clamp(previousBoardConfidence + boardDelta, 0, 100);
    const playedMatches = boardStatus.standingsContext.played;
    const hasEnoughEvaluationWindow = playedMatches >= 6 || career.weekNumber >= 10;
    const severeObjectiveFailure = failedObjectives >= 3 || (failedObjectives >= 2 && atRiskObjectives >= 1);
    const dismissed = hasEnoughEvaluationWindow &&
      boardStatus.jobSecurity === 'CRITICAL' &&
      (newBoardConfidence <= 8 || (newBoardConfidence <= 15 && severeObjectiveFailure));
    const dismissalReason = dismissed
      ? 'Board dismissed manager due to critical confidence and failed objectives.'
      : null;

    if (clubState) {
      await this.prisma.v2ClubState.update({
        where: { id: clubState.id },
        data: { boardConfidence: newBoardConfidence }
      });
    } else {
      await this.prisma.v2ClubState.create({
        data: {
          id: `${career.id}:cs:${career.controlledClubId}`,
          careerId: career.id,
          clubId: career.controlledClubId,
          morale: 55,
          fitnessTrend: 0,
          boardConfidence: newBoardConfidence,
          budgetBalance: 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        }
      });
    }

    return {
      boardDelta,
      previousBoardConfidence,
      newBoardConfidence,
      failedObjectives,
      atRiskObjectives,
      jobSecurity: boardStatus.jobSecurity,
      reviewWindowWeeks: boardStatus.reviewWindowWeeks,
      dismissed,
      dismissalReason
    };
  }

  private async buildBoardStatus(career: V2Career, clubStateOverride?: V2ClubState): Promise<BoardStatusSnapshot> {
    const [clubState, controlledClub] = await Promise.all([
      clubStateOverride
        ? Promise.resolve(clubStateOverride)
        : this.prisma.v2ClubState.findUnique({
          where: {
            careerId_clubId: {
              careerId: career.id,
              clubId: career.controlledClubId
            }
          }
        }),
      this.prisma.club.findUnique({
        where: { id: career.controlledClubId },
        select: {
          leagueId: true
        }
      })
    ]);

    const boardConfidence = clubState?.boardConfidence ?? 50;
    const morale = clubState?.morale ?? 50;
    const budgetBalance = clubState?.budgetBalance ?? 0;
    const leagueId = career.activeLeagueId ?? controlledClub?.leagueId ?? null;

    const [league, standingsRows] = leagueId
      ? await Promise.all([
        this.prisma.league.findUnique({
          where: { id: leagueId },
          select: {
            id: true,
            name: true,
            tier: true
          }
        }),
        this.prisma.v2LeagueState.findMany({
          where: {
            careerId: career.id,
            leagueId
          },
          orderBy: [
            { points: 'desc' },
            { goalDifference: 'desc' },
            { goalsFor: 'desc' },
            { clubId: 'asc' }
          ]
        })
      ])
      : [null, [] as Array<{
        clubId: number;
        played: number;
        points: number;
        goalDifference: number;
        goalsFor: number;
      }>];

    const clubCount = standingsRows.length;
    const positionIndex = standingsRows.findIndex((row) => row.clubId === career.controlledClubId);
    const position = positionIndex >= 0 ? positionIndex + 1 : null;
    const controlledStanding = positionIndex >= 0 ? standingsRows[positionIndex] : null;
    const played = controlledStanding?.played ?? 0;
    const points = controlledStanding?.points ?? 0;
    const pointsPerGame = played > 0 ? Number((points / played).toFixed(2)) : 0;
    const leagueTier = league?.tier ?? null;
    const expectations = this.deriveBoardExpectations(leagueTier, clubCount);

    const positionStatus = this.scoreBoardObjectiveMax(
      position ?? Math.max(expectations.maxPosition + 3, Math.ceil(Math.max(clubCount, 12) * 0.75)),
      expectations.maxPosition,
      2
    );
    const pointsStatus = this.scoreBoardObjectiveMin(pointsPerGame, expectations.minPointsPerGame, 0.2);
    const moraleStatus = this.scoreBoardObjectiveMin(morale, expectations.minMorale, 6);
    const budgetStatus = this.scoreBoardObjectiveMin(budgetBalance, expectations.minBudgetBalance, 60000);

    const objectives: BoardObjectiveSnapshot[] = [
      {
        id: 'LEAGUE_POSITION',
        title: 'League Position',
        target: `Finish in position ${expectations.maxPosition} or better.`,
        current: position
          ? `Position ${position}${clubCount ? ` of ${clubCount}` : ''}`
          : 'Position data pending.',
        status: positionStatus.status,
        progressPct: position
          ? this.progressForMaxObjective(position, expectations.maxPosition, Math.max(clubCount, expectations.maxPosition + 2))
          : 0,
        weight: 45
      },
      {
        id: 'POINTS_PACE',
        title: 'Points Pace',
        target: `${expectations.minPointsPerGame.toFixed(2)} points per game.`,
        current: played > 0
          ? `${pointsPerGame.toFixed(2)} pts/game (${points} pts in ${played} matches)`
          : 'No league matches played yet.',
        status: pointsStatus.status,
        progressPct: this.progressForMinObjective(pointsPerGame, expectations.minPointsPerGame),
        weight: 25
      },
      {
        id: 'SQUAD_MORALE',
        title: 'Squad Morale',
        target: `Maintain morale at ${expectations.minMorale} or above.`,
        current: `${morale}`,
        status: moraleStatus.status,
        progressPct: this.progressForMinObjective(morale, expectations.minMorale),
        weight: 15
      },
      {
        id: 'OPERATING_BALANCE',
        title: 'Operating Balance Discipline',
        target: `Keep V2 budget balance above EUR ${expectations.minBudgetBalance.toLocaleString()}.`,
        current: `EUR ${Math.round(budgetBalance).toLocaleString()}`,
        status: budgetStatus.status,
        progressPct: this.progressForBudgetObjective(budgetBalance, expectations.minBudgetBalance),
        weight: 15
      }
    ];

    const failedObjectives = objectives.filter((objective) => objective.status === 'FAILED').length;
    const atRiskObjectives = objectives.filter((objective) => objective.status === 'AT_RISK').length;
    const objectiveScore = objectives.reduce((sum, objective) => {
      const multiplier = objective.status === 'ON_TRACK' ? 1 : objective.status === 'AT_RISK' ? 0.5 : 0;
      return sum + objective.weight * multiplier;
    }, 0);
    const jobSecurityScore = clamp(
      Math.round(boardConfidence * 0.55 + objectiveScore * 0.45 - failedObjectives * 8 - atRiskObjectives * 3),
      0,
      100
    );
    const jobSecurity = this.getBoardJobSecurity(jobSecurityScore);
    const reviewWindowWeeks = this.getBoardReviewWindowWeeks(jobSecurity);
    const summary = this.getBoardSummary(jobSecurity, failedObjectives, atRiskObjectives);

    return {
      boardConfidence,
      boardRiskLevel: this.getBoardRiskLevel(boardConfidence),
      jobSecurity,
      jobSecurityScore,
      reviewWindowWeeks,
      summary,
      objectives,
      standingsContext: {
        leagueId,
        leagueName: league?.name ?? null,
        leagueTier,
        position,
        clubCount,
        points,
        pointsPerGame,
        played
      }
    };
  }

  private deriveBoardExpectations(
    leagueTier: number | null,
    clubCountInput: number
  ): {
    maxPosition: number;
    minPointsPerGame: number;
    minMorale: number;
    minBudgetBalance: number;
  } {
    const clubCount = Math.max(10, clubCountInput || 18);
    const tier = Number.isFinite(leagueTier ?? NaN) ? Number(leagueTier) : 8;

    if (tier <= 1) {
      return {
        maxPosition: Math.max(1, Math.ceil(clubCount * 0.28)),
        minPointsPerGame: 1.7,
        minMorale: 56,
        minBudgetBalance: -120000
      };
    }
    if (tier <= 2) {
      return {
        maxPosition: Math.max(1, Math.ceil(clubCount * 0.38)),
        minPointsPerGame: 1.5,
        minMorale: 54,
        minBudgetBalance: -100000
      };
    }
    if (tier <= 4) {
      return {
        maxPosition: Math.max(1, Math.ceil(clubCount * 0.5)),
        minPointsPerGame: 1.35,
        minMorale: 52,
        minBudgetBalance: -75000
      };
    }
    if (tier <= 8) {
      return {
        maxPosition: Math.max(1, Math.ceil(clubCount * 0.58)),
        minPointsPerGame: 1.2,
        minMorale: 50,
        minBudgetBalance: -50000
      };
    }
    return {
      maxPosition: Math.max(1, Math.ceil(clubCount * 0.65)),
      minPointsPerGame: 1.1,
      minMorale: 48,
      minBudgetBalance: -35000
    };
  }

  private scoreBoardObjectiveMin(
    currentValue: number,
    targetValue: number,
    tolerance: number
  ): { status: BoardObjectiveStatus } {
    if (currentValue >= targetValue) {
      return { status: 'ON_TRACK' };
    }
    if (currentValue >= targetValue - tolerance) {
      return { status: 'AT_RISK' };
    }
    return { status: 'FAILED' };
  }

  private scoreBoardObjectiveMax(
    currentValue: number,
    targetValue: number,
    tolerance: number
  ): { status: BoardObjectiveStatus } {
    if (currentValue <= targetValue) {
      return { status: 'ON_TRACK' };
    }
    if (currentValue <= targetValue + tolerance) {
      return { status: 'AT_RISK' };
    }
    return { status: 'FAILED' };
  }

  private progressForMinObjective(currentValue: number, targetValue: number): number {
    if (currentValue >= targetValue) {
      return 100;
    }
    if (targetValue <= 0) {
      return currentValue >= targetValue ? 100 : 0;
    }
    return clamp(Math.round((currentValue / targetValue) * 100), 0, 99);
  }

  private progressForBudgetObjective(currentValue: number, targetValue: number): number {
    if (currentValue >= targetValue) {
      return 100;
    }
    const deficit = targetValue - currentValue;
    const window = Math.max(1, Math.abs(targetValue));
    return clamp(Math.round((1 - (deficit / window)) * 100), 0, 99);
  }

  private progressForMaxObjective(currentValue: number, targetValue: number, maxValue: number): number {
    if (currentValue <= targetValue) {
      return 100;
    }
    const denominator = Math.max(1, maxValue - targetValue);
    const overrun = currentValue - targetValue;
    return clamp(Math.round((1 - (overrun / denominator)) * 100), 0, 99);
  }

  private getBoardJobSecurity(score: number): BoardJobSecurity {
    if (score >= 72) return 'SECURE';
    if (score >= 56) return 'STABLE';
    if (score >= 40) return 'UNSTABLE';
    if (score >= 25) return 'UNDER_REVIEW';
    return 'CRITICAL';
  }

  private getBoardReviewWindowWeeks(jobSecurity: BoardJobSecurity): number | null {
    if (jobSecurity === 'UNDER_REVIEW') {
      return 4;
    }
    if (jobSecurity === 'CRITICAL') {
      return 2;
    }
    return null;
  }

  private getBoardSummary(jobSecurity: BoardJobSecurity, failedObjectives: number, atRiskObjectives: number): string {
    if (jobSecurity === 'SECURE') {
      return 'Board support is strong. Keep current trajectory.';
    }
    if (jobSecurity === 'STABLE') {
      return 'Board confidence is acceptable, but consistency remains expected.';
    }
    if (jobSecurity === 'UNSTABLE') {
      return 'Board concern is increasing. Missed objectives must be corrected soon.';
    }
    if (jobSecurity === 'UNDER_REVIEW') {
      return `Board has started a formal review (${failedObjectives} failed objective${failedObjectives === 1 ? '' : 's'}, ${atRiskObjectives} at risk).`;
    }
    return `Board confidence is critical (${failedObjectives} failed objective${failedObjectives === 1 ? '' : 's'}). Immediate recovery required.`;
  }

  private async applyClubEffects(
    tx: DbClient,
    careerId: string,
    clubId: number,
    effects: {
      moraleDelta?: number;
      boardDelta?: number;
      fitnessTrendDelta?: number;
      budgetDelta?: number;
    }
  ) {
    const existing = await tx.v2ClubState.findUnique({
      where: {
        careerId_clubId: {
          careerId,
          clubId
        }
      }
    });

    if (!existing) {
      await tx.v2ClubState.create({
        data: {
          id: `${careerId}:cs:${clubId}`,
          careerId,
          clubId,
          morale: clamp(55 + (effects.moraleDelta ?? 0), 20, 100),
          boardConfidence: clamp(55 + (effects.boardDelta ?? 0), 0, 100),
          fitnessTrend: clamp(effects.fitnessTrendDelta ?? 0, -20, 20),
          budgetBalance: effects.budgetDelta ?? 0,
          injuriesSummary: JSON.stringify({ total: 0, severe: 0 }),
          form: 'NNNNN'
        }
      });
      return;
    }

    await tx.v2ClubState.update({
      where: { id: existing.id },
      data: {
        morale: clamp(existing.morale + (effects.moraleDelta ?? 0), 20, 100),
        boardConfidence: clamp(existing.boardConfidence + (effects.boardDelta ?? 0), 0, 100),
        fitnessTrend: clamp(existing.fitnessTrend + (effects.fitnessTrendDelta ?? 0), -20, 20),
        budgetBalance: Number((existing.budgetBalance + (effects.budgetDelta ?? 0)).toFixed(2))
      }
    });
  }

  private async buildSnapshot(careerId: string): Promise<SaveSnapshot> {
    const career = await this.requireCareer(careerId);

    const [
      clubStates,
      leagueStates,
      playerStates,
      fixtures,
      weekPlans,
      inboxEvents,
      eventDecisions,
      matches
    ] = await Promise.all([
      this.prisma.v2ClubState.findMany({ where: { careerId }, orderBy: { clubId: 'asc' } }),
      this.prisma.v2LeagueState.findMany({ where: { careerId }, orderBy: [{ leagueId: 'asc' }, { clubId: 'asc' }] }),
      this.prisma.v2PlayerState.findMany({ where: { careerId }, orderBy: [{ clubId: 'asc' }, { playerId: 'asc' }] }),
      this.prisma.v2Fixture.findMany({ where: { careerId }, orderBy: [{ weekNumber: 'asc' }, { id: 'asc' }] }),
      this.prisma.v2WeekPlan.findMany({ where: { careerId }, orderBy: { weekNumber: 'asc' } }),
      this.prisma.v2InboxEvent.findMany({ where: { careerId }, orderBy: [{ weekNumber: 'asc' }, { id: 'asc' }] }),
      this.prisma.v2EventDecision.findMany({ where: { careerId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.v2Match.findMany({ where: { careerId }, orderBy: { createdAt: 'asc' } })
    ]);

    const matchIds = matches.map((match) => match.id);
    const highlights = matchIds.length > 0
      ? await this.prisma.v2Highlight.findMany({
        where: { matchId: { in: matchIds } },
        orderBy: [{ matchId: 'asc' }, { minute: 'asc' }, { id: 'asc' }]
      })
      : [];

    return {
      career: {
        currentDate: career.currentDate.toISOString(),
        currentPhase: career.currentPhase,
        season: career.season,
        weekNumber: career.weekNumber,
        activeLeagueId: career.activeLeagueId
      },
      clubStates: clubStates as unknown as Array<Record<string, unknown>>,
      leagueStates: leagueStates as unknown as Array<Record<string, unknown>>,
      playerStates: playerStates as unknown as Array<Record<string, unknown>>,
      fixtures: fixtures as unknown as Array<Record<string, unknown>>,
      weekPlans: weekPlans as unknown as Array<Record<string, unknown>>,
      inboxEvents: inboxEvents as unknown as Array<Record<string, unknown>>,
      eventDecisions: eventDecisions as unknown as Array<Record<string, unknown>>,
      matches: matches as unknown as Array<Record<string, unknown>>,
      highlights: highlights as unknown as Array<Record<string, unknown>>
    };
  }

  private async persistSaveSlot(careerId: string, slotName: string, isAuto: boolean) {
    const snapshot = await this.buildSnapshot(careerId);
    const stateHash = hashJson(snapshot);
    const now = new Date();
    const snapshotPayload = compressSaveSnapshotPayload(JSON.stringify(snapshot));
    const slotId = `${careerId}:${slotName}`;

    const slot = await this.prisma.v2SaveSlot.upsert({
      where: { id: slotId },
      update: {
        isAuto,
        snapshot: snapshotPayload,
        stateHash,
        lastPlayedAt: now
      },
      create: {
        id: slotId,
        careerId,
        slotName,
        isAuto,
        snapshot: snapshotPayload,
        stateHash,
        lastPlayedAt: now
      }
    });

    if (!isAuto) {
      await this.pruneManualSaveHistory(careerId, slotId);
    }

    return slot;
  }

  private async pruneManualSaveHistory(careerId: string, keepSlotId: string) {
    const removableSlots = await this.prisma.v2SaveSlot.findMany({
      where: {
        careerId,
        isAuto: false
      },
      select: {
        id: true
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: MAX_MANUAL_SAVE_SLOTS_PER_CAREER
    });

    const removableIds = removableSlots
      .map((slot) => slot.id)
      .filter((id) => id !== keepSlotId);

    if (removableIds.length === 0) {
      return;
    }

    await this.prisma.v2SaveSlot.deleteMany({
      where: {
        id: {
          in: removableIds
        }
      }
    });
  }

  private async writeAudit(
    dbClient: DbClient,
    careerId: string,
    category: string,
    message: string,
    metadata: Record<string, unknown>
  ) {
    await dbClient.v2AuditLog.create({
      data: {
        id: `${careerId}:audit:${Date.now()}:${Math.floor(Math.random() * 10000)}`,
        careerId,
        category,
        message,
        metadata: JSON.stringify(metadata)
      }
    });
  }

  private async addAudit(careerId: string, category: string, message: string, metadata: Record<string, unknown>) {
    await this.writeAudit(this.prisma, careerId, category, message, metadata);
  }
}

const v2GameService = new V2GameService();
export default v2GameService;
