import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { bouncy } from '../lib/motion';
import type { ToastState } from '../types';

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  isMobile: boolean;
}

export function Toast({ toast, onDismiss, isMobile }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3600);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`toast-region ${isMobile ? 'mobile' : ''}`} role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, transform: 'translateY(40px) scale(0.85)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(24px) scale(0.9)' }}
            transition={bouncy}
            onClick={onDismiss}
          >
            <span className="toast-icon">
              {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            </span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
