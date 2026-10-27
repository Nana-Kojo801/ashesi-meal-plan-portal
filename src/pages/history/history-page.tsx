import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { fetchHistory } from '../../api';
import { todayISO, yesterdayISO, dateLabel, fmtMoney } from '../../lib/utils';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { Segmented } from '../../components/segmented';
import { Calendar } from '../../components/calendar';
import { Sheet } from '../../components/sheet';
import { AnimatedNumber } from '../../components/animated-number';
import { TransactionList } from './components/transaction-list';
import { bouncy, rise, stagger, tapScale } from '../../lib/motion';
import type { HistoryItem } from '../../types';

export type Filter = 'today' | 'yesterday' | 'last2' | 'custom';

const PRESETS: { value: Exclude<Filter, 'custom'>; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last2', label: 'Last 2 days' },
];

function shortDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function HistoryPage() {
  const { isMobile } = useAppContext();
  const { studentId } = useSessionStore();
  const [filter, setFilter] = useState<Filter>('today');
  const [custom, setCustom] = useState(() => ({ from: todayISO(), to: todayISO() }));
  const [pickingEnd, setPickingEnd] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const today = todayISO();
    const yesterday = yesterdayISO();
    if (filter === 'yesterday') return { startDate: yesterday, endDate: yesterday, rangeLabel: 'Yesterday' };
    if (filter === 'last2') return { startDate: yesterday, endDate: today, rangeLabel: 'Last 2 days' };
    if (filter === 'custom') {
      const label = custom.from === custom.to ? dateLabel(custom.from) : `${shortDay(custom.from)} – ${shortDay(custom.to)}`;
      return { startDate: custom.from, endDate: custom.to, rangeLabel: label };
    }
    return { startDate: today, endDate: today, rangeLabel: 'Today' };
  }, [filter, custom]);

  const { data: history = [], isLoading, error, refetch } = useQuery<HistoryItem[]>({
    queryKey: ['history', studentId, startDate, endDate],
    queryFn: () => fetchHistory(studentId!, startDate, endDate),
    enabled: !!studentId,
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
  const average = history.length ? total / history.length : 0;

  const selectDay = (day: string) => {
    if (!pickingEnd || day < custom.from) {
      setCustom({ from: day, to: day });
      setPickingEnd(true);
    } else {
      setCustom({ from: custom.from, to: day });
      setPickingEnd(false);
    }
    setFilter('custom');
  };

  const choosePreset = (value: Filter) => {
    setFilter(value);
    setPickingEnd(false);
  };

  const calendar = <Calendar from={startDate} to={endDate} max={todayISO()} onSelect={selectDay} />;
  const rangeHint = pickingEnd ? 'Tap an end date, or keep this single day' : 'Tap a day, then another to pick a range';

  return (
    <motion.div className="page" variants={stagger} initial="hidden" animate="show">
      <motion.header className="page-header" variants={rise}>
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">Every purchase across campus cafés.</p>
        </div>
        {isMobile ? (
          <motion.button
            type="button"
            className={`icon-button glass-soft large ${filter === 'custom' ? 'active' : ''}`}
            aria-label="Pick a date or range"
            onClick={() => setCalendarOpen(true)}
            whileTap={tapScale}
            transition={bouncy}
          >
            <CalendarDays size={20} />
          </motion.button>
        ) : (
          <Segmented options={PRESETS} value={filter === 'custom' ? null : filter} onChange={choosePreset} label="Date filter" layoutId="history-filter" />
        )}
      </motion.header>

      {isMobile && (
        <motion.div variants={rise}>
          <Segmented options={PRESETS} value={filter === 'custom' ? null : filter} onChange={choosePreset} label="Date filter" layoutId="history-filter" className="full" />
        </motion.div>
      )}

      <motion.div className="tile-grid three" variants={rise}>
        <div className="card tile stacked">
          <span className="tile-label">{rangeLabel}</span>
          <span className="tile-value large"><AnimatedNumber value={total} format={fmtMoney} /></span>
        </div>
        <div className="card tile stacked">
          <span className="tile-label">Purchases</span>
          <span className="tile-value large"><AnimatedNumber value={history.length} format={(v) => String(Math.round(v))} /></span>
        </div>
        <div className="card tile stacked desktop-only">
          <span className="tile-label">Average per purchase</span>
          <span className="tile-value large"><AnimatedNumber value={average} format={fmtMoney} /></span>
        </div>
      </motion.div>

      <div className="columns">
        <motion.div className="column-main" variants={rise}>
          <TransactionList
            key={`${startDate}-${endDate}`}
            groups={groups}
            isLoading={isLoading}
            error={error instanceof Error ? error.message : null}
            onRetry={() => void refetch()}
          />
        </motion.div>
        {!isMobile && (
          <motion.aside className="column-side" variants={rise}>
            <section className="card calendar-card" aria-label="Pick dates">
              {calendar}
              <p className="calendar-hint">{rangeHint}</p>
            </section>
          </motion.aside>
        )}
      </div>

      {isMobile && (
        <Sheet open={calendarOpen} onClose={() => setCalendarOpen(false)} label="Pick dates">
          <div className="sheet-body">
            {calendar}
            <p className="calendar-hint">{rangeHint}</p>
            <motion.button type="button" className="button dark wide" onClick={() => setCalendarOpen(false)} whileTap={tapScale} transition={bouncy}>
              Show {rangeLabel === 'Today' ? 'today' : rangeLabel}
            </motion.button>
          </div>
        </Sheet>
      )}
    </motion.div>
  );
}
