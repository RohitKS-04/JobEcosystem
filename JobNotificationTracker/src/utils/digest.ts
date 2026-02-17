import type { DailyDigest, JobWithMatchScore } from '../types';

function getDigestStorageKey(date: string): string {
  return `jobTrackerDigest_${date}`;
}

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readDailyDigest(date: string): DailyDigest | null {
  try {
    const raw = localStorage.getItem(getDigestStorageKey(date));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as DailyDigest;
    if (
      !parsed ||
      !Array.isArray(parsed.jobs) ||
      typeof parsed.date !== 'string' ||
      typeof parsed.generatedAt !== 'string' ||
      typeof parsed.preferencesVersion !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeDailyDigest(date: string, digest: DailyDigest) {
  localStorage.setItem(getDigestStorageKey(date), JSON.stringify(digest));
}

export function selectTopDigestJobs(scoredJobs: JobWithMatchScore[], limit = 10): JobWithMatchScore[] {
  return [...scoredJobs]
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }

      if (a.postedDaysAgo !== b.postedDaysAgo) {
        return a.postedDaysAgo - b.postedDaysAgo;
      }

      return a.id.localeCompare(b.id);
    })
    .slice(0, limit);
}

export function formatDigestAsPlainText(digest: DailyDigest): string {
  const lines = [
    'Top 10 Jobs For You - 9AM Digest',
    `Date: ${digest.date}`,
    '',
    ...digest.jobs.map(
      (job, index) =>
        `${index + 1}. ${job.title}\n   ${job.company} | ${job.location} | ${job.experience} | Match ${job.matchScore}\n   Apply: ${job.applyUrl}`,
    ),
    '',
    'This digest was generated based on your preferences.',
  ];

  return lines.join('\n');
}
