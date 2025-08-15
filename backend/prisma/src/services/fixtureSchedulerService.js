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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixtureSchedulerService = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var FixtureSchedulerService = /** @class */ (function () {
    function FixtureSchedulerService() {
    }
    // Generate complete season schedule for all leagues
    FixtureSchedulerService.generateSeasonSchedule = function () {
        return __awaiter(this, void 0, void 0, function () {
            var leagues, _i, leagues_1, league;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Generating complete season schedule...');
                        return [4 /*yield*/, prisma.league.findMany({
                                include: {
                                    clubs: true
                                }
                            })];
                    case 1:
                        leagues = _a.sent();
                        _i = 0, leagues_1 = leagues;
                        _a.label = 2;
                    case 2:
                        if (!(_i < leagues_1.length)) return [3 /*break*/, 5];
                        league = leagues_1[_i];
                        if (!(league.clubs.length >= 2)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateLeagueFixtures(league)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Generate cup competitions
                    return [4 /*yield*/, this.generateCupFixtures()];
                    case 6:
                        // Generate cup competitions
                        _a.sent();
                        // Generate pre-season friendlies
                        return [4 /*yield*/, this.generatePreSeasonFriendlies()];
                    case 7:
                        // Generate pre-season friendlies
                        _a.sent();
                        // Generate mid-season friendlies
                        return [4 /*yield*/, this.generateMidSeasonFriendlies()];
                    case 8:
                        // Generate mid-season friendlies
                        _a.sent();
                        console.log('Season schedule generation complete!');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Generate league fixtures for a specific league
    FixtureSchedulerService.generateLeagueFixtures = function (league) {
        return __awaiter(this, void 0, void 0, function () {
            var clubs, totalMatches, weeksNeeded, startWeek, endWeek, fixtures, weekCounter, round, i, j, homeClub, awayClub, isZondagLeague, matchDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clubs = league.clubs;
                        if (clubs.length < 2)
                            return [2 /*return*/];
                        console.log("Generating fixtures for ".concat(league.name, " (").concat(clubs.length, " clubs)"));
                        totalMatches = clubs.length * (clubs.length - 1);
                        weeksNeeded = totalMatches / (clubs.length / 2);
                        startWeek = 4;
                        endWeek = startWeek + Math.ceil(weeksNeeded) - 1;
                        fixtures = [];
                        weekCounter = startWeek;
                        // Generate home and away fixtures
                        for (round = 0; round < 2; round++) {
                            for (i = 0; i < clubs.length; i++) {
                                for (j = i + 1; j < clubs.length; j++) {
                                    homeClub = round === 0 ? clubs[i] : clubs[j];
                                    awayClub = round === 0 ? clubs[j] : clubs[i];
                                    isZondagLeague = league.name.includes('Zondag');
                                    matchDate = this.calculateMatchDate(weekCounter, isZondagLeague);
                                    fixtures.push({
                                        homeClubId: homeClub.id,
                                        awayClubId: awayClub.id,
                                        leagueId: league.id,
                                        week: weekCounter,
                                        date: matchDate,
                                        played: false
                                    });
                                    weekCounter++;
                                    if (weekCounter > endWeek) {
                                        weekCounter = startWeek;
                                    }
                                }
                            }
                        }
                        // Create fixtures in database
                        return [4 /*yield*/, prisma.fixture.createMany({
                                data: fixtures
                            })];
                    case 1:
                        // Create fixtures in database
                        _a.sent();
                        console.log("Created ".concat(fixtures.length, " fixtures for ").concat(league.name));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Generate cup fixtures
    FixtureSchedulerService.generateCupFixtures = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cups, _i, cups_1, cupData, cup, clubs, fixtures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Generating cup fixtures...');
                        cups = [
                            { name: 'KNVB Cup', type: 'national' },
                            { name: 'Regional Cup', type: 'regional' }
                        ];
                        _i = 0, cups_1 = cups;
                        _a.label = 1;
                    case 1:
                        if (!(_i < cups_1.length)) return [3 /*break*/, 6];
                        cupData = cups_1[_i];
                        return [4 /*yield*/, prisma.cup.create({
                                data: {
                                    name: cupData.name
                                }
                            })];
                    case 2:
                        cup = _a.sent();
                        return [4 /*yield*/, prisma.club.findMany()];
                    case 3:
                        clubs = _a.sent();
                        fixtures = this.generateCupFixturesForClubs(clubs, cup.id);
                        return [4 /*yield*/, prisma.fixture.createMany({
                                data: fixtures
                            })];
                    case 4:
                        _a.sent();
                        console.log("Created ".concat(fixtures.length, " fixtures for ").concat(cupData.name));
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Generate cup fixtures for a list of clubs
    FixtureSchedulerService.generateCupFixturesForClubs = function (clubs, cupId) {
        var fixtures = [];
        var shuffledClubs = __spreadArray([], clubs, true).sort(function () { return Math.random() - 0.5; });
        // Start cup in week 6 (after league has started)
        var weekCounter = 6;
        // Generate first round
        for (var i = 0; i < shuffledClubs.length; i += 2) {
            if (i + 1 < shuffledClubs.length) {
                var homeClub = shuffledClubs[i];
                var awayClub = shuffledClubs[i + 1];
                fixtures.push({
                    homeClubId: homeClub.id,
                    awayClubId: awayClub.id,
                    cupId: cupId,
                    week: weekCounter,
                    date: this.calculateMatchDate(weekCounter, false), // Cups typically on weekends
                    played: false
                });
            }
        }
        return fixtures;
    };
    // Generate pre-season friendlies
    FixtureSchedulerService.generatePreSeasonFriendlies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clubs, fixtures, week, shuffledClubs, i, homeClub, awayClub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Generating pre-season friendlies...');
                        return [4 /*yield*/, prisma.club.findMany()];
                    case 1:
                        clubs = _a.sent();
                        fixtures = [];
                        // Pre-season weeks 1-3
                        for (week = 1; week <= 3; week++) {
                            shuffledClubs = __spreadArray([], clubs, true).sort(function () { return Math.random() - 0.5; });
                            for (i = 0; i < shuffledClubs.length; i += 2) {
                                if (i + 1 < shuffledClubs.length) {
                                    homeClub = shuffledClubs[i];
                                    awayClub = shuffledClubs[i + 1];
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
                        return [4 /*yield*/, prisma.fixture.createMany({
                                data: fixtures
                            })];
                    case 2:
                        _a.sent();
                        console.log("Created ".concat(fixtures.length, " pre-season friendlies"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Generate mid-season friendlies (December/January break)
    FixtureSchedulerService.generateMidSeasonFriendlies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clubs, fixtures, midSeasonWeeks, _i, midSeasonWeeks_1, week, shuffledClubs, i, homeClub, awayClub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Generating mid-season friendlies...');
                        return [4 /*yield*/, prisma.club.findMany()];
                    case 1:
                        clubs = _a.sent();
                        fixtures = [];
                        midSeasonWeeks = [18, 19, 20];
                        for (_i = 0, midSeasonWeeks_1 = midSeasonWeeks; _i < midSeasonWeeks_1.length; _i++) {
                            week = midSeasonWeeks_1[_i];
                            shuffledClubs = __spreadArray([], clubs, true).sort(function () { return Math.random() - 0.5; });
                            for (i = 0; i < shuffledClubs.length; i += 2) {
                                if (i + 1 < shuffledClubs.length) {
                                    homeClub = shuffledClubs[i];
                                    awayClub = shuffledClubs[i + 1];
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
                        return [4 /*yield*/, prisma.fixture.createMany({
                                data: fixtures
                            })];
                    case 2:
                        _a.sent();
                        console.log("Created ".concat(fixtures.length, " mid-season friendlies"));
                        return [2 /*return*/];
                }
            });
        });
    };
    // Schedule a custom friendly match
    FixtureSchedulerService.scheduleFriendly = function (homeClubId, awayClubId, week, date) {
        return __awaiter(this, void 0, void 0, function () {
            var fixture;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.fixture.create({
                            data: {
                                homeClubId: homeClubId,
                                awayClubId: awayClubId,
                                week: week,
                                date: date,
                                played: false,
                                type: 'friendly'
                            }
                        })];
                    case 1:
                        fixture = _a.sent();
                        console.log("Scheduled friendly: ".concat(fixture.id));
                        return [2 /*return*/, fixture];
                }
            });
        });
    };
    // Cancel a friendly match
    FixtureSchedulerService.cancelFriendly = function (fixtureId) {
        return __awaiter(this, void 0, void 0, function () {
            var fixture;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.fixture.findUnique({
                            where: { id: fixtureId }
                        })];
                    case 1:
                        fixture = _a.sent();
                        if (!fixture) {
                            throw new Error('Fixture not found');
                        }
                        if (fixture.type !== 'friendly') {
                            throw new Error('Can only cancel friendly matches');
                        }
                        if (fixture.played) {
                            throw new Error('Cannot cancel played matches');
                        }
                        return [4 /*yield*/, prisma.fixture.delete({
                                where: { id: fixtureId }
                            })];
                    case 2:
                        _a.sent();
                        console.log("Cancelled friendly: ".concat(fixtureId));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // Get available weeks for scheduling friendlies
    FixtureSchedulerService.getAvailableWeeksForFriendlies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentWeek, maxWeek, occupiedWeeks, occupiedWeekNumbers, availableWeeks, week;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentWeek = 1;
                        maxWeek = 38;
                        return [4 /*yield*/, prisma.fixture.findMany({
                                where: {
                                    OR: [
                                        { homeClubId: 1 }, // Replace with actual club ID
                                        { awayClubId: 1 }
                                    ]
                                },
                                select: { week: true }
                            })];
                    case 1:
                        occupiedWeeks = _a.sent();
                        occupiedWeekNumbers = occupiedWeeks.map(function (f) { return f.week; });
                        availableWeeks = [];
                        for (week = currentWeek; week <= maxWeek; week++) {
                            if (!occupiedWeekNumbers.includes(week)) {
                                availableWeeks.push(week);
                            }
                        }
                        return [2 /*return*/, availableWeeks];
                }
            });
        });
    };
    // Get potential opponents for friendlies
    FixtureSchedulerService.getPotentialOpponents = function (clubId) {
        return __awaiter(this, void 0, void 0, function () {
            var allClubs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.club.findMany({
                            where: { id: { not: clubId } }
                        })];
                    case 1:
                        allClubs = _a.sent();
                        return [2 /*return*/, allClubs];
                }
            });
        });
    };
    // Calculate match date based on week and day preference
    FixtureSchedulerService.calculateMatchDate = function (week, isZondagLeague) {
        if (isZondagLeague === void 0) { isZondagLeague = false; }
        var startDate = new Date('2024-08-01'); // Season start date
        var daysToAdd = (week - 1) * 7;
        var baseDate = new Date(startDate);
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        // Set to Saturday (6) or Sunday (0) based on league type
        var targetDay = isZondagLeague ? 0 : 6; // Sunday for Zondag, Saturday for others
        var currentDay = baseDate.getDay();
        var daysToTarget = (targetDay - currentDay + 7) % 7;
        baseDate.setDate(baseDate.getDate() + daysToTarget);
        baseDate.setHours(15, 0, 0, 0); // 3 PM kickoff
        return baseDate;
    };
    // Get fixtures for a specific club
    FixtureSchedulerService.getClubFixtures = function (clubId) {
        return __awaiter(this, void 0, void 0, function () {
            var fixtures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.fixture.findMany({
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
                        })];
                    case 1:
                        fixtures = _a.sent();
                        return [2 /*return*/, fixtures];
                }
            });
        });
    };
    // Get next fixture for a club
    FixtureSchedulerService.getNextFixture = function (clubId) {
        return __awaiter(this, void 0, void 0, function () {
            var nextFixture;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.fixture.findFirst({
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
                        })];
                    case 1:
                        nextFixture = _a.sent();
                        return [2 /*return*/, nextFixture];
                }
            });
        });
    };
    return FixtureSchedulerService;
}());
exports.FixtureSchedulerService = FixtureSchedulerService;
