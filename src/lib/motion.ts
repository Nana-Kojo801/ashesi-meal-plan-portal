import { createContext, useContext } from 'react';
import type { Transition, Variants } from 'framer-motion';

/**
 * Performance rule for this app: entrance and page animations use the full
 * `transform` string plus `opacity`. Motion hands those to the browser's
 * compositor (Web Animations API), so they stay smooth on phones even while
 * React is busy rendering. The `x` / `y` / `scale` shorthands run on the main
 * thread every frame, so they are kept to short, single-element interactions
 * such as taps.
 */

/** Snappy, very bouncy spring — buttons, pills, thumbs, badges. */
export const bouncy: Transition = { type: 'spring', bounce: 0.5, visualDuration: 0.32 };

/** Default UI spring — cards, sheets, list items. */
export const spring: Transition = { type: 'spring', bounce: 0.35, visualDuration: 0.38 };

/** Softer spring for large surfaces entering the screen. */
export const gentle: Transition = { type: 'spring', bounce: 0.3, visualDuration: 0.48 };

/** Page-to-page slide: settles in ~200ms (90% of the way in ~100ms) with a hint of overshoot. */
export const pageSpring: Transition = { type: 'spring', bounce: 0.12, visualDuration: 0.16 };

/** Data marks (bars, progress) settle with an obvious bounce. */
export const barSpring: Transition = { type: 'spring', bounce: 0.45, visualDuration: 0.6 };

export const tapScale = { scale: 0.92 };
export const pressScale = { scale: 0.96 };

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: spring },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, transform: 'translateX(-14px)' },
  show: { opacity: 1, transform: 'translateX(0px)', transition: spring },
};

/** Grow-in for bars and meters; pair with a CSS transform-origin. */
export const growY = { initial: { transform: 'scaleY(0)' }, animate: { transform: 'scaleY(1)' } };
export const growX = (fraction: number) => ({ initial: { transform: 'scaleX(0)' }, animate: { transform: `scaleX(${fraction})` } });

/**
 * Whether a freshly mounted page should play its staggered entrance. False
 * while a page slides in on mobile: the slide is the animation, and animating
 * every card on top of it is what makes low-end phones stutter.
 */
export const EntranceContext = createContext(true);

export function useEntrance(): 'hidden' | false {
  return useContext(EntranceContext) ? 'hidden' : false;
}
