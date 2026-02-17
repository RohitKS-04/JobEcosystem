import type { Job, JobTrackerPreferences } from '../types';

function normalizeTokens(items: string[]): string[] {
  return items
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

function parseSalaryToAnnualNumber(salaryRange: Job['salaryRange']): number {
  const normalized = salaryRange.toLowerCase();
  const values = Array.from(normalized.matchAll(/(\d+(?:\.\d+)?)\s*(k)?/g)).map((match) => {
    const num = Number(match[1]);
    if (Number.isNaN(num)) {
      return 0;
    }
    return match[2] ? num * 1000 : num;
  });

  if (values.length === 0) {
    return 0;
  }

  const max = Math.max(...values);

  if (normalized.includes('lpa')) {
    return max * 100000;
  }

  if (normalized.includes('/month')) {
    return max * 12;
  }

  return max;
}

export function calculateJobMatchScore(job: Job, preferences: JobTrackerPreferences): number {
  const roleKeywords = normalizeTokens(preferences.roleKeywords);
  const userSkills = normalizeTokens(preferences.skills);
  const title = job.title.toLowerCase();
  const description = job.description.toLowerCase();
  const jobSkills = normalizeTokens(job.skills);

  let score = 0;

  if (roleKeywords.some((keyword) => title.includes(keyword))) {
    score += 25;
  }

  if (roleKeywords.some((keyword) => description.includes(keyword))) {
    score += 15;
  }

  if (preferences.preferredLocations.includes(job.location)) {
    score += 15;
  }

  if (preferences.preferredMode.includes(job.mode)) {
    score += 10;
  }

  if (preferences.experienceLevel !== 'Any' && preferences.experienceLevel === job.experience) {
    score += 10;
  }

  if (userSkills.some((skill) => jobSkills.includes(skill))) {
    score += 15;
  }

  if (job.postedDaysAgo <= 2) {
    score += 5;
  }

  if (job.source === 'LinkedIn') {
    score += 5;
  }

  return Math.min(score, 100);
}

export function sortBySalaryDescending(a: Job, b: Job): number {
  return parseSalaryToAnnualNumber(b.salaryRange) - parseSalaryToAnnualNumber(a.salaryRange);
}

export function parseCommaSeparatedInput(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
