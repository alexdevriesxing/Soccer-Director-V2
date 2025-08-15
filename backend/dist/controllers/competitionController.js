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
exports.competitionController = void 0;
const competitionService_1 = require("../services/competitionService");
const prisma_1 = require("../utils/prisma");
exports.competitionController = {
    /**
     * Get all active competitions for the current season
     */
    getActiveCompetitions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { season } = req.query;
            const competitions = yield competitionService_1.competitionService.getActiveCompetitions(season || '2025/2026');
            res.json(competitions);
        }
        catch (error) {
            console.error('Error getting competitions:', error);
            res.status(500).json({ error: 'Failed to get competitions' });
        }
    }),
    /**
     * Get league table for a competition
     */
    getLeagueTable: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { competitionId } = req.params;
            const table = yield competitionService_1.competitionService.getLeagueTable(parseInt(competitionId));
            res.json(table);
        }
        catch (error) {
            console.error('Error getting league table:', error);
            res.status(500).json({ error: 'Failed to get league table' });
        }
    }),
    /**
     * Generate fixtures for a competition
     */
    generateFixtures: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { competitionId } = req.params;
            const { season } = req.body;
            yield competitionService_1.competitionService.generateLeagueFixtures(parseInt(competitionId), season || '2025/2026');
            res.json({ success: true, message: 'Fixtures generated successfully' });
        }
        catch (error) {
            console.error('Error generating fixtures:', error);
            res.status(500).json({ error: 'Failed to generate fixtures' });
        }
    }),
    /**
     * Get fixtures for a competition
     */
    getFixtures: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { competitionId } = req.params;
            const { season } = req.query;
            const fixtures = yield prisma_1.prisma.fixture.findMany({
                where: {
                    competitionId: parseInt(competitionId),
                    season: season || '2025/2026',
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    competition: true,
                },
                orderBy: [
                    { round: 'asc' },
                    { scheduledTime: 'asc' },
                ],
            });
            res.json(fixtures);
        }
        catch (error) {
            console.error('Error getting fixtures:', error);
            res.status(500).json({ error: 'Failed to get fixtures' });
        }
    }),
    /**
     * Get a single competition by ID
     */
    getCompetition: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { competitionId } = req.params;
            const competition = yield prisma_1.prisma.competition.findUnique({
                where: { id: parseInt(competitionId) },
                include: {
                    teams: {
                        include: {
                            team: true,
                        },
                    },
                },
            });
            if (!competition) {
                return res.status(404).json({ error: 'Competition not found' });
            }
            res.json(competition);
        }
        catch (error) {
            console.error('Error getting competition:', error);
            res.status(500).json({ error: 'Failed to get competition' });
        }
    }),
};
