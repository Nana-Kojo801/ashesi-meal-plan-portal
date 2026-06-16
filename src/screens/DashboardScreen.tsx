import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Clock, Gauge, ArrowRight, RefreshCw } from 'lucide-react';
import { Ring } from '../components/Ring';
import { DashboardSkeleton } from '../components/Skeleton';
import { fetchHistory } from '../api';
import { todayISO, getGreeting, formatTime, dateLabel } from '../lib/utils';
import type { BalanceData, HistoryItem, Screen } from '../types';

interface DashboardScreenProps {
  studentId: string;
  balanceData: BalanceData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNav: (s: Screen) => void;
  isMobile: boolean;
}

function StatCard({ icon, label, value, sub, valueColor, delay = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
  delay?: number;
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
      }}
    >
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

export function DashboardScreen({ studentId, balanceData, loading, error, onRetry, onNav, isMobile }: DashboardScreenProps) {
  const today = todayISO();

  const { data: todayHistory = [], isSuccess: isHistorySuccess } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, today, today],
    queryFn: () => fetchHistory(studentId, today, today),
    enabled: !!balanceData,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 3 * 60 * 1000,
  });

  if (loading && !balanceData) return <DashboardSkeleton isMobile={isMobile} />;

  if (error && !balanceData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Failed to load</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4 }}>{error}</div>
        <button
          onClick={onRetry}
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
  const dailyLimit = balanceData.daily_spending_limit;
  const totalBalance = balanceData.amount;
  // Use history to compute spentToday once it's loaded — history refreshes frequently
  // without triggering an OTP, so it reflects purchases sooner than balanceData (1hr TTL).
  const spentToday = isHistorySuccess
    ? todayHistory.reduce((sum, tx) => sum + tx.cost * tx.quantity, 0)
    : Math.max(0, dailyLimit - balanceData.current_balance);
  const dailyBalance = Math.max(0, dailyLimit - spentToday);
  const fraction = dailyLimit > 0 ? dailyBalance / dailyLimit : 0;
  const usedPct = Math.min(100, Math.round((spentToday / dailyLimit) * 100));
  const ringSize = isMobile ? 132 : 200;
  const ringSW = isMobile ? 12 : 17;
  const recent = todayHistory.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6A63' }}>{greeting},</div>
        <h1 style={{ margin: '2px 0 0', fontSize: isMobile ? 25 : 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>
          {firstName} 👋
        </h1>
      </motion.div>

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
              onClick={() => onNav('report')}
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard icon={<CreditCard size={16} />} label="Total loaded" value={`GHS ${totalBalance.toFixed(0)}`} sub="on your meal plan" delay={0.1} />
        <StatCard icon={<Clock size={16} />} label="Spent today" value={`GHS ${spentToday.toFixed(0)}`} sub={`${todayHistory.length} purchase${todayHistory.length !== 1 ? 's' : ''} today`} valueColor="#D81E2C" delay={0.17} />
        <StatCard icon={<Gauge size={16} />} label="Daily limit" value={`GHS ${dailyLimit.toFixed(0)}`} sub="resets at midnight" delay={0.24} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 22, boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Recent activity</div>
          <button onClick={() => onNav('report')} style={{ fontSize: '12.5px', fontWeight: 700, color: '#D81E2C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            See all
          </button>
        </div>
        {recent.length === 0 ? (
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
  );
}
