import { motion } from 'framer-motion';
import { Wallet, Flame, Zap, ShoppingBag } from 'lucide-react';
import type { AnalyticsStats } from '../hooks/use-analytics';

interface AnalyticsStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
  accent?: boolean;
}

function AnalyticsStatCard({ icon, label, value, sub, delay = 0, accent = false }: AnalyticsStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff',
        border: `1px solid ${accent ? 'rgba(216,30,44,.2)' : '#ECE0D4'}`,
        borderRadius: 20,
        padding: '18px 20px',
        boxShadow: accent
          ? '0 12px 26px -14px rgba(216,30,44,.25)'
          : '0 12px 26px -18px rgba(110,30,18,.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#7A6A63',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.8px',
          color: accent ? '#D81E2C' : '#1C1413',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: '#7A6A63', fontWeight: 600, marginTop: 5, lineHeight: 1.4 }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

interface AnalyticsStatsProps {
  stats: AnalyticsStats;
}

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
  if (!stats) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      <AnalyticsStatCard
        icon={<Wallet size={14} />}
        label="Total spent"
        value={`GHS ${Math.round(stats.totalSpent)}`}
        sub="last 30 days"
        delay={0.04}
        accent
      />
      <AnalyticsStatCard
        icon={<Flame size={14} />}
        label="Favourite café"
        value={stats.cafes[0]?.name?.split(' ')[0] ?? '—'}
        sub={`${stats.cafes[0]?.visits ?? 0} visits`}
        delay={0.08}
      />
      <AnalyticsStatCard
        icon={<Zap size={14} />}
        label="Purchases"
        value={`${stats.totalTx}`}
        sub="transactions"
        delay={0.12}
      />
      <AnalyticsStatCard
        icon={<ShoppingBag size={14} />}
        label="Priciest item"
        value={`GHS ${Math.round(stats.mostExpensive?.unit ?? 0)}`}
        sub={stats.mostExpensive?.name?.split(' ')[0] ?? '—'}
        delay={0.16}
      />
    </div>
  );
}
