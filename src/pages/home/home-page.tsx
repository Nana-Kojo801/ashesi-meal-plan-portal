import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchHistory } from '../../api';
import { todayISO, getGreeting, fmtAmount } from '../../lib/utils';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { RecentActivity } from './components/recent-activity';
import type { HistoryItem } from '../../types';

export function HomePage() {
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

  const spentToday = todayHistory.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const recentItems = [...todayHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  if (loading && !balanceData) {
    return <div className="home-grid" style={{ minHeight: 560, opacity: .55 }} aria-label="Loading dashboard" />;
  }

  if (error && !balanceData) {
    return (
      <div className="empty-state">
        <strong>Failed to load your meal plan</strong>
        <div style={{ marginTop: 6 }}>{error}</div>
        <button className="primary-button" onClick={retryBalance} style={{ marginTop: 18 }}>Try again</button>
      </div>
    );
  }

  if (!balanceData) return null;

  const dailyLimit = balanceData.daily_spending_limit;
  const dailyBalance = Math.max(0, dailyLimit - spentToday);
  const remaining = dailyLimit > 0 ? Math.min(100, Math.max(0, (dailyBalance / dailyLimit) * 100)) : 0;

  return (
    <div className="page home-grid">
      <motion.section
        className="balance-stage red-plane"
        initial={{ opacity: 0, scale: .985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div>
          <div className="home-greeting">{getGreeting()}</div>
          <h1 className="home-name">{balanceData.firstname}</h1>
        </div>
        <div className="balance-main">
          <motion.div
            key={dailyBalance}
            className="balance-value display-number"
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 170, damping: 22 }}
          >
            GHS {fmtAmount(dailyBalance)}
          </motion.div>
          <div className="balance-label">Available today</div>
          <div className="balance-progress"><div style={{ width: `${remaining}%` }} /></div>
          <div className="balance-limit">GHS {fmtAmount(dailyLimit)} daily limit</div>
        </div>
        <div className="home-facts">
          <motion.div className="home-fact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}>
            <strong>GHS {fmtAmount(spentToday)}</strong>
            <span>Spent today</span>
          </motion.div>
          <motion.div className="home-fact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .36 }}>
            <strong>GHS {fmtAmount(balanceData.amount)}</strong>
            <span>Total loaded</span>
          </motion.div>
        </div>
      </motion.section>
      <RecentActivity items={recentItems} isLoading={isHistoryLoading} />
    </div>
  );
}
