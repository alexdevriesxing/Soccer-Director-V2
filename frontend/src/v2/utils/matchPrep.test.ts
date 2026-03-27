import { buildAutoSelection, countSelectedFormationGroups } from './matchPrep';
import { SquadPlayer } from '../types';

function makePlayer(id: number, overrides: Partial<SquadPlayer> = {}): SquadPlayer {
  return {
    id,
    fullName: `Player ${id}`,
    position: 'CM',
    morale: 70,
    fitness: 78,
    form: 65,
    isInjured: false,
    injuryWeeks: 0,
    isSuspended: false,
    developmentDelta: 0,
    currentAbility: 60,
    potentialAbility: 70,
    weeklyWage: 1000,
    marketValue: 50000,
    contractRisk: 'STABLE',
    ...overrides
  };
}

describe('buildAutoSelection', () => {
  it('builds a valid lineup while excluding unavailable players and resting directives from starters', () => {
    const players: SquadPlayer[] = [
      makePlayer(1, { position: 'GK', currentAbility: 74 }),
      makePlayer(2, { position: 'GK', currentAbility: 66 }),
      makePlayer(3, { position: 'CB', currentAbility: 80, managerDirectiveCode: 'REST_RECOVERY', managerDirectiveLabel: 'Rest & Recovery' }),
      makePlayer(4, { position: 'CB', currentAbility: 76 }),
      makePlayer(5, { position: 'RB', currentAbility: 73 }),
      makePlayer(6, { position: 'LB', currentAbility: 72 }),
      makePlayer(7, { position: 'CM', currentAbility: 78 }),
      makePlayer(8, { position: 'CM', currentAbility: 75 }),
      makePlayer(9, { position: 'AM', currentAbility: 74 }),
      makePlayer(10, { position: 'RW', currentAbility: 77 }),
      makePlayer(11, { position: 'LW', currentAbility: 76 }),
      makePlayer(12, { position: 'ST', currentAbility: 79 }),
      makePlayer(13, { position: 'CB', currentAbility: 71, isInjured: true, injuryWeeks: 2 }),
      makePlayer(14, { position: 'DM', currentAbility: 70, managerDirectiveCode: 'LIMITED_MINUTES', managerDirectiveLabel: 'Limited Minutes' }),
      makePlayer(15, { position: 'CB', currentAbility: 69 }),
      makePlayer(16, { position: 'ST', currentAbility: 68 }),
      makePlayer(17, {
        position: 'ST',
        currentAbility: 92,
        isEligibleForNextFixture: false,
        eligibilityCode: 'UNREGISTERED',
        eligibilityNote: 'Not registered for the active competition.'
      })
    ];

    const result = buildAutoSelection(players, '4-4-2', 'BEST_XI', 'BALANCED');
    const starterPlayers = players.filter((player) => result.starters.includes(player.id));
    const counts = countSelectedFormationGroups(result.starters, new Map(players.map((player) => [player.id, player])));

    expect(result.starters).toHaveLength(11);
    expect(result.bench).toHaveLength(4);
    expect(result.starters).not.toContain(3);
    expect(result.starters).not.toContain(13);
    expect(result.starters).not.toContain(17);
    expect(result.bench).not.toContain(13);
    expect(result.bench).not.toContain(17);
    expect(result.captain).not.toBeNull();
    expect(result.starters).toContain(result.captain as number);
    expect(starterPlayers.filter((player) => player.position === 'GK')).toHaveLength(1);
    expect(counts).toEqual({ GK: 1, DEF: 4, MID: 4, ATT: 2 });
  });
});
