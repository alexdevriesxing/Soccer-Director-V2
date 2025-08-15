"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_2.PrismaClient();
class LeagueService {
    async createLeague(data) {
        return prisma.competition.create({
            data: {
                name: data.name,
                country: data.country,
                level: data.level,
                season: data.season,
                type: data.type || client_1.CompetitionType.LEAGUE,
                isActive: data.isActive ?? true,
            },
        });
    }
    async getLeagueById(id) {
        return prisma.competition.findUnique({
            where: { id },
            include: {
                teams: true,
            },
        });
    }
    async updateLeague(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.country !== undefined)
            updateData.country = data.country;
        if (data.level !== undefined)
            updateData.level = data.level;
        if (data.season !== undefined)
            updateData.season = data.season;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        return prisma.competition.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteLeague(id) {
        return prisma.competition.delete({
            where: { id },
        });
    }
    async registerClubForLeague(_clubId, _leagueId, _season) {
        throw new Error('Not implemented');
    }
    async generateLeagueFixtures(_leagueId, _season) {
        throw new Error('Not implemented');
    }
    async processPromotionRelegation(_leagueId) {
        throw new Error('Not implemented');
    }
    async getLeagueStatistics(_leagueId) {
        throw new Error('Not implemented');
    }
    async getLeagueHistory(_leagueId) {
        throw new Error('Not implemented');
    }
    async getLeagueRankings(leagueId, season) {
        return this.getLeagueStandings(leagueId, season);
    }
    async getCupFixtures(_leagueId) {
        throw new Error('Not implemented');
    }
    async getLeagueStructure() {
        try {
            const competitions = await prisma.competition.findMany({
                where: {
                    type: client_1.CompetitionType.LEAGUE,
                    isActive: true
                },
                orderBy: [
                    { level: 'asc' },
                    { name: 'asc' }
                ],
                include: {
                    _count: {
                        select: { teams: true }
                    }
                }
            });
            const result = {};
            competitions.forEach(comp => {
                const level = comp.level || 'OTHER';
                if (!result[level]) {
                    result[level] = [];
                }
                result[level].push({
                    id: comp.id,
                    name: comp.name,
                    level: comp.level,
                    season: comp.season,
                    country: comp.country,
                    teamCount: comp._count?.teams || 0
                });
            });
            return result;
        }
        catch (error) {
            console.error('Error in getLeagueStructure:', error);
            throw new Error('Failed to fetch league structure');
        }
    }
    async getCupCompetitions() {
        try {
            const competitions = await prisma.competition.findMany({
                where: {
                    type: 'CUP',
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                },
                include: {
                    _count: {
                        select: { teams: true }
                    }
                }
            });
            return competitions.map(comp => ({
                id: comp.id,
                name: comp.name,
                level: comp.level,
                season: comp.season,
                country: comp.country,
                isActive: comp.isActive,
                teamCount: comp._count.teams
            }));
        }
        catch (error) {
            console.error('Error in getCupCompetitions:', error);
            throw new Error('Failed to fetch cup competitions');
        }
    }
    async getLeagueFixtures(leagueId, season) {
        try {
            const competition = await prisma.competition.findUnique({
                where: { id: leagueId },
            });
            if (!competition) {
                throw new Error('Competition not found');
            }
            const currentSeason = season || competition.season;
            const fixtures = await prisma.fixture.findMany({
                where: {
                    competitionId: leagueId,
                    homeScore: { not: null },
                    awayScore: { not: null }
                },
                orderBy: [
                    { matchDay: 'asc' },
                    { id: 'asc' }
                ]
            });
            const teamIds = new Set();
            fixtures.forEach(fixture => {
                teamIds.add(fixture.homeTeamId);
                teamIds.add(fixture.awayTeamId);
            });
            const clubRecords = await prisma.club.findMany({
                where: {
                    id: { in: Array.from(teamIds) }
                },
                select: {
                    id: true,
                    name: true
                }
            });
            const teamMap = new Map();
            clubRecords.forEach((club) => {
                if (club?.id && club?.name) {
                    teamMap.set(club.id, club.name);
                }
            });
            return {
                league: competition.name,
                season: currentSeason,
                fixtures: fixtures.map(fixture => ({
                    id: fixture.id,
                    matchDay: fixture.matchDay,
                    homeTeam: {
                        id: fixture.homeTeamId,
                        name: teamMap.get(fixture.homeTeamId) || 'Unknown Team',
                        score: fixture.homeScore
                    },
                    awayTeam: {
                        id: fixture.awayTeamId,
                        name: teamMap.get(fixture.awayTeamId) || 'Unknown Team',
                        score: fixture.awayScore
                    }
                }))
            };
        }
        catch (error) {
            console.error('Error in getLeagueFixtures:', error);
            throw new Error('Failed to fetch league fixtures');
        }
    }
    async getLeagueStandings(leagueId, season) {
        const competition = await prisma.competition.findUnique({
            where: { id: leagueId },
            select: {
                id: true,
                name: true,
                season: true
            }
        });
        if (!competition) {
            throw new Error('Competition not found');
        }
        const competitionWithTeams = await prisma.competition.findUnique({
            where: { id: leagueId },
            include: {
                teams: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        if (!competitionWithTeams) {
            throw new Error('Competition not found');
        }
        if (!competitionWithTeams.teams || competitionWithTeams.teams.length === 0) {
            throw new Error('No teams found for this competition');
        }
        const currentSeason = season || competition.season;
        const fixtures = await prisma.fixture.findMany({
            where: {
                competitionId: leagueId,
                homeScore: { not: null },
                awayScore: { not: null }
            }
        });
        const teamStandings = {};
        if (competitionWithTeams.teams && Array.isArray(competitionWithTeams.teams)) {
            competitionWithTeams.teams.forEach(({ team }) => {
                if (team && team.id) {
                    teamStandings[team.id] = {
                        position: 0,
                        team: team.name || 'Unknown Team',
                        played: 0,
                        won: 0,
                        drawn: 0,
                        lost: 0,
                        goalsFor: 0,
                        goalsAgainst: 0,
                        goalDifference: 0,
                        points: 0
                    };
                }
            });
        }
        fixtures.forEach((fixture) => {
            const homeTeamId = fixture.homeTeamId;
            const awayTeamId = fixture.awayTeamId;
            const homeTeam = teamStandings[homeTeamId];
            const awayTeam = teamStandings[awayTeamId];
            if (!homeTeam || !awayTeam)
                return;
            const homeGoals = fixture.homeScore || 0;
            const awayGoals = fixture.awayScore || 0;
            homeTeam.played++;
            awayTeam.played++;
            homeTeam.goalsFor += homeGoals;
            homeTeam.goalsAgainst += awayGoals;
            awayTeam.goalsFor += awayGoals;
            awayTeam.goalsAgainst += homeGoals;
            homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
            awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
            if (homeGoals > awayGoals) {
                homeTeam.points += 3;
                homeTeam.won++;
                awayTeam.lost++;
            }
            else if (homeGoals < awayGoals) {
                awayTeam.points += 3;
                awayTeam.won++;
                homeTeam.lost++;
            }
            else {
                homeTeam.points += 1;
                awayTeam.points += 1;
                homeTeam.drawn++;
                awayTeam.drawn++;
            }
        });
        const sortedStandings = Object.values(teamStandings).sort((a, b) => {
            if (b.points !== a.points)
                return b.points - a.points;
            if (b.goalDifference !== a.goalDifference)
                return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
        sortedStandings.forEach((team, index) => {
            team.position = index + 1;
        });
        return {
            league: competition.name,
            season: currentSeason,
            standings: sortedStandings
        };
    }
    getClubStatus(position, totalTeams) {
        if (position <= 1)
            return 'champions';
        if (position <= 4)
            return 'champions-league';
        if (position === 5)
            return 'europa-league';
        if (position === 6)
            return 'conference-league';
        if (position >= totalTeams - 2)
            return 'relegation';
        return 'mid-table';
    }
    async getTransferWindow(_leagueName) {
        return {
            isOpen: true,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-31')
        };
    }
    async getForeignPlayerLimit(_leagueName) {
        return 5;
    }
    async getHomegrownRequirement(_leagueName) {
        return 4;
    }
    async getFinancialFairPlay(_leagueName) {
        return true;
    }
}
exports.default = new LeagueService();
//# sourceMappingURL=leagueService.js.map