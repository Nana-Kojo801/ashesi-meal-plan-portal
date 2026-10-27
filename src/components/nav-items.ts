import { BarChart3, Calculator, Clock3, Home, SlidersHorizontal } from 'lucide-react';
import type { Screen } from '../types';

export const NAV_ITEMS: { key: Screen; label: string; Icon: typeof Home }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'report', label: 'History', Icon: Clock3 },
  { key: 'analytics', label: 'Insights', Icon: BarChart3 },
  { key: 'calculator', label: 'Calculator', Icon: Calculator },
  { key: 'settings', label: 'Settings', Icon: SlidersHorizontal },
];
