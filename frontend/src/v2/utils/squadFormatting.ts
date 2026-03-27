import {
  ActivePlayerDirectiveCode,
  ActivePlayerMedicalPlanCode,
  DevelopmentPlanFocus,
  DevelopmentPlanTarget,
  RetrainablePosition,
  SquadRoleAssignment
} from '../contracts';
import { SquadPlayer, SquadPlayerProfile } from '../types';

export function formatMoney(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  return `EUR ${Math.round(value).toLocaleString()}`;
}

export function formatContractEnd(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export function formatAge(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-';
  }
  return Math.round(value);
}

export function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function formatContractTime(daysRemaining: number | null, yearsRemaining: number) {
  if (daysRemaining === null) {
    return 'No expiry date';
  }
  if (daysRemaining <= 0) {
    return 'Expires now';
  }
  return `${daysRemaining}d (${Math.max(0, Math.round(yearsRemaining))}y)`;
}

export function formatAvailability(row: SquadPlayer) {
  if (row.isInjured) return `Injured (${row.injuryWeeks}w)`;
  if (row.isSuspended) return 'Suspended';
  if (row.eligibilityCode === 'OVERAGE_LIMIT') return 'Ineligible';
  if (row.eligibilityCode === 'UNREGISTERED' || row.isEligibleForNextFixture === false) return 'Unregistered';
  return 'Available';
}

export function formatRoleTier(role: SquadPlayerProfile['squadContext']['roleTier']) {
  const labels: Record<SquadPlayerProfile['squadContext']['roleTier'], string> = {
    STAR: 'Star',
    STARTER: 'Starter',
    ROTATION: 'Rotation',
    DEPTH: 'Depth',
    PROSPECT: 'Prospect'
  };
  return labels[role] || role;
}

export function formatAssignedRole(role?: SquadRoleAssignment | null) {
  if (!role) return 'Unassigned';
  if (role === 'STARTER') return 'Starter';
  if (role === 'ROTATION') return 'Rotation';
  return 'Depth';
}

export function formatExpectation(expectation: SquadPlayerProfile['squadContext']['playingTimeExpectation']) {
  const labels: Record<SquadPlayerProfile['squadContext']['playingTimeExpectation'], string> = {
    KEY_PLAYER: 'Key Player',
    IMPORTANT: 'Important',
    ROTATION: 'Rotation',
    SPORADIC: 'Sporadic',
    DEVELOPMENT: 'Development'
  };
  return labels[expectation] || expectation;
}

export function formatPendingStage(stage: NonNullable<SquadPlayerProfile['pendingContractTalk']>['stage']) {
  if (stage === 'COUNTER') return 'Counter Demand';
  if (stage === 'FALLOUT') return 'Fallout';
  return 'Warning';
}

export function riskColor(risk?: 'STABLE' | 'WATCH' | 'CRITICAL') {
  if (risk === 'CRITICAL') return '#ff8f8f';
  if (risk === 'WATCH') return '#ffd37a';
  if (risk === 'STABLE') return '#9ef3c8';
  return '#d0f0e2';
}

export function riskBadgeClass(risk: 'STABLE' | 'WATCH' | 'CRITICAL') {
  if (risk === 'CRITICAL') return 'v2-badge--danger';
  if (risk === 'WATCH') return 'v2-badge--warning';
  return 'v2-badge--success';
}

export function roleBadgeClass(role: SquadPlayerProfile['squadContext']['roleTier']) {
  if (role === 'STAR') return 'v2-badge--high';
  if (role === 'PROSPECT') return 'v2-badge--medium';
  if (role === 'STARTER') return 'v2-badge--success';
  if (role === 'ROTATION') return 'v2-badge--low';
  return '';
}

export function pendingStageBadgeClass(stage: NonNullable<SquadPlayerProfile['pendingContractTalk']>['stage']) {
  if (stage === 'FALLOUT') return 'v2-badge--danger';
  if (stage === 'COUNTER') return 'v2-badge--warning';
  return 'v2-badge--medium';
}

export function playingTimePromiseBadgeClass(status: NonNullable<SquadPlayerProfile['playingTimePromise']>['status']) {
  if (status === 'OVERDUE') return 'v2-badge--danger';
  if (status === 'DUE') return 'v2-badge--warning';
  return 'v2-badge--success';
}

export function formatDevelopmentFocus(focus: DevelopmentPlanFocus) {
  const labels: Record<DevelopmentPlanFocus, string> = {
    TECHNICAL: 'Technical',
    PHYSICAL: 'Physical',
    TACTICAL: 'Tactical',
    MENTAL: 'Mental'
  };
  return labels[focus] || focus;
}

export function formatDevelopmentTarget(target: DevelopmentPlanTarget) {
  const labels: Record<DevelopmentPlanTarget, string> = {
    FIRST_TEAM_PUSH: 'First-Team Push',
    MATCH_SHARPNESS: 'Match Sharpness',
    LONG_TERM_UPSIDE: 'Long-Term Upside',
    INJURY_PREVENTION: 'Injury Prevention'
  };
  return labels[target] || target;
}

export function formatPlayerStatusDirectiveLabel(directiveCode: ActivePlayerDirectiveCode) {
  if (directiveCode === 'REST_RECOVERY') return 'Rest & Recovery';
  if (directiveCode === 'LIMITED_MINUTES') return 'Limited Minutes';
  return 'Disciplinary Note';
}

export function formatMedicalPlanLabel(planCode: ActivePlayerMedicalPlanCode) {
  if (planCode === 'REHAB_CONSERVATIVE') return 'Conservative Rehab';
  if (planCode === 'PHASED_RETURN') return 'Phased Return';
  if (planCode === 'RECOVERY_FOCUS') return 'Recovery Focus';
  if (planCode === 'INJURY_PREVENTION') return 'Injury Prevention';
  return 'Match Sharpness';
}

export function formatMedicalAvailabilityRecommendation(recommendation: SquadPlayerProfile['medical']['availabilityRecommendation']) {
  if (recommendation === 'NO_SELECTION') return 'No Selection';
  if (recommendation === 'REST_RECOVERY') return 'Rest & Recovery';
  if (recommendation === 'LIMITED_MINUTES') return 'Limit Minutes';
  return 'Fully Available';
}

export function formatMedicalRehabStatus(status: SquadPlayerProfile['medical']['rehabStatus']) {
  if (status === 'REHAB') return 'In Rehab';
  if (status === 'RETURNING') return 'Returning';
  if (status === 'MONITOR') return 'Monitor';
  return 'Fit';
}

export function medicalRiskBadgeClass(risk: SquadPlayerProfile['medical']['workloadRisk']) {
  if (risk === 'CRITICAL') return 'v2-badge--danger';
  if (risk === 'HIGH') return 'v2-badge--warning';
  if (risk === 'MEDIUM') return 'v2-badge--medium';
  return 'v2-badge--success';
}

export function formatRetrainingPosition(position: string | null | undefined) {
  const normalized = String(position || '').trim().toUpperCase();
  const labels: Record<string, string> = {
    GK: 'GK',
    CB: 'CB',
    LB: 'LB',
    RB: 'RB',
    LWB: 'LWB',
    RWB: 'RWB',
    DM: 'DM',
    CM: 'CM',
    AM: 'AM',
    LW: 'LW',
    RW: 'RW',
    CF: 'CF',
    ST: 'ST'
  };
  return labels[normalized] || normalized || '-';
}

export function registrationBadgeClass(code: SquadPlayerProfile['registration']['eligibilityCode']) {
  if (code === 'ELIGIBLE') return 'v2-badge--success';
  if (code === 'INJURED' || code === 'SUSPENDED') return 'v2-badge--warning';
  return 'v2-badge--danger';
}

export function retrainingReadinessBadgeClass(readiness: NonNullable<SquadPlayerProfile['retraining']>['readiness']) {
  if (readiness === 'READY') return 'v2-badge--success';
  if (readiness === 'EMERGENCY_COVER') return 'v2-badge--warning';
  return 'v2-badge--low';
}

export function recommendedRetrainingTarget(position: string | null | undefined): RetrainablePosition {
  const normalized = String(position || '').trim().toUpperCase();
  if (normalized === 'LB') return 'LWB';
  if (normalized === 'RB') return 'RWB';
  if (normalized === 'CB') return 'DM';
  if (normalized === 'DM') return 'CM';
  if (normalized === 'CM') return 'AM';
  if (normalized === 'AM') return 'CM';
  if (normalized === 'LW') return 'RW';
  if (normalized === 'RW') return 'LW';
  if (normalized === 'CF') return 'ST';
  if (normalized === 'ST') return 'CF';
  if (normalized === 'GK') return 'GK';
  return 'CM';
}

export function recommendedDevelopmentFocus(profile: SquadPlayerProfile): DevelopmentPlanFocus {
  if (profile.availability.isInjured) return 'PHYSICAL';
  if (profile.squadContext.roleTier === 'PROSPECT') return 'TECHNICAL';
  if (profile.squadContext.roleTier === 'STAR') return 'TACTICAL';
  if ((profile.position || '').toUpperCase().includes('GK')) return 'MENTAL';
  return 'TACTICAL';
}

export function recommendedDevelopmentTarget(profile: SquadPlayerProfile): DevelopmentPlanTarget {
  if (profile.availability.isInjured) return 'INJURY_PREVENTION';
  if (profile.squadContext.roleTier === 'PROSPECT') return 'LONG_TERM_UPSIDE';
  if (profile.squadContext.roleTier === 'DEPTH' || profile.squadContext.roleTier === 'ROTATION') return 'FIRST_TEAM_PUSH';
  return 'MATCH_SHARPNESS';
}

export function formatHistoryTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatPromiseTimelineAction(action: NonNullable<SquadPlayerProfile['recentHistory']['promiseTimeline'][number]>['action']) {
  if (action === 'CREATE') return 'Promise Created';
  if (action === 'HONOR') return 'Promise Honored';
  if (action === 'REAFFIRM') return 'Promise Reaffirmed';
  return 'Promise Withdrawn';
}

export function formatPromiseKind(kind: NonNullable<SquadPlayerProfile['recentHistory']['promiseTimeline'][number]>['promiseKind']) {
  if (kind === 'BENCH_WINDOW') return 'Bench Window';
  return 'Promise';
}

export function formatPromiseSourceAction(sourceAction: string) {
  const normalized = String(sourceAction || '').trim().toUpperCase();
  if (normalized === 'SQUAD_ROLE_ASSIGNMENT') return 'Role assignment';
  if (normalized === 'PLAYTIME_PROMISE_PROMOTE') return 'Inbox promote';
  if (normalized === 'PLAYTIME_PROMISE_CLOSE') return 'Inbox withdraw';
  if (normalized === 'MATCHDAY_USAGE') return 'Matchday usage';
  if (normalized === 'WEEKLY_PROMISE_CHECK') return 'Weekly check';
  return sourceAction;
}

export function formatRetrainingHistoryAction(action: NonNullable<SquadPlayerProfile['recentHistory']['retrainingChanges'][number]>['action']) {
  if (action === 'SET') return 'Retraining Set';
  if (action === 'PROGRESS') return 'Progress Update';
  if (action === 'COMPLETE') return 'Retraining Complete';
  return 'Retraining Cleared';
}

export function formatMedicalHistoryAction(action: NonNullable<SquadPlayerProfile['recentHistory']['medicalPlanChanges'][number]>['action']) {
  if (action === 'SET') return 'Medical Plan Set';
  return 'Medical Plan Cleared';
}
