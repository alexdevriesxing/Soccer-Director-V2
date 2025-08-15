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
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const zod_2 = require("zod");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Input validation schemas using Zod
const transferListingSchema = zod_1.z.object({
    playerId: zod_1.z.number().int().positive(),
    askingPrice: zod_1.z.number().int().positive(),
    deadline: zod_1.z.string().datetime(),
});
const transferOfferSchema = zod_1.z.object({
    playerId: zod_1.z.number().int().positive(),
    fromClubId: zod_1.z.number().int().positive(),
    toClubId: zod_1.z.number().int().positive(),
    fee: zod_1.z.number().int().positive(),
    wageOffer: zod_1.z.number().int().nonnegative(),
    contractLength: zod_1.z.number().int().min(1).max(5),
    message: zod_1.z.string().optional(),
});
const respondToOfferSchema = zod_1.z.object({
    response: zod_1.z.enum(['ACCEPTED', 'REJECTED', 'COUNTERED']),
    message: zod_1.z.string().optional(),
    counterOffer: zod_1.z.object({
        fee: zod_1.z.number().int().positive(),
        wageOffer: zod_1.z.number().int().nonnegative(),
        contractLength: zod_1.z.number().int().min(1).max(5),
    }).optional(),
});
// Error handling middleware
class ApiError extends Error {
    constructor(message, statusCode, code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
const handleError = (res, error, message) => {
    console.error(message, error);
    return res.status(500).json({
        error: (0, i18n_1.t)('error.server_error', 'en'),
        details: error.message
    });
};
// GET /api/transfer-market - Get all players on the transfer market
// Input validation schema for query parameters
const transferMarketQuerySchema = zod_2.z.object({
    position: zod_2.z.string().optional(),
    minSkill: zod_2.z.string().optional(),
    maxSkill: zod_2.z.string().optional(),
    nationality: zod_2.z.string().optional(),
    maxAge: zod_2.z.string().optional(),
    minValue: zod_2.z.string().optional(),
    maxValue: zod_2.z.string().optional(),
    page: zod_2.z.string().optional().default('1'),
    limit: zod_2.z.string().optional().default('25')
});
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate query parameters
        const query = transferMarketQuerySchema.parse(req.query);
        // Build where clause for filtering
        const whereClause = {
            transferListings: {
                some: {
                    status: 'ACTIVE'
                }
            },
            transferStatus: {
                in: ['LISTED', 'AVAILABLE']
            },
            // Only show players who are not currently in a transfer
            transfers: {
                none: {
                    status: 'PENDING'
                }
            },
            // Only show players who are not currently on loan
            loans: {
                none: {
                    status: 'ACTIVE'
                }
            },
            // Only show players who are not injured or on international duty
            injured: false,
            onInternationalDuty: false
        };
        if (position && position !== 'all') {
            whereClause.position = position;
        }
        if (minSkill) {
            whereClause.skill = { gte: parseInt(minSkill) };
        }
        if (maxSkill) {
            whereClause.skill = Object.assign(Object.assign({}, whereClause.skill), { lte: parseInt(maxSkill) });
        }
        if (nationality && nationality !== 'all') {
            whereClause.nationality = nationality;
        }
        // Apply filters (duplicate code removed)
        if (maxAge) {
            whereClause.age = { lte: parseInt(maxAge) };
        }
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        // Get total count for pagination
        const total = yield prisma.player.count({ where: whereClause });
        // Get players with pagination
        const players = yield prisma.player.findMany({
            where: whereClause,
            include: {
                club: {
                    select: {
                        id: true,
                        name: true,
                        league: {
                            select: {
                                id: true,
                                name: true,
                                tier: true
                            }
                        }
                    }
                },
                // Include transfer listing information if available
                transferListings: {
                    where: {
                        status: 'ACTIVE'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                skill: 'desc'
            },
            skip,
            take: limit
        });
        // Format response with calculated values and pagination info
        const response = {
            data: players.map(player => {
                var _a, _b, _c;
                // Calculate base value
                const baseValue = player.skill * 10000;
                const ageMultiplier = Math.max(0.5, 1 - (player.age - 18) * 0.05);
                const potentialBonus = (player.potential - player.skill) * 5000;
                const calculatedValue = Math.round(baseValue * ageMultiplier + potentialBonus);
                // Get asking price from transfer listing or use calculated value
                const listing = player.transferListings[0];
                const askingPrice = (listing === null || listing === void 0 ? void 0 : listing.askingPrice) || calculatedValue;
                return {
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    age: player.age,
                    skill: player.skill,
                    potential: player.potential,
                    wage: player.wage,
                    contractExpiry: player.contractExpiry,
                    nationality: player.nationality,
                    club: {
                        id: (_a = player.club) === null || _a === void 0 ? void 0 : _a.id,
                        name: (_b = player.club) === null || _b === void 0 ? void 0 : _b.name,
                        league: (_c = player.club) === null || _c === void 0 ? void 0 : _c.league
                    },
                    value: calculatedValue,
                    askingPrice: askingPrice,
                    transferStatus: player.transferStatus,
                    listingId: listing === null || listing === void 0 ? void 0 : listing.id
                };
            }),
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        };
        res.json(response);
    }
    catch (error) {
        return handleError(res, error, 'Failed to fetch transfer market:');
    }
}));
// GET /api/transfer-market/positions - Get all available positions
router.get('/positions', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const positions = yield prisma.player.groupBy({
            by: ['position'],
            _count: {
                position: true
            },
            where: {
                transferStatus: {
                    in: ['LISTED', 'AVAILABLE']
                }
            },
            orderBy: {
                position: 'asc'
            }
        });
        res.json({
            positions: positions.map(p => ({
                position: p.position,
                count: p._count.position
            }))
        });
    }
    catch (error) {
        return handleError(res, error, 'Failed to fetch positions:');
    }
}));
// GET /api/transfer-market/nationalities - Get all available nationalities
router.get('/nationalities', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nationalities = yield prisma.player.groupBy({
            by: ['nationality'],
            _count: {
                nationality: true
            },
            where: {
                transferStatus: {
                    in: ['LISTED', 'AVAILABLE']
                },
                nationality: {
                    not: null
                }
            },
            orderBy: {
                nationality: 'asc'
            }
        });
        res.json({
            nationalities: nationalities.map(n => ({
                nationality: n.nationality,
                count: n._count.nationality
            }))
        });
    }
    catch (error) {
        return handleError(res, error, 'Failed to fetch nationalities:');
    }
}));
// POST /api/transfer-market/list - List a player on the transfer market
router.post('/list', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, askingPrice, deadline } = req.body;
        const userId = req.user.id;
        if (!playerId || !askingPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if user has permission to list this player
        const player = yield prisma.player.findUnique({
            where: { id: playerId },
            include: {
                club: {
                    include: {
                        manager: true
                    }
                }
            }
        });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        if (player.club.managerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to list this player' });
        }
        // Create transfer listing
        const listing = yield prisma.transferListing.create({
            data: {
                playerId,
                clubId: player.clubId,
                askingPrice: parseInt(askingPrice),
                deadline: deadline ? new Date(deadline) : null,
                status: 'ACTIVE'
            }
        });
        // Update player's transfer status
        yield prisma.player.update({
            where: { id: playerId },
            data: { transferStatus: 'LISTED' }
        });
        res.status(201).json(listing);
    }
    catch (error) {
        return handleError(res, error, 'Failed to list player:');
    }
}));
// POST /api/transfer-market/:id/bid - Place a bid on a player
router.post('/:id/bid', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, wageOffer, contractLength } = req.body;
        const playerId = parseInt(req.params.id);
        const userId = req.user.id;
        if (!amount || !wageOffer || !contractLength) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Get player and check if they're listed
        const player = yield prisma.player.findUnique({
            where: { id: playerId },
            include: {
                club: true,
                transferListings: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        if (!['LISTED', 'AVAILABLE'].includes(player.transferStatus || '')) {
            return res.status(400).json({ error: 'Player is not available for transfer' });
        }
        // Get bidding club (current user's club)
        const biddingClub = yield prisma.club.findFirst({
            where: { managerId: userId }
        });
        if (!biddingClub) {
            return res.status(403).json({ error: 'You must manage a club to place bids' });
        }
        // Check if bid meets minimum requirements
        const listing = player.transferListings[0];
        if (listing && amount < listing.askingPrice) {
            return res.status(400).json({
                error: `Bid amount must be at least ${listing.askingPrice}`
            });
        }
        // Check if club has enough budget
        if (biddingClub.balance < amount) {
            return res.status(400).json({
                error: 'Insufficient funds to place this bid'
            });
        }
        // Create transfer offer
        const transferOffer = yield prisma.transferOffer.create({
            data: {
                playerId,
                fromClubId: player.clubId,
                toClubId: biddingClub.id,
                fee: parseInt(amount),
                wage: parseInt(wageOffer),
                contractLength: parseInt(contractLength),
                status: 'PENDING',
                initiator: 'USER'
            }
        });
        // Notify clubs about the offer (in a real app, this would be a WebSocket event)
        // ...
        res.status(201).json(transferOffer);
    }
    catch (error) {
        return handleError(res, error, 'Failed to place bid:');
    }
}));
// GET /api/transfer-market/bids - Get user's active bids
router.get('/bids', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get user's club
        const club = yield prisma.club.findFirst({
            where: { managerId: userId },
            select: { id: true }
        });
        if (!club) {
            return res.json({ bids: [] });
        }
        // Get active bids
        const bids = yield prisma.transferOffer.findMany({
            where: {
                toClubId: club.id,
                status: 'PENDING'
            },
            include: {
                player: {
                    select: {
                        id: true,
                        name: true,
                        position: true,
                        age: true,
                        skill: true
                    }
                },
                fromClub: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                toClub: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ bids });
    }
    catch (error) {
        return handleError(res, error, 'Failed to fetch bids:');
    }
}));
// POST /api/transfer-market/bids/:id/respond - Respond to a bid
router.post('/bids/:id/respond', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { response, message } = req.body;
        const bidId = parseInt(req.params.id);
        const userId = req.user.id;
        if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(response)) {
            return res.status(400).json({ error: 'Invalid response type' });
        }
        // Get the bid
        const bid = yield prisma.transferOffer.findUnique({
            where: { id: bidId },
            include: {
                player: {
                    include: {
                        club: true
                    }
                },
                fromClub: true,
                toClub: true
            }
        });
        if (!bid) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        // Check if user has permission to respond to this bid
        if (bid.player.club.managerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to respond to this bid' });
        }
        // Update bid status based on response
        let updatedBid;
        if (response === 'ACCEPT') {
            // Process the transfer
            yield prisma.$transaction([
                // Update player's club
                prisma.player.update({
                    where: { id: bid.playerId },
                    data: {
                        clubId: bid.toClubId,
                        transferStatus: 'NOT_FOR_SALE',
                        wage: bid.wage,
                        contractExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + bid.contractLength))
                    }
                }),
                // Update clubs' balances
                prisma.club.update({
                    where: { id: bid.fromClubId },
                    data: {
                        balance: { increment: bid.fee }
                    }
                }),
                prisma.club.update({
                    where: { id: bid.toClubId },
                    data: {
                        balance: { decrement: bid.fee }
                    }
                }),
                // Update bid status
                prisma.transferOffer.update({
                    where: { id: bidId },
                    data: {
                        status: 'ACCEPTED',
                        respondedAt: new Date()
                    }
                }),
                // Close any other pending offers for this player
                prisma.transferOffer.updateMany({
                    where: {
                        playerId: bid.playerId,
                        status: 'PENDING',
                        id: { not: bidId }
                    },
                    data: {
                        status: 'REJECTED',
                        respondedAt: new Date()
                    }
                })
            ]);
            // In a real app, you would also:
            // 1. Create a news item about the transfer
            // 2. Notify both clubs
            // 3. Update any affected league tables
        }
        else if (response === 'REJECT') {
            updatedBid = yield prisma.transferOffer.update({
                where: { id: bidId },
                data: {
                    status: 'REJECTED',
                    respondedAt: new Date(),
                    responseMessage: message
                }
            });
        }
        else if (response === 'COUNTER') {
            const { counterFee, counterWage, counterContractLength } = req.body;
            if (!counterFee || !counterWage || !counterContractLength) {
                return res.status(400).json({ error: 'Missing counter offer details' });
            }
            updatedBid = yield prisma.transferOffer.update({
                where: { id: bidId },
                data: {
                    status: 'COUNTERED',
                    counterFee: parseInt(counterFee),
                    counterWage: parseInt(counterWage),
                    counterContractLength: parseInt(counterContractLength),
                    respondedAt: new Date(),
                    responseMessage: message
                }
            });
        }
        res.json({
            success: true,
            bid: updatedBid || { id: bidId, status: response }
        });
    }
    catch (error) {
        return handleError(res, error, 'Failed to respond to bid:');
    }
}));
// GET /api/transfers
router.get('/transfers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transfers = yield prisma.transfer.findMany({
            include: {
                fromClub: {
                    select: { name: true }
                },
                toClub: {
                    select: { name: true }
                },
                player: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' },
            take: 50 // Limit to recent transfers
        });
        const formattedTransfers = transfers.map(transfer => {
            var _a, _b;
            return ({
                id: transfer.id,
                playerName: transfer.player.name,
                fromClub: ((_a = transfer.fromClub) === null || _a === void 0 ? void 0 : _a.name) || 'Free Agent',
                toClub: ((_b = transfer.toClub) === null || _b === void 0 ? void 0 : _b.name) || 'Free Agent',
                fee: transfer.fee || 0,
                date: transfer.date,
                status: transfer.status || 'completed'
            });
        });
        res.json({ transfers: formattedTransfers });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_transfers', req.language || 'en') });
    }
}));
// GET /api/transfers/:id
router.get('/transfers/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const id = parseInt(req.params.id, 10);
        const transfer = yield prisma.transfer.findUnique({
            where: { id },
            include: {
                fromClub: { select: { name: true } },
                toClub: { select: { name: true } },
                player: { select: { name: true } }
            }
        });
        if (!transfer)
            return res.status(404).json({ error: 'Transfer not found' });
        res.json({
            id: transfer.id,
            playerId: transfer.playerId,
            playerName: ((_a = transfer.player) === null || _a === void 0 ? void 0 : _a.name) || null,
            fromClub: ((_b = transfer.fromClub) === null || _b === void 0 ? void 0 : _b.name) || 'Free Agent',
            toClub: ((_c = transfer.toClub) === null || _c === void 0 ? void 0 : _c.name) || 'Free Agent',
            fee: transfer.fee || 0,
            date: transfer.date,
            status: transfer.status || 'completed'
        });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_transfer', req.language || 'en') });
    }
}));
exports.default = router;
