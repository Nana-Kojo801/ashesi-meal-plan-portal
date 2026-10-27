import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { bouncy } from '../../../lib/motion';
import { fmtMoney } from '../../../lib/utils';

interface SpendChartProps {
  data: { date: string; label: string; spend: number }[];
  dailyLimit: number;
}

function smoothPath(points: [number, number][], H: number) {
  const clamp = (y: number) => Math.max(1, Math.min(H, y));
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clamp(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clamp(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** 30-day spend line with a dashed daily-limit line and a tap/hover readout. */
export function SpendChart({ data, dailyLimit }: SpendChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ W: 600, H: 220 });
  const { W, H } = size;

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ W: Math.max(1, entry.contentRect.width), H: Math.max(1, entry.contentRect.height) }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const peak = Math.max(...data.map((d) => d.spend), dailyLimit, 1);
  const max = Math.ceil((peak * 1.1) / 30) * 30;
  const points = data.map((d, i): [number, number] => [(i / (data.length - 1)) * W, H - (d.spend / max) * H]);
  const line = smoothPath(points, H);
  const ticks = [max, (max * 2) / 3, max / 3, 0];
  const labelEvery = Math.ceil(data.length / 6);
  const peakDay = data.reduce((a, b) => (b.spend > a.spend ? b : a), data[0]);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setActive(Math.round(ratio * (data.length - 1)));
  };

  const activePoint = active !== null ? data[active] : null;

  return (
    <div className="spend-chart">
      <div className="chart-axis" aria-hidden="true">
        {ticks.map((tick) => <span key={tick}>{Math.round(tick)}</span>)}
      </div>
      <div className="chart-body">
        <div
          ref={plotRef}
          className="chart-plot"
          data-no-swipe
          onPointerMove={track}
          onPointerDown={track}
          onPointerLeave={() => setActive(null)}
          role="img"
          aria-label={`Daily spending over the last ${data.length} days, peaking at ${fmtMoney(peakDay.spend)} on ${peakDay.label}`}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {ticks.map((tick) => (
              <line key={tick} x1="0" x2={W} y1={H - (tick / max) * H} y2={H - (tick / max) * H} className="chart-grid" />
            ))}
            <motion.path
              d={`${line} L${W},${H} L0,${H} Z`}
              className="chart-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            {dailyLimit > 0 && (
              <line x1="0" x2={W} y1={H - (dailyLimit / max) * H} y2={H - (dailyLimit / max) * H} className="chart-limit" />
            )}
            <motion.path
              d={line}
              className="chart-line"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ type: 'spring', stiffness: 40, damping: 16, delay: 0.15 }}
            />
          </svg>
          <AnimatePresence>
            {activePoint && active !== null && (
              <motion.div
                className="chart-cursor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, left: `${(active / (data.length - 1)) * 100}%` }}
                exit={{ opacity: 0 }}
                transition={bouncy}
              >
                <motion.span
                  className="chart-dot"
                  animate={{ top: `${(1 - activePoint.spend / max) * 100}%` }}
                  transition={bouncy}
                />
                <motion.span className="chart-tip glass-strong" initial={{ scale: 0.8, y: 6 }} animate={{ scale: 1, y: 0 }} transition={bouncy}>
                  <small>{activePoint.label}</small>
                  <strong>{fmtMoney(activePoint.spend)}</strong>
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="chart-x" aria-hidden="true">
          {data.map((d, i) => ((i === data.length - 1 || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery / 2)) ? (
            <span key={d.date} style={{ left: `${(i / (data.length - 1)) * 100}%` }}>{i === data.length - 1 ? 'Today' : d.label}</span>
          ) : null))}
        </div>
      </div>
    </div>
  );
}
