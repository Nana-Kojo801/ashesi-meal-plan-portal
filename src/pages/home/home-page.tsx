import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchHistory } from '../../api';
import { todayISO, getGreeting, fmtMoney, longDate } from '../../lib/utils';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { useSpendingHistory } from '../../hooks/use-spending-history';
import { useAnalytics } from '../reports/hooks/use-analytics';
import { BalanceHero } from './components/balance-hero';
import { StatTiles } from './components/stat-tiles';
import { WeekCard } from './components/week-card';
import { HabitsCard } from './components/habits-card';
import { RecentActivity } from './components/recent-activity';
import { DashboardSkeleton } from '../../components/skeleton';
import { rise, stagger, tapScale, useEntrance } from '../../lib/motion';
import type { HistoryItem } from '../../types';

export function HomePage() {
  const entrance = useEntrance();
  const { balanceData, loadingBalance: loading, balanceError: error, retryBalance } = useAppContext();
  const { studentId } = useSessionStore();
  const today = todayISO();

  const historyCacheKey = `todayHistory_${studentId ?? ''}_${today}`;
  const historyEnabled = !!balanceData && !!studentId;
  const { data: todayHistory = [], isLoading: isHistoryLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, today, today],
    queryFn: () => fetchHistory(studentId!, today, today),
    enabled: historyEnabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    initialData: () => {
      try {
        const raw = localStorage.getItem(historyCacheKey);
        return raw ? (JSON.parse(raw) as HistoryItem[]) : undefined;
      } catch {
        return undefined;
      }
    },
    initialDataUpdatedAt: 0,
  });

  useEffect(() => {
    if (!historyEnabled || isHistoryLoading) return;
    try {
      localStorage.setItem(historyCacheKey, JSON.stringify(todayHistory));
    } catch {
      // Storage can be unavailable in private browsing; live data still works.
    }
  }, [historyEnabled, isHistoryLoading, todayHistory, historyCacheKey]);

  const { data: history = [], isLoading: isStatsLoading } = useSpendingHistory();
  const stats = useAnalytics(history, balanceData);

  if (loading && !balanceData) {
    return <DashboardSkeleton />;
  }

  if (error && !balanceData) {
    return (
      <div className="page">
        <div className="card empty-state">
          <strong>Couldn’t load your meal plan</strong>
          <p>{error}</p>
          <motion.button className="button primary" onClick={retryBalance} whileTap={tapScale}>Try again</motion.button>
        </div>
      </div>
    );
  }

  if (!balanceData) return <DashboardSkeleton />;

  const spentToday = todayHistory.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const recentItems = [...todayHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const dailyLimit = balanceData.daily_spending_limit;

  return (
    <motion.div className="page" variants={stagger} initial={entrance} animate="show">
      <motion.header className="page-header" variants={rise}>
        <div>
          <p className="page-eyebrow">{longDate()}</p>
          <h1 className="page-title small">{getGreeting()}, {balanceData.firstname}</h1>
        </div>
      </motion.header>

      <div className="columns home-columns">
        <div className="column-main">
          <motion.div variants={rise}>
            <BalanceHero
              dailyLimit={dailyLimit}
              spentToday={spentToday}
              purchasesToday={todayHistory.length}
              totalLoaded={balanceData.amount}
            />
          </motion.div>
          {(isStatsLoading || stats) && (
            <motion.div variants={rise} className="order-stats">
              <StatTiles stats={stats} loading={isStatsLoading} />
            </motion.div>
          )}
          <motion.div variants={rise} className="order-today">
            <RecentActivity items={recentItems} isLoading={isHistoryLoading} total={fmtMoney(spentToday)} />
          </motion.div>
        </div>
        {stats && (
          <div className="column-side">
            <motion.div variants={rise} className="order-week">
              <WeekCard days={stats.dailyTrend.slice(-7)} dailyLimit={dailyLimit} />
            </motion.div>
            <motion.div variants={rise} className="order-habits">
              <HabitsCard stats={stats} />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
