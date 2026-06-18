import { motion } from 'framer-motion';
import { ChartCard } from './chart-card';

const TINTS = ['#D81E2C', '#E85C6A', '#F0909A', '#F5B8BD', '#FAD9DC'];

interface Item {
  name: string;
  qty: number;
  spend: number;
}

interface TopItemsProps {
  items: Item[];
}

export function TopItems({ items }: TopItemsProps) {
  const maxSpend = items[0]?.spend || 1;

  return (
    <ChartCard title="Top items by spend" sub="Last 30 days" delay={0.32}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => {
          const pct = (item.spend / maxSpend) * 100;
          return (
            <div key={item.name}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#7A6A63' }}>
                  GHS {Math.round(item.spend)} · {item.qty}×
                </div>
              </div>
              <div
                style={{ height: 6, borderRadius: 99, background: '#F2E7DC', overflow: 'hidden' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.75,
                    delay: 0.36 + i * 0.055,
                    ease: [0.4, 0, 0.2, 1],
                  }}
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
