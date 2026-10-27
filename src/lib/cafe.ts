/** Stable colour tone (0–5) for a café so it looks the same on every screen. */
export function cafeTone(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % 6;
}

export function cafeInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}
