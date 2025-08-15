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
exports.AdvancedTacticsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdvancedTacticsService {
    // Create tactical formation
    static createTacticalFormation(clubId, name, formation, style, intensity, width, tempo) {
        return __awaiter(this, void 0, void 0, function* () {
            const tacticalFormation = yield prisma.clubFormation.create({
                data: {
                    clubId,
                    formation,
                    style,
                    intensity,
                    width,
                    tempo,
                }
            });
            return {
                id: tacticalFormation.id,
                clubId: tacticalFormation.clubId,
                name,
                formation: tacticalFormation.formation,
                style: tacticalFormation.style,
                intensity: tacticalFormation.intensity,
                width: tacticalFormation.width,
                tempo: tacticalFormation.tempo
            };
        });
    }
    // Get tactical formation for a club
    static getTacticalFormation(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const formation = yield prisma.clubFormation.findFirst({ where: { clubId } });
            if (!formation)
                return null;
            return {
                id: formation.id,
                clubId: formation.clubId,
                name: formation.formation,
                formation: formation.formation,
                style: formation.style,
                intensity: formation.intensity,
                width: formation.width,
                tempo: formation.tempo
            };
        });
    }
    // Update tactical formation
    static updateTacticalFormation(formationId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            if (updates.formation)
                data.formation = updates.formation;
            if (updates.style)
                data.style = updates.style;
            if (updates.intensity !== undefined)
                data.intensity = updates.intensity;
            if (updates.width !== undefined)
                data.width = updates.width;
            if (updates.tempo !== undefined)
                data.tempo = updates.tempo;
            const updated = yield prisma.clubFormation.update({
                where: { id: formationId },
                data
            });
            return {
                id: updated.id,
                clubId: updated.clubId,
                name: updated.formation,
                formation: updated.formation,
                style: updated.style,
                intensity: updated.intensity,
                width: updated.width,
                tempo: updated.tempo
            };
        });
    }
    // Assign player to position
    static assignPlayerToPosition(formationId, positionId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // The 'positions' field does not exist in ClubFormation. This feature is not supported in the current schema.
            throw new Error('Assigning players to positions is not supported: ClubFormation.positions does not exist in the schema.');
        });
    }
    // Add player instruction
    static addPlayerInstruction(formationId, positionId, instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            // The 'positions' field does not exist in ClubFormation. This feature is not supported in the current schema.
            throw new Error('Adding player instructions is not supported: ClubFormation.positions does not exist in the schema.');
        });
    }
    // Analyze tactical formation
    static analyzeTacticalFormation(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const formation = yield this.getTacticalFormation(clubId);
            if (!formation)
                throw new Error('No tactical formation found');
            const strengths = this.analyzeStrengths(formation);
            const weaknesses = this.analyzeWeaknesses(formation);
            const recommendations = this.generateRecommendations(formation);
            const familiarity = yield this.calculateTacticalFamiliarity(clubId);
            const chemistry = yield this.calculateSquadChemistry(clubId);
            return {
                formation,
                strengths,
                weaknesses,
                recommendations,
                familiarity,
                chemistry
            };
        });
    }
    // Analyze formation strengths
    static analyzeStrengths(formation) {
        const strengths = [];
        // Analyze formation type
        if (formation.formation.includes('4-3-3')) {
            strengths.push('Strong attacking presence with three forwards');
            strengths.push('Good midfield balance with defensive cover');
        }
        else if (formation.formation.includes('3-5-2')) {
            strengths.push('Solid defensive foundation with three center-backs');
            strengths.push('Wing-backs provide width and attacking options');
        }
        else if (formation.formation.includes('4-4-2')) {
            strengths.push('Balanced formation suitable for various playing styles');
            strengths.push('Good defensive structure with two banks of four');
        }
        // Analyze playing style
        if (formation.style === 'possession') {
            strengths.push('High possession-based approach');
        }
        else if (formation.style === 'counter-attack') {
            strengths.push('Effective counter-attacking strategy');
        }
        else if (formation.style === 'pressing') {
            strengths.push('High-intensity pressing game');
        }
        // Analyze tactical parameters
        if (formation.intensity > 7) {
            strengths.push('High-intensity playing style');
        }
        if (formation.width > 7) {
            strengths.push('Wide attacking play');
        }
        if (formation.tempo > 7) {
            strengths.push('Fast-paced attacking football');
        }
        return strengths;
    }
    // Analyze formation weaknesses
    static analyzeWeaknesses(formation) {
        const weaknesses = [];
        // Analyze formation vulnerabilities
        if (formation.formation.includes('4-3-3')) {
            weaknesses.push('Can be vulnerable to counter-attacks down the wings');
            weaknesses.push('Requires high-quality full-backs');
        }
        else if (formation.formation.includes('3-5-2')) {
            weaknesses.push('Can be outnumbered in midfield against 4-3-3');
            weaknesses.push('Requires excellent wing-backs');
        }
        else if (formation.formation.includes('4-4-2')) {
            weaknesses.push('Can be outnumbered in central midfield');
            weaknesses.push('Limited attacking options compared to 4-3-3');
        }
        // Analyze tactical parameters
        if (formation.intensity > 8) {
            weaknesses.push('High risk of player fatigue');
        }
        if (formation.width > 8) {
            weaknesses.push('Can leave gaps in central areas');
        }
        if (formation.tempo > 8) {
            weaknesses.push('Risk of losing possession due to rushed play');
        }
        return weaknesses;
    }
    // Generate tactical recommendations
    static generateRecommendations(formation) {
        const recommendations = [];
        // Formation-specific recommendations
        if (formation.formation.includes('4-3-3')) {
            recommendations.push('Ensure full-backs are comfortable in attack and defense');
            recommendations.push('Consider using a defensive midfielder for balance');
        }
        else if (formation.formation.includes('3-5-2')) {
            recommendations.push('Wing-backs must have excellent stamina and crossing ability');
            recommendations.push('Central midfielders should be comfortable in possession');
        }
        // Style-specific recommendations
        if (formation.style === 'possession') {
            recommendations.push('Focus on technical players with good passing ability');
            recommendations.push('Implement high pressing to win back possession quickly');
        }
        else if (formation.style === 'counter-attack') {
            recommendations.push('Ensure players have good pace and finishing ability');
            recommendations.push('Practice quick transitions from defense to attack');
        }
        // Parameter-specific recommendations
        if (formation.intensity > 7) {
            recommendations.push('Implement rotation policy to manage player fatigue');
            recommendations.push('Focus on fitness and conditioning');
        }
        if (formation.width > 7) {
            recommendations.push('Ensure central midfielders can cover wide areas');
            recommendations.push('Practice defensive transitions from wide positions');
        }
        return recommendations;
    }
    // Calculate tactical familiarity
    static calculateTacticalFamiliarity(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const familiarity = yield prisma.tacticalFamiliarity.findFirst({ where: { clubId } });
            return familiarity ? familiarity.familiarity : 50; // Default 50%
        });
    }
    // Calculate squad chemistry
    static calculateSquadChemistry(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chemistry = yield prisma.squadChemistry.findFirst({ where: { clubId } });
            return chemistry ? chemistry.score : 50; // Default 50%
        });
    }
    // Prepare for match
    static prepareForMatch(clubId, opponentId, fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const formation = yield this.getTacticalFormation(clubId);
            const opponent = yield prisma.club.findUnique({ where: { id: opponentId } });
            const opponentFormation = yield this.getTacticalFormation(opponentId);
            // Analyze opponent
            const opponentAnalysis = yield this.analyzeOpponent(opponent, opponentFormation);
            // Create tactical plan
            const tacticalPlan = this.createTacticalPlan(formation, opponentAnalysis);
            // Generate player instructions
            const playerInstructions = this.generatePlayerInstructions(formation, opponentAnalysis);
            // Plan set pieces
            const setPieces = this.planSetPieces(clubId);
            // Plan substitutions
            const substitutions = this.planSubstitutions(clubId);
            return {
                opponentAnalysis,
                tacticalPlan,
                playerInstructions,
                setPieces,
                substitutions
            };
        });
    }
    // Analyze opponent
    static analyzeOpponent(opponent, opponentFormation) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId: opponent.id } });
            const recentForm = yield this.getRecentForm(opponent.id);
            return {
                club: opponent,
                formation: opponentFormation,
                keyPlayers: players.filter((p) => p.skill > 75).slice(0, 3),
                strengths: this.analyzeOpponentStrengths(players, opponentFormation),
                weaknesses: this.analyzeOpponentWeaknesses(players, opponentFormation),
                recentForm,
                style: (opponentFormation === null || opponentFormation === void 0 ? void 0 : opponentFormation.style) || 'balanced',
                intensity: (opponentFormation === null || opponentFormation === void 0 ? void 0 : opponentFormation.intensity) || 5
            };
        });
    }
    // Get recent form
    static getRecentForm(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recentFixtures = yield prisma.fixture.findMany({
                where: {
                    OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
                    played: true
                },
                orderBy: { week: 'desc' },
                take: 5
            });
            let wins = 0, draws = 0, losses = 0;
            let goalsFor = 0, goalsAgainst = 0;
            recentFixtures.forEach((f) => {
                const isHome = f.homeClubId === clubId;
                const goalsScored = isHome ? f.homeGoals : f.awayGoals;
                const goalsConceded = isHome ? f.awayGoals : f.homeGoals;
                goalsFor += goalsScored;
                goalsAgainst += goalsConceded;
                if (goalsScored > goalsConceded)
                    wins++;
                else if (goalsScored === goalsConceded)
                    draws++;
                else
                    losses++;
            });
            return { wins, draws, losses, goalsFor, goalsAgainst };
        });
    }
    // Analyze opponent strengths
    static analyzeOpponentStrengths(players, formation) {
        const strengths = [];
        const avgSkill = players.reduce((sum, p) => sum + p.skill, 0) / players.length;
        if (avgSkill > 75)
            strengths.push('High overall squad quality');
        const forwards = players.filter((p) => p.position === 'FWD');
        if (forwards.length >= 3)
            strengths.push('Strong attacking options');
        const midfielders = players.filter((p) => p.position === 'MID');
        if (midfielders.length >= 4)
            strengths.push('Midfield depth and quality');
        if ((formation === null || formation === void 0 ? void 0 : formation.style) === 'possession')
            strengths.push('Strong possession-based game');
        if ((formation === null || formation === void 0 ? void 0 : formation.intensity) > 7)
            strengths.push('High-intensity pressing');
        return strengths;
    }
    // Analyze opponent weaknesses
    static analyzeOpponentWeaknesses(players, formation) {
        const weaknesses = [];
        const defenders = players.filter((p) => p.position === 'DEF');
        if (defenders.length < 4)
            weaknesses.push('Limited defensive options');
        const goalkeepers = players.filter((p) => p.position === 'GK');
        if (goalkeepers.length < 2)
            weaknesses.push('Limited goalkeeper options');
        if ((formation === null || formation === void 0 ? void 0 : formation.width) > 8)
            weaknesses.push('Can be vulnerable through the middle');
        if ((formation === null || formation === void 0 ? void 0 : formation.tempo) > 8)
            weaknesses.push('May lose possession due to rushed play');
        return weaknesses;
    }
    // Create tactical plan
    static createTacticalPlan(formation, opponentAnalysis) {
        const plan = {
            approach: 'balanced',
            focus: 'neutral',
            adjustments: []
        };
        // Determine approach based on opponent analysis
        if (opponentAnalysis.strengths.includes('Strong possession-based game')) {
            plan.approach = 'counter-attack';
            plan.focus = 'defensive';
            plan.adjustments.push('Focus on quick transitions');
        }
        else if (opponentAnalysis.weaknesses.includes('Limited defensive options')) {
            plan.approach = 'attacking';
            plan.focus = 'offensive';
            plan.adjustments.push('Exploit defensive vulnerabilities');
        }
        // Adjust formation if needed
        if (formation.formation.includes('4-3-3') && plan.approach === 'counter-attack') {
            plan.adjustments.push('Consider dropping a forward for extra midfielder');
        }
        return plan;
    }
    // Generate player instructions
    static generatePlayerInstructions(formation, opponentAnalysis) {
        const instructions = {};
        if (!formation)
            return instructions;
        // The 'positions' field does not exist in ClubFormation. This feature is not supported in the current schema.
        // This method will need to be refactored to iterate through a different structure if positions are to be managed here.
        // For now, it will return an empty object as a placeholder.
        return instructions;
    }
    // Plan set pieces
    static planSetPieces(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const players = yield prisma.player.findMany({ where: { clubId } });
            const setPieces = {
                corners: {
                    takers: players.filter((p) => p.skill > 70).slice(0, 2).map((p) => p.id),
                    targets: players.filter((p) => p.position === 'DEF' || p.position === 'FWD').slice(0, 3).map((p) => p.id)
                },
                freeKicks: {
                    takers: players.filter((p) => p.skill > 75).slice(0, 2).map((p) => p.id)
                },
                penalties: {
                    taker: (_a = players.filter((p) => p.skill > 70).sort((a, b) => b.skill - a.skill)[0]) === null || _a === void 0 ? void 0 : _a.id
                }
            };
            return setPieces;
        });
    }
    // Plan substitutions
    static planSubstitutions(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield prisma.player.findMany({ where: { clubId } });
            const substitutions = {
                tactical: players.filter((p) => p.skill > 65 && !p.injured).slice(0, 3).map((p) => p.id),
                fitness: players.filter((p) => p.age > 30).slice(0, 2).map((p) => p.id),
                impact: players.filter((p) => p.skill > 70 && p.position === 'FWD').slice(0, 2).map((p) => p.id)
            };
            return substitutions;
        });
    }
    // Generate positions from formation string
    static generatePositionsFromFormation(formation) {
        const positions = [];
        let positionId = 1;
        // Parse formation (e.g., "4-3-3")
        const parts = formation.split('-').map(Number);
        // Goalkeeper
        positions.push({
            id: positionId++,
            position: 'GK',
            instructions: [],
            role: 'goalkeeper',
            duty: 'defend'
        });
        // Defenders
        for (let i = 0; i < parts[0]; i++) {
            positions.push({
                id: positionId++,
                position: 'DEF',
                instructions: [],
                role: i === 0 || i === parts[0] - 1 ? 'full_back' : 'center_back',
                duty: 'defend'
            });
        }
        // Midfielders
        for (let i = 0; i < parts[1]; i++) {
            positions.push({
                id: positionId++,
                position: 'MID',
                instructions: [],
                role: i === 0 ? 'defensive_midfielder' : i === parts[1] - 1 ? 'attacking_midfielder' : 'central_midfielder',
                duty: 'support'
            });
        }
        // Forwards
        for (let i = 0; i < parts[2]; i++) {
            positions.push({
                id: positionId++,
                position: 'FWD',
                instructions: [],
                role: i === 0 ? 'target_man' : 'poacher',
                duty: 'attack'
            });
        }
        return positions;
    }
}
exports.AdvancedTacticsService = AdvancedTacticsService;
exports.default = AdvancedTacticsService;
