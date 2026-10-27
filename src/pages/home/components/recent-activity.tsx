import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CafeBadge } from '../../../components/cafe-badge';
import { LoadingRows } from '../../../components/skeleton';
import { bouncy, slideIn, stagger, tapScale } from '../../../lib/motion';
import { formatTime, fmtMoney } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface RecentActivityProps {
  items: HistoryItem[];
  isLoading: boolean;
  total: string;
}

export function RecentActivity({ items, isLoading, total }: RecentActivityProps) {
  const navigate = useNavigate();
  return (
    <section className="card list-card" aria-label="Today's purchases">
      <div className="card-head padded">
        <div>
          <h2 className="card-title">Today’s purchases</h2>
          {!isLoading && items.length > 0 && (
            <p className="card-sub">{items.length} purchase{items.length === 1 ? '' : 's'} · {total}</p>
          )}
        </div>
        <motion.button type="button" className="button ghost" onClick={() => navigate('/history')} whileTap={tapScale} transition={bouncy}>
          View all <ChevronRight size={16} />
        </motion.button>
      </div>
      {isLoading ? (
        <LoadingRows count={3} />
      ) : items.length === 0 ? (
        <p className="empty-note">No purchases yet today.</p>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          {items.map((tx, index) => (
            <motion.div className="list-row" key={`${tx.date}-${tx.name}-${index}`} variants={slideIn}>
              <CafeBadge name={tx.transaction_point} />
              <div className="list-text">
                <strong>{tx.name}</strong>
                <small>{tx.transaction_point} · {formatTime(tx.date)}</small>
              </div>
              <div className="list-trailing">
                <strong>{fmtMoney(tx.cost * tx.quantity)}</strong>
                {tx.quantity > 1 && <small>{tx.quantity} × {fmtMoney(tx.cost)}</small>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
