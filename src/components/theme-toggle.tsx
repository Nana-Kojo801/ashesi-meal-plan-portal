import type { MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { changeTheme, useThemeStore } from '../stores/theme-store';
import { bouncy, tapScale } from '../lib/motion';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useThemeStore((state) => state.resolved);
  const dark = resolved === 'dark';

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    changeTheme(dark ? 'light' : 'dark', { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <motion.button
      type="button"
      className={cn('icon-button glass-soft', className)}
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={tapScale}
      transition={bouncy}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={resolved}
          className="icon-swap"
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={bouncy}
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
