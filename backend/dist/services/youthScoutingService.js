"use strict";
// Youth Scouting Service (stubbed to avoid schema mismatches)
// TODO: Replace with competition-based youth scouting implementation aligned with Prisma schema
// For now, avoid direct Prisma calls that reference removed models/fields.
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
exports.automateScouting = exports.generateScoutingReport = exports.getScouts = exports.assignScout = void 0;
const inMemoryScouts = [];
let scoutSeq = 1;
const assignScout = (clubId, name, region, ability, network) => __awaiter(void 0, void 0, void 0, function* () {
    const scout = { id: scoutSeq++, clubId, name, region, ability, network };
    inMemoryScouts.push(scout);
    return scout;
});
exports.assignScout = assignScout;
const getScouts = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    return inMemoryScouts.filter(s => s.clubId === clubId);
});
exports.getScouts = getScouts;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
const positions = ['GK', 'DEF', 'MID', 'FWD'];
const nationalities = ['Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy'];
const firstNames = ['Jan', 'Piet', 'Kees', 'Erik', 'Marco', 'Sven', 'Lars', 'Tom', 'Daan', 'Jens'];
const lastNames = ['de Jong', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos'];
const generateScoutingReport = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    const scouts = inMemoryScouts.filter(s => s.clubId === clubId);
    const reports = [];
    for (const scout of scouts) {
        const numProspects = Math.max(1, Math.floor((scout.ability + scout.network) / 40)); // 1-5 prospects
        const prospects = [];
        for (let i = 0; i < numProspects; i++) {
            const name = `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
            const position = randomFromArray(positions);
            const age = getRandomInt(15, 18);
            // Ability influences minimum skill, network influences max potential
            const minSkill = Math.floor(scout.ability * 0.3) + 30;
            const maxSkill = Math.floor(scout.ability * 0.7) + 50;
            const skill = getRandomInt(minSkill, maxSkill);
            const maxTalent = Math.floor(scout.network * 0.7) + 60;
            const talent = getRandomInt(skill + 10, maxTalent);
            const personality = randomFromArray(['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL']);
            const nationality = scout.region || randomFromArray(nationalities);
            prospects.push({ name, position, age, skill, talent, personality, nationality });
        }
        reports.push({ scout: { id: scout.id, name: scout.name, region: scout.region }, prospects });
    }
    return reports;
});
exports.generateScoutingReport = generateScoutingReport;
// Automation logic placeholder
const automateScouting = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const scouts = inMemoryScouts.filter(s => s.clubId === clubId);
    const regions = ['Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy'];
    const regionCounts = {};
    for (const region of regions)
        regionCounts[region] = 0;
    // Simple balancing
    for (const scout of scouts) {
        if (!scout.region) {
            const targetRegion = ((_a = Object.entries(regionCounts).sort((a, b) => a[1] - b[1])[0]) === null || _a === void 0 ? void 0 : _a[0]) || regions[0];
            scout.region = targetRegion;
            regionCounts[targetRegion]++;
        }
    }
    return { assigned: scouts.length };
});
exports.automateScouting = automateScouting;
