import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- SOCIAL MEDIA ---

// GET /api/social-media
router.get('/', async (req: Request, res) => {
  try {
    const posts = await prisma.socialMedia.findMany({
      include: {
        club: true,
        player: true
      },
      orderBy: { date: 'desc' }
    });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_social_media', (req as any).language || 'en') });
  }
});

// GET /api/social-media/:postId
router.get('/:postId', async (req: Request, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const post = await prisma.socialMedia.findUnique({
      where: { id: postId },
      include: {
        club: true,
        player: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ error: t('error.social_media_post_not_found', (req as any).language || 'en') });
    }
    
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_social_media_post', (req as any).language || 'en') });
  }
});

// POST /api/social-media
router.post('/', async (req: Request, res) => {
  try {
    const {
      clubId,
      playerId,
      platform,
      content,
      sentiment
    } = req.body;

    if (!content || !platform) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const post = await prisma.socialMedia.create({
      data: {
        clubId,
        playerId,
        platform,
        content,
        sentiment: sentiment || 'Neutral',
        engagement: 0
      },
      include: {
        club: true,
        player: true
      }
    });

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_social_media_post', (req as any).language || 'en') });
  }
});

// PUT /api/social-media/:postId
router.put('/:postId', async (req: Request, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const updateData = req.body;
    
    const post = await prisma.socialMedia.update({
      where: { id: postId },
      data: updateData,
      include: {
        club: true,
        player: true
      }
    });
    
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_social_media_post', (req as any).language || 'en') });
  }
});

// DELETE /api/social-media/:postId
router.delete('/:postId', async (req: Request, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    await prisma.socialMedia.delete({ where: { id: postId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_social_media_post', (req as any).language || 'en') });
  }
});

export default router; 