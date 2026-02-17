import type { JobExperience, JobMode } from './job';

export type Profile = {
  id: string;
  userId: string;
  roleKeywords: string[];
  preferredLocations: string[];
  preferredMode: JobMode | null;
  experienceLevel: JobExperience | null;
  updatedAt: string;
};
