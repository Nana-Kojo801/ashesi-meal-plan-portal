import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  sub?: string;
  children: ReactNode;
  delay?: number;
}

export function ChartCard({ title, sub, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.2, 0.7, 0.2, 1] }}
      style={{
        background: '#fff',
        border: '1px solid #ECE0D4',
        borderRadius: 22,
        padding: '20px 20px 14px',
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.20)',
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: '#7A6A63', fontWeight: 600, marginTop: 2 }}>{sub}</div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
