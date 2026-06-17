import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { CreditCard, Clock, Gauge, ArrowRight, RefreshCw } from 'lucide-react';
import { Ring } from '../components/Ring';
import { Skeleton, DashboardSkeleton } from '../components/Skeleton';
import { fetchHistory } from '../api';
import { todayISO, getGreeting, formatTime, dateLabel } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import type { HistoryItem } from '../types';

function FetchingOutline({ radius = 20 }: { radius?: number }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: 'rgba(240,227,215,0.45)', zIndex: 4, pointerEvents: 'none' }} />
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        <rect
          x="1" y="1" width="99.5%" height="99.5%"
          rx={radius} ry={radius}
          fill="none" stroke="#D81E2C" strokeWidth="3"
          pathLength="1"
          strokeDasharray="0.08 0.92"
          style={{ animation: 'marchSVG 1.4s linear infinite' }}
        />
      </svg>
    </>
  );
}

function StatCard({ icon, label, value, sub, valueColor, delay = 0, fetching = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
  delay?: number;
  fetching?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff', border: '1px solid #ECE0D4',
        borderRadius: 20, padding: '18px 20px',
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
        position: 'relative',
      }}
    >
      {fetching && <FetchingOutline radius={20} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7A6A63', fontSize: '12.5px', fontWeight: 700 }}>
        {icon} {label}
      </div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 30, fontWeight: 700, letterSpacing: '-1px', marginTop: 8,
        color: valueColor ?? '#1C1413',
      }}>{value}</div>
      <div style={{ fontSize: 12, color: '#7A6A63', fontWeight: 600, marginTop: 2 }}>{sub}</div>
    </motion.div>
  );
}

export function DashboardScreen() {
  const { studentId, balanceData, loadingBalance: loading, balanceError: error, retryBalance, isMobile } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = todayISO();
  const fetching = useIsFetching({ queryKey: ['balance', studentId] }) > 0;

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['balance', studentId] });
    void queryClient.invalidateQueries({ queryKey: ['history', studentId] });
  };

  const { data: todayHistory = [], isLoading: isHistoryLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, today, today],
    queryFn: () => fetchHistory(studentId, today, today),
    enabled: !!balanceData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (loading && !balanceData) return <DashboardSkeleton isMobile={isMobile} />;

  if (error && !balanceData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Failed to load</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4 }}>{error}</div>
        <button
          onClick={retryBalance}
          style={{
            marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#D81E2C', color: '#fff', fontWeight: 700, fontSize: 14,
            padding: '12px 20px', borderRadius: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
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
  const dailyBalance = balanceData.current_balance;
  const dailyLimit = balanceData.daily_spending_limit;
  const totalBalance = balanceData.amount;
  const spentToday = Math.max(0, dailyLimit - dailyBalance);
  const fraction = dailyLimit > 0 ? dailyBalance / dailyLimit : 0;
  const usedPct = Math.min(100, Math.round((spentToday / dailyLimit) * 100));
  const ringSize = isMobile ? 132 : 200;
  const ringSW = isMobile ? 12 : 17;
  const recent = [...todayHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6A63' }}>{greeting},</div>
          <h1 style={{ margin: '2px 0 0', fontSize: isMobile ? 25 : 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>
            {firstName} 👋
          </h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={fetching}
          title="Refresh balance"
          style={{
            height: 38, borderRadius: 12, flexShrink: 0, marginTop: 2,
            background: '#fff', border: '1px solid #ECE0D4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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
          <span style={{ fontSize: 13, fontWeight: 700, color: fetching ? '#D8BFA8' : '#7A6A63', fontFamily: 'inherit' }}>
            Refresh
          </span>
        </button>
      </motion.div>

      <div style={{ position: 'relative' }}>
        {fetching && <FetchingOutline radius={26} />}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{
            background: '#fff', border: '1px solid #ECE0D4', borderRadius: 26,
            boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)',
            padding: isMobile ? 24 : '30px 34px',
            display: 'flex', flexWrap: 'nowrap', alignItems: 'center',
            gap: isMobile ? 18 : 28,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(216,30,44,.10)', filter: 'blur(10px)' }} />
          <Ring size={ringSize} strokeWidth={ringSW} fraction={fraction} balance={dailyBalance} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#7A6A63' }}>
                You've used <b style={{ color: '#1C1413' }}>GHS {spentToday.toFixed(0)}</b> of your <b style={{ color: '#1C1413' }}>GHS {dailyLimit.toFixed(0)}</b> daily limit
              </div>
              <div style={{ marginTop: 10, height: 10, borderRadius: 99, background: '#F0E3D7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${usedPct}%`, borderRadius: 99, background: 'linear-gradient(90deg, #E0233A, #D81E2C)', transition: 'width .5s ease' }} />
              </div>
            </div>
            {!isMobile && (
              <button
                onClick={() => navigate('/history')}
                style={{
                  alignSelf: 'flex-start', marginTop: 2,
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#F2E7DC', color: '#1C1413', fontWeight: 700, fontSize: 13,
                  padding: '11px 16px', borderRadius: 13,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                View purchase history <ArrowRight size={15} />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard icon={<CreditCard size={16} />} label="Total loaded" value={`GHS ${totalBalance.toFixed(0)}`} sub="on your meal plan" delay={0.1} fetching={fetching} />
        <StatCard icon={<Clock size={16} />} label="Spent today" value={`GHS ${spentToday.toFixed(0)}`} sub={`${todayHistory.length} purchase${todayHistory.length !== 1 ? 's' : ''} today`} valueColor="#D81E2C" delay={0.17} fetching={fetching} />
        <StatCard icon={<Gauge size={16} />} label="Daily limit" value={`GHS ${dailyLimit.toFixed(0)}`} sub="resets at midnight" delay={0.24} fetching={fetching} />
      </div>

      <div style={{ position: 'relative' }}>
        {fetching && <FetchingOutline radius={22} />}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 22, boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Recent activity</div>
            <button onClick={() => navigate('/history')} style={{ fontSize: '12.5px', fontWeight: 700, color: '#D81E2C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              See all
            </button>
          </div>
          {isHistoryLoading ? (
            [0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderTop: '1px solid #ECE0D4', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton height={14} borderRadius={6} />
                  <Skeleton width="55%" height={11} borderRadius={5} />
                </div>
                <Skeleton width={70} height={15} borderRadius={6} />
              </div>
            ))
          ) : recent.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: '#7A6A63', fontSize: 13, fontWeight: 600 }}>No purchases today</div>
          ) : (
            recent.map((tx: HistoryItem, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: '1px solid #ECE0D4' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#7A6A63', fontWeight: 600, marginTop: 3 }}>
                    {tx.transaction_point} · {dateLabel(tx.date) === 'Today' ? formatTime(tx.date) : dateLabel(tx.date)}
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  −GHS {(tx.cost * tx.quantity).toFixed(0)}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
