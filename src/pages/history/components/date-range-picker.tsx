import { motion } from 'framer-motion';
import { todayISO } from '../../../lib/utils';
import type { Filter } from '../history-page';

interface Props {
  filter: Filter;
  singleDate: string;
  rangeFrom: string;
  rangeTo: string;
  onSingleDate: (value: string) => void;
  onRangeFrom: (value: string) => void;
  onRangeTo: (value: string) => void;
}

export function DateRangePicker(props: Props) {
  const today = todayISO();
  if (props.filter !== 'date' && props.filter !== 'custom') return null;
  return (
    <motion.div
      className="date-picker"
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      {props.filter === 'date' ? (
        <>
          <label htmlFor="history-date">DATE</label>
          <input id="history-date" type="date" value={props.singleDate} max={today} onChange={(event) => props.onSingleDate(event.target.value)} />
        </>
      ) : (
        <>
          <label htmlFor="history-from">FROM</label>
          <input id="history-from" type="date" value={props.rangeFrom} max={props.rangeTo || today} onChange={(event) => props.onRangeFrom(event.target.value)} />
          <label htmlFor="history-to">TO</label>
          <input id="history-to" type="date" value={props.rangeTo} min={props.rangeFrom || undefined} max={today} onChange={(event) => props.onRangeTo(event.target.value)} />
        </>
      )}
    </motion.div>
  );
}
