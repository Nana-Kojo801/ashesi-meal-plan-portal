import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../../api';
import { todayISO, yesterdayISO, dateLabel } from '../../lib/utils';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { FilterChips } from './components/filter-chips';
import { DateRangePicker } from './components/date-range-picker';
import { TransactionList } from './components/transaction-list';
import type { HistoryItem } from '../../types';

export type Filter = 'today' | 'yesterday' | 'last2' | 'date' | 'custom';

export function HistoryPage() {
  useAppContext();
  const { studentId } = useSessionStore();
  const [filter, setFilter] = useState<Filter>('today');
  const [customDate, setCustomDate] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const today = todayISO();
    const yesterday = yesterdayISO();
    switch (filter) {
      case 'today':
        return { startDate: today, endDate: today, rangeLabel: 'Today' };
      case 'yesterday':
        return { startDate: yesterday, endDate: yesterday, rangeLabel: 'Yesterday' };
      case 'last2':
        return { startDate: yesterday, endDate: today, rangeLabel: 'Last 2 days' };
      case 'date':
        return {
          startDate: customDate || today,
          endDate: customDate || today,
          rangeLabel: customDate ? dateLabel(customDate) : 'Pick a date',
        };
      case 'custom':
        return {
          startDate: customFrom || today,
          endDate: customTo || today,
          rangeLabel: 'Custom range',
        };
    }
  }, [filter, customDate, customFrom, customTo]);

  const queryReady =
    filter === 'custom' ? !!customFrom && !!customTo : filter === 'date' ? !!customDate : true;

  const {
    data: history = [],
    isLoading,
    error,
    refetch,
  } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId!, startDate, endDate),
    enabled: queryReady && !!studentId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const groups = useMemo(() => {
    const byDate: Record<string, HistoryItem[]> = {};
    history.forEach((item) => {
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
        items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [history]);

  const filteredTotal = history.reduce((s, x) => s + x.cost * x.quantity, 0);
  const errorMsg = error instanceof Error ? error.message : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.05,
          }}
        >
          Purchase history
        </h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>
          Track every meal swipe across the Akorno cafés.
        </div>
      </div>

      <FilterChips active={filter} onChange={setFilter} />

      <DateRangePicker
        filter={filter}
        singleDate={customDate}
        rangeFrom={customFrom}
        rangeTo={customTo}
        onSingleDate={setCustomDate}
        onRangeFrom={setCustomFrom}
        onRangeTo={setCustomTo}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(120deg, #E0233A, #8E0F18)',
          color: '#fff',
          borderRadius: 18,
          padding: '16px 20px',
          boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)',
        }}
      >
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: 0.85 }}>{rangeLabel}</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>
            {history.length} purchases
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: 0.85 }}>Total spent</div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '-1px',
            }}
          >
            GHS {filteredTotal.toFixed(0)}
          </div>
        </div>
      </div>

      <TransactionList
        groups={groups}
        isLoading={isLoading}
        error={errorMsg}
        onRetry={() => void refetch()}
      />
    </div>
  );
}
