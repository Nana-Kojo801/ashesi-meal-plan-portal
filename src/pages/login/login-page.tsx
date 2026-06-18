import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, User, ArrowRight } from 'lucide-react';
import { getGreeting } from '../../lib/utils';

/** Student IDs at Ashesi are 8-digit numeric strings (e.g. 20231234). */
const STUDENT_ID_PATTERN = /^\d{5,10}$/;

interface LoginPageProps {
  onLogin: (studentId: string) => void;
  isMobile: boolean;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onLogin, isMobile, error, loading }: LoginPageProps) {
  const [idInput, setIdInput] = useState('');
  const greeting = getGreeting();

  const trimmed = idInput.trim();
  const isValid = STUDENT_ID_PATTERN.test(trimmed);

  const handleSubmit = () => {
    if (!isValid) return;
    onLogin(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const form = (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ width: '100%', maxWidth: 400 }}
    >
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 30 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              background: '#D81E2C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UtensilsCrossed size={22} color="#fff" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap' }}>Ashesi Meals</div>
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.4px', color: '#D81E2C' }}>
        {greeting} 👋
      </div>
      <h1 style={{ margin: '8px 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
        Welcome back
      </h1>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#7A6A63', lineHeight: 1.5 }}>
        Enter your Student ID to open your meal plan dashboard.
      </div>

      <div style={{ marginTop: 26 }}>
        <label style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.4px', color: '#7A6A63' }}>
          STUDENT ID
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 8,
            background: '#fff',
            border: `1.5px solid ${error ? '#DC2626' : '#ECE0D4'}`,
            borderRadius: 15,
            padding: '0 14px',
            transition: 'border-color .15s',
          }}
        >
          <User size={19} color="#7A6A63" />
          <input
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. 20231234"
            inputMode="numeric"
            maxLength={10}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#1C1413',
              fontSize: 16,
              fontWeight: 600,
              padding: '15px 0',
            }}
          />
        </div>

        {error && (
          <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          style={{
            width: '100%',
            marginTop: 16,
            background: loading || !isValid ? '#ECE0D4' : '#D81E2C',
            color: loading || !isValid ? '#7A6A63' : '#fff',
            fontWeight: 800,
            fontSize: 15,
            padding: 16,
            borderRadius: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            boxShadow: isValid ? '0 16px 30px -14px rgba(216,30,44,.55)' : 'none',
            cursor: loading || !isValid ? 'not-allowed' : 'pointer',
            transition: 'background .15s, color .15s, box-shadow .15s',
            border: 'none',
            fontFamily: 'inherit',
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(255,255,255,.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                }}
              />
              Loading...
            </>
          ) : (
            <>
              Open my dashboard
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            fontWeight: 600,
            color: '#7A6A63',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Forgot your PIN? You can reset it from Settings once you're in.
        </div>
      </div>
    </motion.div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 28,
          background: '#FBF6F0',
        }}
      >
        {form}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: 'inherit',
        background: '#FBF6F0',
        color: '#1C1413',
      }}
    >
      <div
        style={{
          flex: '0 0 46%',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(155deg, #E0233A, #8E0F18)',
          color: '#fff',
          padding: 54,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            border: '38px solid rgba(255,255,255,.10)',
            right: -90,
            bottom: -110,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.10)',
            left: -40,
            top: 120,
            animation: 'floaty 6s ease-in-out infinite',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              background: 'rgba(255,255,255,.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UtensilsCrossed size={22} color="#fff" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap' }}>Ashesi Meals</div>
        </div>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '1.5px',
              opacity: 0.8,
            }}
          >
            SUBSCRIBER PORTAL
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: '-1.5px',
              lineHeight: 1.08,
              marginTop: 12,
              maxWidth: 420,
            }}
          >
            Your meal plan, in your pocket.
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              opacity: 0.9,
              marginTop: 14,
              maxWidth: 380,
              lineHeight: 1.5,
            }}
          >
            Check your daily balance, scan your purchase history, and manage your account — all
            with your Student ID.
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: '12.5px', fontWeight: 600, opacity: 0.85 }}>
          Powered by Akorno Services · Ashesi University
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 28,
        }}
      >
        {form}
      </div>
    </div>
  );
}
