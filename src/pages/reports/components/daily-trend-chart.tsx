import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartCard } from './chart-card';
import { ChartTooltip } from './chart-tooltip';

const RED = '#D81E2C';

interface DailyTrendChartProps {
  data: { date: string; label: string; spend: number }[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  return (
    <ChartCard title="Daily spending trend" sub="Last 30 days" delay={0.24}>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            interval={6}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#7A6A63', fontWeight: 600, dx: -16 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="spend"
            stroke={RED}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: RED, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
