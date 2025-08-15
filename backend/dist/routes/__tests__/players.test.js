"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const http = __importStar(require("http"));
const test_utils_1 = require("../../test-utils");
const express_1 = __importDefault(require("express"));
const app_1 = require("../../app");
// Helper function to create valid player data
const createValidPlayerData = (overrides = {}) => {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    return Object.assign({ name: `Player ${Math.floor(Math.random() * 1000)}`, position: 'ST', skill: 70, age: 25, nationality: 'Netherlands', wage: 50000, contractExpiry: oneYearFromNow, contractStart: now, potential: 80, currentPotential: 75, personality: 'PROFESSIONAL', morale: 80, fitness: 90, condition: 90, form: 7.5, reputation: 75, value: 5000000, transferStatus: 'NOT_FOR_SALE', transferFee: 0, wageDemand: 60000, squadNumber: Math.floor(Math.random() * 99) + 1, preferredFoot: 'RIGHT', height: 180, weight: 75, clubId: null }, overrides);
};
const app_2 = __importDefault(require("../../app"));
const globals_1 = require("@jest/globals");
// Mock the auth middleware to bypass authentication for testing
const mockAuth = {
    authenticateToken: globals_1.jest.fn((req, _res, next) => {
        req.user = { id: 1, role: 'ADMIN' };
        next();
    })
};
globals_1.jest.mock('../../middleware/auth', () => mockAuth);
(0, globals_1.describe)('Players API', () => {
    let server;
    let testApp;
    let testUtils;
    let authToken;
    (0, globals_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create a new express app for testing
        testApp = (0, express_1.default)();
        // Apply all the middleware and routes from the main app
        testApp.use(express_1.default.json());
        testApp.use(app_2.default);
        // Start the server on a random port
        server = http.createServer(testApp);
        yield new Promise((resolve) => {
            server.listen(0, () => resolve());
        });
        // Create test utilities and get auth token
        testUtils = yield (0, test_utils_1.createTestUser)();
        authToken = testUtils.token;
    }));
    (0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up test data
        yield (0, test_utils_1.clearDatabase)(app_1.prisma);
        yield app_1.prisma.$disconnect();
        // Close any open handles
        if (testUtils) {
            yield testUtils.cleanup();
        }
    }));
    (0, globals_1.describe)('POST /api/players', () => {
        (0, globals_1.it)('should create a new player with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const newPlayer = createValidPlayerData({
                name: 'New Player',
                position: 'ST',
                age: 22,
                skill: 75,
                talent: 80,
                value: 1000000,
            });
            const res = yield (0, supertest_1.default)(testApp)
                .post('/api/players')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPlayer)
                .expect(201);
            (0, globals_1.expect)(res.body).toHaveProperty('id');
            (0, globals_1.expect)(res.body.name).toBe(newPlayer.name);
            (0, globals_1.expect)(res.body.position).toBe(newPlayer.position);
            (0, globals_1.expect)(res.body.skill).toBe(newPlayer.skill);
            // Verify player was created in the database
            const dbPlayer = yield app_1.prisma.player.findUnique({
                where: { id: res.body.id },
                include: { playerTraits: true }
            });
            (0, globals_1.expect)(dbPlayer).toBeDefined();
            (0, globals_1.expect)(dbPlayer === null || dbPlayer === void 0 ? void 0 : dbPlayer.playerTraits).toHaveLength(0);
        }));
        (0, globals_1.it)('should return 400 for invalid player data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                name: '', // Invalid: empty name
                position: 'INVALID', // Invalid position
                skill: 200, // Invalid: out of range
                age: 15, // Invalid: too young
                nationality: '', // Invalid: empty nationality
            };
            const res = yield (0, supertest_1.default)(testApp)
                .post('/api/players')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData)
                .expect(400);
            (0, globals_1.expect)(res.body).toHaveProperty('error');
            (0, globals_1.expect)(res.body.error).toContain('Validation error');
        }));
    });
    (0, globals_1.describe)('GET /api/players', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create test players
            yield app_1.prisma.player.createMany({
                data: [
                    createValidPlayerData({ id: 1, name: 'John Doe', position: 'ST', skill: 80 }),
                    createValidPlayerData({ id: 2, name: 'Jane Smith', position: 'CB', skill: 75 }),
                    createValidPlayerData({ id: 3, name: 'Alex Johnson', position: 'CM', skill: 82 }),
                ],
            });
        }));
        (0, globals_1.it)('should return all players', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(testApp)
                .get('/api/players')
                .expect('Content-Type', /json/)
                .expect(200);
            (0, globals_1.expect)(Array.isArray(response.body.data)).toBe(true);
            (0, globals_1.expect)(response.body.data.length).toBeGreaterThanOrEqual(3);
        }));
        (0, globals_1.it)('should filter players by position', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(testApp)
                .get('/api/players?position=ST')
                .expect('Content-Type', /json/)
                .expect(200);
            (0, globals_1.expect)(Array.isArray(response.body.data)).toBe(true);
            (0, globals_1.expect)(response.body.data.every((p) => p.position === 'ST')).toBe(true);
        }));
    });
    (0, globals_1.describe)('GET /api/players/:id', () => {
        let testPlayer;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test player
            testPlayer = yield app_1.prisma.player.create({
                data: createValidPlayerData({
                    name: 'Test Player',
                    position: 'ST',
                    skill: 80,
                }),
            });
        }));
        (0, globals_1.it)('should return a player by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(testApp)
                .get(`/api/players/${testPlayer.id}`)
                .expect('Content-Type', /json/)
                .expect(200);
            (0, globals_1.expect)(response.body).toHaveProperty('id', testPlayer.id);
            (0, globals_1.expect)(response.body).toHaveProperty('name', testPlayer.name);
        }));
        (0, globals_1.it)('should return 404 for non-existent player', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(testApp)
                .get('/api/players/999999')
                .expect(404);
        }));
    });
    (0, globals_1.describe)('PUT /api/players/:id', () => {
        let testPlayer;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test player
            testPlayer = yield app_1.prisma.player.create({
                data: createValidPlayerData({
                    name: 'Test Player',
                    position: 'ST',
                    skill: 80,
                }),
            });
        }));
        (0, globals_1.it)('should update a player', () => __awaiter(void 0, void 0, void 0, function* () {
            const updates = {
                name: 'Updated Player',
                position: 'CF',
                skill: 85,
            };
            const response = yield (0, supertest_1.default)(testApp)
                .put(`/api/players/${testPlayer.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates)
                .expect(200);
            (0, globals_1.expect)(response.body).toHaveProperty('id', testPlayer.id);
            (0, globals_1.expect)(response.body).toHaveProperty('name', updates.name);
            (0, globals_1.expect)(response.body).toHaveProperty('position', updates.position);
            (0, globals_1.expect)(response.body).toHaveProperty('skill', updates.skill);
        }));
    });
    (0, globals_1.describe)('DELETE /api/players/:id', () => {
        let testPlayer;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test player
            testPlayer = yield app_1.prisma.player.create({
                data: createValidPlayerData({
                    name: 'Player to Delete',
                    position: 'ST',
                    skill: 80,
                }),
            });
        }));
        (0, globals_1.it)('should delete a player', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(testApp)
                .delete(`/api/players/${testPlayer.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
            // Verify player was deleted
            const deletedPlayer = yield app_1.prisma.player.findUnique({
                where: { id: testPlayer.id },
            });
            (0, globals_1.expect)(deletedPlayer).toBeNull();
        }));
    });
    (0, globals_1.describe)('GET /api/players/search', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create test players
            // Create test players with all required fields
            const now = new Date();
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(now.getFullYear() + 1);
            yield app_1.prisma.player.createMany({
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
        }));
        (0, globals_1.it)('should search players by name (case-insensitive)', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_2.default)
                .get('/api/players/search?q=john')
                .expect('Content-Type', /json/)
                .expect(200);
            (0, globals_1.expect)(response.body).toHaveProperty('data');
            (0, globals_1.expect)(Array.isArray(response.body.data)).toBe(true);
            (0, globals_1.expect)(response.body.data.length).toBeGreaterThan(0);
            // Should match both 'John Doe' and 'Alex Johnson'
            (0, globals_1.expect)(response.body.data.some((p) => p.name === 'John Doe')).toBe(true);
            (0, globals_1.expect)(response.body.data.some((p) => p.name === 'Alex Johnson')).toBe(true);
        }));
        (0, globals_1.it)('should return empty array for no matches', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_2.default)
                .get('/api/players/search?q=nonexistent')
                .expect('Content-Type', /json/)
                .expect(200);
            (0, globals_1.expect)(response.body.data).toEqual([]);
        }));
    });
});
