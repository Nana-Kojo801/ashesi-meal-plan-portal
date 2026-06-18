import type { HistoryItem } from '../types';

const BASE = 'https://api.mplan.ashesi.edu.gh/api';

export async function fetchHistory(
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<HistoryItem[]> {
  const res = await fetch(
    `${BASE}/getSubscriberHistory/${encodeURIComponent(studentId)}/${startDate}/${endDate}`,
  );
  if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as HistoryItem[]) : [];
}
