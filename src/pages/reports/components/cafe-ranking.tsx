import { motion } from 'framer-motion';
import { ChartCard } from './chart-card';

const TINTS = ['#D81E2C', '#E85C6A', '#F0909A', '#F5B8BD', '#FAD9DC'];

interface Cafe {
  name: string;
  visits: number;
  spend: number;
}

interface CafeRankingProps {
  cafes: Cafe[];
}

export function CafeRanking({ cafes }: CafeRankingProps) {
  const maxSpend = cafes[0]?.spend || 1;

  return (
    <ChartCard title="Top cafés / vendors" sub="By total spend, last 30 days" delay={0.28}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cafes.map((cafe, i) => {
          const pct = (cafe.spend / maxSpend) * 100;
          return (
            <div key={cafe.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 7,
                      fontSize: 10,
                      fontWeight: 800,
                      background: i === 0 ? '#D81E2C' : '#F2E7DC',
                      color: i === 0 ? '#fff' : '#7A6A63',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {cafe.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>
                  GHS {cafe.spend} · {cafe.visits}×
                </div>
              </div>
              <div
                style={{ height: 6, borderRadius: 99, background: '#F2E7DC', overflow: 'hidden' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.32 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: 99,
                    background: TINTS[i] ?? 'rgba(216,30,44,.45)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
