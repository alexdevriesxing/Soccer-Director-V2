import express from 'express';
import { getAcademyFacilities, upgradeFacility, setFacilitySpecialization, getFacilitiesBySpecialization } from '../services/academyFacilityService';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/academy-facility/:clubId
router.get('/:clubId', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const facilities = await getAcademyFacilities(clubId);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_facilities', (req as any).language || 'en') });
  }
});

// POST /api/academy-facility/upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { facilityId } = req.body;
    const facility = await upgradeFacility(facilityId);
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_upgrade_facility', (req as any).language || 'en') });
  }
});

// POST /api/academy-facility/specialize
router.post('/specialize', async (req, res) => {
  try {
    const { facilityId, specialization } = req.body;
    const facility = await setFacilitySpecialization(facilityId, specialization);
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_set_specialization', (req as any).language || 'en') });
  }
});

// GET /api/academy-facility/:clubId/specialization/:specialization
router.get('/:clubId/specialization/:specialization', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const specialization = req.params.specialization;
    const facilities = await getFacilitiesBySpecialization(clubId, specialization);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_get_specialized_facilities', (req as any).language || 'en') });
  }
});

export default router; 