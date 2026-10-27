import type { Transition, Variants } from 'framer-motion';

/**
 * Springs are tuned by perceived duration and bounce so they stay lively on
 * every device. Only transform and opacity are animated, which run on the
 * compositor and stay smooth even while the main thread is busy.
 */

/** Snappy, very bouncy spring — buttons, pills, thumbs, badges. */
export const bouncy: Transition = { type: 'spring', bounce: 0.5, visualDuration: 0.32 };

/** Default UI spring — cards, sheets, list items. */
export const spring: Transition = { type: 'spring', bounce: 0.35, visualDuration: 0.38 };

/** Softer spring for large surfaces entering the screen. */
export const gentle: Transition = { type: 'spring', bounce: 0.3, visualDuration: 0.48 };

/** Page-to-page slide: quick with a small overshoot so edges don't gap. */
export const pageSpring: Transition = { type: 'spring', bounce: 0.2, visualDuration: 0.42 };

/** Data marks (bars, progress) settle with an obvious bounce. */
export const barSpring: Transition = { type: 'spring', bounce: 0.45, visualDuration: 0.6 };

export const tapScale = { scale: 0.92 };
export const pressScale = { scale: 0.96 };

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: spring },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: spring },
};
