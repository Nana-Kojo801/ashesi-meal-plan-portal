import type { BalanceData } from '../types';

const BASE = 'https://api.mplan.ashesi.edu.gh/api';

interface RawSubscriber {
  id: number;
  firstname: string;
  lastname: string;
  status: string;
  amount: number;
  daily_spending_limit: number;
  meal_plan_name: string;
}

export async function fetchBalance(studentId: string): Promise<BalanceData> {
  const res = await fetch(`${BASE}/getSubscriber/${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error(`Failed to load balance (${res.status})`);
  const data = (await res.json()) as Record<string, unknown>;
  if (!data.id || !data.firstname) {
    throw new Error('Student ID not found. Please check and try again.');
  }
  const raw = data as unknown as RawSubscriber;
  return {
    firstname: raw.firstname,
    lastname: raw.lastname,
    amount: raw.amount,
    daily_spending_limit: raw.daily_spending_limit,
    meal_plan_name: raw.meal_plan_name,
    subscriber_status: raw.status,
    // Placeholder — home-page computes the real value from today's history.
    current_balance: raw.daily_spending_limit,
  };
}
