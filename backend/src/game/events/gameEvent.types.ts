import { GameDate } from '../types/date.types';

export type GameEventType =
  | 'DAY_START'
  | 'DAY_END'
  | 'WEEK_START'
  | 'WEEK_END'
  | 'MONTH_START'
  | 'MONTH_END'
  | 'SEASON_START'
  | 'SEASON_END'
  | 'MATCH_DAY'
  | 'TRANSFER_WINDOW_OPEN'
  | 'TRANSFER_WINDOW_CLOSE'
  | 'TRAINING_COMPLETE'
  | 'PLAYER_INJURY'
  | 'PLAYER_RECOVERY'
  | 'NEWS_ITEM';

export interface GameEvent {
  id: string;
  type: GameEventType;
  date: GameDate;
  data: Record<string, any>;
  processed: boolean;
  createdAt: Date;
}

export interface GameEventHandlers {
  [key: string]: (event: GameEvent) => Promise<void> | void;
}

export interface ScheduledEvent extends GameEvent {
  handler: (event: GameEvent) => Promise<void> | void;
  recurring: boolean;
  intervalDays?: number;
}

export interface EventSubscription {
  eventType: GameEventType;
  callback: (event: GameEvent) => void;
  id: string;
}
