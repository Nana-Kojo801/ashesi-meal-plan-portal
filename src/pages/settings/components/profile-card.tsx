import { motion } from 'framer-motion';
import type { BalanceData } from '../../../types';

interface ProfileCardProps {
  studentId: string;
  studentName: string;
  email: string;
  initial: string;
  balanceData: BalanceData | null;
}

export function ProfileCard({ studentId, studentName, email, initial, balanceData }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: '#fff',
        border: '1px solid #ECE0D4',
        borderRadius: 22,
        padding: 20,
        boxShadow: '0 12px 26px -18px rgba(110,30,18,.26)',
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #E0233A, #8E0F18)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{studentName}</div>
        <div style={{ fontSize: 13, color: '#7A6A63', fontWeight: 600 }}>
          Student ID {studentId} · {email}
        </div>
        {balanceData && (
          <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                background: '#F2E7DC',
                color: '#D81E2C',
                borderRadius: 99,
                letterSpacing: '.3px',
              }}
            >
              {balanceData.meal_plan_name}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                background:
                  balanceData.subscriber_status === 'active' ? 'rgba(34,197,94,.12)' : '#F2E7DC',
                color: balanceData.subscriber_status === 'active' ? '#16a34a' : '#7A6A63',
                borderRadius: 99,
                letterSpacing: '.3px',
                textTransform: 'capitalize',
              }}
            >
              {balanceData.subscriber_status}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
