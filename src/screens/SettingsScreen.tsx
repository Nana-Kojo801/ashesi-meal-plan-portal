import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, LogOut, Mail } from 'lucide-react';
import { resetPinApi } from '../api';
import { useAppContext } from '../context/AppContext';

export function SettingsScreen() {
  const { studentId, balanceData, studentName, logout, showToast, isMobile } = useAppContext();
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
      await resetPinApi(studentId);
      showToast(`New PIN sent to ${email}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to reset PIN', 'error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}>Settings</h1>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#7A6A63', marginTop: 4 }}>Manage your account and meal plan.</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: '#fff', border: '1px solid #ECE0D4',
          borderRadius: 22, padding: 20,
          boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
        }}
      >
        <div style={{
          width: 58, height: 58, borderRadius: 18,
          background: 'linear-gradient(135deg, #E0233A, #8E0F18)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 24, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{studentName}</div>
          <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600 }}>
            Student ID {studentId} · {email}
          </div>
          {balanceData && (
            <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', background: '#F2E7DC', color: '#D81E2C', borderRadius: 99, letterSpacing: '.3px' }}>
                {balanceData.meal_plan_name}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 8px',
                background: balanceData.subscriber_status === 'active' ? 'rgba(34,197,94,.12)' : '#F2E7DC',
                color: balanceData.subscriber_status === 'active' ? '#16a34a' : '#7A6A63',
                borderRadius: 99, letterSpacing: '.3px', textTransform: 'capitalize',
              }}>
                {balanceData.subscriber_status}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 20, padding: 20, boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 13, background: '#F2E7DC', color: '#D81E2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '15.5px', marginTop: 14 }}>Reset PIN</div>
          <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4, lineHeight: 1.45 }}>
            We'll email a brand-new PIN to your Ashesi inbox right away.
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleResetPin}
            disabled={pinLoading}
            style={{
              marginTop: 16,
              background: pinLoading ? '#ECE0D4' : '#D81E2C',
              color: pinLoading ? '#7A6A63' : '#fff',
              fontWeight: 700, fontSize: '13.5px',
              padding: '13px 16px', borderRadius: 13,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: pinLoading ? 'none' : '0 12px 22px -12px rgba(216,30,44,.55)',
              border: 'none', cursor: pinLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              transition: 'background .15s, color .15s',
            }}
          >
            {pinLoading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,.2)', borderTopColor: '#7A6A63', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                Sending...
              </>
            ) : (
              <><Mail size={16} /> Send new PIN</>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 20, padding: 20, boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: '10.5px', fontWeight: 800, letterSpacing: '.5px', color: '#7A6A63', background: '#F2E7DC', padding: '5px 9px', borderRadius: 99 }}>SOON</div>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: '#F2E7DC', color: '#7A6A63', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '15.5px', marginTop: 14, color: '#7A6A63' }}>Top up balance</div>
          <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4, lineHeight: 1.45 }}>
            Add funds with Mobile Money or card — landing in a future release.
          </div>
          <div style={{ flex: 1 }} />
          <button
            disabled
            style={{ marginTop: 16, background: '#F2E7DC', color: '#7A6A63', fontWeight: 700, fontSize: '13.5px', padding: '13px 16px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: 'not-allowed', fontFamily: 'inherit' }}
          >
            <CreditCard size={16} /> Top up
          </button>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        onClick={logout}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: '#D81E2C', fontWeight: 700, fontSize: '13.5px',
          padding: '14px 16px', borderRadius: 13,
          border: '1px solid #ECE0D4', background: '#fff',
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
        }}
      >
        <LogOut size={16} /> Sign out
      </motion.button>
    </div>
  );
}
