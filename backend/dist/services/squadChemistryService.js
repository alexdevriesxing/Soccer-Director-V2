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
exports.SquadChemistryService = void 0;
exports.createSquadChemistryService = createSquadChemistryService;
function createSquadChemistryService(prisma) {
    return {
        getSquadChemistry(clubId) {
            return __awaiter(this, void 0, void 0, function* () {
                return prisma.squadChemistry.findFirst({ where: { clubId } });
            });
        },
        setSquadChemistry(clubId, score, notes) {
            return __awaiter(this, void 0, void 0, function* () {
                const existing = yield prisma.squadChemistry.findFirst({ where: { clubId } });
                if (existing) {
                    return prisma.squadChemistry.update({ where: { id: existing.id }, data: { score, notes } });
                }
                else {
                    return prisma.squadChemistry.create({ data: { clubId, score, notes } });
                }
            });
        },
        calculateSquadChemistry(clubId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Example: +5 per win, -7 per loss, -3 per injury, -10 for major transfer out
                let score = 50;
                if (context.recentResults) {
                    for (const r of context.recentResults) {
                        if (r.result === 'win')
                            score += 5;
                        if (r.result === 'loss')
                            score -= 7;
                    }
                }
                if (context.transfers) {
                    for (const t of context.transfers) {
                        if (t.type === 'out' && t.important)
                            score -= 10;
                    }
                }
                if (context.injuries) {
                    score -= context.injuries.length * 3;
                }
                if (score > 100)
                    score = 100;
                if (score < 0)
                    score = 0;
                yield this.setSquadChemistry(clubId, score);
                return score;
            });
        },
    };
}
const client_1 = require("@prisma/client");
exports.SquadChemistryService = createSquadChemistryService(new client_1.PrismaClient());
