import { motion } from 'framer-motion';
import { ArrowUpRight, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../components/skeleton';
import { dateLabel, formatTime, fmtAmount } from '../../../lib/utils';
import type { HistoryItem } from '../../../types';

interface RecentActivityProps {
  items: HistoryItem[];
  isLoading: boolean;
}

export function RecentActivity({ items, isLoading }: RecentActivityProps) {
  const navigate = useNavigate();
  return (
    <section className="activity-panel">
      <div className="panel-head">
        <h2 className="panel-title">Recent activity</h2>
        <button className="text-button" onClick={() => navigate('/history')}>
          View all <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="activity-list">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div className="activity-row" key={i}>
              <div className="activity-copy">
                <Skeleton width={38} height={38} borderRadius={99} />
                <div>
                  <Skeleton height={12} borderRadius={4} />
                  <Skeleton width="70%" height={9} borderRadius={4} style={{ marginTop: 7 }} />
                </div>
              </div>
              <Skeleton width={62} height={13} borderRadius={4} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="empty-state">No purchases today</div>
        ) : (
          items.map((tx, index) => (
            <motion.div
              className="activity-row"
              key={`${tx.date}-${tx.name}-${index}`}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: .2 + index * .07, type: 'spring', stiffness: 260, damping: 25 }}
            >
              <div className="activity-copy">
                <span className="activity-icon"><Receipt size={16} /></span>
                <div style={{ minWidth: 0 }}>
                  <div className="activity-name">{tx.name}</div>
                  <div className="activity-meta">
                    {tx.transaction_point} · {dateLabel(tx.date) === 'Today' ? formatTime(tx.date) : dateLabel(tx.date)}
                  </div>
                </div>
              </div>
              <div className="activity-amount">GHS {fmtAmount(tx.cost * tx.quantity)}</div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
