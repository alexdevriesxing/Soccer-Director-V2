import React from 'react';
import { screen } from '@testing-library/react';
import StandingsPage from './StandingsPage';
import { getCareerState, getLeagueRules, getStandings, listCareerLeagues } from '../api';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getCareerState: jest.fn(),
  getLeagueRules: jest.fn(),
  getStandings: jest.fn(),
  listCareerLeagues: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockGetCareerState = getCareerState as jest.MockedFunction<typeof getCareerState>;
const mockGetLeagueRules = getLeagueRules as jest.MockedFunction<typeof getLeagueRules>;
const mockGetStandings = getStandings as jest.MockedFunction<typeof getStandings>;
const mockListCareerLeagues = listCareerLeagues as jest.MockedFunction<typeof listCareerLeagues>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

describe('StandingsPage', () => {
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
      season: '2026/2027',
      weekNumber: 6,
      currentPhase: 'PLANNING',
      currentDate: '2026-09-01T12:00:00.000Z',
      activeLeagueId: 12,
      pendingEvents: 0,
      urgentPendingEvents: 0,
      pendingActions: {
        needsWeekPlan: false,
        needsEventResponses: false,
        needsMatchPrep: false
      },
      club: {
        id: 1,
        name: 'Ajax'
      }
    });

    mockListCareerLeagues.mockResolvedValue([
      {
        leagueId: 12,
        leagueName: 'Eredivisie',
        leagueLevel: 'Level 1',
        region: 'NL',
        matchdayType: 'SATURDAY',
        tier: 1,
        divisionType: 'PRO',
        ageCategory: 'SENIOR',
        clubCount: 18,
        isActiveLeague: true
      }
    ]);

    mockGetStandings.mockResolvedValue([
      {
        position: 1,
        clubId: 1,
        clubName: 'Ajax',
        played: 5,
        won: 4,
        drawn: 1,
        lost: 0,
        goalsFor: 11,
        goalsAgainst: 4,
        goalDifference: 7,
        points: 13,
        progressionStatus: 'PROMOTED'
      }
    ]);

    mockGetLeagueRules.mockResolvedValue({
      seasonPhase: {
        code: 'FIRST_HALF',
        label: 'First Half',
        note: 'League positions are settling and rule windows are currently shut.'
      },
      league: {
        id: 12,
        name: 'Eredivisie',
        level: 'Level 1',
        region: 'NL',
        matchdayType: 'SATURDAY',
        tier: 1,
        divisionType: 'PRO',
        ageCategory: 'SENIOR'
      },
      transitionGroup: 'NATIONAL',
      promotion: {
        slots: 0,
        targetLeagues: []
      },
      relegation: {
        slots: 2,
        targetLeagues: [
          { leagueId: 24, name: 'Eerste Divisie', tier: 2 }
        ]
      },
      registration: {
        competitionLabel: 'Eredivisie',
        registrationLimit: 22,
        minimumRegistered: 18,
        overageLimit: null,
        notes: ['Only registered players are eligible for league fixtures.'],
        window: {
          status: 'CLOSED',
          label: 'Registration Closed',
          isOpen: false,
          opensWeekNumber: 10,
          closesWeekNumber: 12,
          nextOpenWeekNumber: 10,
          weeksRemaining: 4,
          note: 'Registration window is closed. It reopens in week 10.'
        }
      },
      transferWindow: {
        status: 'CLOSED',
        label: 'Transfer Closed',
        isOpen: false,
        opensWeekNumber: 10,
        closesWeekNumber: 12,
        nextOpenWeekNumber: 10,
        weeksRemaining: 4,
        note: 'Transfer window is closed. It reopens in week 10.'
      },
      disciplinary: {
        suspensionRule: 'Straight red cards and second-booking dismissals trigger a one-match suspension in the active league.',
        notes: ['Suspended players are excluded from match prep until the ban is served.']
      },
      notes: ['National tiers use direct promotion/relegation between adjacent levels.']
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders season phase and competition windows in the rules panel', async () => {
    renderV2(<StandingsPage />, {
      route: '/standings',
      path: '/standings'
    });

    expect(await screen.findByText('League Rules')).toBeInTheDocument();
    expect(await screen.findAllByText('First Half')).toHaveLength(2);
    expect(await screen.findByText('Registration Closed')).toBeInTheDocument();
    expect(await screen.findByText('Transfer Closed')).toBeInTheDocument();
    expect(await screen.findByText(/one-match suspension/i)).toBeInTheDocument();
  });
});
