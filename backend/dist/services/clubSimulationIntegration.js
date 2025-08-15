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
exports.onMatchPlayed = onMatchPlayed;
exports.onTransfer = onTransfer;
exports.onBoardDecision = onBoardDecision;
exports.onWeeklyUpdate = onWeeklyUpdate;
const boardroomService_1 = require("./boardroomService");
const fanService_1 = require("./fanService");
/**
 * Call after a match is played.
 * Updates fan sentiment, triggers fan/board events, recalculates satisfaction.
 */
function onMatchPlayed(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clubId, fanGroupId, matchResult, boardContext }) {
        // Update fan sentiment
        const sentiment = yield fanService_1.FanService.calculateFanSentiment(fanGroupId, { matchResults: [matchResult], transfers: [], boardDecisions: [] });
        yield fanService_1.FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [matchResult] });
        // Recalculate board satisfaction
        yield boardroomService_1.BoardroomService.calculateBoardSatisfaction(clubId);
        yield boardroomService_1.BoardroomService.triggerBoardMeetingIfNeeded(clubId, boardContext);
    });
}
/**
 * Call after a transfer (in or out).
 */
function onTransfer(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clubId, fanGroupId, transfer, boardContext }) {
        // Update fan sentiment
        const sentiment = yield fanService_1.FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [transfer], boardDecisions: [] });
        yield fanService_1.FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [transfer] });
        // Recalculate board satisfaction
        yield boardroomService_1.BoardroomService.calculateBoardSatisfaction(clubId);
    });
}
/**
 * Call after a board decision (e.g., sacking manager, stadium expansion).
 */
function onBoardDecision(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clubId, fanGroupId, boardDecision }) {
        // Update fan sentiment
        const sentiment = yield fanService_1.FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [], boardDecisions: [boardDecision] });
        yield fanService_1.FanService.triggerFanEventIfNeeded(fanGroupId, { sentiment, recentEvents: [boardDecision] });
        // Recalculate board satisfaction
        yield boardroomService_1.BoardroomService.calculateBoardSatisfaction(clubId);
    });
}
/**
 * Call at the end of each week (or month) for regular updates.
 */
function onWeeklyUpdate(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clubId, fanGroupId, clubPerformance, engagement }) {
        yield boardroomService_1.BoardroomService.updateBoardObjectives(clubId);
        yield boardroomService_1.BoardroomService.handleBoardMemberTurnover(clubId);
        yield fanService_1.FanService.updateFanGroupSize(fanGroupId, { clubPerformance, engagement });
        // Optionally, apply fan pressure
        const sentiment = yield fanService_1.FanService.calculateFanSentiment(fanGroupId, { matchResults: [], transfers: [], boardDecisions: [] });
        yield fanService_1.FanService.applyFanPressure(clubId, { sentiment });
    });
}
