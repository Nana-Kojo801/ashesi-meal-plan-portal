import { motion } from 'framer-motion';
import { Home, Receipt, BarChart3, Calculator, Settings } from 'lucide-react';
import type { Screen } from '../types';

interface BottomNavProps {
  screen: Screen;
  onNav: (screen: Screen) => void;
}

const ITEMS: { key: Screen; label: string; Icon: typeof Home }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'report', label: 'History', Icon: Receipt },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
  { key: 'calculator', label: 'Calculator', Icon: Calculator },
  { key: 'settings', label: 'Settings', Icon: Settings },
];

export function BottomNav({ screen, onNav }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {ITEMS.map(({ key, label, Icon }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            className={`bottom-nav-button ${active ? 'active' : ''}`}
            onClick={() => onNav(key)}
          >
            <motion.span animate={{ y: active ? -1 : 0 }} transition={{ type: 'spring', stiffness: 500 }}>
              <Icon size={20} strokeWidth={active ? 2.6 : 2} />
            </motion.span>
            <span>{label}</span>
            {active && <motion.i layoutId="bottom-nav-dot" className="bottom-nav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
