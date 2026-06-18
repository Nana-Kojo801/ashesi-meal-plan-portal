import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ChartCard } from './chart-card';
import { ChartTooltip } from './chart-tooltip';
import { DAYS } from '../hooks/use-analytics';

interface DayOfWeekChartProps {
  data: { label: string; spend: number }[];
  peakDowIdx: number;
}

export function DayOfWeekChart({ data, peakDowIdx }: DayOfWeekChartProps) {
  const maxSpend = Math.max(...data.map((d) => d.spend)) || 1;

  return (
    <ChartCard
      title="Spending by day of week"
      sub={`Busiest: ${DAYS[peakDowIdx]}`}
      delay={0.36}
    >
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#7A6A63', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => {
              const intensity = entry.spend / maxSpend;
              return (
                <Cell
                  key={i}
                  fill={intensity > 0.7 ? '#D81E2C' : intensity > 0.4 ? '#E85C6A' : '#F2E7DC'}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
