import { useEffect } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { fmtAmount } from '../lib/utils';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

/**
 * Shows `value` immediately and springs to new values when it changes (e.g.
 * calculator totals). It deliberately doesn't count up on mount: re-rendering
 * text every frame while a page slides in is costly on phones.
 */
export function AnimatedNumber({ value, format = fmtAmount, className }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const motionValue = useSpring(value, { stiffness: 220, damping: 26 });
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (reduceMotion) motionValue.jump(value);
    else motionValue.set(value);
  }, [motionValue, reduceMotion, value]);

  return <motion.span className={className}>{text}</motion.span>;
}
