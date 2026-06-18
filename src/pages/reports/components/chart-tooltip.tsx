import { fmtAmount } from '../../../lib/utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ECE0D4',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 700,
        boxShadow: '0 8px 20px -8px rgba(60,15,8,.18)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ color: '#7A6A63', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#D81E2C' }}>GHS {fmtAmount(payload[0].value)}</div>
    </div>
  );
}
