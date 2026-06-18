import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../../api';
import { HistorySkeleton } from '../../components/skeleton';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { useAnalytics, nDaysAgo, todayStr } from './hooks/use-analytics';
import { AnalyticsStats } from './components/analytics-stats';
import { WeeklyComparison } from './components/weekly-comparison';
import { DailyTrendChart } from './components/daily-trend-chart';
import { CafeRanking } from './components/cafe-ranking';
import { TopItems } from './components/top-items';
import { DayOfWeekChart } from './components/day-of-week-chart';
import { TimeOfDay } from './components/time-of-day';
import { MoreInsights } from './components/more-insights';
import type { HistoryItem } from '../../types';

export function ReportsPage() {
  const { balanceData } = useAppContext();
  const { studentId } = useSessionStore();

  const endDate = todayStr();
  const startDate = nDaysAgo(59);

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId!, startDate, endDate),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useAnalytics(history, balanceData);

  if (isLoading) return <HistorySkeleton />;

  if (!stats || stats.totalTx < 3) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          border: '1px dashed #ECE0D4',
          borderRadius: 20,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Not enough data yet</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 6 }}>
          Make a few more purchases and check back.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
      >
        <h1
          style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}
        >
          Analytics
        </h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>
          Last 30 days of spending, visualised.
        </div>
      </motion.div>

      <AnalyticsStats stats={stats} />
      <WeeklyComparison stats={stats} />
      <DailyTrendChart data={stats.dailyTrend} />
      <CafeRanking cafes={stats.cafes} />
      <TopItems items={stats.top5BySpend} />
      <DayOfWeekChart data={stats.dayOfWeek} peakDowIdx={stats.peakDowIdx} />
      <TimeOfDay
        morning={stats.morning}
        afternoon={stats.afternoon}
        evening={stats.evening}
        total={stats.todTotal}
      />
      <MoreInsights stats={stats} />
    </div>
  );
}
