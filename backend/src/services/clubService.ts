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

type ClubWithStats = ClubWithLeague & {
  stats?: {
    position: number;
    points: number;
    gamesPlayed: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    wins: number;
    draws: number;
    losses: number;
  };
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

  // Get academy reputation for a club
  static async getAcademyReputation(clubId: number) {
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club not found');
    return club.academyReputation;
  }

  // Update academy reputation for a club (increment or decrement)
  static async updateAcademyReputation(clubId: number, change: number) {
    const club = await prisma.club.update({
      where: { id: clubId },
      data: { academyReputation: { increment: change } }
    });
    return club.academyReputation;
  }

  // --- SQUAD MANAGEMENT ---
  async getSquad(clubId: number, page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    const [players, totalPlayers] = await prisma.$transaction([
      prisma.player.findMany({
        where: { clubId },
        include: { loans: { where: { status: 'active' } } },
        orderBy: { skill: 'desc' },
        skip,
        take: limit
      }),
      prisma.player.count({ where: { clubId } })
    ]);

    const squadStats = {
      totalPlayers,
      available: players.filter((p: any) => !p.injured && !p.onInternationalDuty && p.loans.length === 0).length,
      injured: players.filter((p: any) => p.injured).length,
      internationalDuty: players.filter((p: any) => p.onInternationalDuty).length,
      onLoan: players.filter((p: any) => p.loans.length > 0).length,
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
    const players = await prisma.player.findMany({ where: { clubId } });
    
    const analytics = {
      averageAge: players.reduce((sum: number, p: any) => sum + p.age, 0) / players.length,
      averageSkill: players.reduce((sum: number, p: any) => sum + p.skill, 0) / players.length,
      averageMorale: players.reduce((sum: number, p: any) => sum + (p.morale || 50), 0) / players.length,
      totalWages: players.reduce((sum: number, p: any) => sum + p.wage, 0),
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
          const daysUntilExpiry = Math.ceil((p.contractExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
        recentlySigned: players.filter((p: any) => {
          const daysSinceSigned = Math.ceil((Date.now() - p.contractStart.getTime()) / (1000 * 60 * 60 * 24));
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
      orderBy: { week: 'desc' },
      take: 12
    });

    const sponsorships = await prisma.sponsorship.findMany({
      where: { clubId, isActive: true }
    });

    const totalSponsorshipValue = sponsorships.reduce((sum: number, s: any) => sum + s.value, 0);

    return { finances, sponsorships, totalSponsorshipValue };
  }

  async getFinancialAnalytics(clubId: number) {
    const finances = await prisma.clubFinances.findMany({
      where: { clubId },
      orderBy: { week: 'desc' },
      take: 52 // Last year
    });

    if (finances.length === 0) return null;

    const latest = finances[0];
    const previous = finances[1];

    const analytics = {
      currentBalance: latest.balance,
      balanceChange: previous ? latest.balance - previous.balance : 0,
      weeklyIncome: latest.gateReceiptsTotal + latest.sponsorshipTotal + latest.tvRightsTotal + latest.prizeMoneyTotal,
      weeklyExpenses: latest.playerWagesTotal + latest.staffWagesTotal + latest.facilityCosts + latest.maintenanceCosts,
      transferBudget: latest.transferBudget,
      wageBudget: latest.wageBudget,
      debtRatio: latest.debtTotal / (latest.equityValue + latest.debtTotal),
      marketValue: latest.marketValue
    };

    return analytics;
  }

  // --- FACILITIES ---
  async getClubFacilities(clubId: number) {
    const facilities = await prisma.facility.findMany({ where: { clubId } });
    
    const facilityAnalytics = facilities.map((facility: any) => ({
      ...facility,
      upgradeCost: facility.level * 1000000, // Example calculation
      maintenanceCost: facility.level * 50000,
      efficiency: facility.level * 10 // Example efficiency calculation
    }));

    return facilityAnalytics;
  }

  async upgradeFacility(clubId: number, facilityId: number) {
    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility || facility.clubId !== clubId) throw new Error('Facility not found');

    const upgradeCost = facility.level * 1000000;
    
    // Check if club can afford the upgrade
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
    if (!finances || finances.balance < upgradeCost) throw new Error('Insufficient funds for facility upgrade');

    // Create upgrade request
    const upgradeRequest = await prisma.facilityUpgradeRequest.create({
      data: {
        facilityId,
        requestedAt: new Date(),
        status: 'pending',
      }
    });

    // Deduct funds
    await prisma.clubFinances.update({
      where: { id: finances.id },
      data: { balance: { decrement: upgradeCost } }
    });

    return upgradeRequest;
  }

  // --- STAFF MANAGEMENT ---
  async getClubStaff(clubId: number) {
    const staff = await prisma.staff.findMany({ 
      where: { clubId },
      include: { contracts: { where: { isActive: true } } }
    });

    const staffAnalytics = {
      totalStaff: staff.length,
      byRole: staff.reduce((acc: Record<string, number>, s: any) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageSkill: staff.reduce((sum: number, s: any) => sum + s.skill, 0) / staff.length,
      totalWages: staff.reduce((sum: number, s: any) => {
        const contract = s.contracts[0];
        return sum + (contract?.wage || 0);
      }, 0)
    };

    return { staff, analytics: staffAnalytics };
  }

  async hireStaff(clubId: number, staffData: any) {
    const { name, role, skill, wage } = staffData;
    
    // Check wage budget
    const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
    if (!finances || finances.wageBudget < wage) throw new Error('Insufficient wage budget');

    const staff = await prisma.staff.create({
      data: {
        name,
        role,
        skill,
        clubId,
        hiredDate: new Date(), // Add missing hiredDate field
        contracts: {
          create: {
            clubId,
            role: role, // Add required role field
            wage,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isActive: true
          }
        }
      },
      include: { contracts: true }
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
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
        homeGoals: { not: null },
        awayGoals: { not: null }
      },
      orderBy: { week: 'desc' },
      take: 10
    });

    const form = recentFixtures.map((f: any) => {
      const isHome = f.homeClubId === clubId;
      const goalsFor = isHome ? f.homeGoals! : f.awayGoals!;
      const goalsAgainst = isHome ? f.awayGoals! : f.homeGoals!;
      return { week: f.week, result: goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L', goalsFor, goalsAgainst };
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
    const players = await prisma.player.findMany({ where: { clubId } });
    const playerIds = players.map((p: any) => p.id);

    const offers = await prisma.transferOffer.findMany({
      where: { playerId: { in: playerIds } },
      orderBy: { createdAt: 'desc' },
    });

    return offers;
  }

  async getLoans(clubId: number) {
    const loans = await prisma.loan.findMany({
      where: {
        OR: [{ fromClubId: clubId }, { toClubId: clubId }]
      },
      orderBy: { startDate: 'desc' }
    });

    return loans;
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
        { name: { contains: search, mode: 'insensitive' as const } },
        { league: { name: { contains: search, mode: 'insensitive' as const } } },
      ];
    }
    
    // Add league filter if provided
    if (leagueId) {
      where.leagueId = leagueId;
    }
    
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
    const academyReputation = await ClubService.getAcademyReputation(clubId);

    return {
      jongTeams,
      youthPlayers,
      academyReputation,
      totalYouthPlayers: youthPlayers.length,
      averageYouthSkill: youthPlayers.length > 0 ? youthPlayers.reduce((sum: number, p: any) => sum + p.skill, 0) / youthPlayers.length : 0
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