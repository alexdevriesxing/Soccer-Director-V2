import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import SquadPage from './SquadPage';
import {
  assignSquadRole,
  getSquad,
  getSquadPlayerProfile,
  setSquadPlayerMedicalPlan,
  setSquadPlayerRegistrationAction,
  setSquadPlayerRetrainingPlan
} from '../api';
import { SquadPlayer, SquadPlayerProfile } from '../types';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  assignSquadRole: jest.fn(),
  getSquad: jest.fn(),
  getSquadPlayerProfile: jest.fn(),
  releaseSquadPlayer: jest.fn(),
  renewSquadContract: jest.fn(),
  setSquadPlayerDevelopmentPlan: jest.fn(),
  setSquadPlayerMedicalPlan: jest.fn(),
  setSquadPlayerStatusAction: jest.fn(),
  setSquadPlayerRegistrationAction: jest.fn(),
  setSquadPlayerRetrainingPlan: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockAssignSquadRole = assignSquadRole as jest.MockedFunction<typeof assignSquadRole>;
const mockGetSquad = getSquad as jest.MockedFunction<typeof getSquad>;
const mockGetSquadPlayerProfile = getSquadPlayerProfile as jest.MockedFunction<typeof getSquadPlayerProfile>;
const mockSetSquadPlayerMedicalPlan = setSquadPlayerMedicalPlan as jest.MockedFunction<typeof setSquadPlayerMedicalPlan>;
const mockSetSquadPlayerRegistrationAction = setSquadPlayerRegistrationAction as jest.MockedFunction<typeof setSquadPlayerRegistrationAction>;
const mockSetSquadPlayerRetrainingPlan = setSquadPlayerRetrainingPlan as jest.MockedFunction<typeof setSquadPlayerRetrainingPlan>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

function makePlayer(id: number, name: string): SquadPlayer {
  return {
    id,
    fullName: name,
    position: 'ST',
    effectivePosition: 'ST',
    age: 23,
    currentAbility: 74,
    potentialAbility: 80,
    weeklyWage: 1800,
    marketValue: 250000,
    contractEnd: '2027-06-30T00:00:00.000Z',
    contractRisk: 'WATCH',
    morale: 69,
    fitness: 82,
    form: 66,
    isInjured: false,
    injuryWeeks: 0,
    isSuspended: false,
    developmentDelta: 1,
    assignedRole: 'ROTATION',
    registrationStatus: 'REGISTERED',
    registrationNote: 'Registered for the active competition.',
    eligibilityCode: 'ELIGIBLE',
    eligibilityNote: 'Eligible for the next fixture.',
    isEligibleForNextFixture: true,
    retrainingTargetPosition: null,
    retrainingProgressPct: null,
    retrainingReadyForMatchPrep: false
  };
}

function makeProfile(playerId: number): SquadPlayerProfile {
  return {
    playerId,
    fullName: 'Kyan Kuipers',
    position: 'ST',
    effectivePosition: 'ST',
    age: 23,
    currentAbility: 74,
    potentialAbility: 80,
    weeklyWage: 1800,
    marketValue: 250000,
    availability: {
      status: 'AVAILABLE',
      note: 'Fit for selection.',
      isInjured: false,
      injuryWeeks: 0,
      isSuspended: false,
      suspension: null,
      managerDirective: null
    },
    registration: {
      isRegistered: true,
      competitionLabel: 'Eredivisie',
      registeredCount: 2,
      registrationLimit: 22,
      minimumRegistered: 18,
      overageCount: 0,
      overageLimit: null,
      eligibilityCode: 'ELIGIBLE',
      eligibilityNote: 'Eligible for the next fixture.',
      note: 'Registered for the active competition.',
      rulesNotes: ['Only registered players are eligible for league fixtures.'],
      window: {
        status: 'OPEN',
        label: 'Registration Open',
        isOpen: true,
        opensWeekNumber: 1,
        closesWeekNumber: 4,
        nextOpenWeekNumber: null,
        weeksRemaining: 2,
        note: 'Registration window is open through week 4.'
      }
    },
    performance: {
      morale: 69,
      fitness: 82,
      form: 66,
      developmentDelta: 1
    },
    medical: {
      rehabStatus: 'FIT',
      workloadRisk: 'MEDIUM',
      workloadScore: 34,
      recoveryRecommendation: 'Monitor training load. A preventive block is justified if the player is expected to start.',
      availabilityRecommendation: 'LIMITED_MINUTES',
      riskFactors: ['Starter workload is heavy relative to current conditioning.'],
      recommendedPlanCode: 'INJURY_PREVENTION',
      activePlan: null
    },
    squadContext: {
      squadSize: 2,
      squadAbilityRank: 1,
      positionCount: 1,
      depthRankAtPosition: 1,
      roleTier: 'ROTATION',
      playingTimeExpectation: 'ROTATION',
      recommendation: 'Keep involved as a regular rotation option.',
      assignedRole: 'ROTATION',
      recommendedAssignedRole: 'ROTATION',
      roleMismatch: false,
      rolePressureNote: 'Current assignment aligns with the squad hierarchy.'
    },
    contract: {
      contractStart: '2025-07-01T00:00:00.000Z',
      contractEnd: '2027-06-30T00:00:00.000Z',
      yearsRemaining: 1,
      daysRemaining: 280,
      risk: 'WATCH',
      recommendation: 'Monitor for renewal within the season.',
      suggestedRenewalYears: 2,
      suggestedWageAdjustmentPct: 5
    },
    pendingContractTalk: null,
    playingTimePromise: null,
    developmentPlan: null,
    retraining: null,
    recentHistory: {
      roleChanges: [],
      developmentPlanChanges: [],
      medicalPlanChanges: [],
      retrainingChanges: [],
      promiseTimeline: []
    }
  };
}

describe('SquadPage', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: jest.fn()
    });
  });

  beforeEach(() => {
    mockUseActiveCareer.mockReturnValue({
      careerId: 'career-123',
      careers: [],
      resolving: false,
      resolveError: null,
      refreshCareers: jest.fn(),
      setCareerId: jest.fn(),
      clearCareerId: jest.fn()
    });
    mockGetSquad.mockResolvedValue([
      makePlayer(1, 'Kyan Kuipers'),
      makePlayer(2, 'Bas Jansen')
    ]);
    mockGetSquadPlayerProfile.mockResolvedValue(makeProfile(1));
    mockAssignSquadRole.mockResolvedValue({
      playerId: 1,
      playerName: 'Kyan Kuipers',
      roleAssignment: 'DEPTH',
      previousRoleAssignment: 'ROTATION',
      expectedRole: 'ROTATION',
      moraleDelta: -1,
      boardDelta: 0,
      note: 'Role adjusted for current squad planning.'
    });
    mockSetSquadPlayerRegistrationAction.mockResolvedValue({
      playerId: 1,
      playerName: 'Kyan Kuipers',
      action: 'UNREGISTER',
      isRegistered: false,
      registeredCount: 1,
      registrationLimit: 22,
      overageCount: 0,
      overageLimit: null,
      moraleDelta: -1,
      boardDelta: 0,
      note: 'Player removed from the active competition list.'
    });
    mockSetSquadPlayerRetrainingPlan.mockResolvedValue({
      playerId: 1,
      playerName: 'Kyan Kuipers',
      action: 'SET',
      currentPosition: 'ST',
      effectivePosition: 'ST',
      targetPosition: 'CF',
      progressPct: 0,
      weeklyProgressPct: 18,
      immediateMoraleDelta: 0,
      note: 'Retraining plan set.'
    });
    mockSetSquadPlayerMedicalPlan.mockResolvedValue({
      playerId: 1,
      playerName: 'Kyan Kuipers',
      action: 'SET',
      planCode: 'INJURY_PREVENTION',
      previousPlanCode: null,
      expiresWeekNumber: 2,
      immediateMoraleDelta: 0,
      immediateFitnessDelta: 1,
      immediateFormDelta: 0,
      workloadRisk: 'LOW',
      rehabStatus: 'MONITOR',
      availabilityRecommendation: 'LIMITED_MINUTES',
      projectedEffects: {
        moraleDelta: 0,
        fitnessDelta: 2,
        formDelta: 0,
        injuryRecoveryBoost: 0,
        injuryRiskDelta: -0.025,
        fatigueModifier: -1,
        availabilityRecommendation: 'LIMITED_MINUTES',
        summary: 'Fitness +2 • Risk -2.5% per week.'
      },
      note: 'Preventive medical work started.'
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected player profile and applies squad role changes', async () => {
    renderV2(<SquadPage />, {
      route: '/career-squad?focusPlayerId=1',
      path: '/career-squad'
    });

    expect(await screen.findByText('Kyan Kuipers')).toBeInTheDocument();
    expect(await screen.findByText('Player Profile')).toBeInTheDocument();
    expect(await screen.findByTestId('squad-focused-player-row')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Set Depth' }));

    await waitFor(() => expect(mockAssignSquadRole).toHaveBeenCalledWith('career-123', 1, { roleAssignment: 'DEPTH' }));
    expect(await screen.findByText(/Kyan Kuipers: Rotation -> Depth/i)).toBeInTheDocument();
  });

  it('submits registration and retraining actions from the player profile', async () => {
    renderV2(<SquadPage />, {
      route: '/career-squad?focusPlayerId=1',
      path: '/career-squad'
    });

    expect(await screen.findByText('Registration & Eligibility')).toBeInTheDocument();
    expect(await screen.findByText('Positional Retraining')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unregister Player' }));
    await waitFor(() => expect(mockSetSquadPlayerRegistrationAction).toHaveBeenCalledWith('career-123', 1, { action: 'UNREGISTER' }));

    fireEvent.change(screen.getByDisplayValue('CF'), { target: { value: 'CF' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Save Retraining Plan' }));
    await waitFor(() => expect(mockSetSquadPlayerRetrainingPlan).toHaveBeenCalledWith('career-123', 1, { targetPosition: 'CF' }));
  });

  it('disables registration actions when the registration window is closed', async () => {
    mockGetSquadPlayerProfile.mockResolvedValueOnce({
      ...makeProfile(1),
      registration: {
        ...makeProfile(1).registration,
        window: {
          status: 'CLOSED',
          label: 'Registration Closed',
          isOpen: false,
          opensWeekNumber: 8,
          closesWeekNumber: 10,
          nextOpenWeekNumber: 8,
          weeksRemaining: 3,
          note: 'Registration window is closed. It reopens in week 8.'
        }
      }
    });

    renderV2(<SquadPage />, {
      route: '/career-squad?focusPlayerId=1',
      path: '/career-squad'
    });

    expect(await screen.findByText('Registration Closed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register Player' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unregister Player' })).toBeDisabled();
  });

  it('saves a medical plan from the player profile', async () => {
    renderV2(<SquadPage />, {
      route: '/career-squad?focusPlayerId=1',
      path: '/career-squad'
    });

    expect(await screen.findByText('Medical & Workload')).toBeInTheDocument();

    fireEvent.click(await screen.findByTestId('squad-save-medical-plan'));

    await waitFor(() => expect(mockSetSquadPlayerMedicalPlan).toHaveBeenCalledWith('career-123', 1, { planCode: 'INJURY_PREVENTION' }));
    expect(await screen.findByText(/Preventive medical work started/i)).toBeInTheDocument();
  });
});
