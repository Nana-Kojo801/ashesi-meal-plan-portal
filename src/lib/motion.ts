import type { Transition, Variants } from 'framer-motion';

/** Snappy spring with a little overshoot — buttons, pills, thumbs. */
export const bouncy: Transition = { type: 'spring', stiffness: 520, damping: 24, mass: 0.8 };

/** Default UI spring — cards, sheets, list items. */
export const spring: Transition = { type: 'spring', stiffness: 360, damping: 28, mass: 0.9 };

/** Slow, soft spring — page entrances and large surfaces. */
export const gentle: Transition = { type: 'spring', stiffness: 210, damping: 24, mass: 1 };

/** Springs for data marks (bars, progress) so values settle with a bounce. */
export const barSpring: Transition = { type: 'spring', stiffness: 170, damping: 16, mass: 0.9 };

export const tapScale = { scale: 0.95 };
export const pressScale = { scale: 0.97 };

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: gentle },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: spring },
};
