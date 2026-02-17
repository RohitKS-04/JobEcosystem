import { useEffect, useMemo, useState } from 'react';
import { jobs } from '../../jobs/data/jobs';
import type { DailyDigest, JobWithMatchScore } from '../../../types';
import {
  calculateJobMatchScore,
  formatDigestAsPlainText,
  getJobTrackerPreferencesVersion,
  getTodayDateKey,
  hasSavedJobTrackerPreferences,
  readStatusHistory,
  readDailyDigest,
  readJobTrackerPreferences,
  selectTopDigestJobs,
  writeDailyDigest,
} from '../../../utils';

function getMatchBadgeClass(score: number): string {
  if (score >= 80) {
    return 'match-badge match-badge--high';
  }

  if (score >= 60) {
    return 'match-badge match-badge--amber';
  }

  if (score >= 40) {
    return 'match-badge match-badge--neutral';
  }

  return 'match-badge match-badge--low';
}

function getStatusBadgeClass(status: 'Not Applied' | 'Applied' | 'Rejected' | 'Selected'): string {
  if (status === 'Applied') {
    return 'status-badge status-badge--applied';
  }

  if (status === 'Rejected') {
    return 'status-badge status-badge--rejected';
  }

  if (status === 'Selected') {
    return 'status-badge status-badge--selected';
  }

  return 'status-badge status-badge--neutral';
}

export function DigestPage() {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const hasPreferences = useMemo(() => hasSavedJobTrackerPreferences(), []);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const preferencesVersion = useMemo(() => getJobTrackerPreferencesVersion(), []);

  const scoredJobs = useMemo<JobWithMatchScore[]>(() => {
    if (!hasPreferences) {
      return [];
    }

    const preferences = readJobTrackerPreferences();
    return jobs
      .map((job) => ({ ...job, matchScore: calculateJobMatchScore(job, preferences) }))
      .filter((job) => job.matchScore > 0);
  }, [hasPreferences]);

  useEffect(() => {
    if (!hasPreferences) {
      return;
    }

    const existing = readDailyDigest(todayDateKey);
    if (existing && existing.preferencesVersion === preferencesVersion) {
      setDigest(existing);
      setStatusMessage('Loaded existing digest for today.');
      return;
    }

    if (existing) {
      setDigest(null);
      setStatusMessage('Preferences changed. Generate a fresh digest for today.');
    }
  }, [hasPreferences, preferencesVersion, todayDateKey]);

  const handleGenerateDigest = () => {
    const existing = readDailyDigest(todayDateKey);
    if (existing && existing.preferencesVersion === preferencesVersion) {
      setDigest(existing);
      setStatusMessage('Digest already generated today. Loaded existing version.');
      return;
    }

    const selectedJobs = selectTopDigestJobs(scoredJobs, 10);
    const generatedDigest: DailyDigest = {
      date: todayDateKey,
      generatedAt: new Date().toISOString(),
      preferencesVersion,
      jobs: selectedJobs,
    };

    writeDailyDigest(todayDateKey, generatedDigest);
    setDigest(generatedDigest);
    setStatusMessage('Today\'s digest generated.');
  };

  const digestText = useMemo(() => {
    if (!digest) {
      return '';
    }

    return formatDigestAsPlainText(digest);
  }, [digest]);

  const handleCopyDigest = async () => {
    if (!digestText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(digestText);
      setStatusMessage('Digest copied to clipboard.');
    } catch {
      setStatusMessage('Clipboard access failed. Please copy manually.');
    }
  };

  const emailDraftUrl = useMemo(() => {
    if (!digestText) {
      return '';
    }

    return `mailto:?subject=${encodeURIComponent('My 9AM Job Digest')}&body=${encodeURIComponent(digestText)}`;
  }, [digestText]);

  const recentStatusUpdates = useMemo(() => {
    const jobsById = new Map(jobs.map((job) => [job.id, job]));

    return readStatusHistory()
      .map((entry) => {
        const job = jobsById.get(entry.jobId);
        if (!job) {
          return null;
        }

        return {
          jobId: entry.jobId,
          title: job.title,
          company: job.company,
          status: entry.status,
          changedAt: entry.changedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 8);
  }, []);

  if (!hasPreferences) {
    return (
      <main className="page-shell">
        <section className="page-content dashboard-content">
          <h1>Digest</h1>
          <section className="preference-banner" role="alert">
            Set preferences to generate a personalized digest.
          </section>
          <p className="digest-demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content">
        <h1>Digest</h1>

        <div className="digest-toolbar">
          <button type="button" className="btn-primary" onClick={handleGenerateDigest}>
            Generate Today&apos;s 9AM Digest (Simulated)
          </button>

          <button type="button" className="btn-secondary" onClick={handleCopyDigest} disabled={!digest}>
            Copy Digest to Clipboard
          </button>

          <a
            className={`btn-secondary${digest ? '' : ' btn-disabled'}`}
            href={digest ? emailDraftUrl : undefined}
            aria-disabled={!digest}
          >
            Create Email Draft
          </a>
        </div>

        <p className="digest-demo-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        {statusMessage ? <p className="settings-save-message">{statusMessage}</p> : null}

        {digest && digest.jobs.length === 0 ? (
          <section className="premium-empty-state">
            <h2>No matching roles today. Check again tomorrow.</h2>
          </section>
        ) : null}

        {digest && digest.jobs.length > 0 ? (
          <article className="digest-card">
            <header className="digest-header">
              <h2>Top 10 Jobs For You — 9AM Digest</h2>
              <p>{new Date(digest.date).toLocaleDateString()}</p>
            </header>

            <section className="digest-list" aria-label="Daily digest jobs">
              {digest.jobs.map((job) => (
                <article key={job.id} className="digest-item">
                  <div className="digest-item__meta">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                    <p>
                      {job.location} · {job.experience}
                    </p>
                  </div>
                  <div className="digest-item__actions">
                    <span className={getMatchBadgeClass(job.matchScore)}>Match {job.matchScore}</span>
                    <a className="btn-primary" href={job.applyUrl} target="_blank" rel="noreferrer">
                      Apply
                    </a>
                  </div>
                </article>
              ))}
            </section>

            <footer className="digest-footer">
              This digest was generated based on your preferences.
            </footer>
          </article>
        ) : null}

        <section className="status-updates-panel" aria-label="Recent status updates">
          <h2>Recent Status Updates</h2>

          {recentStatusUpdates.length === 0 ? (
            <p>No status updates yet.</p>
          ) : (
            <ul className="status-updates-list">
              {recentStatusUpdates.map((update) => (
                <li key={`${update.jobId}-${update.changedAt}`} className="status-updates-item">
                  <div>
                    <strong>{update.title}</strong>
                    <p>{update.company}</p>
                  </div>
                  <div className="status-updates-meta">
                    <span className={getStatusBadgeClass(update.status)}>{update.status}</span>
                    <small>{new Date(update.changedAt).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
