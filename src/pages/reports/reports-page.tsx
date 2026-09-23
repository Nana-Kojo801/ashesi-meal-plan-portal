import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchHistory } from '../../api';
import { AnalyticsSkeleton } from '../../components/skeleton';
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

  if (isLoading) return <AnalyticsSkeleton />;
  if (!stats || stats.totalTx < 3) return <div className="empty-state">Make a few more purchases to unlock analytics.</div>;

  const weeklyMax = Math.max(stats.thisWeekSpend, stats.lastWeekSpend, 1);
  const cafeMax = Math.max(...stats.cafes.map((cafe) => cafe.spend), 1);
  const itemMax = Math.max(...stats.top5BySpend.map((item) => item.spend), 1);
  const dayMax = Math.max(...stats.dayOfWeek.map((day) => day.spend), 1);

  return (
    <div className="page analytics-page">
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
          <div className="daily-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrend} margin={{ top: 8, right: 10, left: -8, bottom: 8 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e20a1c" stopOpacity={.28} />
                    <stop offset="100%" stopColor="#e20a1c" stopOpacity={.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e4e8ee" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tickFormatter={(value) => `GHS ${value}`} tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="spend" stroke="#e20a1c" strokeWidth={3} fill="url(#spendFill)" dot={{ r: 2.5, fill: '#fff', stroke: '#e20a1c', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#e20a1c', stroke: '#fff', strokeWidth: 2 }} isAnimationActive animationDuration={1100} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">This week vs last week</h2>
          <div className="week-totals">
            <div><small>This week</small><strong>GHS {fmtAmount(stats.thisWeekSpend)}</strong></div>
            {stats.weeklyPct !== null && <b className="week-change">▲ {stats.weeklyDiff >= 0 ? '+' : '−'}{stats.weeklyPct}%</b>}
            <div><small>Last week</small><strong>GHS {fmtAmount(stats.lastWeekSpend)}</strong></div>
          </div>
          <div className="week-bars">
            <div><span>This week</span><i><b style={{ width: `${(stats.thisWeekSpend / weeklyMax) * 100}%` }} /></i><strong>GHS {fmtAmount(stats.thisWeekSpend)}</strong></div>
            <div><span>Last week</span><i><b className="previous" style={{ width: `${(stats.lastWeekSpend / weeklyMax) * 100}%` }} /></i><strong>GHS {fmtAmount(stats.lastWeekSpend)}</strong></div>
          </div>
        </section>
      </div>

      <div className="analytics-bottom">
        <section className="analytics-section">
          <h2 className="analytics-section-title">Café ranking</h2>
          <div className="rank-head"><span>#</span><span>Café</span><span>Total spent</span></div>
          {stats.cafes.slice(0, 2).map((cafe, index) => (
            <div className="rank-row" key={cafe.name}>
              <span className="rank-number">{index + 1}</span>
              <span className="rank-name">{cafe.name}<i><b style={{ width: `${(cafe.spend / cafeMax) * 100}%` }} /></i></span>
              <span className="rank-value">GHS {fmtAmount(cafe.spend)}</span>
            </div>
          ))}
        </section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">Top items</h2>
          <div className="rank-head"><span>#</span><span>Item</span><span>Total spent</span></div>
          {stats.top5BySpend.slice(0, 3).map((item, index) => (
            <div className="rank-row" key={item.name}>
              <span className="rank-number">{index + 1}</span>
              <span className="rank-name">{item.name}<i><b style={{ width: `${(item.spend / itemMax) * 100}%` }} /></i></span>
              <span className="rank-value">GHS {fmtAmount(item.spend)}</span>
            </div>
          ))}
        </section>
        <section className="analytics-section">
          <h2 className="analytics-section-title">Day of week activity</h2>
          <div className="day-bars">
            {stats.dayOfWeek.map((day) => (
              <div key={day.label}><span>{day.label}</span><strong>GHS {fmtAmount(day.spend)}</strong><i><b style={{ width: `${(day.spend / dayMax) * 100}%` }} /></i></div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
