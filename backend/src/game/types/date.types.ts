import { addDays, format, isBefore, isEqual } from 'date-fns';

export interface GameDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export const gameDateToString = (date: GameDate): string => {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
};

export const stringToGameDate = (dateStr: string): GameDate => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
};

export const realDateToGameDate = (date: Date): GameDate => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
});

export const gameDateToDate = (gameDate: GameDate): Date => {
  return new Date(gameDate.year, gameDate.month - 1, gameDate.day);
};

export const addGameDays = (date: GameDate, days: number): GameDate => {
  const jsDate = gameDateToDate(date);
  const newDate = addDays(jsDate, days);
  return realDateToGameDate(newDate);
};

export const isGameDateBefore = (date1: GameDate, date2: GameDate): boolean => {
  const d1 = gameDateToDate(date1);
  const d2 = gameDateToDate(date2);
  return isBefore(d1, d2) || isEqual(d1, d2);
};

export const formatGameDate = (date: GameDate, formatStr = 'yyyy-MM-dd'): string => {
  return format(gameDateToDate(date), formatStr);
};

export const getDaysBetween = (startDate: GameDate, endDate: GameDate): number => {
  const start = gameDateToDate(startDate);
  const end = gameDateToDate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isSameGameDate = (date1: GameDate, date2: GameDate): boolean => {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day
  );
};
