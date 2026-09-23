import { StrictMode } from 'react';
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
import { ReportsRoute, CalculatorRoute } from './route-components';

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
          <ErrorBoundary><ReportsRoute /></ErrorBoundary>
        ),
      },
      {
        path: '/calculator',
        element: (
          <ErrorBoundary><CalculatorRoute /></ErrorBoundary>
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
