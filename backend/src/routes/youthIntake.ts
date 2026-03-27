import express from 'express';
import { generateYouthIntake, automateIntake } from '../services/youthIntakeService';
import { errorResponse } from '../utils/errorResponse';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/youth-intake/:clubId/generate
router.get('/:clubId/generate', async (req, res) => {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const result = await generateYouthIntake(clubId);
        res.json(result);
    } catch (error) {
        errorResponse(res, error, t('error.failed_to_generate_youth_intake', (req as any).language || 'en'));
    }
});

// POST /api/youth-intake/:clubId/automate
router.post('/:clubId/automate', async (req, res) => {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const result = await automateIntake(clubId);
        res.json(result);
    } catch (error) {
        errorResponse(res, error, t('error.failed_to_automate_youth_intake', (req as any).language || 'en'));
    }
});

export default router;
