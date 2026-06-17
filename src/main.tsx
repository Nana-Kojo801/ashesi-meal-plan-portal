import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
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
    errorElement: <ErrorPage />,
    children: [
      { path: '/',          element: <App /> },
      { path: '/history',   element: <App /> },
      { path: '/settings',  element: <App /> },
      { path: '*',          element: <NotFoundPage /> },
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
