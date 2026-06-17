import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Coffee, ShoppingBag, Flame, Star,
  Percent, Leaf, Wallet, Calendar, Zap, Target,
} from 'lucide-react';
import { fetchHistory } from '../api';
import { HistorySkeleton } from '../components/Skeleton';
import { useAppContext } from '../context/AppContext';
import type { HistoryItem } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function firstOfMonth(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset, 1);
  return d.toISOString().split('T')[0];
}

function lastOfMonth(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset + 1, 0);
  return d.toISOString().split('T')[0];
}

function shortDate(iso: string): string {
  const [, m, day] = iso.split('-');
  return `${parseInt(day)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RED = '#D81E2C';
const RED_SOFT = 'rgba(216,30,44,.45)';
const TINTS = ['#D81E2C', '#E85C6A', '#F0909A', '#F5B8BD', '#FAD9DC'];

// ─── chart tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #ECE0D4', borderRadius: 10,
      padding: '8px 12px', fontSize: 12, fontWeight: 700,
      boxShadow: '0 8px 20px -8px rgba(60,15,8,.18)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ color: '#7A6A63', marginBottom: 2 }}>{label}</div>
      <div style={{ color: RED }}>GHS {payload[0].value.toFixed(0)}</div>
    </div>
  );
}

// ─── stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, delay = 0, accent = false }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  delay?: number; accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff',
        border: `1px solid ${accent ? 'rgba(216,30,44,.2)' : '#ECE0D4'}`,
        borderRadius: 20, padding: '18px 20px',
        boxShadow: accent
          ? '0 12px 26px -14px rgba(216,30,44,.25)'
          : '0 12px 26px -18px rgba(110,30,18,.18)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7A6A63', fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>
        {icon}{label}
      </div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px',
        color: accent ? RED : '#1C1413', lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#7A6A63', fontWeight: 600, marginTop: 5, lineHeight: 1.4 }}>{sub}</div>}
    </motion.div>
  );
}

// ─── chart card ─────────────────────────────────────────────────────────────

function ChartCard({ title, sub, children, delay = 0 }: {
  title: string; sub?: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff', border: '1px solid #ECE0D4', borderRadius: 22,
        padding: '20px 20px 14px',
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.20)',
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: '#7A6A63', fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </motion.div>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export function AnalyticsScreen() {
  const { studentId, balanceData } = useAppContext();

  const endDate   = todayStr();
  const startDate = nDaysAgo(59);

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    if (!history.length) return null;

    const txCost = (tx: HistoryItem) => tx.cost * tx.quantity;
    const last30Start = nDaysAgo(29);
    const last30 = history.filter(tx => tx.date.slice(0,10) >= last30Start);
    if (!last30.length) return null;

    // daily spend map
    const byDay: Record<string, number> = {};
    last30.forEach(tx => {
      const d = tx.date.slice(0,10);
      byDay[d] = (byDay[d] ?? 0) + txCost(tx);
    });

    const dailyTrend: { date: string; label: string; spend: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = nDaysAgo(i);
      dailyTrend.push({ date: d, label: shortDate(d), spend: Math.round((byDay[d] ?? 0) * 100) / 100 });
    }

    // summary
    const totalSpent    = last30.reduce((s, tx) => s + txCost(tx), 0);
    const activeDays    = Object.values(byDay).filter(v => v > 0).length || 1;
    const avgPerActiveDay = totalSpent / activeDays;
    const avgPerDay     = totalSpent / 30;
    const avgPerMeal    = last30.length > 0 ? totalSpent / last30.length : 0;

    // weekly comparison (this 7 days vs previous 7)
    const thisWeekStart = nDaysAgo(6);
    const lastWeekStart = nDaysAgo(13);
    const thisWeekSpend = last30.filter(tx => tx.date.slice(0,10) >= thisWeekStart).reduce((s,tx) => s+txCost(tx), 0);
    const lastWeekSpend = last30.filter(tx => { const d = tx.date.slice(0,10); return d >= lastWeekStart && d < thisWeekStart; }).reduce((s,tx) => s+txCost(tx), 0);
    const weeklyDiff    = thisWeekSpend - lastWeekSpend;
    const weeklyPct     = lastWeekSpend > 0 ? Math.abs(Math.round((weeklyDiff / lastWeekSpend) * 100)) : null;

    // cafes
    const cafeMap: Record<string, { visits: number; spend: number }> = {};
    last30.forEach(tx => {
      const c = tx.transaction_point || 'Unknown';
      if (!cafeMap[c]) cafeMap[c] = { visits: 0, spend: 0 };
      cafeMap[c].visits += 1;
      cafeMap[c].spend  += txCost(tx);
    });
    const cafes = Object.entries(cafeMap)
      .map(([name, v]) => ({ name, ...v, spend: Math.round(v.spend) }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    // items
    const itemMap: Record<string, { qty: number; spend: number; unit: number }> = {};
    last30.forEach(tx => {
      if (!itemMap[tx.name]) itemMap[tx.name] = { qty: 0, spend: 0, unit: tx.cost };
      itemMap[tx.name].qty   += tx.quantity;
      itemMap[tx.name].spend += txCost(tx);
    });
    const items = Object.entries(itemMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty);
    const top5BySpend   = [...items].sort((a,b) => b.spend - a.spend).slice(0,5);
    const mostFrequent  = items[0] ?? null;
    const mostExpensive = [...items].sort((a,b) => b.unit - a.unit)[0] ?? null;
    const varietyScore  = items.length;
    const oneTimeTries  = items.filter(i => i.qty === 1).length;

    // day of week
    const dowMap = Array(7).fill(0) as number[];
    last30.forEach(tx => {
      const dow = new Date(tx.date.slice(0,10) + 'T00:00:00').getDay();
      dowMap[dow] += txCost(tx);
    });
    const dayOfWeek  = DAYS.map((label, i) => ({ label, spend: Math.round(dowMap[i]) }));
    const peakDowIdx = dowMap.indexOf(Math.max(...dowMap));

    // time of day
    let morning = 0, afternoon = 0, evening = 0;
    last30.forEach(tx => {
      const h = new Date(tx.date).getHours();
      const v = txCost(tx);
      if (h < 12) morning += v;
      else if (h < 17) afternoon += v;
      else evening += v;
    });
    const todTotal = morning + afternoon + evening || 1;

    // month comparison
    const thisStart = firstOfMonth(0);
    const lastStart = firstOfMonth(1);
    const lastEnd   = lastOfMonth(1);
    const thisMonth = history.filter(tx => tx.date.slice(0,10) >= thisStart).reduce((s,tx) => s+txCost(tx), 0);
    const lastMonth = history.filter(tx => { const d = tx.date.slice(0,10); return d >= lastStart && d <= lastEnd; }).reduce((s,tx) => s+txCost(tx), 0);

    // savings streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      if ((byDay[nDaysAgo(i)] ?? 0) > 0) break;
      streak++;
    }

    // budget
    const dailyLimit     = balanceData?.daily_spending_limit ?? 0;
    const limitPct       = dailyLimit > 0 ? Math.round((avgPerDay / dailyLimit) * 100) : null;
    const daysUnderBudget = dailyLimit > 0
      ? Object.values(byDay).filter(v => v > 0 && v <= dailyLimit).length
      : null;

    // peak day
    const peakEntry = Object.entries(byDay).sort(([,a],[,b]) => b-a)[0] as [string, number] | undefined;

    return {
      totalSpent, avgPerActiveDay, avgPerMeal, totalTx: last30.length, activeDays,
      thisWeekSpend, lastWeekSpend, weeklyDiff, weeklyPct,
      dailyTrend, cafes, dayOfWeek, peakDowIdx,
      items, top5BySpend, mostFrequent, mostExpensive, varietyScore, oneTimeTries,
      morning, afternoon, evening, todTotal,
      thisMonth, lastMonth,
      streak, limitPct, daysUnderBudget, dailyLimit,
      peakEntry,
    };
  }, [history, balanceData]);

  if (isLoading) return <HistorySkeleton />;

  if (!stats || stats.totalTx < 3) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px dashed #ECE0D4', borderRadius: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Not enough data yet</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 6 }}>
          Make a few more purchases and check back.
        </div>
      </div>
    );
  }

  const monthDiff = stats.thisMonth - stats.lastMonth;
  const monthPct  = stats.lastMonth > 0 ? Math.abs(Math.round((monthDiff / stats.lastMonth) * 100)) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* heading */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>Analytics</h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>
          Last 30 days of spending, visualised.
        </div>
      </motion.div>

      {/* summary 4-grid — appears first */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <StatCard icon={<Wallet size={14} />}   label="Total spent"   value={`GHS ${Math.round(stats.totalSpent)}`}   sub="last 30 days"             delay={0.04} accent />
        <StatCard icon={<Calendar size={14} />} label="Avg per day"   value={`GHS ${Math.round(stats.avgPerActiveDay)}`} sub={`over ${stats.activeDays} active day${stats.activeDays !== 1 ? 's' : ''}`} delay={0.08} />
        <StatCard icon={<Zap size={14} />}      label="Purchases"     value={`${stats.totalTx}`}                      sub="transactions"             delay={0.12} />
        <StatCard icon={<Target size={14} />}   label="Avg per meal"  value={`GHS ${Math.round(stats.avgPerMeal)}`}   sub="per transaction"          delay={0.16} />
      </div>

      {/* weekly comparison banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.20 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(120deg, #E0233A, #8E0F18)', color: '#fff',
          borderRadius: 20, padding: '18px 22px',
          boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)',
        }}
      >
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, opacity: .75, marginBottom: 4, letterSpacing: '.3px' }}>THIS WEEK</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1 }}>
            GHS {Math.round(stats.thisWeekSpend)}
          </div>
          {stats.weeklyPct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12.5, fontWeight: 700 }}>
              {stats.weeklyDiff >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {stats.weeklyDiff >= 0 ? '+' : '-'}{stats.weeklyPct}% vs last week
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', opacity: .75 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4, letterSpacing: '.3px' }}>LAST WEEK</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.8px' }}>
            GHS {Math.round(stats.lastWeekSpend)}
          </div>
        </div>
      </motion.div>

      {/* daily trend */}
      <ChartCard title="Daily spending trend" sub="Last 30 days" delay={0.24}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats.dailyTrend} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600 }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="spend" stroke={RED} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: RED, stroke: '#fff', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* café ranking */}
      <ChartCard title="Top cafés / vendors" sub="By total spend, last 30 days" delay={0.28}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.cafes.map((cafe, i) => {
            const pct = (cafe.spend / (stats.cafes[0].spend || 1)) * 100;
            return (
              <div key={cafe.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 7, fontSize: 10, fontWeight: 800,
                      background: i === 0 ? RED : '#F2E7DC', color: i === 0 ? '#fff' : '#7A6A63',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{i + 1}</span>
                    {cafe.name}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>GHS {cafe.spend} · {cafe.visits}×</div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: '#F2E7DC', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.32 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', borderRadius: 99, background: TINTS[i] ?? RED_SOFT }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* top items by spend */}
      <ChartCard title="Top items by spend" sub="Last 30 days" delay={0.32}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.top5BySpend.map((item, i) => {
            const pct = (item.spend / (stats.top5BySpend[0].spend || 1)) * 100;
            return (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#7A6A63' }}>GHS {Math.round(item.spend)} · {item.qty}×</div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: '#F2E7DC', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.75, delay: 0.36 + i * 0.055, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', borderRadius: 99, background: TINTS[i] ?? RED_SOFT }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* day of week */}
      <ChartCard title="Spending by day of week" sub={`Busiest: ${DAYS[stats.peakDowIdx]}`} delay={0.36}>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stats.dayOfWeek} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7A6A63', fontWeight: 600 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
              {stats.dayOfWeek.map((entry, i) => {
                const max = Math.max(...stats.dayOfWeek.map(d => d.spend)) || 1;
                const intensity = entry.spend / max;
                return <Cell key={i} fill={intensity > 0.7 ? RED : intensity > 0.4 ? '#E85C6A' : '#F2E7DC'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* time of day */}
      <ChartCard title="Time of day breakdown" delay={0.40}>
        {[
          { label: 'Morning',   emoji: '🌅', value: stats.morning,   pct: (stats.morning   / stats.todTotal) * 100 },
          { label: 'Afternoon', emoji: '☀️', value: stats.afternoon, pct: (stats.afternoon / stats.todTotal) * 100 },
          { label: 'Evening',   emoji: '🌙', value: stats.evening,   pct: (stats.evening   / stats.todTotal) * 100 },
        ].map(({ label, emoji, value, pct }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>GHS {Math.round(value)} ({Math.round(pct)}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: '#F2E7DC', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: 0.44, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: '100%', borderRadius: 99, background: RED }}
                />
              </div>
            </div>
          </div>
        ))}
      </ChartCard>

      {/* item personality grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <StatCard
          icon={<Flame size={14} />} label="Favourite café"
          value={stats.cafes[0]?.name?.split(' ')[0] ?? '—'}
          sub={`${stats.cafes[0]?.visits ?? 0} visits · GHS ${stats.cafes[0]?.spend ?? 0}`}
          delay={0.48}
        />
        <StatCard
          icon={<Star size={14} />} label="Most ordered"
          value={stats.mostFrequent?.name?.split(' ').slice(0,2).join(' ') ?? '—'}
          sub={`${stats.mostFrequent?.qty ?? 0}× in 30 days`}
          delay={0.52}
        />
        <StatCard
          icon={<ShoppingBag size={14} />} label="Priciest item"
          value={`GHS ${Math.round(stats.mostExpensive?.unit ?? 0)}`}
          sub={stats.mostExpensive?.name ?? '—'}
          delay={0.56}
        />
        <StatCard
          icon={<Coffee size={14} />} label="Variety"
          value={`${stats.varietyScore}`}
          sub={`items · ${stats.oneTimeTries} tried once`}
          delay={0.60}
        />
      </div>

      {/* bottom: month, streak, budget, peak */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.64, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 20, padding: '18px 20px', boxShadow: '0 12px 26px -18px rgba(110,30,18,.18)' }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63', marginBottom: 10 }}>Month vs last month</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', color: '#1C1413' }}>
            GHS {Math.round(stats.thisMonth)}
          </div>
          {monthPct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 12, fontWeight: 700 }}>
              {monthDiff >= 0 ? <TrendingUp size={13} color={RED} /> : <TrendingDown size={13} color="#16a34a" />}
              <span style={{ color: monthDiff >= 0 ? RED : '#16a34a' }}>
                {monthDiff >= 0 ? '+' : '-'}{monthPct}% vs last month
              </span>
            </div>
          )}
          <div style={{ fontSize: 11, color: '#7A6A63', fontWeight: 600, marginTop: 3 }}>
            Last: GHS {Math.round(stats.lastMonth)}
          </div>
        </motion.div>

        <StatCard
          icon={<Leaf size={14} />} label="Savings streak"
          value={stats.streak === 0 ? '0 days' : `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
          sub={stats.streak === 0 ? 'Spent today' : 'No purchases — nice!'}
          delay={0.68} accent={stats.streak >= 2}
        />

        {stats.limitPct !== null && (
          <StatCard
            icon={<Percent size={14} />} label="Avg vs limit"
            value={`${stats.limitPct}%`}
            sub={`GHS ${Math.round(stats.avgPerActiveDay)} avg · GHS ${stats.dailyLimit} limit`}
            delay={0.72} accent={stats.limitPct > 90}
          />
        )}

        {stats.daysUnderBudget !== null && (
          <StatCard
            icon={<Target size={14} />} label="Budget days"
            value={`${stats.daysUnderBudget}/${stats.activeDays}`}
            sub="active days within limit"
            delay={0.76}
          />
        )}

        {stats.peakEntry && (
          <StatCard
            icon={<Zap size={14} />} label="Peak day"
            value={`GHS ${Math.round(stats.peakEntry[1])}`}
            sub={shortDate(stats.peakEntry[0])}
            delay={0.80}
          />
        )}
      </div>

    </div>
  );
}
