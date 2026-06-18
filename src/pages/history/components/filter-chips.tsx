import type { Filter } from '../history-page';

interface Chip {
  key: Filter;
  label: string;
}

const CHIPS: Chip[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last2', label: 'Last 2 days' },
  { key: 'date', label: 'Pick a date' },
  { key: 'custom', label: 'Date range' },
];

interface FilterChipsProps {
  active: Filter;
  onChange: (filter: Filter) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
      {CHIPS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '10px 16px',
            borderRadius: 13,
            fontWeight: 700,
            fontSize: 13,
            border: `1.5px solid ${active === key ? '#D81E2C' : '#ECE0D4'}`,
            background: active === key ? '#D81E2C' : '#fff',
            color: active === key ? '#fff' : '#1C1413',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
