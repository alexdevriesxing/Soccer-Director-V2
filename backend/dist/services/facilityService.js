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
exports.getFacilitiesForClub = getFacilitiesForClub;
exports.upgradeFacility = upgradeFacility;
exports.getUpgradeProgress = getUpgradeProgress;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getFacilitiesForClub(clubId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch all facilities for the club
        const facilities = yield prisma.facility.findMany({
            where: { clubId },
            select: {
                id: true,
                name: true,
                type: true,
                level: true,
                capacity: true,
                maintenanceCost: true,
                upgradeCost: true,
                effects: true,
            },
        });
        return facilities;
    });
}
function upgradeFacility(facilityId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the facility and club
        const facility = yield prisma.facility.findUnique({ where: { id: facilityId } });
        if (!facility)
            throw new Error('Facility not found');
        if (facility.level >= 5)
            throw new Error('Facility is already at max level');
        const club = yield prisma.club.findUnique({ where: { id: facility.clubId }, include: { finances: { orderBy: { week: 'desc' }, take: 1 } } });
        if (!club)
            throw new Error('Club not found');
        const upgradeCost = facility.upgradeCost;
        const finances = club.finances[0];
        if (!finances || finances.balance < upgradeCost)
            throw new Error('Insufficient funds');
        // Deduct cost from club finances
        yield prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { decrement: upgradeCost } } });
        // Upgrade the facility
        const upgraded = yield prisma.facility.update({ where: { id: facilityId }, data: { level: { increment: 1 } } });
        // Optionally: recalculate effects, costs, etc.
        return upgraded;
    });
}
function getUpgradeProgress(clubId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch all facilities for the club
        const facilities = yield prisma.facility.findMany({ where: { clubId } });
        // Fetch all upgrade requests for the club
        const upgrades = yield prisma.facilityUpgradeRequest.findMany({
            where: { facility: { clubId } },
            orderBy: { requestedAt: 'desc' }
        });
        // Map upgrades by facilityId
        const upgradesByFacility = {};
        for (const upgrade of upgrades) {
            upgradesByFacility[upgrade.facilityId] = upgrade;
        }
        // Build progress info for each facility
        const progress = facilities.map((facility) => {
            const upgrade = upgradesByFacility[facility.id];
            let status = 'idle';
            let estimatedCompletion = null;
            if (upgrade && upgrade.status === 'in_progress') {
                status = 'in_progress';
                // Assume upgrades take 7 days from requestedAt
                estimatedCompletion = new Date(new Date(upgrade.requestedAt).getTime() + 7 * 24 * 60 * 60 * 1000);
            }
            return {
                id: facility.id,
                name: facility.name,
                type: facility.type,
                level: facility.level,
                status,
                estimatedCompletion
            };
        });
        return progress;
    });
}
