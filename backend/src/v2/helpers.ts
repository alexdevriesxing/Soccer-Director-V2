import crypto from 'crypto';

export function addDays(base: Date, days: number): Date {
  const next = new Date(base.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export function chunked<T>(items: T[], chunkSize = 250): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function normalizeForHash(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForHash(item));
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, normalizeForHash(nestedValue)]);
    return Object.fromEntries(sortedEntries);
  }

  return value;
}

export function hashJson(value: unknown): string {
  const payload = JSON.stringify(normalizeForHash(value));
  return crypto.createHash('sha1').update(payload).digest('hex');
}

export function hashJsonLegacy(value: unknown): string {
  const topLevelKeys = value && typeof value === 'object'
    ? Object.keys(value as object).sort()
    : undefined;
  const payload = JSON.stringify(value, topLevelKeys);
  return crypto.createHash('sha1').update(payload).digest('hex');
}

export function stringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function shuffled<T>(items: T[], random: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
