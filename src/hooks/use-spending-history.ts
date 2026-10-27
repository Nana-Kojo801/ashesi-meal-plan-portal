import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../api';
import { useSessionStore } from '../stores/session-store';
import { firstOfMonth, nDaysAgo, todayStr } from '../pages/reports/hooks/use-analytics';
import type { HistoryItem } from '../types';

/**
 * History covering the last 30 days, the week before, and all of last month,
 * shared (same query key) by Home and Insights so it is fetched once.
 */
export function useSpendingHistory() {
  const { studentId } = useSessionStore();
  const sixtyDaysAgo = nDaysAgo(59);
  const lastMonthStart = firstOfMonth(1);
  const startDate = lastMonthStart < sixtyDaysAgo ? lastMonthStart : sixtyDaysAgo;
  const endDate = todayStr();

  return useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId!, startDate, endDate),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
