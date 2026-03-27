import { MentoringService } from '../mentoringService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('MentoringService', () => {
    let mentorId: number;
    let menteeId: number;
    let clubId: number;

    beforeAll(async () => {
        // Setup: Create a club and two players
        const club = await prisma.club.create({
            data: {
                name: 'Test Club Mentoring',
                reputation: 50
            }
        });
        clubId = club.id;

        // Mentor (Old, experienced)
        const mentor = await prisma.player.create({
            data: {
                firstName: 'Old',
                lastName: 'Mentor',
                age: 30,
                currentClubId: clubId,
                nationality: 'Test',
                position: 'CM',
                dateOfBirth: new Date('1995-01-01'),
                preferredPositions: '[]',
                professionalism: 18,
                determination: 18
            }
        });
        mentorId = mentor.id;

        // Mentee (Young)
        const mentee = await prisma.player.create({
            data: {
                firstName: 'Young',
                lastName: 'Mentee',
                age: 18,
                currentClubId: clubId,
                nationality: 'Test',
                position: 'CM',
                dateOfBirth: new Date('2007-01-01'),
                preferredPositions: '[]',
                professionalism: 5,
                determination: 5
            }
        });
        menteeId = mentee.id;
    });

    afterAll(async () => {
        // Cleanup
        await prisma.mentorship.deleteMany({ where: { OR: [{ mentorId }, { menteeId }] } });
        await prisma.player.deleteMany({ where: { id: { in: [mentorId, menteeId] } } });
        await prisma.club.delete({ where: { id: clubId } });
        await prisma.$disconnect();
    });

    it('should start a mentorship successfully', async () => {
        const mentorship = await MentoringService.startMentorship(mentorId, menteeId);
        expect(mentorship).toBeDefined();
        expect(mentorship.status).toBe('ACTIVE');
        expect(mentorship.mentorId).toBe(mentorId);
        expect(mentorship.menteeId).toBe(menteeId);
    });

    it('should prevent duplicate mentorships', async () => {
        await expect(MentoringService.startMentorship(mentorId, menteeId))
            .rejects
            .toThrow('Player already has a mentor');
    });

    it('should process weekly mentoring (probabilistic)', async () => {
        // We can't guarantee a stat change due to random chance (10%), but we can verify it runs without error
        const logs = await MentoringService.processWeeklyMentoring();
        expect(Array.isArray(logs)).toBe(true);
    });

    it('should end a mentorship', async () => {
        const mentorship = await prisma.mentorship.findFirst({ where: { mentorId, menteeId } });
        expect(mentorship).not.toBeNull();
        if (mentorship) {
            await MentoringService.endMentorship(mentorship.id, 'COMPLETED');
            const updated = await prisma.mentorship.findUnique({ where: { id: mentorship.id } });
            expect(updated?.status).toBe('COMPLETED');
            expect(updated?.endDate).not.toBeNull();
        }
    });
});
