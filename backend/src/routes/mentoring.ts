import express, { Request, Response } from 'express';
import { MentoringService } from '../services/mentoringService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/mentoring/start
router.post('/start', async (req: Request, res: Response): Promise<void> => {
    try {
        const { mentorId, menteeId } = req.body;
        const mentorship = await MentoringService.startMentorship(mentorId, menteeId);
        res.status(201).json(mentorship);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/mentoring/end
router.post('/end', async (req: Request, res: Response): Promise<void> => {
    try {
        const { mentorshipId, reason } = req.body;
        await MentoringService.endMentorship(mentorshipId, reason);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/mentoring/active/:clubId
router.get('/active/:clubId', async (req: Request, res: Response): Promise<void> => {
    try {
        const clubId = parseInt(req.params.clubId);

        // Find mentorships where both players are at this club (or at least mentor is)
        // Complex query, simplified: find all mentorships where mentor is at club
        const mentorships = await prisma.mentorship.findMany({
            where: {
                status: 'ACTIVE',
                mentor: {
                    currentClubId: clubId
                }
            },
            include: {
                mentor: {
                    select: { id: true, firstName: true, lastName: true, age: true, personalityType: true }
                },
                mentee: {
                    select: { id: true, firstName: true, lastName: true, age: true, personalityType: true }
                }
            }
        });

        res.json(mentorships);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
