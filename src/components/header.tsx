import { UtensilsCrossed, Home, Receipt, BarChart3, Calculator, Settings } from 'lucide-react';
import type { Screen, BalanceData } from '../types';
import { fmtAmount } from '../lib/utils';

interface HeaderProps {
  screen: Screen;
  onNav: (s: Screen) => void;
  balanceData: BalanceData | null;
  studentInitial: string;
  isMobile: boolean;
}

const NAV_ITEMS: { key: Screen; label: string }[] = [
  { key: 'home',       label: 'Dashboard' },
  { key: 'report',     label: 'History' },
  { key: 'analytics',  label: 'Analytics' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'settings',   label: 'Settings' },
];

const NAV_ICONS = {
  home: Home,
  report: Receipt,
  analytics: BarChart3,
  calculator: Calculator,
  settings: Settings,
} as const;

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: '#D81E2C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 18px -8px rgba(216,30,44,.55)',
      }}>
        <UtensilsCrossed size={20} color="#fff" />
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.3px', whiteSpace: 'nowrap' }}>
        Ashesi Meals
      </div>
    </div>
  );
}

function AvatarButton({ initial, onClick }: { initial: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'linear-gradient(135deg, #E0233A, #8E0F18)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 15, flexShrink: 0,
        border: 'none', cursor: 'pointer',
      }}
    >
      {initial}
    </button>
  );
}

export function Header({ screen, onNav, balanceData, studentInitial, isMobile }: HeaderProps) {
  const dailyBalance = balanceData?.current_balance ?? 0;
  const dailyLimit = balanceData?.daily_spending_limit ?? 1;
  const frac = Math.min(1, Math.max(0, dailyLimit > 0 ? dailyBalance / dailyLimit : 0));
  const miniR = 11;
  const miniCirc = 2 * Math.PI * miniR;
  const miniOffset = miniCirc * (1 - frac);

  if (isMobile) {
    return (
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 16px',
        background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #ECE0D4',
      }}>
        <Logo />
        <div style={{ flex: 1 }} />
        <AvatarButton initial={studentInitial} onClick={() => onNav('settings')} />
      </header>
    );
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 30px',
      background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid #ECE0D4',
    }}>
      <Logo />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F2E7DC', padding: 5, borderRadius: 16 }}>
          {NAV_ITEMS.map(({ key, label }) => {
            const active = screen === key;
            const Icon = NAV_ICONS[key];
            return (
              <button
                key={key}
                onClick={() => onNav(key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 11,
                  fontWeight: 700, fontSize: '13.5px',
                  background: active ? '#D81E2C' : 'transparent',
                  color: active ? '#fff' : '#7A6A63',
                  boxShadow: active ? '0 8px 16px -10px rgba(216,30,44,.55)' : 'none',
                  transition: 'background .15s, color .15s',
                  fontFamily: 'inherit', border: 'none', cursor: 'pointer',
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {balanceData && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #ECE0D4',
            padding: '6px 14px 6px 8px', borderRadius: 14,
            boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
          }}>
            <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }}>
              <svg width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r={miniR} fill="none" stroke="#F0E3D7" strokeWidth="4" />
                <circle cx="15" cy="15" r={miniR} fill="none" stroke="#D81E2C" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={miniCirc}
                  strokeDashoffset={miniOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '15px 15px' }}
                />
              </svg>
            </div>
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-.3px' }}>
                GHS {fmtAmount(dailyBalance)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7A6A63', letterSpacing: '.2px' }}>
                LEFT TODAY
              </div>
            </div>
          </div>
        )}
        <AvatarButton initial={studentInitial} onClick={() => onNav('settings')} />
      </div>
    </header>
  );
}
