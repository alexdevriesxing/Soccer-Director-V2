import express from 'express';

import { t } from '../utils/i18n';

const router = express.Router();
// const prisma = new PrismaClient();

// GET /api/manager-profiles - List all manager profiles
router.get('/', async (req, res) => {
  try {
    // Mock data since model missing
    const profiles = [{ id: 1, name: 'Manager 1', reputation: 100 }];
    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_fetch_profiles', (req as any).language || 'en') });
  }
});

// GET /api/manager-profiles/:id - Get a specific manager profile
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    // Mock data
    if (id === 1) {
      return res.json({ profile: { id: 1, name: 'Manager 1', reputation: 100 } });
    }
    return res.status(404).json({ error: t('error.profile_not_found', (req as any).language || 'en') });
  } catch (error) {
    return res.status(500).json({ error: t('error.failed_to_fetch_profile', (req as any).language || 'en') });
  }
});

export default router; 