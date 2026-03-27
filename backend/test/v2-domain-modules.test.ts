import {
  V2_BENCH_PRIORITIES,
  V2_FORMATIONS,
  V2_LINEUP_POLICIES,
  V2_PRE_MATCH_INSTRUCTIONS
} from '../src/v2/domain';
import {
  buildAutoMatchSelection,
  buildMatchPrepSelectionWarnings,
  countMatchPrepGroups,
  MATCH_PREP_FORMATION_CONFIGS,
  resolveMatchPrepPayload,
  resolveMatchPrepPositionGroup
} from '../src/v2/services/domains/matchPrepDomain';
import {
  assessContractRenewalBoardPolicy,
  assessContractWarningRenewalOffer,
  getContractWarningNegotiationRoundFromEventId
} from '../src/v2/services/domains/contractWarningDomain';
import { deriveStrategicPlanEffects } from '../src/v2/services/domains/strategicPlanDomain';
import {
  buildClubOperationsFinanceSummary,
  buildDefaultClubOperationsLevels,
  getClubOperationUpgradeCost,
  resolveClubOperationsPerformanceModifiers
} from '../src/v2/services/domains/clubOperationsDomain';
import {
  buildSyntheticPlayerPayload,
  planControlledClubSquadBalanceRepairs
} from '../src/v2/services/domains/syntheticSquadDomain';

describe('V2 Domain Modules', () => {
  describe('matchPrepDomain', () => {
    it('normalizes payload ids and validates policies', () => {
      const prep = resolveMatchPrepPayload({
        formation: V2_FORMATIONS.FOUR_TWO_THREE_ONE,
        lineupPolicy: V2_LINEUP_POLICIES.BEST_XI,
        benchPriority: V2_BENCH_PRIORITIES.IMPACT,
        preMatchInstruction: V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS,
        startingPlayerIds: [11, '11', 12, 'bad', 13, 0, -1, 14],
        benchPlayerIds: [21, '21', 22, null, 23, 24],
        captainPlayerId: '12'
      } as unknown as Parameters<typeof resolveMatchPrepPayload>[0]);

      expect(prep.formation).toBe(V2_FORMATIONS.FOUR_TWO_THREE_ONE);
      expect(prep.lineupPolicy).toBe(V2_LINEUP_POLICIES.BEST_XI);
      expect(prep.benchPriority).toBe(V2_BENCH_PRIORITIES.IMPACT);
      expect(prep.preMatchInstruction).toBe(V2_PRE_MATCH_INSTRUCTIONS.HIGH_PRESS);
      expect(prep.startingPlayerIds).toEqual([11, 12, 13, 14]);
      expect(prep.benchPlayerIds).toEqual([21, 22, 23, 24]);
      expect(prep.captainPlayerId).toBe(12);
    });

    it('builds an auto selection that honors the requested formation and bench coverage', () => {
      const candidates = [
        { id: 1, position: 'GK', ability: 76, fitness: 92, group: resolveMatchPrepPositionGroup('GK') },
        { id: 2, position: 'GK', ability: 68, fitness: 88, group: resolveMatchPrepPositionGroup('GK') },
        { id: 3, position: 'RB', ability: 72, fitness: 92, group: resolveMatchPrepPositionGroup('RB') },
        { id: 4, position: 'LB', ability: 73, fitness: 90, group: resolveMatchPrepPositionGroup('LB') },
        { id: 5, position: 'CB', ability: 75, fitness: 91, group: resolveMatchPrepPositionGroup('CB') },
        { id: 6, position: 'CB', ability: 74, fitness: 89, group: resolveMatchPrepPositionGroup('CB') },
        { id: 7, position: 'DM', ability: 74, fitness: 90, group: resolveMatchPrepPositionGroup('DM') },
        { id: 8, position: 'CM', ability: 76, fitness: 88, group: resolveMatchPrepPositionGroup('CM') },
        { id: 9, position: 'AM', ability: 77, fitness: 87, group: resolveMatchPrepPositionGroup('AM') },
        { id: 10, position: 'RW', ability: 79, fitness: 90, group: resolveMatchPrepPositionGroup('RW') },
        { id: 11, position: 'LW', ability: 78, fitness: 91, group: resolveMatchPrepPositionGroup('LW') },
        { id: 12, position: 'ST', ability: 80, fitness: 89, group: resolveMatchPrepPositionGroup('ST') },
        { id: 13, position: 'CM', ability: 71, fitness: 90, group: resolveMatchPrepPositionGroup('CM') },
        { id: 14, position: 'ST', ability: 69, fitness: 86, group: resolveMatchPrepPositionGroup('ST') },
        { id: 15, position: 'RB', ability: 68, fitness: 85, group: resolveMatchPrepPositionGroup('RB') }
      ];

      const selection = buildAutoMatchSelection(
        candidates,
        V2_FORMATIONS.FOUR_FOUR_TWO,
        V2_LINEUP_POLICIES.BALANCED,
        V2_BENCH_PRIORITIES.BALANCED
      );

      const counts = countMatchPrepGroups(selection.startingPlayerIds, new Map(candidates.map((candidate) => [candidate.id, candidate])));
      expect(selection.startingPlayerIds).toHaveLength(11);
      expect(selection.benchPlayerIds).toHaveLength(4);
      expect(counts).toEqual(MATCH_PREP_FORMATION_CONFIGS[V2_FORMATIONS.FOUR_FOUR_TWO].starterTargets);
    });

    it('emits directive warnings for starters and bench players', () => {
      const warnings = buildMatchPrepSelectionWarnings(
        [10, 11],
        [20, 21],
        new Map([
          [10, { directiveCode: 'LIMITED_MINUTES', playerName: 'Starter A' }],
          [11, { directiveCode: 'DISCIPLINARY_NOTE', playerName: 'Starter B' }],
          [20, { directiveCode: 'REST_RECOVERY', playerName: 'Bench A' }],
          [21, { directiveCode: 'DISCIPLINARY_NOTE', playerName: 'Bench B' }]
        ])
      );

      expect(warnings.map((warning) => warning.code)).toEqual([
        'LIMITED_MINUTES_STARTER',
        'DISCIPLINARY_NOTE_STARTER',
        'REST_RECOVERY_BENCH',
        'DISCIPLINARY_NOTE_BENCH'
      ]);
    });
  });

  describe('strategicPlanDomain', () => {
    it('derives deterministic club and player effects from a week plan', () => {
      const effects = deriveStrategicPlanEffects(
        {
          trainingFocus: 'ATTACKING',
          rotationIntensity: 'LOW',
          tacticalMentality: 'AGGRESSIVE',
          transferStance: 'INVEST',
          scoutingPriority: 'YOUTH'
        },
        {
          operatingBalance: 120000,
          boardConfidence: 42
        }
      );

      expect(effects.moraleDelta).toBe(4);
      expect(effects.boardDelta).toBe(-2);
      expect(effects.fitnessTrendDelta).toBe(-2);
      expect(effects.budgetDelta).toBe(-132000);
      expect(effects.playerDevelopmentDelta).toBe(4);
      expect(effects.playerFitnessDelta).toBe(-4);
      expect(effects.playerFormDelta).toBe(5);
      expect(effects.injuryRisk).toBeCloseTo(0.07, 5);
    });
  });

  describe('contractWarningDomain', () => {
    it('assesses renewal acceptance, counters, and board policy caps', () => {
      const counter = assessContractWarningRenewalOffer({
        roleTier: 'CORE',
        daysRemaining: 50,
        ability: 82,
        offeredIndex: 0,
        packageCount: 3,
        negotiationRound: 0
      });
      const reject = assessContractWarningRenewalOffer({
        roleTier: 'CORE',
        daysRemaining: 20,
        ability: 85,
        offeredIndex: 0,
        packageCount: 3,
        negotiationRound: 2
      });
      const accept = assessContractWarningRenewalOffer({
        roleTier: 'ROTATION',
        daysRemaining: 80,
        ability: 74,
        offeredIndex: 1,
        packageCount: 3,
        negotiationRound: 0
      });
      const boardPolicy = assessContractRenewalBoardPolicy({
        roleTier: 'FRINGE',
        boardRiskLevel: 'PRESSURE',
        clubBalance: 80000,
        budgetBalance: 10000,
        transferBudget: 25000,
        currentWeeklyWage: 1600,
        years: 3,
        wageAdjustmentPct: 8,
        ability: 68,
        negotiationRound: 1
      });

      expect(counter.outcome).toBe('COUNTER');
      expect(counter.acceptanceRisk).toBe('HIGH');
      expect(reject.outcome).toBe('REJECT');
      expect(reject.acceptanceRisk).toBe('VERY_HIGH');
      expect(accept.outcome).toBe('ACCEPT');
      expect(accept.acceptanceRisk).toBe('MEDIUM');
      expect(boardPolicy.level).toBe('HARD');
      expect(boardPolicy.warning).toMatch(/Board .* cap/i);
    });

    it('parses negotiation rounds from counter event ids', () => {
      expect(getContractWarningNegotiationRoundFromEventId('career:ev:1:contract:99')).toBe(0);
      expect(getContractWarningNegotiationRoundFromEventId('career:ev:1:contract:99:counter:2')).toBe(2);
    });
  });

  describe('syntheticSquadDomain', () => {
    it('builds sane synthetic player payloads and repairs gk-heavy squads with outfield players', () => {
      const deterministicRandom = () => 0.42;
      const player = buildSyntheticPlayerPayload(77, deterministicRandom, {
        profile: 'starter',
        positionHint: 'ST',
        nationality: 'Netherlands'
      });

      expect(player.currentClubId).toBe(77);
      expect(player.position).toBe('ST');
      expect(player.currentAbility).toBeGreaterThanOrEqual(40);
      expect(player.potentialAbility).toBeGreaterThanOrEqual(player.currentAbility ?? 0);
      expect(player.weeklyWage).toBeGreaterThan(0);
      expect(player.contractEnd).toBeInstanceOf(Date);

      const repairs = planControlledClubSquadBalanceRepairs({
        careerId: 'career-repair',
        controlledClubId: 77,
        players: Array.from({ length: 18 }, (_, index) => ({
          id: index + 1,
          position: 'GK'
        }))
      });

      expect(repairs.length).toBeGreaterThan(0);
      expect(repairs.some((repair) => repair.position !== 'GK')).toBe(true);
    });
  });

  describe('clubOperationsDomain', () => {
    it('builds finance summaries and performance modifiers from club operation levels', () => {
      const levels = {
        ...buildDefaultClubOperationsLevels(),
        TRAINING_COMPLEX: 3,
        MEDICAL_DEPARTMENT: 4,
        RECRUITMENT_NETWORK: 2,
        COMMERCIAL_TEAM: 3
      };

      const summary = buildClubOperationsFinanceSummary(levels);
      const modifiers = resolveClubOperationsPerformanceModifiers(levels);

      expect(getClubOperationUpgradeCost('TRAINING_COMPLEX', 3)).toBe(200000);
      expect(summary.operations).toHaveLength(4);
      expect(summary.operations.find((operation) => operation.key === 'COMMERCIAL_TEAM')?.level).toBe(3);
      expect(summary.projectedWeeklyCommercialIncome).toBe(32000);
      expect(summary.totalWeeklyOperatingCost).toBe(35500);
      expect(summary.projectedWeeklyNetImpact).toBe(-3500);
      expect(modifiers.trainingFitnessBonus).toBe(1);
      expect(modifiers.trainingDevelopmentBonus).toBe(1);
      expect(modifiers.medicalRecoveryBonus).toBe(1);
      expect(modifiers.scoutingConfidenceBonus).toBe(3);
      expect(modifiers.postMatchFatigueRelief).toBe(1);
      expect(modifiers.injuryRiskDelta).toBeCloseTo(-0.016, 5);
    });
  });
});
