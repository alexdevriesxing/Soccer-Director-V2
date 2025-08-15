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
const boardroomService_1 = require("../services/boardroomService");
const router = express_1.default.Router();
// GET /api/boardroom/members/:clubId
router.get('/members/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const members = yield boardroomService_1.BoardroomService.getBoardMembers(clubId);
        res.json({ members });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_members') });
    }
}));
// GET /api/boardroom/meetings/:clubId
router.get('/meetings/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const meetings = yield boardroomService_1.BoardroomService.getBoardMeetings(clubId);
        res.json({ meetings });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_meetings') });
    }
}));
// GET /api/boardroom/objectives/:boardMemberId
router.get('/objectives/:boardMemberId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boardMemberId = parseInt(req.params.boardMemberId, 10);
        const objectives = yield boardroomService_1.BoardroomService.getBoardObjectives(boardMemberId);
        res.json({ objectives });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_objectives') });
    }
}));
// GET /api/boardroom/decisions/:meetingId
router.get('/decisions/:meetingId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boardMeetingId = parseInt(req.params.meetingId, 10);
        const decisions = yield boardroomService_1.BoardroomService.getBoardDecisions(boardMeetingId);
        res.json({ decisions });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_decisions') });
    }
}));
// GET /api/boardroom/satisfaction/:clubId
router.get('/satisfaction/:clubId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clubId = parseInt(req.params.clubId, 10);
        const score = yield boardroomService_1.BoardroomService.calculateBoardSatisfaction(clubId);
        res.json({ satisfaction: score });
    }
    catch (error) {
        res.status(500).json({ error: (0, i18n_1.t)('error.failed_to_fetch_board_satisfaction') });
    }
}));
exports.default = router;
