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
      include: {
        contracts: true
      },
      orderBy: { role: 'asc' }
    });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff', (req as any).language || 'en') });
  }
});

// POST /api/staff/:clubId
router.post('/:clubId', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const {
      name,
      role,
      skill,
      hiredDate
    } = req.body;

    if (!name || !role || skill == null) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        clubId,
        name,
        role,
        skill,
        hiredDate: hiredDate ? new Date(hiredDate) : new Date()
      },
      include: {
        contracts: true
      }
    });

    res.status(201).json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_staff', (req as any).language || 'en') });
  }
});

// GET /api/staff/:clubId/:role
router.get('/:clubId/:role', async (req: Request, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const role = req.params.role;
    
    const staff = await prisma.staff.findMany({
      where: { clubId, role },
      include: {
        contracts: true
      },
      orderBy: { skill: 'desc' }
    });
    
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_by_role', (req as any).language || 'en') });
  }
});

// PUT /api/staff/:staffId
router.put('/:staffId', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const updateData = req.body;
    
    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
      include: {
        contracts: true
      }
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
    
    // Delete related records first
    await prisma.staffContract.deleteMany({ where: { staffId } });
    
    await prisma.staff.delete({ where: { id: staffId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_delete_staff', (req as any).language || 'en') });
  }
});

// --- STAFF CONTRACTS ---

// GET /api/staff/:staffId/contract
router.get('/:staffId/contract', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const contract = await prisma.staffContract.findFirst({
      where: { staffId }
    });
    res.json({ contract });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_contract', (req as any).language || 'en') });
  }
});

// POST /api/staff/:staffId/contract
router.post('/:staffId/contract', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const {
      startDate,
      endDate,
      wage,
      role
    } = req.body;

    if (!startDate || !endDate || wage == null || !role) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const contract = await prisma.staffContract.create({
      data: {
        staffId,
        clubId: 1, // TODO: Get from staff member's club
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        wage,
        role
      }
    });

    res.status(201).json({ contract });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_create_staff_contract', (req as any).language || 'en') });
  }
});

// PUT /api/staff/:staffId/contract
router.put('/:staffId/contract', async (req: Request, res) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const updateData = req.body;
    
    // First find the contract to get its ID
    const existingContract = await prisma.staffContract.findFirst({
      where: { staffId }
    });
    
    if (!existingContract) {
      return res.status(404).json({ error: t('error.contract_not_found', (req as any).language || 'en') });
    }
    
    const contract = await prisma.staffContract.update({
      where: { id: existingContract.id },
      data: updateData
    });
    
    res.json({ contract });
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
      where: { clubId },
      include: {
        contracts: true
      }
    });

    const analytics = {
      totalStaff: staff.length,
      byRole: staff.reduce((acc: any, s: any) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {}),
      averageSkill: staff.reduce((sum: number, s: any) => sum + s.skill, 0) / staff.length,
      totalWage: staff.reduce((sum: number, s: any) => sum + (s.wage || 0), 0),
      expiringContracts: staff.filter((s: any) => {
        if (!s.contracts) return false;
        const expiryDate = new Date(s.contracts.endDate);
        const now = new Date();
        const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 90;
      }).length
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_staff_analytics', (req as any).language || 'en') });
  }
});

export default router; 