import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ToastState } from '../types';

interface ToastProps {
  toast: ToastState;
  onDismiss: () => void;
  isMobile: boolean;
}

export function Toast({ toast, onDismiss, isMobile }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3600);
    return () => clearTimeout(t);
  }, [toast.message, onDismiss]);

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 92 : 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      animation: 'toastIn .35s cubic-bezier(.2,.7,.2,1) both',
      background: '#1C1413',
      color: '#FFFFFF',
      padding: '14px 20px',
      borderRadius: 15,
      boxShadow: '0 20px 40px -14px rgba(0,0,0,.45)',
      fontWeight: 700,
      fontSize: '13.5px',
      maxWidth: '90vw',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%',
        background: toast.type === 'error' ? '#DC2626' : '#D81E2C',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
