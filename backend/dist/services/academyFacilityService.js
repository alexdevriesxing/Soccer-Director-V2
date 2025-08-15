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
exports.automateFacilityUpgrades = exports.getFacilitiesBySpecialization = exports.setFacilitySpecialization = exports.upgradeFacility = exports.getFacilitiesForClub = void 0;
// Academy Facility Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFacilitiesForClub = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.academyFacility.findMany({ where: { clubId } });
});
exports.getFacilitiesForClub = getFacilitiesForClub;
const upgradeFacility = (facilityId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the facility and club
    const facility = yield prisma.academyFacility.findUnique({ where: { id: facilityId } });
    if (!facility)
        throw new Error('Facility not found');
    if (facility.level >= 5)
        throw new Error('Facility is already at max level');
    const club = yield prisma.club.findUnique({ where: { id: facility.clubId }, include: { finances: { orderBy: { week: 'desc' }, take: 1 } } });
    if (!club)
        throw new Error('Club not found');
    // Calculate upgrade cost (e.g., 10,000 per level)
    const upgradeCost = 10000 * (facility.level + 1);
    const finances = club.finances[0];
    if (!finances || finances.balance < upgradeCost)
        throw new Error('Insufficient funds');
    // Deduct cost from club finances
    yield prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { decrement: upgradeCost } } });
    // Upgrade the facility
    const upgraded = yield prisma.academyFacility.update({ where: { id: facilityId }, data: { level: { increment: 1 } } });
    // TODO: Apply facility effects (e.g., boost youth development, reduce injuries)
    return upgraded;
});
exports.upgradeFacility = upgradeFacility;
// Set or update a facility's specialization
const setFacilitySpecialization = (facilityId, specialization) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.academyFacility.update({
        where: { id: facilityId },
        data: { specialization }
    });
});
exports.setFacilitySpecialization = setFacilitySpecialization;
// Get all facilities for a club with a specific specialization
const getFacilitiesBySpecialization = (clubId, specialization) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.academyFacility.findMany({ where: { clubId, specialization } });
});
exports.getFacilitiesBySpecialization = getFacilitiesBySpecialization;
// Automation logic placeholder
const automateFacilityUpgrades = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const facilities = yield prisma.academyFacility.findMany({ where: { clubId } });
    for (const facility of facilities) {
        if (((_a = facility.level) !== null && _a !== void 0 ? _a : 0) < 3) {
            const existing = yield prisma.facilityUpgradeRequest.findFirst({ where: { facilityId: facility.id, status: 'pending' } });
            if (!existing) {
                yield prisma.facilityUpgradeRequest.create({ data: { facilityId: facility.id, requestedAt: new Date(), status: 'pending' } });
            }
        }
    }
    return { scheduled: facilities.filter((f) => { var _a; return ((_a = f.level) !== null && _a !== void 0 ? _a : 0) < 3; }).length };
});
exports.automateFacilityUpgrades = automateFacilityUpgrades;
