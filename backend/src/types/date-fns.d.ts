declare module 'date-fns' {
  export function addDays(date: Date | number, amount: number): Date;
  export function format(date: Date | number, formatStr: string): string;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function isEqual(leftDate: Date | number, rightDate: Date | number): boolean;
}
