import React from 'react';
import { screen } from '@testing-library/react';
import PostMatchPage from './PostMatchPage';
import { getPostMatch } from '../api';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getPostMatch: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockGetPostMatch = getPostMatch as jest.MockedFunction<typeof getPostMatch>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

describe('PostMatchPage', () => {
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

    mockGetPostMatch.mockResolvedValue({
      fixtureId: 'career-123:fx:test-1',
      fixture: {
        id: 'career-123:fx:test-1',
        homeClubId: 1,
        awayClubId: 2,
        leagueId: 10,
        weekNumber: 1,
        status: 'COMPLETED',
        matchDate: '2026-08-01T12:00:00.000Z',
        homeScore: 2,
        awayScore: 1,
        homeClubName: 'Ajax',
        awayClubName: 'PSV',
        leagueName: 'Eredivisie',
        leagueTier: 1,
        isControlledClubHome: true,
        opponentClubId: 2,
        opponentClubName: 'PSV'
      },
      score: { home: 2, away: 1 },
      xg: { home: 1.75, away: 0.84 },
      possession: { home: 56, away: 44 },
      clubState: {
        morale: 58,
        boardConfidence: 57,
        fitnessTrend: -2,
        budgetBalance: 0
      },
      playerImpact: {
        averageMorale: 61,
        averageFitness: 77,
        averageForm: 69,
        injuredCount: 0,
        suspendedCount: 0
      },
      playerRatings: {
        averageRating: 7.11,
        topPerformer: {
          playerId: 12,
          playerName: 'Kyan Kuipers',
          rating: 8.4,
          summary: '2 goals | 0.88 xG involvement'
        },
        biggestConcern: {
          playerId: 4,
          playerName: 'Niels Vos',
          rating: 6.0,
          summary: 'booked 1x | off on 68\''
        },
        rows: [
          {
            playerId: 12,
            playerName: 'Kyan Kuipers',
            position: 'ST',
            role: 'STARTER',
            minutes: 90,
            rating: 8.4,
            summary: '2 goals | 0.88 xG involvement',
            goals: 2,
            shots: 4,
            shotsOnTarget: 3,
            xg: 0.88,
            yellowCards: 0,
            redCard: false,
            subbedOn: false,
            subbedOff: false
          }
        ]
      },
      chanceQuality: {
        summary: 'The side generated the better openings and generally edged the quality battle.',
        verdict: 'EDGED_IT',
        home: {
          shots: 11,
          shotsOnTarget: 5,
          bigChances: 3,
          totalShotXg: 1.75,
          averageShotXg: 0.16,
          bestChanceXg: 0.42,
          woodwork: 1,
          blockedShots: 1,
          offsides: 2,
          penaltiesScored: 0,
          penaltiesMissed: 0
        },
        away: {
          shots: 6,
          shotsOnTarget: 2,
          bigChances: 1,
          totalShotXg: 0.84,
          averageShotXg: 0.14,
          bestChanceXg: 0.28,
          woodwork: 0,
          blockedShots: 1,
          offsides: 1,
          penaltiesScored: 0,
          penaltiesMissed: 0
        }
      },
      tacticalFeedback: {
        summary: 'The side created the better openings and should carry that structure into the next week.',
        strengths: ['The shape generated the better looks (1.75 xG vs 0.84).'],
        concerns: ['The squad paid a physical price, which raises the risk of a flat next week.'],
        recommendations: [
          'Week Planner: set Training Focus to Fitness.',
          'Week Planner: set Rotation Intensity to High.',
          'Week Planner: keep Tactical Mentality Balanced next week.'
        ],
        recommendedWeekPlan: {
          trainingFocus: 'FITNESS',
          rotationIntensity: 'HIGH',
          tacticalMentality: 'BALANCED'
        },
        interventionRead: {
          usedHalftimeTalk: true,
          usedSubstitution: true,
          usedTacticalShifts: true,
          verdict: 'Live changes improved momentum after the break.'
        }
      },
      interventionImpact: {
        totalInterventions: 3,
        aggregate: {
          directNetGoalDelta: 0,
          directNetXgDelta: 0.34,
          windowNetGoalDelta: 0,
          windowNetXThreatDelta: 0.274,
          directGoalsFromInterventions: 0
        },
        windows: []
      },
      standingsPreview: [],
      latestPlannerInsight: {
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
      appliedChanges: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics sections for post-match analysis', async () => {
    renderV2(<PostMatchPage />, {
      route: '/post-match/career-123:fx:test-1',
      path: '/post-match/:matchId'
    });

    expect(await screen.findByTestId('post-match-chance-quality')).toBeInTheDocument();
    expect(await screen.findByTestId('post-match-tactical-feedback')).toBeInTheDocument();
    expect(await screen.findByTestId('post-match-player-ratings')).toBeInTheDocument();
    expect(await screen.findByTestId('post-match-manager-verdict')).toBeInTheDocument();
    expect((await screen.findAllByText('Kyan Kuipers')).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Week Planner: set Training Focus to Fitness/i)).toBeInTheDocument();
  });
});
