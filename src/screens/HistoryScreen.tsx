import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { fetchHistory } from '../api';
import { todayISO, yesterdayISO, dateLabel, formatTime } from '../lib/utils';
import { HistorySkeleton } from '../components/Skeleton';
import type { HistoryItem } from '../types';

type Filter = 'today' | 'yesterday' | 'last2' | 'custom';

interface HistoryScreenProps {
  studentId: string;
  isMobile: boolean;
}

const CHIPS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last2', label: 'Last 2 days' },
  { key: 'custom', label: 'Custom range' },
];

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 16px', borderRadius: 13, fontWeight: 700, fontSize: 13,
    border: `1.5px solid ${active ? '#D81E2C' : '#ECE0D4'}`,
    background: active ? '#D81E2C' : '#fff',
    color: active ? '#fff' : '#1C1413',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  };
}

export function HistoryScreen({ studentId, isMobile: _isMobile }: HistoryScreenProps) {
  const [filter, setFilter] = useState<Filter>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const today = todayISO();
    const yesterday = yesterdayISO();
    switch (filter) {
      case 'today': return { startDate: today, endDate: today, rangeLabel: 'Today' };
      case 'yesterday': return { startDate: yesterday, endDate: yesterday, rangeLabel: 'Yesterday' };
      case 'last2': return { startDate: yesterday, endDate: today, rangeLabel: 'Last 2 days' };
      case 'custom': return { startDate: customFrom || today, endDate: customTo || today, rangeLabel: 'Custom range' };
    }
  }, [filter, customFrom, customTo]);

  const customReady = filter !== 'custom' || (!!customFrom && !!customTo);

  const { data: history = [], isLoading, error, refetch } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId, startDate, endDate),
    enabled: customReady,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const groups = useMemo(() => {
    const byDate: Record<string, HistoryItem[]> = {};
    history.forEach(item => {
      const date = item.date.slice(0, 10);
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(item);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        label: dateLabel(date),
        total: items.reduce((s, x) => s + x.cost * x.quantity, 0),
        items,
      }));
  }, [history]);

  const filteredTotal = history.reduce((s, x) => s + x.cost * x.quantity, 0);
  const errorMsg = error instanceof Error ? error.message : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>Purchase history</h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>Track every meal swipe across the Akorno cafés.</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {CHIPS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={chipStyle(filter === key)}>{label}</button>
        ))}
      </div>

      {filter === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 14, background: '#fff', border: '1px solid #ECE0D4', borderRadius: 18, padding: '16px 18px' }}
        >
          {(['FROM', 'TO'] as const).map((lbl, idx) => (
            <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#7A6A63', letterSpacing: '.3px' }}>{lbl}</label>
              <input
                type="date"
                value={idx === 0 ? customFrom : customTo}
                onChange={e => idx === 0 ? setCustomFrom(e.target.value) : setCustomTo(e.target.value)}
                style={{ background: '#F2E7DC', color: '#1C1413', border: '1px solid #ECE0D4', borderRadius: 11, padding: '10px 12px', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          ))}
        </motion.div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(120deg, #E0233A, #8E0F18)', color: '#fff', borderRadius: 18, padding: '16px 20px', boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)' }}>
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: .85 }}>{rangeLabel}</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{history.length} purchases</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: .85 }}>Total spent</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-1px' }}>GHS {filteredTotal.toFixed(0)}</div>
        </div>
      </div>

      {isLoading ? (
        <HistorySkeleton />
      ) : errorMsg ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{errorMsg}</div>
          <button
            onClick={() => void refetch()}
            style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D81E2C', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '52px 20px', background: '#fff', border: '1px dashed #ECE0D4', borderRadius: 20 }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>No purchases in this range</div>
          <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 5 }}>Try a different date filter.</div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {groups.map((group, gi) => (
            <motion.div key={group.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.07 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 9px' }}>
                <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.2px' }}>{group.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>GHS {group.total.toFixed(0)}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 20, boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)', overflow: 'hidden' }}>
                {group.items.map((tx: HistoryItem, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.07 + i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderTop: i === 0 ? 'none' : '1px solid #ECE0D4' }}
                  >
                    <div style={{ width: 3, height: 34, borderRadius: 99, background: '#D81E2C', opacity: .55, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{tx.name}</div>
                      <div style={{ fontSize: 12, color: '#7A6A63', fontWeight: 600, marginTop: 3 }}>
                        {tx.transaction_point} · Qty {tx.quantity} · {formatTime(tx.date)}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      GHS {(tx.cost * tx.quantity).toFixed(0)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
