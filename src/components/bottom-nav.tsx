import { motion } from 'framer-motion';
import { NAV_ITEMS } from './nav-items';
import { bouncy, tapScale } from '../lib/motion';
import type { Screen } from '../types';

interface BottomNavProps {
  screen: Screen;
  onNav: (screen: Screen) => void;
}

export function BottomNav({ screen, onNav }: BottomNavProps) {
  return (
    <motion.nav
      className="tab-bar glass"
      aria-label="Main navigation"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...bouncy, delay: 0.1 }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const active = screen === key;
        return (
          <motion.button
            key={key}
            type="button"
            className={`tab-button ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNav(key)}
            whileTap={tapScale}
            transition={bouncy}
          >
            {active && <motion.span layoutId="tab-pill" className="tab-pill" transition={bouncy} />}
            <motion.span
              className="tab-icon"
              animate={{ y: active ? -1 : 0, scale: active ? 1.08 : 1 }}
              transition={bouncy}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.9} />
            </motion.span>
            <span className="tab-label">{label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
