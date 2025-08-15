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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePlayerValue = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
// Helper function to get translation function from request
const getT = (req) => {
    return (key, params) => {
        if (req.t) {
            return req.t(key, params);
        }
        return key; // Fallback to key if translation function is not available
    };
};
// Error utility functions
const createValidationError = (message, t, params = {}) => {
    return new errorHandler_1.AppError(message, 400, 'errors.validation', Object.assign(Object.assign({}, params), { message }));
};
const createNotFoundError = (entity, id, t) => {
    return new errorHandler_1.AppError(t('errors.notFound', { entity, id }), 404, 'errors.notFound', { entity, id: String(id) });
};
const handlePrismaError = (error, t) => {
    var _a, _b;
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const field = ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0]) || 'unknown';
            return new errorHandler_1.AppError(t('errors.duplicate', { field }), 400, 'errors.duplicate', { field });
        }
        if (error.code === 'P2025') {
            return new errorHandler_1.AppError(t('errors.notFound', { entity: 'resource' }), 404, 'errors.notFound', { entity: 'resource' });
        }
    }
    return new errorHandler_1.AppError(t('errors.unexpected'), 500, 'errors.unexpected');
};
// Helper function to send standardized API responses
const sendResponse = (res, status, data, message, error) => {
    const response = {
        success: status >= 200 && status < 300,
    };
    if (data)
        response.data = data;
    if (message)
        response.message = message;
    if (error)
        response.error = error;
    res.status(status).json(response);
};
// Async handler middleware
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Player include options for Prisma queries
const playerIncludeOptions = {
    playerInjuries: true,
    playerTraits: true,
    positions: true,
    careerStats: true,
    club: {
        select: {
            id: true,
            name: true,
        },
    },
};
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Helper function to calculate player value (exported for potential future use)
const calculatePlayerValue = (player) => {
    // Base value calculation logic
    const baseValue = player.skill * 10000;
    const potentialBonus = (player.potential || 0) * 5000;
    const ageFactor = Math.max(1, 1.5 - (player.age - 18) * 0.05);
    return Math.round((baseValue + potentialBonus) * ageFactor);
};
exports.calculatePlayerValue = calculatePlayerValue;
// Routes
router.post('/', (0, validation_1.validate)(validation_1.createPlayerSchema), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = getT(req);
    const _b = req.body, { name, position, skill, age, nationality, traits = [] } = _b, rest = __rest(_b, ["name", "position", "skill", "age", "nationality", "traits"]);
    try {
        // Input validation
        if (!name || !position || skill === undefined || !age || !nationality) {
            throw createValidationError(t('validation.missing_required_fields'), t, { fields: ['name', 'position', 'skill', 'age', 'nationality'] });
        }
        const player = yield prisma.player.create({
            data: Object.assign(Object.assign({ name,
                position,
                skill,
                age,
                nationality }, rest), { playerTraits: {
                    create: traits.map((trait) => ({
                        trait,
                    })),
                } }),
            include: playerIncludeOptions,
        });
        const playerWithRelations = Object.assign(Object.assign({}, player), { playerTraits: player.playerTraits || [], injuries: player.playerInjuries || [], positions: player.positions || [], careerStats: player.careerStats || [], traits: ((_a = player.playerTraits) === null || _a === void 0 ? void 0 : _a.map(t => t.trait)) || [] });
        sendResponse(res, 201, playerWithRelations, t('player.created_successfully'));
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// GET /api/players/:id
router.get('/:id', (0, validation_1.validate)(validation_1.playerIdParamSchema), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    try {
        const player = yield prisma.player.findUnique({
            where: { id: playerId },
            include: playerIncludeOptions,
        });
        if (!player) {
            throw createNotFoundError('Player', playerId, t);
        }
        const playerWithRelations = Object.assign(Object.assign({}, player), { playerTraits: player.playerTraits || [], injuries: player.playerInjuries || [], positions: player.positions || [], careerStats: player.careerStats || [], traits: ((_a = player.playerTraits) === null || _a === void 0 ? void 0 : _a.map(t => t.trait)) || [] });
        sendResponse(res, 200, playerWithRelations);
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// PUT /api/players/:id - Full update
router.put('/:id', asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    const _b = req.body, { traits } = _b, updateData = __rest(_b, ["traits"]);
    try {
        // Check if player exists
        const existingPlayer = yield prisma.player.findUnique({
            where: { id: playerId },
            include: { playerTraits: true },
        });
        if (!existingPlayer) {
            throw createNotFoundError('Player', playerId, t);
        }
        // Update player and handle traits in a transaction
        const [updatedPlayer] = yield prisma.$transaction([
            prisma.player.update({
                where: { id: playerId },
                data: Object.assign(Object.assign({}, updateData), { playerTraits: traits ? {
                        deleteMany: {},
                        create: traits.map((trait) => ({ trait })),
                    } : undefined }),
                include: playerIncludeOptions,
            }),
        ]);
        const playerWithRelations = Object.assign(Object.assign({}, updatedPlayer), { playerTraits: updatedPlayer.playerTraits || [], injuries: updatedPlayer.playerInjuries || [], positions: updatedPlayer.positions || [], careerStats: updatedPlayer.careerStats || [], traits: ((_a = updatedPlayer.playerTraits) === null || _a === void 0 ? void 0 : _a.map(t => t.trait)) || [] });
        sendResponse(res, 200, playerWithRelations, t('player.updated_successfully'));
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// PATCH /api/players/:id - Partial update
router.patch('/:id', (0, validation_1.validate)([...validation_1.playerIdParamSchema, ...validation_1.updatePlayerSchema]), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    const _b = req.body, { traits } = _b, updateData = __rest(_b, ["traits"]);
    try {
        // Check if player exists
        const existingPlayer = yield prisma.player.findUnique({
            where: { id: playerId },
            include: { playerTraits: true },
        });
        if (!existingPlayer) {
            throw createNotFoundError('Player', playerId, t);
        }
        // Update player and handle traits if provided
        const [updatedPlayer] = yield prisma.$transaction([
            prisma.player.update({
                where: { id: playerId },
                data: Object.assign(Object.assign({}, updateData), (traits ? {
                    playerTraits: {
                        deleteMany: {},
                        create: traits.map((trait) => ({ trait })),
                    },
                } : {})),
                include: playerIncludeOptions,
            }),
        ]);
        const playerWithRelations = Object.assign(Object.assign({}, updatedPlayer), { playerTraits: updatedPlayer.playerTraits || [], injuries: updatedPlayer.playerInjuries || [], positions: updatedPlayer.positions || [], careerStats: updatedPlayer.careerStats || [], traits: ((_a = updatedPlayer.playerTraits) === null || _a === void 0 ? void 0 : _a.map(t => t.trait)) || [] });
        sendResponse(res, 200, playerWithRelations, t('player.updated_successfully'));
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// DELETE /api/players/:id
router.delete('/:id', (0, validation_1.validate)(validation_1.playerIdParamSchema), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const t = getT(req);
    const playerId = parseInt(req.params.id, 10);
    try {
        // Check if player exists
        const existingPlayer = yield prisma.player.findUnique({
            where: { id: playerId },
        });
        if (!existingPlayer) {
            throw createNotFoundError('Player', playerId, t);
        }
        // Delete player (cascading deletes will handle related records)
        yield prisma.player.delete({
            where: { id: playerId },
        });
        sendResponse(res, 204, undefined, t('player.deleted_successfully'));
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// GET /api/players - List all players with pagination
router.get('/', (0, validation_1.validate)(validation_1.playerListQuerySchema), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const t = getT(req);
    const page = parseInt(String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.page) || '1'), 10) || 1;
    const limit = Math.min(parseInt(String(((_b = req.query) === null || _b === void 0 ? void 0 : _b.limit) || '10'), 10) || 10, 100);
    const skip = (page - 1) * limit;
    try {
        const [total, players] = yield Promise.all([
            prisma.player.count(),
            prisma.player.findMany({
                skip,
                take: limit,
                include: playerIncludeOptions,
                orderBy: { id: 'asc' },
            }),
        ]);
        // Map the raw query results to our expected format
        const playersWithRelations = players.map((player) => (Object.assign(Object.assign({}, player), { playerTraits: player.playerTraits || [], injuries: player.injuries || [], positions: player.positions || [], careerStats: player.careerStats || [], traits: Array.isArray(player.playerTraits)
                ? player.playerTraits.map((t) => t.trait)
                : [] })));
        sendResponse(res, 200, {
            players: playersWithRelations,
            total,
            page,
            limit,
        });
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
// GET /api/players/search - Search players by name or other criteria
router.get('/search', (0, validation_1.validate)(validation_1.playerSearchQuerySchema), asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const t = getT(req);
    const q = (_a = req.query.q) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (!q) {
        return next(new errorHandler_1.AppError(t('errors.searchQueryRequired'), 400, 'errors.searchQueryRequired'));
    }
    try {
        // Fetch players matching search criteria with case-insensitive search using raw query
        const players = yield prisma.$queryRaw `
        SELECT p.*, 
               json_agg(DISTINCT pt.*) FILTER (WHERE pt."trait" IS NOT NULL) as "playerTraits"
        FROM "Player" p
        LEFT JOIN "PlayerTrait" pt ON p.id = pt."playerId"
        WHERE LOWER(p.name) LIKE ${`%${q}%`}
           OR LOWER(p.nationality) LIKE ${`%${q}%`}
           OR LOWER(p.position) LIKE ${`%${q}%`}
        GROUP BY p.id
        LIMIT 20
      `;
        // Map the results to our expected format
        const playersWithRelations = players.map((player) => (Object.assign(Object.assign({}, player), { playerTraits: player.playerTraits || [], injuries: player.injuries || [], positions: player.positions || [], careerStats: player.careerStats || [], traits: Array.isArray(player.playerTraits)
                ? player.playerTraits.map((trait) => trait.trait)
                : [] })));
        sendResponse(res, 200, playersWithRelations);
    }
    catch (error) {
        next(handlePrismaError(error, t));
    }
})));
exports.default = router;
