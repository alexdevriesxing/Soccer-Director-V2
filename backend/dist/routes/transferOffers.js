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
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Create a new transfer offer
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, fromClubId, toClubId, fee, clauses, deadline } = req.body;
        if (!playerId || !fromClubId || !toClubId || !fee || !deadline) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate player and clubs
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        const fromClub = yield prisma.club.findUnique({ where: { id: fromClubId } });
        const toClub = yield prisma.club.findUnique({ where: { id: toClubId } });
        if (!fromClub || !toClub)
            return res.status(404).json({ error: 'Club not found' });
        if (player.clubId !== fromClubId)
            return res.status(400).json({ error: 'Player does not belong to fromClub' });
        // Determine initiator from session/auth (future: integrate real auth)
        let initiator = 'user';
        // Use type assertions to avoid TypeScript errors (temporary workaround)
        const reqAny = req;
        if (reqAny.user && reqAny.user.role) {
            initiator = reqAny.user.role;
        }
        else if (reqAny.session && reqAny.session.user && reqAny.session.user.role) {
            initiator = reqAny.session.user.role;
        }
        // Create offer
        const offer = yield prisma.transferOffer.create({
            data: {
                playerId,
                fromClubId,
                toClubId,
                initiator, // Now set from session/user if available
                status: 'pending',
                fee,
                clauses: clauses || {},
                deadline: new Date(deadline),
                history: [],
            },
        });
        res.status(201).json(offer);
    }
    catch (err) {
        console.error('Error creating transfer offer:', err);
        res.status(500).json({ error: 'Failed to create transfer offer' });
    }
}));
// Respond to a transfer offer (accept/reject/counter)
router.post('/:id/respond', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offerId = parseInt(req.params.id);
        const { action, counterFee, counterClauses } = req.body;
        if (!['accept', 'reject', 'counter'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        const offer = yield prisma.transferOffer.findUnique({ where: { id: offerId } });
        if (!offer)
            return res.status(404).json({ error: 'Offer not found' });
        if (offer.status !== 'pending' && offer.status !== 'countered') {
            return res.status(400).json({ error: 'Offer is not pending or countered' });
        }
        let updatedOffer;
        let newHistory = Array.isArray(offer.history) ? offer.history : [];
        if (action === 'accept') {
            updatedOffer = yield prisma.transferOffer.update({
                where: { id: offerId },
                data: {
                    status: 'accepted',
                    history: [...newHistory, { action: 'accept', date: new Date() }],
                },
            });
        }
        else if (action === 'reject') {
            updatedOffer = yield prisma.transferOffer.update({
                where: { id: offerId },
                data: {
                    status: 'rejected',
                    history: [...newHistory, { action: 'reject', date: new Date() }],
                },
            });
        }
        else if (action === 'counter') {
            if (!counterFee)
                return res.status(400).json({ error: 'Missing counterFee for counter action' });
            updatedOffer = yield prisma.transferOffer.update({
                where: { id: offerId },
                data: {
                    status: 'countered',
                    fee: counterFee,
                    clauses: counterClauses || offer.clauses,
                    history: [...newHistory, { action: 'counter', date: new Date(), counterFee, counterClauses }],
                },
            });
        }
        res.json(updatedOffer);
    }
    catch (err) {
        console.error('Error responding to transfer offer:', err);
        res.status(500).json({ error: 'Failed to respond to transfer offer' });
    }
}));
// List all offers for a club (incoming/outgoing)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.query.clubId);
        const status = req.query.status;
        if (!clubId)
            return res.status(400).json({ error: 'Missing clubId query param' });
        const where = {
            OR: [
                { fromClubId: clubId },
                { toClubId: clubId },
            ],
        };
        if (status)
            where.status = status;
        const offers = yield prisma.transferOffer.findMany({ where });
        res.json(offers);
    }
    catch (err) {
        console.error('Error listing transfer offers:', err);
        res.status(500).json({ error: 'Failed to list transfer offers' });
    }
}));
// Sign a free agent
router.post('/free-agent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, toClubId, wage, contractExpiry } = req.body;
        if (!playerId || !toClubId || !wage || !contractExpiry) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate player
        const player = yield prisma.player.findUnique({ where: { id: playerId } });
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        if (player.clubId !== null) {
            return res.status(400).json({ error: 'Player is not a free agent' });
        }
        // Validate club
        const club = yield prisma.club.findUnique({ where: { id: toClubId } });
        if (!club)
            return res.status(404).json({ error: 'Club not found' });
        // Find the Free Agent club before creating the offer
        const freeAgentClub = yield prisma.club.findFirst({ where: { name: 'Free Agent' } });
        if (!freeAgentClub)
            return res.status(500).json({ error: 'Free Agent club not found' });
        // Update player
        const updatedPlayer = yield prisma.player.update({
            where: { id: playerId },
            data: {
                clubId: toClubId,
                wage,
                contractExpiry: new Date(contractExpiry),
            },
        });
        // Log as finalized TransferOffer
        yield prisma.transferOffer.create({
            data: {
                playerId,
                fromClubId: freeAgentClub.id, // Use Free Agent club's ID instead of null
                toClubId,
                initiator: 'user',
                status: 'finalized',
                fee: 0,
                clauses: {},
                deadline: new Date(contractExpiry),
                history: [{ action: 'signed', date: new Date(), wage }],
            },
        });
        res.json({ player: updatedPlayer });
    }
    catch (err) {
        console.error('Error signing free agent:', err);
        res.status(500).json({ error: 'Failed to sign free agent' });
    }
}));
exports.default = router;
