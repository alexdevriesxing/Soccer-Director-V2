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
exports.createTestPlayers = exports.createTestUser = exports.clearDatabase = void 0;
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
/**
 * Clears all data from the test database (SQLite version)
 */
const clearDatabase = (prisma) => __awaiter(void 0, void 0, void 0, function* () {
    const tables = yield prisma.$queryRaw `
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%' 
    AND name NOT LIKE '_prisma_migrations'
  `;
    try {
        yield prisma.$transaction([
            // Disable foreign key checks
            prisma.$executeRaw `PRAGMA foreign_keys = OFF`,
            // Delete all data from each table
            ...tables.map(({ name }) => prisma.$executeRawUnsafe(`DELETE FROM "${name}"`)),
            // Re-enable foreign key checks
            prisma.$executeRaw `PRAGMA foreign_keys = ON`
        ]);
    }
    catch (error) {
        console.error('Error clearing test database:', error);
        throw error;
    }
});
exports.clearDatabase = clearDatabase;
const createTestUser = (_prisma) => __awaiter(void 0, void 0, void 0, function* () {
    // Return a mock user for testing
    const user = {
        id: faker_1.faker.number.int({ min: 1, max: 1000 }),
        email: faker_1.faker.internet.email(),
        name: faker_1.faker.person.fullName(),
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    // In a real app, you would generate a proper JWT token here
    const token = 'test-token';
    return { user, token };
});
exports.createTestUser = createTestUser;
const createTestPlayers = (prisma_1, ...args_1) => __awaiter(void 0, [prisma_1, ...args_1], void 0, function* (prisma, count = 10, clubId) {
    const positions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LWB', 'RWB', 'LB', 'RB', 'CB', 'GK'];
    const nationalities = ['Brazil', 'Argentina', 'France', 'Spain', 'Germany', 'England', 'Italy', 'Netherlands', 'Portugal', 'Belgium'];
    const personalities = [
        client_1.Personality.LAZY,
        client_1.Personality.BELOW_AVERAGE,
        client_1.Personality.PROFESSIONAL,
        client_1.Personality.DRIVEN,
        client_1.Personality.NATURAL
    ];
    const now = new Date();
    const players = [];
    for (let i = 0; i < count; i++) {
        const skill = Math.floor(Math.random() * 30) + 50; // 50-80
        const potential = Math.min(99, skill + Math.floor(Math.random() * 20) + 5); // 5-25 points higher than skill, max 99
        const currentPotential = potential - Math.floor(Math.random() * 5); // Slightly lower than max potential
        const contractStart = new Date(now);
        const contractExpiry = new Date(now);
        contractExpiry.setFullYear(contractExpiry.getFullYear() + Math.floor(Math.random() * 3) + 2); // 2-5 year contract
        const playerData = Object.assign({ name: `Player ${i + 1}`, position: positions[Math.floor(Math.random() * positions.length)], age: Math.floor(Math.random() * 15) + 18, skill: skill, talent: Math.floor(Math.random() * 100), personality: personalities[Math.floor(Math.random() * personalities.length)], nationality: nationalities[Math.floor(Math.random() * nationalities.length)], wage: Math.floor(Math.random() * 50000) + 5000, contractStart: contractStart, contractExpiry: contractExpiry, potential: potential, currentPotential: currentPotential, morale: Math.floor(Math.random() * 40) + 60, injured: Math.random() > 0.9, internationalCaps: Math.floor(Math.random() * 50), improvementRate: 0.02 + (Math.random() * 0.03), ambition: Math.floor(Math.random() * 5) + 1, reputation: Math.floor(Math.random() * 100) }, (clubId && { clubId: clubId }));
        // Create player traits
        const traits = [
            { name: `Trait ${i + 1}-1`, description: 'Test trait 1' },
            { name: `Trait ${i + 1}-2`, description: 'Test trait 2' },
        ];
        // Create the player with traits in a transaction
        const [player] = yield prisma.$transaction([
            prisma.player.create({
                data: Object.assign(Object.assign({}, playerData), { playerTraits: {
                        create: traits.map(trait => ({
                            name: trait.name,
                            description: trait.description,
                            isPositive: Math.random() > 0.5,
                        })),
                    } }),
                include: {
                    playerTraits: true,
                },
            })
        ]);
        players.push(player);
    }
    return players;
});
exports.createTestPlayers = createTestPlayers;
