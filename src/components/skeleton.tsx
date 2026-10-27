import type { CSSProperties } from 'react';

export function Skeleton({ width = '100%', height, borderRadius = 10, style }: { width?: number | string; height: number | string; borderRadius?: number; style?: CSSProperties }) {
  return <div aria-hidden="true" className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="loading-rows">
      {Array.from({ length: count }, (_, i) => (
        <div className="loading-row" key={i}>
          <Skeleton width={42} height={42} borderRadius={13} />
          <div><Skeleton width="70%" height={14} /><Skeleton width="45%" height={11} style={{ marginTop: 8 }} /></div>
          <Skeleton width={70} height={16} />
        </div>
      ))}
    </div>
  );
}

function PageHeading({ title }: { title: string }) {
  return <header className="page-header"><div><h1 className="page-title">{title}</h1><Skeleton width={220} height={14} style={{ marginTop: 10 }} /></div></header>;
}

export function DashboardSkeleton() {
  return (
    <div className="page" role="status" aria-label="Loading balance and activity">
      <header className="page-header"><div><Skeleton width={150} height={13} /><Skeleton width={260} height={32} style={{ marginTop: 10 }} /></div></header>
      <div className="columns">
        <div className="column-main">
          <div className="hero-card"><Skeleton width={140} height={14} /><Skeleton width={220} height={60} style={{ marginTop: 14 }} /><Skeleton width={200} height={13} style={{ marginTop: 14 }} /></div>
          <div className="card"><LoadingRows count={3} /></div>
        </div>
        <div className="column-side"><div className="card"><Skeleton height={180} /></div></div>
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return <div className="card" role="status" aria-label="Loading purchases"><LoadingRows count={5} /></div>;
}

export function AnalyticsSkeleton() {
  return (
    <div className="page" role="status" aria-label="Loading insights">
      <PageHeading title="Insights" />
      <div className="tile-grid">{[0, 1, 2, 3].map((i) => <div className="card tile" key={i}><Skeleton width="60%" height={12} /><Skeleton width="80%" height={26} style={{ marginTop: 10 }} /></div>)}</div>
      <div className="card"><Skeleton height={260} /></div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="page" role="status" aria-label="Loading calculator">
      <PageHeading title="Calculator" />
      <Skeleton height={52} borderRadius={18} />
      <div className="card"><LoadingRows count={6} /></div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="page" role="status" aria-label="Loading settings">
      <PageHeading title="Settings" />
      <div className="card"><Skeleton width={72} height={72} borderRadius={99} /><Skeleton width="50%" height={20} style={{ marginTop: 16 }} /><LoadingRows count={2} /></div>
    </div>
  );
}
