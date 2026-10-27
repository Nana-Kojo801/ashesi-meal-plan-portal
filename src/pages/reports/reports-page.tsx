import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, CalendarDays, Moon, Sun, Sunrise } from 'lucide-react';
import { AnalyticsSkeleton } from '../../components/skeleton';
import { AnimatedNumber } from '../../components/animated-number';
import { CafeBadge } from '../../components/cafe-badge';
import { useAppContext } from '../../context/app-context';
import { useSpendingHistory } from '../../hooks/use-spending-history';
import { cafeTone } from '../../lib/cafe';
import { barSpring, rise, slideIn, stagger, useEntrance } from '../../lib/motion';
import { fmtMoney } from '../../lib/utils';
import { useAnalytics } from './hooks/use-analytics';
import { SpendChart } from './components/spend-chart';

const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function niceDate(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', opts);
}

function Meter({ pct, className = '', delay = 0 }: { pct: number; className?: string; delay?: number }) {
  return (
    <div className="meter">
      <motion.span
        className={`meter-fill ${className}`}
        initial={{ transform: 'scaleX(0)' }}
        animate={{ transform: 'scaleX(1)' }}
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        transition={{ ...barSpring, delay }}
      />
    </div>
  );
}

interface CompareProps {
  title: string;
  nowLabel: string;
  now: number;
  prevLabel: string;
  prev: number;
  note: string;
}

function CompareCard({ title, nowLabel, now, prevLabel, prev, note }: CompareProps) {
  const top = Math.max(now, prev, 1);
  const pct = prev > 0 ? Math.abs(Math.round(((now - prev) / prev) * 100)) : null;
  const less = now <= prev;
  return (
    <motion.section className="card compare-card" aria-label={title} variants={rise}>
      <div className="card-head">
        <h2 className="card-title">{title}</h2>
        {pct === 0 && <span className="pill neutral">No change</span>}
        {!!pct && (
          <span className={`pill ${less ? 'good' : 'bad'}`}>
            {less ? <ArrowDown size={13} /> : <ArrowUp size={13} />} {pct}%
          </span>
        )}
      </div>
      <div className="compare-row">
        <div className="compare-label"><span>{nowLabel}</span><strong>{fmtMoney(now)}</strong></div>
        <Meter pct={(now / top) * 100} className="accent" delay={0.2} />
      </div>
      <div className="compare-row">
        <div className="compare-label"><span>{prevLabel}</span><strong>{fmtMoney(prev)}</strong></div>
        <Meter pct={(prev / top) * 100} delay={0.28} />
      </div>
      <p className="card-note">{note}</p>
    </motion.section>
  );
}

export function ReportsPage() {
  const entrance = useEntrance();
  const { balanceData } = useAppContext();
  const { data: history = [], isLoading } = useSpendingHistory();
  const stats = useAnalytics(history, balanceData);

  if (isLoading) return <AnalyticsSkeleton />;
  if (!stats || stats.totalTx < 3) {
    return (
      <div className="page">
        <header className="page-header"><div><h1 className="page-title">Insights</h1></div></header>
        <div className="card empty-state"><strong>Not enough data yet</strong><p>Make a few more purchases to unlock insights.</p></div>
      </div>
    );
  }

  const first = stats.dailyTrend[0].date;
  const last = stats.dailyTrend[stats.dailyTrend.length - 1].date;
  const rangeText = `${niceDate(first, { day: 'numeric', month: 'short' })} – ${niceDate(last, { day: 'numeric', month: 'short' })}`;
  const lastMonthName = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

  const kpis = [
    { label: 'Average per active day', value: fmtMoney(stats.avgPerActiveDay), sub: stats.dailyLimit ? `Daily limit ${fmtMoney(stats.dailyLimit)}` : 'Days you bought something' },
    { label: 'Purchases', value: String(stats.totalTx), sub: `About ${(stats.totalTx / stats.activeDays).toFixed(1)} per active day` },
    { label: 'Active days', value: String(stats.activeDays), sub: 'of the last 30' },
    { label: 'Within daily limit', value: stats.daysUnderBudget !== null ? `${stats.daysUnderBudget} days` : '—', sub: `of ${stats.activeDays} active days` },
    { label: 'Average per purchase', value: fmtMoney(stats.avgPerMeal), sub: `Across ${stats.totalTx} purchases` },
    { label: 'Variety', value: `${stats.varietyScore} items`, sub: `${stats.oneTimeTries} tried only once` },
    { label: 'Priciest item', value: fmtMoney(stats.mostExpensive?.unit ?? 0), sub: stats.mostExpensive?.name ?? '—' },
    { label: 'Peak spending day', value: fmtMoney(stats.peakEntry?.[1] ?? 0), sub: stats.peakEntry ? niceDate(stats.peakEntry[0], { weekday: 'long', day: 'numeric', month: 'long' }) : '—' },
  ];

  const weekNote = stats.weeklyDiff <= 0
    ? `You’ve spent ${fmtMoney(-stats.weeklyDiff)} less than the 7 days before.`
    : `You’ve spent ${fmtMoney(stats.weeklyDiff)} more than the 7 days before.`;
  const monthDiff = stats.thisMonth - stats.lastMonth;
  const monthNote = monthDiff <= 0
    ? `${fmtMoney(-monthDiff)} below ${lastMonthName}’s total, with ${daysLeft} day${daysLeft === 1 ? '' : 's'} left.`
    : `${fmtMoney(monthDiff)} above ${lastMonthName}’s total so far.`;

  const itemMax = Math.max(...stats.top5BySpend.map((item) => item.spend), 1);
  const cafeMax = Math.max(...stats.cafes.map((cafe) => cafe.spend), 1);
  const periods = [
    { label: 'Morning', range: 'before 12 PM', value: stats.morning, Icon: Sunrise },
    { label: 'Afternoon', range: '12 – 5 PM', value: stats.afternoon, Icon: Sun },
    { label: 'Evening', range: 'after 5 PM', value: stats.evening, Icon: Moon },
  ];
  const topPeriod = periods.reduce((a, b) => (b.value > a.value ? b : a));
  const days = DOW_ORDER.map((i) => ({ index: i, ...stats.dayOfWeek[i] }));
  const dayMax = Math.max(...days.map((day) => day.spend), 1);

  return (
    <motion.div className="page" variants={stagger} initial={entrance} animate="show">
      <motion.header className="page-header" variants={rise}>
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">How you’ve spent your meal plan over the last 30 days.</p>
        </div>
        <span className="chip glass-soft"><CalendarDays size={15} /> {rangeText}</span>
      </motion.header>

      <motion.div className="tile-grid four" variants={stagger}>
        {kpis.map((kpi) => (
          <motion.div className="card tile stacked" key={kpi.label} variants={rise}>
            <span className="tile-label">{kpi.label}</span>
            <span className="tile-value">{kpi.value}</span>
            <span className="tile-sub">{kpi.sub}</span>
          </motion.div>
        ))}
      </motion.div>

      <div className="columns">
        <div className="column-main">
          <motion.section className="card chart-card" aria-label="Daily spending" variants={rise}>
            <div className="card-head wrap">
              <div>
                <span className="tile-label">Total spent</span>
                <div className="big-figure"><AnimatedNumber value={stats.totalSpent} format={fmtMoney} /></div>
                {stats.limitPct !== null && <p className="card-sub">On average you use {stats.limitPct}% of your daily limit</p>}
              </div>
              <div className="legend">
                <span><i className="legend-line" />Daily spend</span>
                {stats.dailyLimit > 0 && <span><i className="legend-dash" />Daily limit</span>}
              </div>
            </div>
            <SpendChart data={stats.dailyTrend} dailyLimit={stats.dailyLimit} />
          </motion.section>

          <motion.section className="card list-card" aria-label="Top items" variants={rise}>
            <div className="card-head padded">
              <h2 className="card-title">Top items</h2>
              <span className="card-sub">By total spend</span>
            </div>
            <motion.div variants={stagger}>
              {stats.top5BySpend.map((item, i) => (
                <motion.div className="list-row rank-row" key={item.name} variants={slideIn}>
                  <span className={`rank ${i === 0 ? 'first' : ''}`}>{i + 1}</span>
                  <div className="rank-body">
                    <div className="rank-line"><strong>{item.name}</strong><strong>{fmtMoney(item.spend)}</strong></div>
                    <div className="rank-line">
                      <Meter pct={(item.spend / itemMax) * 100} className={i === 0 ? 'accent' : ''} delay={0.25 + i * 0.05} />
                      <small>{item.qty} order{item.qty === 1 ? '' : 's'}</small>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section className="card" aria-label="Time of day" variants={rise}>
            <div className="card-head">
              <h2 className="card-title">Time of day</h2>
              <span className="card-sub">Most spending happens in the {topPeriod.label.toLowerCase()}</span>
            </div>
            <div className="period-list">
              {periods.map(({ label, range, value, Icon }, i) => {
                const pct = (value / stats.todTotal) * 100;
                return (
                  <div className="period" key={label}>
                    <span className="icon-chip small"><Icon size={17} /></span>
                    <div className="rank-body">
                      <div className="rank-line">
                        <span><strong>{label}</strong> <small>· {range}</small></span>
                        <span><strong>{fmtMoney(value)}</strong> <small>· {Math.round(pct)}%</small></span>
                      </div>
                      <Meter pct={pct} className={label === topPeriod.label ? 'accent' : ''} delay={0.3 + i * 0.06} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        <div className="column-side">
          <CompareCard title="This week vs last" nowLabel="Last 7 days" now={stats.thisWeekSpend} prevLabel="7 days before" prev={stats.lastWeekSpend} note={weekNote} />
          <CompareCard title="This month vs last" nowLabel={`${now.toLocaleDateString('en-GB', { month: 'long' })} so far`} now={stats.thisMonth} prevLabel={lastMonthName} prev={stats.lastMonth} note={monthNote} />

          <motion.section className="card" aria-label="Top cafés" variants={rise}>
            <div className="card-head"><h2 className="card-title">Top cafés</h2></div>
            <div className="cafe-list">
              {stats.cafes.map((cafe, i) => (
                <div className="cafe-rank" key={cafe.name}>
                  <div className="list-row flat">
                    <CafeBadge name={cafe.name} />
                    <div className="list-text"><strong>{cafe.name}</strong><small>{cafe.visits} visits</small></div>
                    <strong>{fmtMoney(cafe.spend)}</strong>
                  </div>
                  <Meter pct={(cafe.spend / cafeMax) * 100} className={`tone-fill-${cafeTone(cafe.name)}`} delay={0.3 + i * 0.06} />
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section className="card" aria-label="Spending by day of week" variants={rise}>
            <div className="card-head">
              <div>
                <h2 className="card-title">By day of week</h2>
                <p className="card-sub">Busiest: {FULL_DAYS[stats.peakDowIdx]} · {fmtMoney(stats.dayOfWeek[stats.peakDowIdx]?.spend ?? 0)}</p>
              </div>
            </div>
            <div className="bars tall" aria-hidden="true">
              {days.map((day, i) => (
                <motion.span
                  key={day.label}
                  className={`bar ${day.index === stats.peakDowIdx ? 'accent' : ''} ${day.spend === 0 ? 'empty' : ''}`}
                  style={{ height: `${(day.spend / dayMax) * 100}%` }}
                  initial={{ transform: 'scaleY(0)' }}
                  animate={{ transform: 'scaleY(1)' }}
                  transition={{ ...barSpring, delay: 0.3 + i * 0.05 }}
                  title={`${FULL_DAYS[day.index]}: ${fmtMoney(day.spend)}`}
                />
              ))}
            </div>
            <div className="bar-labels" aria-hidden="true">
              {days.map((day) => <span key={day.label} className={day.index === stats.peakDowIdx ? 'accent' : ''}>{day.label}</span>)}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
