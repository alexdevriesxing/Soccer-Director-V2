import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/manager-profiles - List all manager profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await prisma.managerProfile.findMany({
      orderBy: { id: 'desc' }
    });
    res.json({ profiles });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_profiles', (req as any).language || 'en') });
  }
});

// GET /api/manager-profiles/:id - Get a specific manager profile
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const profile = await prisma.managerProfile.findUnique({ where: { id } });
    if (!profile) {
      return res.status(404).json({ error: t('error.profile_not_found', (req as any).language || 'en') });
    }
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_profile', (req as any).language || 'en') });
  }
});

export default router; 