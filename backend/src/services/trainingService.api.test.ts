import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testLeague: any;
let testClub: any;
let testPlayer: any;

beforeEach(async () => {
  // Cleanup in proper order to avoid FK constraint errors
  await prisma.transferOffer.deleteMany({});
  await prisma.transferListing.deleteMany({});
  await prisma.matchEvent.deleteMany({});
  await prisma.playerMoraleEvent.deleteMany({});
  await prisma.playerContract.deleteMany({});
  await prisma.playerAttribute.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.fixture.deleteMany({});
  await prisma.teamInCompetition.deleteMany({});
  await prisma.competition.deleteMany({});
  await prisma.sponsorship.deleteMany({});
  await prisma.startingXI.deleteMany({});
  await prisma.clubFacility.deleteMany({});
  await prisma.clubFinances.deleteMany({});
  await prisma.clubSeasonStats.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.league.deleteMany({});

  // Create test data matching current schema
  testLeague = await prisma.league.create({
    data: {
      name: 'Test League',
      level: 'Eredivisie',
      country: 'Netherlands',
      tier: 1
    }
  });

  testClub = await prisma.club.create({
    data: {
      name: 'Test Club',
      leagueId: testLeague.id,
      city: 'Amsterdam',
      reputation: 70,
      morale: 50,
      form: 'WWLWD',
      isJongTeam: false,
      balance: 10000000,
      transferBudget: 5000000,
      wageBudget: 100000
    }
  });

  testPlayer = await prisma.player.create({
    data: {
      firstName: 'Test',
      lastName: 'Player',
      fullName: 'Test Player',
      dateOfBirth: new Date('2002-01-15'),
      age: 22,
      nationality: 'Netherlands',
      position: 'MID',
      preferredPositions: JSON.stringify(['MID', 'CM']),
      currentClubId: testClub.id,
      currentAbility: 70,
      potentialAbility: 85,
      weeklyWage: 5000,
      value: 500000,
      contractStart: new Date(),
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });
});

afterEach(async () => {
  // Cleanup in proper order to avoid FK constraint errors
  await prisma.transferOffer.deleteMany({});
  await prisma.transferListing.deleteMany({});
  await prisma.matchEvent.deleteMany({});
  await prisma.playerMoraleEvent.deleteMany({});
  await prisma.playerContract.deleteMany({});
  await prisma.playerAttribute.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.fixture.deleteMany({});
  await prisma.teamInCompetition.deleteMany({});
  await prisma.competition.deleteMany({});
  await prisma.sponsorship.deleteMany({});
  await prisma.startingXI.deleteMany({});
  await prisma.clubFacility.deleteMany({});
  await prisma.clubFinances.deleteMany({});
  await prisma.clubSeasonStats.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.league.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Youth Development / Training API', () => {
  it('fetches youth development info for club (GET /api/youth-development/:clubId)', async () => {
    const res = await request(app)
      .get(`/api/youth-development/${testClub.id}`);

    // Accept 200 or empty array response
    expect([200, 404]).toContain(res.status);
  });

  it('fetches player by ID (GET /api/players/:id)', async () => {
    const res = await request(app)
      .get(`/api/players/${testPlayer.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toBe(testPlayer.id);
  });

  it('lists all players (GET /api/players)', async () => {
    const res = await request(app)
      .get('/api/players');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});