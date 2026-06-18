import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  studentId: string | null;
  login: (id: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      studentId: null,
      login: (id) => set({ studentId: id }),
      logout: () => set({ studentId: null }),
    }),
    { name: 'ashesi-session' },
  ),
);
