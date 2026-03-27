import { PrismaClient, Mentorship } from '@prisma/client';
import { PlayerPersonalityService } from './playerPersonalityService';

const prisma = new PrismaClient();

export class MentoringService {

    /**
     * Start a new mentorship relationship
     */
    static async startMentorship(mentorId: number, menteeId: number): Promise<Mentorship> {
        // 1. Validation
        const mentor = await prisma.player.findUnique({ where: { id: mentorId } });
        const mentee = await prisma.player.findUnique({ where: { id: menteeId } });

        if (!mentor || !mentee) throw new Error('Player not found');
        if (mentor.currentClubId !== mentee.currentClubId) throw new Error('Players must be at the same club');
        if ((mentor.age || 0) <= (mentee.age || 0)) throw new Error('Mentor must be older than mentee');
        if ((mentor.age || 0) < 23) throw new Error('Mentor must be at least 23');
        if ((mentee.age || 0) > 22) throw new Error('Mentee must be under 23');

        // Check existing
        const existing = await prisma.mentorship.findFirst({
            where: {
                menteeId,
                status: 'ACTIVE'
            }
        });

        if (existing) throw new Error('Player already has a mentor');

        // 2. Create
        return await prisma.mentorship.create({
            data: {
                mentorId,
                menteeId,
                status: 'ACTIVE',
                startDate: new Date()
            }
        });
    }

    /**
     * Cancel or end a mentorship
     */
    static async endMentorship(mentorshipId: number, reason: string = 'COMPLETED'): Promise<void> {
        await prisma.mentorship.update({
            where: { id: mentorshipId },
            data: {
                status: reason,
                endDate: new Date()
            }
        });
    }

    /**
     * Process all active mentorships (to be run weekly)
     */
    static async processWeeklyMentoring(): Promise<string[]> {
        const activeMentorships = await prisma.mentorship.findMany({
            where: { status: 'ACTIVE' },
            include: { mentor: true, mentee: true }
        });

        const logs: string[] = [];

        for (const m of activeMentorships) {
            if (!m.mentor || !m.mentee) continue;

            // Probability of effect: 10% per week
            if (Math.random() < 0.1) {
                // Determine what transfers: Professionalism, Determination, or a Trait (not impl yet)
                const stat = Math.random() < 0.5 ? 'professionalism' : 'determination';

                let change = 0;
                const mentorVal = m.mentor[stat] || 10;
                const menteeVal = m.mentee[stat] || 10;

                // If mentor is better, small chance to increase mentee
                if (mentorVal > menteeVal) {
                    change = 1;
                }
                // If mentor is worse (bad influence), chance to decrease
                else if (mentorVal < menteeVal - 2) {
                    change = -1;
                }

                if (change !== 0) {
                    await prisma.player.update({
                        where: { id: m.menteeId },
                        data: {
                            [stat]: { increment: change }
                        }
                    });

                    // Re-evaluate personality
                    const newPersonality = await PlayerPersonalityService.updatePlayerPersonalityType(m.menteeId);

                    logs.push(`Mentoring: ${m.mentee.lastName} ${stat} changed by ${change} (Mentor: ${m.mentor.lastName}). New Personality: ${newPersonality}`);
                }
            }

            // Check for completion (e.g. max duration or age limit)
            // For now, let's say after 1 year (approx 52 weeks) random chance to end
            // Or simply manual end. 
            // We'll leave it indefinite until manual cancel or transfer.
        }

        return logs;
    }
}
