import { clamp } from '../../helpers';

export type ContractWarningRoleTier = 'CORE' | 'ROTATION' | 'FRINGE' | 'PROSPECT' | 'VETERAN';
export type ContractRenewalNegotiationOutcome = 'ACCEPT' | 'COUNTER' | 'REJECT';
export type ContractRenewalAcceptanceRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type ContractBoardPolicyLevel = 'NONE' | 'SOFT' | 'HARD';
export type BoardRiskLevel = 'STABLE' | 'WATCH' | 'PRESSURE' | 'CRITICAL';

export const MAX_CONTRACT_WARNING_NEGOTIATION_COUNTER_ROUNDS = 2;

export function resolveContractWarningRoleTier(
  ability: number,
  age: number
): ContractWarningRoleTier {
  if (age <= 21 && ability >= 68) {
    return 'PROSPECT';
  }
  if (age >= 31 && ability < 80) {
    return 'VETERAN';
  }
  if (ability >= 80) {
    return 'CORE';
  }
  if (ability >= 72) {
    return 'ROTATION';
  }
  return 'FRINGE';
}

export function assessContractWarningRenewalOffer(context: {
  roleTier: ContractWarningRoleTier;
  daysRemaining: number;
  ability: number;
  offeredIndex: number;
  packageCount: number;
  negotiationRound?: number;
  leverageMemoryScore?: number;
}): {
  requiredIndex: number;
  outcome: ContractRenewalNegotiationOutcome;
  acceptanceRisk: ContractRenewalAcceptanceRisk;
  acceptanceHint: string;
  severeGap: boolean;
  urgentKeyPlayer: boolean;
} {
  const safePackageCount = Math.max(1, Math.round(context.packageCount));
  const safeOfferedIndex = clamp(Math.round(context.offeredIndex), 0, safePackageCount - 1);
  const negotiationRound = Math.max(0, Math.round(context.negotiationRound ?? 0));
  const leverageMemoryScore = clamp(Math.round(context.leverageMemoryScore ?? 0), 0, 4);

  let requiredIndex = 1;
  if (context.roleTier === 'CORE') {
    requiredIndex = context.daysRemaining <= 45 ? 2 : 1;
  } else if (context.roleTier === 'PROSPECT') {
    requiredIndex = context.daysRemaining <= 60 ? 2 : 1;
  } else if (context.roleTier === 'ROTATION') {
    requiredIndex = context.daysRemaining <= 30 ? 2 : 1;
  } else if (context.roleTier === 'VETERAN' || context.roleTier === 'FRINGE') {
    requiredIndex = context.daysRemaining <= 21 ? 1 : 0;
  }
  if (context.ability >= 84 && requiredIndex < 2) {
    requiredIndex += 1;
  }
  if (leverageMemoryScore >= 2 && requiredIndex < safePackageCount - 1) {
    requiredIndex += 1;
  }
  requiredIndex = clamp(requiredIndex, 0, safePackageCount - 1);

  const severeGap = requiredIndex - safeOfferedIndex >= 2;
  const urgentKeyPlayer = (context.roleTier === 'CORE' || context.roleTier === 'PROSPECT') && context.daysRemaining <= 30;

  let outcome: ContractRenewalNegotiationOutcome;
  if (safeOfferedIndex >= requiredIndex) {
    outcome = 'ACCEPT';
  } else if (severeGap || urgentKeyPlayer || negotiationRound >= MAX_CONTRACT_WARNING_NEGOTIATION_COUNTER_ROUNDS) {
    outcome = 'REJECT';
  } else {
    outcome = 'COUNTER';
  }

  const overpayMargin = safeOfferedIndex - requiredIndex;
  let acceptanceRisk: ContractRenewalAcceptanceRisk;
  let acceptanceHint: string;

  if (outcome === 'ACCEPT') {
    if (overpayMargin >= 1) {
      acceptanceRisk = 'LOW';
      acceptanceHint = 'Strong package for current leverage. Acceptance is likely.';
    } else {
      acceptanceRisk = 'MEDIUM';
      acceptanceHint = negotiationRound >= 1
        ? 'At the current threshold after prior talks. Acceptance is possible, but leverage is tightening.'
        : 'At the expected threshold. Acceptance is plausible but not guaranteed long-term.';
    }
  } else if (outcome === 'COUNTER') {
    acceptanceRisk = negotiationRound >= 1 ? 'VERY_HIGH' : 'HIGH';
    acceptanceHint = negotiationRound >= 1
      ? 'Repeated low offers are pushing talks toward a breakdown. Another counter is possible, but leverage is worsening.'
      : 'Below expected terms. Agent is likely to counter rather than accept.';
  } else if (urgentKeyPlayer || severeGap || negotiationRound >= MAX_CONTRACT_WARNING_NEGOTIATION_COUNTER_ROUNDS) {
    acceptanceRisk = 'VERY_HIGH';
    acceptanceHint = negotiationRound >= MAX_CONTRACT_WARNING_NEGOTIATION_COUNTER_ROUNDS
      ? 'Negotiation patience is exhausted. Another low offer is likely to end talks.'
      : 'Significantly below leverage expectations. Talks may stall immediately.';
  } else {
    acceptanceRisk = 'HIGH';
    acceptanceHint = 'Offer is unlikely to be accepted without revised terms.';
  }

  if (leverageMemoryScore >= 1) {
    const memoryHint = leverageMemoryScore >= 2
      ? ' Agent remembers recent low offers and is holding a firmer line.'
      : ' Agent remembers the last talks and expects clearer intent.';
    acceptanceHint = `${acceptanceHint}${memoryHint}`;

    if (outcome === 'ACCEPT' && overpayMargin >= 1 && leverageMemoryScore >= 3 && acceptanceRisk === 'LOW') {
      acceptanceRisk = 'MEDIUM';
    }
  }

  return {
    requiredIndex,
    outcome,
    acceptanceRisk,
    acceptanceHint,
    severeGap,
    urgentKeyPlayer
  };
}

export function assessContractRenewalBoardPolicy(context: {
  roleTier: ContractWarningRoleTier;
  boardRiskLevel: BoardRiskLevel;
  clubBalance: number;
  budgetBalance: number;
  transferBudget: number;
  currentWeeklyWage: number;
  years: number;
  wageAdjustmentPct: number;
  ability: number;
  negotiationRound?: number;
}): {
  level: ContractBoardPolicyLevel;
  warning: string | null;
  projectedCost: number;
  nextWage: number;
  availableBudget: number;
} {
  const years = clamp(Math.round(context.years), 1, 5);
  const wageAdjustmentPct = clamp(Math.round(context.wageAdjustmentPct), -10, 35);
  const currentWage = Math.max(450, Math.round(context.currentWeeklyWage || 900));
  const nextWage = Math.max(450, Math.round(currentWage * (1 + wageAdjustmentPct / 100)));
  const wageDelta = nextWage - currentWage;
  const signingBonus = Math.round(Math.max(0, nextWage) * 3);
  const projectedCost = Math.max(0, Math.round(wageDelta * 12)) + signingBonus;

  const budgetBalance = Number(context.budgetBalance || 0);
  const operatingBalance = Number(context.clubBalance || 0) + budgetBalance;
  const transferHeadroom = Number(context.transferBudget || 0) + Math.max(0, budgetBalance);
  const availableBudget = Math.max(0, Math.min(operatingBalance, transferHeadroom));
  const negotiationRound = Math.max(0, Math.round(context.negotiationRound ?? 0));

  let level: ContractBoardPolicyLevel = 'NONE';
  const warnings: string[] = [];

  const spendRatio = availableBudget > 0 ? projectedCost / availableBudget : Number.POSITIVE_INFINITY;
  if (!Number.isFinite(spendRatio) || availableBudget <= 0) {
    level = 'HARD';
    warnings.push('Board hard cap: no contract budget headroom is available right now.');
  } else if (spendRatio >= 0.65) {
    level = 'HARD';
    warnings.push(`Board hard cap: projected cost (${projectedCost.toLocaleString()} EUR) is too large for current contract headroom.`);
  } else if (spendRatio >= 0.38) {
    level = 'SOFT';
    warnings.push('Board soft cap: this renewal would consume a large share of current contract headroom.');
  }

  if (context.boardRiskLevel === 'CRITICAL' || context.boardRiskLevel === 'PRESSURE') {
    const pressureHardPct = context.roleTier === 'CORE' ? 16 : context.roleTier === 'PROSPECT' ? 14 : 10;
    const pressureSoftPct = context.roleTier === 'CORE' ? 11 : context.roleTier === 'PROSPECT' ? 9 : 6;
    if (wageAdjustmentPct >= pressureHardPct) {
      level = 'HARD';
      warnings.push('Board hard cap: wage growth exceeds current wage-structure tolerance under board pressure.');
    } else if (wageAdjustmentPct >= pressureSoftPct && level !== 'HARD') {
      level = 'SOFT';
      warnings.push('Board soft cap: wage growth is above the preferred structure while job security is under pressure.');
    }
  }

  if ((context.roleTier === 'FRINGE' || context.roleTier === 'VETERAN') && years >= 3 && wageAdjustmentPct >= 5) {
    level = 'HARD';
    warnings.push('Board hard cap: long/high-cost deals for non-core roles are outside current wage policy.');
  } else if ((context.roleTier === 'FRINGE' || context.roleTier === 'VETERAN') && years >= 2 && wageAdjustmentPct >= 4 && level !== 'HARD') {
    level = 'SOFT';
    warnings.push('Board soft cap: deal length and wage uplift are above preferred terms for this squad role.');
  }

  if (context.ability <= 70 && wageAdjustmentPct >= 8) {
    level = 'HARD';
    warnings.push('Board hard cap: wage uplift is too aggressive relative to current ability level.');
  }

  if (negotiationRound >= 1 && level === 'SOFT') {
    warnings.push('Repeated negotiations may reduce board tolerance for another wage-structure exception.');
  }

  const warning = warnings.length > 0 ? warnings[0] : null;
  return {
    level,
    warning,
    projectedCost,
    nextWage,
    availableBudget
  };
}

export function resolveContractWarningAgentStance(context: {
  daysRemaining: number;
  age: number;
  ability: number;
  roleTier: ContractWarningRoleTier;
}): string {
  if (context.roleTier === 'CORE' && context.daysRemaining <= 30) {
    return 'Agent is pushing for a long-term commitment and a clear first-team status signal.';
  }
  if (context.roleTier === 'PROSPECT') {
    return 'Agent wants a development path with meaningful minutes and contract security.';
  }
  if (context.roleTier === 'VETERAN') {
    return 'Agent is open to a shorter bridge if role clarity is agreed.';
  }
  if (context.daysRemaining <= 45) {
    return 'Agent expects a concrete offer soon and is prepared to open outside talks.';
  }
  if (context.ability >= 76) {
    return 'Agent is testing market leverage and expects improved terms if you want to retain the player.';
  }
  return 'Agent mainly wants clarity on the club plan before the market window.';
}

export function resolveContractWarningBoardStance(
  boardRiskLevel: BoardRiskLevel,
  operatingBalance: number,
  roleTier: ContractWarningRoleTier
): string {
  if (boardRiskLevel === 'CRITICAL' || boardRiskLevel === 'PRESSURE') {
    if (roleTier === 'CORE' || roleTier === 'PROSPECT') {
      return 'Retain key pieces if possible, but avoid aggressive wage escalation while job security is under pressure.';
    }
    return 'Protect the wage structure and justify any renewal with clear squad value.';
  }

  if (operatingBalance > 300000 && (roleTier === 'CORE' || roleTier === 'PROSPECT')) {
    return 'Board is willing to support a stronger retention package for strategic players.';
  }
  if (boardRiskLevel === 'WATCH') {
    return 'Board supports retention, but expects disciplined contract terms and no panic offers.';
  }
  return 'Board is comfortable with a football-first decision as long as the deal stays within structure.';
}

export function buildContractWarningRenewalPackages(context: {
  daysRemaining: number;
  roleTier: ContractWarningRoleTier;
}): Array<{ years: number; wageAdjustmentPct: number; label: string }> {
  if (context.roleTier === 'CORE') {
    if (context.daysRemaining <= 30) {
      return [
        { years: 2, wageAdjustmentPct: 6, label: 'Offer 2-year extension (+6% wage)' },
        { years: 3, wageAdjustmentPct: 10, label: 'Offer 3-year priority extension (+10% wage)' },
        { years: 4, wageAdjustmentPct: 14, label: 'Offer 4-year cornerstone deal (+14% wage)' }
      ];
    }
    return [
      { years: 2, wageAdjustmentPct: 5, label: 'Offer 2-year extension (+5% wage)' },
      { years: 3, wageAdjustmentPct: 8, label: 'Offer 3-year security deal (+8% wage)' },
      { years: 4, wageAdjustmentPct: 11, label: 'Offer 4-year cornerstone deal (+11% wage)' }
    ];
  }

  if (context.roleTier === 'PROSPECT') {
    return [
      { years: 2, wageAdjustmentPct: 4, label: 'Offer 2-year development deal (+4% wage)' },
      { years: 3, wageAdjustmentPct: 7, label: 'Offer 3-year growth deal (+7% wage)' },
      { years: 4, wageAdjustmentPct: 10, label: 'Offer 4-year upside deal (+10% wage)' }
    ];
  }

  if (context.roleTier === 'VETERAN') {
    return [
      { years: 1, wageAdjustmentPct: 2, label: 'Offer 1-year veteran bridge (+2% wage)' },
      { years: 2, wageAdjustmentPct: 4, label: 'Offer 2-year extension (+4% wage)' },
      { years: 3, wageAdjustmentPct: 7, label: 'Offer 3-year loyalty deal (+7% wage)' }
    ];
  }

  if (context.roleTier === 'FRINGE') {
    return [
      { years: 1, wageAdjustmentPct: 1, label: 'Offer 1-year depth bridge (+1% wage)' },
      { years: 2, wageAdjustmentPct: 3, label: 'Offer 2-year depth deal (+3% wage)' },
      { years: 3, wageAdjustmentPct: 5, label: 'Offer 3-year value deal (+5% wage)' }
    ];
  }

  if (context.daysRemaining <= 30) {
    return [
      { years: 1, wageAdjustmentPct: 3, label: 'Offer 1-year bridge (+3% wage)' },
      { years: 2, wageAdjustmentPct: 6, label: 'Offer 2-year extension (+6% wage)' },
      { years: 3, wageAdjustmentPct: 10, label: 'Offer 3-year priority extension (+10% wage)' }
    ];
  }

  return [
    { years: 1, wageAdjustmentPct: 2, label: 'Offer 1-year bridge (+2% wage)' },
    { years: 2, wageAdjustmentPct: 5, label: 'Offer 2-year extension (+5% wage)' },
    { years: 3, wageAdjustmentPct: 8, label: 'Offer 3-year security deal (+8% wage)' }
  ];
}

export function resolveContractWarningReleaseCompensationWeeks(context: {
  ability: number;
  roleTier: ContractWarningRoleTier;
}): number {
  if (context.roleTier === 'CORE') {
    return 10;
  }
  if (context.roleTier === 'PROSPECT') {
    return 8;
  }
  if (context.roleTier === 'VETERAN') {
    return 4;
  }
  if (context.roleTier === 'FRINGE') {
    return 4;
  }
  if (context.ability >= 76) {
    return 8;
  }
  return 6;
}

export function buildContractWarningPromiseLabel(context: {
  daysRemaining: number;
  roleTier: ContractWarningRoleTier;
  boardRiskLevel: BoardRiskLevel;
}): string {
  if (context.daysRemaining <= 21) {
    return 'Promise a decision after the next match (high risk of agent pushback)';
  }
  if (context.boardRiskLevel === 'PRESSURE' || context.boardRiskLevel === 'CRITICAL') {
    return 'Delay with a short promise and reassess after the next match';
  }
  if (context.roleTier === 'PROSPECT') {
    return 'Promise a post-match development meeting before deciding';
  }
  return 'Promise a contract decision after the next match';
}

export function buildContractWarningReleaseLabel(context: {
  compensationWeeks: number;
  roleTier: ContractWarningRoleTier;
  boardRiskLevel: BoardRiskLevel;
}): string {
  if (context.roleTier === 'CORE') {
    return `Release now (${context.compensationWeeks} weeks compensation, major squad impact)`;
  }
  if (context.boardRiskLevel === 'PRESSURE' || context.boardRiskLevel === 'CRITICAL') {
    return `Release now (${context.compensationWeeks} weeks compensation, wage discipline option)`;
  }
  if (context.roleTier === 'FRINGE') {
    return `Release now (${context.compensationWeeks} weeks compensation, free squad slot)`;
  }
  return `Release now (${context.compensationWeeks} weeks compensation)`;
}

export function getContractWarningNegotiationRoundFromEventId(eventId: string): number {
  if (!eventId.includes(':contract:')) {
    return 0;
  }
  const numberedMatch = eventId.match(/:counter:(\d+)$/);
  if (numberedMatch) {
    const round = Number(numberedMatch[1]);
    return Number.isFinite(round) && round > 0 ? Math.round(round) : 0;
  }
  return 0;
}
