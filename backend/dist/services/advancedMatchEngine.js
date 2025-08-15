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
exports.AdvancedMatchEngine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdvancedMatchEngine {
    // Simulate a complete match with advanced features
    static simulateAdvancedMatch(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield prisma.fixture.findUnique({
                where: { id: fixtureId },
                include: {
                    homeClub: {
                        include: {
                            players: { where: { injured: false } },
                            formations: true,
                            strategies: true
                        }
                    },
                    awayClub: {
                        include: {
                            players: { where: { injured: false } },
                            formations: true,
                            strategies: true
                        }
                    },
                    league: true,
                    weather: true,
                    pitchConditions: true
                }
            });
            if (!fixture)
                throw new Error('Fixture not found');
            if (fixture.played)
                throw new Error('Fixture already played');
            // Generate weather and pitch conditions if not present
            if (!fixture.weather) {
                yield this.generateWeatherConditions(fixtureId);
            }
            if (!fixture.pitchConditions) {
                yield this.generatePitchConditions(fixtureId);
            }
            // Get updated fixture with weather/pitch
            const updatedFixture = yield prisma.fixture.findUnique({
                where: { id: fixtureId },
                include: {
                    homeClub: { include: { players: { where: { injured: false } } } },
                    awayClub: { include: { players: { where: { injured: false } } } },
                    weather: true,
                    pitchConditions: true
                }
            });
            // Calculate team strengths with advanced factors
            const homeStrength = yield this.calculateAdvancedTeamStrength(updatedFixture.homeClub, 'home');
            const awayStrength = yield this.calculateAdvancedTeamStrength(updatedFixture.awayClub, 'away');
            // Apply weather and pitch effects
            const weatherEffects = this.calculateWeatherEffects(updatedFixture.weather);
            const pitchEffects = this.calculatePitchEffects(updatedFixture.pitchConditions);
            // Simulate match events
            const events = yield this.simulateMatchEvents(updatedFixture.homeClub, updatedFixture.awayClub, homeStrength, awayStrength, weatherEffects, pitchEffects);
            // Calculate final score
            const homeGoals = events.filter(e => e.type === 'goal' && e.teamId === updatedFixture.homeClubId).length;
            const awayGoals = events.filter(e => e.type === 'goal' && e.teamId === updatedFixture.awayClubId).length;
            // Generate player statistics
            const homeStats = yield this.generatePlayerStats(updatedFixture.homeClub.players, events, updatedFixture.homeClubId);
            const awayStats = yield this.generatePlayerStats(updatedFixture.awayClub.players, events, updatedFixture.awayClubId);
            // Update fixture with result
            yield prisma.fixture.update({
                where: { id: fixtureId },
                data: {
                    homeGoals,
                    awayGoals,
                    played: true,
                    attendance: this.calculateAttendance(updatedFixture.homeClub, homeGoals, awayGoals)
                }
            });
            // Store match events
            for (const event of events) {
                yield prisma.liveMatchEvent.create({
                    data: {
                        fixtureId,
                        minute: event.minute,
                        type: event.type.toUpperCase(),
                        description: event.description,
                        playerId: event.playerId,
                        clubId: event.teamId
                    }
                });
            }
            // Update player fatigue and injuries
            yield this.updatePlayerFatigueAndInjuries(homeStats, awayStats, events);
            return {
                fixture: updatedFixture,
                events,
                homeStats,
                awayStats,
                weatherEffects,
                pitchEffects,
                finalScore: { home: homeGoals, away: awayGoals }
            };
        });
    }
    // Calculate advanced team strength with multiple factors
    static calculateAdvancedTeamStrength(club, venue) {
        return __awaiter(this, void 0, void 0, function* () {
            const players = club.players;
            if (players.length === 0)
                return 50;
            // Base strength from player skills
            let baseStrength = players.reduce((sum, p) => sum + p.skill, 0) / players.length;
            // Home advantage
            const homeAdvantage = venue === 'home' ? 1.1 : 0.95;
            // Morale factor
            const avgMorale = players.reduce((sum, p) => sum + (p.morale || 50), 0) / players.length;
            const moraleFactor = 0.8 + (avgMorale / 100) * 0.4; // 0.8 to 1.2
            // Form factor (simplified)
            const formFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
            // Tactical familiarity (if available)
            const tacticalFamiliarity = yield prisma.tacticalFamiliarity.findFirst({
                where: { clubId: club.id }
            });
            const tacticalFactor = tacticalFamiliarity ? 0.9 + (tacticalFamiliarity.familiarity / 100) * 0.2 : 1.0;
            // Squad chemistry
            const chemistry = yield prisma.squadChemistry.findFirst({
                where: { clubId: club.id }
            });
            const chemistryFactor = chemistry ? 0.9 + (chemistry.score / 100) * 0.2 : 1.0;
            return Math.round(baseStrength * homeAdvantage * moraleFactor * formFactor * tacticalFactor * chemistryFactor);
        });
    }
    // Generate weather conditions
    static generateWeatherConditions(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const weatherTypes = ['sunny', 'cloudy', 'rainy', 'windy', 'stormy'];
            const selectedWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            yield prisma.weather.create({
                data: {
                    fixtureId,
                    temperature: 15 + Math.random() * 20, // 15-35°C
                    humidity: 30 + Math.random() * 50, // 30-80%
                    windSpeed: selectedWeather === 'windy' ? 20 + Math.random() * 30 : Math.random() * 15,
                    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
                    precipitation: selectedWeather === 'rainy' ? 5 + Math.random() * 15 : Math.random() * 2,
                    visibility: 80 + Math.random() * 20 // 80-100%
                }
            });
        });
    }
    // Generate pitch conditions
    static generatePitchConditions(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.pitchConditions.create({
                data: {
                    fixtureId,
                    quality: 70 + Math.random() * 30, // 70-100%
                    moisture: 20 + Math.random() * 60, // 20-80%
                    hardness: 30 + Math.random() * 50, // 30-80%
                    grassLength: 20 + Math.random() * 40, // 20-60mm
                    markings: ['Good', 'Faded', 'Poor'][Math.floor(Math.random() * 3)]
                }
            });
        });
    }
    // Calculate weather effects on gameplay
    static calculateWeatherEffects(weather) {
        const effects = {
            passingAccuracy: 0,
            shootingAccuracy: 0,
            playerFatigue: 0,
            visibility: 0
        };
        if (weather.precipitation > 10) {
            effects.passingAccuracy -= 10;
            effects.shootingAccuracy -= 15;
        }
        if (weather.windSpeed > 20) {
            effects.passingAccuracy -= 15;
            effects.shootingAccuracy -= 20;
        }
        if (weather.temperature > 30) {
            effects.playerFatigue += 20;
        }
        if (weather.visibility < 90) {
            effects.visibility -= 10;
        }
        return effects;
    }
    // Calculate pitch effects on gameplay
    static calculatePitchEffects(pitch) {
        const effects = {
            passingAccuracy: 0,
            ballControl: 0,
            injuryRisk: 0
        };
        if (pitch.quality < 80) {
            effects.passingAccuracy -= 10;
            effects.ballControl -= 15;
        }
        if (pitch.moisture > 60) {
            effects.passingAccuracy -= 5;
            effects.ballControl -= 10;
        }
        if (pitch.hardness > 70) {
            effects.injuryRisk += 15;
        }
        return effects;
    }
    // Simulate match events with realistic probabilities
    static simulateMatchEvents(homeClub, awayClub, homeStrength, awayStrength, weatherEffects, pitchEffects) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = [];
            const homePlayers = homeClub.players;
            const awayPlayers = awayClub.players;
            // Simulate 90 minutes + injury time
            const totalMinutes = 90 + Math.floor(Math.random() * 5);
            let homeGoals = 0;
            let awayGoals = 0;
            for (let minute = 1; minute <= totalMinutes; minute++) {
                // Calculate possession and attacking opportunities
                const homePossession = homeStrength / (homeStrength + awayStrength);
                const awayPossession = 1 - homePossession;
                // Home team attacking
                if (Math.random() < homePossession * 0.3) {
                    const event = yield this.simulateAttackingMove(homePlayers, homeClub.id, 'home', minute, homeStrength, weatherEffects, pitchEffects);
                    if (event) {
                        events.push(event);
                        if (event.type === 'goal')
                            homeGoals++;
                    }
                }
                // Away team attacking
                if (Math.random() < awayPossession * 0.3) {
                    const event = yield this.simulateAttackingMove(awayPlayers, awayClub.id, 'away', minute, awayStrength, weatherEffects, pitchEffects);
                    if (event) {
                        events.push(event);
                        if (event.type === 'goal')
                            awayGoals++;
                    }
                }
                // VAR reviews (rare)
                if (Math.random() < 0.02) {
                    events.push(yield this.simulateVARReview(minute, homeClub.id, awayClub.id));
                }
                // Weather effects
                if (Math.random() < 0.05) {
                    events.push(yield this.simulateWeatherEffect(minute, weatherEffects));
                }
            }
            return events;
        });
    }
    // Simulate an attacking move
    static simulateAttackingMove(players, teamId, venue, minute, teamStrength, weatherEffects, pitchEffects) {
        return __awaiter(this, void 0, void 0, function* () {
            const attacker = this.getRandomPlayer(players, ['FWD', 'MID']);
            const defender = this.getRandomPlayer(players, ['DEF', 'MID']);
            // Calculate shot probability
            const baseShotProb = 0.1;
            const strengthBonus = (teamStrength - 50) / 100;
            const weatherPenalty = weatherEffects.shootingAccuracy / 100;
            const pitchPenalty = pitchEffects.ballControl / 100;
            const shotProb = baseShotProb + strengthBonus - weatherPenalty - pitchPenalty;
            if (Math.random() < shotProb) {
                // Shot taken
                const shotEvent = {
                    minute,
                    type: 'shot',
                    playerId: attacker.id,
                    teamId,
                    description: `${attacker.name} takes a shot`,
                    xG: this.calculateXG(attacker, defender, venue),
                    position: { x: 85, y: 30 + Math.random() * 40 }
                };
                // Goal probability based on xG
                if (Math.random() < shotEvent.xG) {
                    const goalEvent = {
                        minute,
                        type: 'goal',
                        playerId: attacker.id,
                        teamId,
                        description: `${attacker.name} scores!`,
                        xG: shotEvent.xG,
                        position: { x: 90, y: 35 + Math.random() * 30 }
                    };
                    return goalEvent;
                }
            }
            return null;
        });
    }
    // Calculate expected goals (xG)
    static calculateXG(attacker, defender, venue) {
        let xG = 0.1; // Base xG
        // Attacker skill factor
        xG += (attacker.skill - 50) / 100;
        // Defender skill factor
        xG -= (defender.skill - 50) / 200;
        // Venue factor
        xG += venue === 'home' ? 0.05 : -0.05;
        // Random variation
        xG += (Math.random() - 0.5) * 0.2;
        return Math.max(0, Math.min(1, xG));
    }
    // Simulate VAR review
    static simulateVARReview(minute, homeClubId, awayClubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const decisions = ['Goal', 'Penalty', 'RedCard', 'Offside'];
            const decision = decisions[Math.floor(Math.random() * decisions.length)];
            const overturned = Math.random() < 0.3;
            return {
                minute,
                type: 'var_review',
                teamId: Math.random() < 0.5 ? homeClubId : awayClubId,
                description: `VAR review: ${decision} ${overturned ? 'overturned' : 'upheld'}`,
                details: { decision, overturned, controversy: Math.random() }
            };
        });
    }
    // Simulate weather effect
    static simulateWeatherEffect(minute, weatherEffects) {
        return __awaiter(this, void 0, void 0, function* () {
            const effects = ['Heavy rain affecting visibility', 'Strong winds affecting passing', 'High temperature causing fatigue'];
            const effect = effects[Math.floor(Math.random() * effects.length)];
            return {
                minute,
                type: 'weather_effect',
                teamId: 0, // Affects both teams
                description: effect,
                details: weatherEffects
            };
        });
    }
    // Generate detailed player statistics
    static generatePlayerStats(players, events, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = [];
            for (const player of players) {
                const playerEvents = events.filter(e => e.playerId === player.id);
                const playerStats = {
                    playerId: player.id,
                    minutes: Math.floor(70 + Math.random() * 25), // 70-95 minutes
                    goals: playerEvents.filter(e => e.type === 'goal').length,
                    assists: Math.floor(Math.random() * 3),
                    shots: playerEvents.filter(e => e.type === 'shot').length,
                    shotsOnTarget: Math.floor(playerEvents.filter(e => e.type === 'shot').length * 0.6),
                    passes: Math.floor(20 + Math.random() * 40),
                    passAccuracy: 70 + Math.random() * 25,
                    tackles: Math.floor(Math.random() * 8),
                    tacklesWon: Math.floor(Math.random() * 6),
                    interceptions: Math.floor(Math.random() * 5),
                    clearances: Math.floor(Math.random() * 4),
                    fouls: Math.floor(Math.random() * 3),
                    yellowCards: Math.random() < 0.1 ? 1 : 0,
                    redCards: Math.random() < 0.02 ? 1 : 0,
                    rating: this.calculatePlayerRating(player, playerEvents),
                    fatigue: Math.floor(20 + Math.random() * 40),
                    xG: playerEvents.reduce((sum, e) => sum + (e.xG || 0), 0)
                };
                stats.push(playerStats);
            }
            return stats;
        });
    }
    // Calculate player rating based on performance
    static calculatePlayerRating(player, events) {
        let rating = 6.0; // Base rating
        // Goals
        rating += events.filter(e => e.type === 'goal').length * 1.0;
        // Shots on target
        const shots = events.filter(e => e.type === 'shot').length;
        rating += shots * 0.1;
        // Clean sheet for defenders/goalkeepers
        if (['DEF', 'GK'].includes(player.position)) {
            rating += 0.5;
        }
        // Random variation
        rating += (Math.random() - 0.5) * 0.5;
        return Math.max(1, Math.min(10, rating));
    }
    // Update player fatigue and injuries
    static updatePlayerFatigueAndInjuries(homeStats, awayStats, events) {
        return __awaiter(this, void 0, void 0, function* () {
            const allStats = [...homeStats, ...awayStats];
            for (const stats of allStats) {
                // Update fatigue
                yield prisma.player.update({
                    where: { id: stats.playerId },
                    data: {
                    // Increase fatigue based on minutes played and intensity
                    }
                });
                // Check for injuries
                if (Math.random() < 0.02) { // 2% injury chance per match
                    yield this.createPlayerInjury(stats.playerId, 'match_injury');
                }
            }
        });
    }
    // Create player injury
    static createPlayerInjury(playerId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const injuryTypes = ['muscle', 'ligament', 'fracture', 'concussion'];
            const severity = ['minor', 'major', 'career'];
            const injury = {
                playerId,
                type: injuryTypes[Math.floor(Math.random() * injuryTypes.length)],
                severity: severity[Math.floor(Math.random() * severity.length)],
                startDate: new Date(),
                endDate: new Date(Date.now() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000), // 1-4 weeks
                description: `Injury sustained during match`
            };
            yield prisma.playerInjury.create({ data: injury });
            // Mark player as injured
            yield prisma.player.update({
                where: { id: playerId },
                data: { injured: true }
            });
        });
    }
    // Calculate attendance based on club and match importance
    static calculateAttendance(club, homeGoals, awayGoals) {
        const baseAttendance = 15000 + Math.random() * 10000; // 15k-25k base
        const goalFactor = (homeGoals + awayGoals) * 500; // More goals = more attendance
        const clubFactor = club.reputation || 50; // Club reputation factor
        return Math.floor(baseAttendance + goalFactor + clubFactor * 100);
    }
    // Get random player by position
    static getRandomPlayer(players, positions) {
        const filtered = players.filter(p => positions.includes(p.position));
        if (filtered.length === 0)
            return players[Math.floor(Math.random() * players.length)];
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
}
exports.AdvancedMatchEngine = AdvancedMatchEngine;
exports.default = AdvancedMatchEngine;
