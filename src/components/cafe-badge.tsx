import { cafeInitial, cafeTone } from '../lib/cafe';
import { cn } from '../lib/utils';

export function CafeBadge({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span className={cn('cafe-badge', `tone-${cafeTone(name)}`, size === 'sm' && 'small')} aria-hidden="true">
      {cafeInitial(name)}
    </span>
  );
}
