const BASE = 'https://api.mplan.ashesi.edu.gh/api';

export async function resetPin(studentId: string): Promise<void> {
  const res = await fetch(`${BASE}/resetPin/${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error(`Failed to reset PIN (${res.status})`);
}
