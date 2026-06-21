import { motion } from 'framer-motion';
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CreditCard, Clock, Gauge, RefreshCw } from 'lucide-react';
import { DashboardSkeleton } from '../../components/skeleton';
import { fetchHistory } from '../../api';
import { todayISO, getGreeting, fmtAmount } from '../../lib/utils';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { BalanceRingCard } from './components/balance-ring-card';
import { StatCard } from './components/stat-cards';
import { RecentActivity } from './components/recent-activity';
import type { HistoryItem } from '../../types';

export function HomePage() {
  const { balanceData, loadingBalance: loading, balanceError: error, retryBalance, isMobile } =
    useAppContext();
  const { studentId } = useSessionStore();
  const queryClient = useQueryClient();
  const today = todayISO();
  const isFetchingBalance = useIsFetching({ queryKey: ['balance', studentId] }) > 0;

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['balance', studentId] });
    void queryClient.invalidateQueries({ queryKey: ['history', studentId] });
  };

  const historyCacheKey = `todayHistory_${studentId ?? ''}_${today}`;
  const historyEnabled  = !!balanceData && !!studentId;

  const { data: todayHistory = [], isLoading: isHistoryLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, today, today],
    queryFn: () => fetchHistory(studentId!, today, today),
    enabled: historyEnabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    // Show cached items immediately while fresh fetch runs in background
    initialData: () => {
      try {
        const raw = localStorage.getItem(historyCacheKey);
        return raw ? (JSON.parse(raw) as HistoryItem[]) : undefined;
      } catch { return undefined; }
    },
    initialDataUpdatedAt: 0, // always stale → background refetch triggers immediately
  });

  // Persist fresh history so next open shows cached data
  useEffect(() => {
    if (historyEnabled && !isHistoryLoading && todayHistory.length >= 0) {
      try { localStorage.setItem(historyCacheKey, JSON.stringify(todayHistory)); } catch {}
    }
  }, [historyEnabled, isHistoryLoading, todayHistory, historyCacheKey]);

  const fetching = isFetchingBalance || isHistoryLoading;
  const spentToday = todayHistory.reduce((s, x) => s + x.cost * x.quantity, 0);

  if (loading && !balanceData) return <DashboardSkeleton isMobile={isMobile} />;

  if (error && !balanceData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Failed to load</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4 }}>{error}</div>
        <button
          onClick={retryBalance}
          style={{
            marginTop: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#D81E2C',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            padding: '12px 20px',
            borderRadius: 13,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  if (!balanceData) return null;

  const greeting = getGreeting();
  const firstName = balanceData.firstname;
  const dailyLimit = balanceData.daily_spending_limit;
  const totalBalance = balanceData.amount;
  const dailyBalance = Math.max(0, dailyLimit - spentToday);
  const fraction = dailyLimit > 0 ? dailyBalance / dailyLimit : 0;
  const ringSize = isMobile ? 132 : 200;
  const ringSW = isMobile ? 12 : 17;
  const recentItems = [...todayHistory]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6A63' }}>{greeting},</div>
          <h1
            style={{
              margin: '2px 0 0',
              fontSize: isMobile ? 25 : 30,
              fontWeight: 800,
              letterSpacing: '-1px',
              lineHeight: 1.05,
            }}
          >
            {firstName} 👋
          </h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={fetching}
          title="Refresh balance"
          style={{
            height: 38,
            borderRadius: 12,
            flexShrink: 0,
            marginTop: 2,
            background: '#fff',
            border: '1px solid #ECE0D4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0 14px',
            cursor: fetching ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px -4px rgba(110,30,18,.12)',
            transition: 'background .15s, border-color .15s',
          }}
        >
          <RefreshCw
            size={15}
            color={fetching ? '#D8BFA8' : '#7A6A63'}
            style={{ animation: fetching ? 'spin .7s linear infinite' : 'none', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: fetching ? '#D8BFA8' : '#7A6A63',
              fontFamily: 'inherit',
            }}
          >
            Refresh
          </span>
        </button>
      </motion.div>

      <BalanceRingCard
        dailyBalance={dailyBalance}
        dailyLimit={dailyLimit}
        spentToday={spentToday}
        fraction={fraction}
        ringSize={ringSize}
        ringSW={ringSW}
        isMobile={isMobile}
        fetching={fetching}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 14,
        }}
      >
        <StatCard
          icon={<CreditCard size={16} />}
          label="Total loaded"
          value={`GHS ${fmtAmount(totalBalance)}`}
          sub="on your meal plan"
          delay={0.1}
          fetching={fetching}
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Spent today"
          value={`GHS ${fmtAmount(spentToday)}`}
          sub={`${todayHistory.length} purchase${todayHistory.length !== 1 ? 's' : ''} today`}
          valueColor="#D81E2C"
          delay={0.17}
          fetching={fetching}
        />
        <StatCard
          icon={<Gauge size={16} />}
          label="Daily limit"
          value={`GHS ${fmtAmount(dailyLimit)}`}
          sub="resets at midnight"
          delay={0.24}
          fetching={fetching}
        />
      </div>

      <RecentActivity
        items={recentItems}
        isLoading={isHistoryLoading}
        fetching={fetching}
      />
    </div>
  );
}
