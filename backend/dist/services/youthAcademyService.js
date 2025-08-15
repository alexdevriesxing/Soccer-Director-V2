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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const volunteerTrainers = [
    { id: 1, name: 'Jan de Vrijwilliger', type: 'volunteer', skill: 30, specialty: 'General', wage: 0 },
    { id: 2, name: 'Piet de Jeugdcoach', type: 'volunteer', skill: 35, specialty: 'Fitness', wage: 0 }
];
const professionalTrainers = [
    { id: 3, name: 'Erik Pro', type: 'professional', skill: 50, specialty: 'General', wage: 500 },
    { id: 4, name: 'Marco Talent', type: 'professional', skill: 60, specialty: 'Tactics', wage: 800 },
    { id: 5, name: 'Sven Elite', type: 'professional', skill: 75, specialty: 'Fitness', wage: 1200 }
];
function getDivisionRank(tier, division) {
    // Lower number = higher division
    if (tier === 'Eredivisie')
        return 1;
    if (tier === 'Eerste Divisie')
        return 2;
    if (tier === 'Tweede Divisie')
        return 3;
    if (tier === 'Derde Divisie')
        return 4;
    if (tier === 'Vierde Divisie')
        return 5;
    return 6; // below Vierde Divisie
}
function getDefaultBudgetForDivision(rank) {
    // Example: higher division = higher budget
    if (rank === 1)
        return 5000;
    if (rank === 2)
        return 3000;
    if (rank === 3)
        return 2000;
    if (rank === 4)
        return 1200;
    if (rank === 5)
        return 800;
    return 200;
}
function getMaxSkillForDivision(rank, budget) {
    // Example: higher division/budget = higher max skill
    if (rank === 1)
        return 80;
    if (rank === 2)
        return 70;
    if (rank === 3)
        return 65;
    if (rank === 4)
        return 60;
    if (rank === 5)
        return 55;
    return 40;
}
class YouthAcademyService {
    // --- YOUTH SCOUTING ---
    scoutYouthPlayers(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            // Get scouts for this club
            const scouts = yield prisma.youthScout.findMany({ where: { clubId } });
            // Generate scouting reports based on scout abilities
            const reports = [];
            for (const scout of scouts) {
                const report = yield this.generateScoutingReport(scout);
                reports.push(report);
            }
            // Combine all prospects from reports
            const allProspects = reports.flatMap(report => report.prospects);
            // Remove duplicates and sort by potential
            const uniqueProspects = allProspects.filter((prospect, index, self) => index === self.findIndex(p => p.name === prospect.name)).sort((a, b) => b.potential - a.potential);
            return {
                scouts,
                reports,
                prospects: uniqueProspects,
                totalProspects: uniqueProspects.length
            };
        });
    }
    generateScoutingReport(scout) {
        return __awaiter(this, void 0, void 0, function* () {
            const prospects = [];
            const numProspects = Math.floor(scout.ability / 10) + 1; // More ability = more prospects
            for (let i = 0; i < numProspects; i++) {
                const prospect = yield this.generateProspect(scout);
                prospects.push(prospect);
            }
            return {
                scoutId: scout.id,
                scoutName: scout.name,
                region: scout.region,
                prospects,
                reliability: scout.ability / 100 // Higher ability = more reliable reports
            };
        });
    }
    generateProspect(scout) {
        return __awaiter(this, void 0, void 0, function* () {
            const names = ['Jan', 'Piet', 'Kees', 'Erik', 'Marco', 'Sven', 'Lars', 'Tom', 'Daan', 'Jens'];
            const surnames = ['de Jong', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos'];
            const positions = ['GK', 'DEF', 'MID', 'FWD'];
            const nationalities = ['Netherlands', 'Germany', 'France', 'England', 'Spain', 'Italy'];
            const personalities = ['LAZY', 'BELOW_AVERAGE', 'PROFESSIONAL', 'DRIVEN', 'NATURAL'];
            const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
            const age = 15 + Math.floor(Math.random() * 4); // 15-18 years old
            const position = positions[Math.floor(Math.random() * positions.length)];
            const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            // Skill based on scout ability and some randomness
            const baseSkill = 35 + Math.floor(scout.ability / 2) + Math.floor(Math.random() * 20);
            const skill = Math.min(baseSkill, 70); // Cap at 70 for scouted prospects
            // Potential based on skill and personality
            let potential = skill + Math.floor(Math.random() * 30);
            if (personality === 'DRIVEN')
                potential += 10;
            if (personality === 'NATURAL')
                potential += 15;
            potential = Math.min(potential, 95); // Cap at 95
            return {
                name,
                age,
                position,
                nationality,
                personality,
                skill,
                potential,
                scoutedBy: scout.name,
                region: scout.region
            };
        });
    }
    // --- YOUTH PROMOTION ---
    promoteYouthPlayer(playerId, targetClubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            // Check if player is eligible for promotion (age <= 21)
            if (player.age > 21) {
                throw new Error('Player is too old for youth promotion');
            }
            // Determine target club
            let newClubId = targetClubId;
            if (!newClubId) {
                // Find parent club if this is a jong team
                const currentClub = yield prisma.club.findUnique({ where: { id: player.clubId } });
                if (currentClub === null || currentClub === void 0 ? void 0 : currentClub.parentClubId) {
                    newClubId = currentClub.parentClubId;
                }
                else {
                    throw new Error('No target club specified for promotion');
                }
            }
            // Update player's club
            const updatedPlayer = yield prisma.player.update({
                where: { id: playerId },
                data: { clubId: newClubId }
            });
            // Create promotion event
            yield prisma.matchEvent.create({
                data: {
                    fixtureId: 1, // Placeholder
                    type: 'promotion',
                    minute: 0,
                    description: `Youth player ${player.name} promoted to first team`,
                    playerName: player.name,
                    clubId: newClubId
                }
            });
            return { success: true, playerId, newClubId, player: updatedPlayer };
        });
    }
    // --- YOUTH RELEASE ---
    releaseYouthPlayer(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            // Check if player is in youth team (age <= 21)
            if (player.age > 21) {
                throw new Error('Player is too old for youth release');
            }
            // Remove player from club
            const updatedPlayer = yield prisma.player.update({
                where: { id: playerId },
                data: { clubId: null }
            });
            // Create release event
            yield prisma.matchEvent.create({
                data: {
                    fixtureId: 1, // Placeholder
                    type: 'release',
                    minute: 0,
                    description: `Youth player ${player.name} released from academy`,
                    playerName: player.name,
                    clubId: player.clubId
                }
            });
            return { success: true, playerId, player: updatedPlayer };
        });
    }
    // --- YOUTH TOURNAMENTS ---
    getYouthTournaments(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            // Get all youth tournaments
            const tournaments = yield prisma.youthTournaments.findMany({
                orderBy: { year: 'desc' }
            });
            // Get club's entries in tournaments
            const entries = yield prisma.youthCompetitionEntry.findMany({
                where: { clubId },
                include: { tournament: true }
            });
            // Get upcoming tournaments (not yet entered)
            const upcoming = tournaments.filter((tournament) => !entries.some((entry) => entry.tournamentId === tournament.id));
            return {
                active: entries.filter((entry) => entry.tournament.year === new Date().getFullYear()),
                upcoming,
                all: tournaments,
                entries
            };
        });
    }
    joinYouthTournament(clubId, tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            const tournament = yield prisma.youthTournaments.findUnique({ where: { id: tournamentId } });
            if (!tournament)
                throw new Error('Tournament not found');
            // Check if already entered
            const existingEntry = yield prisma.youthCompetitionEntry.findFirst({
                where: { clubId, tournamentId }
            });
            if (existingEntry) {
                throw new Error('Club already entered this tournament');
            }
            // Create entry
            const entry = yield prisma.youthCompetitionEntry.create({
                data: {
                    clubId,
                    tournamentId,
                    year: tournament.year
                }
            });
            return { success: true, entry };
        });
    }
    // --- YOUTH INTAKE ---
    triggerYouthIntake(clubId_1) {
        return __awaiter(this, arguments, void 0, function* (clubId, type = 'manual') {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            const year = new Date().getFullYear();
            // Check if intake already happened this year
            const existingIntake = yield prisma.youthIntakeEvent.findFirst({
                where: { clubId, year }
            });
            if (existingIntake) {
                throw new Error('Youth intake already occurred this year');
            }
            // Create intake event
            const event = yield prisma.youthIntakeEvent.create({
                data: { clubId, year, type }
            });
            // Generate new youth players
            const newPlayers = yield this.generateYouthPlayers(clubId, 5); // Generate 5 players per intake
            return { event, newPlayers };
        });
    }
    generateYouthPlayers(clubId, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = [];
            for (let i = 0; i < count; i++) {
                const player = yield this.generateProspect({
                    name: 'Youth Scout',
                    ability: 50,
                    region: 'Local'
                });
                const newPlayer = yield prisma.player.create({
                    data: {
                        name: player.name,
                        clubId,
                        position: player.position,
                        age: player.age,
                        skill: player.skill,
                        talent: player.potential,
                        personality: player.personality, // Cast to enum
                        nationality: player.nationality,
                        wage: 0,
                        contractExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
                        potential: player.potential,
                        currentPotential: player.skill,
                        contractStart: new Date()
                    }
                });
                players.push(newPlayer);
            }
            return players;
        });
    }
    // --- YOUTH DEVELOPMENT ---
    getYouthDevelopmentPlans(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({
                where: { clubId, age: { lte: 21 } }
            });
            const plans = players.map((player) => ({
                player,
                plan: player.youthPlayerDevelopmentPlan
            }));
            return plans;
        });
    }
    setYouthDevelopmentPlan(playerId, focus, mentorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield prisma.player.findUnique({ where: { id: playerId } });
            if (!player)
                throw new Error('Player not found');
            if (player.age > 21) {
                throw new Error('Player is too old for youth development plan');
            }
            // Create or update development plan
            const plan = yield prisma.youthPlayerDevelopmentPlan.upsert({
                where: { id: playerId }, // Use id as unique identifier
                update: { focus, mentorId },
                create: { playerId, focus, mentorId }
            });
            return plan;
        });
    }
    // --- YOUTH ACADEMY ANALYTICS ---
    getYouthAcademyAnalytics(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const youthPlayers = yield prisma.player.findMany({
                where: { clubId, age: { lte: 21 } }
            });
            const analytics = {
                totalYouthPlayers: youthPlayers.length,
                averageAge: youthPlayers.reduce((sum, p) => sum + p.age, 0) / youthPlayers.length,
                averageSkill: youthPlayers.reduce((sum, p) => sum + p.skill, 0) / youthPlayers.length,
                averagePotential: youthPlayers.reduce((sum, p) => sum + p.potential, 0) / youthPlayers.length,
                positionDistribution: {
                    GK: youthPlayers.filter((p) => p.position === 'GK').length,
                    DEF: youthPlayers.filter((p) => p.position === 'DEF').length,
                    MID: youthPlayers.filter((p) => p.position === 'MID').length,
                    FWD: youthPlayers.filter((p) => p.position === 'FWD').length
                },
                personalityDistribution: youthPlayers.reduce((acc, p) => {
                    acc[p.personality] = (acc[p.personality] || 0) + 1;
                    return acc;
                }, {}),
                highPotentialPlayers: youthPlayers.filter((p) => p.potential >= 80).length,
                readyForPromotion: youthPlayers.filter((p) => p.skill >= 65 && p.age >= 18).length
            };
            return analytics;
        });
    }
    // --- AUTOMATION ---
    automateYouthAcademy(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId } });
            if (!club)
                throw new Error('Club not found');
            const results = {
                intakeTriggered: false,
                playersPromoted: 0,
                playersReleased: 0,
                developmentPlansUpdated: 0
            };
            // Check if youth intake should be triggered
            const year = new Date().getFullYear();
            const existingIntake = yield prisma.youthIntakeEvent.findFirst({
                where: { clubId, year }
            });
            if (!existingIntake) {
                yield this.triggerYouthIntake(clubId, 'auto');
                results.intakeTriggered = true;
            }
            // Auto-promote eligible players
            const eligibleForPromotion = yield prisma.player.findMany({
                where: {
                    clubId,
                    age: { gte: 18, lte: 21 },
                    skill: { gte: 65 }
                }
            });
            for (const player of eligibleForPromotion) {
                try {
                    yield this.promoteYouthPlayer(player.id);
                    results.playersPromoted++;
                }
                catch (error) {
                    // Skip if promotion fails
                }
            }
            // Auto-release underperforming players
            const underperforming = yield prisma.player.findMany({
                where: {
                    clubId,
                    age: { gte: 19, lte: 21 },
                    skill: { lte: 45 }
                }
            });
            for (const player of underperforming) {
                try {
                    yield this.releaseYouthPlayer(player.id);
                    results.playersReleased++;
                }
                catch (error) {
                    // Skip if release fails
                }
            }
            // Update development plans
            const youthPlayers = yield prisma.player.findMany({
                where: { clubId, age: { lte: 21 } }
            });
            for (const player of youthPlayers) {
                let focus = 'balanced';
                if (player.skill < 50)
                    focus = 'fundamentals';
                else if (player.skill >= 50 && player.potential >= 80)
                    focus = 'advanced';
                else if (player.personality === 'LAZY')
                    focus = 'discipline';
                yield this.setYouthDevelopmentPlan(player.id, focus);
                results.developmentPlansUpdated++;
            }
            return results;
        });
    }
    getAvailableTrainers(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const club = yield prisma.club.findUnique({ where: { id: clubId }, include: { league: true } });
            if (!club || !club.league)
                throw new Error('Club or league not found');
            const rank = getDivisionRank(club.league.tier, club.league.division || '');
            const budget = getDefaultBudgetForDivision(rank);
            if (rank > 5) {
                // Only volunteers
                return volunteerTrainers;
            }
            else {
                // Professionals filtered by max skill for division/budget
                const maxSkill = getMaxSkillForDivision(rank, budget);
                return [
                    ...volunteerTrainers,
                    ...professionalTrainers.filter(t => t.skill <= maxSkill && t.wage <= budget)
                ];
            }
        });
    }
}
exports.default = new YouthAcademyService();
