import { api } from './api';
import type { Job } from '../types';

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  async getSavedJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/saved');
    return response.data;
  },

  async saveJob(jobId: string): Promise<void> {
    await api.post(`/jobs/${jobId}/save`);
  },

  async unsaveJob(jobId: string): Promise<void> {
    await api.delete(`/jobs/${jobId}/save`);
  },
};
