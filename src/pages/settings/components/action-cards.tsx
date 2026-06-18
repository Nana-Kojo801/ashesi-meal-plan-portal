import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, Mail } from 'lucide-react';
import { resetPin } from '../../../api';

interface ActionCardsProps {
  studentId: string;
  email: string;
  isMobile: boolean;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function ActionCards({ studentId, email, isMobile, showToast }: ActionCardsProps) {
  const [pinLoading, setPinLoading] = useState(false);

  const handleResetPin = async () => {
    setPinLoading(true);
    try {
      await resetPin(studentId);
      showToast(`New PIN sent to ${email}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to reset PIN', 'error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 14,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: '#F2E7DC',
            color: '#D81E2C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={20} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '15.5px', marginTop: 14 }}>Reset PIN</div>
        <div
          style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4, lineHeight: 1.45 }}
        >
          We'll email a brand-new PIN to your Ashesi inbox right away.
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => void handleResetPin()}
          disabled={pinLoading}
          style={{
            marginTop: 16,
            background: pinLoading ? '#ECE0D4' : '#D81E2C',
            color: pinLoading ? '#7A6A63' : '#fff',
            fontWeight: 700,
            fontSize: '13.5px',
            padding: '13px 16px',
            borderRadius: 13,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: pinLoading ? 'none' : '0 12px 22px -12px rgba(216,30,44,.55)',
            border: 'none',
            cursor: pinLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background .15s, color .15s',
          }}
        >
          {pinLoading ? (
            <>
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(0,0,0,.2)',
                  borderTopColor: '#7A6A63',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                }}
              />
              Sending...
            </>
          ) : (
            <>
              <Mail size={16} /> Send new PIN
            </>
          )}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '.5px',
            color: '#7A6A63',
            background: '#F2E7DC',
            padding: '5px 9px',
            borderRadius: 99,
          }}
        >
          SOON
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: '#F2E7DC',
            color: '#7A6A63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CreditCard size={20} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '15.5px', marginTop: 14, color: '#7A6A63' }}>
          Top up balance
        </div>
        <div
          style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 4, lineHeight: 1.45 }}
        >
          Add funds with Mobile Money or card — landing in a future release.
        </div>
        <div style={{ flex: 1 }} />
        <button
          disabled
          style={{
            marginTop: 16,
            background: '#F2E7DC',
            color: '#7A6A63',
            fontWeight: 700,
            fontSize: '13.5px',
            padding: '13px 16px',
            borderRadius: 13,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: 'none',
            cursor: 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          <CreditCard size={16} /> Top up
        </button>
      </motion.div>
    </div>
  );
}
