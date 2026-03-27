import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// In-memory storage for manager profiles (model doesn't exist)
interface ManagerProfile {
  id: number;
  userId?: number;
  name: string;
  nationality: string;
  experience: number;
  reputation: number;
  managingClubId?: number;
}

const profilesStore: Map<number, ManagerProfile> = new Map();
let nextProfileId = 1;

// Get all profiles
router.get('/', async (_req, res) => {
  try {
    const profiles = Array.from(profilesStore.values());
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get profile by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const profile = profilesStore.get(id);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create profile
router.post('/', async (req, res) => {
  try {
    const { name, nationality, experience = 0, reputation = 50, managingClubId } = req.body;
    if (!name || !nationality) {
      res.status(400).json({ error: 'Name and nationality are required' });
      return;
    }

    const profile: ManagerProfile = {
      id: nextProfileId++,
      name,
      nationality,
      experience,
      reputation,
      managingClubId
    };
    profilesStore.set(profile.id, profile);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = profilesStore.get(id);
    if (!existing) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const updated = { ...existing, ...req.body };
    profilesStore.set(id, updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Select a club for the profile
router.post('/:id/select-club', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { clubId } = req.body;

    const profile = profilesStore.get(id);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { players: true, finances: true }
    });

    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    profile.managingClubId = clubId;
    profilesStore.set(id, profile);

    res.json({ profile, club });
  } catch (error) {
    res.status(500).json({ error: 'Failed to select club' });
  }
});

// Get available clubs
router.get('/clubs/available', async (_req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true, city: true, morale: true }
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available clubs' });
  }
});

export default router;
