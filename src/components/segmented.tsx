import { motion } from 'framer-motion';
import { bouncy, tapScale } from '../lib/motion';
import { cn } from '../lib/utils';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  /** Unique per instance so the sliding thumb animates within its own control. */
  layoutId: string;
  className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, label, layoutId, className }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('segmented glass-soft', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <motion.button
            key={option.value}
            type="button"
            className={cn('segmented-button', active && 'active')}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            whileTap={tapScale}
            transition={bouncy}
          >
            {active && <motion.span layoutId={layoutId} className="segmented-thumb" transition={bouncy} />}
            <span className="segmented-label">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
