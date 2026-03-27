import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import WeekPlannerPage from './WeekPlannerPage';
import { getCareerState, submitWeekPlan } from '../api';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getCareerState: jest.fn(),
  submitWeekPlan: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockGetCareerState = getCareerState as jest.MockedFunction<typeof getCareerState>;
const mockSubmitWeekPlan = submitWeekPlan as jest.MockedFunction<typeof submitWeekPlan>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

describe('WeekPlannerPage', () => {
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

    mockGetCareerState.mockResolvedValue({
      id: 'career-123',
      managerName: 'Alex',
      controlledClubId: 1,
      currentDate: '2026-08-02T12:00:00.000Z',
      currentPhase: 'PLANNING',
      season: '2026/2027',
      weekNumber: 2,
      activeLeagueId: 10,
      pendingEvents: 0,
      urgentPendingEvents: 0,
      pendingActions: {
        needsWeekPlan: false,
        needsEventResponses: false,
        needsMatchPrep: false
      },
      latestMatchInsight: {
        fixtureId: 'career-123:fx:test-1',
        matchDate: '2026-08-01T12:00:00.000Z',
        opponentClubName: 'PSV',
        scoreline: '2-1 vs PSV',
        summary: 'The side created the better openings and should carry that structure into the next week.',
        strengths: ['The shape generated the better looks (1.75 xG vs 0.84).'],
        concerns: ['The squad paid a physical price, which raises the risk of a flat next week.'],
        recommendedWeekPlan: {
          trainingFocus: 'FITNESS',
          rotationIntensity: 'HIGH',
          tacticalMentality: 'BALANCED'
        }
      },
      weekPlan: {
        trainingFocus: 'BALANCED',
        rotationIntensity: 'MEDIUM',
        tacticalMentality: 'CAUTIOUS',
        transferStance: 'OPPORTUNISTIC',
        scoutingPriority: 'LOCAL'
      }
    } as never);
    mockSubmitWeekPlan.mockResolvedValue({} as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('applies latest match recommendations into the planner form', async () => {
    renderV2(<WeekPlannerPage />, {
      route: '/week-planner',
      path: '/week-planner'
    });

    expect(await screen.findByTestId('week-planner-latest-match-insight')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('week-planner-apply-match-recommendation'));

    expect((screen.getByTestId('week-planner-training-focus') as HTMLSelectElement).value).toBe('FITNESS');
    expect((screen.getByTestId('week-planner-rotation-intensity') as HTMLSelectElement).value).toBe('HIGH');
    expect((screen.getByTestId('week-planner-tactical-mentality') as HTMLSelectElement).value).toBe('BALANCED');
  });
});
