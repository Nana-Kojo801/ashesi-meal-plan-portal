import { motion } from 'framer-motion';
import { Receipt, RefreshCw } from 'lucide-react';
import { HistorySkeleton } from '../../../components/skeleton';
import { formatTime, fmtAmount } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface Group { date: string; label: string; total: number; items: HistoryItem[] }
interface Props { groups: Group[]; isLoading: boolean; error: string | null; onRetry: () => void }

export function TransactionList({ groups, isLoading, error, onRetry }: Props) {
  if (isLoading) return <HistorySkeleton />;
  if (error) {
    return (
      <div className="empty-state">
        <strong>{error}</strong>
        <div><button className="primary-button" onClick={onRetry} style={{ marginTop: 16 }}><RefreshCw size={14} /> Retry</button></div>
      </div>
    );
  }
  if (!groups.length) return <div className="empty-state">No purchases in this range. Try another date.</div>;
  return (
    <>
      {groups.map((group, groupIndex) => (
        <motion.section
          className="history-group"
          key={group.date}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * .08 }}
        >
          <div className="history-group-head">
            <div><strong>{group.label}</strong><small>{group.date}</small></div>
            <div className="history-group-total"><small>Total spent</small><span>GHS {fmtAmount(group.total)}</span></div>
          </div>
          <div className="transaction-list">
            {group.items.map((tx, index) => (
              <motion.div
                className="transaction-row"
                key={`${tx.date}-${tx.name}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIndex * .08 + index * .045 }}
              >
                <span className="transaction-icon"><Receipt size={16} /></span>
                <div className="transaction-item">{tx.name}</div>
                <div className="transaction-meta">{tx.transaction_point}</div>
                <div className="transaction-time">{formatTime(tx.date)}</div>
                <div className="transaction-qty">×{tx.quantity}</div>
                <div className="transaction-price">GHS {fmtAmount(tx.cost * tx.quantity)}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}
    </>
  );
}
