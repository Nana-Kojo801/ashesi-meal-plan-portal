import { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bouncy, spring, tapScale } from '../lib/motion';
import { isoDate } from '../lib/utils';

interface CalendarProps {
  from: string;
  to: string;
  max: string;
  onSelect: (day: string) => void;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const monthSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

function monthStart(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

/** Month grid with range highlighting; days after `max` are disabled. */
export function Calendar({ from, to, max, onSelect }: CalendarProps) {
  const [month, setMonth] = useState(() => monthStart(to));
  const [direction, setDirection] = useState(0);
  const maxMonth = monthStart(max);
  const atLatest = month.getFullYear() === maxMonth.getFullYear() && month.getMonth() === maxMonth.getMonth();

  const shift = (delta: number) => {
    setDirection(delta);
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const lead = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => isoDate(new Date(month.getFullYear(), month.getMonth(), i + 1))),
  ];
  const single = from === to;
  const title = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar">
      <div className="calendar-head">
        <h2 className="card-title">{title}</h2>
        <div className="calendar-nav">
          <motion.button type="button" className="icon-button glass-soft" aria-label="Previous month" onClick={() => shift(-1)} whileTap={tapScale} transition={bouncy}>
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button type="button" className="icon-button glass-soft" aria-label="Next month" onClick={() => shift(1)} disabled={atLatest} whileTap={tapScale} transition={bouncy}>
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
      <div className="calendar-grid weekdays" aria-hidden="true">
        {WEEKDAYS.map((day, i) => <span key={i}>{day}</span>)}
      </div>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={title}
          className="calendar-grid"
          custom={direction}
          variants={monthSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={spring}
        >
          {cells.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />;
            const disabled = day > max;
            const inRange = day >= from && day <= to;
            const edge = day === from || day === to;
            const classes = [
              'calendar-cell',
              inRange && !single && 'in-range',
              day === from && !single && 'range-start',
              day === to && !single && 'range-end',
            ].filter(Boolean).join(' ');
            return (
              <span key={day} className={classes}>
                <motion.button
                  type="button"
                  className={`calendar-day ${edge ? 'selected' : ''} ${day === max ? 'today' : ''}`}
                  disabled={disabled}
                  aria-pressed={edge}
                  aria-label={new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  onClick={() => onSelect(day)}
                  whileTap={disabled ? undefined : { scale: 0.85 }}
                  transition={bouncy}
                >
                  {Number(day.slice(8))}
                </motion.button>
              </span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
