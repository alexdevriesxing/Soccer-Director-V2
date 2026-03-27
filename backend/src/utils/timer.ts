/**
 * Cross-platform timer utility that works in both browser and Node.js
 */

// Simple type for timer ID
export type TimerID = ReturnType<typeof globalThis.setTimeout>;

// Use the global setTimeout and clearTimeout directly
const safeSetTimeout = (callback: () => void, ms: number): TimerID => {
  return globalThis.setTimeout(callback, ms);
};

const safeClearTimeout = (timerId: TimerID | null): void => {
  if (timerId !== null) {
    globalThis.clearTimeout(timerId);
  }
};

/**
 * Creates a timeout and returns a timer ID
 */
export const createTimeout = (callback: () => void, ms: number): TimerID => {
  return safeSetTimeout(callback, ms);
};

/**
 * Clears a timeout using the timer ID
 */
export const clearTimer = (timerId: TimerID | null): void => {
  safeClearTimeout(timerId);
};
