"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedFinancialService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdvancedFinancialService {
    // Calculate comprehensive financial projections
    static calculateFinancialProjections(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, seasons = 3) {
            var _a, _b, _c;
            const club = yield prisma.club.findUnique({
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
            if (!club)
                throw new Error('Club not found');
            const projections = [];
            const currentSeason = ((_b = (_a = club.finances) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.season) || '2024/25';
            const baseFinances = (_c = club.finances) === null || _c === void 0 ? void 0 : _c[0];
            for (let i = 0; i < seasons; i++) {
                const season = this.getNextSeason(currentSeason, i);
                const projection = yield this.calculateSeasonProjection(club, season, baseFinances);
                projections.push(projection);
            }
            return projections;
        });
    }
    // Calculate projection for a specific season
    static calculateSeasonProjection(club, season, baseFinances) {
        return __awaiter(this, void 0, void 0, function* () {
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
                projectedBalance: ((baseFinances === null || baseFinances === void 0 ? void 0 : baseFinances.balance) || 0) + profit
            };
        });
    }
    // Calculate matchday revenue
    static calculateMatchdayRevenue(club, season) {
        const avgAttendance = 25000; // Simplified - would be based on club performance
        const avgTicketPrice = 35;
        const homeGames = 19; // League games
        const cupGames = 3; // Estimated cup games
        return (avgAttendance * avgTicketPrice * (homeGames + cupGames)) * (1 + Math.random() * 0.2 - 0.1);
    }
    // Calculate broadcasting revenue
    static calculateBroadcastingRevenue(club, season) {
        var _a;
        const baseRevenue = 50000000; // Base broadcasting revenue
        const performanceMultiplier = ((_a = club.league) === null || _a === void 0 ? void 0 : _a.tier) === 'Eredivisie' ? 1.2 : 1.0;
        return baseRevenue * performanceMultiplier * (1 + Math.random() * 0.1 - 0.05);
    }
    // Calculate commercial revenue
    static calculateCommercialRevenue(club, season) {
        var _a;
        const baseRevenue = 20000000;
        const sponsorshipBonus = ((_a = club.sponsorships) === null || _a === void 0 ? void 0 : _a.length) || 0 * 5000000;
        return baseRevenue + sponsorshipBonus * (1 + Math.random() * 0.15 - 0.075);
    }
    // Calculate player sales revenue
    static calculatePlayerSalesRevenue(club, season) {
        var _a;
        const highValuePlayers = ((_a = club.players) === null || _a === void 0 ? void 0 : _a.filter((p) => p.skill > 80).length) || 0;
        const avgSaleValue = 15000000;
        return highValuePlayers * avgSaleValue * 0.1; // 10% chance of selling high-value player
    }
    // Calculate other revenue
    static calculateOtherRevenue(club, season) {
        return 5000000 * (1 + Math.random() * 0.2 - 0.1);
    }
    // Calculate wage expenses
    static calculateWageExpenses(club, season) {
        var _a;
        const totalWages = ((_a = club.players) === null || _a === void 0 ? void 0 : _a.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0;
        const staffWages = 5000000; // Estimated staff wages
        return (totalWages + staffWages) * 52; // Weekly wages * 52 weeks
    }
    // Calculate transfer expenses
    static calculateTransferExpenses(club, season) {
        var _a, _b;
        const transferBudget = ((_b = (_a = club.finances) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transferBudget) || 0;
        return transferBudget * 0.8; // Assume 80% of budget is spent
    }
    // Calculate facility expenses
    static calculateFacilityExpenses(club, season) {
        var _a;
        const facilityCount = ((_a = club.facilities) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const avgFacilityCost = 2000000;
        return facilityCount * avgFacilityCost;
    }
    // Calculate operation expenses
    static calculateOperationExpenses(club, season) {
        return 15000000 * (1 + Math.random() * 0.1 - 0.05);
    }
    // Calculate debt expenses
    static calculateDebtExpenses(club, season) {
        var _a;
        const totalDebt = ((_a = club.loansFrom) === null || _a === void 0 ? void 0 : _a.reduce((sum, l) => sum + (l.amount || 0), 0)) || 0;
        const interestRate = 0.05; // 5% interest rate
        return totalDebt * interestRate;
    }
    // Calculate depreciation
    static calculateDepreciation(club) {
        var _a;
        const facilityCount = ((_a = club.facilities) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const avgDepreciation = 1000000;
        return facilityCount * avgDepreciation;
    }
    // Create sponsorship deal
    static createSponsorshipDeal(clubId, sponsorName, type, value, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const sponsorship = {
                clubId,
                sponsorName,
                type,
                value,
                startDate,
                endDate,
                isActive: true
            };
            const created = yield prisma.sponsorship.create({
                data: sponsorship
            });
            return Object.assign({}, created);
        });
    }
    // Get sponsorship deals for a club
    static getSponsorshipDeals(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deals = yield prisma.sponsorship.findMany({
                where: { clubId },
                orderBy: { startDate: 'desc' }
            });
            return deals;
        });
    }
    // Update sponsorship deal
    static updateSponsorshipDeal(dealId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only allow updating fields that exist in the schema
            const allowedUpdates = {};
            if (updates.sponsorName !== undefined)
                allowedUpdates.sponsorName = updates.sponsorName;
            if (updates.type !== undefined)
                allowedUpdates.type = updates.type;
            if (updates.value !== undefined)
                allowedUpdates.value = updates.value;
            if (updates.startDate !== undefined)
                allowedUpdates.startDate = updates.startDate;
            if (updates.endDate !== undefined)
                allowedUpdates.endDate = updates.endDate;
            if (updates.isActive !== undefined)
                allowedUpdates.isActive = updates.isActive;
            const updated = yield prisma.sponsorship.update({
                where: { id: dealId },
                data: allowedUpdates
            });
            return updated;
        });
    }
    // Calculate financial regulations compliance
    static calculateFinancialRegulations(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const club = yield prisma.club.findUnique({
                where: { id: clubId },
                include: {
                    finances: { orderBy: { season: 'desc' }, take: 1 },
                    players: true,
                    sponsorships: { where: { isActive: true } }
                }
            });
            if (!club)
                throw new Error('Club not found');
            const regulations = [];
            // FFP (Financial Fair Play) calculation
            const ffpLimit = 5000000; // €5M loss limit
            const currentLoss = ((_b = (_a = club.finances) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.balance) || 0;
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
            const totalWages = ((_c = club.players) === null || _c === void 0 ? void 0 : _c.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 * 52;
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
        });
    }
    // Calculate total revenue
    static calculateTotalRevenue(club) {
        const matchdayRevenue = this.calculateMatchdayRevenue(club, '2024/25');
        const broadcastingRevenue = this.calculateBroadcastingRevenue(club, '2024/25');
        const commercialRevenue = this.calculateCommercialRevenue(club, '2024/25');
        const playerSalesRevenue = this.calculatePlayerSalesRevenue(club, '2024/25');
        const otherRevenue = this.calculateOtherRevenue(club, '2024/25');
        return matchdayRevenue + broadcastingRevenue + commercialRevenue + playerSalesRevenue + otherRevenue;
    }
    // Calculate total expenses
    static calculateTotalExpenses(club) {
        const wageExpenses = this.calculateWageExpenses(club, '2024/25');
        const transferExpenses = this.calculateTransferExpenses(club, '2024/25');
        const facilityExpenses = this.calculateFacilityExpenses(club, '2024/25');
        const operationExpenses = this.calculateOperationExpenses(club, '2024/25');
        const debtExpenses = this.calculateDebtExpenses(club, '2024/25');
        return wageExpenses + transferExpenses + facilityExpenses + operationExpenses + debtExpenses;
    }
    // Get financial analytics
    static getFinancialAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const club = yield prisma.club.findUnique({
                where: { id: clubId },
                include: {
                    finances: { orderBy: { season: 'desc' }, take: 10 },
                    players: true,
                    sponsorships: { where: { isActive: true } }
                }
            });
            if (!club)
                throw new Error('Club not found');
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
                    totalWages: ((_a = club.players) === null || _a === void 0 ? void 0 : _a.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 * 52,
                    averageWage: ((_b = club.players) === null || _b === void 0 ? void 0 : _b.length) || 0 > 0 ?
                        ((_c = club.players) === null || _c === void 0 ? void 0 : _c.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 / ((_d = club.players) === null || _d === void 0 ? void 0 : _d.length) || 0 * 52 : 0,
                    highestPaid: (_e = club.players) === null || _e === void 0 ? void 0 : _e.reduce((max, p) => p.wage > max.wage ? p : max, { wage: 0 }),
                    wageDistribution: {
                        low: ((_f = club.players) === null || _f === void 0 ? void 0 : _f.filter((p) => (p.wage || 0) < 5000).length) || 0,
                        medium: ((_g = club.players) === null || _g === void 0 ? void 0 : _g.filter((p) => (p.wage || 0) >= 5000 && (p.wage || 0) < 15000).length) || 0,
                        high: ((_h = club.players) === null || _h === void 0 ? void 0 : _h.filter((p) => (p.wage || 0) >= 15000).length) || 0
                    }
                },
                sponsorshipValue: ((_j = club.sponsorships) === null || _j === void 0 ? void 0 : _j.reduce((sum, s) => sum + (s.value || 0), 0)) || 0,
                financialHealth: {
                    currentBalance: ((_l = (_k = club.finances) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.balance) || 0,
                    transferBudget: ((_o = (_m = club.finances) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.transferBudget) || 0,
                    wageBudget: ((_q = (_p = club.finances) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.wageBudget) || 0,
                    debtRatio: this.calculateDebtRatio(club)
                }
            };
            return analytics;
        });
    }
    // Calculate debt ratio
    static calculateDebtRatio(club) {
        var _a, _b, _c;
        const totalAssets = ((_b = (_a = club.finances) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.balance) || 0;
        const totalDebt = ((_c = club.loansFrom) === null || _c === void 0 ? void 0 : _c.reduce((sum, l) => sum + (l.amount || 0), 0)) || 0;
        return totalAssets > 0 ? totalDebt / totalAssets : 0;
    }
    // Get next season string
    static getNextSeason(currentSeason, offset) {
        const [startYear, endYear] = currentSeason.split('/');
        const newStartYear = parseInt(startYear) + offset;
        const newEndYear = parseInt(endYear) + offset;
        return `${newStartYear}/${newEndYear}`;
    }
    // Generate financial report
    static generateFinancialReport(clubId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const club = yield prisma.club.findUnique({
                where: { id: clubId },
                include: {
                    finances: { where: { season }, take: 1 },
                    players: true,
                    sponsorships: { where: { isActive: true } },
                    facilities: true
                }
            });
            if (!club)
                throw new Error('Club not found');
            const report = {
                season,
                clubName: club.name,
                summary: {
                    totalRevenue: this.calculateTotalRevenue(club),
                    totalExpenses: this.calculateTotalExpenses(club),
                    netProfit: this.calculateTotalRevenue(club) - this.calculateTotalExpenses(club),
                    currentBalance: ((_b = (_a = club.finances) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.balance) || 0
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
                    total: ((_c = club.players) === null || _c === void 0 ? void 0 : _c.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 * 52,
                    average: ((_d = club.players) === null || _d === void 0 ? void 0 : _d.length) || 0 > 0 ?
                        ((_e = club.players) === null || _e === void 0 ? void 0 : _e.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 / ((_f = club.players) === null || _f === void 0 ? void 0 : _f.length) || 0 * 52 : 0,
                    highest: (_g = club.players) === null || _g === void 0 ? void 0 : _g.reduce((max, p) => p.wage > max.wage ? p : max, { wage: 0, name: 'None' })
                },
                sponsorshipRevenue: ((_h = club.sponsorships) === null || _h === void 0 ? void 0 : _h.reduce((sum, s) => sum + (s.value || 0), 0)) || 0,
                recommendations: this.generateFinancialRecommendations(club)
            };
            return report;
        });
    }
    // Generate financial recommendations
    static generateFinancialRecommendations(club) {
        var _a, _b, _c, _d, _e;
        const recommendations = [];
        const totalWages = ((_a = club.players) === null || _a === void 0 ? void 0 : _a.reduce((sum, p) => sum + (p.wage || 0), 0)) || 0 * 52;
        const revenue = this.calculateTotalRevenue(club);
        const wageToRevenueRatio = totalWages / revenue;
        if (wageToRevenueRatio > 0.7) {
            recommendations.push('Consider reducing wage bill to improve financial sustainability');
        }
        if (((_b = club.sponsorships) === null || _b === void 0 ? void 0 : _b.length) || 0 < 3) {
            recommendations.push('Explore additional sponsorship opportunities to increase revenue');
        }
        const currentBalance = ((_d = (_c = club.finances) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.balance) || 0;
        if (currentBalance < 0) {
            recommendations.push('Focus on cost reduction and revenue generation to improve cash flow');
        }
        const highWagePlayers = ((_e = club.players) === null || _e === void 0 ? void 0 : _e.filter((p) => (p.wage || 0) > 20000).length) || 0;
        if (highWagePlayers > 5) {
            recommendations.push('Review high-wage players and consider restructuring contracts');
        }
        return recommendations;
    }
}
exports.AdvancedFinancialService = AdvancedFinancialService;
exports.default = AdvancedFinancialService;
