import { useState, useEffect, useCallback, useRef, type MouseEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, MotionConfig, motion, useDragControls, type PanInfo, type Variants } from 'framer-motion';
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
import { pageSpring, spring } from './lib/motion';
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

const pageVariants: Variants = {
  enter: ({ direction, isMobile }: PageCustom) => (
    direction === 0
      ? { x: 0, y: 18, opacity: 0 }
      : { x: isMobile ? `${direction * 100}%` : direction * 56, y: 0, opacity: isMobile ? 1 : 0 }
  ),
  center: { x: 0, y: 0, opacity: 1 },
  exit: ({ direction, isMobile }: PageCustom) => (
    direction === 0
      ? { opacity: 0, transition: { duration: 0.12 } }
      : { x: isMobile ? `${direction * -32}%` : direction * -56, opacity: isMobile ? 0.5 : 0 }
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

  const swipeControls = useDragControls();
  const swiped = useRef(false);
  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    if (!isMobile || (event.target as Element).closest('[data-no-swipe], input')) return;
    swipeControls.start(event);
  };
  // A swipe that began on a button must not also count as a tap on it.
  const swallowClickAfterSwipe = (event: MouseEvent<HTMLDivElement>) => {
    if (!swiped.current) return;
    event.preventDefault();
    event.stopPropagation();
    swiped.current = false;
  };
  const endSwipe = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    const next = SCREEN_ORDER[screenIndex + (swipe < -80 ? 1 : swipe > 80 ? -1 : 0)];
    if (next && next !== screen) navigate(PATHS[next]);
  };

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
            <AnimatePresence mode="popLayout" initial={false} custom={transitionCustom}>
              <motion.div
                key={location.pathname}
                className="route-view"
                custom={transitionCustom}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageSpring}
                drag={isMobile ? 'x' : false}
                dragListener={false}
                dragControls={swipeControls}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.22}
                dragDirectionLock
                onPointerDown={startSwipe}
                onDragStart={() => { swiped.current = true; }}
                onDragEnd={endSwipe}
                onClickCapture={swallowClickAfterSwipe}
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
