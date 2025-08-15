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
class GameStateService {
    constructor() {
        this.gameState = {
            currentWeek: 1,
            currentSeason: '2024/25',
            transferWindow: 'open',
            gameDate: new Date()
        };
        this.loadGameState();
    }
    static getInstance() {
        if (!GameStateService.instance) {
            GameStateService.instance = new GameStateService();
        }
        return GameStateService.instance;
    }
    loadGameState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to load from database if it exists
                const state = yield prisma.gameState.findFirst();
                if (state) {
                    this.gameState = {
                        currentWeek: state.currentWeek,
                        currentSeason: state.currentSeason,
                        transferWindow: state.transferWindow,
                        gameDate: state.gameDate
                    };
                }
                else {
                    // Create initial game state
                    yield this.saveGameState();
                }
            }
            catch (error) {
                console.error('Failed to load game state:', error);
                // Use default values if database is not available
            }
        });
    }
    saveGameState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.gameState.upsert({
                    where: { id: 1 },
                    update: {
                        currentWeek: this.gameState.currentWeek,
                        currentSeason: this.gameState.currentSeason,
                        transferWindow: this.gameState.transferWindow,
                        gameDate: this.gameState.gameDate
                    },
                    create: {
                        id: 1,
                        currentWeek: this.gameState.currentWeek,
                        currentSeason: this.gameState.currentSeason,
                        transferWindow: this.gameState.transferWindow,
                        gameDate: this.gameState.gameDate
                    }
                });
            }
            catch (error) {
                console.error('Failed to save game state:', error);
            }
        });
    }
    getGameState() {
        return Object.assign({}, this.gameState);
    }
    advanceWeek() {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameState.currentWeek++;
            // Update transfer window status based on week
            if (this.gameState.currentWeek >= 8 && this.gameState.currentWeek <= 12) {
                this.gameState.transferWindow = 'open';
            }
            else if (this.gameState.currentWeek >= 20 && this.gameState.currentWeek <= 24) {
                this.gameState.transferWindow = 'open';
            }
            else {
                this.gameState.transferWindow = 'closed';
            }
            // Advance season if needed
            if (this.gameState.currentWeek > 38) {
                this.gameState.currentWeek = 1;
                const [year, nextYear] = this.gameState.currentSeason.split('/');
                this.gameState.currentSeason = `${nextYear}/${parseInt(nextYear) + 1}`;
            }
            yield this.saveGameState();
        });
    }
    setWeek(week) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameState.currentWeek = week;
            yield this.saveGameState();
        });
    }
    setTransferWindow(status) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameState.transferWindow = status;
            yield this.saveGameState();
        });
    }
    getCurrentWeek() {
        return this.gameState.currentWeek;
    }
    getCurrentSeason() {
        return this.gameState.currentSeason;
    }
    getTransferWindow() {
        return this.gameState.transferWindow;
    }
    getGameDate() {
        return new Date(this.gameState.gameDate);
    }
}
exports.default = GameStateService;
