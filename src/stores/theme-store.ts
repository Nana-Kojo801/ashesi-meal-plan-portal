import { flushSync } from 'react-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePref = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ashesi-theme';
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#FFFFFF', dark: '#0A0A0B' };
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref === 'system') return darkQuery.matches ? 'dark' : 'light';
  return pref;
}

function applyTheme(pref: ThemePref) {
  const theme = resolveTheme(pref);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

interface ThemeState {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (pref: ThemePref) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      pref: 'system',
      resolved: resolveTheme('system'),
      setPref: (pref) => {
        applyTheme(pref);
        set({ pref, resolved: resolveTheme(pref) });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ pref: state.pref }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setPref(state.pref);
      },
    },
  ),
);

darkQuery.addEventListener('change', () => {
  const { pref, setPref } = useThemeStore.getState();
  if (pref === 'system') setPref('system');
});

/**
 * Switches theme with a circular reveal from `origin` where the browser supports
 * view transitions; falls back to an instant swap.
 */
export function changeTheme(pref: ThemePref, origin?: { x: number; y: number }) {
  const { setPref } = useThemeStore.getState();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion || resolveTheme(pref) === useThemeStore.getState().resolved) {
    setPref(pref);
    return;
  }
  const transition = document.startViewTransition(() => flushSync(() => setPref(pref)));
  if (!origin) return;
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}
