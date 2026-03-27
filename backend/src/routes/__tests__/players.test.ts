import request from 'supertest';
import { Player } from '@prisma/client';
import * as http from 'http';
import { createTestUser, clearDatabase, type TestUtils } from '../../test-utils';
import express from 'express';
import { prisma } from '../../app';

// Helper function to create valid player data
const createValidPlayerData = (overrides: Partial<any> = {}) => {
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  return {
    firstName: `Player`,
    lastName: `${Math.floor(Math.random() * 1000)}`,
    position: 'ST',
    currentAbility: 70, // was skill
    potentialAbility: 80, // was potential
    dateOfBirth: new Date(now.getFullYear() - 25, 0, 1), // age -> dateOfBirth
    nationality: 'Netherlands',
    weeklyWage: 50000, // was wage
    contractEnd: oneYearFromNow, // was contractExpiry
    contractStart: now,
    morale: 80,
    currentClubId: null, // was clubId
    preferredPositions: '["ST"]',
    preferredFoot: 'RIGHT',
    // Add other fields as required by the route validation or schema
    ...overrides
  };
};

import { app } from '../../app';
// Jest globals should now be available from environment, removing manual import to avoid conflicts
// import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

// ... (AuthUser and mockAuth seem fine)
type AuthUser = {
  id: number;
  role?: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const mockAuth = {
  authenticateToken: jest.fn((req: express.Request, _res: express.Response, next: () => void) => {
    req.user = { id: 1, role: 'ADMIN' };
    next();
  })
};

jest.mock('../../middleware/auth', () => mockAuth);

describe('Players API', () => {
  let server: http.Server;
  let testApp: express.Express;
  let testUtils: TestUtils;
  let authToken: string;

  beforeAll(async () => {
    testApp = express();
    testApp.use(express.json());
    testApp.use(app);

    server = http.createServer(testApp);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    // Fix: Pass prisma instance to createTestUser if required or update utils
    testUtils = await createTestUser(prisma);
    authToken = testUtils.token;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
    await prisma.$disconnect();
    if (server) server.close();
  });

  describe('POST /api/players', () => {
    it('should create a new player with valid data', async () => {
      const newPlayer = createValidPlayerData({
        firstName: 'New',
        lastName: 'Player',
        position: 'ST',
        currentAbility: 75,
        value: 1000000,
      });

      const res = await request(testApp)
        .post('/api/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPlayer)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.firstName).toBe(newPlayer.firstName);
      expect(res.body.lastName).toBe(newPlayer.lastName);
      expect(res.body.position).toBe(newPlayer.position);

      const dbPlayer = await prisma.player.findUnique({
        where: { id: res.body.id },
      });

      expect(dbPlayer).toBeDefined();
    });

    it('should return 400 for invalid player data', async () => {
      const invalidData = {
        firstName: '',
        position: 'INVALID',
      };

      await request(testApp)
        .post('/api/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/players', () => {
    beforeEach(async () => {
      await prisma.player.createMany({
        data: [
          createValidPlayerData({ firstName: 'John', lastName: 'Doe', position: 'ST', currentAbility: 80 }),
          createValidPlayerData({ firstName: 'Jane', lastName: 'Smith', position: 'CB', currentAbility: 75 }),
          createValidPlayerData({ firstName: 'Alex', lastName: 'Johnson', position: 'CM', currentAbility: 82 }),
        ],
      });
    });

    it('should return all players', async () => {
      const response = await request(testApp)
        .get('/api/players')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter players by position', async () => {
      const response = await request(testApp)
        .get('/api/players?position=ST')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].position).toBe('ST');
      }
    });
  });

  describe('GET /api/players/:id', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          firstName: 'Test',
          lastName: 'Player',
          position: 'ST',
          currentAbility: 80, // was skill
        }),
      });
    });

    it('should return a player by id', async () => {
      const response = await request(testApp)
        .get(`/api/players/${testPlayer.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testPlayer.id);
      expect(response.body).toHaveProperty('firstName', testPlayer.firstName);
    });

    it('should return 404 for non-existent player', async () => {
      await request(testApp)
        .get('/api/players/999999')
        .expect(404);
    });
  });

  describe('PUT /api/players/:id', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          firstName: 'Test',
          lastName: 'Player',
          position: 'ST',
        }),
      });
    });

    it('should update a player', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Player',
        position: 'CF',
      };

      const response = await request(testApp)
        .put(`/api/players/${testPlayer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', testPlayer.id);
      expect(response.body.firstName).toBe(updates.firstName);
      expect(response.body.position).toBe(updates.position);
    });
  });

  describe('DELETE /api/players/:id', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          firstName: 'ToDelete',
          lastName: 'Player',
        }),
      });
    });

    it('should delete a player', async () => {
      await request(testApp)
        .delete(`/api/players/${testPlayer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const deletedPlayer = await prisma.player.findUnique({
        where: { id: testPlayer.id },
      });
      expect(deletedPlayer).toBeNull();
    });
  });
});

