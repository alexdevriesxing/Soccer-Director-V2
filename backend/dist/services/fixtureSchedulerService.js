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
exports.FixtureSchedulerService = void 0;
// @ts-nocheck
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FixtureSchedulerService {
    // Generate complete season schedule for all leagues
    static generateSeasonSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Generating complete season schedule...');
            // Get all leagues
            const leagues = yield prisma.league.findMany({
                include: {
                    clubs: true
                }
            });
            for (const league of leagues) {
                if (league.clubs.length >= 2) {
                    yield this.generateLeagueFixtures(league);
                }
            }
            // Generate cup competitions
            yield this.generateCupFixtures();
            // Generate pre-season friendlies
            yield this.generatePreSeasonFriendlies();
            // Generate mid-season friendlies
            yield this.generateMidSeasonFriendlies();
            console.log('Season schedule generation complete!');
        });
    }
    // Generate league fixtures for a specific league
    static generateLeagueFixtures(league) {
        return __awaiter(this, void 0, void 0, function* () {
            const clubs = league.clubs;
            if (clubs.length < 2)
                return;
            console.log(`Generating fixtures for ${league.name} (${clubs.length} clubs)`);
            // Calculate weeks needed for home and away matches
            const totalMatches = clubs.length * (clubs.length - 1);
            const weeksNeeded = totalMatches / (clubs.length / 2);
            // Start week for league matches (after pre-season)
            const startWeek = 4; // Week 4 starts league season
            const endWeek = startWeek + Math.ceil(weeksNeeded) - 1;
            const fixtures = [];
            let weekCounter = startWeek;
            // Generate home and away fixtures
            for (let round = 0; round < 2; round++) {
                for (let i = 0; i < clubs.length; i++) {
                    for (let j = i + 1; j < clubs.length; j++) {
                        const homeClub = round === 0 ? clubs[i] : clubs[j];
                        const awayClub = round === 0 ? clubs[j] : clubs[i];
                        // Calculate match date (Saturdays for most leagues, Sundays for Zondag leagues)
                        const isZondagLeague = league.name.includes('Zondag');
                        const matchDate = this.calculateMatchDate(weekCounter, isZondagLeague);
                        fixtures.push({
                            homeClubId: homeClub.id,
                            awayClubId: awayClub.id,
                            leagueId: league.id,
                            week: weekCounter,
                            date: matchDate,
                            played: false,
                            type: 'league'
                        });
                        weekCounter++;
                        if (weekCounter > endWeek) {
                            weekCounter = startWeek;
                        }
                    }
                }
            }
            // Create fixtures in database
            yield prisma.fixture.createMany({
                data: fixtures
            });
            console.log(`Created ${fixtures.length} fixtures for ${league.name}`);
        });
    }
    // Generate cup fixtures
    static generateCupFixtures() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Generating cup fixtures...');
            // Create main cup competitions
            const cups = [
                { name: 'KNVB Cup', type: 'national' },
                { name: 'Regional Cup', type: 'regional' }
            ];
            for (const cupData of cups) {
                const cup = yield prisma.cup.create({
                    data: {
                        name: cupData.name
                    }
                });
                // Get clubs for cup (all clubs from all leagues)
                const clubs = yield prisma.club.findMany();
                // Generate cup fixtures (single elimination)
                const fixtures = this.generateCupFixturesForClubs(clubs, cup.id);
                yield prisma.fixture.createMany({
                    data: fixtures
                });
                console.log(`Created ${fixtures.length} fixtures for ${cupData.name}`);
            }
        });
    }
    // Generate cup fixtures for a list of clubs
    static generateCupFixturesForClubs(clubs, cupId) {
        const fixtures = [];
        const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
        // Start cup in week 6 (after league has started)
        let weekCounter = 6;
        const tiesPerWeek = 16; // spread large first rounds across multiple weeks
        let tiesThisWeek = 0;
        // Generate first round
        for (let i = 0; i < shuffledClubs.length; i += 2) {
            if (i + 1 < shuffledClubs.length) {
                const homeClub = shuffledClubs[i];
                const awayClub = shuffledClubs[i + 1];
                fixtures.push({
                    homeClubId: homeClub.id,
                    awayClubId: awayClub.id,
                    cupId: cupId,
                    week: weekCounter,
                    date: this.calculateMatchDate(weekCounter, false), // Cups typically on weekends
                    played: false,
                    type: 'cup'
                });
                tiesThisWeek++;
                if (tiesThisWeek >= tiesPerWeek) {
                    weekCounter++;
                    tiesThisWeek = 0;
                }
            }
        }
        return fixtures;
    }
    // Generate pre-season friendlies
    static generatePreSeasonFriendlies() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Generating pre-season friendlies...');
            const clubs = yield prisma.club.findMany();
            const fixtures = [];
            // Pre-season weeks 1-3
            for (let week = 1; week <= 3; week++) {
                const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
                for (let i = 0; i < shuffledClubs.length; i += 2) {
                    if (i + 1 < shuffledClubs.length) {
                        const homeClub = shuffledClubs[i];
                        const awayClub = shuffledClubs[i + 1];
                        fixtures.push({
                            homeClubId: homeClub.id,
                            awayClubId: awayClub.id,
                            week: week,
                            date: this.calculateMatchDate(week, false),
                            played: false,
                            type: 'friendly'
                        });
                    }
                }
            }
            yield prisma.fixture.createMany({
                data: fixtures
            });
            console.log(`Created ${fixtures.length} pre-season friendlies`);
        });
    }
    // Generate mid-season friendlies (December/January break)
    static generateMidSeasonFriendlies() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Generating mid-season friendlies...');
            const clubs = yield prisma.club.findMany();
            const fixtures = [];
            // Mid-season break weeks (around Christmas/New Year)
            const midSeasonWeeks = [18, 19, 20]; // December/January weeks
            for (const week of midSeasonWeeks) {
                const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
                for (let i = 0; i < shuffledClubs.length; i += 2) {
                    if (i + 1 < shuffledClubs.length) {
                        const homeClub = shuffledClubs[i];
                        const awayClub = shuffledClubs[i + 1];
                        fixtures.push({
                            homeClubId: homeClub.id,
                            awayClubId: awayClub.id,
                            week: week,
                            date: this.calculateMatchDate(week, false),
                            played: false,
                            type: 'friendly'
                        });
                    }
                }
            }
            yield prisma.fixture.createMany({
                data: fixtures
            });
            console.log(`Created ${fixtures.length} mid-season friendlies`);
        });
    }
    // Schedule a custom friendly match
    static scheduleFriendly(homeClubId, awayClubId, week, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield prisma.fixture.create({
                data: {
                    homeClubId,
                    awayClubId,
                    week,
                    date,
                    played: false,
                    type: 'friendly'
                }
            });
            console.log(`Scheduled friendly: ${fixture.id}`);
            return fixture;
        });
    }
    // Cancel a friendly match
    static cancelFriendly(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield prisma.fixture.findUnique({
                where: { id: fixtureId }
            });
            if (!fixture) {
                throw new Error('Fixture not found');
            }
            if (fixture.type !== 'friendly') {
                throw new Error('Can only cancel friendly matches');
            }
            if (fixture.played) {
                throw new Error('Cannot cancel played matches');
            }
            yield prisma.fixture.delete({
                where: { id: fixtureId }
            });
            console.log(`Cancelled friendly: ${fixtureId}`);
            return true;
        });
    }
    // Get available weeks for scheduling friendlies
    static getAvailableWeeksForFriendlies() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWeek = 1; // You might want to get this from game state
            const maxWeek = 38; // Full season
            // Get weeks that have no fixtures for the requesting club
            const occupiedWeeks = yield prisma.fixture.findMany({
                where: {
                    OR: [
                        { homeClubId: 1 }, // Replace with actual club ID
                        { awayClubId: 1 }
                    ]
                },
                select: { week: true }
            });
            const occupiedWeekNumbers = occupiedWeeks.map(f => f.week);
            const availableWeeks = [];
            for (let week = currentWeek; week <= maxWeek; week++) {
                if (!occupiedWeekNumbers.includes(week)) {
                    availableWeeks.push(week);
                }
            }
            return availableWeeks;
        });
    }
    // Get potential opponents for friendlies
    static getPotentialOpponents(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allClubs = yield prisma.club.findMany({
                where: { id: { not: clubId } }
            });
            return allClubs;
        });
    }
    // Calculate match date based on week and day preference
    static calculateMatchDate(week, isZondagLeague = false, seasonStart) {
        const startDate = seasonStart !== null && seasonStart !== void 0 ? seasonStart : (process.env.SEASON_START_DATE ? new Date(process.env.SEASON_START_DATE) : new Date('2025-08-01')); // Season start date
        const daysToAdd = (week - 1) * 7;
        const baseDate = new Date(startDate);
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        // Set to Saturday (6) or Sunday (0) based on league type
        const targetDay = isZondagLeague ? 0 : 6; // Sunday for Zondag, Saturday for others
        const currentDay = baseDate.getDay();
        const daysToTarget = (targetDay - currentDay + 7) % 7;
        baseDate.setDate(baseDate.getDate() + daysToTarget);
        baseDate.setHours(15, 0, 0, 0); // 3 PM kickoff
        return baseDate;
    }
    // Get fixtures for a specific club
    static getClubFixtures(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixtures = yield prisma.fixture.findMany({
                where: {
                    OR: [
                        { homeClubId: clubId },
                        { awayClubId: clubId }
                    ]
                },
                include: {
                    homeClub: true,
                    awayClub: true,
                    league: true,
                    cup: true
                },
                orderBy: {
                    week: 'asc'
                }
            });
            return fixtures;
        });
    }
    // Get next fixture for a club
    static getNextFixture(clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextFixture = yield prisma.fixture.findFirst({
                where: {
                    OR: [
                        { homeClubId: clubId },
                        { awayClubId: clubId }
                    ],
                    played: false
                },
                include: {
                    homeClub: true,
                    awayClub: true,
                    league: true,
                    cup: true
                },
                orderBy: {
                    week: 'asc'
                }
            });
            return nextFixture;
        });
    }
}
exports.FixtureSchedulerService = FixtureSchedulerService;
