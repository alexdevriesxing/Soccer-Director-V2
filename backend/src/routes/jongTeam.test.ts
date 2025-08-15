import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let testParentClub: any;

// Helper: mock admin user
const adminReq = (req: any) => {
  req.user = { role: 'admin' };
  return req;
};

describe('Jong Team API', () => {
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
    await prisma.staffContract?.deleteMany?.({});
    await prisma.staff?.deleteMany?.({});
    await prisma.clubFinances?.deleteMany?.({});
    await prisma.sponsorship?.deleteMany?.({});
    await prisma.facility?.deleteMany?.({});
    await prisma.gateReceipt?.deleteMany?.({});
    await prisma.creditFacility?.deleteMany?.({});
    await prisma.mortgage?.deleteMany?.({});
    await prisma.shareHolding?.deleteMany?.({});
    await prisma.investorOffer?.deleteMany?.({});
    await prisma.governmentBailout?.deleteMany?.({});
    await prisma.regulatoryWarning?.deleteMany?.({});
    await prisma.bankruptcyEvent?.deleteMany?.({});
    await prisma.clubFormation?.deleteMany?.({});
    await prisma.clubStrategy?.deleteMany?.({});
    await prisma.trainingFocus?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.youthScout?.deleteMany?.({});
    await prisma.youthIntakeEvent?.deleteMany?.({});
    await prisma.academyFacility?.deleteMany?.({});
    await prisma.boardMember?.deleteMany?.({});
    await prisma.boardMeeting?.deleteMany?.({});
    await prisma.fanGroup?.deleteMany?.({});
    await prisma.youthNews?.deleteMany?.({});
    await prisma.squadChemistry?.deleteMany?.({});
    await prisma.tacticalFamiliarity?.deleteMany?.({});
    await prisma.squadRegistration?.deleteMany?.({});
    await prisma.player?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.fixture?.deleteMany?.({});
    await prisma.matchEvent?.deleteMany?.({});
    await prisma.startingXISlot?.deleteMany?.({});
    await prisma.startingXI?.deleteMany?.({});
    await prisma.managerProfile?.deleteMany?.({});
    await prisma.youthAcademy?.deleteMany?.({});
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
    await prisma.offFieldEvent?.deleteMany?.({});
    await prisma.pressureHandling?.deleteMany?.({});
    await prisma.leadershipQualities?.deleteMany?.({});
    await prisma.careerAmbitions?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.injuryRisk?.deleteMany?.({});
    await prisma.playerPsychology?.deleteMany?.({});
    await prisma.homesickness?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    // Now delete clubs and leagues
    await prisma.club?.deleteMany?.({});
    await prisma.league?.deleteMany?.({});
    // --- Robust test data creation ---
    testLeague = await prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
    testParentClub = await prisma.club.create({ data: { name: 'Parent Club', leagueId: testLeague.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
  });

  afterAll(async () => {
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
    await prisma.staffContract?.deleteMany?.({});
    await prisma.staff?.deleteMany?.({});
    await prisma.clubFinances?.deleteMany?.({});
    await prisma.sponsorship?.deleteMany?.({});
    await prisma.facility?.deleteMany?.({});
    await prisma.gateReceipt?.deleteMany?.({});
    await prisma.creditFacility?.deleteMany?.({});
    await prisma.mortgage?.deleteMany?.({});
    await prisma.shareHolding?.deleteMany?.({});
    await prisma.investorOffer?.deleteMany?.({});
    await prisma.governmentBailout?.deleteMany?.({});
    await prisma.regulatoryWarning?.deleteMany?.({});
    await prisma.bankruptcyEvent?.deleteMany?.({});
    await prisma.clubFormation?.deleteMany?.({});
    await prisma.clubStrategy?.deleteMany?.({});
    await prisma.trainingFocus?.deleteMany?.({});
    await prisma.clubSeasonStats?.deleteMany?.({});
    await prisma.youthScout?.deleteMany?.({});
    await prisma.youthIntakeEvent?.deleteMany?.({});
    await prisma.academyFacility?.deleteMany?.({});
    await prisma.boardMember?.deleteMany?.({});
    await prisma.boardMeeting?.deleteMany?.({});
    await prisma.fanGroup?.deleteMany?.({});
    await prisma.youthNews?.deleteMany?.({});
    await prisma.squadChemistry?.deleteMany?.({});
    await prisma.tacticalFamiliarity?.deleteMany?.({});
    await prisma.squadRegistration?.deleteMany?.({});
    await prisma.player?.deleteMany?.({});
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.fixture?.deleteMany?.({});
    await prisma.matchEvent?.deleteMany?.({});
    await prisma.startingXISlot?.deleteMany?.({});
    await prisma.startingXI?.deleteMany?.({});
    await prisma.managerProfile?.deleteMany?.({});
    await prisma.youthAcademy?.deleteMany?.({});
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
    await prisma.offFieldEvent?.deleteMany?.({});
    await prisma.pressureHandling?.deleteMany?.({});
    await prisma.leadershipQualities?.deleteMany?.({});
    await prisma.careerAmbitions?.deleteMany?.({});
    await prisma.playerFatigue?.deleteMany?.({});
    await prisma.injuryRisk?.deleteMany?.({});
    await prisma.playerPsychology?.deleteMany?.({});
    await prisma.homesickness?.deleteMany?.({});
    await prisma.liveMatchEvent?.deleteMany?.({});
    await prisma.contractNegotiation?.deleteMany?.({});
    // Now delete clubs and leagues
    await prisma.club?.deleteMany?.({});
    await prisma.league?.deleteMany?.({});
    await prisma.$disconnect();
  });

  // Helper to create a Jong team for a parent club
  async function createJongTeam() {
    const res = await request(app)
      .post(`/api/jong-team/${testParentClub.id}`)
      .send({
        name: 'Jong Test',
        leagueId: testLeague.id,
        homeCity: 'Test City',
        regionTag: 'Test',
        boardExpectation: 'Mid',
        morale: 50,
        form: 'Good',
        isJongTeam: true,
        homeKitShirt: '#cccccc',
        homeKitShorts: '#cccccc',
        homeKitSocks: '#cccccc',
        awayKitShirt: '#eeeeee',
        awayKitShorts: '#eeeeee',
        awayKitSocks: '#eeeeee',
        eligibleForPromotion: true,
        regulatoryStatus: 'compliant',
        noSameDivisionAsParent: false,
        academyReputation: 0
      })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.jongTeam).toBeDefined();
    return res.body.jongTeam;
  }

  // Helper to create a player for a club
  async function createPlayer(clubId: number) {
    const player = await prisma.player.create({
      data: {
        name: 'Jong Player',
        clubId,
        position: 'MF',
        skill: 70,
        age: 19,
        wage: 500,
        contractExpiry: new Date('2025-06-30T00:00:00.000Z'),
        contractStart: new Date('2024-07-01T00:00:00.000Z'),
        nationality: 'Testland',
        potential: 80,
        currentPotential: 70
      }
    });
    expect(player).toBeDefined();
    return player;
  }

  // Helper to create staff for a club
  async function createStaff(clubId: number) {
    const res = await request(app)
      .post(`/api/jong-team/${clubId}/staff`)
      .send({ name: 'Coach', role: 'Coach', skill: 80, hiredDate: new Date().toISOString() })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.staff).toBeDefined();
    return res.body.staff;
  }

  it('should create a Jong team (admin)', async () => {
    const jongTeam = await createJongTeam();
    // No further checks needed, helpers already assert
  });

  it('should not create a second Jong team for same parent', async () => {
    await createJongTeam();
    const res = await request(app)
      .post(`/api/jong-team/${testParentClub.id}`)
      .send({ name: 'Jong Test 2', leagueId: testLeague.id })
      .set('Accept', 'application/json');
    expect(res.status).toBe(400);
  });

  it('should fetch Jong team details', async () => {
    const jongTeam = await createJongTeam();
    const res = await request(app).get(`/api/jong-team/${testParentClub.id}`);
    expect(res.status).toBe(200);
    expect(res.body.jongTeam).toBeDefined();
    expect(res.body.jongTeam.id).toBe(jongTeam.id);
  });

  it('should update Jong team (admin)', async () => {
    const jongTeam = await createJongTeam();
    const res = await request(app)
      .patch(`/api/jong-team/${jongTeam.id}`)
      .send({ name: 'Jong Test Updated', leagueId: testLeague.id })
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.jongTeam.name).toBe('Jong Test Updated');
  });

  it('should add a player to Jong team', async () => {
    const jongTeam = await createJongTeam();
    const player = await createPlayer(testParentClub.id);
    const res = await request(app)
      .post(`/api/jong-team/${jongTeam.id}/add-player/${player.id}`)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    const updated = await prisma.player.findUnique({ where: { id: player.id } });
    expect(updated?.clubId).toBe(jongTeam.id);
  });

  it('should promote player to first team', async () => {
    const jongTeam = await createJongTeam();
    const player = await createPlayer(jongTeam.id);
    const res = await request(app)
      .post(`/api/jong-team/${testParentClub.id}/promote-player/${player.id}`)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    const updated = await prisma.player.findUnique({ where: { id: player.id } });
    expect(updated?.clubId).toBe(testParentClub.id);
  });

  it('should add staff to Jong team', async () => {
    const jongTeam = await createJongTeam();
    const staff = await createStaff(jongTeam.id);
    expect(staff).toBeDefined();
  });

  it('should update staff', async () => {
    const jongTeam = await createJongTeam();
    const staff = await createStaff(jongTeam.id);
    const res = await request(app)
      .patch(`/api/jong-team/${jongTeam.id}/staff/${staff.id}`)
      .send({ name: 'Coach Updated', role: 'Coach', skill: 85, hiredDate: new Date().toISOString() })
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.staff.name).toBe('Coach Updated');
  });

  it('should delete staff', async () => {
    const jongTeam = await createJongTeam();
    const staff = await createStaff(jongTeam.id);
    const res = await request(app)
      .delete(`/api/jong-team/${jongTeam.id}/staff/${staff.id}`)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
  });

  it('should get analytics, finances, and notifications', async () => {
    const jongTeam = await createJongTeam();
    const analytics = await request(app).get(`/api/jong-team/${jongTeam.id}/analytics`);
    expect(analytics.status).toBe(200);
    const finances = await request(app).get(`/api/jong-team/${jongTeam.id}/finances`);
    expect(finances.status).toBe(200);
    const notifications = await request(app).get(`/api/jong-team/${jongTeam.id}/notifications`);
    expect(notifications.status).toBe(200);
  });

  it('should delete Jong team (admin)', async () => {
    const jongTeam = await createJongTeam();
    const res = await request(app)
      .delete(`/api/jong-team/${jongTeam.id}`)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
  });
}); 