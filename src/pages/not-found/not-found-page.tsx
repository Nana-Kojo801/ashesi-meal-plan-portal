import { Link } from 'react-router-dom';
import { UtensilsCrossed, SearchX } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FBF6F0',
        color: '#1C1413',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: '#D81E2C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UtensilsCrossed size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-.2px' }}>Ashesi Meals</span>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 24,
          padding: '36px 32px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 22px 46px -24px rgba(110,30,18,.30)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: '#F2E7DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <SearchX size={26} color="#7A6A63" />
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: '-2px',
            color: '#1C1413',
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          404
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Page not found</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, lineHeight: 1.5 }}>
          This page doesn't exist. Check the URL or head back to the dashboard.
        </div>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            width: '100%',
            padding: '13px 20px',
            borderRadius: 13,
            background: '#D81E2C',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            boxShadow: '0 12px 22px -12px rgba(216,30,44,.55)',
            fontFamily: 'inherit',
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
