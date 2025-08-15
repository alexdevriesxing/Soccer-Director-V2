import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface FinancialProjection {
  clubId: number;
  season: string;
  revenue: {
    matchday: number;
    broadcasting: number;
    commercial: number;
    playerSales: number;
    other: number;
  };
  expenses: {
    wages: number;
    transfers: number;
    facilities: number;
    operations: number;
    debt: number;
  };
  profit: number;
  cashFlow: number;
  projectedBalance: number;
}

export interface SponsorshipDeal {
  id: number;
  clubId: number;
  sponsorName: string;
  type: string;
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface FinancialRegulation {
  clubId: number;
  regulationType: 'ffp' | 'salary_cap' | 'profit_sustainability';
  status: 'compliant' | 'warning' | 'breach';
  currentValue: number;
  limit: number;
  margin: number;
  lastUpdated: Date;
}

export class AdvancedFinancialService {
  // Calculate comprehensive financial projections
  static async calculateFinancialProjections(clubId: number, seasons: number = 3): Promise<FinancialProjection[]> {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: true,
        finances: { orderBy: { season: 'desc' }, take: 1 },
        sponsorships: { where: { isActive: true } },
        facilities: true,
        loansFrom: { where: { status: 'active' } },
        loansTo: { where: { status: 'active' } }
      }
    });

    if (!club) throw new Error('Club not found');

    const projections: FinancialProjection[] = [];
    const currentSeason = club.finances?.[0]?.season || '2024/25';
    const baseFinances = club.finances?.[0];

    for (let i = 0; i < seasons; i++) {
      const season = this.getNextSeason(currentSeason, i);
      const projection = await this.calculateSeasonProjection(club, season, baseFinances);
      projections.push(projection);
    }

    return projections;
  }

  // Calculate projection for a specific season
  private static async calculateSeasonProjection(club: any, season: string, baseFinances: any): Promise<FinancialProjection> {
    // Revenue calculations
    const matchdayRevenue = this.calculateMatchdayRevenue(club, season);
    const broadcastingRevenue = this.calculateBroadcastingRevenue(club, season);
    const commercialRevenue = this.calculateCommercialRevenue(club, season);
    const playerSalesRevenue = this.calculatePlayerSalesRevenue(club, season);
    const otherRevenue = this.calculateOtherRevenue(club, season);

    // Expense calculations
    const wageExpenses = this.calculateWageExpenses(club, season);
    const transferExpenses = this.calculateTransferExpenses(club, season);
    const facilityExpenses = this.calculateFacilityExpenses(club, season);
    const operationExpenses = this.calculateOperationExpenses(club, season);
    const debtExpenses = this.calculateDebtExpenses(club, season);

    const totalRevenue = matchdayRevenue + broadcastingRevenue + commercialRevenue + playerSalesRevenue + otherRevenue;
    const totalExpenses = wageExpenses + transferExpenses + facilityExpenses + operationExpenses + debtExpenses;
    const profit = totalRevenue - totalExpenses;

    return {
      clubId: club.id,
      season,
      revenue: {
        matchday: matchdayRevenue,
        broadcasting: broadcastingRevenue,
        commercial: commercialRevenue,
        playerSales: playerSalesRevenue,
        other: otherRevenue
      },
      expenses: {
        wages: wageExpenses,
        transfers: transferExpenses,
        facilities: facilityExpenses,
        operations: operationExpenses,
        debt: debtExpenses
      },
      profit,
      cashFlow: profit + this.calculateDepreciation(club),
      projectedBalance: (baseFinances?.balance || 0) + profit
    };
  }

  // Calculate matchday revenue
  private static calculateMatchdayRevenue(club: any, season: string): number {
    const avgAttendance = 25000; // Simplified - would be based on club performance
    const avgTicketPrice = 35;
    const homeGames = 19; // League games
    const cupGames = 3; // Estimated cup games
    
    return (avgAttendance * avgTicketPrice * (homeGames + cupGames)) * (1 + Math.random() * 0.2 - 0.1);
  }

  // Calculate broadcasting revenue
  private static calculateBroadcastingRevenue(club: any, season: string): number {
    const baseRevenue = 50000000; // Base broadcasting revenue
    const performanceMultiplier = club.league?.tier === 'Eredivisie' ? 1.2 : 1.0;
    
    return baseRevenue * performanceMultiplier * (1 + Math.random() * 0.1 - 0.05);
  }

  // Calculate commercial revenue
  private static calculateCommercialRevenue(club: any, season: string): number {
    const baseRevenue = 20000000;
    const sponsorshipBonus = club.sponsorships?.length || 0 * 5000000;
    
    return baseRevenue + sponsorshipBonus * (1 + Math.random() * 0.15 - 0.075);
  }

  // Calculate player sales revenue
  private static calculatePlayerSalesRevenue(club: any, season: string): number {
    const highValuePlayers = club.players?.filter((p: any) => p.skill > 80).length || 0;
    const avgSaleValue = 15000000;
    
    return highValuePlayers * avgSaleValue * 0.1; // 10% chance of selling high-value player
  }

  // Calculate other revenue
  private static calculateOtherRevenue(club: any, season: string): number {
    return 5000000 * (1 + Math.random() * 0.2 - 0.1);
  }

  // Calculate wage expenses
  private static calculateWageExpenses(club: any, season: string): number {
    const totalWages = club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0;
    const staffWages = 5000000; // Estimated staff wages
    
    return (totalWages + staffWages) * 52; // Weekly wages * 52 weeks
  }

  // Calculate transfer expenses
  private static calculateTransferExpenses(club: any, season: string): number {
    const transferBudget = club.finances?.[0]?.transferBudget || 0;
    return transferBudget * 0.8; // Assume 80% of budget is spent
  }

  // Calculate facility expenses
  private static calculateFacilityExpenses(club: any, season: string): number {
    const facilityCount = club.facilities?.length || 0;
    const avgFacilityCost = 2000000;
    
    return facilityCount * avgFacilityCost;
  }

  // Calculate operation expenses
  private static calculateOperationExpenses(club: any, season: string): number {
    return 15000000 * (1 + Math.random() * 0.1 - 0.05);
  }

  // Calculate debt expenses
  private static calculateDebtExpenses(club: any, season: string): number {
    const totalDebt = club.loansFrom?.reduce((sum: number, l: any) => sum + (l.amount || 0), 0) || 0;
    const interestRate = 0.05; // 5% interest rate
    
    return totalDebt * interestRate;
  }

  // Calculate depreciation
  private static calculateDepreciation(club: any): number {
    const facilityCount = club.facilities?.length || 0;
    const avgDepreciation = 1000000;
    
    return facilityCount * avgDepreciation;
  }

  // Create sponsorship deal
  static async createSponsorshipDeal(
    clubId: number,
    sponsorName: string,
    type: string,
    value: number,
    startDate: Date,
    endDate: Date
  ): Promise<SponsorshipDeal> {
    const sponsorship: Omit<SponsorshipDeal, 'id'> = {
      clubId,
      sponsorName,
      type,
      value,
      startDate,
      endDate,
      isActive: true
    };

    const created = await prisma.sponsorship.create({
      data: sponsorship
    });

    return { ...created };
  }

  // Get sponsorship deals for a club
  static async getSponsorshipDeals(clubId: number): Promise<SponsorshipDeal[]> {
    const deals = await prisma.sponsorship.findMany({
      where: { clubId },
      orderBy: { startDate: 'desc' }
    });
    return deals;
  }

  // Update sponsorship deal
  static async updateSponsorshipDeal(dealId: number, updates: Partial<SponsorshipDeal>): Promise<SponsorshipDeal> {
    // Only allow updating fields that exist in the schema
    const allowedUpdates: any = {};
    if (updates.sponsorName !== undefined) allowedUpdates.sponsorName = updates.sponsorName;
    if (updates.type !== undefined) allowedUpdates.type = updates.type;
    if (updates.value !== undefined) allowedUpdates.value = updates.value;
    if (updates.startDate !== undefined) allowedUpdates.startDate = updates.startDate;
    if (updates.endDate !== undefined) allowedUpdates.endDate = updates.endDate;
    if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;
    const updated = await prisma.sponsorship.update({
      where: { id: dealId },
      data: allowedUpdates
    });
    return updated;
  }

  // Calculate financial regulations compliance
  static async calculateFinancialRegulations(clubId: number): Promise<FinancialRegulation[]> {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        finances: { orderBy: { season: 'desc' }, take: 1 },
        players: true,
        sponsorships: { where: { isActive: true } }
      }
    });

    if (!club) throw new Error('Club not found');

    const regulations: FinancialRegulation[] = [];

    // FFP (Financial Fair Play) calculation
    const ffpLimit = 5000000; // €5M loss limit
    const currentLoss = club.finances?.[0]?.balance || 0;
    const ffpStatus = currentLoss > -ffpLimit ? 'compliant' : currentLoss > -ffpLimit * 1.5 ? 'warning' : 'breach';

    regulations.push({
      clubId,
      regulationType: 'ffp',
      status: ffpStatus,
      currentValue: currentLoss,
      limit: -ffpLimit,
      margin: currentLoss + ffpLimit,
      lastUpdated: new Date()
    });

    // Salary cap calculation
    const totalWages = club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 * 52;
    const salaryCap = 100000000; // €100M salary cap
    const salaryStatus = totalWages < salaryCap ? 'compliant' : totalWages < salaryCap * 1.1 ? 'warning' : 'breach';

    regulations.push({
      clubId,
      regulationType: 'salary_cap',
      status: salaryStatus,
      currentValue: totalWages,
      limit: salaryCap,
      margin: salaryCap - totalWages,
      lastUpdated: new Date()
    });

    // Profit and sustainability
    const revenue = this.calculateTotalRevenue(club);
    const expenses = this.calculateTotalExpenses(club);
    const profit = revenue - expenses;
    const sustainabilityLimit = -3000000; // €3M loss limit
    const sustainabilityStatus = profit > sustainabilityLimit ? 'compliant' : profit > sustainabilityLimit * 1.5 ? 'warning' : 'breach';

    regulations.push({
      clubId,
      regulationType: 'profit_sustainability',
      status: sustainabilityStatus,
      currentValue: profit,
      limit: sustainabilityLimit,
      margin: profit - sustainabilityLimit,
      lastUpdated: new Date()
    });

    return regulations;
  }

  // Calculate total revenue
  private static calculateTotalRevenue(club: any): number {
    const matchdayRevenue = this.calculateMatchdayRevenue(club, '2024/25');
    const broadcastingRevenue = this.calculateBroadcastingRevenue(club, '2024/25');
    const commercialRevenue = this.calculateCommercialRevenue(club, '2024/25');
    const playerSalesRevenue = this.calculatePlayerSalesRevenue(club, '2024/25');
    const otherRevenue = this.calculateOtherRevenue(club, '2024/25');

    return matchdayRevenue + broadcastingRevenue + commercialRevenue + playerSalesRevenue + otherRevenue;
  }

  // Calculate total expenses
  private static calculateTotalExpenses(club: any): number {
    const wageExpenses = this.calculateWageExpenses(club, '2024/25');
    const transferExpenses = this.calculateTransferExpenses(club, '2024/25');
    const facilityExpenses = this.calculateFacilityExpenses(club, '2024/25');
    const operationExpenses = this.calculateOperationExpenses(club, '2024/25');
    const debtExpenses = this.calculateDebtExpenses(club, '2024/25');

    return wageExpenses + transferExpenses + facilityExpenses + operationExpenses + debtExpenses;
  }

  // Get financial analytics
  static async getFinancialAnalytics(clubId: number): Promise<any> {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        finances: { orderBy: { season: 'desc' }, take: 10 },
        players: true,
        sponsorships: { where: { isActive: true } }
      }
    });

    if (!club) throw new Error('Club not found');

    const analytics = {
      revenueBreakdown: {
        matchday: this.calculateMatchdayRevenue(club, '2024/25'),
        broadcasting: this.calculateBroadcastingRevenue(club, '2024/25'),
        commercial: this.calculateCommercialRevenue(club, '2024/25'),
        playerSales: this.calculatePlayerSalesRevenue(club, '2024/25'),
        other: this.calculateOtherRevenue(club, '2024/25')
      },
      expenseBreakdown: {
        wages: this.calculateWageExpenses(club, '2024/25'),
        transfers: this.calculateTransferExpenses(club, '2024/25'),
        facilities: this.calculateFacilityExpenses(club, '2024/25'),
        operations: this.calculateOperationExpenses(club, '2024/25'),
        debt: this.calculateDebtExpenses(club, '2024/25')
      },
      wageStructure: {
        totalWages: club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 * 52,
        averageWage: club.players?.length || 0 > 0 ? 
          club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 / club.players?.length || 0 * 52 : 0,
        highestPaid: club.players?.reduce((max: any, p: any) => p.wage > max.wage ? p : max, { wage: 0 }),
        wageDistribution: {
          low: club.players?.filter((p: any) => (p.wage || 0) < 5000).length || 0,
          medium: club.players?.filter((p: any) => (p.wage || 0) >= 5000 && (p.wage || 0) < 15000).length || 0,
          high: club.players?.filter((p: any) => (p.wage || 0) >= 15000).length || 0
        }
      },
      sponsorshipValue: club.sponsorships?.reduce((sum: number, s: any) => sum + (s.value || 0), 0) || 0,
      financialHealth: {
        currentBalance: club.finances?.[0]?.balance || 0,
        transferBudget: club.finances?.[0]?.transferBudget || 0,
        wageBudget: club.finances?.[0]?.wageBudget || 0,
        debtRatio: this.calculateDebtRatio(club)
      }
    };

    return analytics;
  }

  // Calculate debt ratio
  private static calculateDebtRatio(club: any): number {
    const totalAssets = club.finances?.[0]?.balance || 0;
    const totalDebt = club.loansFrom?.reduce((sum: number, l: any) => sum + (l.amount || 0), 0) || 0;
    
    return totalAssets > 0 ? totalDebt / totalAssets : 0;
  }

  // Get next season string
  private static getNextSeason(currentSeason: string, offset: number): string {
    const [startYear, endYear] = currentSeason.split('/');
    const newStartYear = parseInt(startYear) + offset;
    const newEndYear = parseInt(endYear) + offset;
    return `${newStartYear}/${newEndYear}`;
  }

  // Generate financial report
  static async generateFinancialReport(clubId: number, season: string): Promise<any> {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        finances: { where: { season }, take: 1 },
        players: true,
        sponsorships: { where: { isActive: true } },
        facilities: true
      }
    });

    if (!club) throw new Error('Club not found');

    const report = {
      season,
      clubName: club.name,
      summary: {
        totalRevenue: this.calculateTotalRevenue(club),
        totalExpenses: this.calculateTotalExpenses(club),
        netProfit: this.calculateTotalRevenue(club) - this.calculateTotalExpenses(club),
        currentBalance: club.finances?.[0]?.balance || 0
      },
      revenueAnalysis: {
        matchday: this.calculateMatchdayRevenue(club, season),
        broadcasting: this.calculateBroadcastingRevenue(club, season),
        commercial: this.calculateCommercialRevenue(club, season),
        playerSales: this.calculatePlayerSalesRevenue(club, season),
        other: this.calculateOtherRevenue(club, season)
      },
      expenseAnalysis: {
        wages: this.calculateWageExpenses(club, season),
        transfers: this.calculateTransferExpenses(club, season),
        facilities: this.calculateFacilityExpenses(club, season),
        operations: this.calculateOperationExpenses(club, season),
        debt: this.calculateDebtExpenses(club, season)
      },
      playerWages: {
        total: club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 * 52,
        average: club.players?.length || 0 > 0 ? 
          club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 / club.players?.length || 0 * 52 : 0,
        highest: club.players?.reduce((max: any, p: any) => p.wage > max.wage ? p : max, { wage: 0, name: 'None' })
      },
      sponsorshipRevenue: club.sponsorships?.reduce((sum: number, s: any) => sum + (s.value || 0), 0) || 0,
      recommendations: this.generateFinancialRecommendations(club)
    };

    return report;
  }

  // Generate financial recommendations
  private static generateFinancialRecommendations(club: any): string[] {
    const recommendations = [];
    const totalWages = club.players?.reduce((sum: number, p: any) => sum + (p.wage || 0), 0) || 0 * 52;
    const revenue = this.calculateTotalRevenue(club);
    const wageToRevenueRatio = totalWages / revenue;

    if (wageToRevenueRatio > 0.7) {
      recommendations.push('Consider reducing wage bill to improve financial sustainability');
    }

    if (club.sponsorships?.length || 0 < 3) {
      recommendations.push('Explore additional sponsorship opportunities to increase revenue');
    }

    const currentBalance = club.finances?.[0]?.balance || 0;
    if (currentBalance < 0) {
      recommendations.push('Focus on cost reduction and revenue generation to improve cash flow');
    }

    const highWagePlayers = club.players?.filter((p: any) => (p.wage || 0) > 20000).length || 0;
    if (highWagePlayers > 5) {
      recommendations.push('Review high-wage players and consider restructuring contracts');
    }

    return recommendations;
  }
}

export default AdvancedFinancialService; 