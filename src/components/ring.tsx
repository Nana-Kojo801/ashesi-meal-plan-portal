import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RingProps {
  size: number;
  strokeWidth: number;
  fraction: number;
  children?: ReactNode;
}

export function Ring({ size, strokeWidth, fraction, children }: RingProps) {
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const f = Math.min(1, Math.max(0, fraction));

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={center} cy={center} r={r} fill="none" className="progress-ring-track" strokeWidth={strokeWidth} />
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          className="progress-ring-value"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - f) }}
          transition={{ type: 'spring', stiffness: 70, damping: 15, mass: 1, delay: 0.15 }}
          style={{ rotate: -90, transformOrigin: `${center}px ${center}px` }}
        />
      </svg>
      <div className="progress-ring-center">{children}</div>
    </div>
  );
}
