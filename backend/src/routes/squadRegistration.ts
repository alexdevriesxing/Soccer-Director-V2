import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';

const router = express.Router();
const prisma = new PrismaClient();

// --- SQUAD REGISTRATION ---
// POST /api/squad-registration
router.post('/squad-registration', async (req, res) => {
  try {
    const { clubId, season, competition, registeredPlayers } = req.body;
    if (!clubId || !season || !competition || !registeredPlayers || !Array.isArray(registeredPlayers)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    // TODO: Add eligibility checks here
    const registration = await prisma.squadRegistration.create({
      data: { clubId, season, competition, registeredPlayers },
    });
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_register_squad', (req as any).language || 'en') });
  }
});

// PATCH /api/squad-registration/:id
router.patch('/squad-registration/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { registeredPlayers } = req.body;
    if (!registeredPlayers || !Array.isArray(registeredPlayers)) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }
    // TODO: Add eligibility checks here
    const updated = await prisma.squadRegistration.update({ where: { id }, data: { registeredPlayers } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_registration', (req as any).language || 'en') });
  }
});

// GET /api/squad-registration/:id
router.get('/squad-registration/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const registration = await prisma.squadRegistration.findUnique({ where: { id } });
    if (!registration) return res.status(404).json({ error: t('error.squad_registration_not_found', (req as any).language || 'en') });
    res.json(registration);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_registration', (req as any).language || 'en') });
  }
});

// GET /api/squad-registration/:id/validate
router.get('/squad-registration/:id/validate', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const registration = await prisma.squadRegistration.findUnique({ where: { id } });
    if (!registration) return res.status(404).json({ error: t('error.squad_registration_not_found', (req as any).language || 'en') });
    // Example rules (should be dynamic per competition)
    const rules = {
      maxPlayers: 25,
      maxOverage: 3,
      maxForeign: 5,
      minHomegrown: 8,
      ageLimit: 21,
    };
    // Validate registeredPlayers (assume array of player IDs)
    const playerIds = registration.registeredPlayers as number[];
    const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
    const overage = players.filter(p => p.age > rules.ageLimit).length;
    const foreign = players.filter(p => p.nationality !== 'Netherlands').length;
    // TODO: Add homegrown logic
    const errors = [];
    if (playerIds.length > rules.maxPlayers) errors.push('Too many players');
    if (overage > rules.maxOverage) errors.push('Too many overage players');
    if (foreign > rules.maxForeign) errors.push('Too many foreign players');
    // TODO: Check minHomegrown
    res.json({ valid: errors.length === 0, errors });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_validate_registration', (req as any).language || 'en') });
  }
});

// GET /api/squad-registration/rules/:competition
router.get('/squad-registration/rules/:competition', async (req, res) => {
  try {
    const { competition } = req.params;
    // Example rules (should be dynamic per competition)
    const rules = {
      maxPlayers: 25,
      maxOverage: 3,
      maxForeign: 5,
      minHomegrown: 8,
      ageLimit: 21,
    };
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_registration_rules', (req as any).language || 'en') });
  }
});

export default router; 