import express from 'express';
import { getTransactionsForClub, requestLoan, acceptInvestment, negotiateSponsorship, updateClubFinances, deleteClubFinances, updateSponsorship, deleteSponsorship } from '../services/financeService';
import { errorResponse } from '../utils/errorResponse';
import { t } from '../utils/i18n';

const router = express.Router();

// GET /api/finance/:clubId/transactions
router.get('/:clubId/transactions', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const transactions = await getTransactionsForClub(clubId);
    res.json(transactions);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_get_transactions', (req as any).language || 'en'));
  }
});

// POST /api/finance/request-loan
router.post('/request-loan', async (req, res) => {
  try {
    const { clubId, amount, bankId, type } = req.body;
    const result = await requestLoan(clubId, amount, bankId, type);
    res.json(result);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_request_loan', (req as any).language || 'en'));
  }
});

// POST /api/finance/accept-investment
router.post('/accept-investment', async (req, res) => {
  try {
    const { clubId, investorId, offerId } = req.body;
    const result = await acceptInvestment(clubId, investorId, offerId);
    res.json(result);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_accept_investment', (req as any).language || 'en'));
  }
});

// POST /api/finance/negotiate-sponsorship
router.post('/negotiate-sponsorship', async (req, res) => {
  try {
    const { clubId, sponsorName, type, value, duration } = req.body;
    const result = await negotiateSponsorship(clubId, sponsorName, type, value, duration);
    res.json(result);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_negotiate_sponsorship', (req as any).language || 'en'));
  }
});

// PATCH /api/finance/club-finances/:id
router.patch('/club-finances/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateClubFinances(id, req.body);
    res.json(updated);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_update_financial_record', (req as any).language || 'en'));
  }
});

// DELETE /api/finance/club-finances/:id
router.delete('/club-finances/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteClubFinances(id);
    res.status(204).send();
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_delete_financial_record', (req as any).language || 'en'));
  }
});

// PATCH /api/finance/sponsorship/:id
router.patch('/sponsorship/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateSponsorship(id, req.body);
    res.json(updated);
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_update_sponsorship', (req as any).language || 'en'));
  }
});

// DELETE /api/finance/sponsorship/:id
router.delete('/sponsorship/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteSponsorship(id);
    res.status(204).send();
  } catch (error) {
    errorResponse(res, error, t('error.failed_to_delete_sponsorship', (req as any).language || 'en'));
  }
});

export default router; 