import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { Sidebar } from './components/header';
import { BottomNav } from './components/bottom-nav';
import { NAV_ITEMS } from './components/nav-items';
import { Toast } from './components/toast';
import { LoginPage } from './pages/login/login-page';
import { fetchBalance } from './api/balance';
import { AppContext } from './context/app-context';
import { useSessionStore } from './stores/session-store';
import { useMobile } from './hooks/use-mobile';
import { useOffline } from './hooks/use-offline';
import { readBalanceCache, writeBalanceCache, clearBalanceCache, BALANCE_CACHE_TTL } from './hooks/use-balance-cache';
import { EntranceContext, pageSpring, spring } from './lib/motion';
import type { Screen, ToastState } from './types';

const PATHS: Record<Screen, string> = {
  home: '/',
  report: '/history',
  analytics: '/reports',
  calculator: '/calculator',
  settings: '/settings',
};

const SCREEN_ORDER = NAV_ITEMS.map((item) => item.key);

interface PageCustom { direction: number; isMobile: boolean }

/**
 * Page slides animate the full transform string so they run on the
 * compositor. On mobile each page is a viewport-sized scroller, so only a
 * screen-sized layer moves; it travels the full width. Desktop uses a short
 * slide with a fade.
 */
const slide = ({ isMobile }: PageCustom, offset: number, y = 0) =>
  isMobile ? `translate3d(${offset * 100}%, ${y}px, 0px)` : `translate3d(${offset * 48}px, ${y}px, 0px)`;

const pageVariants: Variants = {
  enter: (custom: PageCustom) => (
    custom.direction === 0
      ? { opacity: 0, transform: slide(custom, 0, 16) }
      : { opacity: custom.isMobile ? 1 : 0, transform: slide(custom, custom.direction) }
  ),
  center: (custom: PageCustom) => ({ opacity: 1, transform: slide(custom, 0) }),
  exit: (custom: PageCustom) => (
    custom.direction === 0
      ? { opacity: 0, transition: { duration: 0.12 } }
      : { opacity: custom.isMobile ? 0.6 : 0, transform: slide(custom, custom.direction * (custom.isMobile ? -0.3 : -1)) }
  ),
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
  const screenIndex = SCREEN_ORDER.indexOf(screen);

  // Slide direction follows the tab order: right when moving to a later tab,
  // left when moving back. Derived during render so the exiting page gets it too.
  const [nav, setNav] = useState({ index: screenIndex, direction: 0 });
  if (nav.index !== screenIndex) setNav({ index: screenIndex, direction: Math.sign(screenIndex - nav.index) });
  const transitionCustom = { direction: nav.direction, isMobile };

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
      <MotionConfig reducedMotion="user" transition={spring}>
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
    <MotionConfig reducedMotion="user" transition={spring}>
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
                  initial={{ opacity: 0, transform: 'translateY(-12px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transform: 'translateY(-12px)' }}
                  transition={spring}
                >
                  <WifiOff size={14} />
                  You're offline. Showing saved data.
                </motion.div>
              )}
            </AnimatePresence>
            <EntranceContext.Provider value={!(isMobile && nav.direction !== 0)}>
              {/* Mobile pages are absolutely positioned scrollers, so both can animate in place. */}
              <AnimatePresence mode={isMobile ? 'sync' : 'popLayout'} initial={false} custom={transitionCustom}>
                <motion.div
                  key={location.pathname}
                  className="route-view"
                  custom={transitionCustom}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageSpring}
                >
                  {outlet}
                </motion.div>
              </AnimatePresence>
            </EntranceContext.Provider>
          </main>
          {isMobile && createPortal(<BottomNav screen={screen} onNav={handleNav} />, document.body)}
          {toastPortal}
        </div>
      </AppContext.Provider>
    </MotionConfig>
  );
}
