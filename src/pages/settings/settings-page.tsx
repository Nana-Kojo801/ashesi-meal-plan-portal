import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, LogOut, Mail } from 'lucide-react';
import { SettingsSkeleton } from '../../components/skeleton';
import { resetPin } from '../../api';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';

export function SettingsPage() {
  const { balanceData, loadingBalance, studentName, logout, showToast } = useAppContext();
  const { studentId } = useSessionStore();
  const [pinLoading, setPinLoading] = useState(false);
  const initial = (studentName[0] ?? 'A').toUpperCase();
  const firstName = balanceData?.firstname ?? studentName.split(' ')[0] ?? '';
  const lastName = balanceData?.lastname ?? studentName.split(' ')[1] ?? '';
  const email = firstName && lastName
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ashesi.edu.gh`
    : `${studentId}@ashesi.edu.gh`;

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

  if (loadingBalance && !balanceData) return <SettingsSkeleton />;

  return (
    <div className="page settings-page">
      <header className="page-heading">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and meal plan.</p>
      </header>
      <motion.section className="settings-profile red-plane" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div className="profile-initial" initial={{ scale: .7, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 230 }}>{initial}</motion.div>
        <div>
          <h2 className="profile-name">{studentName}</h2>
          <div className="profile-details"><span className="profile-id">Student ID <b>{studentId}</b></span><span className="profile-email">{email}</span></div>
        </div>
        <div className="profile-plan">
          <div>{balanceData?.meal_plan_name ?? 'Meal plan'}</div>
          <span className="status-pill"><i className="status-dot" /> {balanceData?.subscriber_status ?? 'Active'}</span>
        </div>
      </motion.section>
      <motion.section className="settings-row" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 }}>
        <span className="settings-icon"><Mail size={28} /></span>
        <div><strong>Reset PIN</strong><div className="page-subtitle" style={{ marginTop: 4 }}>We’ll email a brand-new PIN to your Ashesi inbox right away.</div></div>
        <button className="primary-button" onClick={() => void handleResetPin()} disabled={pinLoading}>
          {pinLoading ? <><span className="spinner" /> Sending…</> : 'Send new PIN'}
        </button>
      </motion.section>
      <motion.section className="settings-row disabled" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .18 }}>
        <span className="settings-icon"><CreditCard size={21} /></span>
        <div><strong>Top up balance <small style={{ marginLeft: 8 }}>Soon</small></strong><div className="page-subtitle" style={{ marginTop: 4 }}>Add funds with Mobile Money or card — landing in a future release.</div></div>
        <button className="secondary-button" disabled>Top up</button>
      </motion.section>
      <motion.button className="signout" onClick={logout} whileTap={{ scale: .94 }}><LogOut size={18} /> Sign out</motion.button>
    </div>
  );
}
