import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchHistory } from '../../api';
import { todayISO, yesterdayISO, dateLabel, fmtAmount } from '../../lib/utils';
import { useSessionStore } from '../../stores/session-store';
import { FilterChips } from './components/filter-chips';
import { DateRangePicker } from './components/date-range-picker';
import { TransactionList } from './components/transaction-list';
import type { HistoryItem } from '../../types';

export type Filter = 'today' | 'yesterday' | 'last2' | 'date' | 'custom';

export function HistoryPage() {
  const { studentId } = useSessionStore();
  const [filter, setFilter] = useState<Filter>('today');
  const [customDate, setCustomDate] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const today = todayISO();
    const yesterday = yesterdayISO();
    if (filter === 'yesterday') return { startDate: yesterday, endDate: yesterday, rangeLabel: 'Yesterday' };
    if (filter === 'last2') return { startDate: yesterday, endDate: today, rangeLabel: 'Last 2 days' };
    if (filter === 'date') return { startDate: customDate || today, endDate: customDate || today, rangeLabel: customDate ? dateLabel(customDate) : 'Pick a date' };
    if (filter === 'custom') return { startDate: customFrom || today, endDate: customTo || today, rangeLabel: 'Custom range' };
    return { startDate: today, endDate: today, rangeLabel: 'Today' };
  }, [filter, customDate, customFrom, customTo]);

  const queryReady = filter === 'custom' ? Boolean(customFrom && customTo) : filter === 'date' ? Boolean(customDate) : true;
  const { data: history = [], isLoading, error, refetch } = useQuery<HistoryItem[]>({
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
      (byDate[date] ??= []).push(item);
    });
    return Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => ({
      date,
      label: dateLabel(date),
      total: items.reduce((sum, item) => sum + item.cost * item.quantity, 0),
      items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, [history]);

  const total = history.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  return (
    <div className="page history-page">
      <header className="page-heading">
        <h1 className="page-title">Purchase history</h1>
        <p className="page-subtitle">Track every meal swipe across the Akorno cafés.</p>
      </header>
      <FilterChips active={filter} onChange={setFilter} />
      <AnimatePresence mode="wait">
        <DateRangePicker
          filter={filter}
          singleDate={customDate}
          rangeFrom={customFrom}
          rangeTo={customTo}
          onSingleDate={setCustomDate}
          onRangeFrom={setCustomFrom}
          onRangeTo={setCustomTo}
        />
      </AnimatePresence>
      <motion.section className="history-summary red-plane" layout>
        <div className="history-summary-block">
          <span className="eyebrow">{rangeLabel}</span>
          <strong>{history.length} purchase{history.length === 1 ? '' : 's'}</strong>
        </div>
        <div className="history-summary-block">
          <span className="eyebrow">Total spent</span>
          <motion.strong key={total} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            GHS {fmtAmount(total)}
          </motion.strong>
        </div>
      </motion.section>
      <TransactionList groups={groups} isLoading={isLoading} error={error instanceof Error ? error.message : null} onRetry={() => void refetch()} />
    </div>
  );
}
