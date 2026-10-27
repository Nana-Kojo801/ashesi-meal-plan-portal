import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { CafeBadge } from '../../../components/cafe-badge';
import { HistorySkeleton } from '../../../components/skeleton';
import { bouncy, slideIn, stagger, tapScale } from '../../../lib/motion';
import { formatTime, fmtMoney } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface Group { date: string; label: string; total: number; items: HistoryItem[] }
interface Props { groups: Group[]; isLoading: boolean; error: string | null; onRetry: () => void }

export function TransactionList({ groups, isLoading, error, onRetry }: Props) {
  if (isLoading) return <HistorySkeleton />;
  if (error) {
    return (
      <div className="card empty-state">
        <strong>Couldn’t load purchases</strong>
        <p>{error}</p>
        <motion.button className="button primary" onClick={onRetry} whileTap={tapScale} transition={bouncy}><RefreshCw size={15} /> Retry</motion.button>
      </div>
    );
  }
  if (!groups.length) {
    return <div className="card empty-state"><strong>No purchases</strong><p>Nothing was bought in this range. Try another date.</p></div>;
  }
  return (
    <motion.div className="history-groups" variants={stagger} initial="hidden" animate="show">
      {groups.map((group) => (
        <section className="history-group" key={group.date} aria-label={group.label}>
          <div className="history-group-head">
            <span>
              <strong>{group.label}</strong>
              {(group.label === 'Today' || group.label === 'Yesterday') && (
                <small>{new Date(`${group.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
              )}
            </span>
            <strong>{fmtMoney(group.total)}</strong>
          </div>
          <div className="card list-card">
            <div className="tx-columns" aria-hidden="true">
              <span>Item</span><span>Café</span><span>Time</span><span>Qty</span><span>Amount</span>
            </div>
            {group.items.map((tx, index) => (
              <motion.div className="list-row tx-row" key={`${tx.date}-${tx.name}-${index}`} variants={slideIn}>
                <CafeBadge name={tx.transaction_point} />
                <div className="list-text">
                  <strong>{tx.name}</strong>
                  <small className="mobile-only">{tx.transaction_point} · {formatTime(tx.date)}</small>
                </div>
                <span className="tx-cell">{tx.transaction_point}</span>
                <span className="tx-cell muted">{formatTime(tx.date)}</span>
                <span className="tx-cell muted">×{tx.quantity}</span>
                <div className="list-trailing">
                  <strong>{fmtMoney(tx.cost * tx.quantity)}</strong>
                  {tx.quantity > 1 && <small className="mobile-only">{tx.quantity} × {fmtMoney(tx.cost)}</small>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}
