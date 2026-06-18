import { motion } from 'framer-motion';
import { ChartCard } from './chart-card';

interface TimeOfDayProps {
  morning: number;
  afternoon: number;
  evening: number;
  total: number;
}

const PERIODS = [
  { label: 'Morning', emoji: '🌅', key: 'morning' as const },
  { label: 'Afternoon', emoji: '☀️', key: 'afternoon' as const },
  { label: 'Evening', emoji: '🌙', key: 'evening' as const },
] as const;

export function TimeOfDay({ morning, afternoon, evening, total }: TimeOfDayProps) {
  const values = { morning, afternoon, evening };

  return (
    <ChartCard title="Time of day breakdown" delay={0.4}>
      {PERIODS.map(({ label, emoji, key }) => {
        const value = values[key];
        const pct = (value / total) * 100;
        return (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>
                  GHS {Math.round(value)} ({Math.round(pct)}%)
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: '#F2E7DC',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: 0.44, ease: [0.4, 0, 0.2, 1] }}
                  style={{ height: '100%', borderRadius: 99, background: '#D81E2C' }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </ChartCard>
  );
}
