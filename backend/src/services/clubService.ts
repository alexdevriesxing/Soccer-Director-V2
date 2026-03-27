import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Define the league type from Prisma
interface LeagueData {
  id: number;
  name: string;
  level: string;
  country: string;
  tier: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the club with league type using Prisma types
type ClubWithLeague = Prisma.ClubGetPayload<{
  include: {
    league: true;
  };
}> & {
  morale: number;
  form: string;
  boardExpectation: string;
  league: LeagueData | null;
};

class ClubService {
  async createClub(data: Prisma.ClubCreateInput) {
    return prisma.club.create({ data });
  }

  async getClubById(id: number) {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) throw new Error('Club not found');
    return club;
  }

  async updateClub(id: number, data: Prisma.ClubUpdateInput) {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) throw new Error('Club not found');
    return prisma.club.update({ where: { id }, data });
  }

  async deleteClub(id: number) {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) throw new Error('Club not found');
    return prisma.club.delete({ where: { id } });
  }

  // Get academy/club reputation
  static async getAcademyReputation(clubId: number) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club not found');
    return club.reputation ?? 50;
  }

  // Update club reputation (increment or decrement)
  static async updateAcademyReputation(clubId: number, change: number) {
    const club = await prisma.club.update({
      where: { id: clubId },
      data: { reputation: { increment: change } }
    });
    return club.reputation ?? 50;
  }

  // --- SQUAD MANAGEMENT ---
  async getSquad(clubId: number, page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [players, totalPlayers] = await prisma.$transaction([
      prisma.player.findMany({
        where: { currentClubId: clubId },
        orderBy: { value: 'desc' },
        skip,
        take: limit
      }),
      prisma.player.count({ where: { currentClubId: clubId } })
    ]);

    const squadStats = {
      totalPlayers,
      available: players.filter((p: any) => !p.isInjured && !p.isSuspended).length,
      injured: players.filter((p: any) => p.isInjured).length,
      suspended: players.filter((p: any) => p.isSuspended).length,
      onLoan: 0, // Would need separate query
      positions: {
        GK: players.filter((p: any) => p.position === 'GK').length,
        DEF: players.filter((p: any) => p.position === 'DEF').length,
        MID: players.filter((p: any) => p.position === 'MID').length,
        FWD: players.filter((p: any) => p.position === 'FWD').length
      }
    };

    return { players, squadStats, totalPlayers, currentPage: page, totalPages: Math.ceil(totalPlayers / limit) };
  }

  async getSquadAnalytics(clubId: number) {
    const players = await prisma.player.findMany({ where: { currentClubId: clubId } });

    const analytics = {
      averageAge: players.reduce((sum: number, p: any) => sum + (p.age ?? 0), 0) / (players.length || 1),
      averageSkill: players.reduce((sum: number, p: any) => sum + (p.currentAbility ?? 0), 0) / (players.length || 1),
      averageMorale: players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0) / (players.length || 1),
      totalWages: players.reduce((sum: number, p: any) => sum + (p.weeklyWage ?? 0), 0),
      positionDistribution: {
        GK: players.filter((p: any) => p.position === 'GK').length,
        DEF: players.filter((p: any) => p.position === 'DEF').length,
        MID: players.filter((p: any) => p.position === 'MID').length,
        FWD: players.filter((p: any) => p.position === 'FWD').length
      },
      nationalityDistribution: players.reduce((acc: Record<string, number>, p: any) => {
        acc[p.nationality] = (acc[p.nationality] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      contractStatus: {
        expiringSoon: players.filter((p: any) => {
          if (!p.contractEnd) return false;
          const daysUntilExpiry = Math.ceil((new Date(p.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
        recentlySigned: players.filter((p: any) => {
          if (!p.contractStart) return false;
          const daysSinceSigned = Math.ceil((Date.now() - new Date(p.contractStart).getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceSigned <= 30;
        }).length
      }
    };

    return analytics;
  }

  // --- FINANCES ---
  async getClubFinances(clubId: number) {
    const finances = await prisma.clubFinances.findMany({
      where: { clubId },
      orderBy: { season: 'desc' },
      take: 12
    });

    // Note: Sponsorship model exists but we'll return finance data directly
    return { finances, sponsorships: [], totalSponsorshipValue: 0 };
  }

  async getFinancialAnalytics(clubId: number) {
    const finances = await prisma.clubFinances.findMany({
      where: { clubId },
      orderBy: { season: 'desc' },
      take: 52 // Last year
    });

    if (finances.length === 0) return null;

    const latest = finances[0];
    const previous = finances[1];

    const analytics = {
      currentBalance: latest.currentBalance,
      balanceChange: previous ? latest.currentBalance - previous.currentBalance : 0,
      weeklyIncome: latest.matchdayIncome + latest.sponsorship + latest.prizeMoney,
      weeklyExpenses: latest.playerWages + latest.staffWages + latest.facilityCosts,
      transferBudget: latest.transferBudget,
      wageBudget: 0, // Not currently tracked
      debtRatio: 0, // Not tracked in current schema
      marketValue: 0 // Not currently tracked
    };

    return analytics;
  }

  // --- FACILITIES ---
  async getClubFacilities(clubId: number) {
    const facility = await prisma.clubFacility.findUnique({ where: { clubId } });
    if (!facility) return [];

    // Convert single facility record to array of facility types for frontend
    const facilities = [
      { id: 1, name: 'Stadium', type: 'stadium', level: facility.stadiumLevel, clubId },
      { id: 2, name: 'Training Ground', type: 'training', level: facility.trainingGround, clubId },
      { id: 3, name: 'Youth Academy', type: 'academy', level: facility.youthAcademy, clubId },
      { id: 4, name: 'Youth Facilities', type: 'youth', level: facility.youthFacilities, clubId },
      { id: 5, name: 'Scouting Network', type: 'scouting', level: facility.scoutingNetwork, clubId },
    ].map(f => ({
      ...f,
      maintenanceCost: f.level * 50000,
      upgradeCost: f.level * 1000000,
      effects: `Level ${f.level} efficiency`
    }));

    return facilities;
  }

  async upgradeFacility(clubId: number, facilityType: string) {
    const facility = await prisma.clubFacility.findUnique({ where: { clubId } });
    if (!facility) throw new Error('Facility not found');

    // Map facility type to field
    const fieldMap: Record<string, keyof typeof facility> = {
      'stadium': 'stadiumLevel',
      'training': 'trainingGround',
      'academy': 'youthAcademy',
      'youth': 'youthFacilities',
      'scouting': 'scoutingNetwork'
    };

    const field = fieldMap[facilityType];
    if (!field) throw new Error('Invalid facility type');

    const currentLevel = facility[field] as number;
    const upgradeCost = currentLevel * 1000000;

    // Check if club can afford the upgrade
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
    if (!finances || finances.currentBalance < upgradeCost) throw new Error('Insufficient funds for facility upgrade');

    // Upgrade the facility
    const updatedFacility = await prisma.clubFacility.update({
      where: { clubId },
      data: { [field]: { increment: 1 } }
    });

    // Deduct funds
    await prisma.clubFinances.update({
      where: { id: finances.id },
      data: { currentBalance: { decrement: upgradeCost } }
    });

    return { ...updatedFacility, upgradedField: field, newLevel: currentLevel + 1 };
  }

  // --- STAFF MANAGEMENT ---
  async getClubStaff(clubId: number) {
    const staff = await prisma.staff.findMany({
      where: { clubId }
    });

    const staffAnalytics = {
      totalStaff: staff.length,
      byRole: staff.reduce((acc: Record<string, number>, s: any) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageSkill: staff.reduce((sum: number, s: any) => sum + (s.ability ?? 0), 0) / (staff.length || 1),
      totalWages: staff.reduce((sum: number, s: any) => sum + (s.weeklyWage ?? 0), 0)
    };

    return { staff, analytics: staffAnalytics };
  }

  async hireStaff(clubId: number, staffData: any) {
    const { firstName, lastName, role, ability, wage, nationality, dateOfBirth } = staffData;

    // Check wage budget (using transferBudget as proxy)
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { season: 'desc' } });
    if (!finances || finances.transferBudget < wage) throw new Error('Insufficient wage budget');

    const staff = await prisma.staff.create({
      data: {
        firstName: firstName || 'New',
        lastName: lastName || 'Staff',
        role,
        ability: ability ?? 50,
        clubId,
        nationality: nationality || 'Netherlands',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1980-01-01'),
        weeklyWage: wage,
        contractStart: new Date(),
        contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });

    return staff;
  }

  // --- CLUB ANALYTICS ---
  async getClubAnalytics(clubId: number) {
    const [squad, finances, facilities, staff] = await Promise.all([
      this.getSquadAnalytics(clubId),
      this.getFinancialAnalytics(clubId),
      this.getClubFacilities(clubId),
      this.getClubStaff(clubId)
    ]);

    // League performance
    const stats = await prisma.clubSeasonStats.findMany({
      where: { clubId },
      orderBy: { season: 'desc' },
      take: 5
    });

    // Recent form
    const recentFixtures = await prisma.fixture.findMany({
      where: {
        OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }],
        homeScore: { not: null },
        awayScore: { not: null },
        isPlayed: true
      },
      orderBy: { matchDay: 'desc' },
      take: 10
    });

    const form = recentFixtures.map((f: any) => {
      const isHome = f.homeTeamId === clubId;
      const goalsFor = isHome ? f.homeScore! : f.awayScore!;
      const goalsAgainst = isHome ? f.awayScore! : f.homeScore!;
      return { matchDay: f.matchDay, result: goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L', goalsFor, goalsAgainst };
    });

    return {
      squad,
      finances,
      facilities,
      staff,
      leagueStats: stats,
      recentForm: form,
      overallRating: this.calculateOverallRating(squad, finances, facilities, staff)
    };
  }

  private calculateOverallRating(squad: any, finances: any, facilities: any, staff: any) {
    const squadRating = squad.averageSkill * 0.4;
    const financialRating = finances ? (finances.currentBalance / 1000000) * 0.2 : 0;
    const facilityRating = facilities.reduce((sum: number, f: any) => sum + f.efficiency, 0) / facilities.length * 0.2;
    const staffRating = staff.analytics.averageSkill * 0.2;

    return Math.round(squadRating + financialRating + facilityRating + staffRating);
  }

  // --- TRANSFER & LOAN MANAGEMENT ---
  async getTransferOffers(clubId: number) {
    const players = await prisma.player.findMany({ where: { currentClubId: clubId } });
    const playerIds = players.map((p: any) => p.id);

    const offers = await prisma.transferOffer.findMany({
      where: { playerId: { in: playerIds } },
      orderBy: { createdAt: 'desc' },
    });

    return offers;
  }

  async getLoans(_clubId: number) {
    // Return empty array - loan functionality to be implemented later
    return [];
  }

  /**
   * Get all clubs with their league information, sorted by division
   * @param filters - Optional filters for searching and filtering clubs
   * @returns Array of clubs with their associated league information
   */
  async getClubsWithLeagues(filters?: { search?: string; leagueId?: number }): Promise<ClubWithLeague[]> {
    const { search, leagueId } = filters || {};

    // Build the where clause with proper typing
    const where: Prisma.ClubWhereInput = {
      isActive: true, // Only include active clubs
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
      ];
    }

    // Add league filter if provided
    if (leagueId) {
      where.leagueId = leagueId;
    };

    try {
      // Get clubs with their league data
      const clubs = await prisma.club.findMany({
        where,
        include: {
          league: true,
        },
        orderBy: [
          { league: { tier: 'asc' } },
          { league: { name: 'asc' } },
          { name: 'asc' },
        ],
      });

      // Transform the data to ensure all required fields have defaults
      return clubs.map(club => ({
        ...club,
        morale: club.morale ?? 70,
        form: club.form ?? '',
        boardExpectation: club.boardExpectation || 'mid-table',
      })) as unknown as ClubWithLeague[];
    } catch (error) {
      console.error('Error fetching clubs with leagues:', error);
      throw new Error('Failed to fetch clubs');
    }
  }

  // --- YOUTH ACADEMY ---
  async getYouthAcademy(clubId: number) {
    const jongTeams = await prisma.club.findMany({
      where: { parentClubId: clubId, isJongTeam: true },
      include: { players: true }
    });

    const youthPlayers = jongTeams.flatMap((team: any) => team.players);
    const clubReputation = await ClubService.getAcademyReputation(clubId);

    return {
      jongTeams,
      youthPlayers,
      academyReputation: clubReputation,
      totalYouthPlayers: youthPlayers.length,
      averageYouthSkill: youthPlayers.length > 0 ? youthPlayers.reduce((sum: number, p: any) => sum + (p.currentAbility ?? 0), 0) / youthPlayers.length : 0
    };
  }

  // --- BOARD & EXPECTATIONS ---
  async getBoardExpectations(clubId: number) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club not found');

    const stats = await prisma.clubSeasonStats.findFirst({
      where: { clubId },
      orderBy: { season: 'desc' }
    });

    const expectations = {
      leaguePosition: club.boardExpectation || 'mid-table',
      currentPosition: stats?.position || 0,
      meetingExpectations: this.checkBoardExpectations(club.boardExpectation, stats),
      morale: club.morale || 70,
      form: club.form || ''
    };

    return expectations;
  }

  private checkBoardExpectations(expectation: string | null, stats: any) {
    if (!expectation || !stats) return true;

    const position = stats.position;
    switch (expectation) {
      case 'title-challenge': return position <= 3;
      case 'champions-league': return position <= 4;
      case 'europa-league': return position <= 6;
      case 'mid-table': return position >= 8 && position <= 12;
      case 'avoid-relegation': return position >= 15;
      default: return true;
    }
  }
}

export { ClubService };
export default new ClubService(); 