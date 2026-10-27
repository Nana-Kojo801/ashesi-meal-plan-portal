import { motion } from 'framer-motion';
import { CalendarDays, Receipt, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '../../../components/skeleton';
import { bouncy, rise, stagger } from '../../../lib/motion';
import { fmtMoney } from '../../../lib/utils';
import type { AnalyticsStats } from '../../reports/hooks/use-analytics';

interface Tile {
  label: string;
  value: string;
  pill: string;
  tone: 'good' | 'bad' | 'neutral';
  Icon: typeof Receipt;
}

function lastMonthName() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'long' });
}

function buildTiles(stats: NonNullable<AnalyticsStats>): Tile[] {
  const spentLess = stats.weeklyDiff <= 0;
  return [
    {
      label: 'This week',
      value: fmtMoney(stats.thisWeekSpend),
      pill: stats.weeklyPct === null ? 'No spending last week' : stats.weeklyPct === 0 ? 'Same as last week' : `${spentLess ? '↓' : '↑'} ${stats.weeklyPct}% vs last week`,
      tone: !stats.weeklyPct ? 'neutral' : spentLess ? 'good' : 'bad',
      Icon: spentLess ? TrendingDown : TrendingUp,
    },
    {
      label: 'This month',
      value: fmtMoney(stats.thisMonth),
      pill: `${lastMonthName()}: ${fmtMoney(stats.lastMonth)}`,
      tone: 'neutral',
      Icon: CalendarDays,
    },
    {
      label: 'Average per purchase',
      value: fmtMoney(stats.avgPerMeal),
      pill: `${stats.totalTx} purchases`,
      tone: 'neutral',
      Icon: Receipt,
    },
    {
      label: 'Days within limit',
      value: stats.daysUnderBudget !== null ? `${stats.daysUnderBudget} of ${stats.activeDays}` : '—',
      pill: 'Last 30 days',
      tone: 'neutral',
      Icon: Target,
    },
  ];
}

export function StatTiles({ stats, loading }: { stats: AnalyticsStats | null; loading: boolean }) {
  if (loading || !stats) {
    return (
      <div className="tile-grid two">
        {[0, 1, 2, 3].map((i) => (
          <div className="card tile" key={i}>
            <Skeleton width={40} height={40} borderRadius={13} />
            <div style={{ flex: 1 }}><Skeleton width="50%" height={12} /><Skeleton width="80%" height={22} style={{ marginTop: 8 }} /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div className="tile-grid two" variants={stagger} initial="hidden" animate="show">
      {buildTiles(stats).map(({ label, value, pill, tone, Icon }) => (
        <motion.div className="card tile" key={label} variants={rise} whileHover={{ y: -3 }} transition={bouncy}>
          <span className="icon-chip"><Icon size={19} /></span>
          <div className="tile-body">
            <span className="tile-label">{label}</span>
            <span className="tile-value">{value}</span>
            <span className={`pill ${tone}`}>{pill}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
