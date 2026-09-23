import { lazy, Suspense } from 'react';
import { AnalyticsSkeleton, CalculatorSkeleton } from './components/skeleton';

const ReportsPage = lazy(() =>
  import('./pages/reports/reports-page').then((module) => ({ default: module.ReportsPage })),
);

const CalculatorPage = lazy(() =>
  import('./pages/calculator/calculator-page').then((module) => ({ default: module.CalculatorPage })),
);

export function ReportsRoute() {
  return <Suspense fallback={<AnalyticsSkeleton />}><ReportsPage /></Suspense>;
}

export function CalculatorRoute() {
  return <Suspense fallback={<CalculatorSkeleton />}><CalculatorPage /></Suspense>;
}
