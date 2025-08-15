import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GameState {
  currentWeek: number;
  currentSeason: string;
  transferWindow: 'open' | 'closed';
  gameDate: Date;
}

class GameStateService {
  private static instance: GameStateService;
  private gameState: GameState = {
    currentWeek: 1,
    currentSeason: '2024/25',
    transferWindow: 'open',
    gameDate: new Date()
  };

  private constructor() {
    this.loadGameState();
  }

  public static getInstance(): GameStateService {
    if (!GameStateService.instance) {
      GameStateService.instance = new GameStateService();
    }
    return GameStateService.instance;
  }

  private async loadGameState() {
    try {
      // Try to load from database if it exists
      const state = await prisma.gameState.findFirst();
      if (state) {
        this.gameState = {
          currentWeek: state.currentWeek,
          currentSeason: state.currentSeason,
          transferWindow: state.transferWindow as 'open' | 'closed',
          gameDate: state.gameDate
        };
      } else {
        // Create initial game state
        await this.saveGameState();
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
      // Use default values if database is not available
    }
  }

  private async saveGameState() {
    try {
      await prisma.gameState.upsert({
        where: { id: 1 },
        update: {
          currentWeek: this.gameState.currentWeek,
          currentSeason: this.gameState.currentSeason,
          transferWindow: this.gameState.transferWindow,
          gameDate: this.gameState.gameDate
        },
        create: {
          id: 1,
          currentWeek: this.gameState.currentWeek,
          currentSeason: this.gameState.currentSeason,
          transferWindow: this.gameState.transferWindow,
          gameDate: this.gameState.gameDate
        }
      });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public async advanceWeek(): Promise<void> {
    this.gameState.currentWeek++;
    
    // Update transfer window status based on week
    if (this.gameState.currentWeek >= 8 && this.gameState.currentWeek <= 12) {
      this.gameState.transferWindow = 'open';
    } else if (this.gameState.currentWeek >= 20 && this.gameState.currentWeek <= 24) {
      this.gameState.transferWindow = 'open';
    } else {
      this.gameState.transferWindow = 'closed';
    }
    
    // Advance season if needed
    if (this.gameState.currentWeek > 38) {
      this.gameState.currentWeek = 1;
      const [year, nextYear] = this.gameState.currentSeason.split('/');
      this.gameState.currentSeason = `${nextYear}/${parseInt(nextYear) + 1}`;
    }
    
    await this.saveGameState();
  }

  public async setWeek(week: number): Promise<void> {
    this.gameState.currentWeek = week;
    await this.saveGameState();
  }

  public async setTransferWindow(status: 'open' | 'closed'): Promise<void> {
    this.gameState.transferWindow = status;
    await this.saveGameState();
  }

  public getCurrentWeek(): number {
    return this.gameState.currentWeek;
  }

  public getCurrentSeason(): string {
    return this.gameState.currentSeason;
  }

  public getTransferWindow(): 'open' | 'closed' {
    return this.gameState.transferWindow;
  }

  public getGameDate(): Date {
    return new Date(this.gameState.gameDate);
  }
}

export default GameStateService; 