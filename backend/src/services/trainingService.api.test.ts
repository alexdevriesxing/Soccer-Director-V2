import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let testClub: any;
let testPlayer: any;

beforeEach(async () => {
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
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerPersonalStory?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerCareerGoals?.deleteMany?.({});
  await prisma.playerEndorsements?.deleteMany?.({});
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
  await prisma.trainingFocus.deleteMany({});
  // Now delete players, clubs, leagues
  await prisma.player?.deleteMany?.({});
  await prisma.club?.deleteMany?.({});
  await prisma.league?.deleteMany?.({});
  // --- Robust test data creation ---
  // Always create a new league, club, and player for each test
  testLeague = await prisma.league.create({
    data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
  });
  testClub = await prisma.club.create({
    data: {
      name: 'Test Club',
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
    data: { name: 'Test Player', clubId: testClub.id, position: 'MID', age: 22, skill: 70, nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 70, contractStart: new Date() }
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
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerPersonalStory?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.playerInstructions?.deleteMany?.({});
  await prisma.playerMoraleLog?.deleteMany?.({});
  await prisma.playerMentorship?.deleteMany?.({});
  await prisma.playerCareerGoals?.deleteMany?.({});
  await prisma.playerEndorsements?.deleteMany?.({});
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
  await prisma.trainingFocus.deleteMany({});
  // Now delete players, clubs, leagues
  await prisma.player?.deleteMany?.({});
  await prisma.club?.deleteMany?.({});
  await prisma.league?.deleteMany?.({});
});

describe('Training API', () => {
  it('sets training focus (POST /api/training/focus)', async () => {
    const res = await request(app)
      .post('/api/training/focus')
      .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'technical', isExtra: false });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.playerId).toBe(testPlayer.id);
    expect(res.body.clubId).toBe(testClub.id);
    expect(res.body.focus).toBe('technical');
  });

  it('returns error for invalid player (POST /api/training/focus)', async () => {
    const res = await request(app)
      .post('/api/training/focus')
      .send({ clubId: testClub.id, playerId: 999999, focus: 'technical', isExtra: false });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('sets extra training focus (POST /api/training/extra)', async () => {
    const res = await request(app)
      .post('/api/training/extra')
      .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'physical', isExtra: true });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.isExtra).toBe(true);
  });

  it('returns error for duplicate extra training (POST /api/training/extra)', async () => {
    await request(app)
      .post('/api/training/extra')
      .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'physical', isExtra: true });
    const res = await request(app)
      .post('/api/training/extra')
      .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'tactical', isExtra: true });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
}); 