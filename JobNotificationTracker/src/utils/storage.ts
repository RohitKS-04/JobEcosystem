import type { JobApplicationStatus, JobTrackerPreferences, StatusHistoryEntry } from '../types';

const SAVED_JOBS_KEY = 'job-tracker-saved-ids';
const PREFERENCES_KEY = 'jobTrackerPreferences';
const PREFERENCES_VERSION_KEY = 'jobTrackerPreferencesVersion';
const JOB_STATUS_KEY = 'jobTrackerStatus';
const JOB_STATUS_HISTORY_KEY = 'jobTrackerStatusHistory';

export const defaultJobTrackerPreferences: JobTrackerPreferences = {
  roleKeywords: [],
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: 'Any',
  skills: [],
  minMatchScore: 40,
};

const defaultJobStatus: JobApplicationStatus = 'Not Applied';

export function readSavedJobIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function writeSavedJobIds(ids: string[]) {
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids));
}

export function readJobTrackerPreferences(): JobTrackerPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return defaultJobTrackerPreferences;
    }

    const parsed = JSON.parse(raw) as Partial<JobTrackerPreferences>;
    return {
      roleKeywords: Array.isArray(parsed.roleKeywords)
        ? parsed.roleKeywords.filter((item: unknown): item is string => typeof item === 'string')
        : [],
      preferredLocations: Array.isArray(parsed.preferredLocations)
        ? parsed.preferredLocations.filter((item: unknown): item is string => typeof item === 'string')
        : [],
      preferredMode: Array.isArray(parsed.preferredMode)
        ? parsed.preferredMode.filter(
            (item: unknown): item is JobTrackerPreferences['preferredMode'][number] =>
              item === 'Remote' || item === 'Hybrid' || item === 'Onsite',
          )
        : [],
      experienceLevel:
        parsed.experienceLevel === 'Fresher' ||
        parsed.experienceLevel === '0-1' ||
        parsed.experienceLevel === '1-3' ||
        parsed.experienceLevel === '3-5' ||
        parsed.experienceLevel === 'Any'
          ? parsed.experienceLevel
          : 'Any',
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.filter((item: unknown): item is string => typeof item === 'string')
        : [],
      minMatchScore:
        typeof parsed.minMatchScore === 'number' && parsed.minMatchScore >= 0 && parsed.minMatchScore <= 100
          ? parsed.minMatchScore
          : 40,
    };
  } catch {
    return defaultJobTrackerPreferences;
  }
}

export function writeJobTrackerPreferences(preferences: JobTrackerPreferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  bumpJobTrackerPreferencesVersion();
}

export function hasSavedJobTrackerPreferences(): boolean {
  return localStorage.getItem(PREFERENCES_KEY) !== null;
}

function readPreferenceVersionRaw(): number {
  const raw = localStorage.getItem(PREFERENCES_VERSION_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getJobTrackerPreferencesVersion(): number {
  return readPreferenceVersionRaw();
}

export function bumpJobTrackerPreferencesVersion(): number {
  const next = readPreferenceVersionRaw() + 1;
  localStorage.setItem(PREFERENCES_VERSION_KEY, String(next));
  return next;
}

export function clearJobTrackerPreferences() {
  localStorage.removeItem(PREFERENCES_KEY);
  bumpJobTrackerPreferencesVersion();
}

export type JobStatusMap = Record<string, JobApplicationStatus>;

export function readJobStatusMap(): JobStatusMap {
  try {
    const raw = localStorage.getItem(JOB_STATUS_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entries = Object.entries(parsed).filter((entry): entry is [string, JobApplicationStatus] => {
      const value = entry[1];
      return value === 'Not Applied' || value === 'Applied' || value === 'Rejected' || value === 'Selected';
    });

    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

function writeJobStatusMap(map: JobStatusMap) {
  localStorage.setItem(JOB_STATUS_KEY, JSON.stringify(map));
}

export function readJobStatus(jobId: string): JobApplicationStatus {
  const map = readJobStatusMap();
  return map[jobId] ?? defaultJobStatus;
}

export function writeJobStatus(jobId: string, status: JobApplicationStatus) {
  const map = readJobStatusMap();
  map[jobId] = status;
  writeJobStatusMap(map);
}

export function readStatusHistory(): StatusHistoryEntry[] {
  try {
    const raw = localStorage.getItem(JOB_STATUS_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry: unknown): entry is StatusHistoryEntry => {
      if (!entry || typeof entry !== 'object') {
        return false;
      }

      const data = entry as Record<string, unknown>;
      return (
        typeof data.jobId === 'string' &&
        typeof data.changedAt === 'string' &&
        (data.status === 'Not Applied' || data.status === 'Applied' || data.status === 'Rejected' || data.status === 'Selected')
      );
    });
  } catch {
    return [];
  }
}

export function appendStatusHistory(entry: StatusHistoryEntry) {
  const current = readStatusHistory();
  const next = [entry, ...current].slice(0, 100);
  localStorage.setItem(JOB_STATUS_HISTORY_KEY, JSON.stringify(next));
}
