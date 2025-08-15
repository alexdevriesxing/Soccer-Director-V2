interface CreateLeagueInput {
    name: string;
    country: string;
    level: string;
    season: string;
    type?: string;
    isActive?: boolean;
}
interface UpdateLeagueInput {
    name?: string;
    country?: string;
    level?: string;
    season?: string;
    type?: string;
    isActive?: boolean;
}
interface LeagueStanding {
    position: number;
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    status?: string;
}
interface LeagueStandings {
    league: string;
    season: string;
    standings: LeagueStanding[];
}
declare class LeagueService {
    createLeague(data: CreateLeagueInput): Promise<{
        name: string;
        type: import("@prisma/client").$Enums.CompetitionType;
        level: import("@prisma/client").$Enums.LeagueLevel;
        season: string;
        country: string;
        isActive: boolean;
        promotionSpots: number | null;
        relegationSpots: number | null;
        playoffSpots: number | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        parentCompetitionId: number | null;
    }>;
    getLeagueById(id: number): Promise<({
        teams: {
            id: number;
            competitionId: number;
            form: string | null;
            teamId: number;
            position: number;
            played: number;
            won: number;
            drawn: number;
            lost: number;
            goalsFor: number;
            goalsAgainst: number;
            goalDifference: number;
            points: number;
            homeForm: string | null;
            awayForm: string | null;
            promotion: boolean;
            relegation: boolean;
            playoff: boolean;
            notes: string | null;
        }[];
    } & {
        name: string;
        type: import("@prisma/client").$Enums.CompetitionType;
        level: import("@prisma/client").$Enums.LeagueLevel;
        season: string;
        country: string;
        isActive: boolean;
        promotionSpots: number | null;
        relegationSpots: number | null;
        playoffSpots: number | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        parentCompetitionId: number | null;
    }) | null>;
    updateLeague(id: number, data: UpdateLeagueInput): Promise<{
        name: string;
        type: import("@prisma/client").$Enums.CompetitionType;
        level: import("@prisma/client").$Enums.LeagueLevel;
        season: string;
        country: string;
        isActive: boolean;
        promotionSpots: number | null;
        relegationSpots: number | null;
        playoffSpots: number | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        parentCompetitionId: number | null;
    }>;
    deleteLeague(id: number): Promise<{
        name: string;
        type: import("@prisma/client").$Enums.CompetitionType;
        level: import("@prisma/client").$Enums.LeagueLevel;
        season: string;
        country: string;
        isActive: boolean;
        promotionSpots: number | null;
        relegationSpots: number | null;
        playoffSpots: number | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        parentCompetitionId: number | null;
    }>;
    registerClubForLeague(_clubId: number, _leagueId: number, _season: string): Promise<void>;
    generateLeagueFixtures(_leagueId: number, _season: string): Promise<void>;
    processPromotionRelegation(_leagueId: number): Promise<void>;
    getLeagueStatistics(_leagueId: number): Promise<void>;
    getLeagueHistory(_leagueId: number): Promise<void>;
    getLeagueRankings(leagueId: number, season?: string): Promise<LeagueStandings>;
    getCupFixtures(_leagueId: number): Promise<void>;
    getLeagueStructure(): Promise<Record<string, Array<{
        id: number;
        name: string;
        level: string;
        season: string;
        country: string;
        teamCount: number;
    }>>>;
    getCupCompetitions(): Promise<Array<{
        id: number;
        name: string;
        level: string;
        season: string;
        country: string;
        isActive: boolean;
        teamCount: number;
    }>>;
    getLeagueFixtures(leagueId: number, season?: string): Promise<{
        league: string;
        season: string;
        fixtures: Array<{
            id: number;
            matchDay: number;
            homeTeam: {
                id: number;
                name: string;
                score: number | null;
            };
            awayTeam: {
                id: number;
                name: string;
                score: number | null;
            };
        }>;
    }>;
    getLeagueStandings(leagueId: number, season?: string): Promise<LeagueStandings>;
    getClubStatus(position: number, totalTeams: number): string;
    getTransferWindow(_leagueName: string): Promise<{
        isOpen: boolean;
        startDate: Date;
        endDate: Date;
    }>;
    getForeignPlayerLimit(_leagueName: string): Promise<number>;
    getHomegrownRequirement(_leagueName: string): Promise<number>;
    getFinancialFairPlay(_leagueName: string): Promise<boolean>;
}
declare const _default: LeagueService;
export default _default;
