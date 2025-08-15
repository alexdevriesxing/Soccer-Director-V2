import request from 'supertest';
import { Player, Personality } from '@prisma/client';
import * as http from 'http';
import { createTestUser, clearDatabase, type TestUtils } from '../../test-utils';
import express from 'express';
import { prisma } from '../../app';

// Helper function to create valid player data
const createValidPlayerData = (overrides: Partial<Player> = {}) => {
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  
  return {
    name: `Player ${Math.floor(Math.random() * 1000)}`,
    position: 'ST',
    skill: 70,
    age: 25,
    nationality: 'Netherlands',
    wage: 50000,
    contractExpiry: oneYearFromNow,
    contractStart: now,
    potential: 80,
    currentPotential: 75,
    personality: 'PROFESSIONAL' as Personality,
    morale: 80,
    fitness: 90,
    condition: 90,
    form: 7.5,
    reputation: 75,
    value: 5000000,
    transferStatus: 'NOT_FOR_SALE',
    transferFee: 0,
    wageDemand: 60000,
    squadNumber: Math.floor(Math.random() * 99) + 1,
    preferredFoot: 'RIGHT',
    height: 180,
    weight: 75,
    clubId: null,
    ...overrides
  };
};

import app from '../../app';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

// Define a custom interface for the request user
type AuthUser = {
  id: number;
  role?: string;
};

// Extend Express Request type with our custom user
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

// Mock the auth middleware to bypass authentication for testing
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
    // Create a new express app for testing
    testApp = express();
    
    // Apply all the middleware and routes from the main app
    testApp.use(express.json());
    testApp.use(app);
    
    // Start the server on a random port
    server = http.createServer(testApp);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    // Create test utilities and get auth token
    testUtils = await createTestUser();
    authToken = testUtils.token;
  });

  afterAll(async () => {
    // Clean up test data
    await clearDatabase(prisma);
    await prisma.$disconnect();
    
    // Close any open handles
    if (testUtils) {
      await testUtils.cleanup();
    }
  });

  describe('POST /api/players', () => {
    it('should create a new player with valid data', async () => {
      const newPlayer = createValidPlayerData({
        name: 'New Player',
        position: 'ST',
        age: 22,
        skill: 75,
        talent: 80,
        value: 1000000,
      });
      
      const res = await request(testApp)
        .post('/api/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPlayer)
        .expect(201);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newPlayer.name);
      expect(res.body.position).toBe(newPlayer.position);
      expect(res.body.skill).toBe(newPlayer.skill);
      
      // Verify player was created in the database
      const dbPlayer = await prisma.player.findUnique({
        where: { id: res.body.id },
        include: { playerTraits: true }
      });

      expect(dbPlayer).toBeDefined();
      expect(dbPlayer?.playerTraits).toHaveLength(0);
    });

    it('should return 400 for invalid player data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        position: 'INVALID', // Invalid position
        skill: 200, // Invalid: out of range
        age: 15, // Invalid: too young
        nationality: '', // Invalid: empty nationality
      };

      const res = await request(testApp)
        .post('/api/players')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Validation error');
    });
  });

  describe('GET /api/players', () => {
    beforeEach(async () => {
      // Create test players
      await prisma.player.createMany({
        data: [
          createValidPlayerData({ id: 1, name: 'John Doe', position: 'ST', skill: 80 }),
          createValidPlayerData({ id: 2, name: 'Jane Smith', position: 'CB', skill: 75 }),
          createValidPlayerData({ id: 3, name: 'Alex Johnson', position: 'CM', skill: 82 }),
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
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((p: { position: string }) => p.position === 'ST')).toBe(true);
    });
  });

  describe('GET /api/players/:id', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      // Create a test player
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          name: 'Test Player',
          position: 'ST',
          skill: 80,
        }),
      });
    });

    it('should return a player by id', async () => {
      const response = await request(testApp)
        .get(`/api/players/${testPlayer.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', testPlayer.id);
      expect(response.body).toHaveProperty('name', testPlayer.name);
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
      // Create a test player
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          name: 'Test Player',
          position: 'ST',
          skill: 80,
        }),
      });
    });

    it('should update a player', async () => {
      const updates = {
        name: 'Updated Player',
        position: 'CF',
        skill: 85,
      };

      const response = await request(testApp)
        .put(`/api/players/${testPlayer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', testPlayer.id);
      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('position', updates.position);
      expect(response.body).toHaveProperty('skill', updates.skill);
    });
  });

  describe('DELETE /api/players/:id', () => {
    let testPlayer: Player;

    beforeEach(async () => {
      // Create a test player
      testPlayer = await prisma.player.create({
        data: createValidPlayerData({
          name: 'Player to Delete',
          position: 'ST',
          skill: 80,
        }),
      });
    });

    it('should delete a player', async () => {
      await request(testApp)
        .delete(`/api/players/${testPlayer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify player was deleted
      const deletedPlayer = await prisma.player.findUnique({
        where: { id: testPlayer.id },
      });

      expect(deletedPlayer).toBeNull();
    });
  });

  describe('GET /api/players/search', () => {
    beforeEach(async () => {
      // Create test players
      // Create test players with all required fields
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      await prisma.player.createMany({
        data: [
          { 
            name: 'John Doe', 
            position: 'ST', 
            skill: 80, 
            age: 25, 
            nationality: 'Brazil',
            wage: 50000,
            contractExpiry: oneYearFromNow,
            contractStart: now,
            potential: 85,
            currentPotential: 82,
            personality: 'PROFESSIONAL',
            morale: 80,
            fitness: 90,
            condition: 90,
            form: 7.5,
            reputation: 75,
            value: 10000000,
            transferStatus: 'NOT_FOR_SALE',
            transferFee: 0,
            wageDemand: 60000,
            squadNumber: 10,
            preferredFoot: 'RIGHT',
            height: 180,
            weight: 75,
            clubId: null
          },
          { 
            name: 'Jane Smith', 
            position: 'CB', 
            skill: 75, 
            age: 28, 
            nationality: 'England',
            wage: 45000,
            contractExpiry: oneYearFromNow,
            contractStart: now,
            potential: 80,
            currentPotential: 78,
            personality: 'TEAM_PLAYER',
            morale: 85,
            fitness: 88,
            condition: 88,
            form: 7.0,
            reputation: 70,
            value: 8000000,
            transferStatus: 'NOT_FOR_SALE',
            transferFee: 0,
            wageDemand: 50000,
            squadNumber: 5,
            preferredFoot: 'RIGHT',
            height: 185,
            weight: 80,
            clubId: null
          },
          { 
            name: 'Alex Johnson', 
            position: 'CM', 
            skill: 82, 
            age: 26, 
            nationality: 'USA',
            wage: 55000,
            contractExpiry: oneYearFromNow,
            contractStart: now,
            potential: 88,
            currentPotential: 85,
            personality: 'LEADER',
            morale: 90,
            fitness: 92,
            condition: 92,
            form: 8.0,
            reputation: 80,
            value: 12000000,
            transferStatus: 'NOT_FOR_SALE',
            transferFee: 0,
            wageDemand: 65000,
            squadNumber: 8,
            preferredFoot: 'BOTH',
            height: 178,
            weight: 72,
            clubId: null
          }
        ]
      });
    });
    
    it('should search players by name (case-insensitive)', async () => {
      const response = await request(app)
        .get('/api/players/search?q=john')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Define the expected player type for the response
      interface PlayerResponse {
        id: number;
        name: string;
        [key: string]: unknown;
      }

      // Should match both 'John Doe' and 'Alex Johnson'
      expect(response.body.data.some((p: PlayerResponse) => p.name === 'John Doe')).toBe(true);
      expect(response.body.data.some((p: PlayerResponse) => p.name === 'Alex Johnson')).toBe(true);
    });
    
    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/players/search?q=nonexistent')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.data).toEqual([]);
    });
  });
});

