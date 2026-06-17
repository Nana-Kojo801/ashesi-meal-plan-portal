import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../api';
import type { HistoryItem } from '../types';

interface SpendingCalendarProps {
  studentId: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_LABELS = ['S','M','T','W','T','F','S'];
const CELL = 13;
const GAP  = 3;
const DOW_W = 14;

function isoToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

function cellColor(spend: number, max: number): string {
  if (spend === 0 || max === 0) return '#F2E7DC';
  const r = spend / max;
  if (r < 0.2)  return '#FAD9DC';
  if (r < 0.4)  return '#F5B8BD';
  if (r < 0.65) return '#E85C6A';
  return '#D81E2C';
}

export function SpendingCalendar({ studentId, selectedDate, onSelectDate }: SpendingCalendarProps) {
  const today     = isoToday();
  const startDate = nDaysAgo(59);

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, today],
    queryFn: () => fetchHistory(studentId, startDate, today),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { weeks, maxSpend } = useMemo(() => {
    const spendMap: Record<string, number> = {};
    history.forEach(tx => {
      const d = tx.date.slice(0, 10);
      spendMap[d] = (spendMap[d] ?? 0) + tx.cost * tx.quantity;
    });

    // build 60 days oldest→newest
    type Day = { iso: string; spend: number; dow: number; month: number; dayNum: number };
    const allDays: Day[] = [];
    for (let i = 59; i >= 0; i--) {
      const iso = nDaysAgo(i);
      const d = new Date(iso + 'T00:00:00');
      allDays.push({ iso, spend: spendMap[iso] ?? 0, dow: d.getDay(), month: d.getMonth(), dayNum: d.getDate() });
    }

    // pad start so first day lands on correct row
    const padded: (Day | null)[] = [...Array(allDays[0].dow).fill(null), ...allDays];
    // split into week columns of 7
    const wks: (Day | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      const col = padded.slice(i, i + 7);
      while (col.length < 7) col.push(null);
      wks.push(col);
    }

    const maxSpend = Math.max(...allDays.map(d => d.spend), 1);
    return { weeks: wks, maxSpend };
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      style={{
        background: '#fff', border: '1px solid #ECE0D4', borderRadius: 22,
        padding: '18px 20px',
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.20)',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Spending activity</div>

      {isLoading ? (
        <div style={{ display: 'flex', gap: GAP }}>
          {Array.from({ length: 10 }).map((_, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {Array.from({ length: 7 }).map((_, di) => (
                <div key={di} style={{ width: CELL, height: CELL, borderRadius: 3, background: '#F2E7DC', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: GAP }}>

            {/* month labels */}
            <div style={{ display: 'flex', gap: GAP, paddingLeft: DOW_W + GAP }}>
              {weeks.map((week, wi) => {
                const first = week.find(d => d !== null);
                const show  = first && first.dayNum <= 7;
                return (
                  <div key={wi} style={{ width: CELL, fontSize: 9, fontWeight: 700, color: '#7A6A63', whiteSpace: 'nowrap', overflow: 'visible' }}>
                    {show ? MONTHS[first.month] : ''}
                  </div>
                );
              })}
            </div>

            {/* rows = day of week */}
            {[0,1,2,3,4,5,6].map(dow => (
              <div key={dow} style={{ display: 'flex', alignItems: 'center', gap: GAP }}>
                <div style={{ width: DOW_W, fontSize: 9, fontWeight: 700, color: '#9A8A82', textAlign: 'right', paddingRight: 3, flexShrink: 0 }}>
                  {dow % 2 === 1 ? DOW_LABELS[dow] : ''}
                </div>
                {weeks.map((week, wi) => {
                  const cell = week[dow];
                  if (!cell) return <div key={wi} style={{ width: CELL, height: CELL, flexShrink: 0 }} />;

                  const isSelected = cell.iso === selectedDate;
                  const isToday    = cell.iso === today;

                  return (
                    <div
                      key={wi}
                      title={`${cell.iso}${cell.spend > 0 ? ` · GHS ${Math.round(cell.spend)}` : ' · No spend'}`}
                      onClick={() => onSelectDate(cell.iso)}
                      style={{
                        width: CELL, height: CELL, borderRadius: 3, flexShrink: 0,
                        background: cellColor(cell.spend, maxSpend),
                        cursor: 'pointer',
                        outline: isSelected
                          ? '2px solid #D81E2C'
                          : isToday
                            ? '1.5px solid #C4A898'
                            : 'none',
                        outlineOffset: isSelected ? 1.5 : 0,
                        transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                        transition: 'transform .12s ease, outline .12s ease',
                        zIndex: isSelected ? 1 : 0,
                        position: 'relative',
                      }}
                    />
                  );
                })}
              </div>
            ))}

            {/* legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: DOW_W + GAP, marginTop: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#9A8A82' }}>Less</span>
              {['#F2E7DC','#FAD9DC','#F5B8BD','#E85C6A','#D81E2C'].map(c => (
                <div key={c} style={{ width: CELL, height: CELL, borderRadius: 3, background: c }} />
              ))}
              <span style={{ fontSize: 9, fontWeight: 700, color: '#9A8A82' }}>More</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
