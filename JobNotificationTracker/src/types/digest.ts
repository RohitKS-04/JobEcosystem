import type { JobWithMatchScore } from './job';

export type DailyDigest = {
  date: string;
  generatedAt: string;
  preferencesVersion: number;
  jobs: JobWithMatchScore[];
};
