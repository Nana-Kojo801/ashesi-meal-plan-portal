import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { fetchBalance } from './api';
import type { Screen, ToastState } from './types';

const STORAGE_KEY = 'ashesiMealsStudentId';

export default function App() {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [screen, setScreen] = useState<Screen>('home');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const {
    data: balanceData,
    isLoading: loadingBalance,
    error: balanceQueryError,
  } = useQuery({
    queryKey: ['balance', studentId],
    queryFn: () => fetchBalance(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });

  const balanceError = balanceQueryError instanceof Error ? balanceQueryError.message : null;

  const handleLogin = async (id: string) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await queryClient.fetchQuery({
        queryKey: ['balance', id],
        queryFn: () => fetchBalance(id),
      });
      localStorage.setItem(STORAGE_KEY, id);
      setStudentId(id);
      setScreen('home');
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Invalid Student ID or network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    queryClient.clear();
    setStudentId(null);
    setScreen('home');
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
  };


  const studentName = balanceData
    ? `${balanceData.firstname} ${balanceData.lastname}`.trim()
    : (studentId ?? '');
  const studentInitial = (studentName[0] ?? 'A').toUpperCase();

  if (!studentId) {
    return (
      <>
        <LoginScreen
          onLogin={handleLogin}
          isMobile={isMobile}
          error={loginError}
          loading={loginLoading}
        />
        {toast && createPortal(
          <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
          document.body,
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6F0', color: '#1C1413', display: 'flex', flexDirection: 'column' }}>
      <Header
        screen={screen}
        onNav={setScreen}
        balanceData={balanceData ?? null}
        studentInitial={studentInitial}
        isMobile={isMobile}
      />

      <main style={{ flex: 1, padding: isMobile ? '18px 16px 108px' : '32px 30px 44px' }}>
        <div style={{ maxWidth: isMobile ? '100%' : 960, margin: '0 auto', width: '100%' }}>
          {screen === 'home' && (
            <DashboardScreen
              studentId={studentId}
              balanceData={balanceData ?? null}
              loading={loadingBalance}
              error={balanceError}
              onRetry={() => queryClient.invalidateQueries({ queryKey: ['balance', studentId] })}
              onNav={setScreen}
              isMobile={isMobile}
            />
          )}
          {screen === 'report' && (
            <HistoryScreen studentId={studentId} isMobile={isMobile} />
          )}
          {screen === 'settings' && (
            <SettingsScreen
              studentId={studentId}
              balanceData={balanceData ?? null}
              studentName={studentName}
              onLogout={handleLogout}
              onToast={showToast}
              isMobile={isMobile}
            />
          )}
        </div>
      </main>

      {isMobile && createPortal(
        <BottomNav screen={screen} onNav={setScreen} />,
        document.body,
      )}

      {toast && createPortal(
        <Toast toast={toast} onDismiss={() => setToast(null)} isMobile={isMobile} />,
        document.body,
      )}
    </div>
  );
}
