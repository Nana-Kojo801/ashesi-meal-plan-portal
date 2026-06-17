import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { DashboardScreen } from './screens/DashboardScreen.tsx'
import { HistoryScreen } from './screens/HistoryScreen.tsx'
import { AnalyticsScreen } from './screens/AnalyticsScreen.tsx'
import { SettingsScreen } from './screens/SettingsScreen.tsx'
import { ErrorPage } from './pages/ErrorPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/',         element: <DashboardScreen /> },
      { path: '/history',  element: <HistoryScreen /> },
      { path: '/reports',  element: <AnalyticsScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
      { path: '*',         element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
