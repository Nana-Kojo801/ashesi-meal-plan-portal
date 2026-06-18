import { useMemo } from 'react';
import type { HistoryItem } from '../../../types';
import type { BalanceData } from '../../../types';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** ISO date string N days before today. */
export function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function firstOfMonth(monthOffset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset, 1);
  return d.toISOString().split('T')[0];
}

export function lastOfMonth(monthOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset + 1, 0);
  return d.toISOString().split('T')[0];
}

export function shortDate(iso: string): string {
  const [, m, day] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

export type AnalyticsStats = ReturnType<typeof computeAnalytics>;

function computeAnalytics(history: HistoryItem[], balanceData: BalanceData | null) {
  const txCost = (tx: HistoryItem) => tx.cost * tx.quantity;
  const last30Start = nDaysAgo(29);
  const last30 = history.filter((tx) => tx.date.slice(0, 10) >= last30Start);
  if (!last30.length) return null;

  // Daily spend map for the last 30 days
  const byDay: Record<string, number> = {};
  last30.forEach((tx) => {
    const d = tx.date.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + txCost(tx);
  });

  const dailyTrend: { date: string; label: string; spend: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = nDaysAgo(i);
    dailyTrend.push({ date: d, label: shortDate(d), spend: Math.round((byDay[d] ?? 0) * 100) / 100 });
  }

  const totalSpent = last30.reduce((s, tx) => s + txCost(tx), 0);
  const activeDays = Object.values(byDay).filter((v) => v > 0).length || 1;
  const avgPerActiveDay = totalSpent / activeDays;
  const avgPerDay = totalSpent / 30;
  const avgPerMeal = last30.length > 0 ? totalSpent / last30.length : 0;

  // Weekly comparison: this 7 days vs previous 7
  const thisWeekStart = nDaysAgo(6);
  const lastWeekStart = nDaysAgo(13);
  const thisWeekSpend = last30
    .filter((tx) => tx.date.slice(0, 10) >= thisWeekStart)
    .reduce((s, tx) => s + txCost(tx), 0);
  const lastWeekSpend = last30
    .filter((tx) => {
      const d = tx.date.slice(0, 10);
      return d >= lastWeekStart && d < thisWeekStart;
    })
    .reduce((s, tx) => s + txCost(tx), 0);
  const weeklyDiff = thisWeekSpend - lastWeekSpend;
  const weeklyPct = lastWeekSpend > 0 ? Math.abs(Math.round((weeklyDiff / lastWeekSpend) * 100)) : null;

  // Café breakdown
  const cafeMap: Record<string, { visits: number; spend: number }> = {};
  last30.forEach((tx) => {
    const c = tx.transaction_point || 'Unknown';
    if (!cafeMap[c]) cafeMap[c] = { visits: 0, spend: 0 };
    cafeMap[c].visits += 1;
    cafeMap[c].spend += txCost(tx);
  });
  const cafes = Object.entries(cafeMap)
    .map(([name, v]) => ({ name, ...v, spend: Math.round(v.spend) }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  // Item breakdown
  const itemMap: Record<string, { qty: number; spend: number; unit: number }> = {};
  last30.forEach((tx) => {
    if (!itemMap[tx.name]) itemMap[tx.name] = { qty: 0, spend: 0, unit: tx.cost };
    itemMap[tx.name].qty += tx.quantity;
    itemMap[tx.name].spend += txCost(tx);
  });
  const items = Object.entries(itemMap).map(([name, v]) => ({ name, ...v }));
  const top5BySpend = [...items].sort((a, b) => b.spend - a.spend).slice(0, 5);
  const mostFrequent = [...items].sort((a, b) => b.qty - a.qty)[0] ?? null;
  const mostExpensive = [...items].sort((a, b) => b.unit - a.unit)[0] ?? null;
  const varietyScore = items.length;
  const oneTimeTries = items.filter((i) => i.qty === 1).length;

  // Day-of-week spend
  const dowMap = Array(7).fill(0) as number[];
  last30.forEach((tx) => {
    const dow = new Date(tx.date.slice(0, 10) + 'T00:00:00').getDay();
    dowMap[dow] += txCost(tx);
  });
  const dayOfWeek = DAYS.map((label, i) => ({ label, spend: Math.round(dowMap[i]) }));
  const peakDowIdx = dowMap.indexOf(Math.max(...dowMap));

  // Time-of-day spend
  let morning = 0, afternoon = 0, evening = 0;
  last30.forEach((tx) => {
    const h = new Date(tx.date).getHours();
    const v = txCost(tx);
    if (h < 12) morning += v;
    else if (h < 17) afternoon += v;
    else evening += v;
  });
  const todTotal = morning + afternoon + evening || 1;

  // Month-over-month comparison
  const thisStart = firstOfMonth(0);
  const lastStart = firstOfMonth(1);
  const lastEnd = lastOfMonth(1);
  const thisMonth = history
    .filter((tx) => tx.date.slice(0, 10) >= thisStart)
    .reduce((s, tx) => s + txCost(tx), 0);
  const lastMonth = history
    .filter((tx) => {
      const d = tx.date.slice(0, 10);
      return d >= lastStart && d <= lastEnd;
    })
    .reduce((s, tx) => s + txCost(tx), 0);

  // Savings streak: consecutive days with zero spend
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    if ((byDay[nDaysAgo(i)] ?? 0) > 0) break;
    streak++;
  }

  const dailyLimit = balanceData?.daily_spending_limit ?? 0;
  const limitPct = dailyLimit > 0 ? Math.round((avgPerDay / dailyLimit) * 100) : null;
  const daysUnderBudget =
    dailyLimit > 0
      ? Object.values(byDay).filter((v) => v > 0 && v <= dailyLimit).length
      : null;

  const peakEntry = (
    Object.entries(byDay).sort(([, a], [, b]) => b - a)[0] as [string, number] | undefined
  );

  return {
    totalSpent,
    avgPerActiveDay,
    avgPerMeal,
    totalTx: last30.length,
    activeDays,
    thisWeekSpend,
    lastWeekSpend,
    weeklyDiff,
    weeklyPct,
    dailyTrend,
    cafes,
    dayOfWeek,
    peakDowIdx,
    items,
    top5BySpend,
    mostFrequent,
    mostExpensive,
    varietyScore,
    oneTimeTries,
    morning,
    afternoon,
    evening,
    todTotal,
    thisMonth,
    lastMonth,
    streak,
    limitPct,
    daysUnderBudget,
    dailyLimit,
    peakEntry,
  };
}

export function useAnalytics(
  history: HistoryItem[],
  balanceData: BalanceData | null,
): AnalyticsStats | null {
  return useMemo(() => {
    if (!history.length) return null;
    return computeAnalytics(history, balanceData);
  }, [history, balanceData]);
}
