import {
  Flame, Star, ShoppingBag, Coffee, TrendingUp,
  Leaf, Percent, Target, Zap,
} from 'lucide-react';
import { ChartCard } from './chart-card';
import { shortDate } from '../hooks/use-analytics';
import type { AnalyticsStats } from '../hooks/use-analytics';

interface InsightRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  badge?: { text: string; color: string };
}

interface MoreInsightsProps {
  stats: AnalyticsStats;
}

export function MoreInsights({ stats }: MoreInsightsProps) {
  if (!stats) return null;

  const monthDiff = stats.thisMonth - stats.lastMonth;
  const monthPct =
    stats.lastMonth > 0
      ? Math.abs(Math.round((monthDiff / stats.lastMonth) * 100))
      : null;

  const rows: InsightRow[] = [
    {
      icon: <Flame size={15} color="#D81E2C" />,
      label: 'Favourite café',
      value: stats.cafes[0]?.name?.split(' ')[0] ?? '—',
      sub: `${stats.cafes[0]?.visits ?? 0} visits · GHS ${stats.cafes[0]?.spend ?? 0}`,
    },
    {
      icon: <Star size={15} color="#7A6A63" />,
      label: 'Most ordered',
      value: stats.mostFrequent?.name?.split(' ').slice(0, 2).join(' ') ?? '—',
      sub: `${stats.mostFrequent?.qty ?? 0}× in 30 days`,
    },
    {
      icon: <ShoppingBag size={15} color="#7A6A63" />,
      label: 'Priciest item',
      value: `GHS ${Math.round(stats.mostExpensive?.unit ?? 0)}`,
      sub: stats.mostExpensive?.name ?? '—',
    },
    {
      icon: <Coffee size={15} color="#7A6A63" />,
      label: 'Variety',
      value: `${stats.varietyScore} items`,
      sub: `${stats.oneTimeTries} tried only once`,
    },
    {
      icon: <TrendingUp size={15} color={monthDiff >= 0 ? '#D81E2C' : '#16a34a'} />,
      label: 'Month vs last month',
      value: `GHS ${Math.round(stats.thisMonth)}`,
      badge:
        monthPct !== null
          ? { text: `${monthDiff >= 0 ? '+' : '-'}${monthPct}%`, color: monthDiff >= 0 ? '#D81E2C' : '#16a34a' }
          : undefined,
      sub: `Last month: GHS ${Math.round(stats.lastMonth)}`,
    },
    {
      icon: <Leaf size={15} color={stats.streak >= 2 ? '#D81E2C' : '#7A6A63'} />,
      label: 'Savings streak',
      value: stats.streak === 0 ? '0 days' : `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
      sub: stats.streak === 0 ? 'Spent today' : 'No purchases — nice!',
    },
    ...(stats.limitPct !== null
      ? [
          {
            icon: <Percent size={15} color={stats.limitPct > 90 ? '#D81E2C' : '#7A6A63'} />,
            label: 'Avg daily vs limit',
            value: `${stats.limitPct}%`,
            sub: `GHS ${Math.round(stats.avgPerActiveDay)} avg of GHS ${stats.dailyLimit} limit`,
          },
        ]
      : []),
    ...(stats.daysUnderBudget !== null
      ? [
          {
            icon: <Target size={15} color="#7A6A63" />,
            label: 'Days within budget',
            value: `${stats.daysUnderBudget} / ${stats.activeDays}`,
            sub: 'active spending days',
          },
        ]
      : []),
    ...(stats.peakEntry
      ? [
          {
            icon: <Zap size={15} color="#D81E2C" />,
            label: 'Peak spending day',
            value: `GHS ${Math.round(stats.peakEntry[1])}`,
            sub: shortDate(stats.peakEntry[0]),
          },
        ]
      : []),
  ];

  return (
    <ChartCard title="More insights" delay={0.48}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '13px 0',
            borderBottom: i < rows.length - 1 ? '1px solid #F2E7DC' : 'none',
          }}
        >
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{row.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{row.label}</div>
            <div
              style={{ fontSize: 11.5, color: '#7A6A63', fontWeight: 600, marginTop: 1 }}
            >
              {row.sub}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.4px',
              }}
            >
              {row.value}
            </div>
            {row.badge && (
              <div
                style={{ fontSize: 10.5, fontWeight: 800, color: row.badge.color, marginTop: 1 }}
              >
                {row.badge.text}
              </div>
            )}
          </div>
        </div>
      ))}
    </ChartCard>
  );
}
