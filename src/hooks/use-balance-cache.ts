import type { BalanceData } from '../types';

const CACHE_KEY = 'ashesiMealsBalance';
/** Cache TTL: 1 hour. Avoids a network round-trip on every app open. */
export const BALANCE_CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
  data: BalanceData;
  updatedAt: number;
}

export function readBalanceCache(studentId: string): CacheEntry | undefined {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${studentId}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return undefined;
  }
}

export function writeBalanceCache(studentId: string, data: BalanceData): void {
  try {
    const entry: CacheEntry = { data, updatedAt: Date.now() };
    localStorage.setItem(`${CACHE_KEY}_${studentId}`, JSON.stringify(entry));
  } catch {
    // Silently ignore quota errors — cache is a best-effort optimisation.
  }
}

export function clearBalanceCache(studentId: string): void {
  localStorage.removeItem(`${CACHE_KEY}_${studentId}`);
}
