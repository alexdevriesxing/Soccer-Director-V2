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
exports.BoardroomService = void 0;
exports.createBoardroomService = createBoardroomService;
function createBoardroomService(prisma) {
    return {
        // BoardMember CRUD
        getBoardMembers(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMember.findMany({ where: { clubId } });
            });
        },
        createBoardMember(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMember.create({ data });
            });
        },
        updateBoardMember(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMember.update({ where: { id }, data });
            });
        },
        deleteBoardMember(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMember.delete({ where: { id } });
            });
        },
        // BoardMeeting CRUD
        getBoardMeetings(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMeeting.findMany({ where: { clubId } });
            });
        },
        createBoardMeeting(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMeeting.create({ data });
            });
        },
        updateBoardMeeting(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMeeting.update({ where: { id }, data });
            });
        },
        deleteBoardMeeting(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardMeeting.delete({ where: { id } });
            });
        },
        // BoardObjective CRUD
        getBoardObjectives(boardMemberId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardObjective.findMany({ where: { boardMemberId } });
            });
        },
        createBoardObjective(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardObjective.create({ data });
            });
        },
        updateBoardObjective(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardObjective.update({ where: { id }, data });
            });
        },
        deleteBoardObjective(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardObjective.delete({ where: { id } });
            });
        },
        // BoardDecision CRUD
        getBoardDecisions(boardMeetingId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardDecision.findMany({ where: { boardMeetingId } });
            });
        },
        createBoardDecision(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardDecision.create({ data });
            });
        },
        updateBoardDecision(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardDecision.update({ where: { id }, data });
            });
        },
        deleteBoardDecision(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.boardDecision.delete({ where: { id } });
            });
        },
        // Business logic: trigger a board meeting (utility)
        triggerBoardMeeting(clubId, agenda, date) {
            return __awaiter(this, void 0, void 0, function* () {
                const meeting = yield prisma.boardMeeting.create({
                    data: { clubId, agenda, date }
                });
                return meeting;
            });
        },
        // --- Advanced business logic ---
        calculateBoardSatisfaction(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                // Fetch objectives
                const objectives = yield prisma.boardObjective.findMany({
                    where: { boardMember: { clubId } },
                });
                // Fetch recent results (stub: assume available via another service or passed in)
                // Fetch finances (stub: assume available via another service or passed in)
                // For now, use objectives only
                const completed = objectives.filter(o => o.status === 'completed').length;
                const failed = objectives.filter(o => o.status === 'failed').length;
                const active = objectives.filter(o => o.status === 'active').length;
                // Simple formula: 100 - (failed*20) + (completed*10) - (active*2)
                let score = 100 - (failed * 20) + (completed * 10) - (active * 2);
                if (score > 100)
                    score = 100;
                if (score < 0)
                    score = 0;
                return score;
            });
        },
        triggerBoardMeetingIfNeeded(clubId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Example: if crisis or poor results, trigger a meeting
                if (context.crisis || (context.recentResults && context.recentResults.filter(r => r.loss).length >= 3)) {
                    return this.triggerBoardMeeting(clubId, 'Emergency Meeting', new Date());
                }
                return null;
            });
        },
        updateBoardObjectives(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                // Example: if no active objectives, add a new one
                const objectives = yield prisma.boardObjective.findMany({
                    where: { boardMember: { clubId }, status: 'active' },
                });
                if (objectives.length === 0) {
                    // Find a board member
                    const member = yield prisma.boardMember.findFirst({ where: { clubId } });
                    if (member) {
                        yield prisma.boardObjective.create({
                            data: {
                                boardMemberId: member.id,
                                description: 'Finish in top half of league',
                                status: 'active',
                                deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
                            },
                        });
                    }
                }
                return true;
            });
        },
        handleBoardMemberTurnover(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                // Remove a board member if satisfaction < 40, add if > 90
                const satisfaction = yield this.calculateBoardSatisfaction(clubId);
                if (satisfaction < 40) {
                    const member = yield prisma.boardMember.findFirst({ where: { clubId } });
                    if (member) {
                        yield prisma.boardMember.delete({ where: { id: member.id } });
                    }
                }
                else if (satisfaction > 90) {
                    yield prisma.boardMember.create({
                        data: {
                            clubId,
                            name: 'New Board Member',
                            role: 'Director',
                            influence: 50,
                            tenure: 0,
                        },
                    });
                }
                return true;
            });
        },
    };
}
// Default instance for production
const client_1 = require("@prisma/client");
exports.BoardroomService = createBoardroomService(new client_1.PrismaClient());
