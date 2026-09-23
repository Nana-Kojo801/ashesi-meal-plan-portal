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

function MealMark() {
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <circle cx="26" cy="26" r="20.5" fill="none" stroke="currentColor" strokeWidth="5" />
      <rect x="22.5" y="3" width="7" height="46" fill="var(--mark-cut, white)" />
      <path d="M18 7v13m4-13v13m-8-13v13c0 4 2 6 4 6v19" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M34 7v18c0 3-2 5-4 5v15" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand ${inverse ? 'inverse' : ''}`} aria-label="Ashesi Meals">
      <span className="brand-mark"><MealMark /></span>
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
