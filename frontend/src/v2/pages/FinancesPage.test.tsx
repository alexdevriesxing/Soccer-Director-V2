import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import FinancesPage from './FinancesPage';
import {
  getFinances,
  getTransferMarket,
  requestTransferScoutReport,
  respondTransferOffer,
  sellTransfer,
  submitTransferOffer,
  triggerLoanBuyOption,
  upgradeClubOperation,
  updateTransferShortlist
} from '../api';
import {
  FinanceSnapshot,
  TransferMarketPayload,
  TransferMarketTarget,
  TransferNegotiationSummary,
  TransferScoutingReport
} from '../types';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getFinances: jest.fn(),
  getTransferMarket: jest.fn(),
  requestTransferScoutReport: jest.fn(),
  respondTransferOffer: jest.fn(),
  sellTransfer: jest.fn(),
  submitTransferOffer: jest.fn(),
  triggerLoanBuyOption: jest.fn(),
  upgradeClubOperation: jest.fn(),
  updateTransferShortlist: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockGetFinances = getFinances as jest.MockedFunction<typeof getFinances>;
const mockGetTransferMarket = getTransferMarket as jest.MockedFunction<typeof getTransferMarket>;
const mockRequestTransferScoutReport = requestTransferScoutReport as jest.MockedFunction<typeof requestTransferScoutReport>;
const mockRespondTransferOffer = respondTransferOffer as jest.MockedFunction<typeof respondTransferOffer>;
const mockSellTransfer = sellTransfer as jest.MockedFunction<typeof sellTransfer>;
const mockSubmitTransferOffer = submitTransferOffer as jest.MockedFunction<typeof submitTransferOffer>;
const mockTriggerLoanBuyOption = triggerLoanBuyOption as jest.MockedFunction<typeof triggerLoanBuyOption>;
const mockUpgradeClubOperation = upgradeClubOperation as jest.MockedFunction<typeof upgradeClubOperation>;
const mockUpdateTransferShortlist = updateTransferShortlist as jest.MockedFunction<typeof updateTransferShortlist>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

function makeClubOperations(levelOverrides?: Partial<Record<'TRAINING_COMPLEX' | 'MEDICAL_DEPARTMENT' | 'RECRUITMENT_NETWORK' | 'COMMERCIAL_TEAM', number>>) {
  const levels = {
    TRAINING_COMPLEX: 1,
    MEDICAL_DEPARTMENT: 1,
    RECRUITMENT_NETWORK: 1,
    COMMERCIAL_TEAM: 1,
    ...levelOverrides
  };

  const operations = [
    {
      key: 'TRAINING_COMPLEX' as const,
      label: 'Training Complex',
      level: levels.TRAINING_COMPLEX,
      maxLevel: 5,
      upgradeCost: levels.TRAINING_COMPLEX >= 5 ? null : 90000 + ((levels.TRAINING_COMPLEX - 1) * 55000),
      weeklyOperatingCost: Math.max(0, levels.TRAINING_COMPLEX - 1) * 4000,
      currentEffectSummary: levels.TRAINING_COMPLEX <= 1
        ? 'Base training setup. No specialist facility boost yet.'
        : 'Weekly fitness +1, development +0, fatigue relief 1.',
      nextLevelEffectSummary: levels.TRAINING_COMPLEX >= 5 ? null : 'Next level adds weekly fitness support and reduces post-match fatigue pressure.',
      canUpgrade: levels.TRAINING_COMPLEX < 5
    },
    {
      key: 'MEDICAL_DEPARTMENT' as const,
      label: 'Medical Department',
      level: levels.MEDICAL_DEPARTMENT,
      maxLevel: 5,
      upgradeCost: levels.MEDICAL_DEPARTMENT >= 5 ? null : 70000 + ((levels.MEDICAL_DEPARTMENT - 1) * 50000),
      weeklyOperatingCost: Math.max(0, levels.MEDICAL_DEPARTMENT - 1) * 5000,
      currentEffectSummary: levels.MEDICAL_DEPARTMENT <= 1
        ? 'Standard physio support. Recovery is handled without extra department lift.'
        : 'Recovery bonus 1, injury-risk shift -0.8%, weekly fitness +1.',
      nextLevelEffectSummary: levels.MEDICAL_DEPARTMENT >= 5 ? null : 'Next level strengthens injury prevention and accelerates rehab handling.',
      canUpgrade: levels.MEDICAL_DEPARTMENT < 5
    },
    {
      key: 'RECRUITMENT_NETWORK' as const,
      label: 'Recruitment Network',
      level: levels.RECRUITMENT_NETWORK,
      maxLevel: 5,
      upgradeCost: levels.RECRUITMENT_NETWORK >= 5 ? null : 65000 + ((levels.RECRUITMENT_NETWORK - 1) * 45000),
      weeklyOperatingCost: Math.max(0, levels.RECRUITMENT_NETWORK - 1) * 3500,
      currentEffectSummary: levels.RECRUITMENT_NETWORK <= 1
        ? 'Basic scouting coverage with no specialist recruitment lift.'
        : 'Scouting confidence +3, fit grading +1.',
      nextLevelEffectSummary: levels.RECRUITMENT_NETWORK >= 5 ? null : 'Next level raises report confidence and improves fit evaluation quality.',
      canUpgrade: levels.RECRUITMENT_NETWORK < 5
    },
    {
      key: 'COMMERCIAL_TEAM' as const,
      label: 'Commercial Team',
      level: levels.COMMERCIAL_TEAM,
      maxLevel: 5,
      upgradeCost: levels.COMMERCIAL_TEAM >= 5 ? null : 80000 + ((levels.COMMERCIAL_TEAM - 1) * 60000),
      weeklyOperatingCost: Math.max(0, levels.COMMERCIAL_TEAM - 1) * 4500,
      currentEffectSummary: levels.COMMERCIAL_TEAM <= 1
        ? 'No active commercial growth program beyond the base club footprint.'
        : `Weekly commercial income +EUR ${(Math.max(0, levels.COMMERCIAL_TEAM - 1) * 16000).toLocaleString()}, net weekly impact EUR ${((Math.max(0, levels.COMMERCIAL_TEAM - 1) * 16000) - (Math.max(0, levels.COMMERCIAL_TEAM - 1) * 4500)).toLocaleString()}.`,
      nextLevelEffectSummary: levels.COMMERCIAL_TEAM >= 5 ? null : `Next level lifts weekly commercial income to EUR ${(Math.max(0, levels.COMMERCIAL_TEAM) * 16000).toLocaleString()}.`,
      canUpgrade: levels.COMMERCIAL_TEAM < 5
    }
  ];

  const totalWeeklyOperatingCost = operations.reduce((sum, operation) => sum + operation.weeklyOperatingCost, 0);
  const projectedWeeklyCommercialIncome = Math.max(0, levels.COMMERCIAL_TEAM - 1) * 16000;
  return {
    operations,
    totalWeeklyOperatingCost,
    projectedWeeklyCommercialIncome,
    projectedWeeklyNetImpact: projectedWeeklyCommercialIncome - totalWeeklyOperatingCost
  };
}

function makeFinance(): FinanceSnapshot {
  return {
    clubId: 1,
    clubName: 'Ajax',
    financialStatus: 69,
    baseBalance: 2100000,
    v2BudgetDelta: 180000,
    operatingBalance: 2280000,
    transferBudget: 3500000,
    wageBudget: 950000,
    weeklyWageBill: 182000,
    annualWageProjection: 9464000,
    boardConfidence: 61,
    morale: 58,
    fitnessTrend: -1,
    boardRiskLevel: 'WATCH',
    clubOperations: makeClubOperations(),
    activeWeekPlan: {
      transferStance: 'OPPORTUNISTIC',
      scoutingPriority: 'NATIONAL',
      tacticalMentality: 'BALANCED',
      rotationIntensity: 'MEDIUM',
      trainingFocus: 'BALANCED'
    }
  };
}

function makeReport(playerId: number): TransferScoutingReport {
  return {
    playerId,
    scoutedAtWeekNumber: 2,
    confidence: 78,
    recommendation: 'PRIORITY',
    style: 'Direct runner who can attack space behind a high line.',
    squadRoleProjection: 'STARTER',
    summary: 'A quick, first-team-ready attacker who upgrades the right side immediately.',
    strengths: ['Explosive first step', 'Strong off-ball movement'],
    risks: ['High wage expectations', 'Seller wants a premium fee'],
    agentPressure: 'HIGH',
    sellerStance: 'AGGRESSIVE',
    recommendedBidFee: 2000000,
    recommendedWeeklyWage: 8400,
    recommendedLoanFee: 275000,
    recommendedWageContributionPct: 80,
    recommendedBuyOptionFee: 2600000
  };
}

function makeTarget(overrides?: Partial<TransferMarketTarget>): TransferMarketTarget {
  const playerId = overrides?.playerId ?? 91;
  return {
    playerId,
    fullName: 'Milan de Groot',
    age: 22,
    position: 'RW',
    currentAbility: 73,
    potentialAbility: 81,
    marketValue: 1900000,
    weeklyWage: 7600,
    sellerClubId: 11,
    sellerClubName: 'SC Cambuur',
    sellerLeagueId: 12,
    sellerTier: 2,
    askingFee: 2150000,
    scoutingTag: 'NATIONAL',
    fitScore: 87,
    isAffordable: true,
    budgetGap: 0,
    isShortlisted: false,
    scoutingReport: null,
    activeNegotiationId: null,
    agentPressure: 'MEDIUM',
    sellerStance: 'OPEN',
    ...overrides
  };
}

function makeNegotiation(counterOfferPlayerId = 91): TransferNegotiationSummary {
  return {
    negotiationId: 'career-123:neg:91:1',
    playerId: counterOfferPlayerId,
    playerName: 'Milan de Groot',
    position: 'RW',
    sellerClubId: 11,
    sellerClubName: 'SC Cambuur',
    kind: 'PERMANENT',
    stage: 'COUNTERED',
    status: 'ACTIVE',
    agentPressure: 'HIGH',
    sellerStance: 'AGGRESSIVE',
    requestedAtWeekNumber: 2,
    deadlineWeekNumber: 3,
    latestOffer: {
      transferFee: 1800000,
      weeklyWage: 7900,
      loanFee: null,
      wageContributionPct: null,
      buyOptionFee: null,
      sellOnPct: null,
      loanDurationWeeks: null
    },
    counterOffer: {
      transferFee: 2050000,
      weeklyWage: 8600,
      loanFee: null,
      wageContributionPct: null,
      buyOptionFee: null,
      sellOnPct: null,
      loanDurationWeeks: null
    },
    note: 'Cambuur want the fee moved closer to their demand before they will sign off.',
    clauseSummary: []
  };
}

function makeMarket(overrides?: Partial<TransferMarketPayload>): TransferMarketPayload {
  const target = makeTarget();
  return {
    scoutingTag: 'NATIONAL',
    positionFilter: null,
    affordableOnly: false,
    seasonPhase: {
      code: 'OPENING_WINDOW',
      label: 'Opening Window',
      note: 'Early-season transfer business is live.'
    },
    transferWindow: {
      status: 'OPEN',
      label: 'Transfer Open',
      isOpen: true,
      opensWeekNumber: 1,
      closesWeekNumber: 4,
      nextOpenWeekNumber: null,
      weeksRemaining: 2,
      note: 'Opening window: Transfer window is open through week 4.'
    },
    availableBudget: 3500000,
    shortlistCount: 0,
    targets: [target],
    shortlistedTargets: [],
    activeNegotiations: [],
    incomingLoans: [],
    outgoingTargets: [],
    ...overrides
  };
}

describe('FinancesPage', () => {
  let currentFinance: FinanceSnapshot;
  let currentMarket: TransferMarketPayload;

  beforeEach(() => {
    currentFinance = makeFinance();
    currentMarket = makeMarket();

    mockUseActiveCareer.mockReturnValue({
      careerId: 'career-123',
      careers: [],
      resolving: false,
      resolveError: null,
      refreshCareers: jest.fn(),
      setCareerId: jest.fn(),
      clearCareerId: jest.fn()
    });

    mockGetFinances.mockImplementation(async () => currentFinance);
    mockGetTransferMarket.mockImplementation(async () => currentMarket);
    mockSellTransfer.mockResolvedValue({} as never);
    mockTriggerLoanBuyOption.mockResolvedValue({} as never);
    mockUpgradeClubOperation.mockImplementation(async (_careerId, operationKey) => {
      if (operationKey === 'COMMERCIAL_TEAM') {
        currentFinance = {
          ...currentFinance,
          operatingBalance: currentFinance.operatingBalance - 80000,
          v2BudgetDelta: currentFinance.v2BudgetDelta - 80000,
          clubOperations: makeClubOperations({ COMMERCIAL_TEAM: 2 })
        };
      }

      return {
        operationKey,
        operationLabel: 'Commercial Team',
        previousLevel: 1,
        newLevel: 2,
        upgradeCost: 80000,
        operatingBalanceAfter: currentFinance.operatingBalance,
        boardConfidenceAfter: currentFinance.boardConfidence,
        clubOperations: currentFinance.clubOperations,
        note: 'Commercial Team upgraded to level 2.'
      };
    });

    mockUpdateTransferShortlist.mockImplementation(async (_careerId, payload) => {
      const shortlisted = Boolean(payload.shortlisted);
      currentMarket = {
        ...currentMarket,
        shortlistCount: shortlisted ? 1 : 0,
        targets: currentMarket.targets.map((target) => target.playerId === payload.playerId
          ? { ...target, isShortlisted: shortlisted }
          : target),
        shortlistedTargets: shortlisted
          ? currentMarket.targets
            .filter((target) => target.playerId === payload.playerId)
            .map((target) => ({ ...target, isShortlisted: true }))
          : []
      };
      return {
        playerId: payload.playerId,
        playerName: 'Milan de Groot',
        shortlisted,
        shortlistCount: currentMarket.shortlistCount,
        note: shortlisted ? 'Added to shortlist.' : 'Removed from shortlist.'
      };
    });

    mockRequestTransferScoutReport.mockImplementation(async (_careerId, playerId) => {
      const report = makeReport(playerId);
      currentMarket = {
        ...currentMarket,
        targets: currentMarket.targets.map((target) => target.playerId === playerId
          ? {
            ...target,
            scoutingReport: report,
            agentPressure: report.agentPressure,
            sellerStance: report.sellerStance
          }
          : target),
        shortlistedTargets: currentMarket.shortlistedTargets.map((target) => target.playerId === playerId
          ? {
            ...target,
            scoutingReport: report,
            agentPressure: report.agentPressure,
            sellerStance: report.sellerStance
          }
          : target)
      };
      return {
        playerId,
        playerName: 'Milan de Groot',
        report,
        note: 'Scouting report delivered.'
      };
    });

    mockSubmitTransferOffer.mockImplementation(async (_careerId, payload) => {
      const negotiation = makeNegotiation(payload.playerId);
      currentMarket = {
        ...currentMarket,
        targets: currentMarket.targets.map((target) => target.playerId === payload.playerId
          ? { ...target, activeNegotiationId: negotiation.negotiationId }
          : target),
        shortlistedTargets: currentMarket.shortlistedTargets.map((target) => target.playerId === payload.playerId
          ? { ...target, activeNegotiationId: negotiation.negotiationId }
          : target),
        activeNegotiations: [negotiation]
      };
      return {
        outcome: 'COUNTERED',
        playerId: payload.playerId,
        playerName: 'Milan de Groot',
        kind: 'PERMANENT',
        note: negotiation.note,
        permanentDeal: null,
        loanDeal: null,
        negotiation
      };
    });

    mockRespondTransferOffer.mockImplementation(async (_careerId, payload) => {
      currentMarket = {
        ...currentMarket,
        targets: currentMarket.targets.map((target) => target.playerId === 91
          ? { ...target, activeNegotiationId: null }
          : target),
        shortlistedTargets: currentMarket.shortlistedTargets.map((target) => target.playerId === 91
          ? { ...target, activeNegotiationId: null }
          : target),
        activeNegotiations: []
      };
      return {
        outcome: 'ACCEPTED',
        playerId: 91,
        playerName: 'Milan de Groot',
        kind: 'PERMANENT',
        note: payload.action === 'ACCEPT_COUNTER'
          ? 'The counter terms were met and the permanent deal was approved.'
          : 'The revised package was accepted.',
        permanentDeal: {
          playerId: 91,
          playerName: 'Milan de Groot',
          position: 'RW',
          fromClubId: 11,
          fromClubName: 'SC Cambuur',
          transferFee: 2050000,
          weeklyWage: 8600,
          signingCost: 2084400,
          budgetAfter: 1955600,
          boardConfidenceAfter: 62,
          scoutingTag: 'NATIONAL'
        },
        loanDeal: null,
        negotiation: null
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('supports shortlist, scouting, and permanent offer submission from the transfer desk', async () => {
    renderV2(<FinancesPage />, {
      route: '/finances',
      path: '/finances'
    });

    expect(await screen.findByText('Transfer & Scouting Desk')).toBeInTheDocument();

    fireEvent.click((await screen.findAllByTestId('transfer-shortlist-button'))[0]);

    await waitFor(() => {
      expect(mockUpdateTransferShortlist).toHaveBeenCalledWith('career-123', {
        playerId: 91,
        shortlisted: true
      });
    });
    expect(await screen.findByTestId('transfer-shortlist-panel')).toBeInTheDocument();

    fireEvent.click((await screen.findAllByTestId('transfer-scout-button'))[0]);

    await waitFor(() => {
      expect(mockRequestTransferScoutReport).toHaveBeenCalledWith('career-123', 91);
    });
    expect(await screen.findByText('Scouting Report')).toBeInTheDocument();

    fireEvent.click(await screen.findByTestId('transfer-offer-submit-button'));

    await waitFor(() => {
      expect(mockSubmitTransferOffer).toHaveBeenCalledWith('career-123', {
        playerId: 91,
        kind: 'PERMANENT',
        transferFee: 2000000,
        weeklyWage: 8400,
        loanFee: undefined,
        wageContributionPct: undefined,
        buyOptionFee: undefined,
        loanDurationWeeks: undefined
      });
    });
    expect(await screen.findByTestId('transfer-negotiation-card')).toBeInTheDocument();
  });

  it('upgrades club operations from the finances page', async () => {
    renderV2(<FinancesPage />, {
      route: '/finances',
      path: '/finances'
    });

    expect(await screen.findByTestId('club-operations-panel')).toBeInTheDocument();

    fireEvent.click(await screen.findByTestId('club-operation-upgrade-COMMERCIAL_TEAM'));

    await waitFor(() => {
      expect(mockUpgradeClubOperation).toHaveBeenCalledWith('career-123', 'COMMERCIAL_TEAM');
    });

    expect(await screen.findByText('Commercial Team upgraded to level 2. Weekly net impact now +EUR 11,500.')).toBeInTheDocument();
    const commercialCard = await screen.findByTestId('club-operation-card-COMMERCIAL_TEAM');
    expect(within(commercialCard).getByText('Level 2 / 5')).toBeInTheDocument();
    expect(within(commercialCard).getByText('Upgrade for EUR 140,000')).toBeInTheDocument();
  });

  it('accepts a live transfer counter from the negotiation panel', async () => {
    const report = makeReport(91);
    const negotiation = makeNegotiation(91);
    currentMarket = makeMarket({
      targets: [makeTarget({ scoutingReport: report, activeNegotiationId: negotiation.negotiationId, agentPressure: 'HIGH', sellerStance: 'AGGRESSIVE' })],
      activeNegotiations: [negotiation]
    });

    renderV2(<FinancesPage />, {
      route: '/finances',
      path: '/finances'
    });

    expect(await screen.findByTestId('transfer-negotiation-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Accept Counter'));

    await waitFor(() => {
      expect(mockRespondTransferOffer).toHaveBeenCalledWith('career-123', {
        negotiationId: negotiation.negotiationId,
        action: 'ACCEPT_COUNTER'
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('transfer-negotiation-card')).not.toBeInTheDocument();
    });
  });

  it('disables transfer actions when the transfer window is closed', async () => {
    currentMarket = makeMarket({
      transferWindow: {
        status: 'CLOSED',
        label: 'Transfer Closed',
        isOpen: false,
        opensWeekNumber: 8,
        closesWeekNumber: 10,
        nextOpenWeekNumber: 8,
        weeksRemaining: 3,
        note: 'Transfer window is closed. It reopens in week 8.'
      },
      seasonPhase: {
        code: 'FIRST_HALF',
        label: 'First Half',
        note: 'League play continues with the market shut.'
      }
    });

    renderV2(<FinancesPage />, {
      route: '/finances',
      path: '/finances'
    });

    expect(await screen.findByText('Transfer Closed')).toBeInTheDocument();
    expect(await screen.findByText(/reopens in week 8/i)).toBeInTheDocument();
    expect(screen.getByTestId('transfer-offer-submit-button')).toBeDisabled();
  });

  it('prefers a budget-fit loan route when a permanent transfer is unaffordable', async () => {
    const report = {
      ...makeReport(91),
      recommendation: 'MONITOR' as const,
      recommendedLoanFee: 6000,
      recommendedWageContributionPct: 20,
      recommendedBuyOptionFee: null
    };
    currentMarket = makeMarket({
      availableBudget: 15000,
      targets: [
        makeTarget({
          askingFee: 2400000,
          isAffordable: false,
          budgetGap: 2385000,
          weeklyWage: 5000,
          scoutingReport: report
        })
      ]
    });

    renderV2(<FinancesPage />, {
      route: '/finances',
      path: '/finances'
    });

    expect(await screen.findByText('Transfer & Scouting Desk')).toBeInTheDocument();
    expect(await screen.findByLabelText('Loan Fee')).toHaveValue(6000);
    expect(screen.getByLabelText('Wage Contribution %')).toHaveValue(20);
    fireEvent.click(await screen.findByTestId('transfer-offer-submit-button'));

    await waitFor(() => {
      expect(mockSubmitTransferOffer).toHaveBeenCalledWith('career-123', {
        playerId: 91,
        kind: 'LOAN',
        transferFee: undefined,
        weeklyWage: undefined,
        loanFee: 6000,
        wageContributionPct: 20,
        buyOptionFee: undefined,
        loanDurationWeeks: 24
      });
    });
  });
});
