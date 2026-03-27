import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';
import { LiveMatchService } from '../../services/liveMatchService';

const prisma = new PrismaClient();

describe('Match Management API', () => {
    let fixtureId: number;
    let homeClubId: number;
    let awayClubId: number;
    let competitionId: number;

    beforeAll(async () => {
        // Setup clubs
        const homeClub = await prisma.club.create({
            data: { name: 'Live Match Home', reputation: 80 }
        });
        homeClubId = homeClub.id;

        const awayClub = await prisma.club.create({
            data: { name: 'Live Match Away', reputation: 80 }
        });
        awayClubId = awayClub.id;

        // Create players for clubs
        await prisma.player.createMany({
            data: Array.from({ length: 11 }).map((_, i) => ({
                firstName: 'Player',
                lastName: `Home-${i}`,
                position: 'ST',
                currentAbility: 70,
                potentialAbility: 80,
                dateOfBirth: new Date('2000-01-01'),
                nationality: 'Netherlands',
                weeklyWage: 1000,
                currentClubId: homeClubId,
                preferredPositions: '["ST"]',
                preferredFoot: 'RIGHT'
            }))
        });

        await prisma.player.createMany({
            data: Array.from({ length: 11 }).map((_, i) => ({
                firstName: 'Player',
                lastName: `Away-${i}`,
                position: 'GK',
                currentAbility: 70,
                potentialAbility: 80,
                dateOfBirth: new Date('2000-01-01'),
                nationality: 'Netherlands',
                weeklyWage: 1000,
                currentClubId: awayClubId,
                preferredPositions: '["GK"]',
                preferredFoot: 'RIGHT'
            }))
        });

        // Create competition first
        const competition = await prisma.competition.create({
            data: {
                name: 'Live Match League',
                type: 'LEAGUE',
                level: 'EREDIVISIE',
                season: '2024/2025',
                country: 'Netherlands'
            }
        });
        competitionId = competition.id;

        // Create fixture
        const fixture = await prisma.fixture.create({
            data: {
                competitionId: competition.id,
                homeTeamId: homeClubId,
                awayTeamId: awayClubId,
                matchDay: 1,
                matchDate: new Date(),
                isPlayed: false
            }
        });
        fixtureId = fixture.id;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.matchEvent.deleteMany({ where: { fixtureId } });
        if (fixtureId) {
            await prisma.fixture.delete({ where: { id: fixtureId } }).catch(() => { });
        }
        // Delete competition
        await prisma.competition.deleteMany({ where: { id: competitionId } });
        await prisma.player.deleteMany({ where: { currentClubId: { in: [homeClubId, awayClubId] } } });
        await prisma.club.deleteMany({ where: { id: { in: [homeClubId, awayClubId] } } });
        await prisma.$disconnect();
    });

    it('should start a live match', async () => {
        const res = await request(app)
            .post(`/api/match-management/${fixtureId}/start`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.match.fixtureId).toBe(fixtureId);

        // Verify service state
        const state = LiveMatchService.getMatchState(fixtureId);
        expect(state).not.toBeNull();
        expect(state?.isPlaying).toBe(true);
    });

    it('should pause a live match', async () => {
        const res = await request(app)
            .post(`/api/match-management/${fixtureId}/pause`)
            .expect(200);

        expect(res.body.success).toBe(true);

        // Verify service state
        const state = LiveMatchService.getMatchState(fixtureId);
        expect(state?.isPlaying).toBe(false);
    });

    it('should get live match state', async () => {
        // Restart it first
        await request(app).post(`/api/match-management/${fixtureId}/start`);

        const res = await request(app)
            .get(`/api/match-management/${fixtureId}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.match).toHaveProperty('homeTeam');
        expect(res.body.match).toHaveProperty('awayTeam');
        expect(res.body.match).toHaveProperty('ball');
    });
});
