import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, Star, Store, Sun } from 'lucide-react';
import { bouncy, pressScale, slideIn, stagger } from '../../../lib/motion';
import { fmtMoney } from '../../../lib/utils';
import type { AnalyticsStats } from '../../reports/hooks/use-analytics';

const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HabitsCard({ stats }: { stats: NonNullable<AnalyticsStats> }) {
  const navigate = useNavigate();
  const periods = [
    { label: 'Morning', value: stats.morning },
    { label: 'Afternoon', value: stats.afternoon },
    { label: 'Evening', value: stats.evening },
  ];
  const busiest = periods.reduce((a, b) => (b.value > a.value ? b : a));
  const favourite = stats.cafes[0];

  const rows = [
    { label: 'Favourite café', value: favourite?.name ?? '—', sub: favourite ? `${favourite.visits} visits` : '', Icon: Store },
    { label: 'Most ordered', value: stats.mostFrequent?.name ?? '—', sub: stats.mostFrequent ? `${stats.mostFrequent.qty} times` : '', Icon: Star },
    { label: 'Busiest time', value: busiest.label, sub: `${Math.round((busiest.value / stats.todTotal) * 100)}% of spend`, Icon: Sun },
    { label: 'Busiest day', value: FULL_DAYS[stats.peakDowIdx], sub: fmtMoney(stats.dayOfWeek[stats.peakDowIdx]?.spend ?? 0), Icon: CalendarDays },
  ];

  return (
    <section className="card list-card" aria-label="Your habits">
      <div className="card-head padded">
        <h2 className="card-title">Your habits</h2>
        <span className="card-sub">Last 30 days</span>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show">
        {rows.map(({ label, value, sub, Icon }) => (
          <motion.div className="list-row" key={label} variants={slideIn}>
            <span className="icon-chip small"><Icon size={17} /></span>
            <div className="list-text">
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
            <span className="list-trailing muted">{sub}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.button type="button" className="list-link" onClick={() => navigate('/reports')} whileTap={pressScale} transition={bouncy}>
        See all insights <ChevronRight size={16} />
      </motion.button>
    </section>
  );
}
