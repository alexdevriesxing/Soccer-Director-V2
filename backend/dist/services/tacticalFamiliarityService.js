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
exports.TacticalFamiliarityService = void 0;
exports.createTacticalFamiliarityService = createTacticalFamiliarityService;
function createTacticalFamiliarityService(prisma) {
    return {
        getTacticalFamiliarity(clubId, tactic) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.tacticalFamiliarity.findFirst({ where: { clubId, tactic } });
            });
        },
        setTacticalFamiliarity(clubId, tactic, familiarity, notes) {
            return __awaiter(this, void 0, void 0, function* () {
                const existing = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId, tactic } });
                if (existing) {
                    return prisma.tacticalFamiliarity.update({ where: { id: existing.id }, data: { familiarity, notes } });
                }
                else {
                    return prisma.tacticalFamiliarity.create({ data: { clubId, tactic, familiarity, notes } });
                }
            });
        },
        calculateTacticalFamiliarity(clubId, tactic, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Example: +3 per training session, +5 per match played with tactic
                let familiarity = 50;
                if (context.trainingSessions)
                    familiarity += context.trainingSessions.length * 3;
                if (context.matches)
                    familiarity += context.matches.length * 5;
                if (familiarity > 100)
                    familiarity = 100;
                if (familiarity < 0)
                    familiarity = 0;
                yield this.setTacticalFamiliarity(clubId, tactic, familiarity);
                return familiarity;
            });
        },
    };
}
const client_1 = require("@prisma/client");
exports.TacticalFamiliarityService = createTacticalFamiliarityService(new client_1.PrismaClient());
