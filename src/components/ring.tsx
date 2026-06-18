import { motion } from 'framer-motion';

interface RingProps {
  size: number;
  strokeWidth: number;
  fraction: number;
  balance: number;
}

export function Ring({ size, strokeWidth, fraction, balance }: RingProps) {
  const center = size / 2;
  const r = (size - strokeWidth) / 2 - 1;
  const circ = 2 * Math.PI * r;
  const f = Math.min(1, Math.max(0, fraction));
  const offset = circ * (1 - f);
  const lg = size > 160;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center} cy={center} r={r}
          fill="none" stroke="#F0E3D7" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center} cy={center} r={r}
          fill="none" stroke="#D81E2C" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          style={{ rotate: -90, transformOrigin: `${center}px ${center}px` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <div style={{
          fontSize: lg ? '11px' : '9px', fontWeight: 700,
          letterSpacing: '1.5px', color: '#7A6A63',
        }}>GHS</div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: lg ? '46px' : '32px', fontWeight: 700,
          letterSpacing: '-1.5px', lineHeight: 1, color: '#1C1413',
        }}>{balance.toFixed(0)}</div>
        {lg && (
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#7A6A63', maxWidth: '120px', lineHeight: 1.2 }}>
            left to spend today
          </div>
        )}
      </div>
    </div>
  );
}
