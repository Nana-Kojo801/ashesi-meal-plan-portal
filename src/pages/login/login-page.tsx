import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings } from 'lucide-react';
import { getGreeting } from '../../lib/utils';
import { Brand } from '../../components/header';

const STUDENT_ID_PATTERN = /^\d{5,10}$/;

interface LoginPageProps {
  onLogin: (studentId: string) => void;
  isMobile: boolean;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onLogin, error, loading }: LoginPageProps) {
  const [studentId, setStudentId] = useState('');
  const trimmed = studentId.trim();
  const isValid = STUDENT_ID_PATTERN.test(trimmed);
  const submit = () => { if (isValid && !loading) onLogin(trimmed); };
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') submit(); };

  return (
    <main className="login-page">
      <motion.div className="login-frame" initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .55 }}>
        <section className="login-art red-plane">
          <Brand inverse />
          <div className="login-kicker">Good food<br />brighter days</div>
          <motion.div className="login-wordmark" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15, duration: .65 }}>
            Ashesi<span>Meals</span>
          </motion.div>
        </section>
        <section className="login-panel">
          <motion.div className="login-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }}>
            <Brand />
            <div className="eyebrow muted">{getGreeting()}</div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-copy">Enter your Student ID to open your meal plan dashboard.</p>
            <label className="field-label" htmlFor="student-id">STUDENT ID</label>
            <input
              id="student-id"
              className="login-input"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. 20231234"
              inputMode="numeric"
              maxLength={10}
              aria-invalid={Boolean(error)}
            />
            {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#df001f', fontSize: 12, fontWeight: 700, marginTop: 8 }}>{error}</motion.div>}
            <motion.button className="login-submit" onClick={submit} disabled={!isValid || loading} whileTap={isValid ? { scale: .98 } : undefined}>
              <span>{loading ? 'Loading…' : 'Open my dashboard'}</span>
              {loading ? <span className="spinner" /> : <motion.span animate={{ x: isValid ? [0, 4, 0] : 0 }} transition={{ duration: 1.6, repeat: Infinity }}><ArrowRight size={19} /></motion.span>}
            </motion.button>
            <div className="login-note"><Settings size={24} /> <span>Forgot your PIN? You can reset it<br className="desktop-only" /> from Settings once you’re in.</span></div>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
}
