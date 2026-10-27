import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { Sidebar } from './components/header';
import { BottomNav } from './components/bottom-nav';
import { Toast } from './components/toast';
import { LoginPage } from './pages/login/login-page';
import { fetchBalance } from './api/balance';
import { AppContext } from './context/app-context';
import { useSessionStore } from './stores/session-store';
import { useMobile } from './hooks/use-mobile';
import { useOffline } from './hooks/use-offline';
import { readBalanceCache, writeBalanceCache, clearBalanceCache, BALANCE_CACHE_TTL } from './hooks/use-balance-cache';
import { gentle, spring } from './lib/motion';
import type { Screen, ToastState } from './types';

const PATHS: Record<Screen, string> = {
  home: '/',
  report: '/history',
  analytics: '/reports',
  calculator: '/calculator',
  settings: '/settings',
};

function screenFor(pathname: string): Screen {
  const match = (Object.keys(PATHS) as Screen[]).find((key) => PATHS[key] === pathname);
  return match ?? 'home';
}

export default function App() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();

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

  const screen = screenFor(location.pathname);

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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

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

  const handleNav = (s: Screen) => navigate(PATHS[s]);

  const showToast = useCallback(
    (message: string, type: ToastState['type'] = 'success') => setToast({ message, type }),
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  const studentName = balanceData
    ? `${balanceData.firstname} ${balanceData.lastname}`.trim()
    : (studentId ?? '');

  const toastPortal = createPortal(
    <Toast toast={toast} onDismiss={dismissToast} isMobile={isMobile} />,
    document.body,
  );

  if (!studentId) {
    return (
      <MotionConfig reducedMotion="user">
        <LoginPage
          onLogin={(id) => void handleLogin(id)}
          isMobile={isMobile}
          error={loginError}
          loading={loginLoading}
        />
        {toastPortal}
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
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
          {!isMobile && (
            <Sidebar screen={screen} onNav={handleNav} studentName={studentName} studentId={studentId} />
          )}
          <main className="app-main">
            <AnimatePresence initial={false}>
              {isOffline && (
                <motion.div
                  className="offline-banner glass-soft"
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={spring}
                >
                  <WifiOff size={14} />
                  You're offline. Showing saved data.
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                className="route-view"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: gentle }}
                exit={{ opacity: 0, y: -6, scale: 0.995, transition: { duration: 0.12 } }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </main>
          {isMobile && createPortal(<BottomNav screen={screen} onNav={handleNav} />, document.body)}
          {toastPortal}
        </div>
      </AppContext.Provider>
    </MotionConfig>
  );
}
