import { PrismaClient } from '@prisma/client';
import GameStateService from './gameStateService';
import { MatchSimulationService } from './matchSimulationService';

export class GameLoopService {
  private static instance: GameLoopService;
  private prisma: PrismaClient;
  private gameState: GameStateService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.gameState = GameStateService.getInstance();
  }

  public static getInstance(): GameLoopService {
    if (!GameLoopService.instance) {
      GameLoopService.instance = new GameLoopService();
    }
    return GameLoopService.instance;
  }

  /**
   * Process a single game week
   */
  public async processWeek(): Promise<void> {
    const currentWeek = this.gameState.getCurrentWeek();
    const currentSeason = this.gameState.getCurrentSeason();
    
    console.log(`Processing week ${currentWeek} of ${currentSeason}...`);

    // 1. Process all fixtures for the current week
    await this.processFixtures();
    
    // 2. Update league tables based on match results (stubbed for now; handled inside CompetitionService flows)
    // TODO: implement competitionService.updateLeagueTables(currentSeason)
    
    // 3. Update player fitness and morale
    await this.updatePlayerStates();
    
    // 4. Process injuries and suspensions
    await this.processInjuriesAndSuspensions();
    
    // 5. Process transfers if window is open (stubbed)
    if (this.gameState.getTransferWindow() === 'open') {
      await this.processTransfers();
    }
    
    // 6. Check for season end and handle promotions/relegations (stubbed)
    if (this.isEndOfSeason(currentWeek)) {
      await this.processSeasonEnd(currentSeason);
    }
    
    // 7. Advance the game week
    await this.gameState.advanceWeek();
    this.logWeekComplete(currentWeek);
  }
  
  /**
   * Check if the current week is the end of the season
   */
  private isEndOfSeason(week: number): boolean {
    // Assuming a 38-week season (like most European leagues)
    return week >= 38;
  }
  
  /**
   * Handle end of season logic
   */
  private async processSeasonEnd(season: string): Promise<void> {
    console.log(`Processing end of season ${season}...`);
    // TODO: hook into CompetitionService season pipeline once finalized
    return;
  }
  
  /**
   * Get the next season string (e.g., '2025/2026' -> '2026/2027')
   */
  private getNextSeason(currentSeason: string): string {
    const [startYear, endYear] = currentSeason.split('/').map(Number);
    return `${startYear + 1}/${endYear + 1}`;
  }
  
  /**
   * Log end-of-week processing
   */
  private logWeekComplete(currentWeek: number): void {
    console.log(`Week ${currentWeek} processing complete.`);
  }

  private async processFixtures(): Promise<void> {
    const currentWeek = this.gameState.getCurrentWeek();
    const currentSeason = this.gameState.getCurrentSeason();
    
    // Get all fixtures for the current week
    const fixtures = await this.prisma.fixture.findMany({
      where: {
        matchDay: currentWeek,
        isPlayed: false,
        competition: {
          season: currentSeason,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        matchDate: 'asc',
      },
    });

    // Process each fixture
    for (const fixture of fixtures) {
      try {
        console.log(`Simulating match: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
        await MatchSimulationService.simulateMatch(fixture.id);
      } catch (error) {
        console.error(`Error simulating match ${fixture.id}:`, error);
      }
    }
  }

  private async updatePlayerStates(): Promise<void> {
    return;
  }

  private async processInjuriesAndSuspensions(): Promise<void> {
    return;
  }

  // League table updates are handled within CompetitionService; no-op here for now
  private async updateLeagueTables(): Promise<void> { return; }

  private async processTransfers(): Promise<void> {
    // Stubbed
    console.log('Processing transfers...');
    return;
  }
}

export default GameLoopService.getInstance();
