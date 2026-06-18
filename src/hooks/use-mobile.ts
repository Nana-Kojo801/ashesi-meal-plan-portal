import { useState, useEffect } from 'react';

const BREAKPOINT = 768;

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}
