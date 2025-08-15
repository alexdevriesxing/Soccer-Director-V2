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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoopService = void 0;
const client_1 = require("@prisma/client");
const gameStateService_1 = __importDefault(require("./gameStateService"));
const matchSimulationService_1 = require("./matchSimulationService");
class GameLoopService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.gameState = gameStateService_1.default.getInstance();
    }
    static getInstance() {
        if (!GameLoopService.instance) {
            GameLoopService.instance = new GameLoopService();
        }
        return GameLoopService.instance;
    }
    /**
     * Process a single game week
     */
    processWeek() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWeek = this.gameState.getCurrentWeek();
            const currentSeason = this.gameState.getCurrentSeason();
            console.log(`Processing week ${currentWeek} of ${currentSeason}...`);
            // 1. Process all fixtures for the current week
            yield this.processFixtures();
            // 2. Update league tables based on match results (stubbed for now; handled inside CompetitionService flows)
            // TODO: implement competitionService.updateLeagueTables(currentSeason)
            // 3. Update player fitness and morale
            yield this.updatePlayerStates();
            // 4. Process injuries and suspensions
            yield this.processInjuriesAndSuspensions();
            // 5. Process transfers if window is open (stubbed)
            if (this.gameState.getTransferWindow() === 'open') {
                yield this.processTransfers();
            }
            // 6. Check for season end and handle promotions/relegations (stubbed)
            if (this.isEndOfSeason(currentWeek)) {
                yield this.processSeasonEnd(currentSeason);
            }
            // 7. Advance the game week
            yield this.gameState.advanceWeek();
            this.logWeekComplete(currentWeek);
        });
    }
    /**
     * Check if the current week is the end of the season
     */
    isEndOfSeason(week) {
        // Assuming a 38-week season (like most European leagues)
        return week >= 38;
    }
    /**
     * Handle end of season logic
     */
    processSeasonEnd(season) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Processing end of season ${season}...`);
            // TODO: hook into CompetitionService season pipeline once finalized
            return;
        });
    }
    /**
     * Get the next season string (e.g., '2025/2026' -> '2026/2027')
     */
    getNextSeason(currentSeason) {
        const [startYear, endYear] = currentSeason.split('/').map(Number);
        return `${startYear + 1}/${endYear + 1}`;
    }
    /**
     * Log end-of-week processing
     */
    logWeekComplete(currentWeek) {
        console.log(`Week ${currentWeek} processing complete.`);
    }
    processFixtures() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWeek = this.gameState.getCurrentWeek();
            const currentSeason = this.gameState.getCurrentSeason();
            // Get all fixtures for the current week
            const fixtures = yield this.prisma.fixture.findMany({
                where: {
                    matchDay: currentWeek,
                    isPlayed: false,
                    competition: {
                        season: currentSeason,
                    },
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
                orderBy: {
                    matchDate: 'asc',
                },
            });
            // Process each fixture
            for (const fixture of fixtures) {
                try {
                    console.log(`Simulating match: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
                    yield matchSimulationService_1.MatchSimulationService.simulateMatch(fixture.id);
                }
                catch (error) {
                    console.error(`Error simulating match ${fixture.id}:`, error);
                }
            }
        });
    }
    updatePlayerStates() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    processInjuriesAndSuspensions() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    // League table updates are handled within CompetitionService; no-op here for now
    updateLeagueTables() {
        return __awaiter(this, void 0, void 0, function* () { return; });
    }
    processTransfers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Stubbed
            console.log('Processing transfers...');
            return;
        });
    }
}
exports.GameLoopService = GameLoopService;
exports.default = GameLoopService.getInstance();
