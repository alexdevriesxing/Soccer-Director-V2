import express, { Request } from 'express';
import { t } from '../utils/i18n';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --- STAFF MANAGEMENT ---

// GET /api/staff/:clubId
router.get('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const staff = await prisma.staff.findMany({
      where: { clubId },
      orderBy: { role: 'asc' }
    });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff', (req as any).language || 'en') });
  }
});

// POST /api/staff/:clubId - Create new staff member
router.post('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { firstName, lastName, role, ability, nationality, weeklyWage, dateOfBirth } = req.body;

    if (!firstName || !lastName || !role) {
      res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
      return;
    }

    const staff = await prisma.staff.create({
      data: {
        clubId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1980-01-01'), // Default DOB if missing
        role,
        ability: ability || 50,
        nationality: nationality || 'Unknown',
        weeklyWage: weeklyWage || 1000,
        contractStart: new Date(),
        contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
      }
    });

    res.status(201).json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_staff', (req as any).language || 'en') });
  }
});

// GET /api/staff/:clubId/:role - Get staff by role
router.get('/:clubId/:role', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const role = req.params.role;

    const staff = await prisma.staff.findMany({
      where: { clubId, role },
      orderBy: { ability: 'desc' }
    });

    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_by_role', (req as any).language || 'en') });
  }
});

// PUT /api/staff/:staffId - Update staff member
router.put('/:staffId', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const updateData = req.body;

    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: updateData
    });

    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_staff', (req as any).language || 'en') });
  }
});

// DELETE /api/staff/:staffId
router.delete('/:staffId', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    await prisma.staff.delete({ where: { id: staffId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_staff', (req as any).language || 'en') });
  }
});

// --- STAFF CONTRACTS (using Staff model contract fields) ---

// GET /api/staff/:staffId/contract
router.get('/:staffId/contract', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        weeklyWage: true,
        contractStart: true,
        contractEnd: true
      }
    });

    if (!staff) {
      res.status(404).json({ error: t('error.staff_not_found', (req as any).language || 'en') });
      return;
    }

    res.json({
      contract: {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        wage: staff.weeklyWage,
        startDate: staff.contractStart,
        endDate: staff.contractEnd
      }
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_contract', (req as any).language || 'en') });
  }
});

// PUT /api/staff/:staffId/contract - Update contract
router.put('/:staffId/contract', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const { startDate, endDate, wage } = req.body;

    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        contractStart: startDate ? new Date(startDate) : undefined,
        contractEnd: endDate ? new Date(endDate) : undefined,
        weeklyWage: wage
      }
    });

    res.json({
      contract: {
        staffId: staff.id,
        wage: staff.weeklyWage,
        startDate: staff.contractStart,
        endDate: staff.contractEnd
      }
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_update_staff_contract', (req as any).language || 'en') });
  }
});

// --- STAFF ANALYTICS ---

// GET /api/staff/:clubId/analytics
router.get('/:clubId/analytics', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);

    const staff = await prisma.staff.findMany({
      where: { clubId }
    });

    const now = new Date();
    const analytics = {
      totalStaff: staff.length,
      byRole: staff.reduce<Record<string, number>>((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {}),
      averageAbility: staff.length > 0
        ? staff.reduce((sum, s) => sum + (s.ability || 0), 0) / staff.length
        : 0,
      totalWages: staff.reduce((sum, s) => sum + (s.weeklyWage || 0), 0),
      expiringContracts: staff.filter(s => {
        if (!s.contractEnd) return false;
        const daysUntilExpiry = (s.contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 90;
      }).length
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_analytics', (req as any).language || 'en') });
  }
});

export default router;