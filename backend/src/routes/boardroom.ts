import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import { BoardroomService } from '../services/boardroomService';

const router = express.Router();

// GET /api/boardroom/members/:clubId
router.get('/members/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const members = await BoardroomService.getBoardMembers(clubId);
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_board_members') });
  }
});

// GET /api/boardroom/meetings/:clubId
router.get('/meetings/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const meetings = await BoardroomService.getBoardMeetings(clubId);
    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_board_meetings') });
  }
});

// GET /api/boardroom/objectives/:boardMemberId
router.get('/objectives/:boardMemberId', async (req, res) => {
  try {
    const boardMemberId = parseInt(req.params.boardMemberId, 10);
    const objectives = await BoardroomService.getBoardObjectives(boardMemberId);
    res.json({ objectives });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_board_objectives') });
  }
});

// GET /api/boardroom/decisions/:meetingId
router.get('/decisions/:meetingId', async (req, res) => {
  try {
    const boardMeetingId = parseInt(req.params.meetingId, 10);
    const decisions = await BoardroomService.getBoardDecisions(boardMeetingId);
    res.json({ decisions });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_board_decisions') });
  }
});

// GET /api/boardroom/satisfaction/:clubId
router.get('/satisfaction/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const score = await BoardroomService.calculateBoardSatisfaction(clubId);
    res.json({ satisfaction: score });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_board_satisfaction') });
  }
});

export default router; 