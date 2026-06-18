import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height: number | string;
  borderRadius?: number;
  style?: CSSProperties;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #EFE0D2 25%, #FAF1E8 50%, #EFE0D2 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <Skeleton width={80} height={14} borderRadius={6} />
        <Skeleton width={160} height={isMobile ? 28 : 34} borderRadius={8} style={{ marginTop: 8 }} />
      </div>
      <div style={{
        background: '#fff', border: '1px solid #ECE0D4', borderRadius: 26,
        padding: isMobile ? 24 : '30px 34px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 18 : 28,
      }}>
        <Skeleton width={isMobile ? 132 : 200} height={isMobile ? 132 : 200} borderRadius={9999} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={13} borderRadius={6} />
          <Skeleton height={10} borderRadius={99} style={{ marginTop: 4 }} />
          <Skeleton width={140} height={40} borderRadius={13} style={{ marginTop: 4 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        {[0, 1, 2].map(i => (
          <Skeleton key={i} height={120} borderRadius={20} />
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 22, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width={120} height={15} borderRadius={6} />
          <Skeleton width={50} height={15} borderRadius={6} />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderTop: '1px solid #ECE0D4' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton height={14} borderRadius={6} />
              <Skeleton width="60%" height={11} borderRadius={5} />
            </div>
            <Skeleton width={70} height={15} borderRadius={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {[0, 1, 2].map(gi => (
        <div key={gi}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 9px' }}>
            <Skeleton width={80} height={13} borderRadius={6} />
            <Skeleton width={60} height={13} borderRadius={6} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECE0D4', borderRadius: 20, overflow: 'hidden' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '15px 18px', borderTop: i === 0 ? 'none' : '1px solid #ECE0D4', alignItems: 'center' }}>
                <Skeleton width={3} height={34} borderRadius={99} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton height={14} borderRadius={6} />
                  <Skeleton width="55%" height={12} borderRadius={5} />
                </div>
                <Skeleton width={60} height={16} borderRadius={6} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
