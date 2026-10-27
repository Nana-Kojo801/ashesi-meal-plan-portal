import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { getGreeting } from '../../lib/utils';
import { Brand, BrandMark } from '../../components/header';
import { ThemeToggle } from '../../components/theme-toggle';
import { bouncy, gentle, rise, stagger } from '../../lib/motion';

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
  const typed = trimmed.length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid && !loading) onLogin(trimmed);
  };

  const hint = error ?? (!typed ? 'Your 5–10 digit Ashesi student ID.' : isValid ? 'Looks good.' : 'Student IDs are 5–10 digits.');
  const hintBad = Boolean(error) || (typed && !isValid);

  return (
    <main className="login-page">
      <ThemeToggle className="login-theme" />
      <motion.section
        className="login-hero"
        aria-label="About Ashesi Meals"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={gentle}
      >
        <span className="hero-gloss" aria-hidden="true" />
        <motion.span
          className="login-watermark"
          aria-hidden="true"
          initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 0.07 }}
          transition={{ ...gentle, delay: 0.2 }}
        >
          <BrandMark size={520} />
        </motion.span>
        <Brand inverse />
        <motion.div className="login-headline" variants={stagger} initial="hidden" animate="show">
          <motion.h2 variants={rise}>Your meal plan, in your pocket.</motion.h2>
          <motion.p variants={rise}>Check today’s balance, browse every purchase and see where your money goes.</motion.p>
        </motion.div>
      </motion.section>

      <section className="login-panel" aria-label="Sign in">
        <motion.form className="login-card glass" onSubmit={submit} variants={stagger} initial="hidden" animate="show" noValidate>
          <motion.div className="login-intro" variants={rise}>
            <span className="page-eyebrow">{getGreeting()}</span>
            <h1>Welcome back</h1>
            <p>Enter your student ID to open your meal plan.</p>
          </motion.div>

          <motion.div className="field" variants={rise}>
            <label htmlFor="student-id">Student ID</label>
            <motion.input
              id="student-id"
              className={`text-input ${isValid ? 'valid' : ''} ${hintBad ? 'invalid' : ''}`}
              value={studentId}
              onChange={(event) => setStudentId(event.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 20231234"
              inputMode="numeric"
              autoComplete="username"
              maxLength={10}
              aria-invalid={hintBad}
              aria-describedby="student-id-hint"
              animate={error ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hint}
                id="student-id-hint"
                className={`field-hint ${hintBad ? 'bad' : ''}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={bouncy}
              >
                {hint}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.button
            type="submit"
            className="button primary wide large"
            disabled={!isValid || loading}
            variants={rise}
            whileTap={isValid ? { scale: 0.97 } : undefined}
            whileHover={isValid ? { y: -2 } : undefined}
          >
            {loading ? <><span className="spinner" /> Opening…</> : <>Open my dashboard <motion.span animate={{ x: isValid ? [0, 4, 0] : 0 }} transition={{ duration: 1.4, repeat: isValid ? Infinity : 0 }}><ArrowRight size={18} /></motion.span></>}
          </motion.button>

          <motion.div className="login-note" variants={rise}>
            <span className="icon-chip small"><Mail size={17} /></span>
            <p>Forgot your PIN? You can reset it from <strong>Settings</strong> once you’re in.</p>
          </motion.div>
        </motion.form>
        <p className="footnote center">Independent student project · not affiliated with Ashesi University</p>
      </section>
    </main>
  );
}
