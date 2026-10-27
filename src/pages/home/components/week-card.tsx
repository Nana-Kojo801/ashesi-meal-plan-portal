import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { barSpring, bouncy, pressScale } from '../../../lib/motion';
import { fmtMoney } from '../../../lib/utils';

interface WeekCardProps {
  days: { date: string; spend: number }[];
  dailyLimit: number;
}

export function WeekCard({ days, dailyLimit }: WeekCardProps) {
  const navigate = useNavigate();
  const total = days.reduce((sum, day) => sum + day.spend, 0);
  const top = Math.max(dailyLimit, ...days.map((day) => day.spend), 1) * 1.08;
  const lastIndex = days.length - 1;

  return (
    <motion.button
      type="button"
      className="card week-card"
      onClick={() => navigate('/reports')}
      whileTap={pressScale}
      whileHover={{ y: -3 }}
      transition={bouncy}
      aria-label={`Last 7 days: ${fmtMoney(total)} spent. Open insights`}
    >
      <div className="card-head">
        <div>
          <h2 className="card-title">Last 7 days</h2>
          <p className="card-sub">Avg {fmtMoney(total / 7)} a day</p>
        </div>
        <span className="card-figure">{fmtMoney(total)}<ChevronRight size={16} /></span>
      </div>
      <div className="bars" aria-hidden="true">
        {dailyLimit > 0 && (
          <span className="limit-line" style={{ bottom: `${(dailyLimit / top) * 100}%` }}>
            <small>Limit {Math.round(dailyLimit)}</small>
          </span>
        )}
        {days.map((day, i) => (
          <motion.span
            key={day.date}
            className={`bar ${i === lastIndex ? 'accent' : ''} ${day.spend === 0 ? 'empty' : ''}`}
            style={{ height: `${(day.spend / top) * 100}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...barSpring, delay: 0.2 + i * 0.05 }}
          />
        ))}
      </div>
      <div className="bar-labels" aria-hidden="true">
        {days.map((day, i) => (
          <span key={day.date} className={i === lastIndex ? 'accent' : ''}>
            {i === lastIndex ? 'Today' : new Date(`${day.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
