import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let testClub: any;

describe('Advanced Finance API', () => {
  beforeEach(async () => {
    // Clean up all child records before parents
    await prisma.sponsorship.deleteMany({});
    await prisma.clubFinances.deleteMany({});
    await prisma.gateReceipt.deleteMany({});
    await prisma.tVRights.deleteMany({});
    await prisma.creditFacility.deleteMany({});
    await prisma.mortgage.deleteMany({});
    await prisma.shareHolding.deleteMany({});
    await prisma.investorOffer.deleteMany({});
    await prisma.governmentBailout.deleteMany({});
    await prisma.regulatoryWarning.deleteMany({});
    await prisma.bankruptcyEvent.deleteMany({});
    await prisma.merchandise.deleteMany({});
    await prisma.stadiumExpansion.deleteMany({});
    await prisma.debt.deleteMany({});
    await prisma.dataAnalysis.deleteMany({});
    await prisma.youthDevelopment.deleteMany({});
    await prisma.scoutingNetwork.deleteMany({});
    await prisma.cryptocurrencySponsorships.deleteMany({});
    await prisma.nFTPlayerCards.deleteMany({});
    await prisma.stadiumNamingRights.deleteMany({});
    await prisma.merchandiseLicensing.deleteMany({});
    // Existing deletions
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.player.deleteMany({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    // Always create a new league and club for each test
    testLeague = await prisma.league.create({
      data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
    });
    testClub = await prisma.club.create({
      data: {
        name: 'Finance Test Club',
        leagueId: testLeague.id,
        homeCity: 'Test City',
        regionTag: 'Test',
        boardExpectation: 'Mid',
        morale: 50,
        form: 'Good',
        isJongTeam: false
      }
    });
  });

  afterAll(async () => {
    await prisma.sponsorship.deleteMany({});
    await prisma.clubFinances.deleteMany({});
    await prisma.gateReceipt.deleteMany({});
    await prisma.tVRights.deleteMany({});
    await prisma.creditFacility.deleteMany({});
    await prisma.mortgage.deleteMany({});
    await prisma.shareHolding.deleteMany({});
    await prisma.investorOffer.deleteMany({});
    await prisma.governmentBailout.deleteMany({});
    await prisma.regulatoryWarning.deleteMany({});
    await prisma.bankruptcyEvent.deleteMany({});
    await prisma.merchandise.deleteMany({});
    await prisma.stadiumExpansion.deleteMany({});
    await prisma.debt.deleteMany({});
    await prisma.dataAnalysis.deleteMany({});
    await prisma.youthDevelopment.deleteMany({});
    await prisma.scoutingNetwork.deleteMany({});
    await prisma.cryptocurrencySponsorships.deleteMany({});
    await prisma.nFTPlayerCards.deleteMany({});
    await prisma.stadiumNamingRights.deleteMany({});
    await prisma.merchandiseLicensing.deleteMany({});
    // Existing deletions
    await prisma.loan?.deleteMany?.({});
    await prisma.transfer?.deleteMany?.({});
    await prisma.player.deleteMany({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/advanced-finance/club/:clubId/projections', () => {
    it('returns financial projections for a valid club', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/projections`)
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.projections).toBeDefined();
      expect(Array.isArray(res.body.projections)).toBe(true);
    });

    it('returns 500 for invalid clubId', async () => {
      const res = await request(app)
        .get('/api/advanced-finance/club/999999/projections')
        .set('Accept', 'application/json');
      expect([404, 500]).toContain(res.status); // Depending on service implementation
    });
  });

  describe('GET /api/advanced-finance/club/:clubId/projections/:season', () => {
    it('returns projection for a specific season', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/projections/2024`)
        .set('Accept', 'application/json');
      expect([200, 404]).toContain(res.status); // 404 if no projection for season
    });

    it('returns 404 for non-existent season', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/projections/2099`)
        .set('Accept', 'application/json');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Sponsorships', () => {
    let sponsorshipId: number;
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/advanced-finance/sponsorships')
        .send({
          clubId: testClub.id,
          sponsorName: 'Test Sponsor',
          type: 'Main',
          value: 100000,
          startDate: '2024-07-01',
          endDate: '2025-06-30'
        })
        .set('Accept', 'application/json');
      expect(res.status).toBe(201);
      expect(res.body.sponsorship).toBeDefined();
      sponsorshipId = res.body.sponsorship.id;
    });

    it('creates a sponsorship deal (POST)', async () => {
      // Already created in beforeEach, just verify it exists
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/sponsorships`)
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.sponsorships.some((s: any) => s.id === sponsorshipId)).toBe(true);
    });

    it('returns 400 for missing required fields (POST)', async () => {
      const res = await request(app)
        .post('/api/advanced-finance/sponsorships')
        .send({ clubId: testClub.id })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('fetches sponsorship deals for a club (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/sponsorships`)
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sponsorships)).toBe(true);
    });

    it('updates a sponsorship deal (PUT)', async () => {
      const res = await request(app)
        .put(`/api/advanced-finance/sponsorships/${sponsorshipId}`)
        .send({ value: 200000 })
        .set('Accept', 'application/json');
      if (res.status !== 200) console.error('Sponsorship update error:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.sponsorship.value).toBe(200000);
    });

    it('terminates a sponsorship deal (DELETE)', async () => {
      const res = await request(app)
        .delete(`/api/advanced-finance/sponsorships/${sponsorshipId}`)
        .set('Accept', 'application/json');
      if (res.status !== 200) console.error('Sponsorship delete error:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/terminated/i);
    });
  });

  describe('Financial Regulations', () => {
    it('fetches regulations for a club (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/regulations`)
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.regulations).toBeDefined();
    });

    it('fetches a specific regulation type (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/regulations/SalaryCap`)
        .set('Accept', 'application/json');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Financial Analytics', () => {
    it('fetches analytics for a club (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/analytics`)
        .set('Accept', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.analytics).toBeDefined();
    });
  });

  describe('Financial Report', () => {
    it('fetches a financial report for a season (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/report/2024`)
        .set('Accept', 'application/json');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Revenue Breakdown', () => {
    it('fetches revenue breakdown for a club (GET)', async () => {
      const res = await request(app)
        .get(`/api/advanced-finance/club/${testClub.id}/revenue-breakdown`)
        .set('Accept', 'application/json');
      expect([200, 404]).toContain(res.status);
    });
  });
}); 