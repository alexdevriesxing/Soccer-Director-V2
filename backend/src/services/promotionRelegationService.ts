import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PromotionRelegationResult {
  promotedClubs: { clubId: number; fromLeagueId: number; toLeagueId: number }[];
  relegatedClubs: { clubId: number; fromLeagueId: number; toLeagueId: number }[];
}

export class PromotionRelegationService {
  /**
   * Handle promotion and relegation for Zaterdag Noord structure
   * Clubs can only promote/relegate within Zaterdag Noord until they reach national level
   */
  static async handleZaterdagNoordPromotionRelegation(): Promise<PromotionRelegationResult> {
    const result: PromotionRelegationResult = {
      promotedClubs: [],
      relegatedClubs: []
    };

    try {
      // Get all Zaterdag Noord leagues
      const zaterdagNoordLeagues = await prisma.league.findMany({
        where: {
          region: 'Zaterdag Noord'
        },
        include: {
          clubs: true
        },
        orderBy: [
          { division: 'asc' }
        ]
      });

      // Handle promotion from 5e klasse to 4e klasse
      await this.handlePromotionFromVijfdeKlasse(zaterdagNoordLeagues, result);

      // Handle promotion from 4e klasse to 3e klasse
      await this.handlePromotionFromVierdeKlasse(zaterdagNoordLeagues, result);

      // Handle promotion from 3e klasse to 2e klasse
      await this.handlePromotionFromDerdeKlasse(zaterdagNoordLeagues, result);

      // Handle promotion from 2e klasse to 1e klasse
      await this.handlePromotionFromTweedeKlasse(zaterdagNoordLeagues, result);

      // Handle promotion from 1e klasse to national level (Vierde Divisie)
      await this.handlePromotionToNational(zaterdagNoordLeagues, result);

      // Handle relegation from national level back to Zaterdag Noord
      await this.handleRelegationFromNational(zaterdagNoordLeagues, result);

      // Handle relegation within Zaterdag Noord structure
      await this.handleRelegationWithinZaterdagNoord(zaterdagNoordLeagues, result);

      return result;
    } catch (error) {
      console.error('Error handling promotion and relegation:', error);
      throw error;
    }
  }

  private static async handlePromotionFromVijfdeKlasse(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const vijfdeKlasseLeagues = leagues.filter((l: any) => l.division.startsWith('Vijfde Klasse'));
    const vierdeKlasseLeagues = leagues.filter((l: any) => l.division === 'Vierde Klasse');

    for (const vijfdeLeague of vijfdeKlasseLeagues) {
      // Get top 2 clubs from each 5e klasse group
      const topClubs = vijfdeLeague.clubs
        .sort((a: any, b: any) => b.morale - a.morale)
        .slice(0, 2);

      for (const club of topClubs) {
        // Find a 4e klasse league to promote to
        const targetLeague = vierdeKlasseLeagues[Math.floor(Math.random() * vierdeKlasseLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.promotedClubs.push({
          clubId: club.id,
          fromLeagueId: vijfdeLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static async handlePromotionFromVierdeKlasse(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const vierdeKlasseLeagues = leagues.filter((l: any) => l.division === 'Vierde Klasse');
    const derdeKlasseLeagues = leagues.filter((l: any) => l.division === 'Derde Klasse');

    for (const vierdeLeague of vierdeKlasseLeagues) {
      // Get top 2 clubs from each 4e klasse group
      const topClubs = vierdeLeague.clubs
        .sort((a: any, b: any) => b.morale - a.morale)
        .slice(0, 2);

      for (const club of topClubs) {
        // Find a 3e klasse league to promote to
        const targetLeague = derdeKlasseLeagues[Math.floor(Math.random() * derdeKlasseLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.promotedClubs.push({
          clubId: club.id,
          fromLeagueId: vierdeLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static async handlePromotionFromDerdeKlasse(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const derdeKlasseLeagues = leagues.filter((l: any) => l.division === 'Derde Klasse');
    const tweedeKlasseLeagues = leagues.filter((l: any) => l.division === 'Tweede Klasse');

    for (const derdeLeague of derdeKlasseLeagues) {
      // Get top 2 clubs from each 3e klasse group
      const topClubs = derdeLeague.clubs
        .sort((a: any, b: any) => b.morale - a.morale)
        .slice(0, 2);

      for (const club of topClubs) {
        // Find a 2e klasse league to promote to
        const targetLeague = tweedeKlasseLeagues[Math.floor(Math.random() * tweedeKlasseLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.promotedClubs.push({
          clubId: club.id,
          fromLeagueId: derdeLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static async handlePromotionFromTweedeKlasse(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const tweedeKlasseLeagues = leagues.filter((l: any) => l.division === 'Tweede Klasse');
    const eersteKlasseLeagues = leagues.filter((l: any) => l.division === 'Eerste Klasse');

    for (const tweedeLeague of tweedeKlasseLeagues) {
      // Get top 2 clubs from each 2e klasse group
      const topClubs = tweedeLeague.clubs
        .sort((a: any, b: any) => b.morale - a.morale)
        .slice(0, 2);

      for (const club of topClubs) {
        // Find a 1e klasse league to promote to
        const targetLeague = eersteKlasseLeagues[Math.floor(Math.random() * eersteKlasseLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.promotedClubs.push({
          clubId: club.id,
          fromLeagueId: tweedeLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static async handlePromotionToNational(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const eersteKlasseLeagues = leagues.filter((l: any) => l.division === 'Eerste Klasse');
    
    // Get all national Vierde Divisie leagues (A, B, C, D)
    const vierdeDivisieLeagues = await prisma.league.findMany({
      where: {
        name: {
          in: ['Vierde Divisie A', 'Vierde Divisie B', 'Vierde Divisie C', 'Vierde Divisie D']
        },
        tier: 'VIERDE_DIVISIE'
      }
    });

    if (vierdeDivisieLeagues.length === 0) return;

    for (const eersteLeague of eersteKlasseLeagues) {
      // Get top 1 club from each 1e klasse group (promotion to national)
      const topClub = eersteLeague.clubs
        .sort((a: any, b: any) => b.morale - a.morale)[0];

      if (topClub) {
        // Determine which Vierde Divisie league to promote to based on region tag
        const targetLeague = this.getTargetVierdeDivisieLeague(topClub.regionTag, vierdeDivisieLeagues);
        
        await prisma.club.update({
          where: { id: topClub.id },
          data: { leagueId: targetLeague.id }
        });

        result.promotedClubs.push({
          clubId: topClub.id,
          fromLeagueId: eersteLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static getTargetVierdeDivisieLeague(regionTag: string, vierdeDivisieLeagues: any[]): any {
    // Map region tags to specific Vierde Divisie leagues
    const regionToLeagueMap: Record<string, string> = {
      'Zaterdag Noord': 'Vierde Divisie A',
      'Zaterdag Oost': 'Vierde Divisie A', 
      'Zaterdag Zuid': 'Vierde Divisie B',
      'Zondag Noord': 'Vierde Divisie D',
      'Zondag Oost': 'Vierde Divisie C',
      'Zondag West 1': 'Vierde Divisie A',
      'Zondag West 2': 'Vierde Divisie A',
      'Zondag Zuid 1': 'Vierde Divisie B',
      'Zondag Zuid 2': 'Vierde Divisie B'
    };

    const targetLeagueName = regionToLeagueMap[regionTag] || 'Vierde Divisie A';
    return vierdeDivisieLeagues.find(league => league.name === targetLeagueName) || vierdeDivisieLeagues[0];
  }

  private static async handleRelegationFromNational(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    // Get all national Vierde Divisie leagues (A, B, C, D)
    const vierdeDivisieLeagues = await prisma.league.findMany({
      where: {
        name: {
          in: ['Vierde Divisie A', 'Vierde Divisie B', 'Vierde Divisie C', 'Vierde Divisie D']
        },
        tier: 'VIERDE_DIVISIE'
      },
      include: {
        clubs: true
      }
    });

    if (vierdeDivisieLeagues.length === 0) return;

    const eersteKlasseLeagues = leagues.filter((l: any) => l.division === 'Eerste Klasse');

    // Handle relegation from each Vierde Divisie league
    for (const vierdeDivisie of vierdeDivisieLeagues) {
      // Get bottom 2 clubs from each Vierde Divisie league
      const bottomClubs = vierdeDivisie.clubs
        .sort((a: any, b: any) => a.morale - b.morale)
        .slice(0, 2);

      for (const club of bottomClubs) {
        // Relegate based on the club's region tag
        if (club.regionTag) {
          const targetRegionalLeague = this.getTargetRegionalLeague(club.regionTag, leagues);
          
          if (targetRegionalLeague) {
            await prisma.club.update({
              where: { id: club.id },
              data: { leagueId: targetRegionalLeague.id }
            });

            result.relegatedClubs.push({
              clubId: club.id,
              fromLeagueId: vierdeDivisie.id,
              toLeagueId: targetRegionalLeague.id
            });
          }
        }
      }
    }
  }

  private static getTargetRegionalLeague(regionTag: string, leagues: any[]): any {
    if (!regionTag) return null;

    // Find the appropriate regional league based on the region tag
    const targetLeague = leagues.find(league => 
      league.region === regionTag && league.division === 'Eerste Klasse'
    );

    return targetLeague || leagues.find(league => league.division === 'Eerste Klasse');
  }

  private static async handleRelegationWithinZaterdagNoord(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    // Handle relegation from 1e klasse to 2e klasse
    await this.handleRelegationBetweenDivisions(leagues, 'Eerste Klasse', 'Tweede Klasse', result);
    
    // Handle relegation from 2e klasse to 3e klasse
    await this.handleRelegationBetweenDivisions(leagues, 'Tweede Klasse', 'Derde Klasse', result);
    
    // Handle relegation from 3e klasse to 4e klasse
    await this.handleRelegationBetweenDivisions(leagues, 'Derde Klasse', 'Vierde Klasse', result);
    
    // Handle relegation from 4e klasse to 5e klasse
    await this.handleRelegationToVijfdeKlasse(leagues, result);
  }

  private static async handleRelegationBetweenDivisions(
    leagues: any[],
    fromDivision: string,
    toDivision: string,
    result: PromotionRelegationResult
  ) {
    const fromLeagues = leagues.filter((l: any) => l.division === fromDivision);
    const toLeagues = leagues.filter((l: any) => l.division === toDivision);

    for (const fromLeague of fromLeagues) {
      // Get bottom 2 clubs from each league
      const bottomClubs = fromLeague.clubs
        .sort((a: any, b: any) => a.morale - b.morale)
        .slice(0, 2);

      for (const club of bottomClubs) {
        // Find a target league to relegate to
        const targetLeague = toLeagues[Math.floor(Math.random() * toLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.relegatedClubs.push({
          clubId: club.id,
          fromLeagueId: fromLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  private static async handleRelegationToVijfdeKlasse(
    leagues: any[],
    result: PromotionRelegationResult
  ) {
    const vierdeKlasseLeagues = leagues.filter((l: any) => l.division === 'Vierde Klasse');
    const vijfdeKlasseLeagues = leagues.filter((l: any) => l.division.startsWith('Vijfde Klasse'));

    for (const vierdeLeague of vierdeKlasseLeagues) {
      // Get bottom 2 clubs from each 4e klasse group
      const bottomClubs = vierdeLeague.clubs
        .sort((a: any, b: any) => a.morale - b.morale)
        .slice(0, 2);

      for (const club of bottomClubs) {
        // Find a 5e klasse league to relegate to
        const targetLeague = vijfdeKlasseLeagues[Math.floor(Math.random() * vijfdeKlasseLeagues.length)];
        
        await prisma.club.update({
          where: { id: club.id },
          data: { leagueId: targetLeague.id }
        });

        result.relegatedClubs.push({
          clubId: club.id,
          fromLeagueId: vierdeLeague.id,
          toLeagueId: targetLeague.id
        });
      }
    }
  }

  /**
   * Determine if a club is from Zaterdag Noord based on its name
   * This is a simplified check - in a real system, you'd have a proper tag field
   */
  private static isZaterdagNoordClub(clubName: string): boolean {
    // List of known Zaterdag Noord clubs
    const zaterdagNoordClubs = [
      'Be Quick 1887', 'Blauw Wit \'34', 'Broekster Boys', 'VV Buitenpost',
      'Drachtster Boys', 'Heerenveense Boys', 'Oranje Nassau G.', 'PKC \'83',
      'VV Rolder Boys', 'SC Stiens', 'Velocitas 1897', 'VV Winsum', 'WVV 1896',
      // Add more clubs as needed
    ];

    return zaterdagNoordClubs.includes(clubName);
  }

  /**
   * Get promotion and relegation statistics for a specific season
   */
  static async getPromotionRelegationStats(season: string) {
    const stats = await prisma.league.findMany({
      where: {
        region: 'Zaterdag Noord',
        season: season
      },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            morale: true,
            form: true
          }
        }
      }
    });

    return stats.map((league: any) => ({
      leagueName: league.name,
      division: league.division,
      clubCount: league.clubs.length,
      averageMorale: league.clubs.length > 0 
        ? league.clubs.reduce((sum: number, club: any) => sum + club.morale, 0) / league.clubs.length 
        : 0
    }));
  }

  /**
   * Handle Eredivisie/Eerste Divisie promotion, relegation, and playoff logic (real Dutch system)
   */
  static async handleEredivisiePromotionRelegation(): Promise<PromotionRelegationResult & { statusMap: Record<number, string> }> {
    const result: PromotionRelegationResult = {
      promotedClubs: [],
      relegatedClubs: []
    };
    const statusMap: Record<number, string> = {};
    try {
      // Get Eredivisie and Eerste Divisie leagues
      const ereDivisie = await prisma.league.findFirst({ where: { name: 'Eredivisie' }, include: { clubs: true } });
      const eersteDivisie = await prisma.league.findFirst({ where: { name: 'Eerste Divisie' }, include: { clubs: true } });
      if (!ereDivisie || !eersteDivisie) throw new Error('Leagues not found');

      // Get all fixtures for Eredivisie and Eerste Divisie
      const ereFixtures = await prisma.fixture.findMany({ where: { leagueId: ereDivisie.id } });
      const eersteFixtures = await prisma.fixture.findMany({ where: { leagueId: eersteDivisie.id } });

      // Helper to build table for a league
      function buildTable(clubs: any[], fixtures: any[]): any[] {
        const tableData: { [clubId: number]: any } = {};
        clubs.forEach(club => {
          tableData[club.id] = {
            id: club.id,
            name: club.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
          };
        });
        fixtures.filter(f => f.played && f.homeGoals !== null && f.awayGoals !== null).forEach(fixture => {
          const homeClub = tableData[fixture.homeClubId];
          const awayClub = tableData[fixture.awayClubId];
          if (homeClub && awayClub) {
            homeClub.played++;
            awayClub.played++;
            homeClub.goalsFor += fixture.homeGoals;
            homeClub.goalsAgainst += fixture.awayGoals;
            awayClub.goalsFor += fixture.awayGoals;
            awayClub.goalsAgainst += fixture.homeGoals;
            if (fixture.homeGoals > fixture.awayGoals) {
              homeClub.won++;
              awayClub.lost++;
              homeClub.points += 3;
            } else if (fixture.homeGoals < fixture.awayGoals) {
              awayClub.won++;
              homeClub.lost++;
              awayClub.points += 3;
            } else {
              homeClub.drawn++;
              awayClub.drawn++;
              homeClub.points += 1;
              awayClub.points += 1;
            }
          }
        });
        Object.values(tableData).forEach((club: any) => {
          club.goalDifference = club.goalsFor - club.goalsAgainst;
        });
        return Object.values(tableData).sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
      }

      // Build tables
      const ereTable = buildTable(ereDivisie.clubs, ereFixtures);
      const eersteTable = buildTable(eersteDivisie.clubs, eersteFixtures);

      // Eredivisie: 1st = champion, 2nd = CLQ, 3rd = ELQ, 4th = ECLQ, 5-8 = ECL playoff, 16th = playoff, 17-18 = relegated
      if (ereTable[0]) statusMap[ereTable[0].id] = 'champion';
      if (ereTable[1]) statusMap[ereTable[1].id] = 'cl_qual';
      if (ereTable[2]) statusMap[ereTable[2].id] = 'el_qual';
      if (ereTable[3]) statusMap[ereTable[3].id] = 'ecl_qual';
      for (let i = 4; i <= 7; i++) if (ereTable[i]) statusMap[ereTable[i].id] = 'ecl_playoff';
      if (ereTable[15]) statusMap[ereTable[15].id] = 'promotion_playoff';
      if (ereTable[16]) { // 17th
        statusMap[ereTable[16].id] = 'relegated';
        await prisma.club.update({ where: { id: ereTable[16].id }, data: { leagueId: eersteDivisie.id } });
        result.relegatedClubs.push({ clubId: ereTable[16].id, fromLeagueId: ereDivisie.id, toLeagueId: eersteDivisie.id });
      }
      if (ereTable[17]) { // 18th
        statusMap[ereTable[17].id] = 'relegated';
        await prisma.club.update({ where: { id: ereTable[17].id }, data: { leagueId: eersteDivisie.id } });
        result.relegatedClubs.push({ clubId: ereTable[17].id, fromLeagueId: ereDivisie.id, toLeagueId: eersteDivisie.id });
      }

      // Eerste Divisie: 1st & 2nd = promoted, 3rd-8th = playoff
      if (eersteTable[0]) {
        statusMap[eersteTable[0].id] = 'promoted';
        await prisma.club.update({ where: { id: eersteTable[0].id }, data: { leagueId: ereDivisie.id } });
        result.promotedClubs.push({ clubId: eersteTable[0].id, fromLeagueId: eersteDivisie.id, toLeagueId: ereDivisie.id });
      }
      if (eersteTable[1]) {
        statusMap[eersteTable[1].id] = 'promoted';
        await prisma.club.update({ where: { id: eersteTable[1].id }, data: { leagueId: ereDivisie.id } });
        result.promotedClubs.push({ clubId: eersteTable[1].id, fromLeagueId: eersteDivisie.id, toLeagueId: ereDivisie.id });
      }
      for (let i = 2; i <= 7; i++) if (eersteTable[i]) statusMap[eersteTable[i].id] = 'promotion_playoff';

      // Eredivisie 16th also in playoff
      // --- Advanced Playoff Simulation (Nacompetitie) ---
      // 16th Eredivisie + 3rd-8th Eerste Divisie (7 teams)
      const playoffTeams = [];
      if (ereTable[15]) playoffTeams.push({ ...ereTable[15], from: 'Eredivisie' });
      for (let i = 2; i <= 7; i++) if (eersteTable[i]) playoffTeams.push({ ...eersteTable[i], from: 'EersteDivisie' });
      // Simulate 3 rounds: QF, SF, Final (single leg, morale as strength)
      let roundTeams = playoffTeams;
      while (roundTeams.length > 1) {
        const nextRound: any[] = [];
        for (let i = 0; i < roundTeams.length; i += 2) {
          if (i + 1 < roundTeams.length) {
            const a = roundTeams[i];
            const b = roundTeams[i + 1];
            // Simulate match: higher morale wins, tie = random
            let winner = a;
            if (b.morale > a.morale) winner = b;
            else if (a.morale === b.morale) winner = Math.random() < 0.5 ? a : b;
            nextRound.push(winner);
          } else {
            // Odd team advances automatically
            nextRound.push(roundTeams[i]);
          }
        }
        roundTeams = nextRound;
      }
      // Winner is promoted (or stays) in Eredivisie, loser in Eerste Divisie
      if (roundTeams[0]) {
        const winner = roundTeams[0];
        // --- JONG TEAM EDGE CASES ---
        // 1. Prevent Jong teams from being promoted to Eredivisie
        const winnerClub = await prisma.club.findUnique({ where: { id: winner.id } });
        if (winner.from === 'Eredivisie') {
          // Stays in Eredivisie
          statusMap[winner.id] = 'playoff_survival';
        } else if (winnerClub && winnerClub.isJongTeam) {
          // If Jong team wins playoff, do NOT promote; next eligible team can be promoted (if any)
          statusMap[winner.id] = 'jong_blocked_promotion';
        } else {
          // Promoted to Eredivisie
          await prisma.club.update({ where: { id: winner.id }, data: { leagueId: ereDivisie.id } });
          result.promotedClubs.push({ clubId: winner.id, fromLeagueId: eersteDivisie.id, toLeagueId: ereDivisie.id });
          statusMap[winner.id] = 'playoff_promoted';
        }
      }
      // --- End Playoff Simulation ---

      // --- Prevent Jong and parent club in same division ---
      // After all promotions/relegations, check for conflicts in Eredivisie and Eerste Divisie
      const allJongTeams = await prisma.club.findMany({ where: { isJongTeam: true }, include: { parentClub: true, league: true } });
      for (const jong of allJongTeams) {
        if (jong.parentClubId && jong.leagueId && jong.parentClub && jong.parentClub.leagueId === jong.leagueId) {
          // Relegate Jong team to O21 Divisie 1
          const o21Div1 = await prisma.league.findFirst({ where: { tier: 'O21_TOP' } });
          if (o21Div1) {
            await prisma.club.update({ where: { id: jong.id }, data: { leagueId: o21Div1.id } });
            statusMap[jong.id] = 'jong_relegated_to_o21';
          }
        }
      }
      // --- Relegate Jong teams from Tweede Divisie to O21 Divisie 1 ---
      const tweedeDivisie = await prisma.league.findFirst({ where: { name: 'Tweede Divisie' } });
      if (tweedeDivisie) {
        const jongTweedeDivisie = await prisma.club.findMany({ where: { isJongTeam: true, leagueId: tweedeDivisie.id } });
        for (const jong of jongTweedeDivisie) {
          // If marked for relegation, send to O21 Divisie 1
          // (Assume statusMap or other logic marks them for relegation)
          // For now, if their morale is among the lowest, relegate
          if (jong.morale < 50) {
            const o21Div1 = await prisma.league.findFirst({ where: { tier: 'O21_TOP' } });
            if (o21Div1) {
              await prisma.club.update({ where: { id: jong.id }, data: { leagueId: o21Div1.id } });
              statusMap[jong.id] = 'jong_relegated_to_o21';
            }
          }
        }
      }

      return { ...result, statusMap };
    } catch (error) {
      console.error('Error handling Eredivisie/Eerste Divisie promotion/relegation:', error);
      throw error;
    }
  }

  /**
   * Generic handler for promotion/relegation/playoff logic between two divisions
   */
  static async handlePromotionRelegationBetweenDivisions(
    upperLeagueName: string,
    lowerLeagueName: string
  ): Promise<PromotionRelegationResult & { statusMap: Record<number, string> }> {
    const result: PromotionRelegationResult = {
      promotedClubs: [],
      relegatedClubs: []
    };
    const statusMap: Record<number, string> = {};
    try {
      // Get leagues
      const upperLeague = await prisma.league.findFirst({ where: { name: upperLeagueName }, include: { clubs: true } });
      const lowerLeague = await prisma.league.findFirst({ where: { name: lowerLeagueName }, include: { clubs: true } });
      if (!upperLeague || !lowerLeague) throw new Error('Leagues not found');

      // Get all fixtures for both leagues
      const upperFixtures = await prisma.fixture.findMany({ where: { leagueId: upperLeague.id } });
      const lowerFixtures = await prisma.fixture.findMany({ where: { leagueId: lowerLeague.id } });

      // Helper to build table for a league
      function buildTable(clubs: any[], fixtures: any[]): any[] {
        const tableData: { [clubId: number]: any } = {};
        clubs.forEach(club => {
          tableData[club.id] = {
            id: club.id,
            name: club.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
          };
        });
        fixtures.filter(f => f.played && f.homeGoals !== null && f.awayGoals !== null).forEach(fixture => {
          const homeClub = tableData[fixture.homeClubId];
          const awayClub = tableData[fixture.awayClubId];
          if (homeClub && awayClub) {
            homeClub.played++;
            awayClub.played++;
            homeClub.goalsFor += fixture.homeGoals;
            homeClub.goalsAgainst += fixture.awayGoals;
            awayClub.goalsFor += fixture.awayGoals;
            awayClub.goalsAgainst += fixture.homeGoals;
            if (fixture.homeGoals > fixture.awayGoals) {
              homeClub.won++;
              awayClub.lost++;
              homeClub.points += 3;
            } else if (fixture.homeGoals < fixture.awayGoals) {
              awayClub.won++;
              homeClub.lost++;
              awayClub.points += 3;
            } else {
              homeClub.drawn++;
              awayClub.drawn++;
              homeClub.points += 1;
              awayClub.points += 1;
            }
          }
        });
        Object.values(tableData).forEach((club: any) => {
          club.goalDifference = club.goalsFor - club.goalsAgainst;
        });
        return Object.values(tableData).sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
      }

      // Build tables
      const upperTable = buildTable(upperLeague.clubs, upperFixtures);
      const lowerTable = buildTable(lowerLeague.clubs, lowerFixtures);

      // Mark champion
      if (upperTable[0]) statusMap[upperTable[0].id] = 'champion';
      if (lowerTable[0]) statusMap[lowerTable[0].id] = 'promoted';
      if (lowerTable[1]) statusMap[lowerTable[1].id] = 'promoted';
      if (upperTable[upperTable.length - 2]) {
        statusMap[upperTable[upperTable.length - 2].id] = 'relegated';
        await prisma.club.update({ where: { id: upperTable[upperTable.length - 2].id }, data: { leagueId: lowerLeague.id } });
        result.relegatedClubs.push({ clubId: upperTable[upperTable.length - 2].id, fromLeagueId: upperLeague.id, toLeagueId: lowerLeague.id });
      }
      if (upperTable[upperTable.length - 1]) {
        statusMap[upperTable[upperTable.length - 1].id] = 'relegated';
        await prisma.club.update({ where: { id: upperTable[upperTable.length - 1].id }, data: { leagueId: lowerLeague.id } });
        result.relegatedClubs.push({ clubId: upperTable[upperTable.length - 1].id, fromLeagueId: upperLeague.id, toLeagueId: lowerLeague.id });
      }
      // Playoff: 16th in upper, 3rd-8th in lower
      if (upperTable[15]) statusMap[upperTable[15].id] = 'promotion_playoff';
      for (let i = 2; i <= 7; i++) if (lowerTable[i]) statusMap[lowerTable[i].id] = 'promotion_playoff';

      // Promote top 2 from lower, but only if eligibleForPromotion is true
      // For Tweede Divisie and similar, if the champion is not eligible, do not promote anyone
      const eligiblePromotees = lowerTable.filter((club: any) => club.eligibleForPromotion);
      if (eligiblePromotees[0]) {
        await prisma.club.update({ where: { id: eligiblePromotees[0].id }, data: { leagueId: upperLeague.id } });
        result.promotedClubs.push({ clubId: eligiblePromotees[0].id, fromLeagueId: lowerLeague.id, toLeagueId: upperLeague.id });
        statusMap[eligiblePromotees[0].id] = 'promoted';
      }
      if (eligiblePromotees[1]) {
        await prisma.club.update({ where: { id: eligiblePromotees[1].id }, data: { leagueId: upperLeague.id } });
        result.promotedClubs.push({ clubId: eligiblePromotees[1].id, fromLeagueId: lowerLeague.id, toLeagueId: upperLeague.id });
        statusMap[eligiblePromotees[1].id] = 'promoted';
      }

      return { ...result, statusMap };
    } catch (error) {
      console.error('Error handling promotion/relegation between divisions:', error);
      throw error;
    }
  }

  /**
   * Handle O21 league promotion/relegation and jong team/parent club rules
   */
  static async handleO21PromotionRelegation(): Promise<PromotionRelegationResult> {
    const result: PromotionRelegationResult = {
      promotedClubs: [],
      relegatedClubs: []
    };
    // 1. Get all O21 leagues
    const o21Leagues = await prisma.league.findMany({
      where: { tier: { in: ['O21_TOP', 'O21_2', 'O21_3', 'O21_4'] } },
      include: { clubs: { include: { parentClub: true } } },
      orderBy: { tier: 'asc' }
    });
    // 2. Promotion/relegation between O21 divisions
    for (let i = 0; i < o21Leagues.length - 1; i++) {
      const upper: any = o21Leagues[i];
      const lower: any = o21Leagues[i + 1];
      // Sort by points (simulate table)
      const upperSorted = [...upper.clubs].sort((a: any, b: any) => b.morale - a.morale);
      const lowerSorted = [...lower.clubs].sort((a: any, b: any) => b.morale - a.morale);
      // Bottom 2 from upper relegated, top 2 from lower promoted
      const relegated = upperSorted.slice(-2);
      const promoted = lowerSorted.slice(0, 2);
      for (const club of relegated) {
        await prisma.club.update({ where: { id: club.id }, data: { leagueId: lower.id } });
        result.relegatedClubs.push({ clubId: club.id, fromLeagueId: upper.id, toLeagueId: lower.id });
      }
      for (const club of promoted) {
        await prisma.club.update({ where: { id: club.id }, data: { leagueId: upper.id } });
        result.promotedClubs.push({ clubId: club.id, fromLeagueId: lower.id, toLeagueId: upper.id });
      }
    }
    // 3. Mini-league playoff: O21 Divisie 1 champ + Derde Divisie A/B champs
    const o21Top = o21Leagues[0];
    const derdeA = await prisma.league.findFirst({ where: { name: 'Derde Divisie A' }, include: { clubs: true } });
    const derdeB = await prisma.league.findFirst({ where: { name: 'Derde Divisie B' }, include: { clubs: true } });
    if (o21Top && derdeA && derdeB) {
      const o21Champ = [...o21Top.clubs].sort((a, b) => b.morale - a.morale)[0];
      const derdeAChamp = [...derdeA.clubs].sort((a, b) => b.morale - a.morale)[0];
      const derdeBChamp = [...derdeB.clubs].sort((a, b) => b.morale - a.morale)[0];
      // Simulate mini-league (each plays each twice, most points wins)
      const playoffClubs = [o21Champ, derdeAChamp, derdeBChamp];
      const points: Record<number, number> = {};
      playoffClubs.forEach(c => { if (c) points[c.id] = 0; });
      for (let i = 0; i < playoffClubs.length; i++) {
        for (let j = 0; j < playoffClubs.length; j++) {
          if (i !== j && playoffClubs[i] && playoffClubs[j]) {
            // Simulate two matches (home/away)
            for (let k = 0; k < 2; k++) {
              const home = playoffClubs[i];
              const away = playoffClubs[j];
              // Use morale as proxy for strength
              const homeScore = Math.round(home.morale / 10 + Math.random() * 2);
              const awayScore = Math.round(away.morale / 10 + Math.random() * 2);
              if (homeScore > awayScore) points[home.id] += 3;
              else if (homeScore < awayScore) points[away.id] += 3;
              else { points[home.id] += 1; points[away.id] += 1; }
            }
          }
        }
      }
      // Winner is promoted to Tweede Divisie (if not a jong team with parent in Tweede Divisie)
      const winnerId = Object.entries(points).sort((a, b) => b[1] - a[1])[0][0];
      const winner = playoffClubs.find(c => c && c.id === Number(winnerId));
      const tweedeDivisie = await prisma.league.findFirst({ where: { name: 'Tweede Divisie' } });
      if (winner && tweedeDivisie) {
        // Check jong team/parent club rule
        if (!winner.isJongTeam || !winner.parentClubId) {
          await prisma.club.update({ where: { id: winner.id }, data: { leagueId: tweedeDivisie.id } });
          result.promotedClubs.push({ clubId: winner.id, fromLeagueId: o21Top.id, toLeagueId: tweedeDivisie.id });
        } else {
          // If parent is in Tweede Divisie, do not promote
          const parent = await prisma.club.findUnique({ where: { id: winner.parentClubId } });
          if (!parent || parent.leagueId !== tweedeDivisie.id) {
            await prisma.club.update({ where: { id: winner.id }, data: { leagueId: tweedeDivisie.id } });
            result.promotedClubs.push({ clubId: winner.id, fromLeagueId: o21Top.id, toLeagueId: tweedeDivisie.id });
          }
        }
      }
    }
    // 4. Enforce jong team/parent club rules for all jong teams
    const jongTeams = await prisma.club.findMany({ where: { isJongTeam: true }, include: { parentClub: true, league: true } });
    for (const jong of jongTeams) {
      if (jong.parentClubId && jong.leagueId && jong.parentClub) {
        // If parent is in same league, relegate jong team
        if (jong.parentClub.leagueId === jong.leagueId) {
          // Find a lower O21 division or relegate to O21_4
          const currentO21Index = o21Leagues.findIndex(l => l.id === jong.leagueId);
          const lowerO21 = o21Leagues[currentO21Index + 1] || o21Leagues[o21Leagues.length - 1];
          await prisma.club.update({ where: { id: jong.id }, data: { leagueId: lowerO21.id } });
          result.relegatedClubs.push({ clubId: jong.id, fromLeagueId: jong.leagueId, toLeagueId: lowerO21.id });
        }
        // If parent is relegated to jong's league, relegate jong team
        if (jong.parentClub.leagueId === jong.leagueId) {
          const currentO21Index = o21Leagues.findIndex(l => l.id === jong.leagueId);
          const lowerO21 = o21Leagues[currentO21Index + 1] || o21Leagues[o21Leagues.length - 1];
          await prisma.club.update({ where: { id: jong.id }, data: { leagueId: lowerO21.id } });
          result.relegatedClubs.push({ clubId: jong.id, fromLeagueId: jong.leagueId, toLeagueId: lowerO21.id });
        }
        // If jong team would promote to parent's league, block promotion
        if (jong.league && jong.league.tier === 'TWEEDE_DIVISIE' && jong.parentClub.leagueId === jong.league.id) {
          // Move jong team back to O21_TOP
          const o21Top = o21Leagues[0];
          await prisma.club.update({ where: { id: jong.id }, data: { leagueId: o21Top.id } });
          result.relegatedClubs.push({ clubId: jong.id, fromLeagueId: jong.leagueId, toLeagueId: o21Top.id });
        }
      }
    }
    // After removing a 22-year-old from a jong team, auto-add a new 16-year-old player to the jong team
    return result;
  }

  // Graduation logic for jong teams at season rollover
  static async handleJongGraduations() {
    const jongTeams = await prisma.club.findMany({ where: { isJongTeam: true } });
    for (const jong of jongTeams) {
      const players = await prisma.player.findMany({ where: { clubId: jong.id } });
      for (const player of players) {
        if ((player.age ?? 0) >= 22) {
          // Store graduation event for frontend prompt (using MatchEvent instead)
          await prisma.matchEvent.create({
            data: {
              fixtureId: 1, // Use a placeholder fixture ID
              type: 'graduation',
              minute: 0,
              description: `Player ${player.name} graduated from jong team`,
              playerName: player.name,
              clubId: jong.parentClubId || null
            }
          });
          // Remove from jong team by setting clubId to parent club or undefined
          const newClubId = jong.parentClubId !== null && jong.parentClubId !== undefined ? jong.parentClubId : undefined;
          await prisma.player.update({ 
            where: { id: player.id }, 
            data: { clubId: newClubId }
          });
          // Add a new 16-year-old
          await prisma.player.create({
            data: {
              name: `Youth ${Math.floor(Math.random()*10000)}`,
              age: 16,
              clubId: jong.id,
              position: 'Midfielder',
              skill: Math.floor(Math.random() * 30) + 40,
              nationality: 'Netherlands',
              wage: 1000,
              contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              potential: 70,
              currentPotential: 60,
              contractStart: new Date()
            }
          });
        }
      }
    }
  }

  /**
   * Calculate period champions for a league
   * @param leagueId - the league to calculate periods for
   * @param numPeriods - number of periods (default 3)
   * @returns array of club IDs (period champions)
   */
  static async getPeriodChampions(leagueId: number, numPeriods: number = 3, excludeClubIds: number[] = []) {
    const fixtures = await prisma.fixture.findMany({ where: { leagueId, played: true }, orderBy: { week: 'asc' } });
    const clubs = new Set<number>();
    fixtures.forEach(f => { clubs.add(f.homeClubId); clubs.add(f.awayClubId); });
    const clubIds = Array.from(clubs);
    if (fixtures.length === 0 || clubIds.length === 0) return [];
    const periodLength = Math.floor(fixtures.length / numPeriods);
    const periodChampions: number[] = [];
    for (let p = 0; p < numPeriods; p++) {
      const start = p * periodLength;
      const end = p === numPeriods - 1 ? fixtures.length : (p + 1) * periodLength;
      const periodFixtures = fixtures.slice(start, end);
      // Calculate points per club for this period
      const points: Record<number, number> = {};
      clubIds.forEach(id => { points[id] = 0; });
      periodFixtures.forEach(f => {
        if (f.homeGoals != null && f.awayGoals != null) {
          if (f.homeGoals > f.awayGoals) { points[f.homeClubId] += 3; }
          else if (f.homeGoals < f.awayGoals) { points[f.awayClubId] += 3; }
          else { points[f.homeClubId] += 1; points[f.awayClubId] += 1; }
        }
      });
      // Exclude already promoted/playoff clubs
      excludeClubIds.forEach(id => { points[id] = -999; });
      // Find period champion
      const periodWinner = clubIds.sort((a, b) => points[b] - points[a])[0];
      if (periodWinner && !periodChampions.includes(periodWinner)) periodChampions.push(periodWinner);
    }
    return periodChampions;
  }

  /**
   * Enhanced amateur playoff handler using period champions
   */
  static async handleAmateurPlayoffsWithPeriods(upperLeagueName: string, lowerLeagueName: string, playoffSpots: number = 4, numPeriods: number = 3) {
    const upperLeague = await prisma.league.findFirst({ where: { name: upperLeagueName }, include: { clubs: true } });
    const lowerLeague = await prisma.league.findFirst({ where: { name: lowerLeagueName }, include: { clubs: true } });
    if (!upperLeague || !lowerLeague) return;
    // Build tables
    const upperTable = upperLeague.clubs.sort((a: any, b: any) => b.morale - a.morale);
    const lowerTable = lowerLeague.clubs.sort((a: any, b: any) => b.morale - a.morale);
    // Select playoff teams: bottom 2 from upper, period champions from lower, fill with next best if needed
    const relegationCandidates = upperTable.slice(-2);
    const championId = lowerTable[0]?.id;
    const excludeIds = [championId];
    const periodChampionIds = await this.getPeriodChampions(lowerLeague.id, numPeriods, excludeIds);
    let playoffCandidates = lowerTable.filter(c => periodChampionIds.includes(c.id));
    // Fill up with next best if not enough period champions
    let i = 1;
    while (playoffCandidates.length < playoffSpots && i < lowerTable.length) {
      const candidate = lowerTable[i];
      if (candidate && !playoffCandidates.some(c => c.id === candidate.id) && candidate.id !== championId) {
        playoffCandidates.push(candidate);
      }
      i++;
    }
    let roundTeams = [...relegationCandidates, ...playoffCandidates];
    // Simulate rounds
    while (roundTeams.length > 1) {
      const nextRound: any[] = [];
      for (let i = 0; i < roundTeams.length; i += 2) {
        if (i + 1 < roundTeams.length) {
          const a = roundTeams[i];
          const b = roundTeams[i + 1];
          let winner = a;
          if (b.morale > a.morale) winner = b;
          else if (a.morale === b.morale) winner = Math.random() < 0.5 ? a : b;
          nextRound.push(winner);
        } else {
          nextRound.push(roundTeams[i]);
        }
      }
      roundTeams = nextRound;
    }
    // Winner is promoted (if eligible)
    if (roundTeams[0] && roundTeams[0].eligibleForPromotion) {
      await prisma.club.update({ where: { id: roundTeams[0].id }, data: { leagueId: upperLeague.id } });
      // Optionally: log or store playoff result
    }
  }
} 