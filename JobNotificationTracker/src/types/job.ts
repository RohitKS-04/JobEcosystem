export type JobMode = 'Remote' | 'Hybrid' | 'Onsite';
export type JobExperience = 'Fresher' | '0-1' | '1-3' | '3-5';
export type JobSource = 'LinkedIn' | 'Naukri' | 'Indeed';
export type JobApplicationStatus = 'Not Applied' | 'Applied' | 'Rejected' | 'Selected';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: JobMode;
  experience: JobExperience;
  skills: string[];
  source: JobSource;
  postedDaysAgo: number;
  salaryRange: '3–5 LPA' | '6–10 LPA' | '10–18 LPA' | '₹15k–₹40k/month Internship';
  applyUrl: string;
  description: string;
};

export type SortOption = 'Latest' | 'Match Score' | 'Salary';

export type DashboardFilters = {
  keyword: string;
  location: string;
  mode: JobMode | 'All';
  experience: JobExperience | 'All';
  source: JobSource | 'All';
  status: JobApplicationStatus | 'All';
  sort: SortOption;
};

export type JobTrackerPreferences = {
  roleKeywords: string[];
  preferredLocations: string[];
  preferredMode: JobMode[];
  experienceLevel: JobExperience | 'Any';
  skills: string[];
  minMatchScore: number;
};

export type JobWithMatchScore = Job & {
  matchScore: number;
};

export type StatusHistoryEntry = {
  jobId: string;
  status: JobApplicationStatus;
  changedAt: string;
};
