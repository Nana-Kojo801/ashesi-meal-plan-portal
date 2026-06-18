import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { HistorySkeleton } from '../../../components/skeleton';
import { formatTime, fmtAmount } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface TransactionGroup {
  date: string;
  label: string;
  total: number;
  items: HistoryItem[];
}

interface TransactionListProps {
  groups: TransactionGroup[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function TransactionList({ groups, isLoading, error, onRetry }: TransactionListProps) {
  if (isLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{error}</div>
        <button
          onClick={onRetry}
          style={{
            marginTop: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#D81E2C',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '52px 20px',
          background: '#fff',
          border: '1px dashed #ECE0D4',
          borderRadius: 20,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15 }}>No purchases in this range</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600, marginTop: 5 }}>
          Try a different date filter.
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map((group, gi) => (
        <motion.div
          key={group.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.07 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 9px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.2px' }}>{group.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7A6A63' }}>
              GHS {fmtAmount(group.total)}
            </div>
          </div>
          <div
            style={{
              background: '#fff',
              border: '1px solid #ECE0D4',
              borderRadius: 20,
              boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
              overflow: 'hidden',
            }}
          >
            {group.items.map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gi * 0.07 + i * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '15px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid #ECE0D4',
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 34,
                    borderRadius: 99,
                    background: '#D81E2C',
                    opacity: 0.55,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{tx.name}</div>
                  <div style={{ fontSize: 12, color: '#7A6A63', fontWeight: 600, marginTop: 3 }}>
                    {tx.transaction_point} · Qty {tx.quantity} · {formatTime(tx.date)}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  GHS {fmtAmount(tx.cost * tx.quantity)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
