import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import type { Screen, BalanceData } from '../types';
import { fmtAmount } from '../lib/utils';

interface HeaderProps {
  screen: Screen;
  onNav: (screen: Screen) => void;
  balanceData: BalanceData | null;
  studentInitial: string;
  isMobile: boolean;
}

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'report', label: 'History' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'settings', label: 'Settings' },
];

export function Brand() {
  return (
    <div className="brand" aria-label="Ashesi Meals">
      <span className="brand-mark"><UtensilsCrossed size={19} strokeWidth={2.5} /></span>
      <span className="brand-name">Ashesi Meals</span>
    </div>
  );
}

export function Header({ screen, onNav, balanceData, studentInitial }: HeaderProps) {
  return (
    <header className="topbar">
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
        <div className="topbar-account">
          {balanceData && (
            <div className="balance-chip">
              <div>
                <strong>GHS {fmtAmount(balanceData.current_balance)}</strong>
                <small>Current balance</small>
              </div>
            </div>
          )}
          <button className="avatar" onClick={() => onNav('settings')} aria-label="Open settings">
            {studentInitial}
          </button>
        </div>
      </div>
    </header>
  );
}
