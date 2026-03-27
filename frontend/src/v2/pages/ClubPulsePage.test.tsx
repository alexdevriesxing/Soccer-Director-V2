import React from 'react';
import { screen } from '@testing-library/react';
import ClubPulsePage from './ClubPulsePage';
import { getClubPulse } from '../api';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getClubPulse: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockGetClubPulse = getClubPulse as jest.MockedFunction<typeof getClubPulse>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

describe('ClubPulsePage', () => {
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

    mockGetClubPulse.mockResolvedValue({
      fanSentimentScore: 61,
      fanSentimentLabel: 'STEADY',
      fanSummary: 'Support remains stable, but the crowd still needs proof before fully buying in.',
      mediaPressureScore: 58,
      mediaPressureLabel: 'LOUD',
      mediaSummary: 'Press focus is rising and every public answer now shapes the weekly storyline.',
      projectedAttendance: 18824,
      projectedAttendancePct: 94,
      topHeadline: 'Board keeps weekly targets under review',
      boardStatus: {
        boardConfidence: 54,
        boardRiskLevel: 'WATCH',
        jobSecurity: 'UNSTABLE',
        jobSecurityScore: 58,
        reviewWindowWeeks: 3,
        summary: 'Board concern is increasing. Missed objectives must be corrected soon.',
        objectives: [],
        standingsContext: {
          leagueId: 12,
          leagueName: 'Eredivisie',
          leagueTier: 1,
          position: 8,
          clubCount: 18,
          points: 7,
          pointsPerGame: 1.4,
          played: 5
        }
      },
      recentResults: [
        {
          fixtureId: 'career-123:fx:1',
          opponentClubName: 'PSV',
          outcome: 'LOSS',
          scoreline: '1-2',
          matchDate: '2026-08-18T12:00:00.000Z'
        }
      ],
      headlines: [
        {
          id: 'board-headline',
          category: 'BOARD',
          tone: 'NEUTRAL',
          title: 'Board keeps weekly targets under review',
          summary: 'Board concern is increasing. Missed objectives must be corrected soon.',
          weekNumber: 5,
          createdAt: null
        },
        {
          id: 'media-headline',
          category: 'MEDIA',
          tone: 'NEGATIVE',
          title: 'Media pressure becomes a weekly storyline',
          summary: 'Press focus is rising and every public answer now shapes the weekly storyline.',
          weekNumber: 5,
          createdAt: null
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders pulse summary and headline feed', async () => {
    renderV2(<ClubPulsePage />, {
      route: '/club-pulse',
      path: '/club-pulse'
    });

    expect(await screen.findByTestId('club-pulse-summary')).toBeInTheDocument();
    expect(await screen.findByText('Fan Sentiment')).toBeInTheDocument();
    expect(await screen.findByText('STEADY')).toBeInTheDocument();
    expect(await screen.findByTestId('club-pulse-headlines')).toBeInTheDocument();
    expect(await screen.findByText('Media pressure becomes a weekly storyline')).toBeInTheDocument();
    expect(await screen.findByText(/1-2 vs PSV/i)).toBeInTheDocument();
  });
});
