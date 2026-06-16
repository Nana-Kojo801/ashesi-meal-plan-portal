import type { BalanceData, HistoryItem } from './types';

const BASE = 'https://api.mplan.ashesi.edu.gh/api';

export async function fetchBalance(studentId: string): Promise<BalanceData> {
  const res = await fetch(`${BASE}/getSubscriberCurrentBalance/${studentId}`);
  if (!res.ok) throw new Error(`Failed to load balance (${res.status})`);
  return res.json() as Promise<BalanceData>;
}

export async function fetchHistory(
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<HistoryItem[]> {
  const res = await fetch(
    `${BASE}/getSubscriberHistory/${studentId}/${startDate}/${endDate}`,
  );
  if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
  const data = await res.json() as unknown;
  return Array.isArray(data) ? (data as HistoryItem[]) : [];
}

export async function resetPinApi(studentId: string): Promise<void> {
  const res = await fetch(`${BASE}/resetPin/${studentId}`);
  if (!res.ok) throw new Error(`Failed to reset PIN (${res.status})`);
}
