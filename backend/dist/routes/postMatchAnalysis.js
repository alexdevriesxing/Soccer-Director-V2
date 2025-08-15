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
const express_1 = __importDefault(require("express"));
const i18n_1 = require("../utils/i18n");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// --- POST-MATCH ANALYSIS ---
// GET /api/post-match-analysis/:fixtureId
router.get('/:fixtureId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        // Get fixture details
        const fixture = yield prisma.fixture.findUnique({
            where: { id: fixtureId },
            include: {
                homeClub: { include: { players: true } },
                awayClub: { include: { players: true } },
                league: true
            }
        });
        if (!fixture) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.fixture_not_found', req.language || 'en') });
        }
        // Get match events
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            orderBy: { minute: 'asc' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        // Calculate xG
        const homeXG = events
            .filter((e) => e.clubId === fixture.homeClubId && e.type === 'GOAL')
            .reduce((sum, e) => sum + (e.xG || 0), 0);
        const awayXG = events
            .filter((e) => e.clubId === fixture.awayClubId && e.type === 'GOAL')
            .reduce((sum, e) => sum + (e.xG || 0), 0);
        // Calculate player ratings
        const playerRatings = yield calculatePlayerRatings(fixtureId, events);
        // Generate heatmap data
        const heatmapData = generateHeatmapData(events, fixture.homeClubId, fixture.awayClubId);
        // Calculate possession and other stats
        const matchStats = calculateMatchStats(events, fixture);
        const analysis = {
            fixture,
            xG: {
                home: homeXG,
                away: awayXG,
                difference: homeXG - awayXG
            },
            playerRatings,
            heatmapData,
            matchStats,
            events
        };
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_analyze_match', req.language || 'en') });
    }
}));
// GET /api/post-match-analysis/:fixtureId/xg
router.get('/:fixtureId/xg', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId, type: 'GOAL' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        const xGData = events.map((event) => ({
            minute: event.minute,
            player: event.player,
            club: event.club,
            xG: event.xG || 0,
            description: event.description
        }));
        res.json({ xGData });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_xg_data', req.language || 'en') });
    }
}));
// GET /api/post-match-analysis/:fixtureId/heatmap
router.get('/:fixtureId/heatmap', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        const fixture = yield prisma.fixture.findUnique({
            where: { id: fixtureId },
            include: { homeClub: true, awayClub: true }
        });
        if (!fixture) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.fixture_not_found', req.language || 'en') });
        }
        const heatmapData = generateHeatmapData(events, fixture.homeClubId, fixture.awayClubId);
        res.json({ heatmapData });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_heatmap_data', req.language || 'en') });
    }
}));
// GET /api/post-match-analysis/:fixtureId/player-ratings
router.get('/:fixtureId/player-ratings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            orderBy: { minute: 'asc' },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        const playerRatings = yield calculatePlayerRatings(fixtureId, events);
        res.json({ playerRatings });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_player_ratings', req.language || 'en') });
    }
}));
// GET /api/post-match-analysis/:fixtureId/statistics
router.get('/:fixtureId/statistics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const events = yield prisma.liveMatchEvent.findMany({
            where: { fixtureId },
            include: {
                player: { select: { id: true, name: true, position: true } },
                club: { select: { id: true, name: true } }
            }
        });
        const fixture = yield prisma.fixture.findUnique({
            where: { id: fixtureId },
            include: { homeClub: true, awayClub: true }
        });
        if (!fixture) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.fixture_not_found', req.language || 'en') });
        }
        const matchStats = calculateMatchStats(events, fixture);
        res.json({ matchStats });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_match_statistics', req.language || 'en') });
    }
}));
// POST /api/post-match-analysis/:fixtureId/player-rating
router.post('/:fixtureId/player-rating', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const fixtureId = parseInt(req.params.fixtureId, 10);
        const { playerId, rating, reasons } = req.body;
        if (!playerId || rating == null) {
            return res.status(400).json({ error: (0, i18n_1.t)('validation.missing_required_fields', req.language || 'en') });
        }
        // Get fixture to determine club and season
        const fixture = yield prisma.fixture.findUnique({
            where: { id: fixtureId },
            include: {
                homeClub: true,
                awayClub: true,
                league: true
            }
        });
        if (!fixture) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.fixture_not_found', req.language || 'en') });
        }
        // Determine which club the player belongs to
        const player = yield prisma.player.findUnique({
            where: { id: playerId }
        });
        if (!player || !player.clubId) {
            return res.status(404).json({ error: (0, i18n_1.t)('error.player_not_found', req.language || 'en') });
        }
        // Create or update player career stat with rating
        const existingStat = yield prisma.playerCareerStat.findFirst({
            where: {
                playerId,
                clubId: player.clubId,
                season: ((_a = fixture.league) === null || _a === void 0 ? void 0 : _a.season) || '2024/25'
            }
        });
        let playerStat;
        if (existingStat) {
            // Update existing stat with new rating
            const newAvgRating = existingStat.avgRating
                ? (existingStat.avgRating + rating) / 2
                : rating;
            playerStat = yield prisma.playerCareerStat.update({
                where: { id: existingStat.id },
                data: { avgRating: newAvgRating }
            });
        }
        else {
            // Create new career stat
            playerStat = yield prisma.playerCareerStat.create({
                data: {
                    playerId,
                    clubId: player.clubId,
                    season: ((_b = fixture.league) === null || _b === void 0 ? void 0 : _b.season) || '2024/25',
                    avgRating: rating,
                    appearances: 1,
                    goals: 0,
                    assists: 0,
                    yellowCards: 0,
                    redCards: 0
                }
            });
        }
        res.json({ playerStat });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_create_player_rating', req.language || 'en') });
    }
}));
// Helper function to calculate player ratings
function calculatePlayerRatings(fixtureId, events) {
    return __awaiter(this, void 0, void 0, function* () {
        const ratings = [];
        // Get all players who participated in the match
        const playerIds = [...new Set(events.map((e) => e.playerId).filter(Boolean))];
        for (const playerId of playerIds) {
            const playerEvents = events.filter((e) => e.playerId === playerId);
            // Base rating
            let rating = 6.0;
            // Goals
            const goals = playerEvents.filter((e) => e.type === 'GOAL').length;
            rating += goals * 1.0;
            // Assists (simplified - could be enhanced with more detailed event tracking)
            const assists = playerEvents.filter((e) => e.type === 'ASSIST').length;
            rating += assists * 0.5;
            // Cards
            const yellowCards = playerEvents.filter((e) => e.type === 'YELLOW_CARD').length;
            const redCards = playerEvents.filter((e) => e.type === 'RED_CARD').length;
            rating -= yellowCards * 0.5;
            rating -= redCards * 2.0;
            // Minutes played (simplified calculation)
            const minutesPlayed = Math.min(90, playerEvents.length * 10); // Rough estimate
            if (minutesPlayed < 45)
                rating -= 0.5;
            // Clamp rating between 1.0 and 10.0
            rating = Math.max(1.0, Math.min(10.0, rating));
            const player = yield prisma.player.findUnique({
                where: { id: playerId },
                select: { id: true, name: true, position: true }
            });
            if (player) {
                ratings.push({
                    player,
                    rating: Math.round(rating * 10) / 10,
                    minutesPlayed,
                    goals,
                    assists,
                    yellowCards,
                    redCards
                });
            }
        }
        return ratings.sort((a, b) => b.rating - a.rating);
    });
}
// Helper function to generate heatmap data
function generateHeatmapData(events, homeClubId, awayClubId) {
    const heatmapData = {
        home: [],
        away: []
    };
    // Generate sample heatmap data based on events
    // In a real implementation, this would be more sophisticated
    events.forEach((event) => {
        if (event.coordinates) {
            try {
                const coords = JSON.parse(event.coordinates);
                const dataPoint = {
                    x: coords.x || Math.random() * 100,
                    y: coords.y || Math.random() * 100,
                    intensity: event.type === 'GOAL' ? 1.0 : 0.3,
                    type: event.type
                };
                if (event.clubId === homeClubId) {
                    heatmapData.home.push(dataPoint);
                }
                else if (event.clubId === awayClubId) {
                    heatmapData.away.push(dataPoint);
                }
            }
            catch (e) {
                // Invalid coordinates, skip
            }
        }
    });
    return heatmapData;
}
// Helper function to calculate match statistics
function calculateMatchStats(events, fixture) {
    const homeEvents = events.filter((e) => e.clubId === fixture.homeClubId);
    const awayEvents = events.filter((e) => e.clubId === fixture.awayClubId);
    return {
        possession: {
            home: Math.round((homeEvents.length / (homeEvents.length + awayEvents.length)) * 100),
            away: Math.round((awayEvents.length / (homeEvents.length + awayEvents.length)) * 100)
        },
        shots: {
            home: homeEvents.filter((e) => e.type === 'GOAL' || e.type === 'SHOT').length,
            away: awayEvents.filter((e) => e.type === 'GOAL' || e.type === 'SHOT').length
        },
        shotsOnTarget: {
            home: homeEvents.filter((e) => e.type === 'GOAL').length,
            away: awayEvents.filter((e) => e.type === 'GOAL').length
        },
        corners: {
            home: homeEvents.filter((e) => e.type === 'CORNER').length,
            away: awayEvents.filter((e) => e.type === 'CORNER').length
        },
        fouls: {
            home: homeEvents.filter((e) => e.type === 'FOUL').length,
            away: awayEvents.filter((e) => e.type === 'FOUL').length
        },
        cards: {
            home: {
                yellow: homeEvents.filter((e) => e.type === 'YELLOW_CARD').length,
                red: homeEvents.filter((e) => e.type === 'RED_CARD').length
            },
            away: {
                yellow: awayEvents.filter((e) => e.type === 'YELLOW_CARD').length,
                red: awayEvents.filter((e) => e.type === 'RED_CARD').length
            }
        },
        offsides: {
            home: homeEvents.filter((e) => e.type === 'OFFSIDE').length,
            away: awayEvents.filter((e) => e.type === 'OFFSIDE').length
        }
    };
}
exports.default = router;
