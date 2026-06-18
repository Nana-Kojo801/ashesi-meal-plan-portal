import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { AnalyticsStats } from '../hooks/use-analytics';

interface WeeklyComparisonProps {
  stats: AnalyticsStats;
}

export function WeeklyComparison({ stats }: WeeklyComparisonProps) {
  if (!stats) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(120deg, #E0233A, #8E0F18)',
        color: '#fff',
        borderRadius: 20,
        padding: '18px 22px',
        boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            opacity: 0.75,
            marginBottom: 4,
            letterSpacing: '.3px',
          }}
        >
          THIS WEEK
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          GHS {Math.round(stats.thisWeekSpend)}
        </div>
        {stats.weeklyPct !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 6,
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {stats.weeklyDiff >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {stats.weeklyDiff >= 0 ? '+' : '-'}
            {stats.weeklyPct}% vs last week
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', opacity: 0.75 }}>
        <div
          style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4, letterSpacing: '.3px' }}
        >
          LAST WEEK
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.8px',
          }}
        >
          GHS {Math.round(stats.lastWeekSpend)}
        </div>
      </div>
    </motion.div>
  );
}
