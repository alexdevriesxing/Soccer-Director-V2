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
exports.MatchSimulationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MatchSimulationService {
    /**
     * Simulate a complete match
     */
    static simulateMatch(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield prisma.fixture.findUnique({
                where: { id: fixtureId },
                include: {
                    homeClub: {
                        include: {
                            players: true,
                            formations: true,
                            strategies: true
                        }
                    },
                    awayClub: {
                        include: {
                            players: true,
                            formations: true,
                            strategies: true
                        }
                    }
                }
            });
            if (!fixture) {
                throw new Error('Fixture not found');
            }
            // --- NEW: Fetch saved StartingXI for both clubs ---
            const [homeStartingXI, awayStartingXI] = yield Promise.all([
                prisma.startingXI.findUnique({
                    where: { clubId: fixture.homeClub.id },
                    include: { slots: true },
                }),
                prisma.startingXI.findUnique({
                    where: { clubId: fixture.awayClub.id },
                    include: { slots: true },
                })
            ]);
            // Helper to get lineup from saved XI or fallback to best XI
            function getLineup(club, startingXI) {
                if (startingXI && startingXI.slots.length === 11) {
                    // Map slot playerIds to player objects, filter out injured/international
                    const idSet = new Set(startingXI.slots.map((s) => s.playerId));
                    const lineup = club.players.filter((p) => idSet.has(p.id) && !p.injured && !p.onInternationalDuty);
                    if (lineup.length === 11)
                        return lineup;
                }
                // Fallback: best available XI
                return club.players
                    .filter((p) => !p.injured && !p.onInternationalDuty)
                    .sort((a, b) => b.skill - a.skill)
                    .slice(0, 11);
            }
            // Use the correct lineups
            const homeLineup = getLineup(fixture.homeClub, homeStartingXI);
            const awayLineup = getLineup(fixture.awayClub, awayStartingXI);
            // Calculate team strengths using the selected lineups
            const homeStrength = this.calculateTeamStrengthFromLineup(homeLineup, fixture.homeClub);
            const awayStrength = this.calculateTeamStrengthFromLineup(awayLineup, fixture.awayClub);
            // Generate match events
            const events = this.generateMatchEventsWithLineups(fixture, homeStrength, awayStrength, homeLineup, awayLineup);
            // Calculate match statistics
            const stats = this.calculateMatchStats(events, homeStrength, awayStrength);
            // Update fixture with result
            yield prisma.fixture.update({
                where: { id: fixtureId },
                data: {
                    played: true,
                    homeGoals: stats.homeGoals,
                    awayGoals: stats.awayGoals
                }
            });
            // Save match events
            for (const event of events) {
                yield prisma.matchEvent.create({
                    data: {
                        fixtureId: event.fixtureId,
                        type: event.type,
                        minute: event.minute,
                        description: event.description,
                        playerName: event.playerName,
                        clubId: event.clubId
                    }
                });
            }
            // Update player statistics and morale
            yield this.updatePlayerStats(fixture, events);
            // Update club form and morale
            yield this.updateClubStats(fixture, stats);
            // --- NEW: Generate post-match analysis ---
            // xG: assign random xG to each shot event, sum for team and per player
            const xgPerPlayer = {};
            let homeXG = 0;
            let awayXG = 0;
            for (const ev of events) {
                if (ev.type === 'goal' || ev.type === 'near_miss' || ev.type === 'penalty_goal' || ev.type === 'penalty_miss') {
                    const xg = Math.random() * 0.7 + 0.1; // xG between 0.1 and 0.8
                    if (ev.playerName && ev.clubId) {
                        const player = [...homeLineup, ...awayLineup].find(p => p.name === ev.playerName);
                        if (player) {
                            xgPerPlayer[player.id] = (xgPerPlayer[player.id] || 0) + xg;
                            if (fixture.homeClub.players.some((p) => p.id === player.id))
                                homeXG += xg;
                            else
                                awayXG += xg;
                        }
                    }
                }
            }
            // Heatmap: random positions for each player (for demo)
            const heatmap = {};
            for (const p of [...homeLineup, ...awayLineup]) {
                heatmap[p.id] = Array.from({ length: 10 }, () => ({ x: Math.random() * 100, y: Math.random() * 100 }));
            }
            // Player ratings: 6.0 base, +1 per goal, +0.5 per assist, -1 per red card
            const playerRatings = {};
            for (const p of [...homeLineup, ...awayLineup]) {
                let rating = 6.0;
                const goals = events.filter(ev => ev.type === 'goal' && ev.playerName === p.name).length;
                const assists = 0; // TODO: add assist logic if available
                const reds = events.filter(ev => ev.type === 'red_card' && ev.playerName === p.name).length;
                rating += goals * 1.0 + assists * 0.5 - reds * 1.0;
                playerRatings[p.id] = Math.max(5.0, Math.min(10.0, rating));
            }
            const analysis = {
                xg: { home: homeXG, away: awayXG, perPlayer: xgPerPlayer },
                heatmap,
                playerRatings
            };
            // Store in fixture.analysis (JSON field)
            yield prisma.fixture.update({
                where: { id: fixtureId },
                data: { analysis: analysis === null ? client_1.Prisma.JsonNull : analysis },
            });
            return stats;
        });
    }
    /**
     * Calculate team strength based on players and formation
     */
    static calculateTeamStrength(club) {
        if (!club.players || club.players.length === 0) {
            return 50; // Default strength for clubs without players
        }
        // Get best 11 players (or all if less than 11)
        const bestPlayers = club.players
            .filter((p) => !p.injured && !p.onInternationalDuty)
            .sort((a, b) => b.skill - a.skill)
            .slice(0, 11);
        if (bestPlayers.length === 0) {
            return 30; // Very weak if no available players
        }
        // Calculate average skill
        const totalSkill = bestPlayers.reduce((sum, p) => sum + p.skill, 0);
        const averageSkill = totalSkill / bestPlayers.length;
        // Apply formation bonus
        let formationBonus = 1.0;
        if (club.formations && club.formations.length > 0) {
            const formation = club.formations[0];
            formationBonus = this.calculateFormationBonus(formation);
        }
        // Apply strategy bonus
        let strategyBonus = 1.0;
        if (club.strategies && club.strategies.length > 0) {
            const strategy = club.strategies[0];
            strategyBonus = this.calculateStrategyBonus(strategy);
        }
        // Apply morale bonus
        const moraleBonus = 1.0 + (club.morale - 50) / 100;
        return Math.round(averageSkill * formationBonus * strategyBonus * moraleBonus);
    }
    // --- NEW: Calculate team strength from a specific lineup ---
    static calculateTeamStrengthFromLineup(lineup, club) {
        if (!lineup || lineup.length === 0) {
            return 50;
        }
        const totalSkill = lineup.reduce((sum, p) => sum + p.skill, 0);
        const averageSkill = totalSkill / lineup.length;
        let formationBonus = 1.0;
        if (club.formations && club.formations.length > 0) {
            const formation = club.formations[0];
            formationBonus = this.calculateFormationBonus(formation);
        }
        let strategyBonus = 1.0;
        if (club.strategies && club.strategies.length > 0) {
            const strategy = club.strategies[0];
            strategyBonus = this.calculateStrategyBonus(strategy);
        }
        const moraleBonus = 1.0 + (club.morale - 50) / 100;
        return Math.round(averageSkill * formationBonus * strategyBonus * moraleBonus);
    }
    /**
     * Calculate formation bonus
     */
    static calculateFormationBonus(formation) {
        let bonus = 1.0;
        // Formation style bonuses
        switch (formation.style) {
            case 'attacking':
                bonus += 0.1;
                break;
            case 'defensive':
                bonus += 0.05;
                break;
            case 'balanced':
                bonus += 0.08;
                break;
        }
        // Intensity bonus
        bonus += (formation.intensity - 50) / 200;
        return bonus;
    }
    /**
     * Calculate strategy bonus
     */
    static calculateStrategyBonus(strategy) {
        let bonus = 1.0;
        switch (strategy.approach) {
            case 'possession':
                bonus += 0.05;
                break;
            case 'counter_attack':
                bonus += 0.08;
                break;
            case 'direct':
                bonus += 0.06;
                break;
            case 'pressing':
                bonus += 0.07;
                break;
        }
        return bonus;
    }
    /**
     * Generate realistic match events
     */
    static generateMatchEvents(fixture, homeStrength, awayStrength) {
        const events = [];
        const homeClub = fixture.homeClub;
        const awayClub = fixture.awayClub;
        // Calculate goal probabilities
        const homeGoalProb = this.calculateGoalProbability(homeStrength, awayStrength, true);
        const awayGoalProb = this.calculateGoalProbability(awayStrength, homeStrength, false);
        // Generate goals
        const homeGoals = this.generateGoals(homeGoalProb, homeClub, 'home');
        const awayGoals = this.generateGoals(awayGoalProb, awayClub, 'away');
        events.push(...homeGoals, ...awayGoals);
        // Generate other events
        const otherEvents = this.generateOtherEvents(fixture, homeStrength, awayStrength);
        events.push(...otherEvents);
        // Sort events by minute
        events.sort((a, b) => a.minute - b.minute);
        return events;
    }
    // --- NEW: Generate match events using the selected lineups ---
    static generateMatchEventsWithLineups(fixture, homeStrength, awayStrength, homeLineup, awayLineup) {
        // Use the same logic as generateMatchEvents, but pass the lineups
        const events = [];
        const homeClub = Object.assign(Object.assign({}, fixture.homeClub), { players: homeLineup });
        const awayClub = Object.assign(Object.assign({}, fixture.awayClub), { players: awayLineup });
        // Calculate goal probabilities
        const homeGoalProb = this.calculateGoalProbability(homeStrength, awayStrength, true);
        const awayGoalProb = this.calculateGoalProbability(awayStrength, homeStrength, false);
        // Generate goals
        const homeGoals = this.generateGoals(homeGoalProb, homeClub, 'home');
        const awayGoals = this.generateGoals(awayGoalProb, awayClub, 'away');
        events.push(...homeGoals, ...awayGoals);
        // Generate other events
        const otherEvents = this.generateOtherEvents(fixture, homeStrength, awayStrength);
        events.push(...otherEvents);
        // Sort events by minute
        events.sort((a, b) => a.minute - b.minute);
        return events;
    }
    /**
     * Calculate goal probability
     */
    static calculateGoalProbability(attackingStrength, defendingStrength, isHome) {
        let baseProb = (attackingStrength - defendingStrength) / 100;
        // Home advantage
        if (isHome) {
            baseProb += 0.1;
        }
        // Ensure probability is reasonable
        return Math.max(0.05, Math.min(0.4, baseProb + 0.15));
    }
    /**
     * Generate goals for a team
     */
    static generateGoals(goalProb, club, team) {
        var _a, _b, _c, _d;
        const events = [];
        const maxGoals = Math.floor(Math.random() * 4); // 0-3 goals per team
        for (let i = 0; i < maxGoals; i++) {
            if (Math.random() < goalProb) {
                const minute = Math.floor(Math.random() * 90) + 1;
                const scorer = this.selectRandomPlayer(club.players, ['FWD', 'MID']);
                if (scorer) {
                    events.push({
                        fixtureId: ((_b = (_a = club.homeFixtures) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) || ((_d = (_c = club.awayFixtures) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id),
                        type: 'goal',
                        minute,
                        description: `GOAL! ${scorer.name} scores for ${club.name}!`,
                        playerName: scorer.name,
                        clubId: club.id
                    });
                }
            }
        }
        return events;
    }
    /**
     * Generate other match events
     */
    static generateOtherEvents(fixture, homeStrength, awayStrength) {
        const events = [];
        const homeClub = fixture.homeClub;
        const awayClub = fixture.awayClub;
        // Yellow cards (2-6 per match)
        const yellowCards = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < yellowCards; i++) {
            const minute = Math.floor(Math.random() * 90) + 1;
            const club = Math.random() < 0.5 ? homeClub : awayClub;
            const player = this.selectRandomPlayer(club.players, ['DEF', 'MID']);
            if (player) {
                events.push({
                    fixtureId: fixture.id,
                    type: 'yellow_card',
                    minute,
                    description: `Yellow card for ${player.name}`,
                    playerName: player.name,
                    clubId: club.id
                });
            }
        }
        // Red cards (0-2 per match)
        const redCards = Math.floor(Math.random() * 3);
        for (let i = 0; i < redCards; i++) {
            const minute = Math.floor(Math.random() * 90) + 1;
            const club = Math.random() < 0.5 ? homeClub : awayClub;
            const player = this.selectRandomPlayer(club.players, ['DEF', 'MID']);
            if (player) {
                events.push({
                    fixtureId: fixture.id,
                    type: 'red_card',
                    minute,
                    description: `Red card for ${player.name}!`,
                    playerName: player.name,
                    clubId: club.id
                });
            }
        }
        // Injuries (0-2 per match)
        const injuries = Math.floor(Math.random() * 3);
        for (let i = 0; i < injuries; i++) {
            const minute = Math.floor(Math.random() * 90) + 1;
            const club = Math.random() < 0.5 ? homeClub : awayClub;
            const player = this.selectRandomPlayer(club.players, ['FWD', 'MID', 'DEF']);
            if (player) {
                events.push({
                    fixtureId: fixture.id,
                    type: 'injury',
                    minute,
                    description: `${player.name} is injured!`,
                    playerName: player.name,
                    clubId: club.id
                });
            }
        }
        return events;
    }
    /**
     * Select a random player by position
     */
    static selectRandomPlayer(players, positions) {
        const availablePlayers = players.filter((p) => positions.includes(p.position) && !p.injured && !p.onInternationalDuty);
        if (availablePlayers.length === 0) {
            return null;
        }
        return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    }
    /**
     * Calculate match statistics from events
     */
    static calculateMatchStats(events, homeStrength, awayStrength) {
        const homeGoals = events.filter(e => { var _a; return e.type === 'goal' && e.clubId === ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        const awayGoals = events.filter(e => { var _a; return e.type === 'goal' && e.clubId !== ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        const homeYellowCards = events.filter(e => { var _a; return e.type === 'yellow_card' && e.clubId === ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        const awayYellowCards = events.filter(e => { var _a; return e.type === 'yellow_card' && e.clubId !== ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        const homeRedCards = events.filter(e => { var _a; return e.type === 'red_card' && e.clubId === ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        const awayRedCards = events.filter(e => { var _a; return e.type === 'red_card' && e.clubId !== ((_a = events[0]) === null || _a === void 0 ? void 0 : _a.clubId); }).length;
        // Calculate possession based on team strength
        const totalStrength = homeStrength + awayStrength;
        const homePossession = Math.round((homeStrength / totalStrength) * 100);
        const awayPossession = 100 - homePossession;
        // Generate realistic shot statistics
        const homeShots = Math.floor(Math.random() * 100) + 5 + Math.floor(homeStrength / 10);
        const awayShots = Math.floor(Math.random() * 100) + 5 + Math.floor(awayStrength / 10);
        const homeShotsOnTarget = Math.floor(homeShots * (0.3 + Math.random() * 0.3));
        const awayShotsOnTarget = Math.floor(awayShots * (0.3 + Math.random() * 0.3));
        return {
            homeGoals,
            awayGoals,
            events,
            homePossession,
            awayPossession,
            homeShots,
            awayShots,
            homeShotsOnTarget,
            awayShotsOnTarget,
            homeCorners: Math.floor(Math.random() * 8) + 2,
            awayCorners: Math.floor(Math.random() * 8) + 2,
            homeFouls: Math.floor(Math.random() * 15) + 8,
            awayFouls: Math.floor(Math.random() * 15) + 8,
            homeYellowCards,
            awayYellowCards,
            homeRedCards,
            awayRedCards
        };
    }
    /**
     * Update player statistics and morale after match
     */
    static updatePlayerStats(fixture, events) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPlayers = [...fixture.homeClub.players, ...fixture.awayClub.players];
            for (const player of allPlayers) {
                let moraleChange = 0;
                // Check if player scored
                const goals = events.filter(e => e.playerName === player.name && e.type === 'goal').length;
                if (goals > 0) {
                    moraleChange += goals * 5;
                }
                // Check if player got carded
                const yellowCards = events.filter(e => e.playerName === player.name && e.type === 'yellow_card').length;
                const redCards = events.filter(e => e.playerName === player.name && e.type === 'red_card').length;
                if (yellowCards > 0) {
                    moraleChange -= yellowCards * 2;
                }
                if (redCards > 0) {
                    moraleChange -= 10;
                }
                // Check if player was injured
                const injuries = events.filter(e => e.playerName === player.name && e.type === 'injury').length;
                if (injuries > 0) {
                    yield prisma.player.update({
                        where: { id: player.id },
                        data: { injured: true }
                    });
                    moraleChange -= 5;
                }
                // Update morale
                if (moraleChange !== 0) {
                    const newMorale = Math.max(0, Math.min(100, player.morale + moraleChange));
                    yield prisma.player.update({
                        where: { id: player.id },
                        data: { morale: newMorale }
                    });
                }
            }
        });
    }
    /**
     * Update club statistics after match
     */
    static updateClubStats(fixture, stats) {
        return __awaiter(this, void 0, void 0, function* () {
            const homeClub = fixture.homeClub;
            const awayClub = fixture.awayClub;
            // Update home club morale
            let homeMoraleChange = 0;
            if (stats.homeGoals > stats.awayGoals) {
                homeMoraleChange = 5; // Win
            }
            else if (stats.homeGoals === stats.awayGoals) {
                homeMoraleChange = 1; // Draw
            }
            else {
                homeMoraleChange = -3; // Loss
            }
            const newHomeMorale = Math.max(0, Math.min(100, homeClub.morale + homeMoraleChange));
            yield prisma.club.update({
                where: { id: homeClub.id },
                data: { morale: newHomeMorale }
            });
            // Update away club morale
            let awayMoraleChange = 0;
            if (stats.awayGoals > stats.homeGoals) {
                awayMoraleChange = 5; // Win
            }
            else if (stats.awayGoals === stats.homeGoals) {
                awayMoraleChange = 1; // Draw
            }
            else {
                awayMoraleChange = -3; // Loss
            }
            const newAwayMorale = Math.max(0, Math.min(100, awayClub.morale + awayMoraleChange));
            yield prisma.club.update({
                where: { id: awayClub.id },
                data: { morale: newAwayMorale }
            });
        });
    }
    // --- NEW: Fetch match analysis for a fixture ---
    static getMatchAnalysis(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield prisma.fixture.findUnique({ where: { id: fixtureId } });
            return fixture && fixture.analysis ? fixture.analysis : null;
        });
    }
}
exports.MatchSimulationService = MatchSimulationService;
