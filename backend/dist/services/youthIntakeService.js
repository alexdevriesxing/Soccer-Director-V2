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
exports.automateIntake = exports.getIntakeHistory = exports.triggerIntakeEvent = void 0;
// Youth Intake Service
const client_1 = require("@prisma/client");
const youthScoutingService_1 = require("./youthScoutingService");
const prisma = new client_1.PrismaClient();
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
const personalityOptions = [
    'LAZY',
    'BELOW_AVERAGE',
    'PROFESSIONAL',
    'DRIVEN',
    'NATURAL'
];
function generateYouthPlayers(clubId, count) {
    return __awaiter(this, void 0, void 0, function* () {
        // Try to use scouting reports
        const reports = yield (0, youthScoutingService_1.generateScoutingReport)(clubId);
        const scoutedProspects = reports.flatMap(r => r.prospects);
        const players = [];
        for (let i = 0; i < count; i++) {
            let playerData;
            if (scoutedProspects.length > 0 && Math.random() < 0.7) {
                // 70% chance to use a scouted prospect if available
                const prospect = scoutedProspects.splice(Math.floor(Math.random() * scoutedProspects.length), 1)[0];
                playerData = {
                    name: prospect.name,
                    position: prospect.position,
                    age: prospect.age,
                    skill: prospect.skill,
                    talent: prospect.talent,
                    personality: prospect.personality,
                    nationality: prospect.nationality
                };
            }
            else {
                // Fallback to random
                const name = `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
                const position = randomFromArray(positions);
                const age = getRandomInt(15, 18);
                const skill = getRandomInt(35, 55);
                const talent = getRandomInt(skill + 10, 90);
                const personality = randomFromArray(personalityOptions);
                const nationality = randomFromArray(nationalities);
                playerData = { name, position, age, skill, talent, personality, nationality };
            }
            const player = yield prisma.player.create({
                data: {
                    name: playerData.name,
                    clubId,
                    position: playerData.position,
                    age: playerData.age,
                    skill: playerData.skill,
                    talent: playerData.talent,
                    personality: playerData.personality,
                    nationality: playerData.nationality,
                    wage: 0,
                    contractExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
                    potential: 80,
                    currentPotential: 65,
                    contractStart: new Date()
                }
            });
            players.push(player);
        }
        return players;
    });
}
const triggerIntakeEvent = (clubId, type, year) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Add validation, check club existence, etc.
    // Generate new youth players and link to event
    const event = yield prisma.youthIntakeEvent.create({
        data: { clubId, type, year }
    });
    const newPlayers = yield generateYouthPlayers(clubId, 5); // Generate 5 youth players per intake
    return { event, newPlayers };
});
exports.triggerIntakeEvent = triggerIntakeEvent;
const getIntakeHistory = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.youthIntakeEvent.findMany({ where: { clubId }, orderBy: { year: 'desc' } });
});
exports.getIntakeHistory = getIntakeHistory;
// Automation logic placeholder
const automateIntake = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    const year = new Date().getFullYear();
    const existing = yield prisma.youthIntakeEvent.findFirst({ where: { clubId, year } });
    if (!existing) {
        const event = yield prisma.youthIntakeEvent.create({ data: { clubId, year, type: 'auto' } });
        // Generate 5 new youth players
        for (let i = 0; i < 5; i++) {
            yield prisma.player.create({
                data: {
                    name: `Youth ${Math.floor(Math.random() * 10000)}`,
                    clubId,
                    position: ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)],
                    age: 16 + Math.floor(Math.random() * 3),
                    skill: Math.floor(Math.random() * 20) + 40,
                    talent: Math.floor(Math.random() * 30) + 50,
                    personality: 'BELOW_AVERAGE',
                    nationality: 'Netherlands',
                    wage: 0,
                    contractExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
                    potential: 80,
                    currentPotential: 65,
                    contractStart: new Date(),
                }
            });
        }
        return { event, generated: 5 };
    }
    return { event: existing, generated: 0 };
});
exports.automateIntake = automateIntake;
