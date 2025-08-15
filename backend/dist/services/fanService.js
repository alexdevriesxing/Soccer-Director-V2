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
exports.FanService = void 0;
exports.createFanService = createFanService;
function createFanService(prisma) {
    return {
        // FanGroup CRUD
        getFanGroups(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanGroup.findMany({ where: { clubId } });
            });
        },
        createFanGroup(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanGroup.create({ data });
            });
        },
        updateFanGroup(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanGroup.update({ where: { id }, data });
            });
        },
        deleteFanGroup(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanGroup.delete({ where: { id } });
            });
        },
        // FanEvent CRUD
        getFanEvents(fanGroupId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanEvent.findMany({ where: { fanGroupId } });
            });
        },
        createFanEvent(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanEvent.create({ data });
            });
        },
        updateFanEvent(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanEvent.update({ where: { id }, data });
            });
        },
        deleteFanEvent(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanEvent.delete({ where: { id } });
            });
        },
        // FanSentiment CRUD
        getFanSentiments(fanGroupId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanSentiment.findMany({ where: { fanGroupId } });
            });
        },
        createFanSentiment(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanSentiment.create({ data });
            });
        },
        updateFanSentiment(id, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanSentiment.update({ where: { id }, data });
            });
        },
        deleteFanSentiment(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.fanSentiment.delete({ where: { id } });
            });
        },
        // Business logic: trigger a fan event (utility)
        triggerFanEvent(fanGroupId, type, description, date) {
            return __awaiter(this, void 0, void 0, function* () {
                const event = yield prisma.fanEvent.create({
                    data: { fanGroupId, type, description, date }
                });
                return event;
            });
        },
        // --- Advanced business logic ---
        calculateFanSentiment(fanGroupId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Calculate sentiment: +10 per win, -15 per loss, +5 for big signing, -10 for star sold, -20 for unpopular board decision
                let sentiment = 50;
                if (context.matchResults) {
                    for (const r of context.matchResults) {
                        if (r.result === 'win')
                            sentiment += 10;
                        if (r.result === 'loss')
                            sentiment -= 15;
                    }
                }
                if (context.transfers) {
                    for (const t of context.transfers) {
                        if (t.type === 'in' && t.star)
                            sentiment += 5;
                        if (t.type === 'out' && t.star)
                            sentiment -= 10;
                    }
                }
                if (context.boardDecisions) {
                    for (const d of context.boardDecisions) {
                        if (d.unpopular)
                            sentiment -= 20;
                    }
                }
                if (sentiment > 100)
                    sentiment = 100;
                if (sentiment < -100)
                    sentiment = -100;
                return sentiment;
            });
        },
        triggerFanEventIfNeeded(fanGroupId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Example: trigger protest if sentiment < -50, celebration if > 80
                if (context.sentiment < -50) {
                    return this.triggerFanEvent(fanGroupId, 'protest', 'Fan protest due to poor results', new Date());
                }
                if (context.sentiment > 80) {
                    return this.triggerFanEvent(fanGroupId, 'celebration', 'Fan celebration for great results', new Date());
                }
                return null;
            });
        },
        updateFanGroupSize(fanGroupId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Grow group if performance/engagement high, shrink if low
                const group = yield prisma.fanGroup.findUnique({ where: { id: fanGroupId } });
                if (!group)
                    return false;
                let newSize = group.size;
                if (context.clubPerformance > 70 && context.engagement > 50)
                    newSize += 20;
                if (context.clubPerformance < 40 || context.engagement < 20)
                    newSize -= 15;
                if (newSize < 10)
                    newSize = 10;
                yield prisma.fanGroup.update({ where: { id: fanGroupId }, data: { size: newSize } });
                return true;
            });
        },
        applyFanPressure(clubId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // If sentiment < -50, reduce board satisfaction or club finances
                if (context.sentiment < -50) {
                    // Example: call BoardroomService to reduce satisfaction (integration point)
                    // Or update club finances (not implemented here)
                    // (Stub: no-op)
                    return 'Fan pressure applied';
                }
                return 'No action';
            });
        },
    };
}
// Default instance for production
const client_1 = require("@prisma/client");
exports.FanService = createFanService(new client_1.PrismaClient());
