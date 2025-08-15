import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let testClub: any;
let testPlayer: any;

beforeEach(async () => {
  // --- Full teardown for all child records referencing clubId, playerId, leagueId ---
  await prisma.liveMatchEvent?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerCareerStat?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.contractNegotiation?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.trainingFocus?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.transferOffer?.deleteMany?.({});
  await prisma.clubFormation?.deleteMany?.({});
  await prisma.clubStrategy?.deleteMany?.({});
  await prisma.clubFinances?.deleteMany?.({});
  await prisma.sponsorship?.deleteMany?.({});
  await prisma.facility?.deleteMany?.({});
  await prisma.staffContract?.deleteMany?.({});
  await prisma.staff?.deleteMany?.({});
  await prisma.gateReceipt?.deleteMany?.({});
  await prisma.mortgage?.deleteMany?.({});
  await prisma.creditFacility?.deleteMany?.({});
  await prisma.shareHolding?.deleteMany?.({});
  await prisma.investorOffer?.deleteMany?.({});
  await prisma.governmentBailout?.deleteMany?.({});
  await prisma.regulatoryWarning?.deleteMany?.({});
  await prisma.bankruptcyEvent?.deleteMany?.({});
  await prisma.squadRegistration?.deleteMany?.({});
  await prisma.clubSeasonStats?.deleteMany?.({});
  await prisma.startingXI?.deleteMany?.({});
  await prisma.managerProfile?.deleteMany?.({});
  await prisma.youthScout?.deleteMany?.({});
  await prisma.youthAcademy?.deleteMany?.({});
  await prisma.academyFacility?.deleteMany?.({});
  await prisma.fanProtests?.deleteMany?.({});
  await prisma.clubLegends?.deleteMany?.({});
  await prisma.internationalScouting?.deleteMany?.({});
  await prisma.agentRelationships?.deleteMany?.({});
  await prisma.europeanQualification?.deleteMany?.({});
  await prisma.scoutingNetwork?.deleteMany?.({});
  await prisma.youthIntakeEvent?.deleteMany?.({});
  await prisma.youthCompetitionEntry?.deleteMany?.({});
  await prisma.tacticalFamiliarity?.deleteMany?.({});
  await prisma.newsItem?.deleteMany?.({});
  await prisma.socialMedia?.deleteMany?.({});
  await prisma.transferRumors?.deleteMany?.({});
  await prisma.promotionRelegationPlayoffs?.deleteMany?.({});
  await prisma.cupCompetitions?.deleteMany?.({});
  await prisma.leagueReputation?.deleteMany?.({});
  await prisma.seasonHistory?.deleteMany?.({});
  await prisma.tVRights?.deleteMany?.({});
  await prisma.fixture?.deleteMany?.({});
  await prisma.matchEvent?.deleteMany?.({});
  await prisma.startingXISlot?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerPersonalStory?.deleteMany?.({});
  await prisma.youthNews?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
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
    data: { name: 'Test Club', leagueId: testLeague.id, isJongTeam: false }
  });
  testPlayer = await prisma.player.create({
    data: {
      name: 'Test Player',
      position: 'MF',
      age: 22,
      skill: 80,
      nationality: 'Testland',
      wage: 1000,
      contractExpiry: new Date('2025-06-30T00:00:00.000Z'),
      contractStart: new Date('2024-07-01T00:00:00.000Z'),
      potential: 85,
      currentPotential: 80,
      clubId: testClub.id
    }
  });
});

afterEach(async () => {
  // --- Full teardown for all child records referencing clubId, playerId, leagueId ---
  await prisma.liveMatchEvent?.deleteMany?.({});
  await prisma.playerAward?.deleteMany?.({});
  await prisma.playerCareerStat?.deleteMany?.({});
  await prisma.playerRequest?.deleteMany?.({});
  await prisma.contractNegotiation?.deleteMany?.({});
  await prisma.playerContractBonus?.deleteMany?.({});
  await prisma.trainingFocus?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  await prisma.transferOffer?.deleteMany?.({});
  await prisma.clubFormation?.deleteMany?.({});
  await prisma.clubStrategy?.deleteMany?.({});
  await prisma.clubFinances?.deleteMany?.({});
  await prisma.sponsorship?.deleteMany?.({});
  await prisma.facility?.deleteMany?.({});
  await prisma.staffContract?.deleteMany?.({});
  await prisma.staff?.deleteMany?.({});
  await prisma.gateReceipt?.deleteMany?.({});
  await prisma.mortgage?.deleteMany?.({});
  await prisma.creditFacility?.deleteMany?.({});
  await prisma.shareHolding?.deleteMany?.({});
  await prisma.investorOffer?.deleteMany?.({});
  await prisma.governmentBailout?.deleteMany?.({});
  await prisma.regulatoryWarning?.deleteMany?.({});
  await prisma.bankruptcyEvent?.deleteMany?.({});
  await prisma.squadRegistration?.deleteMany?.({});
  await prisma.clubSeasonStats?.deleteMany?.({});
  await prisma.startingXI?.deleteMany?.({});
  await prisma.managerProfile?.deleteMany?.({});
  await prisma.youthScout?.deleteMany?.({});
  await prisma.youthAcademy?.deleteMany?.({});
  await prisma.academyFacility?.deleteMany?.({});
  await prisma.fanProtests?.deleteMany?.({});
  await prisma.clubLegends?.deleteMany?.({});
  await prisma.internationalScouting?.deleteMany?.({});
  await prisma.agentRelationships?.deleteMany?.({});
  await prisma.europeanQualification?.deleteMany?.({});
  await prisma.scoutingNetwork?.deleteMany?.({});
  await prisma.youthIntakeEvent?.deleteMany?.({});
  await prisma.youthCompetitionEntry?.deleteMany?.({});
  await prisma.tacticalFamiliarity?.deleteMany?.({});
  await prisma.newsItem?.deleteMany?.({});
  await prisma.socialMedia?.deleteMany?.({});
  await prisma.transferRumors?.deleteMany?.({});
  await prisma.promotionRelegationPlayoffs?.deleteMany?.({});
  await prisma.cupCompetitions?.deleteMany?.({});
  await prisma.leagueReputation?.deleteMany?.({});
  await prisma.seasonHistory?.deleteMany?.({});
  await prisma.tVRights?.deleteMany?.({});
  await prisma.fixture?.deleteMany?.({});
  await prisma.matchEvent?.deleteMany?.({});
  await prisma.startingXISlot?.deleteMany?.({});
  await prisma.playerRelationship?.deleteMany?.({});
  await prisma.playerTrait?.deleteMany?.({});
  await prisma.playerInjury?.deleteMany?.({});
  await prisma.playerHabit?.deleteMany?.({});
  await prisma.playerMediaEvent?.deleteMany?.({});
  await prisma.releaseClauses?.deleteMany?.({});
  await prisma.youthPlayerDevelopmentPlan?.deleteMany?.({});
  await prisma.playerPersonalStory?.deleteMany?.({});
  await prisma.youthNews?.deleteMany?.({});
  await prisma.setPieceSpecialists?.deleteMany?.({});
  await prisma.loan?.deleteMany?.({});
  await prisma.transfer?.deleteMany?.({});
  // Now delete players, clubs, leagues
  await prisma.player?.deleteMany?.({});
  await prisma.club?.deleteMany?.({});
  await prisma.league?.deleteMany?.({});
});

describe('Club Tactics & Set Piece Specialists API', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  it('creates, fetches, updates, and deletes a set piece specialist (happy path)', async () => {
    // Create
    let res = await request(app)
      .post(`/api/clubs/${testClub.id}/set-piece-specialist`)
      .send({ playerId: testPlayer.id, type: 'FreeKick', skill: 85 });
    expect(res.status).toBe(201);
    expect(res.body.specialist).toBeDefined();
    const specialistId = res.body.specialist.id;
    // Fetch
    res = await request(app).get(`/api/clubs/${testClub.id}/set-piece-specialists`);
    expect(res.status).toBe(200);
    expect(res.body.specialists.length).toBe(1);
    // Update
    res = await request(app).patch(`/api/clubs/set-piece-specialist/${specialistId}`).send({ skill: 90 });
    expect(res.status).toBe(200);
    expect(res.body.specialist.skill).toBe(90);
    // Delete
    res = await request(app).delete(`/api/clubs/set-piece-specialist/${specialistId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 if player does not belong to club', async () => {
    const otherClub = await prisma.club.create({ data: { name: 'Other Club', leagueId: testLeague.id, homeCity: 'Other City', regionTag: 'Other', boardExpectation: 'Low', morale: 40, form: 'Bad', isJongTeam: false } });
    const otherPlayer = await prisma.player.create({ data: { name: 'Other Player', clubId: otherClub.id, position: 'DEF', skill: 70, age: 22, wage: 800, contractExpiry: new Date(Date.now() + 365*24*60*60*1000), contractStart: new Date(), nationality: 'NED', potential: 80, currentPotential: 70 } });
    const res = await request(app)
      .post(`/api/clubs/${testClub.id}/set-piece-specialist`)
      .send({ playerId: otherPlayer.id, type: 'FreeKick', skill: 75 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not belong/);
  });

  it('returns 409 for duplicate specialist for same player/type', async () => {
    await request(app).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ playerId: testPlayer.id, type: 'FreeKick', skill: 85 });
    const res = await request(app).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ playerId: testPlayer.id, type: 'FreeKick', skill: 90 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
  });

  it('returns 404 for updating/deleting non-existent specialist', async () => {
    let res = await request(app).patch(`/api/clubs/set-piece-specialist/999999`).send({ skill: 80 });
    expect(res.status).toBe(404);
    res = await request(app).delete(`/api/clubs/set-piece-specialist/999999`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for missing required fields', async () => {
    let res = await request(app).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ type: 'FreeKick', skill: 85 });
    expect(res.status).toBe(400);
    res = await request(app).patch(`/api/clubs/set-piece-specialist/1`).send({});
    expect(res.status).toBe(400);
  });

  it('fetches and updates tactics (happy path)', async () => {
    // Update tactics
    let res = await request(app).patch(`/api/clubs/${testClub.id}/tactics`).send({ formation: '4-3-3', style: 'attacking', intensity: 80, width: 60, tempo: 70, approach: 'possession', defensiveStyle: 'high_line', attackingStyle: 'build_up', setPieces: 'short', marking: 'zonal' });
    expect(res.status).toBe(200);
    expect(res.body.formation).toBeDefined();
    expect(res.body.strategy).toBeDefined();
    // Fetch tactics
    res = await request(app).get(`/api/clubs/${testClub.id}/tactics`);
    expect(res.status).toBe(200);
    expect(res.body.formation).toBeDefined();
    expect(res.body.strategy).toBeDefined();
  });
}); 