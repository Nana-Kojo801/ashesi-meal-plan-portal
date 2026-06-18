import { motion } from 'framer-motion';
import { todayISO } from '../../../lib/utils';
import type { Filter } from '../history-page';

const inputStyle: React.CSSProperties = {
  background: '#F2E7DC',
  border: '1.5px solid #ECE0D4',
  borderRadius: 12,
  padding: '9px 12px',
  fontWeight: 600,
  fontSize: 13,
  color: '#1C1413',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#7A6A63',
  letterSpacing: '.3px',
  flexShrink: 0,
};

interface DateRangePickerProps {
  filter: Filter;
  singleDate: string;
  rangeFrom: string;
  rangeTo: string;
  onSingleDate: (val: string) => void;
  onRangeFrom: (val: string) => void;
  onRangeTo: (val: string) => void;
}

export function DateRangePicker({
  filter,
  singleDate,
  rangeFrom,
  rangeTo,
  onSingleDate,
  onRangeFrom,
  onRangeTo,
}: DateRangePickerProps) {
  const today = todayISO();

  if (filter === 'date') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 18,
          padding: '14px 18px',
        }}
      >
        <span style={labelStyle}>DATE</span>
        <input
          type="date"
          value={singleDate}
          onChange={(e) => onSingleDate(e.target.value)}
          max={today}
          style={inputStyle}
        />
      </motion.div>
    );
  }

  if (filter === 'custom') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 18,
          padding: '14px 18px',
        }}
      >
        <span style={labelStyle}>FROM</span>
        <input
          type="date"
          value={rangeFrom}
          onChange={(e) => onRangeFrom(e.target.value)}
          max={rangeTo || today}
          style={inputStyle}
        />
        <span style={labelStyle}>TO</span>
        <input
          type="date"
          value={rangeTo}
          onChange={(e) => onRangeTo(e.target.value)}
          min={rangeFrom || undefined}
          max={today}
          style={inputStyle}
        />
      </motion.div>
    );
  }

  return null;
}
