import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Ring } from '../../../components/ring';
import { FetchingOutline } from './fetching-outline';
import { fmtAmount } from '../../../lib/utils';

interface BalanceRingCardProps {
  dailyBalance: number;
  dailyLimit: number;
  spentToday: number;
  fraction: number;
  ringSize: number;
  ringSW: number;
  isMobile: boolean;
  fetching: boolean;
}

export function BalanceRingCard({
  dailyBalance,
  dailyLimit,
  spentToday,
  fraction,
  ringSize,
  ringSW,
  isMobile,
  fetching,
}: BalanceRingCardProps) {
  const navigate = useNavigate();
  const usedPct = Math.min(100, Math.round((spentToday / dailyLimit) * 100));

  return (
    <div style={{ position: 'relative' }}>
      {fetching && <FetchingOutline radius={26} />}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        style={{
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 26,
          boxShadow: '0 22px 46px -24px rgba(110,30,18,.40)',
          padding: isMobile ? 24 : '30px 34px',
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: isMobile ? 18 : 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(216,30,44,.10)',
            filter: 'blur(10px)',
          }}
        />
        <Ring size={ringSize} strokeWidth={ringSW} fraction={fraction} balance={dailyBalance} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#7A6A63' }}>
              You've used{' '}
              <b style={{ color: '#1C1413' }}>GHS {fmtAmount(spentToday)}</b> of your{' '}
              <b style={{ color: '#1C1413' }}>GHS {fmtAmount(dailyLimit)}</b> daily limit
            </div>
            <div
              style={{
                marginTop: 10,
                height: 10,
                borderRadius: 99,
                background: '#F0E3D7',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${usedPct}%`,
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #E0233A, #D81E2C)',
                  transition: 'width .5s ease',
                }}
              />
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={() => navigate('/history')}
              style={{
                alignSelf: 'flex-start',
                marginTop: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: '#F2E7DC',
                color: '#1C1413',
                fontWeight: 700,
                fontSize: 13,
                padding: '11px 16px',
                borderRadius: 13,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              View purchase history <ArrowRight size={15} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
