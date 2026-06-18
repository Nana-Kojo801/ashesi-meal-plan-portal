interface FetchingOutlineProps {
  radius?: number;
}

export function FetchingOutline({ radius = 20 }: FetchingOutlineProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: 'rgba(240,227,215,0.45)',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      />
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        <rect
          x="1"
          y="1"
          width="99.5%"
          height="99.5%"
          rx={radius}
          ry={radius}
          fill="none"
          stroke="#D81E2C"
          strokeWidth="3"
          pathLength="1"
          strokeDasharray="0.08 0.92"
          style={{ animation: 'marchSVG 1.4s linear infinite' }}
        />
      </svg>
    </>
  );
}
