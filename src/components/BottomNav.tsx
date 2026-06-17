import { Home, Receipt, BarChart3, Settings } from 'lucide-react';
import type { Screen } from '../types';

interface BottomNavProps {
  screen: Screen;
  onNav: (s: Screen) => void;
}

const ITEMS: { key: Screen; label: string; Icon: typeof Home }[] = [
  { key: 'home',      label: 'Home',      Icon: Home },
  { key: 'report',    label: 'History',   Icon: Receipt },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
  { key: 'settings',  label: 'Settings',  Icon: Settings },
];

export function BottomNav({ screen, onNav }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 'calc(16px + env(safe-area-inset-bottom))',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255,255,255,.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 36,
      boxShadow: '0 6px 28px -4px rgba(60,15,8,.20), 0 2px 8px rgba(0,0,0,.06), 0 0 0 1px rgba(226,210,196,.7)',
      padding: '6px 10px',
      gap: 2,
      width: 'calc(100vw - 32px)',
      maxWidth: 360,
    }}>
      {ITEMS.map(({ key, label, Icon }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            onClick={() => onNav(key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px 0', borderRadius: 28,
            }}
          >
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 38, borderRadius: 22,
              background: active ? '#D81E2C' : 'transparent',
              color: active ? '#fff' : '#9A8A82',
              transition: 'background .18s ease, color .18s ease',
              boxShadow: active ? '0 4px 14px -4px rgba(216,30,44,.45)' : 'none',
            }}>
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span style={{
              fontWeight: 700, fontSize: '9.5px', letterSpacing: '.15px',
              color: active ? '#D81E2C' : '#9A8A82',
              transition: 'color .18s ease',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
