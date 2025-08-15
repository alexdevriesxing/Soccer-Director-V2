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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LeagueService {
    createLeague(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.league.create({ data });
        });
    }
    getLeagueById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id } });
            if (!league)
                throw new Error('League not found');
            return league;
        });
    }
    updateLeague(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id } });
            if (!league)
                throw new Error('League not found');
            return prisma.league.update({ where: { id }, data });
        });
    }
    deleteLeague(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id } });
            if (!league)
                throw new Error('League not found');
            return prisma.league.delete({ where: { id } });
        });
    }
    // --- LEAGUE REGISTRATION ---
    registerClubForLeague(clubId, leagueId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if club is already registered
            const existingRegistration = yield prisma.clubSeasonStats.findFirst({
                where: { clubId, leagueId, season }
            });
            if (existingRegistration) {
                throw new Error('Club already registered for this league and season');
            }
            // Check league capacity
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const registeredClubs = yield prisma.clubSeasonStats.count({
                where: { leagueId, season }
            });
            // Example capacity limits
            const maxClubs = this.getLeagueCapacity(league.name);
            if (registeredClubs >= maxClubs) {
                throw new Error(`League is full (${registeredClubs}/${maxClubs} clubs)`);
            }
            // Create registration
            const clubSeasonStats = yield prisma.clubSeasonStats.create({
                data: {
                    clubId,
                    leagueId,
                    season,
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    points: 0,
                    position: 0,
                    goalDifference: 0
                }
            });
            return clubSeasonStats;
        });
    }
    getLeagueCapacity(leagueName) {
        // Define capacity for different leagues
        const capacities = {
            'Eredivisie': 18,
            'Eerste Divisie': 20,
            'Tweede Divisie': 18,
            'Derde Divisie A': 16,
            'Derde Divisie B': 16,
            'Vierde Divisie': 16,
            'O21 TOP': 16,
            'O21 Divisie 1': 16,
            'O21 Divisie 2': 16,
            'O21 Divisie 3': 16
        };
        return capacities[leagueName] || 16; // Default capacity
    }
    // --- LEAGUE RULES ---
    getLeagueRules(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const rules = {
                name: league.name,
                tier: league.tier,
                season: league.season,
                maxClubs: this.getLeagueCapacity(league.name),
                promotionSpots: this.getPromotionSpots(league.name),
                relegationSpots: this.getRelegationSpots(league.name),
                europeanQualification: this.getEuropeanQualification(league.name),
                cupQualification: this.getCupQualification(league.name),
                transferWindow: this.getTransferWindow(league.name),
                foreignPlayerLimit: this.getForeignPlayerLimit(league.name),
                homegrownPlayerRequirement: this.getHomegrownRequirement(league.name),
                financialFairPlay: this.getFinancialFairPlay(league.name)
            };
            return rules;
        });
    }
    getPromotionSpots(leagueName) {
        const promotionSpots = {
            'Eredivisie': 0, // No promotion from top tier
            'Eerste Divisie': 2,
            'Tweede Divisie': 2,
            'Derde Divisie A': 2,
            'Derde Divisie B': 2,
            'Vierde Divisie': 2
        };
        return promotionSpots[leagueName] || 2;
    }
    getRelegationSpots(leagueName) {
        const relegationSpots = {
            'Eredivisie': 2,
            'Eerste Divisie': 2,
            'Tweede Divisie': 2,
            'Derde Divisie A': 2,
            'Derde Divisie B': 2,
            'Vierde Divisie': 0 // No relegation from bottom tier
        };
        return relegationSpots[leagueName] || 2;
    }
    getEuropeanQualification(leagueName) {
        if (leagueName === 'Eredivisie') {
            return {
                championsLeague: 1,
                europaLeague: 1,
                conferenceLeague: 1,
                playoffSpots: 4
            };
        }
        return null;
    }
    getCupQualification(leagueName) {
        return {
            knvbCup: true,
            europeanCup: leagueName === 'Eredivisie'
        };
    }
    getTransferWindow(leagueName) {
        return {
            summer: { start: '2024-06-01', end: '2024-08-31' },
            winter: { start: '2025-01-01', end: '2025-01-31' }
        };
    }
    getForeignPlayerLimit(leagueName) {
        return leagueName === 'Eredivisie' ? 5 : 3;
    }
    getHomegrownRequirement(leagueName) {
        return leagueName === 'Eredivisie' ? 8 : 6;
    }
    getFinancialFairPlay(leagueName) {
        return leagueName === 'Eredivisie' || leagueName === 'Eerste Divisie';
    }
    // --- LEAGUE STANDINGS ---
    getLeagueStandings(leagueId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const currentSeason = season || league.season;
            const standings = yield prisma.clubSeasonStats.findMany({
                where: { leagueId, season: currentSeason },
                include: { club: true },
                orderBy: [
                    { points: 'desc' },
                    { goalDifference: 'desc' },
                    { goalsFor: 'desc' }
                ]
            });
            // Add positions and status
            const standingsWithStatus = standings.map((club, index) => (Object.assign(Object.assign({}, club), { position: index + 1, status: this.getClubStatus(club.position, league.name, standings.length, club.clubId) })));
            return {
                league: league.name,
                season: currentSeason,
                standings: standingsWithStatus
            };
        });
    }
    getClubStatus(position, leagueName, totalClubs, clubId) {
        if (leagueName === 'Eredivisie') {
            if (position === 1)
                return 'champion';
            if (position === 2)
                return 'cl_qual';
            if (position === 3)
                return 'el_qual';
            if (position === 4)
                return 'ecl_qual';
            if (position >= 5 && position <= 8)
                return 'ecl_playoff';
            if (position === 16)
                return 'promotion_playoff';
            if (position >= 17)
                return 'relegated';
        }
        else if (leagueName === 'Eerste Divisie') {
            if (position === 1)
                return 'champion';
            if (position <= 2)
                return 'promoted';
            if (position >= 3 && position <= 8)
                return 'promotion_playoff_lower';
        }
        else {
            if (position === 1)
                return 'champion';
            if (position <= 2)
                return 'promoted';
            if (position >= 3 && position <= 6)
                return 'promotion_playoff_lower';
            if (position >= totalClubs - 1)
                return 'relegated';
            if (position === totalClubs - 2)
                return 'relegation_playoff';
        }
        return '';
    }
    // --- FIXTURES ---
    getLeagueFixtures(leagueId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const currentSeason = season || league.season;
            const fixtures = yield prisma.fixture.findMany({
                where: { leagueId },
                include: {
                    homeClub: true,
                    awayClub: true
                },
                orderBy: { week: 'asc' }
            });
            return {
                league: league.name,
                season: currentSeason,
                fixtures
            };
        });
    }
    generateLeagueFixtures(leagueId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({
                where: { id: leagueId },
                include: { clubs: true }
            });
            if (!league)
                throw new Error('League not found');
            if (league.clubs.length < 2)
                throw new Error('Need at least 2 clubs to generate fixtures');
            // Clear existing fixtures for this league
            yield prisma.fixture.deleteMany({ where: { leagueId } });
            const clubs = league.clubs;
            const fixtures = [];
            let weekCounter = 1;
            // Generate home and away fixtures
            for (let round = 0; round < 2; round++) {
                for (let i = 0; i < clubs.length; i++) {
                    for (let j = i + 1; j < clubs.length; j++) {
                        const homeClub = round === 0 ? clubs[i] : clubs[j];
                        const awayClub = round === 0 ? clubs[j] : clubs[i];
                        fixtures.push({
                            homeClubId: homeClub.id,
                            awayClubId: awayClub.id,
                            leagueId,
                            week: weekCounter,
                            played: false
                        });
                        weekCounter++;
                    }
                }
            }
            // Create fixtures in database
            yield prisma.fixture.createMany({ data: fixtures });
            return { message: `Generated ${fixtures.length} fixtures for ${league.name}` };
        });
    }
    // --- PROMOTION & RELEGATION ---
    processPromotionRelegation(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const standings = yield this.getLeagueStandings(leagueId);
            const rules = yield this.getLeagueRules(leagueId);
            const result = {
                promoted: [],
                relegated: [],
                playoffQualifiers: []
            };
            // Process promotion
            if (rules.promotionSpots > 0) {
                const promoted = standings.standings.slice(0, rules.promotionSpots);
                result.promoted = promoted.map((club) => ({
                    clubId: club.clubId,
                    clubName: club.club.name,
                    position: club.position
                }));
            }
            // Process relegation
            if (rules.relegationSpots > 0) {
                const relegated = standings.standings.slice(-rules.relegationSpots);
                result.relegated = relegated.map((club) => ({
                    clubId: club.clubId,
                    clubName: club.club.name,
                    position: club.position
                }));
            }
            // Process playoff qualifiers
            if (league.name === 'Eredivisie') {
                const playoffQualifiers = standings.standings.slice(4, 8); // Positions 5-8
                result.playoffQualifiers = playoffQualifiers.map((club) => ({
                    clubId: club.clubId,
                    clubName: club.club.name,
                    position: club.position
                }));
            }
            return result;
        });
    }
    // --- CUP COMPETITIONS ---
    getCupCompetitions() {
        return __awaiter(this, void 0, void 0, function* () {
            const cups = yield prisma.cupCompetitions.findMany({
            // Remove invalid includes like fixtures
            });
            return cups;
        });
    }
    getCupFixtures(cupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cup = yield prisma.cupCompetitions.findUnique({
                where: { id: cupId },
                // Remove invalid includes like fixtures
            });
            if (!cup)
                throw new Error('Cup competition not found');
            return cup;
        });
    }
    // --- LEAGUE STATISTICS ---
    getLeagueStatistics(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const fixtures = yield prisma.fixture.findMany({
                where: { leagueId, played: true },
                include: { homeClub: true, awayClub: true }
            });
            const stats = {
                totalMatches: fixtures.length,
                totalGoals: fixtures.reduce((sum, f) => sum + (f.homeGoals || 0) + (f.awayGoals || 0), 0),
                averageGoalsPerMatch: fixtures.length > 0 ?
                    fixtures.reduce((sum, f) => sum + (f.homeGoals || 0) + (f.awayGoals || 0), 0) / fixtures.length : 0,
                homeWins: fixtures.filter((f) => (f.homeGoals || 0) > (f.awayGoals || 0)).length,
                awayWins: fixtures.filter((f) => (f.awayGoals || 0) > (f.homeGoals || 0)).length,
                draws: fixtures.filter((f) => (f.homeGoals || 0) === (f.awayGoals || 0)).length,
                highestScoringMatch: fixtures.reduce((max, f) => {
                    var _a, _b;
                    const total = (f.homeGoals || 0) + (f.awayGoals || 0);
                    return total > max.total ? { home: (_a = f.homeClub) === null || _a === void 0 ? void 0 : _a.name, away: (_b = f.awayClub) === null || _b === void 0 ? void 0 : _b.name, total } : max;
                }, { home: '', away: '', total: 0 })
            };
            return stats;
        });
    }
    // --- LEAGUE HISTORY ---
    getLeagueHistory(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const history = yield prisma.clubSeasonStats.findMany({
                where: { leagueId },
                include: { club: true },
                orderBy: { season: 'desc' }
            });
            // Group by season
            const historyBySeason = history.reduce((acc, stat) => {
                if (!acc[stat.season])
                    acc[stat.season] = [];
                acc[stat.season].push(stat);
                return acc;
            }, {});
            // Sort each season by position
            Object.keys(historyBySeason).forEach(season => {
                historyBySeason[season].sort((a, b) => a.position - b.position);
            });
            return {
                league: league.name,
                history: historyBySeason
            };
        });
    }
    // --- LEAGUE RANKINGS ---
    getLeagueRankings(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const league = yield prisma.league.findUnique({ where: { id: leagueId } });
            if (!league)
                throw new Error('League not found');
            const rankings = {
                topScorers: yield this.getTopScorers(leagueId),
                topAssists: yield this.getTopAssists(leagueId),
                mostCleanSheets: yield this.getMostCleanSheets(leagueId),
                mostYellowCards: yield this.getMostYellowCards(leagueId),
                mostRedCards: yield this.getMostRedCards(leagueId)
            };
            return rankings;
        });
    }
    getTopScorers(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            // This would require match events data
            // For now, return empty array
            return [];
        });
    }
    getTopAssists(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getMostCleanSheets(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getMostYellowCards(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getMostRedCards(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
}
exports.default = new LeagueService();
