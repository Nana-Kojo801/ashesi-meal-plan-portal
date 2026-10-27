import { useEffect } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { fmtAmount } from '../lib/utils';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

/** Counts up/down to `value` on a spring whenever it changes. */
export function AnimatedNumber({ value, format = fmtAmount, className }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const motionValue = useSpring(reduceMotion ? value : 0, { stiffness: 120, damping: 20, mass: 0.9 });
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (reduceMotion) motionValue.jump(value);
    else motionValue.set(value);
  }, [motionValue, reduceMotion, value]);

  return <motion.span className={className}>{text}</motion.span>;
}
