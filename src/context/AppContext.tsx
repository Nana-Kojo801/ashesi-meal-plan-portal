import { createContext, useContext } from 'react';
import type { BalanceData, ToastState } from '../types';

export interface AppContextValue {
  studentId: string;
  balanceData: BalanceData | null;
  loadingBalance: boolean;
  balanceError: string | null;
  isMobile: boolean;
  studentName: string;
  showToast: (message: string, type?: ToastState['type']) => void;
  logout: () => void;
  retryBalance: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext used outside AppLayout');
  return ctx;
}
