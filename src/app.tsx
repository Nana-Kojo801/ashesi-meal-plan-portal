import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { Header } from './components/header';
import { BottomNav } from './components/bottom-nav';
import { Toast } from './components/toast';
import { LoginPage } from './pages/login/login-page';
import { fetchBalance } from './api/balance';
import { AppContext } from './context/app-context';
import { useSessionStore } from './stores/session-store';
import { useMobile } from './hooks/use-mobile';
import { useOffline } from './hooks/use-offline';
import { readBalanceCache, writeBalanceCache, clearBalanceCache, BALANCE_CACHE_TTL } from './hooks/use-balance-cache';
import type { Screen, ToastState } from './types';

export default function App() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { studentId, login, logout: sessionLogout } = useSessionStore();
  const isMobile = useMobile();
  const isOffline = useOffline();

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const cachedBalance = studentId ? readBalanceCache(studentId) : undefined;

  const { data: balanceData, isLoading: loadingBalance, error: balanceQueryError } = useQuery({
    queryKey: ['balance', studentId],
    queryFn: () => fetchBalance(studentId!),
    enabled: !!studentId,
    staleTime: BALANCE_CACHE_TTL,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    initialData: cachedBalance?.data,
    initialDataUpdatedAt: cachedBalance?.updatedAt,
  });

  useEffect(() => {
    if (balanceData && studentId) writeBalanceCache(studentId, balanceData);
  }, [balanceData, studentId]);

  const screen: Screen =
    location.pathname === '/history'
      ? 'report'
      : location.pathname === '/reports'
        ? 'analytics'
        : location.pathname === '/calculator'
          ? 'calculator'
          : location.pathname === '/settings'
            ? 'settings'
            : 'home';

  // Only refetch balance on dashboard visit if data is older than 1 minute.
  useEffect(() => {
    if (screen === 'home' && studentId) {
      const state = queryClient.getQueryState(['balance', studentId]);
      const age = Date.now() - (state?.dataUpdatedAt ?? 0);
      if (age > 60_000) {
        void queryClient.invalidateQueries({ queryKey: ['balance', studentId] });
      }
    }
  }, [screen, studentId, queryClient]);

  const balanceError = balanceQueryError instanceof Error ? balanceQueryError.message : null;

  const handleLogin = async (id: string) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await queryClient.fetchQuery({
        queryKey: ['balance', id],
        queryFn: () => fetchBalance(id),
      });
      login(id);
      navigate('/');
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Invalid Student ID or network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (studentId) clearBalanceCache(studentId);
    queryClient.clear();
    sessionLogout();
    navigate('/');
  };

  const handleNav = (s: Screen) => {
    const path =
      s === 'home' ? '/' : s === 'report' ? '/history' : s === 'analytics' ? '/reports' : s === 'calculator' ? '/calculator' : '/settings';
    navigate(path);
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') =>
    setToast({ message, type });

  const studentName = balanceData
    ? `${balanceData.firstname} ${balanceData.lastname}`.trim()
    : (studentId ?? '');
  if (!studentId) {
    return (
      <>
        <LoginPage
          onLogin={(id) => void handleLogin(id)}
          isMobile={isMobile}
          error={loginError}
          loading={loginLoading}
        />
        {toast &&
          createPortal(
            <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
            document.body,
          )}
      </>
    );
  }

  return (
    <AppContext.Provider
      value={{
        balanceData: balanceData ?? null,
        loadingBalance,
        balanceError,
        isMobile,
        studentName,
        showToast,
        logout: handleLogout,
        retryBalance: () => {
          void queryClient.invalidateQueries({ queryKey: ['balance', studentId] });
        },
      }}
    >
      <div className="app-shell">
        <Header screen={screen} onNav={handleNav} />
        {isOffline && (
          <div className="offline-banner">
            <WifiOff size={14} />
            You're offline — showing cached data
          </div>
        )}
        <main className="app-main">
          <div className="app-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        {isMobile &&
          createPortal(<BottomNav screen={screen} onNav={handleNav} />, document.body)}
        {toast &&
          createPortal(
            <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
            document.body,
          )}
      </div>
    </AppContext.Provider>
  );
}
