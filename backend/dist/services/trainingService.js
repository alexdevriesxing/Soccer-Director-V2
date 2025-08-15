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
class TrainingService {
    /**
     * Sets the training focus for a player.
     * @param {Object} params - The parameters for setting training focus.
     * @param {number} params.playerId - The ID of the player.
     * @param {number} params.clubId - The ID of the club.
     * @param {string} params.focus - The type of training focus (e.g., 'technical', 'tactical').
     * @param {boolean} params.isExtra - Whether the training is extra.
     * @param {Date} params.startDate - The date when the training focus starts.
     * @returns {Promise<Object>} The created or updated training focus.
     */
    static setTrainingFocus(_a) {
        return __awaiter(this, arguments, void 0, function* ({ playerId, clubId, focus, isExtra, startDate }) {
            try {
                // Find existing active training focus for this player and type
                const now = new Date();
                const existing = yield prisma.trainingFocus.findFirst({
                    where: {
                        playerId,
                        clubId,
                        isExtra,
                        endDate: { gte: now },
                    },
                });
                const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from start
                if (existing) {
                    // If isExtra, throw error for duplicate
                    if (isExtra) {
                        throw new Error('Player already has extra training');
                    }
                    // Update the existing focus for normal training
                    const updated = yield prisma.trainingFocus.update({
                        where: { id: existing.id },
                        data: { focus, startDate, endDate },
                    });
                    return updated;
                }
                else {
                    // Create new focus
                    const created = yield prisma.trainingFocus.create({
                        data: {
                            playerId,
                            clubId,
                            focus,
                            isExtra,
                            startDate,
                            endDate,
                        },
                    });
                    return created;
                }
            }
            catch (error) {
                console.error('Error in setTrainingFocus:', error);
                throw error;
            }
        });
    }
    /**
     * Conducts a training session for all players in a club.
     * @param {number} clubId - The ID of the club.
     * @param {string} sessionType - The type of training session (e.g., 'technical', 'tactical').
     * @returns {Promise<Object>} An object containing session details.
     */
    static conductTrainingSession(clubId, sessionType) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Get all players in the club
                const players = yield prisma.player.findMany({
                    where: {
                        clubId,
                        injured: false,
                        onInternationalDuty: false
                    }
                });
                if (players.length === 0) {
                    throw new Error('No available players for training');
                }
                // Fetch club to check if Jong team
                const club = yield prisma.club.findUnique({ where: { id: clubId } });
                const isJongTeam = (club === null || club === void 0 ? void 0 : club.isJongTeam) || false;
                // Fetch training facility level (default 1 if not found)
                const facility = yield prisma.facility.findFirst({
                    where: { clubId, type: 'training' },
                });
                const facilityLevel = (facility === null || facility === void 0 ? void 0 : facility.level) || 1;
                // --- Staff and finances impact ---
                // Average staff skill (coaches/physios)
                const staff = yield prisma.staff.findMany({ where: { clubId } });
                const coachSkill = staff.filter(s => s.role.toLowerCase().includes('coach')).map(s => s.skill);
                const physioSkill = staff.filter(s => s.role.toLowerCase().includes('physio')).map(s => s.skill);
                const avgCoachSkill = coachSkill.length ? coachSkill.reduce((a, b) => a + b, 0) / coachSkill.length : 50;
                const avgPhysioSkill = physioSkill.length ? physioSkill.reduce((a, b) => a + b, 0) / physioSkill.length : 50;
                // Wage/transfer budget (from ClubFinances)
                const finances = yield prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
                const wageBudget = (_a = finances === null || finances === void 0 ? void 0 : finances.wageBudget) !== null && _a !== void 0 ? _a : 0;
                const transferBudget = (_b = finances === null || finances === void 0 ? void 0 : finances.transferBudget) !== null && _b !== void 0 ? _b : 0;
                // --- Jong team specific multipliers ---
                let coachMultiplier = 0.8 + (avgCoachSkill / 100) * 0.4; // default for normal clubs
                let physioReducer = 1.0 - 0.005 * (avgPhysioSkill - 50); // default for normal clubs
                let budgetMultiplier = 1.0;
                if (wageBudget < 50000)
                    budgetMultiplier = 0.8;
                else if (wageBudget < 100000)
                    budgetMultiplier = 0.9;
                if (isJongTeam) {
                    // Stronger effect for Jong teams
                    coachMultiplier = 0.7 + (avgCoachSkill / 100) * 0.6; // 0.7 to 1.3
                    physioReducer = 1.0 - 0.01 * (avgPhysioSkill - 50); // 0.5 at 100 skill, 1.0 at 50
                    if (wageBudget < 20000)
                        budgetMultiplier = 0.6;
                    else if (wageBudget < 50000)
                        budgetMultiplier = 0.8;
                    else
                        budgetMultiplier = 1.0;
                }
                const results = [];
                for (const player of players) {
                    const result = yield this.trainPlayer(player, sessionType, facilityLevel, avgCoachSkill, avgPhysioSkill, budgetMultiplier, coachMultiplier, physioReducer, isJongTeam);
                    results.push(result);
                }
                return {
                    sessionType,
                    participants: players.length,
                    results
                };
            }
            catch (error) {
                console.error('Error conducting training session:', error);
                throw error;
            }
        });
    }
    /**
     * Trains a single player for a training session.
     * @param {Object} player - The player object.
     * @param {string} sessionType - The type of training session.
     * @returns {Promise<Object>} An object containing training results.
     */
    static trainPlayer(player_1, sessionType_1) {
        return __awaiter(this, arguments, void 0, function* (player, sessionType, facilityLevel = 1, avgCoachSkill = 50, avgPhysioSkill = 50, budgetMultiplier = 1.0, coachMultiplierOverride, physioReducerOverride, isJongTeam) {
            try {
                const baseSkillGain = this.getBaseSkillGain(sessionType);
                const focusBonus = this.getFocusBonus(player, sessionType);
                const ageFactor = this.getAgeFactor(player.age);
                const moraleFactor = this.getMoraleFactor(player.morale || 50);
                const personalityFactor = this.getPersonalityFactor(player.personality);
                // Facility skill gain multiplier
                const facilitySkillMultiplier = 1.0 + 0.1 * (facilityLevel - 1);
                // --- Staff and finances multipliers ---
                let coachMultiplier = 0.8 + (avgCoachSkill / 100) * 0.4;
                if (typeof coachMultiplierOverride === 'number')
                    coachMultiplier = coachMultiplierOverride;
                const totalSkillGain = baseSkillGain * focusBonus * ageFactor * moraleFactor * personalityFactor * facilitySkillMultiplier * coachMultiplier * budgetMultiplier;
                // Injury risk: reduced by physio skill
                let injuryRisk = this.getInjuryRisk(sessionType, player);
                const facilityInjuryReducer = 1.0 - 0.1 * (facilityLevel - 1);
                let physioReducer = 1.0 - 0.005 * (avgPhysioSkill - 50);
                if (typeof physioReducerOverride === 'number')
                    physioReducer = physioReducerOverride;
                injuryRisk = Math.max(0.001, injuryRisk * facilityInjuryReducer * physioReducer);
                const isInjured = Math.random() < injuryRisk;
                // Calculate morale change
                const moraleChange = this.getMoraleChange(sessionType, totalSkillGain, isInjured);
                // Update player stats
                const updatedPlayer = yield prisma.player.update({
                    where: { id: player.id },
                    data: {
                        skill: Math.min(100, Math.max(0, player.skill + totalSkillGain)),
                        morale: Math.min(100, Math.max(0, (player.morale || 50) + moraleChange)),
                        injured: isInjured || player.injured,
                    }
                });
                return {
                    playerId: player.id,
                    playerName: player.name,
                    skillGain: totalSkillGain,
                    moraleChange,
                    isInjured,
                    newSkill: updatedPlayer.skill,
                    newMorale: updatedPlayer.morale,
                };
            }
            catch (error) {
                console.error('Error training player:', error);
                throw error;
            }
        });
    }
    /**
     * Gets the base skill gain multiplier for a training session type.
     * @param {string} sessionType - The type of training session.
     * @returns {number} The base skill gain multiplier.
     */
    static getBaseSkillGain(sessionType) {
        const gains = {
            'technical': 1.5,
            'tactical': 1.2,
            'physical': 1.8,
            'mental': 1.0,
            'general': 1.0
        };
        return gains[sessionType] || 1.0;
    }
    /**
     * Gets the focus bonus multiplier for a player's training session.
     * @param {Object} player - The player object.
     * @param {string} sessionType - The type of training session.
     * @returns {number} The focus bonus multiplier.
     */
    static getFocusBonus(player, sessionType) {
        return 1.0;
    }
    /**
     * Gets the age factor multiplier for a player's skill gain.
     * @param {number} age - The player's age.
     * @returns {number} The age factor multiplier.
     */
    static getAgeFactor(age) {
        if (age <= 18)
            return 1.3; // Young players learn faster
        if (age <= 23)
            return 1.1;
        if (age <= 28)
            return 1.0;
        if (age <= 32)
            return 0.9;
        return 0.7; // Older players learn slower
    }
    /**
     * Gets the morale factor multiplier for a player's skill gain.
     * @param {number} morale - The player's morale.
     * @returns {number} The morale factor multiplier.
     */
    static getMoraleFactor(morale) {
        const normalizedMorale = morale || 50;
        return 0.5 + (normalizedMorale / 100) * 0.5; // 0.5 to 1.0
    }
    /**
     * Gets the fatigue factor multiplier for a player's skill gain.
     * @param {Object} player - The player object.
     * @returns {number} The fatigue factor multiplier.
     */
    static getFatigueFactor(player) {
        // const fatigue = player.fatigue || 0; // Removed as per edit hint
        return 1.0; // Placeholder, as fatigue is removed
    }
    /**
     * Gets the fatigue increase for a training session.
     * @param {string} sessionType - The type of training session.
     * @param {Object} player - The player object.
     * @returns {number} The fatigue increase.
     */
    static getFatigueIncrease(sessionType, player) {
        // const baseFatigue = { // Removed as per edit hint
        //   'technical': 5,
        //   'tactical': 3,
        //   'physical': 8,
        //   'mental': 2,
        //   'general': 4
        // };
        // const currentFatigue = player.fatigue || 0; // Removed as per edit hint
        // const fatigueMultiplier = 1 + (currentFatigue / 100) * 0.5; // More fatigue = more fatigue gain // Removed as per edit hint
        return 0; // Placeholder, as fatigue is removed
    }
    /**
     * Gets the personality factor multiplier for a player's skill gain.
     * @param {string} personality - The player's personality.
     * @returns {number} The personality factor multiplier.
     * LAZY=0.5, BELOW_AVERAGE=0.8, PROFESSIONAL=1.0, DRIVEN=1.2, NATURAL=1.4
     */
    static getPersonalityFactor(personality) {
        switch (personality) {
            case 'LAZY': return 0.5;
            case 'BELOW_AVERAGE': return 0.8;
            case 'PROFESSIONAL': return 1.0;
            case 'DRIVEN': return 1.2;
            case 'NATURAL': return 1.4;
            default: return 1.0;
        }
    }
    /**
     * Gets the injury risk multiplier for a training session.
     * @param {string} sessionType - The type of training session.
     * @param {Object} player - The player object.
     * @returns {number} The injury risk multiplier.
     */
    static getInjuryRisk(sessionType, player) {
        const baseRisk = {
            'technical': 0.01,
            'tactical': 0.005,
            'physical': 0.03,
            'mental': 0.001,
            'general': 0.015
        };
        // const fatigueRisk = (player.fatigue || 0) / 100 * 0.05; // High fatigue increases injury risk // Removed as per edit hint
        const ageRisk = Math.max(0, (player.age - 25) / 10) * 0.01; // Older players more injury prone
        return baseRisk[sessionType] + ageRisk; // Removed fatigueRisk
    }
    /**
     * Gets the morale change for a training session.
     * @param {string} sessionType - The type of training session.
     * @param {number} skillGain - The total skill gain.
     * @param {boolean} isInjured - Whether the player is injured.
     * @returns {number} The morale change.
     */
    static getMoraleChange(sessionType, skillGain, isInjured) {
        let moraleChange = 0;
        // Positive morale from skill gains
        if (skillGain > 0) {
            moraleChange += skillGain * 2;
        }
        // Negative morale from injuries
        if (isInjured) {
            moraleChange -= 15;
        }
        // Session type morale effects
        const sessionMorale = {
            'technical': 1,
            'tactical': 0,
            'physical': -1,
            'mental': 2,
            'general': 0
        };
        moraleChange += sessionMorale[sessionType];
        return Math.round(moraleChange);
    }
    /**
     * Gets the training results for a club.
     * @param {number} clubId - The ID of the club.
     * @returns {Promise<Object>} An object containing recent sessions and player progress.
     */
    static getTrainingResults(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof clubId !== 'number') {
                return {
                    recentSessions: [],
                    playerProgress: [],
                    recommendations: []
                };
            }
            return {
                recentSessions: [],
                playerProgress: [],
                recommendations: []
            };
        });
    }
    /**
     * Generates training recommendations based on player stats.
     * @param {Object[]} players - An array of player objects.
     * @returns {Object[]} An array of recommendations.
     */
    static generateTrainingRecommendations(players) {
        return [];
    }
    /**
     * Gets the training history for a player.
     * @param {number} playerId - The ID of the player.
     * @returns {Promise<Object[]>} An array of training session history.
     */
    static getPlayerTrainingHistory(playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
}
exports.default = TrainingService;
