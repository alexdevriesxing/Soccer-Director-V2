export const CLUB_OPERATION_KEYS = [
  'TRAINING_COMPLEX',
  'MEDICAL_DEPARTMENT',
  'RECRUITMENT_NETWORK',
  'COMMERCIAL_TEAM'
] as const;

export type ClubOperationKey = typeof CLUB_OPERATION_KEYS[number];

export interface ClubOperationsLevels {
  TRAINING_COMPLEX: number;
  MEDICAL_DEPARTMENT: number;
  RECRUITMENT_NETWORK: number;
  COMMERCIAL_TEAM: number;
}

export interface ClubOperationsPerformanceModifiers {
  trainingFitnessBonus: number;
  trainingDevelopmentBonus: number;
  postMatchFatigueRelief: number;
  injuryRiskDelta: number;
  medicalRecoveryBonus: number;
  medicalFitnessBonus: number;
  scoutingConfidenceBonus: number;
  scoutingFitBonus: number;
  totalWeeklyOperatingCost: number;
  projectedWeeklyCommercialIncome: number;
  projectedWeeklyNetImpact: number;
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

const MAX_LEVEL = 5;

const DEFAULT_LEVELS: ClubOperationsLevels = {
  TRAINING_COMPLEX: 1,
  MEDICAL_DEPARTMENT: 1,
  RECRUITMENT_NETWORK: 1,
  COMMERCIAL_TEAM: 1
};

const OPERATION_LABELS: Record<ClubOperationKey, string> = {
  TRAINING_COMPLEX: 'Training Complex',
  MEDICAL_DEPARTMENT: 'Medical Department',
  RECRUITMENT_NETWORK: 'Recruitment Network',
  COMMERCIAL_TEAM: 'Commercial Team'
};

function clampLevel(value: number | null | undefined) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(1, Math.min(MAX_LEVEL, Math.round(Number(value))));
}

function getWeeklyOperatingCostFor(key: ClubOperationKey, level: number) {
  const extraLevels = Math.max(0, clampLevel(level) - 1);
  switch (key) {
    case 'TRAINING_COMPLEX':
      return extraLevels * 4000;
    case 'MEDICAL_DEPARTMENT':
      return extraLevels * 5000;
    case 'RECRUITMENT_NETWORK':
      return extraLevels * 3500;
    case 'COMMERCIAL_TEAM':
      return extraLevels * 4500;
    default:
      return 0;
  }
}

export function buildDefaultClubOperationsLevels(): ClubOperationsLevels {
  return { ...DEFAULT_LEVELS };
}

export function normalizeClubOperationsLevels(
  levels?: Partial<Record<ClubOperationKey, number>> | null
): ClubOperationsLevels {
  return {
    TRAINING_COMPLEX: clampLevel(levels?.TRAINING_COMPLEX),
    MEDICAL_DEPARTMENT: clampLevel(levels?.MEDICAL_DEPARTMENT),
    RECRUITMENT_NETWORK: clampLevel(levels?.RECRUITMENT_NETWORK),
    COMMERCIAL_TEAM: clampLevel(levels?.COMMERCIAL_TEAM)
  };
}

export function normalizeClubOperationKey(value: string | null | undefined): ClubOperationKey | null {
  const normalized = String(value || '').trim().toUpperCase();
  return CLUB_OPERATION_KEYS.find((key) => key === normalized) ?? null;
}

export function getClubOperationLabel(key: ClubOperationKey) {
  return OPERATION_LABELS[key];
}

export function getClubOperationUpgradeCost(key: ClubOperationKey, currentLevel: number): number | null {
  const level = clampLevel(currentLevel);
  if (level >= MAX_LEVEL) {
    return null;
  }

  switch (key) {
    case 'TRAINING_COMPLEX':
      return 90000 + ((level - 1) * 55000);
    case 'MEDICAL_DEPARTMENT':
      return 70000 + ((level - 1) * 50000);
    case 'RECRUITMENT_NETWORK':
      return 65000 + ((level - 1) * 45000);
    case 'COMMERCIAL_TEAM':
      return 80000 + ((level - 1) * 60000);
    default:
      return null;
  }
}

export function resolveClubOperationsPerformanceModifiers(levelsInput: ClubOperationsLevels): ClubOperationsPerformanceModifiers {
  const levels = normalizeClubOperationsLevels(levelsInput);
  const trainingExtra = Math.max(0, levels.TRAINING_COMPLEX - 1);
  const medicalExtra = Math.max(0, levels.MEDICAL_DEPARTMENT - 1);
  const recruitmentExtra = Math.max(0, levels.RECRUITMENT_NETWORK - 1);
  const commercialExtra = Math.max(0, levels.COMMERCIAL_TEAM - 1);

  const totalWeeklyOperatingCost = CLUB_OPERATION_KEYS.reduce((sum, key) => (
    sum + getWeeklyOperatingCostFor(key, levels[key])
  ), 0);
  const projectedWeeklyCommercialIncome = commercialExtra * 16000;

  return {
    trainingFitnessBonus: trainingExtra >= 1 ? 1 : 0,
    trainingDevelopmentBonus: trainingExtra >= 2 ? 1 + (trainingExtra >= 4 ? 1 : 0) : 0,
    postMatchFatigueRelief: trainingExtra >= 1 ? 1 + (trainingExtra >= 4 ? 1 : 0) : 0,
    injuryRiskDelta: -((trainingExtra * 0.002) + (medicalExtra * 0.004)),
    medicalRecoveryBonus: medicalExtra >= 2 ? 1 + (medicalExtra >= 4 ? 1 : 0) : 0,
    medicalFitnessBonus: medicalExtra >= 1 ? 1 : 0,
    scoutingConfidenceBonus: recruitmentExtra * 3,
    scoutingFitBonus: recruitmentExtra >= 3 ? 2 : recruitmentExtra >= 1 ? 1 : 0,
    totalWeeklyOperatingCost,
    projectedWeeklyCommercialIncome,
    projectedWeeklyNetImpact: projectedWeeklyCommercialIncome - totalWeeklyOperatingCost
  };
}

function describeCurrentEffect(key: ClubOperationKey, level: number, modifiers: ClubOperationsPerformanceModifiers) {
  switch (key) {
    case 'TRAINING_COMPLEX':
      return level <= 1
        ? 'Base training setup. No specialist facility boost yet.'
        : `Weekly fitness +${modifiers.trainingFitnessBonus}, development +${modifiers.trainingDevelopmentBonus}, fatigue relief ${modifiers.postMatchFatigueRelief}.`;
    case 'MEDICAL_DEPARTMENT':
      return level <= 1
        ? 'Standard physio support. Recovery is handled without extra department lift.'
        : `Recovery bonus ${modifiers.medicalRecoveryBonus}, injury-risk shift ${Math.round(modifiers.injuryRiskDelta * 1000) / 10}%, weekly fitness +${modifiers.medicalFitnessBonus}.`;
    case 'RECRUITMENT_NETWORK':
      return level <= 1
        ? 'Basic scouting coverage with no specialist recruitment lift.'
        : `Scouting confidence +${modifiers.scoutingConfidenceBonus}, fit grading +${modifiers.scoutingFitBonus}.`;
    case 'COMMERCIAL_TEAM':
      return level <= 1
        ? 'No active commercial growth program beyond the base club footprint.'
        : `Weekly commercial income +EUR ${modifiers.projectedWeeklyCommercialIncome.toLocaleString()}, net weekly impact EUR ${modifiers.projectedWeeklyNetImpact.toLocaleString()}.`;
    default:
      return '';
  }
}

function describeNextLevelEffect(key: ClubOperationKey, currentLevels: ClubOperationsLevels) {
  const currentLevel = currentLevels[key];
  if (currentLevel >= MAX_LEVEL) {
    return null;
  }

  const nextLevels = {
    ...currentLevels,
    [key]: currentLevel + 1
  };
  const nextModifiers = resolveClubOperationsPerformanceModifiers(nextLevels);
  switch (key) {
    case 'TRAINING_COMPLEX':
      return `Next level adds weekly fitness support and reduces post-match fatigue pressure.`;
    case 'MEDICAL_DEPARTMENT':
      return `Next level strengthens injury prevention and accelerates rehab handling.`;
    case 'RECRUITMENT_NETWORK':
      return `Next level raises report confidence and improves fit evaluation quality.`;
    case 'COMMERCIAL_TEAM':
      return `Next level lifts weekly commercial income to EUR ${nextModifiers.projectedWeeklyCommercialIncome.toLocaleString()}.`;
    default:
      return null;
  }
}

export function buildClubOperationsFinanceSummary(levelsInput: ClubOperationsLevels): ClubOperationsFinanceSummary {
  const levels = normalizeClubOperationsLevels(levelsInput);
  const modifiers = resolveClubOperationsPerformanceModifiers(levels);

  return {
    operations: CLUB_OPERATION_KEYS.map((key) => ({
      key,
      label: getClubOperationLabel(key),
      level: levels[key],
      maxLevel: MAX_LEVEL,
      upgradeCost: getClubOperationUpgradeCost(key, levels[key]),
      weeklyOperatingCost: getWeeklyOperatingCostFor(key, levels[key]),
      currentEffectSummary: describeCurrentEffect(key, levels[key], modifiers),
      nextLevelEffectSummary: describeNextLevelEffect(key, levels),
      canUpgrade: levels[key] < MAX_LEVEL
    })),
    totalWeeklyOperatingCost: modifiers.totalWeeklyOperatingCost,
    projectedWeeklyCommercialIncome: modifiers.projectedWeeklyCommercialIncome,
    projectedWeeklyNetImpact: modifiers.projectedWeeklyNetImpact
  };
}
