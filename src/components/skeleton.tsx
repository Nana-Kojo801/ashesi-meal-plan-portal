import type { CSSProperties } from 'react';

export function Skeleton({ width = '100%', height, borderRadius = 8, style }: { width?: number | string; height: number | string; borderRadius?: number; style?: CSSProperties }) {
  return <div aria-hidden="true" className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}

function LoadingRows({ count = 4 }: { count?: number }) {
  return <div className="loading-rows">{Array.from({ length: count }, (_, i) => <div className="loading-row" key={i}><Skeleton width={42} height={42} borderRadius={99} /><div><Skeleton width="75%" height={16} /><Skeleton width="55%" height={11} style={{ marginTop: 9 }} /></div><Skeleton width={72} height={18} /></div>)}</div>;
}

function LoadingHeading({ title }: { title: string }) {
  return <header className="page-heading"><h1 className="page-title">{title}</h1><Skeleton width="min(300px,85%)" height={14} style={{ marginTop: 16 }} /></header>;
}

export function DashboardSkeleton() {
  return <div className="page home-grid loading-page" role="status" aria-label="Loading balance and activity"><section className="balance-stage red-plane"><Skeleton width={180} height={14} /><Skeleton width={150} height={50} style={{ marginTop: 16 }} /><div className="balance-main"><Skeleton width="95%" height={95} /><Skeleton width={160} height={12} style={{ marginTop: 24 }} /><Skeleton height={8} style={{ marginTop: 30 }} /></div><div className="home-facts">{[0, 1].map(i => <div className="home-fact" key={i}><Skeleton width="85%" height={32} /><Skeleton width="60%" height={10} style={{ marginTop: 12 }} /></div>)}</div></section><section className="activity-panel"><h2 className="panel-title">Recent activity</h2><LoadingRows count={6} /></section></div>;
}

export function HistorySkeleton() {
  return <div className="loading-history" role="status" aria-label="Loading purchases"><div className="history-group-head"><Skeleton width={100} height={22} /><Skeleton width={100} height={22} /></div><LoadingRows /></div>;
}

export function AnalyticsSkeleton() {
  return <div className="page analytics-page loading-page" role="status" aria-label="Loading analytics"><LoadingHeading title="Analytics" /><div className="analytics-hero red-plane">{[0, 1, 2, 3].map(i => <div className="analytics-stat" key={i}><Skeleton width="85%" height={38} /><Skeleton width="65%" height={10} style={{ marginTop: 14 }} /></div>)}</div><div className="analytics-grid"><section className="analytics-section"><h2 className="analytics-section-title">Daily spending</h2><div className="daily-chart loading-chart"><Skeleton height="100%" /></div></section><section className="analytics-section"><h2 className="analytics-section-title">This week vs last week</h2><LoadingRows count={2} /></section></div><div className="analytics-bottom">{['Café ranking', 'Top items', 'Day of week activity'].map(title => <section className="analytics-section" key={title}><h2 className="analytics-section-title">{title}</h2><LoadingRows count={2} /></section>)}</div></div>;
}

export function CalculatorSkeleton() {
  return <div className="page calculator-layout loading-page" role="status" aria-label="Loading calculator"><section className="calculator-main"><LoadingHeading title="Price Calculator" /><Skeleton height={78} /><Skeleton height={52} borderRadius={99} style={{ marginTop: 16 }} /><LoadingRows count={6} /></section><aside className="calculator-order red-plane"><h2 className="order-title">Your order</h2><LoadingRows count={2} /><div className="order-summary">{[0, 1, 2].map(i => <Skeleton key={i} height={55} width="75%" />)}</div></aside></div>;
}

export function SettingsSkeleton() {
  return <div className="page settings-page loading-page" role="status" aria-label="Loading settings"><LoadingHeading title="Settings" /><div className="settings-profile red-plane"><Skeleton width={80} height={80} borderRadius={99} /><div><Skeleton height={32} /><Skeleton height={14} style={{ marginTop: 15 }} /></div><Skeleton height={42} /></div><LoadingRows count={2} /></div>;
}
