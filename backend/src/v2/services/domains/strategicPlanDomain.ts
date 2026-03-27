import { WeekPlanPayload } from '../../domain';

export interface StrategicPlanEffects {
  moraleDelta: number;
  boardDelta: number;
  fitnessTrendDelta: number;
  budgetDelta: number;
  playerDevelopmentDelta: number;
  playerFitnessDelta: number;
  playerFormDelta: number;
  injuryRisk: number;
}

export function deriveStrategicPlanEffects(
  plan: WeekPlanPayload,
  context: { operatingBalance: number; boardConfidence: number }
): StrategicPlanEffects {
  const effects: StrategicPlanEffects = {
    moraleDelta: 0,
    boardDelta: 0,
    fitnessTrendDelta: 0,
    budgetDelta: 0,
    playerDevelopmentDelta: 0,
    playerFitnessDelta: 0,
    playerFormDelta: 0,
    injuryRisk: 0
  };

  switch (plan.tacticalMentality) {
    case 'AGGRESSIVE':
      effects.moraleDelta += 1;
      effects.playerFormDelta += 2;
      effects.playerFitnessDelta -= 1;
      effects.injuryRisk += 0.04;
      break;
    case 'CAUTIOUS':
      effects.moraleDelta -= 1;
      effects.boardDelta += 1;
      effects.playerFormDelta -= 1;
      break;
    default:
      break;
  }

  switch (plan.rotationIntensity) {
    case 'HIGH':
      effects.fitnessTrendDelta += 2;
      effects.playerFitnessDelta += 2;
      effects.playerFormDelta -= 1;
      break;
    case 'LOW':
      effects.fitnessTrendDelta -= 2;
      effects.playerFitnessDelta -= 2;
      effects.playerFormDelta += 1;
      effects.injuryRisk += 0.03;
      break;
    default:
      effects.fitnessTrendDelta -= 1;
      effects.playerFitnessDelta -= 1;
      break;
  }

  switch (plan.trainingFocus) {
    case 'FITNESS':
      effects.fitnessTrendDelta += 2;
      effects.playerFitnessDelta += 3;
      effects.playerFormDelta -= 1;
      break;
    case 'TACTICAL':
      effects.playerFormDelta += 1;
      effects.boardDelta += 1;
      break;
    case 'ATTACKING':
      effects.moraleDelta += 1;
      effects.playerFormDelta += 2;
      effects.playerFitnessDelta -= 1;
      break;
    case 'DEFENSIVE':
      effects.playerFormDelta += 1;
      effects.boardDelta += 1;
      break;
    default:
      break;
  }

  switch (plan.transferStance) {
    case 'SELL_TO_BALANCE':
      effects.budgetDelta += 90000;
      effects.boardDelta += 2;
      effects.moraleDelta -= 1;
      break;
    case 'INVEST':
      effects.budgetDelta -= 110000;
      effects.moraleDelta += 1;
      if (context.operatingBalance < 150000) {
        effects.boardDelta -= 2;
      }
      if (context.boardConfidence < 45) {
        effects.boardDelta -= 1;
      }
      break;
    default:
      effects.budgetDelta += 15000;
      break;
  }

  switch (plan.scoutingPriority) {
    case 'LOCAL':
      effects.budgetDelta -= 8000;
      effects.playerDevelopmentDelta += 1;
      break;
    case 'NATIONAL':
      effects.budgetDelta -= 18000;
      effects.playerDevelopmentDelta += 2;
      effects.boardDelta += 1;
      break;
    case 'INTERNATIONAL':
      effects.budgetDelta -= 35000;
      effects.playerDevelopmentDelta += 3;
      effects.boardDelta += context.operatingBalance > 150000 ? 1 : -2;
      break;
    case 'YOUTH':
      effects.budgetDelta -= 22000;
      effects.playerDevelopmentDelta += 4;
      effects.moraleDelta += 1;
      effects.boardDelta += 1;
      break;
    default:
      break;
  }

  return effects;
}
