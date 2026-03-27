import express from 'express';

const router = express.Router();

// In-memory storage for boardroom data (methods don't exist on service)
interface BoardMember {
  id: number;
  clubId: number;
  name: string;
  role: string;
  influence: number;
}

interface BoardMeeting {
  id: number;
  clubId: number;
  date: Date;
  topic: string;
  outcome: string;
}

interface BoardObjective {
  id: number;
  clubId: number;
  description: string;
  progress: number;
  deadline: Date;
}

const boardMembersStore: Map<number, BoardMember> = new Map();
const boardMeetingsStore: Map<number, BoardMeeting> = new Map();
const boardObjectivesStore: Map<number, BoardObjective> = new Map();

// Get board members
router.get('/:clubId/members', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const members = Array.from(boardMembersStore.values()).filter(m => m.clubId === clubId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
});

// Get board meetings
router.get('/:clubId/meetings', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const meetings = Array.from(boardMeetingsStore.values()).filter(m => m.clubId === clubId);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board meetings' });
  }
});

// Get board objectives
router.get('/:clubId/objectives', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const objectives = Array.from(boardObjectivesStore.values()).filter(o => o.clubId === clubId);
    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board objectives' });
  }
});

// Get board decisions (stub)
router.get('/:clubId/decisions', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    res.json({
      clubId,
      decisions: [],
      message: 'No pending decisions'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board decisions' });
  }
});

// Get board satisfaction
router.get('/:clubId/satisfaction', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    res.json({
      clubId,
      satisfaction: 70 + Math.floor(Math.random() * 20),
      factors: {
        performance: 75,
        finances: 70,
        ambition: 65
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board satisfaction' });
  }
});

export default router;