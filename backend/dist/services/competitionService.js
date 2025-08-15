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
exports.competitionService = exports.CompetitionService = exports.LeagueLevel = exports.CompetitionType = void 0;
const client_1 = require("@prisma/client");
// Re-export enums from Prisma client
var client_2 = require("@prisma/client");
Object.defineProperty(exports, "CompetitionType", { enumerable: true, get: function () { return client_2.CompetitionType; } });
Object.defineProperty(exports, "LeagueLevel", { enumerable: true, get: function () { return client_2.LeagueLevel; } });
// Local type for team in competition to avoid conflicts with Prisma's generated types
var CompetitionType;
(function (CompetitionType) {
    CompetitionType["LEAGUE"] = "LEAGUE";
    CompetitionType["CUP"] = "CUP";
    CompetitionType["PLAYOFF"] = "PLAYOFF";
})(CompetitionType || (exports.CompetitionType = CompetitionType = {}));
var LeagueLevel;
(function (LeagueLevel) {
    LeagueLevel["EREDIVISIE"] = "EREDIVISIE";
    LeagueLevel["KKD"] = "KKD";
    LeagueLevel["TWEEDE_DIVISIE"] = "TWEEDE_DIVISIE";
    LeagueLevel["DERDE_DIVISIE"] = "DERDE_DIVISIE";
    LeagueLevel["VIERDE_KLASSE"] = "VIERDE_KLASSE";
    LeagueLevel["VIJFTIGE_KLASSE"] = "VIJFTIGE_KLASSE";
    LeagueLevel["ZONDAG_AMATEURS"] = "ZONDAG_AMATEURS";
    LeagueLevel["ZATERDAG_AMATEURS"] = "ZATERDAG_AMATEURS";
})(LeagueLevel || (exports.LeagueLevel = LeagueLevel = {}));
class CompetitionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getActiveCompetitions(season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const competitions = yield this.prisma.competition.findMany({
                    where: { isActive: true },
                    include: {
                        teams: {
                            where: {
                                competition: {
                                    season
                                },
                            },
                            include: {
                                team: true,
                            },
                            orderBy: [
                                { points: 'desc' },
                                { goalDifference: 'desc' },
                                { goalsFor: 'desc' },
                            ],
                        },
                    },
                });
                return competitions.map((comp) => (Object.assign(Object.assign({}, comp), { teams: comp.teams.map((team) => (Object.assign(Object.assign({}, team), { team: {
                            id: team.team.id,
                            name: team.team.name,
                            shortName: team.team.shortName,
                            logo: team.team.logo,
                        } }))) })));
            }
            catch (error) {
                console.error('Error fetching active competitions:', error);
                throw new Error('Failed to fetch active competitions');
            }
        });
    }
    getLeagueTable(competitionId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all teams in the competition
                const teams = yield this.prisma.teamInCompetition.findMany({
                    where: {
                        competitionId,
                        competition: {
                            season,
                        },
                    },
                    include: {
                        team: true,
                    },
                    orderBy: [
                        { points: 'desc' },
                        { goalDifference: 'desc' },
                        { goalsFor: 'desc' },
                        { goalsAgainst: 'asc' },
                    ],
                });
                return teams.map(team => ({
                    id: team.id,
                    teamId: team.teamId,
                    competitionId: team.competitionId,
                    position: team.position,
                    played: team.played,
                    won: team.won,
                    drawn: team.drawn,
                    lost: team.lost,
                    goalsFor: team.goalsFor,
                    goalsAgainst: team.goalsAgainst,
                    goalDifference: team.goalDifference,
                    points: team.points,
                    form: team.form || null,
                    homeForm: team.homeForm || null,
                    awayForm: team.awayForm || null,
                    promotion: team.promotion,
                    relegation: team.relegation,
                    playoff: team.playoff,
                    notes: team.notes,
                    team: {
                        id: team.team.id,
                        name: team.team.name,
                        shortName: team.team.shortName || null,
                        logo: team.team.logo || null,
                    },
                }));
            }
            catch (error) {
                console.error(`Error getting league table for competition ${competitionId}:`, error);
                throw new Error('Failed to get league table');
            }
        });
    }
    processMatchResults(fixtureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fixture = yield this.prisma.fixture.findUnique({
                where: { id: fixtureId },
                include: {
                    homeClub: true,
                    awayClub: true,
                    league: true,
                    cup: true,
                },
            });
            if (!fixture || fixture.homeGoals === null || fixture.awayGoals === null) {
                throw new Error('Invalid fixture or missing scores');
            }
            const homeScore = fixture.homeGoals;
            const awayScore = fixture.awayGoals;
            const competitionId = fixture.leagueId || fixture.cupId;
            const homeTeamId = fixture.homeClubId;
            const awayTeamId = fixture.awayClubId;
            if (!competitionId) {
                throw new Error('Fixture is not associated with a competition');
            }
            yield this.updateTeamRecord({
                teamId: homeTeamId,
                competitionId,
                goalsFor: homeScore,
                goalsAgainst: awayScore,
                isHome: true,
                season: fixture.season,
            });
            yield this.updateTeamRecord({
                teamId: awayTeamId,
                competitionId,
                goalsFor: awayScore,
                goalsAgainst: homeScore,
                isHome: false,
                season: fixture.season,
            });
        });
    }
    recordMatchResult(matchId, homeScore, awayScore, status) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Find the match with related data
                const match = yield this.prisma.fixture.findUnique({
                    where: { id: matchId },
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                        competition: true,
                        league: true,
                        cup: true,
                    },
                });
                if (!match) {
                    throw new Error('Match not found');
                }
                // Determine competition and season
                const competitionId = match.competitionId || match.leagueId || match.cupId;
                if (!competitionId) {
                    throw new Error('Could not determine competition for match');
                }
                const season = ((_a = match.competition) === null || _a === void 0 ? void 0 : _a.season) || ((_b = match.league) === null || _b === void 0 ? void 0 : _b.season) || ((_c = match.cup) === null || _c === void 0 ? void 0 : _c.season);
                if (!season) {
                    throw new Error('Could not determine season for match');
                }
                // Update the fixture with the result
                yield this.prisma.fixture.update({
                    where: { id: matchId },
                    data: {
                        homeGoals: homeScore,
                        awayGoals: awayScore,
                        status,
                        updatedAt: new Date(),
                    },
                });
                // Update home team record
                yield this.updateTeamRecord(match.homeTeamId, competitionId, true, // isHome
                homeScore, awayScore, season);
                // Update away team record
                yield this.updateTeamRecord(match.awayTeamId, competitionId, false, // isHome
                awayScore, homeScore, season);
                // Update team forms
                yield this.updateTeamForm(match.homeTeamId, competitionId, season);
                yield this.updateTeamForm(match.awayTeamId, competitionId, season);
                // Update league table positions
                yield this.updateLeagueTablePositions(competitionId, season);
            }
            catch (error) {
                console.error('Error updating match result:', error);
                throw new Error(`Failed to update match result: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    updateTeamRecord(teamId, competitionId, isHome, goalsFor, goalsAgainst, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find or create the team's record in this competition
                const teamRecord = yield this.prisma.teamInCompetition.upsert({
                    where: {
                        teamId_competitionId: {
                            teamId,
                            competitionId,
                        },
                    },
                    create: {
                        teamId,
                        competitionId,
                        season,
                        position: 0,
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        goalDifference: 0,
                        points: 0,
                        form: '',
                        homeForm: isHome ? '' : null,
                        awayForm: isHome ? null : '',
                        promotion: false,
                        relegation: false,
                        playoff: false,
                    },
                    update: {},
                });
                // Calculate match outcome
                const isWin = goalsFor > goalsAgainst;
                const isDraw = goalsFor === goalsAgainst;
                const isLoss = goalsFor < goalsAgainst;
                const result = isWin ? 'W' : isDraw ? 'D' : 'L';
                // Prepare update data
                const updateData = {
                    played: { increment: 1 },
                    goalsFor: { increment: goalsFor },
                    goalsAgainst: { increment: goalsAgainst },
                    goalDifference: { increment: goalsFor - goalsAgainst },
                    updatedAt: new Date(),
                };
                // Add win/draw/loss specific updates
                if (isWin) {
                    updateData.won = { increment: 1 };
                    updateData.points = { increment: 3 };
                }
                else if (isDraw) {
                    updateData.drawn = { increment: 1 };
                    updateData.points = { increment: 1 };
                }
                else {
                    updateData.lost = { increment: 1 };
                }
                // Get current form
                const formField = isHome ? 'homeForm' : 'awayForm';
                const currentForm = teamRecord[formField] || '';
                const newForm = (typeof currentForm === 'string' ? currentForm : '').slice(-4) +
                    (isWin ? 'W' : isDraw ? 'D' : 'L');
                // Update the team's record
                yield this.prisma.teamInCompetition.update({
                    where: {
                        teamId_competitionId: {
                            teamId,
                            competitionId,
                        },
                    },
                    data: Object.assign(Object.assign({}, updateData), { [formField]: newForm }),
                });
                // Update the league table positions
                yield this.updateLeagueTablePositions(competitionId);
            }
            catch (error) {
                console.error('Error updating team record:', error);
                throw new Error('Failed to update team record');
            }
        });
    }
    updateTeamRecord(teamId, competitionId, isHome, goalsFor, goalsAgainst, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L';
                const formField = isHome ? 'homeForm' : 'awayForm';
                const isWin = goalsFor > goalsAgainst;
                const isDraw = goalsFor === goalsAgainst;
                const isLoss = goalsFor < goalsAgainst;
                yield this.prisma.teamInCompetition.upsert({
                    where: {
                        teamId_competitionId: {
                            teamId,
                            competitionId,
                        },
                    },
                    create: {
                        teamId,
                        competitionId,
                        position: 0, // Will be updated by updateLeagueTablePositions
                        played: 1,
                        won: isWin ? 1 : 0,
                        drawn: isDraw ? 1 : 0,
                        lost: isLoss ? 1 : 0,
                        goalsFor,
                        goalsAgainst,
                        goalDifference: goalsFor - goalsAgainst,
                        points: isWin ? 3 : isDraw ? 1 : 0,
                        [formField]: result,
                        homeForm: isHome ? result : '',
                        awayForm: isHome ? '' : result,
                        promotion: false,
                        relegation: false,
                        playoff: false,
                    },
                    update: {
                        played: { increment: 1 },
                        won: isWin ? { increment: 1 } : undefined,
                        drawn: isDraw ? { increment: 1 } : undefined,
                        lost: isLoss ? { increment: 1 } : undefined,
                        goalsFor: { increment: goalsFor },
                        goalsAgainst: { increment: goalsAgainst },
                        goalDifference: { increment: goalsFor - goalsAgainst },
                        points: {
                            increment: isWin ? 3 : isDraw ? 1 : 0,
                        },
                        [formField]: {
                            set: (prev => `${prev || ''}${result}`.slice(-5)),
                        },
                    },
                });
                // Update the league table positions
                yield this.updateLeagueTablePositions(competitionId, season);
            }
            catch (error) {
                console.error('Error updating team record:', error);
                throw new Error('Failed to update team record');
            }
        });
    }
    updateLeagueTablePositions(competitionId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all teams in the competition ordered by points, goal difference, and goals for
                const teams = yield this.prisma.teamInCompetition.findMany({
                    where: {
                        competitionId,
                        competition: {
                            season,
                        },
                    },
                    orderBy: [
                        { points: 'desc' },
                        { goalDifference: 'desc' },
                        { goalsFor: 'desc' },
                        { goalsAgainst: 'asc' },
                        { id: 'asc' } // Add a consistent tiebreaker
                    ],
                    include: {
                        team: true,
                    },
                });
                // Update each team's position
                const updates = teams.map((team, index) => this.prisma.teamInCompetition.update({
                    where: {
                        teamId_competitionId: {
                            teamId: team.teamId,
                            competitionId: team.competitionId,
                        },
                    },
                    data: {
                        position: index + 1,
                        // Update promotion/relegation status based on position
                        promotion: index < 2, // Top 2 promote
                        playoff: index >= 2 && index <= 5, // Positions 3-6 go to playoffs
                        relegation: index >= teams.length - 3, // Bottom 3 relegate
                    },
                }));
                yield Promise.all(updates);
            }
            catch (error) {
                console.error('Error updating league table positions:', error);
                throw new Error('Failed to update league table positions');
            }
        });
    }
    updateTeamForm(teamId_1, competitionId_1, season_1) {
        return __awaiter(this, arguments, void 0, function* (teamId, competitionId, season, matches = 5) {
            try {
                // Get the last N matches for this team in the competition
                const recentMatches = yield this.prisma.fixture.findMany({
                    where: {
                        OR: [
                            { homeTeamId: teamId },
                            { awayTeamId: teamId }
                        ],
                        competitionId,
                        season,
                        status: 'FINISHED'
                    },
                    orderBy: { date: 'desc' },
                    take: matches,
                    include: {
                        homeTeam: true,
                        awayTeam: true
                    }
                });
                // Calculate form string (W/W/D/L, etc.)
                const form = recentMatches
                    .map(match => {
                    if (!match.homeScore || !match.awayScore)
                        return ''; // Skip if scores are not available
                    if (match.homeTeamId === teamId) {
                        return match.homeScore > match.awayScore ? 'W' :
                            match.homeScore === match.awayScore ? 'D' : 'L';
                    }
                    else {
                        return match.awayScore > match.homeScore ? 'W' :
                            match.awayScore === match.homeScore ? 'D' : 'L';
                    }
                })
                    .filter(Boolean)
                    .join('');
                // Update the team's form
                yield this.prisma.teamInCompetition.update({
                    where: {
                        teamId_competitionId: {
                            teamId,
                            competitionId,
                        },
                    },
                    data: {
                        form,
                        updatedAt: new Date()
                    },
                });
            }
            catch (error) {
                console.error('Error updating team form:', error);
                throw new Error(`Failed to update team form: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    updateLeagueTablePositions(competitionId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First, get all teams in the competition ordered by their current standings
                const teamStats = yield this.prisma.teamInCompetition.findMany({
                    where: {
                        competitionId,
                        competition: {
                            season
                        }
                    },
                    include: {
                        team: true,
                    },
                    orderBy: [
                        { points: 'desc' },
                        { goalDifference: 'desc' },
                        { goalsFor: 'desc' },
                        { goalsAgainst: 'asc' },
                    ],
                });
                // Update each team's position based on the sorted results
                const updatePromises = teamStats.map((stats, index) => this.prisma.teamInCompetition.update({
                    where: {
                        teamId_competitionId: {
                            teamId: stats.teamId,
                            competitionId: stats.competitionId
                        }
                    },
                    data: {
                        position: index + 1,
                        updatedAt: new Date(),
                    },
                }));
                yield Promise.all(updatePromises);
            }
            catch (error) {
                console.error('Error updating league table positions:', error);
                throw new Error('Failed to update league table positions');
            }
        });
    }
    generateLeagueFixtures(leagueId, season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get teams in this competition
                const teams = yield this.prisma.teamInCompetition.findMany({
                    where: {
                        competitionId: leagueId,
                        competition: {
                            season,
                            type: 'LEAGUE'
                        },
                    },
                    include: {
                        team: true,
                    },
                });
                if (teams.length < 2) {
                    throw new Error('Not enough teams in the competition to generate fixtures');
                }
                // Generate round-robin fixtures (two legs)
                const fixtures = this.generateRoundRobinFixtures(teams.map(t => ({ id: t.team.id, name: t.team.name })), leagueId, season);
                // Save fixtures to database using Prisma schema fields
                yield this.prisma.fixture.createMany({
                    data: fixtures.map((f) => ({
                        competitionId: leagueId,
                        homeTeamId: f.homeTeamId,
                        awayTeamId: f.awayTeamId,
                        matchDay: f.matchDay,
                        matchDate: f.date,
                        isPlayed: false,
                        isPostponed: false,
                    })),
                });
            }
            catch (error) {
                console.error('Error generating league fixtures:', error);
                throw new Error('Failed to generate league fixtures');
            }
        });
    }
    getTeamForm(teamId_1, competitionId_1, season_1) {
        return __awaiter(this, arguments, void 0, function* (teamId, competitionId, season, matchCount = 5) {
            try {
                const matches = yield this.prisma.fixture.findMany({
                    where: {
                        OR: [
                            { homeClubId: teamId },
                            { awayClubId: teamId },
                        ],
                        league: {
                            id: competitionId,
                            season,
                        },
                        played: true,
                    },
                    orderBy: { date: 'desc' },
                    take: matchCount,
                });
                return matches
                    .map((match) => {
                    if (match.homeGoals === null || match.awayGoals === null)
                        return 'D';
                    const isHomeTeam = match.homeClubId === teamId;
                    const teamScore = isHomeTeam ? match.homeGoals : match.awayGoals;
                    const opponentScore = isHomeTeam ? match.awayGoals : match.homeGoals;
                    if (teamScore > opponentScore)
                        return 'W';
                    if (teamScore < opponentScore)
                        return 'L';
                    return 'D';
                })
                    .join('');
            }
            catch (error) {
                console.error('Error getting team form:', error);
                return '';
            }
        });
    }
    processPromotionsAndRelegations(season) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const competitions = yield this.prisma.competition.findMany({
                    where: {
                        isActive: true,
                        season
                    },
                    orderBy: { level: 'asc' },
                });
                // Process each level from top to bottom
                for (let i = 0; i < competitions.length - 1; i++) {
                    const currentCompetition = competitions[i];
                    const nextCompetition = competitions[i + 1];
                    if (!nextCompetition)
                        continue;
                    // Get teams for current and next competitions
                    const currentTeams = yield this.prisma.teamInCompetition.findMany({
                        where: {
                            competitionId: currentCompetition.id,
                            competition: {
                                season
                            }
                        },
                        orderBy: { position: 'asc' },
                    });
                    const nextTeams = yield this.prisma.teamInCompetition.findMany({
                        where: {
                            competitionId: nextCompetition.id,
                            competition: {
                                season
                            }
                        },
                        orderBy: { position: 'asc' },
                    });
                    // Process promotions and relegations
                    const teamsToPromote = currentTeams.filter(t => t.promotion);
                    const teamsToRelegate = nextTeams.filter(t => t.relegation);
                    // Update team competitions for next season
                    for (const team of teamsToPromote) {
                        yield this.prisma.teamInCompetition.update({
                            where: { id: team.id },
                            data: {
                                competitionId: nextCompetition.id,
                                // Reset stats for the new season
                                played: 0,
                                won: 0,
                                drawn: 0,
                                lost: 0,
                                goalsFor: 0,
                                goalsAgainst: 0,
                                goalDifference: 0,
                                points: 0,
                                form: null,
                                homeForm: null,
                                awayForm: null,
                                promotion: false,
                                relegation: false,
                                playoff: false
                            },
                        });
                    }
                    for (const team of teamsToRelegate) {
                        yield this.prisma.teamInCompetition.update({
                            where: { id: team.id },
                            data: {
                                competitionId: currentCompetition.id,
                                // Reset stats for the new season
                                played: 0,
                                won: 0,
                                drawn: 0,
                                lost: 0,
                                goalsFor: 0,
                                goalsAgainst: 0,
                                goalDifference: 0,
                                points: 0,
                                form: null,
                                homeForm: null,
                                awayForm: null,
                                promotion: false,
                                relegation: false,
                                playoff: false
                            },
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error processing promotions and relegations:', error);
                throw new Error('Failed to process promotions and relegations');
            }
        });
    }
    generateRoundRobinFixtures(teams, competitionId, season) {
        const fixtures = [];
        // If odd number of teams, add a BYE team
        const teamList = [...teams];
        if (teamList.length % 2 !== 0) {
            teamList.push({ id: -1, name: 'BYE' });
        }
        const rounds = teamList.length - 1;
        const half = teamList.length / 2;
        // Generate first half of the season
        for (let round = 0; round < rounds; round++) {
            for (let i = 0; i < half; i++) {
                const home = teamList[i];
                const away = teamList[teamList.length - 1 - i];
                // Skip BYE matches
                if (home.id === -1 || away.id === -1)
                    continue;
                fixtures.push({
                    competitionId,
                    homeTeamId: home.id,
                    awayTeamId: away.id,
                    matchDay: round + 1,
                    date: new Date(),
                    isPlayed: false,
                    isPostponed: false,
                    season,
                    homeGoals: null,
                    awayGoals: null,
                    attendance: null,
                    type: 'LEAGUE',
                });
            }
            // Rotate teams for the next round
            if (teamList.length > 1) {
                const lastTeam = teamList.pop();
                if (lastTeam) {
                    teamList.splice(1, 0, lastTeam);
                }
            }
        }
        // Generate second half of the season (reverse fixtures)
        const secondHalfFixtures = fixtures.map((fixture) => (Object.assign(Object.assign({}, fixture), { homeTeamId: fixture.awayTeamId, awayTeamId: fixture.homeTeamId, matchDay: fixture.matchDay + rounds })));
        return [...fixtures, ...secondHalfFixtures];
    }
    getPreviousSeason(season) {
        const [startYear, endYear] = season.split('/').map(Number);
        return `${startYear - 1}/${endYear - 1}`;
    }
    getNextSeason(season) {
        const [startYear, endYear] = season.split('/').map(Number);
        return `${startYear + 1}/${endYear + 1}`;
    }
}
exports.CompetitionService = CompetitionService;
// Initialize with properly typed Prisma client
exports.competitionService = new CompetitionService(new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
}));
