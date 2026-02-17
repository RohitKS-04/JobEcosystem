import { api } from './api';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<User>('/auth/login', { email, password });
    return response.data;
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await api.post<User>('/auth/signup', { name, email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth-token');
  },
};
