import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brand } from './header';
import { bouncy, gentle } from '../lib/motion';

interface StatusScreenProps {
  icon: ReactNode;
  code?: number | null;
  title: string;
  message: string;
  fullPage?: boolean;
}

export function StatusScreen({ icon, code, title, message, fullPage = false }: StatusScreenProps) {
  return (
    <div className={`status-screen ${fullPage ? 'full' : ''}`}>
      {fullPage && <Brand />}
      <motion.div
        className="card status-card"
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={gentle}
      >
        <motion.span className="icon-chip accent large" initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
          {icon}
        </motion.span>
        {code && <div className="status-code">{code}</div>}
        <h1 className="card-title large">{title}</h1>
        <p className="card-sub">{message}</p>
        <motion.div whileTap={{ scale: 0.97 }} transition={bouncy}>
          <Link to="/" className="button primary wide">Go to dashboard</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
