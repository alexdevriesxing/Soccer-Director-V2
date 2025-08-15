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
const fanService_1 = require("./fanService");
const client_1 = require("@prisma/client");
jest.mock('@prisma/client');
const prisma = new client_1.PrismaClient();
const FanService = (0, fanService_1.createFanService)(prisma);
beforeAll(() => {
    Object.defineProperty(prisma, 'fanGroup', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
    Object.defineProperty(prisma, 'fanEvent', {
        value: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        writable: true,
    });
    Object.defineProperty(prisma, 'fanSentiment', {
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
describe('FanService', () => {
    it('should get fan groups', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanGroup.findMany.mockResolvedValue([{ id: 1, name: 'Ultras', clubId: 1 }]);
        const result = yield FanService.getFanGroups(1);
        expect(result).toEqual([{ id: 1, name: 'Ultras', clubId: 1 }]);
    }));
    it('should create a fan group', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanGroup.create.mockResolvedValue({ id: 2, name: 'Supporters', clubId: 1 });
        const result = yield FanService.createFanGroup({ name: 'Supporters', clubId: 1 });
        expect(result).toEqual({ id: 2, name: 'Supporters', clubId: 1 });
    }));
    it('should update a fan group', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanGroup.update.mockResolvedValue({ id: 1, name: 'Updated', clubId: 1 });
        const result = yield FanService.updateFanGroup(1, { name: 'Updated' });
        expect(result).toEqual({ id: 1, name: 'Updated', clubId: 1 });
    }));
    it('should delete a fan group', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanGroup.delete.mockResolvedValue({ id: 1, name: 'Deleted', clubId: 1 });
        const result = yield FanService.deleteFanGroup(1);
        expect(result).toEqual({ id: 1, name: 'Deleted', clubId: 1 });
    }));
    it('should get fan events', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanEvent.findMany.mockResolvedValue([{ id: 1, fanGroupId: 1, type: 'protest', description: 'Protest', date: new Date() }]);
        const result = yield FanService.getFanEvents(1);
        expect(result[0].type).toBe('protest');
    }));
    it('should create a fan event', () => __awaiter(void 0, void 0, void 0, function* () {
        const event = { id: 2, fanGroupId: 1, type: 'celebration', description: 'Party', date: new Date() };
        prisma.fanEvent.create.mockResolvedValue(event);
        const result = yield FanService.createFanEvent(event);
        expect(result).toEqual(event);
    }));
    it('should update a fan event', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanEvent.update.mockResolvedValue({ id: 1, type: 'updated', fanGroupId: 1, description: 'Updated', date: new Date() });
        const result = yield FanService.updateFanEvent(1, { type: 'updated' });
        expect(result.type).toBe('updated');
    }));
    it('should delete a fan event', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanEvent.delete.mockResolvedValue({ id: 1, type: 'deleted', fanGroupId: 1, description: 'Deleted', date: new Date() });
        const result = yield FanService.deleteFanEvent(1);
        expect(result.type).toBe('deleted');
    }));
    it('should get fan sentiments', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanSentiment.findMany.mockResolvedValue([{ id: 1, fanGroupId: 1, sentiment: 50, reason: 'Good result', date: new Date() }]);
        const result = yield FanService.getFanSentiments(1);
        expect(result[0].sentiment).toBe(50);
    }));
    it('should create a fan sentiment', () => __awaiter(void 0, void 0, void 0, function* () {
        const sentiment = { id: 2, fanGroupId: 1, sentiment: 80, reason: 'Promotion', date: new Date() };
        prisma.fanSentiment.create.mockResolvedValue(sentiment);
        const result = yield FanService.createFanSentiment(sentiment);
        expect(result).toEqual(sentiment);
    }));
    it('should update a fan sentiment', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanSentiment.update.mockResolvedValue({ id: 1, sentiment: 10, fanGroupId: 1, reason: 'Bad result', date: new Date() });
        const result = yield FanService.updateFanSentiment(1, { sentiment: 10 });
        expect(result.sentiment).toBe(10);
    }));
    it('should delete a fan sentiment', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.fanSentiment.delete.mockResolvedValue({ id: 1, sentiment: 0, fanGroupId: 1, reason: 'Deleted', date: new Date() });
        const result = yield FanService.deleteFanSentiment(1);
        expect(result.sentiment).toBe(0);
    }));
    it('should trigger a fan event', () => __awaiter(void 0, void 0, void 0, function* () {
        const event = { id: 3, fanGroupId: 1, type: 'online', description: 'Tweet', date: new Date() };
        prisma.fanEvent.create.mockResolvedValue(event);
        const result = yield FanService.triggerFanEvent(1, 'online', 'Tweet', new Date());
        expect(result.type).toBe('online');
    }));
    // Error/edge cases can be added as needed
});
