import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { GameState as DomainGameState, GameSpeed, GamePhase, GameStateUpdate } from '../types/gameState.types';
import { GameDate, gameDateToString, addGameDays } from '../types/date.types';
import { GameEvent, GameEventType, ScheduledEvent } from '../events/gameEvent.types';
import { GameState } from '../../types/prisma-extensions';
import { TimerID, createTimeout, clearTimer } from '../../utils/timer';

export class GameStateService {
  private static instance: GameStateService;
  private prisma: PrismaClient;
  private gameState: DomainGameState | null = null;
  private eventHandlers: Map<GameEventType, Array<(event: GameEvent) => void>> = new Map();
  private scheduledEvents: ScheduledEvent[] = [];
  private isSimulating = false;
  private simulationInterval: TimerID | null = null;
  private simulationSpeed = 1000;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public static getInstance(prisma: PrismaClient): GameStateService {
    if (!GameStateService.instance) {
      GameStateService.instance = new GameStateService(prisma);
    }
    return GameStateService.instance;
  }

  public async initialize(): Promise<void> {
    let gameState = await this.prisma.gameState.findFirst();

    if (!gameState) {
      const currentDate = this.getCurrentDate();
      this.gameState = await this.createNewGameState(currentDate);
    } else {
      this.gameState = this.mapDbGameState(gameState as any);
    }
    this.scheduleRecurringEvents();
  }

  private async createNewGameState(currentDate: GameDate): Promise<DomainGameState> {
    const newState: Omit<DomainGameState, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
      id: uuidv4(),
      currentDate,
      gameSpeed: GameSpeed.NORMAL,
      isPaused: true,
      season: 2024,
      phase: GamePhase.PRE_SEASON,
      activeCompetitions: [],
      activeClubs: [],
      userClubId: null,
      lastSimulatedDate: null,
      version: '1.0.0',
    };

    const createdState = await this.prisma.gameState.create({
      data: {
        ...newState,
        currentDate: gameDateToString(newState.currentDate),
        lastSimulatedDate: newState.lastSimulatedDate ? gameDateToString(newState.lastSimulatedDate) : null,
        activeCompetitions: JSON.stringify(newState.activeCompetitions),
        activeClubs: JSON.stringify(newState.activeClubs),
        phase: newState.phase as string,
        // gameSpeed is number in DB vs Enum in domain?
        gameSpeed: typeof newState.gameSpeed === 'number' ? newState.gameSpeed : 1000,
      } as any, // Cast to any to bypass strict type check for now if schema differs
    });

    return {
      ...createdState,
      currentDate: this.stringToGameDate(createdState.currentDate),
      lastSimulatedDate: createdState.lastSimulatedDate ? this.stringToGameDate(createdState.lastSimulatedDate) : null,
      createdAt: createdState.createdAt,
      updatedAt: createdState.updatedAt,
      phase: createdState.phase as GamePhase,
      activeCompetitions: typeof createdState.activeCompetitions === 'string' ? JSON.parse(createdState.activeCompetitions) : createdState.activeCompetitions,
      activeClubs: typeof createdState.activeClubs === 'string' ? JSON.parse(createdState.activeClubs) : createdState.activeClubs,
      gameSpeed: createdState.gameSpeed as unknown as GameSpeed
    };
  }

  public getState(): DomainGameState | null {
    return this.gameState ? { ...this.gameState } : null;
  }

  public async updateState(updates: GameStateUpdate): Promise<DomainGameState> {
    if (!this.gameState) throw new Error('Game state not initialized');

    const updatedState = { ...this.gameState, ...updates, updatedAt: new Date() };

    await this.prisma.gameState.update({
      where: { id: this.gameState.id },
      data: {
        ...updates,
        currentDate: updates.currentDate ? gameDateToString(updates.currentDate) : undefined,
        updatedAt: new Date(),
      },
    });

    this.gameState = updatedState;
    return updatedState;
  }

  public async advanceDay(): Promise<void> {
    if (!this.gameState) return;

    const currentDate = { ...this.gameState.currentDate };
    const newDate = addGameDays(currentDate, 1);

    await this.updateState({ currentDate: newDate });
    await this.triggerEvent({ type: 'DAY_END', date: currentDate, data: {} } as GameEvent);
    await this.triggerEvent({ type: 'DAY_START', date: newDate, data: {} } as GameEvent);
    await this.checkScheduledEvents(newDate);
  }

  public subscribe(eventType: GameEventType, callback: (event: GameEvent) => void): string {
    const subscriptionId = uuidv4();
    const handlers = this.eventHandlers.get(eventType) || [];
    this.eventHandlers.set(eventType, [...handlers, callback]);
    return subscriptionId;
  }

  public async triggerEvent(event: GameEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  public startSimulation(speed: GameSpeed = GameSpeed.NORMAL): void {
    if (this.isSimulating) return;

    this.updateState({ gameSpeed: speed, isPaused: false });
    this.isSimulating = true;
    this.simulationSpeed = this.getSpeedInMs(speed);

    // Start the simulation loop
    const simulate = () => {
      if (this.gameState && !this.gameState.isPaused) {
        this.simulateDay().then(() => {
          if (this.isSimulating) {
            this.simulationInterval = createTimeout(simulate, this.simulationSpeed);
          }
        });
      } else if (this.isSimulating) {
        this.simulationInterval = createTimeout(simulate, this.simulationSpeed);
      }
    };

    this.simulationInterval = createTimeout(simulate, this.simulationSpeed);
  }

  // Timer utility methods are now used directly

  public pauseSimulation(): void {
    if (!this.isSimulating) return;

    this.updateState({ isPaused: true });

    if (this.simulationInterval) {
      clearTimer(this.simulationInterval);
      this.simulationInterval = null;
    }

    this.isSimulating = false;
  }

  private getSpeedInMs(speed: GameSpeed): number {
    switch (speed) {
      case GameSpeed.SLOW: return 2000;
      case GameSpeed.NORMAL: return 1000;
      case GameSpeed.FAST: return 500;
      case GameSpeed.VERY_FAST: return 250;
      default: return 1000;
    }
  }

  private async simulateDay(): Promise<void> {
    if (!this.gameState) return;

    // Update the game date
    const newDate = addGameDays(this.gameState.currentDate, 1);
    await this.updateState({ currentDate: newDate });

    // Process any events scheduled for this day
    await this.processScheduledEvents(newDate);
  }

  private async processScheduledEvents(date: GameDate): Promise<void> {
    const today = gameDateToString(date);
    const eventsToProcess = this.scheduledEvents.filter(
      event => gameDateToString(event.date) === today
    );

    for (const event of eventsToProcess) {
      await this.triggerEvent(event);
      // Remove the event if it's not recurring
      if (!event.recurring) {
        this.scheduledEvents = this.scheduledEvents.filter(e => e !== event);
      }
    }
  }

  private scheduleRecurringEvents(): void {
    // Schedule daily events
    const event: ScheduledEvent = {
      id: uuidv4(),
      type: 'DAY_START',
      date: this.gameState?.currentDate || this.getCurrentDate(),
      data: {},
      processed: false,
      createdAt: new Date(),
      handler: async () => {
        // Handle day start logic
      },
      recurring: true,
      intervalDays: 1,
    };
    this.scheduledEvents.push(event);
  }

  private async checkScheduledEvents(date: GameDate): Promise<void> {
    const events = this.scheduledEvents.filter(e =>
      e.date.year === date.year &&
      e.date.month === date.month &&
      e.date.day === date.day
    );

    for (const event of events) {
      await this.triggerEvent(event);
      if (event.recurring && event.intervalDays) {
        event.date = addGameDays(event.date, event.intervalDays);
      }
    }
  }

  private getCurrentDate(): GameDate {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  private mapDbGameState(dbState: GameState): DomainGameState {
    return {
      ...dbState,
      currentDate: this.stringToGameDate(dbState.currentDate),
      lastSimulatedDate: dbState.lastSimulatedDate ? this.stringToGameDate(dbState.lastSimulatedDate) : null,
      phase: dbState.phase as GamePhase,
      activeCompetitions: typeof dbState.activeCompetitions === 'string' ? JSON.parse(dbState.activeCompetitions) : dbState.activeCompetitions,
      activeClubs: typeof dbState.activeClubs === 'string' ? JSON.parse(dbState.activeClubs) : dbState.activeClubs,
      gameSpeed: dbState.gameSpeed as unknown as GameSpeed // Cast number to enum
    };
  }

  private stringToGameDate(dateStr: string): GameDate {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month, day };
  }
}
