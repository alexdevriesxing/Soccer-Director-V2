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
exports.YouthDevelopmentService = void 0;
// Youth Development Service
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class YouthDevelopmentService {
    // Create youth academy for a club
    static createYouthAcademy(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, level = 1) {
            const existing = yield prisma.youthAcademy.findFirst({ where: { clubId } });
            if (existing)
                throw new Error('Youth academy already exists for this club');
            const academy = yield prisma.youthAcademy.create({
                data: {
                    clubId,
                    level,
                    facilities: JSON.stringify(['training_ground', 'gym', 'medical_center']),
                    coaches: JSON.stringify([]),
                    currentIntake: JSON.stringify([]),
                }
            });
            return this.formatYouthAcademy(academy);
        });
    }
    // Get youth academy for a club
    static getYouthAcademy(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const academy = yield prisma.youthAcademy.findFirst({ where: { clubId } });
            return academy ? this.formatYouthAcademy(academy) : null;
        });
    }
    // Upgrade youth academy
    static upgradeYouthAcademy(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const academy = yield prisma.youthAcademy.findFirst({ where: { clubId } });
            if (!academy)
                throw new Error('Youth academy not found');
            const newLevel = academy.level + 1;
            const newFacilities = this.getFacilitiesForLevel(newLevel);
            const newCoaches = this.getCoachesForLevel(newLevel);
            const updated = yield prisma.youthAcademy.update({
                where: { id: academy.id },
                data: {
                    level: newLevel,
                    facilities: JSON.stringify(newFacilities),
                    coaches: JSON.stringify(newCoaches)
                }
            });
            return this.formatYouthAcademy(updated);
        });
    }
    // Generate youth intake
    static generateYouthIntake(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, count = 5) {
            const academy = yield this.getYouthAcademy(clubId);
            if (!academy)
                throw new Error('Youth academy not found');
            const players = [];
            const positions = ['GK', 'DEF', 'MID', 'FWD'];
            const personalities = ['BELOW_AVERAGE', 'AVERAGE', 'ABOVE_AVERAGE', 'PROFESSIONAL', 'MODEL_CITIZEN'];
            for (let i = 0; i < count; i++) {
                const position = positions[Math.floor(Math.random() * positions.length)];
                const personality = personalities[Math.floor(Math.random() * personalities.length)];
                const age = 15 + Math.floor(Math.random() * 3);
                const skill = 30 + Math.floor(Math.random() * 30);
                const potential = skill + Math.floor(Math.random() * 40) + 20;
                const player = yield prisma.player.create({
                    data: {
                        name: `Youth ${Math.floor(Math.random() * 10000)}`,
                        position,
                        age,
                        skill,
                        potential,
                        currentPotential: potential,
                        personality: personality,
                        nationality: 'Netherlands',
                        clubId,
                        wage: 0,
                        contractExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
                        improvementChance: 0.05,
                        talent: potential,
                        ambition: Math.floor(Math.random() * 5) + 1,
                        contractStart: new Date(),
                        developmentPath: 'youth_academy',
                        academyLevel: academy.level,
                        lastTrainingDate: new Date(),
                        improvementRate: 0.02
                    }
                });
                players.push({
                    id: player.id,
                    name: player.name,
                    age: player.age,
                    position: player.position,
                    skill: player.skill,
                    potential: player.potential,
                    personality: player.personality,
                    nationality: player.nationality,
                    developmentPath: player.developmentPath || 'youth_academy',
                    academyLevel: player.academyLevel || 1,
                    lastTrainingDate: player.lastTrainingDate || new Date(),
                    improvementRate: player.improvementRate || 0.02
                });
            }
            // Update academy current intake
            let currentIntake = [];
            if (Array.isArray(academy.currentIntake)) {
                // If it's an array of YouthPlayer, map to ids
                if (academy.currentIntake.length > 0 && typeof academy.currentIntake[0] === 'object' && 'id' in academy.currentIntake[0]) {
                    currentIntake = academy.currentIntake.map((p) => p.id);
                }
                else {
                    currentIntake = academy.currentIntake;
                }
            }
            else if (typeof academy.currentIntake === 'string') {
                currentIntake = JSON.parse(academy.currentIntake);
            }
            currentIntake.push(...players.map(p => p.id));
            yield prisma.youthAcademy.update({
                where: { id: academy.id },
                data: { currentIntake: JSON.stringify(currentIntake) }
            });
            return players;
        });
    }
    // Assign mentor to youth player
    static assignMentor(playerId, mentorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            const mentor = yield prisma.player.findUnique({ where: { id: mentorId } });
            if (!player || !mentor)
                throw new Error('Player or mentor not found');
            if (player.age >= 21)
                throw new Error('Player is too old for mentoring');
            if (mentor.age < 25)
                throw new Error('Mentor is too young');
            yield prisma.player.update({
                where: { id: playerId },
                data: { mentorId }
            });
        });
    }
    // Process youth development
    static processYouthDevelopment(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const academy = yield this.getYouthAcademy(clubId);
            if (!academy)
                throw new Error('Youth academy not found');
            const youthPlayers = yield prisma.player.findMany({
                where: {
                    clubId,
                    age: { lte: 21 },
                    developmentPath: 'youth_academy'
                }
            });
            const results = {
                improved: 0,
                stagnated: 0,
                declined: 0,
                details: []
            };
            for (const player of youthPlayers) {
                const improvement = this.calculatePlayerImprovement(player, academy);
                if (improvement > 0) {
                    yield prisma.player.update({
                        where: { id: player.id },
                        data: {
                            skill: Math.min(player.skill + improvement, player.potential),
                            lastTrainingDate: new Date()
                        }
                    });
                    results.improved++;
                    results.details.push({
                        playerId: player.id,
                        playerName: player.name,
                        improvement,
                        newSkill: Math.min(player.skill + improvement, player.potential)
                    });
                }
                else if (improvement === 0) {
                    results.stagnated++;
                }
                else {
                    results.declined++;
                }
            }
            return results;
        });
    }
    // Calculate player improvement based on academy level and mentoring
    static calculatePlayerImprovement(player, academy) {
        const baseImprovement = 0.5 + (academy.level * 0.2);
        const mentorBonus = player.mentorId ? 0.3 : 0;
        const personalityBonus = this.getPersonalityBonus(player.personality);
        const agePenalty = player.age > 19 ? (player.age - 19) * 0.1 : 0;
        const totalImprovement = baseImprovement + mentorBonus + personalityBonus - agePenalty;
        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4;
        return Math.max(0, Math.floor(totalImprovement * randomFactor));
    }
    // Get personality bonus for development
    static getPersonalityBonus(personality) {
        switch (personality) {
            case 'MODEL_CITIZEN': return 0.5;
            case 'PROFESSIONAL': return 0.3;
            case 'ABOVE_AVERAGE': return 0.2;
            case 'AVERAGE': return 0.1;
            default: return 0;
        }
    }
    // Create youth tournament
    static createYouthTournament(name, participants, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const tournament = yield prisma.youthTournaments.create({
                data: {
                    name,
                    participants: participants.length,
                    startDate,
                    endDate,
                    region: 'Netherlands',
                    prestige: 50,
                    year: new Date().getFullYear()
                }
            });
            return {
                id: tournament.id,
                name: tournament.name,
                participants: participants,
                startDate: tournament.startDate,
                endDate: tournament.endDate,
                status: 'upcoming',
                results: {}
            };
        });
    }
    // Get youth tournaments for a club
    static getYouthTournaments(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tournaments = yield prisma.youthTournaments.findMany({
                orderBy: { startDate: 'desc' }
            });
            return tournaments.map((t) => ({
                id: t.id,
                name: t.name,
                participants: [clubId], // Simplified - just return the club as participant
                startDate: t.startDate,
                endDate: t.endDate,
                status: 'upcoming',
                results: {}
            }));
        });
    }
    // Create scouting network
    static createScoutingNetwork(clubId, regions) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield prisma.youthScout.findFirst({ where: { clubId } });
            if (existing)
                throw new Error('Scouting network already exists for this club');
            const scouts = [];
            for (const region of regions) {
                const scout = yield prisma.youthScout.create({
                    data: {
                        clubId,
                        name: `Scout ${Math.floor(Math.random() * 1000)}`,
                        region,
                        ability: 50 + Math.floor(Math.random() * 30),
                        network: 30 + Math.floor(Math.random() * 40),
                        discoveries: 0
                    }
                });
                scouts.push({
                    id: scout.id,
                    name: scout.name,
                    region: scout.region,
                    ability: scout.ability,
                    network: scout.network,
                    discoveries: scout.discoveries
                });
            }
            return {
                id: 0,
                clubId,
                scouts,
                regions,
                coverage: regions.length * 20,
                efficiency: scouts.reduce((sum, s) => sum + s.ability, 0) / scouts.length
            };
        });
    }
    // Get scouting network for a club
    static getScoutingNetwork(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const scouts = yield prisma.youthScout.findMany({ where: { clubId } });
            if (scouts.length === 0)
                return null;
            const regions = [...new Set(scouts.map(s => s.region))];
            return {
                id: 0,
                clubId,
                scouts: scouts.map((s) => ({
                    id: s.id,
                    name: s.name,
                    region: s.region,
                    ability: s.ability,
                    network: s.network,
                    discoveries: s.discoveries
                })),
                regions: regions,
                coverage: regions.length * 20,
                efficiency: scouts.reduce((sum, s) => sum + s.ability, 0) / scouts.length
            };
        });
    }
    // Scout for youth players
    static scoutForYouthPlayers(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = yield this.getScoutingNetwork(clubId);
            if (!network)
                throw new Error('No scouting network found');
            const discoveredPlayers = [];
            const scoutCount = network.scouts.length;
            const discoveryChance = network.efficiency / 100;
            for (let i = 0; i < scoutCount; i++) {
                if (Math.random() < discoveryChance) {
                    const scout = network.scouts[i];
                    const player = yield this.generateScoutedPlayer(scout.region, scout.ability);
                    discoveredPlayers.push(player);
                    // Update scout discoveries
                    yield prisma.youthScout.update({
                        where: { id: scout.id },
                        data: { discoveries: scout.discoveries + 1 }
                    });
                }
            }
            return discoveredPlayers;
        });
    }
    // Generate scouted player
    static generateScoutedPlayer(region, scoutAbility) {
        return __awaiter(this, void 0, void 0, function* () {
            const positions = ['GK', 'DEF', 'MID', 'FWD'];
            const position = positions[Math.floor(Math.random() * positions.length)];
            const age = 15 + Math.floor(Math.random() * 3);
            const skill = 25 + Math.floor(Math.random() * 35) + (scoutAbility / 10);
            const potential = skill + Math.floor(Math.random() * 50) + 25;
            const player = yield prisma.player.create({
                data: {
                    name: `Scouted ${Math.floor(Math.random() * 10000)}`,
                    position,
                    age,
                    skill: Math.floor(skill),
                    potential: Math.floor(potential),
                    currentPotential: Math.floor(potential),
                    personality: 'AVERAGE',
                    nationality: 'Netherlands',
                    clubId: null, // Available for signing
                    wage: 0,
                    contractExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
                    improvementChance: 0.03,
                    talent: Math.floor(potential),
                    ambition: Math.floor(Math.random() * 5) + 1,
                    contractStart: new Date(),
                    developmentPath: 'scouted',
                    academyLevel: 0,
                    lastTrainingDate: new Date(),
                    improvementRate: 0.015
                }
            });
            return {
                id: player.id,
                name: player.name,
                age: player.age,
                position: player.position,
                skill: player.skill,
                potential: player.potential,
                personality: player.personality,
                nationality: player.nationality,
                developmentPath: player.developmentPath || 'scouted',
                academyLevel: player.academyLevel || 0,
                lastTrainingDate: player.lastTrainingDate || new Date(),
                improvementRate: player.improvementRate || 0.015
            };
        });
    }
    // Get youth development analytics
    static getYouthDevelopmentAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const academy = yield this.getYouthAcademy(clubId);
            const network = yield this.getScoutingNetwork(clubId);
            const youthPlayers = yield prisma.player.findMany({
                where: {
                    clubId,
                    age: { lte: 21 },
                    OR: [
                        { developmentPath: 'youth_academy' },
                        { developmentPath: 'scouted' }
                    ]
                }
            });
            const analytics = {
                academy: academy ? {
                    level: academy.level,
                    facilities: academy.facilities,
                    coaches: academy.coaches.length,
                    currentIntake: academy.currentIntake.length
                } : null,
                scouting: network ? {
                    scouts: network.scouts.length,
                    regions: network.regions,
                    coverage: network.coverage,
                    efficiency: network.efficiency,
                    totalDiscoveries: network.scouts.reduce((sum, s) => sum + s.discoveries, 0)
                } : null,
                players: {
                    total: youthPlayers.length,
                    byAge: {
                        '15-17': youthPlayers.filter(p => p.age >= 15 && p.age <= 17).length,
                        '18-19': youthPlayers.filter(p => p.age >= 18 && p.age <= 19).length,
                        '20-21': youthPlayers.filter(p => p.age >= 20 && p.age <= 21).length
                    },
                    byPosition: {
                        GK: youthPlayers.filter(p => p.position === 'GK').length,
                        DEF: youthPlayers.filter(p => p.position === 'DEF').length,
                        MID: youthPlayers.filter(p => p.position === 'MID').length,
                        FWD: youthPlayers.filter(p => p.position === 'FWD').length
                    },
                    byPotential: {
                        high: youthPlayers.filter(p => p.potential >= 80).length,
                        medium: youthPlayers.filter(p => p.potential >= 70 && p.potential < 80).length,
                        low: youthPlayers.filter(p => p.potential < 70).length
                    },
                    withMentors: youthPlayers.filter(p => p.mentorId).length
                },
                development: {
                    averageImprovement: youthPlayers.reduce((sum, p) => sum + (p.improvementRate || 0), 0) / youthPlayers.length,
                    readyForPromotion: youthPlayers.filter(p => p.skill >= 70 && p.age >= 18).length,
                    needsAttention: youthPlayers.filter(p => p.skill < 50 && p.age >= 19).length
                }
            };
            return analytics;
        });
    }
    // Promote youth player to first team
    static promoteYouthPlayer(playerId, clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            if (player.age < 16)
                throw new Error('Player too young for promotion');
            if (player.skill < 60)
                throw new Error('Player not ready for promotion');
            yield prisma.player.update({
                where: { id: playerId },
                data: {
                    clubId,
                    developmentPath: 'first_team',
                    wage: 5000 + Math.floor(Math.random() * 10000) // Give them a proper wage
                }
            });
        });
    }
    // Get facilities for academy level
    static getFacilitiesForLevel(level) {
        const baseFacilities = ['training_ground', 'gym', 'medical_center'];
        const additionalFacilities = [
            'analysis_room',
            'recovery_center',
            'sports_science_lab',
            'video_analysis_suite',
            'nutrition_center',
            'psychology_room'
        ];
        return [...baseFacilities, ...additionalFacilities.slice(0, level - 1)];
    }
    // Get coaches for academy level
    static getCoachesForLevel(level) {
        const specializations = ['technical', 'tactical', 'physical', 'mental', 'goalkeeping'];
        const coaches = [];
        for (let i = 0; i < level; i++) {
            coaches.push({
                id: i + 1,
                name: `Coach ${i + 1}`,
                specialization: specializations[i % specializations.length],
                skill: 60 + Math.floor(Math.random() * 30),
                experience: 5 + Math.floor(Math.random() * 15),
                assignedPlayers: []
            });
        }
        return coaches;
    }
    // Format youth academy from database
    static formatYouthAcademy(academy) {
        return {
            id: academy.id,
            clubId: academy.clubId,
            level: academy.level,
            facilities: JSON.parse(academy.facilities),
            coaches: JSON.parse(academy.coaches),
            currentIntake: JSON.parse(academy.currentIntake),
            developmentPrograms: [] // Default empty array since field doesn't exist in schema
        };
    }
}
exports.YouthDevelopmentService = YouthDevelopmentService;
exports.default = YouthDevelopmentService;
