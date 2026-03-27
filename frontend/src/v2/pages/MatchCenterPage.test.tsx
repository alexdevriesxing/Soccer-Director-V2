import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import MatchCenterPage from './MatchCenterPage';
import { getHighlights, getSquad, intervene, startMatch } from '../api';
import { MatchPayload, SquadPlayer } from '../types';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  getHighlights: jest.fn(),
  getSquad: jest.fn(),
  startMatch: jest.fn(),
  intervene: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

jest.mock('../components/RetroHighlightCanvas', () => () => <div data-testid="retro-highlight-canvas" />);

const mockGetHighlights = getHighlights as jest.MockedFunction<typeof getHighlights>;
const mockGetSquad = getSquad as jest.MockedFunction<typeof getSquad>;
const mockStartMatch = startMatch as jest.MockedFunction<typeof startMatch>;
const mockIntervene = intervene as jest.MockedFunction<typeof intervene>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

function makePlayer(id: number, position: string, ability: number, overrides: Partial<SquadPlayer> = {}): SquadPlayer {
  return {
    id,
    fullName: `Player ${id}`,
    position,
    age: 24,
    currentAbility: ability,
    potentialAbility: ability + 4,
    weeklyWage: 1000,
    marketValue: 100000,
    contractEnd: '2027-06-30T00:00:00.000Z',
    contractRisk: 'STABLE',
    morale: 72,
    fitness: 80,
    form: 68,
    isInjured: false,
    injuryWeeks: 0,
    isSuspended: false,
    developmentDelta: 0,
    ...overrides
  };
}

const squad: SquadPlayer[] = [
  makePlayer(1, 'GK', 76),
  makePlayer(2, 'GK', 68),
  makePlayer(3, 'CB', 81, { managerDirectiveCode: 'REST_RECOVERY', managerDirectiveLabel: 'Rest & Recovery' }),
  makePlayer(4, 'CB', 78),
  makePlayer(5, 'RB', 77),
  makePlayer(6, 'LB', 76),
  makePlayer(7, 'CM', 80),
  makePlayer(8, 'CM', 75),
  makePlayer(9, 'AM', 74),
  makePlayer(10, 'RW', 79),
  makePlayer(11, 'LW', 78),
  makePlayer(12, 'ST', 82),
  makePlayer(13, 'ST', 70),
  makePlayer(14, 'DM', 72),
  makePlayer(15, 'CB', 73)
];

function createStartedPayload(): MatchPayload {
  return {
    fixture: {
      id: 'career-123:fx:test-1',
      homeClubId: 1,
      awayClubId: 2,
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      leagueId: 10,
      weekNumber: 1,
      matchDate: '2026-08-01T12:00:00.000Z',
      homeClubName: 'Ajax',
      awayClubName: 'PSV',
      leagueName: 'Eredivisie',
      isControlledClubHome: true,
      opponentClubName: 'PSV'
    },
    match: {
      status: 'LIVE',
      homeScore: 1,
      awayScore: 0,
      homeXg: 0.9,
      awayXg: 0.2,
      homePossession: 56,
      awayPossession: 44,
      matchPrep: {
        formation: '4-4-2',
        lineupPolicy: 'BALANCED',
        benchPriority: 'BALANCED',
        preMatchInstruction: 'BALANCED',
        startingPlayerIds: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
        benchPlayerIds: [2, 13, 15],
        captainPlayerId: 1,
        selectionWarnings: []
      },
      interventions: []
      ,
      liveState: {
        currentMinute: 45,
        segment: 'HALFTIME',
        currentStartingPlayerIds: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
        currentBenchPlayerIds: [2, 13, 15],
        substitutionsUsed: 0,
        substitutionLimit: 3,
        remainingSubstitutions: 3,
        tacticalChangesUsed: 0,
        tacticalChangeLimit: 3,
        remainingTacticalChanges: 3,
        halftimeTalkUsed: false,
        halftimeTalkChoice: null,
        mentality: 'BALANCED',
        pressing: 'STANDARD',
        possessionSwing: 0
      }
    },
    highlights: []
  };
}

describe('MatchCenterPage', () => {
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
    mockGetHighlights.mockRejectedValue(new Error('Match not started yet.'));
    mockGetSquad.mockResolvedValue(squad);
    mockStartMatch.mockResolvedValue(createStartedPayload());
    mockIntervene.mockResolvedValue({
      ...createStartedPayload(),
      match: {
        ...createStartedPayload().match!,
        liveState: {
          ...createStartedPayload().match!.liveState!,
          segment: 'SECOND_HALF',
          halftimeTalkUsed: true,
          halftimeTalkChoice: 'DEMAND_MORE',
          currentMinute: 58
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('auto-populates match prep and submits a valid lineup', async () => {
    renderV2(<MatchCenterPage />, {
      route: '/match-center/career-123:fx:test-1',
      path: '/match-center/:matchId'
    });

    const startButton = await screen.findByTestId('match-center-start-button');
    await waitFor(() => expect(startButton).toBeEnabled());

    fireEvent.change(screen.getByTestId('match-center-formation-select'), { target: { value: '4-4-2' } });
    fireEvent.click(screen.getByText('Auto Best XI'));

    fireEvent.click(startButton);

    await waitFor(() => expect(mockStartMatch).toHaveBeenCalledTimes(1));
    const [, , submittedPayload] = mockStartMatch.mock.calls[0];

    expect(submittedPayload?.formation).toBe('4-4-2');
    expect(submittedPayload?.startingPlayerIds).toHaveLength(11);
    expect(submittedPayload?.benchPlayerIds?.length).toBeGreaterThanOrEqual(3);
    expect(submittedPayload?.captainPlayerId).toBeTruthy();
    expect(submittedPayload?.startingPlayerIds).not.toContain(3);
    expect(submittedPayload?.startingPlayerIds).toContain(submittedPayload?.captainPlayerId as number);
    expect(await screen.findByTestId('match-center-locked-prep')).toBeInTheDocument();
  });

  it('keeps unregistered high-ability players out of auto-picked matchday selections', async () => {
    mockGetSquad.mockResolvedValue([
      ...squad,
      makePlayer(16, 'ST', 95, {
        isEligibleForNextFixture: false,
        eligibilityCode: 'UNREGISTERED',
        eligibilityNote: 'Player is not registered for the next fixture.'
      })
    ]);

    renderV2(<MatchCenterPage />, {
      route: '/match-center/career-123:fx:test-1',
      path: '/match-center/:matchId'
    });

    const startButton = await screen.findByTestId('match-center-start-button');
    fireEvent.click(screen.getByText('Auto Best XI'));
    fireEvent.click(startButton);

    await waitFor(() => expect(mockStartMatch).toHaveBeenCalledTimes(1));
    const [, , submittedPayload] = mockStartMatch.mock.calls[0];

    expect(submittedPayload?.startingPlayerIds).not.toContain(16);
    expect(submittedPayload?.benchPlayerIds).not.toContain(16);
  });

  it('falls back to a playable formation when the default shape cannot be filled', async () => {
    mockGetSquad.mockResolvedValue([
      makePlayer(1, 'GK', 76),
      makePlayer(2, 'GK', 68),
      makePlayer(3, 'CB', 81, { managerDirectiveCode: 'REST_RECOVERY', managerDirectiveLabel: 'Rest & Recovery' }),
      makePlayer(4, 'CB', 78),
      makePlayer(5, 'RB', 77),
      makePlayer(6, 'LB', 76, {
        isEligibleForNextFixture: false,
        eligibilityCode: 'UNREGISTERED',
        eligibilityNote: 'Player is not registered for the next fixture.'
      }),
      makePlayer(7, 'CM', 80),
      makePlayer(8, 'CM', 75),
      makePlayer(9, 'AM', 74),
      makePlayer(10, 'RW', 79),
      makePlayer(11, 'LW', 78),
      makePlayer(12, 'ST', 82),
      makePlayer(13, 'ST', 70),
      makePlayer(14, 'DM', 72),
      makePlayer(15, 'CB', 73),
      makePlayer(16, 'CM', 71),
      makePlayer(17, 'AM', 70),
      makePlayer(18, 'RW', 69)
    ]);

    renderV2(<MatchCenterPage />, {
      route: '/match-center/career-123:fx:test-1',
      path: '/match-center/:matchId'
    });

    const startButton = await screen.findByTestId('match-center-start-button');
    await waitFor(() => expect(startButton).toBeEnabled());

    expect((screen.getByTestId('match-center-formation-select') as HTMLSelectElement).value).toBe('3-5-2');
  });

  it('submits halftime and substitution live-match controls through the intervention API', async () => {
    mockGetHighlights.mockResolvedValue(createStartedPayload());

    renderV2(<MatchCenterPage />, {
      route: '/match-center/career-123:fx:test-1',
      path: '/match-center/:matchId'
    });

    expect(await screen.findByTestId('match-center-halftime-demand')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('match-center-halftime-demand'));
    await waitFor(() => expect(mockIntervene).toHaveBeenCalledWith('career-123', 'career-123:fx:test-1', expect.objectContaining({
      type: 'HALFTIME_TEAM_TALK',
      teamTalk: 'DEMAND_MORE'
    })));

    fireEvent.change(await screen.findByTestId('match-center-sub-out-select'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('match-center-sub-in-select'), { target: { value: '13' } });
    fireEvent.change(screen.getByTestId('match-center-sub-reason-select'), { target: { value: 'TACTICAL_TWEAK' } });
    fireEvent.click(screen.getByTestId('match-center-intervention-substitution'));

    await waitFor(() => expect(mockIntervene).toHaveBeenCalledWith('career-123', 'career-123:fx:test-1', expect.objectContaining({
      type: 'SUBSTITUTION_TRIGGER',
      outPlayerId: 1,
      inPlayerId: 13,
      substitutionReason: 'TACTICAL_TWEAK'
    })));
  });
});
