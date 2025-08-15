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
const boardroomService_1 = require("./boardroomService");
const client_1 = require("@prisma/client");
jest.mock('@prisma/client');
const prisma = new client_1.PrismaClient();
const BoardroomService = (0, boardroomService_1.createBoardroomService)(prisma);
beforeAll(() => {
    Object.defineProperty(prisma, 'boardMember', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
    Object.defineProperty(prisma, 'boardMeeting', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
    Object.defineProperty(prisma, 'boardObjective', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
    Object.defineProperty(prisma, 'boardDecision', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
});
beforeEach(() => {
    jest.clearAllMocks();
});
describe('BoardroomService', () => {
    it('should get board members', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMember.findMany.mockResolvedValue([{ id: 1, name: 'Chairman', clubId: 1 }]);
        const result = yield BoardroomService.getBoardMembers(1);
        expect(result).toEqual([{ id: 1, name: 'Chairman', clubId: 1 }]);
    }));
    it('should create a board member', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMember.create.mockResolvedValue({ id: 2, name: 'Director', clubId: 1 });
        const result = yield BoardroomService.createBoardMember({ name: 'Director', clubId: 1 });
        expect(result).toEqual({ id: 2, name: 'Director', clubId: 1 });
    }));
    it('should update a board member', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMember.update.mockResolvedValue({ id: 1, name: 'Updated', clubId: 1 });
        const result = yield BoardroomService.updateBoardMember(1, { name: 'Updated' });
        expect(result).toEqual({ id: 1, name: 'Updated', clubId: 1 });
    }));
    it('should delete a board member', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMember.delete.mockResolvedValue({ id: 1, name: 'Deleted', clubId: 1 });
        const result = yield BoardroomService.deleteBoardMember(1);
        expect(result).toEqual({ id: 1, name: 'Deleted', clubId: 1 });
    }));
    it('should get board meetings', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMeeting.findMany.mockResolvedValue([{ id: 1, clubId: 1, agenda: 'Budget', date: new Date() }]);
        const result = yield BoardroomService.getBoardMeetings(1);
        expect(result[0].agenda).toBe('Budget');
    }));
    it('should create a board meeting', () => __awaiter(void 0, void 0, void 0, function* () {
        const meeting = { id: 2, clubId: 1, agenda: 'Strategy', date: new Date() };
        prisma.boardMeeting.create.mockResolvedValue(meeting);
        const result = yield BoardroomService.createBoardMeeting(meeting);
        expect(result).toEqual(meeting);
    }));
    it('should update a board meeting', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMeeting.update.mockResolvedValue({ id: 1, agenda: 'Updated', clubId: 1, date: new Date() });
        const result = yield BoardroomService.updateBoardMeeting(1, { agenda: 'Updated' });
        expect(result.agenda).toBe('Updated');
    }));
    it('should delete a board meeting', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardMeeting.delete.mockResolvedValue({ id: 1, agenda: 'Deleted', clubId: 1, date: new Date() });
        const result = yield BoardroomService.deleteBoardMeeting(1);
        expect(result.agenda).toBe('Deleted');
    }));
    it('should get board objectives', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardObjective.findMany.mockResolvedValue([{ id: 1, boardMemberId: 1, description: 'Win league' }]);
        const result = yield BoardroomService.getBoardObjectives(1);
        expect(result[0].description).toBe('Win league');
    }));
    it('should create a board objective', () => __awaiter(void 0, void 0, void 0, function* () {
        const obj = { id: 2, boardMemberId: 1, description: 'Increase revenue' };
        prisma.boardObjective.create.mockResolvedValue(obj);
        const result = yield BoardroomService.createBoardObjective(obj);
        expect(result).toEqual(obj);
    }));
    it('should update a board objective', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardObjective.update.mockResolvedValue({ id: 1, description: 'Updated', boardMemberId: 1 });
        const result = yield BoardroomService.updateBoardObjective(1, { description: 'Updated' });
        expect(result.description).toBe('Updated');
    }));
    it('should delete a board objective', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardObjective.delete.mockResolvedValue({ id: 1, description: 'Deleted', boardMemberId: 1 });
        const result = yield BoardroomService.deleteBoardObjective(1);
        expect(result.description).toBe('Deleted');
    }));
    it('should get board decisions', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardDecision.findMany.mockResolvedValue([{ id: 1, boardMeetingId: 1, description: 'Approve budget' }]);
        const result = yield BoardroomService.getBoardDecisions(1);
        expect(result[0].description).toBe('Approve budget');
    }));
    it('should create a board decision', () => __awaiter(void 0, void 0, void 0, function* () {
        const dec = { id: 2, boardMeetingId: 1, description: 'Sign player' };
        prisma.boardDecision.create.mockResolvedValue(dec);
        const result = yield BoardroomService.createBoardDecision(dec);
        expect(result).toEqual(dec);
    }));
    it('should update a board decision', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardDecision.update.mockResolvedValue({ id: 1, description: 'Updated', boardMeetingId: 1 });
        const result = yield BoardroomService.updateBoardDecision(1, { description: 'Updated' });
        expect(result.description).toBe('Updated');
    }));
    it('should delete a board decision', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.boardDecision.delete.mockResolvedValue({ id: 1, description: 'Deleted', boardMeetingId: 1 });
        const result = yield BoardroomService.deleteBoardDecision(1);
        expect(result.description).toBe('Deleted');
    }));
    it('should trigger a board meeting', () => __awaiter(void 0, void 0, void 0, function* () {
        const meeting = { id: 3, clubId: 1, agenda: 'Emergency', date: new Date() };
        prisma.boardMeeting.create.mockResolvedValue(meeting);
        const result = yield BoardroomService.triggerBoardMeeting(1, 'Emergency', new Date());
        expect(result.agenda).toBe('Emergency');
    }));
    // Error/edge cases can be added as needed
});
