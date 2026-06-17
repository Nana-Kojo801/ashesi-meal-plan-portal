import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { LoginScreen } from './screens/LoginScreen';
import { fetchBalance } from './api';
import { AppContext } from './context/AppContext';
import type { BalanceData, Screen, ToastState } from './types';

const STORAGE_KEY = 'ashesiMealsStudentId';
const BALANCE_CACHE_KEY = 'ashesiMealsBalance';
const BALANCE_TTL = 60 * 60 * 1000;

function readBalanceCache(id: string): { data: BalanceData; updatedAt: number } | undefined {
  try {
    const raw = localStorage.getItem(`${BALANCE_CACHE_KEY}_${id}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as { data: BalanceData; updatedAt: number };
  } catch { return undefined; }
}

function writeBalanceCache(id: string, data: BalanceData) {
  try {
    localStorage.setItem(`${BALANCE_CACHE_KEY}_${id}`, JSON.stringify({ data, updatedAt: Date.now() }));
  } catch { /* quota exceeded */ }
}

export default function App() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [studentId, setStudentId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cachedBalance = studentId ? readBalanceCache(studentId) : undefined;

  const { data: balanceData, isLoading: loadingBalance, error: balanceQueryError } = useQuery({
    queryKey: ['balance', studentId],
    queryFn: () => fetchBalance(studentId!),
    enabled: !!studentId,
    staleTime: BALANCE_TTL,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    initialData: cachedBalance?.data,
    initialDataUpdatedAt: cachedBalance?.updatedAt,
  });

  useEffect(() => {
    if (balanceData && studentId) writeBalanceCache(studentId, balanceData);
  }, [balanceData, studentId]);

  const screen: Screen =
    location.pathname === '/history'  ? 'report' :
    location.pathname === '/reports'  ? 'analytics' :
    location.pathname === '/settings' ? 'settings' : 'home';

  // Refetch on dashboard visit only if data is older than 1 minute
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
      await queryClient.fetchQuery({ queryKey: ['balance', id], queryFn: () => fetchBalance(id) });
      localStorage.setItem(STORAGE_KEY, id);
      setStudentId(id);
      navigate('/');
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Invalid Student ID or network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (studentId) localStorage.removeItem(`${BALANCE_CACHE_KEY}_${studentId}`);
    localStorage.removeItem(STORAGE_KEY);
    queryClient.clear();
    setStudentId(null);
    navigate('/');
  };

  const handleNav = (s: Screen) => {
    const path = s === 'home' ? '/' : s === 'report' ? '/history' : s === 'analytics' ? '/reports' : '/settings';
    navigate(path);
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') => setToast({ message, type });

  const studentName = balanceData
    ? `${balanceData.firstname} ${balanceData.lastname}`.trim()
    : (studentId ?? '');
  const studentInitial = (studentName[0] ?? 'A').toUpperCase();

  if (!studentId) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} isMobile={isMobile} error={loginError} loading={loginLoading} />
        {toast && createPortal(
          <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
          document.body,
        )}
      </>
    );
  }

  return (
    <AppContext.Provider value={{
      studentId,
      balanceData: balanceData ?? null,
      loadingBalance,
      balanceError,
      isMobile,
      studentName,
      showToast,
      logout: handleLogout,
      retryBalance: () => { void queryClient.invalidateQueries({ queryKey: ['balance', studentId] }); },
    }}>
      <div style={{ minHeight: '100vh', background: '#FBF6F0', color: '#1C1413', display: 'flex', flexDirection: 'column' }}>
        <Header
          screen={screen}
          onNav={handleNav}
          balanceData={balanceData ?? null}
          studentInitial={studentInitial}
          isMobile={isMobile}
        />
        <main style={{ flex: 1, padding: isMobile ? '18px 16px 108px' : '32px 30px 44px' }}>
          <div style={{ maxWidth: isMobile ? '100%' : 960, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
        {isMobile && createPortal(
          <BottomNav screen={screen} onNav={handleNav} />,
          document.body,
        )}
        {toast && createPortal(
          <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
          document.body,
        )}
      </div>
    </AppContext.Provider>
  );
}
