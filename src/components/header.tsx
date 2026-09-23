import { motion } from 'framer-motion';
import type { Screen } from '../types';

interface HeaderProps {
  screen: Screen;
  onNav: (screen: Screen) => void;
}

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'report', label: 'History' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'settings', label: 'Settings' },
];

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand ${inverse ? 'inverse' : ''}`} aria-label="Ashesi Meals">
      <span className="brand-mark" aria-hidden="true" />
      <span className="brand-name">Ashesi Meals</span>
    </div>
  );
}

export function Header({ screen, onNav }: HeaderProps) {
  return (
    <header className={`topbar ${screen === 'home' || screen === 'analytics' ? 'mobile-red' : ''}`}>
      <div className="topbar-inner">
        <button onClick={() => onNav('home')} style={{ background: 'transparent', padding: 0 }}>
          <Brand />
        </button>
        <nav className="topnav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              className={`topnav-button ${screen === key ? 'active' : ''}`}
              onClick={() => onNav(key)}
            >
              {label}
              {screen === key && (
                <motion.span
                  layoutId="topnav-indicator"
                  className="topnav-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
