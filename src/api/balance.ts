import type { BalanceData } from '../types';

const BASE = 'https://api.mplan.ashesi.edu.gh/api';

type ApiResponse = { status: 'fail' } | BalanceData;

export async function fetchBalance(studentId: string): Promise<BalanceData> {
  const res = await fetch(`${BASE}/getSubscriberCurrentBalance/${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error(`Failed to load balance (${res.status})`);
  const data = (await res.json()) as ApiResponse;
  if ('status' in data && data.status === 'fail') {
    throw new Error('Student ID not found. Please check and try again.');
  }
  return data as BalanceData;
}
