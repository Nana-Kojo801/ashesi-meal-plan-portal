import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { fetchHistory } from '../../api';
import { HistorySkeleton } from '../../components/skeleton';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { fmtAmount } from '../../lib/utils';
import { useAnalytics, nDaysAgo, todayStr } from './hooks/use-analytics';
import { ChartTooltip } from './components/chart-tooltip';
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
  if (!stats || stats.totalTx < 3) return <div className="empty-state">Make a few more purchases to unlock analytics.</div>;

  return (
    <div className="page">
      <header className="page-heading">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Last 30 days of spending, visualised.</p>
      </header>

      <motion.section className="analytics-hero red-plane" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="analytics-stat">
          <motion.strong key={stats.totalSpent} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            GHS {fmtAmount(stats.totalSpent)}
          </motion.strong>
          <span>Total spent</span>
        </div>
        <div className="analytics-stat"><strong>GHS {fmtAmount(stats.avgPerActiveDay)}</strong><span>Average per active day</span></div>
        <div className="analytics-stat"><strong>{stats.totalTx}</strong><span>Transactions</span></div>
        <div className="analytics-stat"><strong>{stats.activeDays}</strong><span>Active days</span></div>
      </motion.section>

      <div className="analytics-grid">
        <motion.section className="analytics-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}>
          <h2 className="analytics-section-title">Daily spending</h2>
          <div className="analytics-section-sub">Last 30 days</div>
          <div style={{ height: 260, marginTop: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyTrend} margin={{ top: 8, right: 10, left: -8, bottom: 8 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#667085' }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: '#667085' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="spend" stroke="#df001f" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#df001f', stroke: '#fff', strokeWidth: 2 }} isAnimationActive animationDuration={1100} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">This week vs last week</h2>
          <div style={{ marginTop: 28, display: 'grid', gap: 24 }}>
            <div>
              <div className="eyebrow muted">This week</div>
              <div className="display-number" style={{ fontSize: 34, fontWeight: 700, color: '#df001f', marginTop: 7 }}>GHS {fmtAmount(stats.thisWeekSpend)}</div>
              {stats.weeklyPct !== null && <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{stats.weeklyDiff >= 0 ? '+' : '−'}{stats.weeklyPct}% from last week</div>}
            </div>
            <div>
              <div className="eyebrow muted">Last week</div>
              <div className="display-number" style={{ fontSize: 28, fontWeight: 700, marginTop: 7 }}>GHS {fmtAmount(stats.lastWeekSpend)}</div>
            </div>
          </div>
        </section>
      </div>

      <div className="analytics-bottom">
        <section className="analytics-section">
          <h2 className="analytics-section-title">Café ranking</h2>
          {stats.cafes.map((cafe, index) => (
            <div className="rank-row" key={cafe.name}>
              <span className="rank-number">{index + 1}</span>
              <span className="rank-name">{cafe.name}<small>{cafe.visits} visits</small></span>
              <span className="rank-value">GHS {fmtAmount(cafe.spend)}</span>
            </div>
          ))}
        </section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">Top items</h2>
          {stats.top5BySpend.map((item, index) => (
            <div className="rank-row" key={item.name}>
              <span className="rank-number">{index + 1}</span>
              <span className="rank-name">{item.name}<small>{item.qty} ordered</small></span>
              <span className="rank-value">GHS {fmtAmount(item.spend)}</span>
            </div>
          ))}
        </section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">Day of week activity</h2>
          <div style={{ height: 200, marginTop: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dayOfWeek}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#667085' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="spend" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={900}>
                  {stats.dayOfWeek.map((_, index) => <Cell key={index} fill={index === stats.peakDowIdx ? '#df001f' : '#d9dde4'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

    </div>
  );
}
