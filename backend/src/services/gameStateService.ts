import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LocalGameState {
  currentWeek: number;
  currentSeason: string;
  transferWindow: 'open' | 'closed';
  gameDate: Date;
}

class GameStateService {
  private static instance: GameStateService;
  private gameState: LocalGameState = {
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
      const state = await prisma.gameState.findFirst();
      if (state) {
        // Map from Prisma schema to local state
        const gameDate = new Date(state.currentDate);
        const weekOfYear = Math.ceil((gameDate.getTime() - new Date(gameDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

        this.gameState = {
          currentWeek: weekOfYear,
          currentSeason: `${state.season}/${state.season + 1}`,
          transferWindow: state.phase === 'transfer_window' ? 'open' : 'closed',
          gameDate: gameDate
        };
      } else {
        await this.saveGameState();
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }

  private async saveGameState() {
    try {
      const seasonYear = parseInt(this.gameState.currentSeason.split('/')[0]) || 2024;

      await prisma.gameState.upsert({
        where: { id: 'main' },
        update: {
          currentDate: this.gameState.gameDate.toISOString(),
          season: seasonYear,
          phase: this.gameState.transferWindow === 'open' ? 'transfer_window' : 'regular_season',
          isPaused: false
        },
        create: {
          id: 'main',
          currentDate: this.gameState.gameDate.toISOString(),
          season: seasonYear,
          phase: 'regular_season',
          isPaused: false,
          gameSpeed: 1,
          activeCompetitions: '[]',
          activeClubs: '[]',
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  public getGameState(): LocalGameState {
    return { ...this.gameState };
  }

  public async advanceWeek(): Promise<void> {
    this.gameState.currentWeek++;
    this.gameState.gameDate = new Date(this.gameState.gameDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Update transfer window status based on week
    if ((this.gameState.currentWeek >= 8 && this.gameState.currentWeek <= 12) ||
      (this.gameState.currentWeek >= 20 && this.gameState.currentWeek <= 24)) {
      this.gameState.transferWindow = 'open';
    } else {
      this.gameState.transferWindow = 'closed';
    }

    if (this.gameState.currentWeek > 38) {
      this.gameState.currentWeek = 1;
      const [year] = this.gameState.currentSeason.split('/');
      const nextYear = parseInt(year) + 1;
      this.gameState.currentSeason = `${nextYear}/${nextYear + 1}`;
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