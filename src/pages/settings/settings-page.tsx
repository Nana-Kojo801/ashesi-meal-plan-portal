import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAppContext } from '../../context/app-context';
import { useSessionStore } from '../../stores/session-store';
import { ProfileCard } from './components/profile-card';
import { ActionCards } from './components/action-cards';

export function SettingsPage() {
  const { balanceData, studentName, logout, showToast, isMobile } = useAppContext();
  const { studentId } = useSessionStore();
  const initial = (studentName[0] ?? 'A').toUpperCase();
  const firstName = balanceData?.firstname ?? studentName.split(' ')[0] ?? '';
  const lastName = balanceData?.lastname ?? studentName.split(' ')[1] ?? '';
  const email =
    firstName && lastName
      ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ashesi.edu.gh`
      : `${studentId}@ashesi.edu.gh`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.05,
          }}
        >
          Settings
        </h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>
          Manage your account and meal plan.
        </div>
      </div>

      <ProfileCard
        studentId={studentId ?? ''}
        studentName={studentName}
        email={email}
        initial={initial}
        balanceData={balanceData}
      />

      <ActionCards
        studentId={studentId ?? ''}
        email={email}
        isMobile={isMobile}
        showToast={showToast}
      />

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={logout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#D81E2C',
          fontWeight: 700,
          fontSize: '13.5px',
          padding: '14px 16px',
          borderRadius: 13,
          border: '1px solid #ECE0D4',
          background: '#fff',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background .15s',
        }}
      >
        <LogOut size={16} /> Sign out
      </motion.button>
    </div>
  );
}
