import { create } from 'zustand';
import type { DashboardFilters, Job } from '../types';

type JobStore = {
  jobs: Job[];
  filters: DashboardFilters;
  selectedJob: Job | null;
  isLoading: boolean;
  setJobs: (jobs: Job[]) => void;
  setFilters: (filters: DashboardFilters) => void;
  setSelectedJob: (job: Job | null) => void;
  setLoading: (loading: boolean) => void;
};

const initialFilters: DashboardFilters = {
  keyword: '',
  location: 'All',
  mode: 'All',
  experience: 'All',
  source: 'All',
  status: 'All',
  sort: 'Latest',
};

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  filters: initialFilters,
  selectedJob: null,
  isLoading: false,
  setJobs: (jobs) => set({ jobs }),
  setFilters: (filters) => set({ filters }),
  setSelectedJob: (selectedJob) => set({ selectedJob }),
  setLoading: (isLoading) => set({ isLoading }),
}));
