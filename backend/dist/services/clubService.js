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
exports.ClubService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ClubService {
    createClub(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.club.create({ data });
        });
    }
    getClubById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id } });
            if (!club)
                throw new Error('Club not found');
            return club;
        });
    }
    updateClub(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id } });
            if (!club)
                throw new Error('Club not found');
            return prisma.club.update({ where: { id }, data });
        });
    }
    deleteClub(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id } });
            if (!club)
                throw new Error('Club not found');
            return prisma.club.delete({ where: { id } });
        });
    }
    // Get academy reputation for a club
    static getAcademyReputation(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            return club.academyReputation;
        });
    }
    // Update academy reputation for a club (increment or decrement)
    static updateAcademyReputation(clubId, change) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.update({
                where: { id: clubId },
                data: { academyReputation: { increment: change } }
            });
            return club.academyReputation;
        });
    }
    // --- SQUAD MANAGEMENT ---
    getSquad(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, page = 1, limit = 25) {
            const skip = (page - 1) * limit;
            const [players, totalPlayers] = yield prisma.$transaction([
                prisma.player.findMany({
                    where: { clubId },
                    include: { loans: { where: { status: 'active' } } },
                    orderBy: { skill: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.player.count({ where: { clubId } })
            ]);
            const squadStats = {
                totalPlayers,
                available: players.filter((p) => !p.injured && !p.onInternationalDuty && p.loans.length === 0).length,
                injured: players.filter((p) => p.injured).length,
                internationalDuty: players.filter((p) => p.onInternationalDuty).length,
                onLoan: players.filter((p) => p.loans.length > 0).length,
                positions: {
                    GK: players.filter((p) => p.position === 'GK').length,
                    DEF: players.filter((p) => p.position === 'DEF').length,
                    MID: players.filter((p) => p.position === 'MID').length,
                    FWD: players.filter((p) => p.position === 'FWD').length
                }
            };
            return { players, squadStats, totalPlayers, currentPage: page, totalPages: Math.ceil(totalPlayers / limit) };
        });
    }
    getSquadAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const analytics = {
                averageAge: players.reduce((sum, p) => sum + p.age, 0) / players.length,
                averageSkill: players.reduce((sum, p) => sum + p.skill, 0) / players.length,
                averageMorale: players.reduce((sum, p) => sum + (p.morale || 50), 0) / players.length,
                totalWages: players.reduce((sum, p) => sum + p.wage, 0),
                positionDistribution: {
                    GK: players.filter((p) => p.position === 'GK').length,
                    DEF: players.filter((p) => p.position === 'DEF').length,
                    MID: players.filter((p) => p.position === 'MID').length,
                    FWD: players.filter((p) => p.position === 'FWD').length
                },
                nationalityDistribution: players.reduce((acc, p) => {
                    acc[p.nationality] = (acc[p.nationality] || 0) + 1;
                    return acc;
                }, {}),
                contractStatus: {
                    expiringSoon: players.filter((p) => {
                        const daysUntilExpiry = Math.ceil((p.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                    }).length,
                    recentlySigned: players.filter((p) => {
                        const daysSinceSigned = Math.ceil((Date.now() - p.contractStart.getTime()) / (1000 * 60 * 60 * 24));
                        return daysSinceSigned <= 30;
                    }).length
                }
            };
            return analytics;
        });
    }
    // --- FINANCES ---
    getClubFinances(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const finances = yield prisma.clubFinances.findMany({
                where: { clubId },
                orderBy: { week: 'desc' },
                take: 12
            });
            const sponsorships = yield prisma.sponsorship.findMany({
                where: { clubId, isActive: true }
            });
            const totalSponsorshipValue = sponsorships.reduce((sum, s) => sum + s.value, 0);
            return { finances, sponsorships, totalSponsorshipValue };
        });
    }
    getFinancialAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const finances = yield prisma.clubFinances.findMany({
                where: { clubId },
                orderBy: { week: 'desc' },
                take: 52 // Last year
            });
            if (finances.length === 0)
                return null;
            const latest = finances[0];
            const previous = finances[1];
            const analytics = {
                currentBalance: latest.balance,
                balanceChange: previous ? latest.balance - previous.balance : 0,
                weeklyIncome: latest.gateReceiptsTotal + latest.sponsorshipTotal + latest.tvRightsTotal + latest.prizeMoneyTotal,
                weeklyExpenses: latest.playerWagesTotal + latest.staffWagesTotal + latest.facilityCosts + latest.maintenanceCosts,
                transferBudget: latest.transferBudget,
                wageBudget: latest.wageBudget,
                debtRatio: latest.debtTotal / (latest.equityValue + latest.debtTotal),
                marketValue: latest.marketValue
            };
            return analytics;
        });
    }
    // --- FACILITIES ---
    getClubFacilities(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const facilities = yield prisma.facility.findMany({ where: { clubId } });
            const facilityAnalytics = facilities.map((facility) => (Object.assign(Object.assign({}, facility), { upgradeCost: facility.level * 1000000, maintenanceCost: facility.level * 50000, efficiency: facility.level * 10 // Example efficiency calculation
             })));
            return facilityAnalytics;
        });
    }
    upgradeFacility(clubId, facilityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const facility = yield prisma.facility.findUnique({ where: { id: facilityId } });
            if (!facility || facility.clubId !== clubId)
                throw new Error('Facility not found');
            const upgradeCost = facility.level * 1000000;
            // Check if club can afford the upgrade
            const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
            if (!finances || finances.balance < upgradeCost)
                throw new Error('Insufficient funds for facility upgrade');
            // Create upgrade request
            const upgradeRequest = yield prisma.facilityUpgradeRequest.create({
                data: {
                    facilityId,
                    requestedAt: new Date(),
                    status: 'pending',
                }
            });
            // Deduct funds
            yield prisma.clubFinances.update({
                where: { id: finances.id },
                data: { balance: { decrement: upgradeCost } }
            });
            return upgradeRequest;
        });
    }
    // --- STAFF MANAGEMENT ---
    getClubStaff(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const staff = yield prisma.staff.findMany({
                where: { clubId },
                include: { contracts: { where: { isActive: true } } }
            });
            const staffAnalytics = {
                totalStaff: staff.length,
                byRole: staff.reduce((acc, s) => {
                    acc[s.role] = (acc[s.role] || 0) + 1;
                    return acc;
                }, {}),
                averageSkill: staff.reduce((sum, s) => sum + s.skill, 0) / staff.length,
                totalWages: staff.reduce((sum, s) => {
                    const contract = s.contracts[0];
                    return sum + ((contract === null || contract === void 0 ? void 0 : contract.wage) || 0);
                }, 0)
            };
            return { staff, analytics: staffAnalytics };
        });
    }
    hireStaff(clubId, staffData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, role, skill, wage } = staffData;
            // Check wage budget
            const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
            if (!finances || finances.wageBudget < wage)
                throw new Error('Insufficient wage budget');
            const staff = yield prisma.staff.create({
                data: {
                    name,
                    role,
                    skill,
                    clubId,
                    hiredDate: new Date(), // Add missing hiredDate field
                    contracts: {
                        create: {
                            clubId,
                            role: role, // Add required role field
                            wage,
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                            isActive: true
                        }
                    }
                },
                include: { contracts: true }
            });
            return staff;
        });
    }
    // --- CLUB ANALYTICS ---
    getClubAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [squad, finances, facilities, staff] = yield Promise.all([
                this.getSquadAnalytics(clubId),
                this.getFinancialAnalytics(clubId),
                this.getClubFacilities(clubId),
                this.getClubStaff(clubId)
            ]);
            // League performance
            const stats = yield prisma.clubSeasonStats.findMany({
                where: { clubId },
                orderBy: { season: 'desc' },
                take: 5
            });
            // Recent form
            const recentFixtures = yield prisma.fixture.findMany({
                where: {
                    OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
                    homeGoals: { not: null },
                    awayGoals: { not: null }
                },
                orderBy: { week: 'desc' },
                take: 10
            });
            const form = recentFixtures.map((f) => {
                const isHome = f.homeClubId === clubId;
                const goalsFor = isHome ? f.homeGoals : f.awayGoals;
                const goalsAgainst = isHome ? f.awayGoals : f.homeGoals;
                return { week: f.week, result: goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L', goalsFor, goalsAgainst };
            });
            return {
                squad,
                finances,
                facilities,
                staff,
                leagueStats: stats,
                recentForm: form,
                overallRating: this.calculateOverallRating(squad, finances, facilities, staff)
            };
        });
    }
    calculateOverallRating(squad, finances, facilities, staff) {
        const squadRating = squad.averageSkill * 0.4;
        const financialRating = finances ? (finances.currentBalance / 1000000) * 0.2 : 0;
        const facilityRating = facilities.reduce((sum, f) => sum + f.efficiency, 0) / facilities.length * 0.2;
        const staffRating = staff.analytics.averageSkill * 0.2;
        return Math.round(squadRating + financialRating + facilityRating + staffRating);
    }
    // --- TRANSFER & LOAN MANAGEMENT ---
    getTransferOffers(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const playerIds = players.map((p) => p.id);
            const offers = yield prisma.transferOffer.findMany({
                where: { playerId: { in: playerIds } },
                orderBy: { createdAt: 'desc' },
            });
            return offers;
        });
    }
    getLoans(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const loans = yield prisma.loan.findMany({
                where: {
                    OR: [{ fromClubId: clubId }, { toClubId: clubId }]
                },
                orderBy: { startDate: 'desc' }
            });
            return loans;
        });
    }
    // Get all clubs with their league information, sorted by division
    getClubsWithLeagues(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, leagueId } = filters || {};
            const where = {};
            // Add search filter
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { league: { name: { contains: search } } },
                ];
            }
            // Add league filter
            if (leagueId) {
                where.leagueId = leagueId;
            }
            return prisma.club.findMany({
                where,
                include: {
                    league: true,
                },
                orderBy: [
                    { league: { tier: 'asc' } },
                    { league: { name: 'asc' } },
                    { name: 'asc' },
                ],
            });
        });
    }
    // --- YOUTH ACADEMY ---
    getYouthAcademy(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jongTeams = yield prisma.club.findMany({
                where: { parentClubId: clubId, isJongTeam: true },
                include: { players: true }
            });
            const youthPlayers = jongTeams.flatMap((team) => team.players);
            const academyReputation = yield ClubService.getAcademyReputation(clubId);
            return {
                jongTeams,
                youthPlayers,
                academyReputation,
                totalYouthPlayers: youthPlayers.length,
                averageYouthSkill: youthPlayers.length > 0 ? youthPlayers.reduce((sum, p) => sum + p.skill, 0) / youthPlayers.length : 0
            };
        });
    }
    // --- BOARD & EXPECTATIONS ---
    getBoardExpectations(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            const stats = yield prisma.clubSeasonStats.findFirst({
                where: { clubId },
                orderBy: { season: 'desc' }
            });
            const expectations = {
                leaguePosition: club.boardExpectation || 'mid-table',
                currentPosition: (stats === null || stats === void 0 ? void 0 : stats.position) || 0,
                meetingExpectations: this.checkBoardExpectations(club.boardExpectation, stats),
                morale: club.morale || 70,
                form: club.form || ''
            };
            return expectations;
        });
    }
    checkBoardExpectations(expectation, stats) {
        if (!expectation || !stats)
            return true;
        const position = stats.position;
        switch (expectation) {
            case 'title-challenge': return position <= 3;
            case 'champions-league': return position <= 4;
            case 'europa-league': return position <= 6;
            case 'mid-table': return position >= 8 && position <= 12;
            case 'avoid-relegation': return position >= 15;
            default: return true;
        }
    }
}
exports.ClubService = ClubService;
exports.default = new ClubService();
