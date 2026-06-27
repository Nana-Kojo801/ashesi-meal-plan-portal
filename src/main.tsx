import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './app';
import { ErrorBoundary } from './components/error-boundary';
import { ErrorPage } from './pages/error/error-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { HomePage } from './pages/home/home-page';
import { HistoryPage } from './pages/history/history-page';
import { SettingsPage } from './pages/settings/settings-page';
import { HistorySkeleton } from './components/skeleton';

// Reports page is lazy-loaded: recharts adds ~200 KB and is only needed on the /reports route.
const ReportsPage = lazy(() =>
  import('./pages/reports/reports-page').then((m) => ({ default: m.ReportsPage })),
);

const CalculatorPage = lazy(() =>
  import('./pages/calculator/calculator-page').then((m) => ({ default: m.CalculatorPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <ErrorBoundary><HomePage /></ErrorBoundary> },
      { path: '/history', element: <ErrorBoundary><HistoryPage /></ErrorBoundary> },
      {
        path: '/reports',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<HistorySkeleton />}>
              <ReportsPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '/calculator',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<HistorySkeleton />}>
              <CalculatorPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      { path: '/settings', element: <ErrorBoundary><SettingsPage /></ErrorBoundary> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
