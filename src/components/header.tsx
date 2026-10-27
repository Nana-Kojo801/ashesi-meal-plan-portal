import { motion } from 'framer-motion';
import { NAV_ITEMS } from './nav-items';
import { ThemeToggle } from './theme-toggle';
import { bouncy, pressScale } from '../lib/motion';
import type { Screen } from '../types';

interface SidebarProps {
  screen: Screen;
  onNav: (screen: Screen) => void;
  studentName: string;
  studentId: string;
}

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="currentColor" aria-hidden="true">
      <path d="M29 3.5a22.7 22.7 0 0 1 0 45V42a16.3 16.3 0 0 0 0-31.8ZM12 8.6v8.7a16.3 16.3 0 0 0 6 24.2v7A22.7 22.7 0 0 1 12 8.6Z" />
      <path d="M16 4h2.5v19H16zm5-1h2.5v20H21zm5 0h2.5v20H26zM16 21h12.5v3a6.3 6.3 0 0 1-4.1 6v19h-4.2V30a6.3 6.3 0 0 1-4.2-6Z" />
    </svg>
  );
}

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand ${inverse ? 'inverse' : ''}`}>
      <span className="brand-mark"><BrandMark /></span>
      <span className="brand-name">Ashesi Meals</span>
    </span>
  );
}

export function Sidebar({ screen, onNav, studentName, studentId }: SidebarProps) {
  return (
    <aside className="sidebar glass">
      <button type="button" className="sidebar-brand" onClick={() => onNav('home')} aria-label="Ashesi Meals home">
        <Brand />
      </button>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = screen === key;
          return (
            <motion.button
              key={key}
              type="button"
              className={`sidebar-link ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNav(key)}
              whileTap={pressScale}
              whileHover={{ x: 3 }}
              transition={bouncy}
            >
              {active && <motion.span layoutId="sidebar-pill" className="sidebar-pill" transition={bouncy} />}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.9} />
              <span>{label}</span>
            </motion.button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <motion.button
          type="button"
          className="profile-chip"
          onClick={() => onNav('settings')}
          whileTap={pressScale}
          transition={bouncy}
        >
          <span className="avatar small">{(studentName[0] ?? 'A').toUpperCase()}</span>
          <span className="profile-chip-text">
            <strong>{studentName}</strong>
            <small>ID {studentId}</small>
          </span>
        </motion.button>
        <ThemeToggle />
      </div>
    </aside>
  );
}
