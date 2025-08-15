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
const client_1 = require("@prisma/client");
const i18n_1 = require("../utils/i18n");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /api/profiles - List all profiles
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profiles = yield prisma.managerProfile.findMany({
            include: {
                club: true
            },
            orderBy: { id: 'desc' }
        });
        res.json(profiles);
    }
    catch (error) {
        console.error('Error fetching profiles:', error);
        const language = 'language' in req ? req.language || 'en' : 'en';
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_profiles', language) });
    }
}));
// POST /api/profiles - Create a new profile
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, club, clubId } = req.body;
        // Validate input
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!club && !clubId) {
            return res.status(400).json({ error: 'Either club name or club ID is required' });
        }
        let clubRecord;
        // If clubId is provided, find the club by ID
        if (clubId) {
            clubRecord = yield prisma.club.findUnique({
                where: { id: clubId },
                include: { league: true }
            });
            if (!clubRecord) {
                return res.status(404).json({ error: 'Club not found with provided ID' });
            }
            // Create the manager profile with the existing club
            const profile = yield prisma.managerProfile.create({
                data: {
                    name,
                    club: {
                        connect: { id: clubRecord.id }
                    }
                },
                include: {
                    club: {
                        include: {
                            league: true
                        }
                    }
                }
            });
            // Return the created profile with club and league info
            const response = {
                id: profile.id,
                name: profile.name,
                clubId: profile.clubId,
                userId: profile.userId || null,
                reputation: profile.reputation,
                createdAt: profile.createdAt.toISOString(),
                updatedAt: profile.updatedAt.toISOString(),
                club: {
                    id: profile.club.id,
                    name: profile.club.name,
                    league: {
                        id: profile.club.league.id,
                        name: profile.club.league.name,
                        tier: profile.club.league.tier || '1',
                        season: profile.club.league.season || '2024/2025'
                    }
                }
            };
            return res.status(201).json(response);
        }
        else if (club) {
            // Find or create a new club by name
            clubRecord = yield prisma.club.findFirst({
                where: { name: club },
                include: { league: true }
            });
            if (!clubRecord) {
                // Create a new club if it doesn't exist
                let defaultLeague = yield prisma.league.findFirst({
                    where: { name: 'Default League' }
                });
                if (!defaultLeague) {
                    defaultLeague = yield prisma.league.create({
                        data: {
                            name: 'Default League',
                            tier: '1',
                            season: '2024/2025',
                            region: 'Default Region',
                            division: 'Default Division'
                        }
                    });
                }
                // Create the club
                const newClub = yield prisma.club.create({
                    data: {
                        name: club,
                        leagueId: defaultLeague.id,
                        homeCity: 'Unknown',
                        boardExpectation: 'Mid-table',
                        form: '',
                        balance: 0,
                        facilities: {
                            create: [
                                {
                                    name: 'Stadium',
                                    type: 'stadium',
                                    level: 1,
                                    capacity: 5000,
                                    maintenanceCost: 5000,
                                    upgradeCost: 100000,
                                    effects: '{}',
                                    ticketPrice: 25
                                },
                                {
                                    name: 'Training Ground',
                                    type: 'training',
                                    level: 1,
                                    maintenanceCost: 2000,
                                    upgradeCost: 50000,
                                    effects: '{}'
                                },
                                {
                                    name: 'Youth Academy',
                                    type: 'youth',
                                    level: 1,
                                    maintenanceCost: 1500,
                                    upgradeCost: 30000,
                                    effects: '{}'
                                }
                            ]
                        }
                    },
                    include: {
                        league: true,
                        facilities: true
                    }
                });
                // Create finances for the new club with only required fields
                yield prisma.clubFinances.create({
                    data: {
                        clubId: newClub.id,
                        balance: 1000000,
                        wageBudget: 50000,
                        transferBudget: 1000000,
                        season: '2024/2025',
                        week: 1 // Add default week
                    }
                });
                // Club exists, create manager profile with existing club
                const profile = yield prisma.managerProfile.create({
                    data: {
                        name,
                        club: {
                            connect: { id: newClub.id }
                        },
                        reputation: 50 // Default reputation
                    },
                    include: {
                        club: {
                            include: {
                                league: true
                            }
                        }
                    }
                });
                // Return the created profile with club and league info
                const response = {
                    id: profile.id,
                    name: profile.name,
                    clubId: profile.clubId,
                    userId: profile.userId || null,
                    reputation: profile.reputation,
                    createdAt: profile.createdAt.toISOString(),
                    updatedAt: profile.updatedAt.toISOString(),
                    club: {
                        id: profile.club.id,
                        name: profile.club.name,
                        league: {
                            id: profile.club.league.id,
                            name: profile.club.league.name,
                            tier: profile.club.league.tier || '1',
                            season: profile.club.league.season || '2024/2025'
                        }
                    }
                };
                return res.status(201).json(response);
            }
            else {
                // Club exists, create manager profile with existing club
                const profile = yield prisma.managerProfile.create({
                    data: {
                        name,
                        club: {
                            connect: { id: clubRecord.id }
                        },
                        reputation: 50 // Default reputation
                    },
                    include: {
                        club: {
                            include: {
                                league: true
                            }
                        }
                    }
                });
                // Format the response to match our ProfileResponse type
                const response = {
                    id: profile.id,
                    name: profile.name,
                    clubId: profile.clubId,
                    userId: profile.userId || null,
                    reputation: profile.reputation,
                    createdAt: profile.createdAt.toISOString(),
                    updatedAt: profile.updatedAt.toISOString(),
                    club: {
                        id: profile.club.id,
                        name: profile.club.name,
                        league: {
                            id: profile.club.league.id,
                            name: profile.club.league.name,
                            tier: profile.club.league.tier || '1',
                            season: profile.club.league.season || '2024/2025'
                        }
                    }
                };
                return res.status(201).json(response);
            }
        }
        else {
            return res.status(400).json({ error: 'Either club name or club ID is required' });
        }
    }
    catch (error) {
        // Pass the error to the error handler middleware
        const appError = (0, errorHandler_1.createAppError)(error);
        appError.translationKey = 'error.failed_to_create_profile';
        next(appError);
    }
}));
exports.default = router;
