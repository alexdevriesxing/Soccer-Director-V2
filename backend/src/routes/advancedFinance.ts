import express from 'express';
import { PrismaClient } from '@prisma/client';
import { t } from '../utils/i18n';
import AdvancedFinancialService from '../services/advancedFinancialService';

const router = express.Router();
const prisma = new PrismaClient();

// --- FINANCIAL PROJECTIONS ---

// GET /api/advanced-finance/club/:clubId/projections
router.get('/club/:clubId/projections', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { seasons = 3 } = req.query;
    
    const projections = await AdvancedFinancialService.calculateFinancialProjections(
      clubId, 
      parseInt(seasons as string, 10)
    );
    
    res.json({ projections });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_projections', (req as any).language || 'en') });
  }
});

// GET /api/advanced-finance/club/:clubId/projections/:season
router.get('/club/:clubId/projections/:season', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season } = req.params;
    
    const projections = await AdvancedFinancialService.calculateFinancialProjections(clubId, 1);
    const seasonProjection = projections.find(p => p.season === season);
    
    if (!seasonProjection) {
      return res.status(404).json({ error: t('error.projection_not_found', (req as any).language || 'en') });
    }
    
    res.json({ projection: seasonProjection });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_projection', (req as any).language || 'en') });
  }
});

// --- SPONSORSHIP DEALS ---

// POST /api/advanced-finance/sponsorships
router.post('/sponsorships', async (req, res) => {
  try {
    const { clubId, sponsorName, type, value, startDate, endDate, conditions } = req.body;
    
    if (!clubId || !sponsorName || !type || !value || !startDate || !endDate) {
      return res.status(400).json({ error: t('validation.missing_required_fields', (req as any).language || 'en') });
    }

    const sponsorship = await AdvancedFinancialService.createSponsorshipDeal(
      clubId,
      sponsorName,
      type,
      value,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(201).json({ sponsorship });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_create_sponsorship', (req as any).language || 'en') });
  }
});

// GET /api/advanced-finance/club/:clubId/sponsorships
router.get('/club/:clubId/sponsorships', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { status } = req.query;
    
    let deals = await AdvancedFinancialService.getSponsorshipDeals(clubId);
    
    if (status) {
      deals = deals.filter((d: any) => d.status === status);
    }
    
    res.json({ sponsorships: deals });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_sponsorships', (req as any).language || 'en') });
  }
});

// PUT /api/advanced-finance/sponsorships/:dealId
router.put('/sponsorships/:dealId', async (req, res) => {
  try {
    const dealId = parseInt(req.params.dealId, 10);
    const updates = req.body;
    
    const updatedDeal = await AdvancedFinancialService.updateSponsorshipDeal(dealId, updates);
    res.json({ sponsorship: updatedDeal });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_update_sponsorship', (req as any).language || 'en') });
  }
});

// DELETE /api/advanced-finance/sponsorships/:dealId
router.delete('/sponsorships/:dealId', async (req, res) => {
  try {
    const dealId = parseInt(req.params.dealId, 10);
    
    await prisma.sponsorship.update({
      where: { id: dealId },
      data: { isActive: false }
    });
    
    res.json({ message: 'Sponsorship deal terminated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_terminate_sponsorship', (req as any).language || 'en') });
  }
});

// --- FINANCIAL REGULATIONS ---

// GET /api/advanced-finance/club/:clubId/regulations
router.get('/club/:clubId/regulations', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const regulations = await AdvancedFinancialService.calculateFinancialRegulations(clubId);
    res.json({ regulations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_regulations', (req as any).language || 'en') });
  }
});

// GET /api/advanced-finance/club/:clubId/regulations/:type
router.get('/club/:clubId/regulations/:type', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { type } = req.params;
    
    const regulations = await AdvancedFinancialService.calculateFinancialRegulations(clubId);
    const regulation = regulations.find((r: any) => r.regulationType === type);
    
    if (!regulation) {
      return res.status(404).json({ error: t('error.regulation_not_found', (req as any).language || 'en') });
    }
    
    res.json({ regulation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_regulation', (req as any).language || 'en') });
  }
});

// --- FINANCIAL ANALYTICS ---

// GET /api/advanced-finance/club/:clubId/analytics
router.get('/club/:clubId/analytics', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const analytics = await AdvancedFinancialService.getFinancialAnalytics(clubId);
    res.json({ analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_analytics', (req as any).language || 'en') });
  }
});

// GET /api/advanced-finance/club/:clubId/report/:season
router.get('/club/:clubId/report/:season', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season } = req.params;
    
    const report = await AdvancedFinancialService.generateFinancialReport(clubId, season);
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_generate_report', (req as any).language || 'en') });
  }
});

// --- REVENUE ANALYSIS ---

// GET /api/advanced-finance/club/:clubId/revenue-breakdown
router.get('/club/:clubId/revenue-breakdown', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season = '2024/25' } = req.query;
    
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: true,
        sponsorships: { where: { isActive: true } },
        league: true
      }
    });

    if (!club) {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }

    const revenueBreakdown = {
      matchday: AdvancedFinancialService['calculateMatchdayRevenue'](club, season as string),
      broadcasting: AdvancedFinancialService['calculateBroadcastingRevenue'](club, season as string),
      commercial: AdvancedFinancialService['calculateCommercialRevenue'](club, season as string),
      playerSales: AdvancedFinancialService['calculatePlayerSalesRevenue'](club, season as string),
      other: AdvancedFinancialService['calculateOtherRevenue'](club, season as string)
    };

    const totalRevenue = Object.values(revenueBreakdown).reduce((sum: number, value: any) => sum + value, 0);
    
    res.json({ 
      revenueBreakdown,
      totalRevenue,
      percentages: Object.fromEntries(
        Object.entries(revenueBreakdown).map(([key, value]) => [key, (value / totalRevenue) * 100])
      )
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_revenue', (req as any).language || 'en') });
  }
});

// --- EXPENSE ANALYSIS ---

// GET /api/advanced-finance/club/:clubId/expense-breakdown
router.get('/club/:clubId/expense-breakdown', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { season = '2024/25' } = req.query;
    
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: true,
        finances: { orderBy: { season: 'desc' }, take: 1 },
        facilities: true,
        loansFrom: { where: { status: 'active' } }
      }
    });

    if (!club) {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }

    const expenseBreakdown = {
      wages: AdvancedFinancialService['calculateWageExpenses'](club, season as string),
      transfers: AdvancedFinancialService['calculateTransferExpenses'](club, season as string),
      facilities: AdvancedFinancialService['calculateFacilityExpenses'](club, season as string),
      operations: AdvancedFinancialService['calculateOperationExpenses'](club, season as string),
      debt: AdvancedFinancialService['calculateDebtExpenses'](club, season as string)
    };

    const totalExpenses = Object.values(expenseBreakdown).reduce((sum: number, value: any) => sum + value, 0);
    
    res.json({ 
      expenseBreakdown,
      totalExpenses,
      percentages: Object.fromEntries(
        Object.entries(expenseBreakdown).map(([key, value]) => [key, (value / totalExpenses) * 100])
      )
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_expenses', (req as any).language || 'en') });
  }
});

// --- WAGE ANALYSIS ---

// GET /api/advanced-finance/club/:clubId/wage-analysis
router.get('/club/:clubId/wage-analysis', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { players: true }
    });

    if (!club) {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }

    const players = club.players;
    const totalWages = players.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) * 52;
    const averageWage = players.length > 0 ? totalWages / players.length : 0;
    
    const wageAnalysis = {
      totalWages,
      averageWage,
      highestPaid: players.reduce((max: any, p: any) => p.wage > max.wage ? p : max, { wage: 0, name: 'None' }),
      wageDistribution: {
        low: players.filter((p: any) => (p.wage || 0) < 5000).length,
        medium: players.filter((p: any) => (p.wage || 0) >= 5000 && (p.wage || 0) < 15000).length,
        high: players.filter((p: any) => (p.wage || 0) >= 15000).length
      },
      byPosition: {
        GK: players.filter((p: any) => p.position === 'GK').reduce((sum: number, p: any) => sum + (p.wage || 0), 0) * 52,
        DEF: players.filter((p: any) => p.position === 'DEF').reduce((sum: number, p: any) => sum + (p.wage || 0), 0) * 52,
        MID: players.filter((p: any) => p.position === 'MID').reduce((sum: number, p: any) => sum + (p.wage || 0), 0) * 52,
        FWD: players.filter((p: any) => p.position === 'FWD').reduce((sum: number, p: any) => sum + (p.wage || 0), 0) * 52
      }
    };

    res.json({ wageAnalysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_analyze_wages', (req as any).language || 'en') });
  }
});

// --- FINANCIAL TRENDS ---

// GET /api/advanced-finance/club/:clubId/trends
router.get('/club/:clubId/trends', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { seasons = 5 } = req.query;
    
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        finances: { orderBy: { season: 'desc' }, take: parseInt(seasons as string, 10) }
      }
    });

    if (!club) {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }

    const trends = club.finances.map((finance: any) => ({
      season: finance.season,
      balance: finance.balance,
      transferBudget: finance.transferBudget,
      wageBudget: finance.wageBudget,
      revenue: finance.revenue || 0,
      expenses: finance.expenses || 0,
      profit: (finance.revenue || 0) - (finance.expenses || 0)
    }));

    res.json({ trends: trends.reverse() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_fetch_trends', (req as any).language || 'en') });
  }
});

// --- FINANCIAL COMPARISONS ---

// GET /api/advanced-finance/club/:clubId/comparisons
router.get('/club/:clubId/comparisons', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: true,
        finances: { orderBy: { season: 'desc' }, take: 1 },
        league: { include: { clubs: { include: { finances: { orderBy: { season: 'desc' }, take: 1 } } } } }
      }
    });

    if (!club) {
      return res.status(404).json({ error: t('error.club_not_found', (req as any).language || 'en') });
    }

    const leagueClubs = club.league?.clubs || [];
    const clubFinances = club.finances[0];
    
    if (!clubFinances) {
      return res.status(404).json({ error: t('error.financial_data_not_found', (req as any).language || 'en') });
    }

    const comparisons = {
      leaguePosition: {
        balance: leagueClubs
          .map((c: any) => ({ clubId: c.id, clubName: c.name, balance: c.finances[0]?.balance || 0 }))
          .sort((a: any, b: any) => b.balance - a.balance)
          .findIndex((c: any) => c.clubId === clubId) + 1,
        transferBudget: leagueClubs
          .map((c: any) => ({ clubId: c.id, clubName: c.name, transferBudget: c.finances[0]?.transferBudget || 0 }))
          .sort((a: any, b: any) => b.transferBudget - a.transferBudget)
          .findIndex((c: any) => c.clubId === clubId) + 1,
        wageBudget: leagueClubs
          .map((c: any) => ({ clubId: c.id, clubName: c.name, wageBudget: c.finances[0]?.wageBudget || 0 }))
          .sort((a: any, b: any) => b.wageBudget - a.wageBudget)
          .findIndex((c: any) => c.clubId === clubId) + 1
      },
      leagueAverages: {
        balance: leagueClubs.reduce((sum: number, c: any) => sum + (c.finances[0]?.balance || 0), 0) / leagueClubs.length,
        transferBudget: leagueClubs.reduce((sum: number, c: any) => sum + (c.finances[0]?.transferBudget || 0), 0) / leagueClubs.length,
        wageBudget: leagueClubs.reduce((sum: number, c: any) => sum + (c.finances[0]?.wageBudget || 0), 0) / leagueClubs.length
      }
    };

    res.json({ comparisons });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_calculate_comparisons', (req as any).language || 'en') });
  }
});

// --- FINANCIAL PREDICTIONS ---

// POST /api/advanced-finance/club/:clubId/predict
router.post('/club/:clubId/predict', async (req, res) => {
  try {
    const clubId = parseInt(req.params.clubId, 10);
    const { scenarios = ['optimistic', 'realistic', 'pessimistic'] } = req.body;
    
    const predictions = [];
    
    for (const scenario of scenarios) {
      const projections = await AdvancedFinancialService.calculateFinancialProjections(clubId, 3);
      
      let multiplier = 1.0;
      switch (scenario) {
        case 'optimistic':
          multiplier = 1.2;
          break;
        case 'pessimistic':
          multiplier = 0.8;
          break;
        default:
          multiplier = 1.0;
      }
      
      const adjustedProjections = projections.map(p => ({
        ...p,
        revenue: {
          matchday: p.revenue.matchday * multiplier,
          broadcasting: p.revenue.broadcasting * multiplier,
          commercial: p.revenue.commercial * multiplier,
          playerSales: p.revenue.playerSales * multiplier,
          other: p.revenue.other * multiplier
        },
        expenses: {
          wages: p.expenses.wages * (scenario === 'optimistic' ? 0.9 : scenario === 'pessimistic' ? 1.1 : 1.0),
          transfers: p.expenses.transfers * (scenario === 'optimistic' ? 0.8 : scenario === 'pessimistic' ? 1.2 : 1.0),
          facilities: p.expenses.facilities,
          operations: p.expenses.operations,
          debt: p.expenses.debt
        },
        profit: (p.revenue.matchday + p.revenue.broadcasting + p.revenue.commercial + p.revenue.playerSales + p.revenue.other) * multiplier -
                (p.expenses.wages * (scenario === 'optimistic' ? 0.9 : scenario === 'pessimistic' ? 1.1 : 1.0) +
                 p.expenses.transfers * (scenario === 'optimistic' ? 0.8 : scenario === 'pessimistic' ? 1.2 : 1.0) +
                 p.expenses.facilities + p.expenses.operations + p.expenses.debt)
      }));
      
      predictions.push({
        scenario,
        projections: adjustedProjections
      });
    }
    
    res.json({ predictions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || t('error.failed_to_predict_finances', (req as any).language || 'en') });
  }
});

export default router; 