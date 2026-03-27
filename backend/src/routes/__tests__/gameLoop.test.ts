import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../app';
import { createTestUser, clearDatabase, type TestUtils } from '../../test-utils';
import GameStateService from '../../services/gameStateService';

describe('Game Loop & Progression API', () => {
    let testUtils: TestUtils;
    let authToken: string;

    beforeAll(async () => {
        testUtils = await createTestUser(prisma);
        authToken = testUtils.token;
    });

    afterAll(async () => {
        await clearDatabase(prisma);
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Reset game state for each test
        await prisma.gameState.upsert({
            where: { id: 'main' },
            create: {
                id: 'main',
                currentDate: new Date('2024-07-01').toISOString(),
                season: 2024,
                phase: 'regular_season',
                activeCompetitions: '[]',
                activeClubs: '[]',
                version: '1.0.0'
            },
            update: {
                currentDate: new Date('2024-07-01').toISOString(),
                season: 2024,
                phase: 'regular_season'
            }
        });
        // Force reload internal state
        const service = GameStateService.getInstance();
        await service['loadGameState']();
    });

    describe('GET /api/game-progression/state', () => {
        it('should return the current game state', async () => {
            const res = await request(app)
                .get('/api/game-progression/state')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('currentWeek');
            expect(res.body.data).toHaveProperty('currentSeason');
        });
    });

    describe('POST /api/game-progression/advance-week', () => {
        it('should advance the game week successfully', async () => {
            // Get initial state
            const initialRes = await request(app).get('/api/game-progression/state');
            const initialWeek = initialRes.body.data.currentWeek;

            // Advance week
            const res = await request(app)
                .post('/api/game-progression/advance-week')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.currentWeek).toBe(initialWeek + 1);

            // Verify persistence
            const finalRes = await request(app).get('/api/game-progression/state');
            expect(finalRes.body.data.currentWeek).toBe(initialWeek + 1);
        });
    });

    describe('POST /api/game-progression/set-week/:week', () => {
        it('should set the game week explicitly', async () => {
            const targetWeek = 20;

            const res = await request(app)
                .post(`/api/game-progression/set-week/${targetWeek}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.currentWeek).toBe(targetWeek);
        });

        it('should reject invalid week numbers', async () => {
            await request(app)
                .post('/api/game-progression/set-week/99') // Invalid (> 38)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            await request(app)
                .post('/api/game-progression/set-week/0') // Invalid (< 1)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });

    describe('Full Game Loop Simulation', () => {
        it('should simulate matches scheduled for the current week', async () => {
            // 1. Setup Competition
            const competition = await prisma.competition.create({
                data: {
                    name: 'Eredivisie',
                    type: 'LEAGUE',
                    level: 'EREDIVISIE',
                    season: '2024/2025',
                    country: 'Netherlands'
                }
            });

            // 2. Setup Clubs
            const homeClub = await prisma.club.create({
                data: { name: 'Ajax', reputation: 80 }
            });
            const awayClub = await prisma.club.create({
                data: { name: 'PSV', reputation: 80 }
            });

            // 3. Setup Players (11 for each team to ensure strength calc works)
            const createPlayers = async (clubId: number, count: number) => {
                const playersData = Array.from({ length: count }).map((_, i) => ({
                    firstName: 'Player',
                    lastName: `${clubId}-${i}`,
                    position: 'ST',
                    currentAbility: 70,
                    potentialAbility: 80,
                    dateOfBirth: new Date('2000-01-01'),
                    nationality: 'Netherlands',
                    weeklyWage: 1000,
                    currentClubId: clubId,
                    preferredPositions: '["ST"]',
                    preferredFoot: 'RIGHT'
                }));
                await prisma.player.createMany({ data: playersData });
            };

            await createPlayers(homeClub.id, 11);
            await createPlayers(awayClub.id, 11);

            // Get current week from state to align with GameStateService logic
            const stateRes = await request(app).get('/api/game-progression/state');
            const currentWeek = stateRes.body.data.currentWeek;

            // 4. Setup Fixture for Current Week
            const fixture = await prisma.fixture.create({
                data: {
                    competitionId: competition.id,
                    homeTeamId: homeClub.id,
                    awayTeamId: awayClub.id,
                    matchDay: currentWeek,
                    matchDate: new Date('2024-07-05'),
                    isPlayed: false
                }
            });

            // 5. Advance Week
            const res = await request(app)
                .post('/api/game-progression/advance-week')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);

            // 6. Verify Fixture Result
            const updatedFixture = await prisma.fixture.findUnique({
                where: { id: fixture.id },
                include: { events: true }
            });

            expect(updatedFixture?.isPlayed).toBe(true);
            expect(updatedFixture?.homeScore).not.toBeNull();
            expect(updatedFixture?.awayScore).not.toBeNull();

            if (updatedFixture?.events.length) {
                expect(updatedFixture.events[0]).toHaveProperty('minute');
                expect(updatedFixture.events[0]).toHaveProperty('eventType');
            }
        }, 30000);
    });
});
