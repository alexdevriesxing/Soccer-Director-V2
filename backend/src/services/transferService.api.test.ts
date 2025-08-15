import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let fromClub: any;
let toClub: any;
let testPlayer: any;

beforeEach(async () => {
  // Full teardown order to avoid FK constraint errors
  await prisma.vARDecisions?.deleteMany?.({});
  await prisma.realTimeTacticalChanges?.deleteMany?.({});
  await prisma.weather?.deleteMany?.({});
  await prisma.pitchConditions?.deleteMany?.({});
  await prisma.playerPosition?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.fanGroup?.deleteMany?.({});
  await prisma.fanEvent?.deleteMany?.({});
  await prisma.fanSentiment?.deleteMany?.({});
  await prisma.squadRegistration?.deleteMany?.({});
  await prisma.tacticalFamiliarity?.deleteMany?.({});
  await prisma.boardMember?.deleteMany?.({});
  await prisma.boardMeeting?.deleteMany?.({});
  await prisma.fanProtests?.deleteMany?.({});
  await prisma.clubLegends?.deleteMany?.({});
  await prisma.playerCareerStat?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.playerEndorsements?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.trainingFocus?.deleteMany?.({});
  await prisma.transferOffer?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.clubFormation?.deleteMany?.({});
  await prisma.clubStrategy?.deleteMany?.({});
  await prisma.clubSeasonStats?.deleteMany?.({});
  // --- Robust test data creation ---
  // Always create a new league, two clubs, and a player for each test
  testLeague = await prisma.league.create({
    data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
  });
  fromClub = await prisma.club.create({
    data: {
      name: 'From Club',
      leagueId: testLeague.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }
  });
  toClub = await prisma.club.create({
    data: {
      name: 'To Club',
      leagueId: testLeague.id,
      homeCity: 'Test City',
      regionTag: 'Test',
      boardExpectation: 'Mid',
      morale: 50,
      form: 'Good',
      isJongTeam: false
    }
  });
  testPlayer = await prisma.player.create({
    data: { name: 'Test Player', clubId: fromClub.id, position: 'MID', age: 22, skill: 70, nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 70, contractStart: new Date() }
  });
});

afterEach(async () => {
  // Delete all child records before parents
  await prisma.vARDecisions?.deleteMany?.({});
  await prisma.realTimeTacticalChanges?.deleteMany?.({});
  await prisma.weather?.deleteMany?.({});
  await prisma.pitchConditions?.deleteMany?.({});
  await prisma.playerPosition?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.fanGroup?.deleteMany?.({});
  await prisma.fanEvent?.deleteMany?.({});
  await prisma.fanSentiment?.deleteMany?.({});
  await prisma.squadRegistration?.deleteMany?.({});
  await prisma.tacticalFamiliarity?.deleteMany?.({});
  await prisma.boardMember?.deleteMany?.({});
  await prisma.boardMeeting?.deleteMany?.({});
  await prisma.fanProtests?.deleteMany?.({});
  await prisma.clubLegends?.deleteMany?.({});
  await prisma.playerCareerStat?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.playerEndorsements?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.trainingFocus?.deleteMany?.({});
  await prisma.transferOffer?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.youthNews?.deleteMany?.({});
  await prisma.offFieldEvent?.deleteMany?.({});
  await prisma.pressureHandling?.deleteMany?.({});
  await prisma.leadershipQualities?.deleteMany?.({});
  await prisma.careerAmbitions?.deleteMany?.({});
  await prisma.playerFatigue?.deleteMany?.({});
  await prisma.injuryRisk?.deleteMany?.({});
  await prisma.playerPsychology?.deleteMany?.({});
  await prisma.homesickness?.deleteMany?.({});
  await prisma.startingXISlot?.deleteMany?.({});
  await prisma.liveMatchEvent?.deleteMany?.({});
  await prisma.contractNegotiation?.deleteMany?.({});
  // Now delete players, clubs, leagues
  await prisma.player.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.league.deleteMany({});
});

describe('Transfer API', () => {
  it('creates a transfer offer (POST /api/transfers)', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .send({ fromClubId: fromClub.id, toClubId: toClub.id, playerId: testPlayer.id, fee: 100000 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.playerId).toBe(testPlayer.id);
  });

  it('returns error for invalid player (POST /api/transfers)', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .send({ fromClubId: fromClub.id, toClubId: toClub.id, playerId: 999999, fee: 100000 });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('fetches a transfer (GET /api/transfers/:id)', async () => {
    const created = await request(app)
      .post('/api/transfers')
      .send({ fromClubId: fromClub.id, toClubId: toClub.id, playerId: testPlayer.id, fee: 100000 });
    if (created.status !== 200) {
      console.error('Transfer creation failed:', created.body);
      expect(created.status).toBe(200); // Fail early if not created
      return;
    }
    // Add a short delay to ensure the transfer is committed
    await new Promise(resolve => setTimeout(resolve, 50));
    const res = await request(app).get(`/api/transfers/${created.body.id}`);
    if (res.status !== 200) {
      console.error('Transfer fetch failed:', {
        postResponse: created.body,
        getResponse: res.body,
        getStatus: res.status
      });
    }
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.playerId).toBe(testPlayer.id);
  });
}); 