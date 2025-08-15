import TrainingService from './trainingService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('TrainingService', () => {
  beforeEach(async () => {
    // Full teardown order to avoid FK constraint errors
    await prisma.playerAward?.deleteMany?.({});
    await prisma.playerCareerStat?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.playerRequest?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    await prisma.playerContractBonus?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.internationalMatchEvent?.deleteMany?.({});
    await prisma.internationalMatch?.deleteMany?.({});
    await prisma.internationalPlayer?.deleteMany?.({});
    await prisma.internationalManager?.deleteMany?.({});
    await prisma.competitionStage?.deleteMany?.({});
    await prisma.internationalCompetition?.deleteMany?.({});
    await prisma.nationalTeam?.deleteMany?.({});
    await prisma.gateReceipt?.deleteMany?.({});
    await prisma.sponsorship?.deleteMany?.({});
    await prisma.facility?.deleteMany?.({});
    await prisma.staffContract?.deleteMany?.({});
    await prisma.clubFinances?.deleteMany?.({});
    await prisma.tVRights?.deleteMany?.({});
    await prisma.trainingFocus?.deleteMany?.({});
    await prisma.staff?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.matchEvent?.deleteMany?.({});
    await prisma.fixture?.deleteMany?.({});
    await prisma.player?.deleteMany?.({});
    await prisma.clubFormation?.deleteMany?.({});
    await prisma.clubStrategy?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.club?.deleteMany?.({});
    await prisma.league?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.vARDecisions?.deleteMany?.({});
    await prisma.realTimeTacticalChanges?.deleteMany?.({});
    await prisma.weather?.deleteMany?.({});
    await prisma.pitchConditions?.deleteMany?.({});
  });

  afterAll(async () => {
    await prisma.trainingFocus.deleteMany({});
    await prisma.staffContract?.deleteMany?.({});
    await prisma.staff?.deleteMany?.({});
    await prisma.clubFormation?.deleteMany?.({});
    await prisma.clubStrategy?.deleteMany?.({});
    await prisma.facility?.deleteMany?.({});
    await prisma.academyFacility?.deleteMany?.({});
    await prisma.youthScout?.deleteMany?.({});
    await prisma.squadRegistration?.deleteMany?.({});
    await prisma.fixture?.deleteMany?.({});
    await prisma.clubFinances?.deleteMany?.({});
    await prisma.sponsorship?.deleteMany?.({});
    await prisma.boardMember?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.player.deleteMany({});
    await prisma.gateReceipt?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.matchEvent?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.$disconnect();
  });

  it('sets training focus for a player', async () => {
    const league = await prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const club = await prisma.club.create({ data: {
      name: 'Training Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: {
      name: 'Test Player',
      clubId: club.id,
      position: 'DEF',
      skill: 60,
      age: 22,
      wage: 1000,
      contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contractStart: new Date(),
      nationality: 'NED',
      potential: 80,
      currentPotential: 60
    }});
    const focus = await TrainingService.setTrainingFocus({
      playerId: player.id,
      clubId: club.id,
      focus: 'technical',
      isExtra: false,
      startDate: new Date()
    });
    expect(focus).toBeDefined();
    expect(focus.playerId).toBe(player.id);
    expect(focus.clubId).toBe(club.id);
    expect(focus.focus).toBe('technical');
    expect(focus.isExtra).toBe(false);
  });

  it('prevents duplicate training focus for the same type', async () => {
    const league = await prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const club = await prisma.club.create({ data: {
      name: 'Training Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: {
      name: 'Test Player',
      clubId: club.id,
      position: 'DEF',
      skill: 60,
      age: 22,
      wage: 1000,
      contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contractStart: new Date(),
      nationality: 'NED',
      potential: 80,
      currentPotential: 60
    }});
    await TrainingService.setTrainingFocus({
      playerId: player.id,
      clubId: club.id,
      focus: 'technical',
      isExtra: false,
      startDate: new Date()
    });
    // Try to set again (should update or throw, depending on logic)
    const focus = await TrainingService.setTrainingFocus({
      playerId: player.id,
      clubId: club.id,
      focus: 'tactical',
      isExtra: false,
      startDate: new Date()
    });
    expect(focus).toBeDefined();
    expect(focus.focus).toBe('tactical');
  });

  it('sets extra training focus for a player', async () => {
    const league = await prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const club = await prisma.club.create({ data: {
      name: 'Training Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: {
      name: 'Test Player',
      clubId: club.id,
      position: 'DEF',
      skill: 60,
      age: 22,
      wage: 1000,
      contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contractStart: new Date(),
      nationality: 'NED',
      potential: 80,
      currentPotential: 60
    }});
    const focus = await TrainingService.setTrainingFocus({
      playerId: player.id,
      clubId: club.id,
      focus: 'physical',
      isExtra: true,
      startDate: new Date()
    });
    expect(focus).toBeDefined();
    expect(focus.isExtra).toBe(true);
  });

  it('prevents duplicate extra training focus', async () => {
    const league = await prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const club = await prisma.club.create({ data: {
      name: 'Training Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    const player = await prisma.player.create({ data: {
      name: 'Test Player',
      clubId: club.id,
      position: 'DEF',
      skill: 60,
      age: 22,
      wage: 1000,
      contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contractStart: new Date(),
      nationality: 'NED',
      potential: 80,
      currentPotential: 60
    }});
    await TrainingService.setTrainingFocus({
      playerId: player.id,
      clubId: club.id,
      focus: 'physical',
      isExtra: true,
      startDate: new Date()
    });
    await expect(
      TrainingService.setTrainingFocus({
        playerId: player.id,
        clubId: club.id,
        focus: 'tactical',
        isExtra: true,
        startDate: new Date()
      })
    ).rejects.toThrow();
  });

  it('returns error for invalid player', async () => {
    const league = await prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    const club = await prisma.club.create({ data: {
      name: 'Training Club',
      leagueId: league.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }});
    await expect(
      TrainingService.setTrainingFocus({
        playerId: 999999,
        clubId: club.id,
        focus: 'technical',
        isExtra: false,
        startDate: new Date()
      })
    ).rejects.toThrow();
  });
}); 