import { motion } from 'framer-motion';
import type { Filter } from '../history-page';

const CHIPS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last2', label: 'Last 2 days' },
  { key: 'date', label: 'Pick a date' },
  { key: 'custom', label: 'Date range' },
];

export function FilterChips({ active, onChange }: { active: Filter; onChange: (filter: Filter) => void }) {
  return (
    <div className="filter-row">
      {CHIPS.map(({ key, label }) => (
        <motion.button
          whileTap={{ scale: .93 }}
          key={key}
          className={`filter-button ${active === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}
