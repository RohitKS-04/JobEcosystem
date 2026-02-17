import { api } from './api';
import type { Resume } from '../types';

export const resumeService = {
  async getResume(): Promise<Resume> {
    const response = await api.get<Resume>('/resume');
    return response.data;
  },

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post<Resume>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteResume(): Promise<void> {
    await api.delete('/resume');
  },
};
