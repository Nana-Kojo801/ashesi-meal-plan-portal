import { motion } from 'framer-motion';
import { FetchingOutline } from './fetching-outline';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
  delay?: number;
  fetching?: boolean;
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  valueColor,
  delay = 0,
  fetching = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff',
        border: '1px solid #ECE0D4',
        borderRadius: 20,
        padding: '18px 20px',
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
        position: 'relative',
      }}
    >
      {fetching && <FetchingOutline radius={20} />}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#7A6A63',
          fontSize: '12.5px',
          fontWeight: 700,
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-1px',
          marginTop: 8,
          color: valueColor ?? '#1C1413',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#7A6A63', fontWeight: 600, marginTop: 2 }}>{sub}</div>
    </motion.div>
  );
}
