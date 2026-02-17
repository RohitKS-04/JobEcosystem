import { create } from 'zustand';
import type { Resume } from '../types';

type ResumeStore = {
  resume: Resume | null;
  isLoading: boolean;
  setResume: (resume: Resume | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: null,
  isLoading: false,
  setResume: (resume) => set({ resume }),
  setLoading: (isLoading) => set({ isLoading }),
}));
