import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../components/skeleton';
import { FetchingOutline } from './fetching-outline';
import { dateLabel, formatTime, fmtAmount } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface RecentActivityProps {
  items: HistoryItem[];
  isLoading: boolean;
  fetching: boolean;
}

export function RecentActivity({ items, isLoading, fetching }: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative' }}>
      {fetching && <FetchingOutline radius={22} />}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          background: '#fff',
          border: '1px solid #ECE0D4',
          borderRadius: 22,
          boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15 }}>Recent activity</div>
          <button
            onClick={() => navigate('/history')}
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#D81E2C',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            See all
          </button>
        </div>

        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 20px',
                borderTop: '1px solid #ECE0D4',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton height={14} borderRadius={6} />
                <Skeleton width="55%" height={11} borderRadius={5} />
              </div>
              <Skeleton width={70} height={15} borderRadius={6} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              color: '#7A6A63',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            No purchases today
          </div>
        ) : (
          items.map((tx, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                borderTop: '1px solid #ECE0D4',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tx.name}
                </div>
                <div
                  style={{ fontSize: '11.5px', color: '#7A6A63', fontWeight: 600, marginTop: 3 }}
                >
                  {tx.transaction_point} ·{' '}
                  {dateLabel(tx.date) === 'Today' ? formatTime(tx.date) : dateLabel(tx.date)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                −GHS {fmtAmount(tx.cost * tx.quantity)}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
