import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CreditCard, LogOut, Mail, Monitor, Moon, Sun } from 'lucide-react';
import { SettingsSkeleton } from '../../components/skeleton';
import { resetPin } from '../../api';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { changeTheme, useThemeStore, type ThemePref } from '../../stores/theme-store';
import { bouncy, pressScale, rise, stagger, tapScale } from '../../lib/motion';
import { fmtMoney } from '../../lib/utils';

const THEMES: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function SettingsPage() {
  const { balanceData, loadingBalance, studentName, logout, showToast } = useAppContext();
  const { studentId } = useSessionStore();
  const themePref = useThemeStore((state) => state.pref);
  const [pinLoading, setPinLoading] = useState(false);
  const initial = (studentName[0] ?? 'A').toUpperCase();
  const firstName = balanceData?.firstname ?? studentName.split(' ')[0] ?? '';
  const lastName = balanceData?.lastname ?? studentName.split(' ')[1] ?? '';
  const email = firstName && lastName
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ashesi.edu.gh`
    : `${studentId}@ashesi.edu.gh`;
  const active = (balanceData?.subscriber_status ?? 'Active').toLowerCase() === 'active';

  const handleResetPin = async () => {
    setPinLoading(true);
    try {
      await resetPin(studentId ?? '');
      showToast(`New PIN sent to ${email}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to reset PIN', 'error');
    } finally {
      setPinLoading(false);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(studentId ?? '');
      showToast('Student ID copied');
    } catch {
      showToast('Couldn’t copy your student ID', 'error');
    }
  };

  if (loadingBalance && !balanceData) return <SettingsSkeleton />;

  return (
    <motion.div className="page" variants={stagger} initial="hidden" animate="show">
      <motion.header className="page-header" variants={rise}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Your account, meal plan and appearance.</p>
        </div>
      </motion.header>

      <div className="columns">
        <motion.section className="column-side first card profile-card" aria-label="Profile" variants={rise}>
          <div className="profile-top">
            <motion.span className="avatar large" initial={{ scale: 0.5, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.15 }}>{initial}</motion.span>
            <div>
              <h2 className="profile-name">{studentName}</h2>
              <p className="card-sub">{email}</p>
            </div>
          </div>
          <div className="detail-list">
            <div className="detail-row">
              <span>Student ID</span>
              <span className="detail-value">
                <strong className="mono">{studentId}</strong>
                <motion.button type="button" className="icon-button plain" aria-label="Copy student ID" onClick={() => void copyId()} whileTap={tapScale} transition={bouncy}><Copy size={16} /></motion.button>
              </span>
            </div>
            <div className="detail-row">
              <span>Meal plan</span>
              <span className="detail-value">
                <strong>{balanceData?.meal_plan_name ?? 'Meal plan'}</strong>
                <span className={`pill ${active ? 'good' : 'neutral'}`}><i className="status-dot" />{balanceData?.subscriber_status ?? 'Active'}</span>
              </span>
            </div>
            <div className="detail-row"><span>Daily limit</span><strong>{fmtMoney(balanceData?.daily_spending_limit ?? 0)}</strong></div>
            <div className="detail-row"><span>Total loaded</span><strong>{fmtMoney(balanceData?.amount ?? 0)}</strong></div>
          </div>
        </motion.section>

        <div className="column-main">
          <motion.section className="settings-section" aria-labelledby="appearance-title" variants={rise}>
            <h2 className="section-label" id="appearance-title">Appearance</h2>
            <div className="card theme-picker" role="radiogroup" aria-labelledby="appearance-title">
              {THEMES.map(({ value, label, Icon }) => {
                const selected = themePref === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`theme-option ${selected ? 'active' : ''}`}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      changeTheme(value, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                    }}
                    whileTap={tapScale}
                    transition={bouncy}
                  >
                    {selected && <motion.span layoutId="theme-pill" className="theme-pill" transition={bouncy} />}
                    <span className={`theme-swatch ${value}`} aria-hidden="true"><Icon size={18} /></span>
                    <span className="theme-label">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          <motion.section className="settings-section" aria-labelledby="security-title" variants={rise}>
            <h2 className="section-label" id="security-title">Security</h2>
            <div className="card setting-row">
              <span className="icon-chip accent"><Mail size={20} /></span>
              <div className="setting-text">
                <strong>Reset PIN</strong>
                <span>We’ll email a new PIN to {email} right away.</span>
              </div>
              <motion.button className="button primary" onClick={() => void handleResetPin()} disabled={pinLoading} whileTap={tapScale} transition={bouncy}>
                {pinLoading ? <><span className="spinner" /> Sending…</> : 'Send new PIN'}
              </motion.button>
            </div>
          </motion.section>

          <motion.section className="settings-section" aria-labelledby="payments-title" variants={rise}>
            <h2 className="section-label" id="payments-title">Payments</h2>
            <div className="card setting-row disabled">
              <span className="icon-chip"><CreditCard size={20} /></span>
              <div className="setting-text">
                <strong>Top up balance <span className="pill neutral">Coming soon</span></strong>
                <span>Add funds with Mobile Money or card, in a future release.</span>
              </div>
              <button className="button soft" disabled>Top up</button>
            </div>
          </motion.section>

          <motion.section className="settings-section" aria-labelledby="session-title" variants={rise}>
            <h2 className="section-label" id="session-title">Session</h2>
            <motion.button type="button" className="card signout" onClick={logout} whileTap={pressScale} whileHover={{ y: -2 }} transition={bouncy}>
              <LogOut size={19} /> Sign out
            </motion.button>
          </motion.section>

          <motion.p className="footnote" variants={rise}>
            Ashesi Meals is an independent student project and isn’t affiliated with Ashesi University or Akorno Services. Your data stays in your browser.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
