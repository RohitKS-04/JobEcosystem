import { useMemo, useState } from 'react';
import { jobs } from '../../jobs/data/jobs';
import { JobCard, JobDetailsModal, FilterBar } from '../../../components/jobs';
import { EmptyState } from '../../../components/ui';
import { useJobStatuses, useSavedJobs } from '../../../hooks';
import type { DashboardFilters, Job, JobWithMatchScore } from '../../../types';
import {
  calculateJobMatchScore,
  hasSavedJobTrackerPreferences,
  readJobTrackerPreferences,
  sortBySalaryDescending,
} from '../../../utils';

const initialFilters: DashboardFilters = {
  keyword: '',
  location: 'All',
  mode: 'All',
  experience: 'All',
  source: 'All',
  status: 'All',
  sort: 'Latest',
};

export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showOnlyAboveThreshold, setShowOnlyAboveThreshold] = useState(false);
  const { savedIds, toggleSaved } = useSavedJobs();
  const { getStatus, updateStatus, toastMessage } = useJobStatuses();
  const preferences = useMemo(() => readJobTrackerPreferences(), []);
  const hasPreferences = useMemo(() => hasSavedJobTrackerPreferences(), []);

  const uniqueLocations = useMemo(() => Array.from(new Set(jobs.map((job) => job.location))).sort(), []);

  const scoredJobs = useMemo<JobWithMatchScore[]>(
    () => jobs.map((job) => ({ ...job, matchScore: calculateJobMatchScore(job, preferences) })),
    [preferences],
  );

  const filteredJobs = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    const filtered = scoredJobs.filter((job) => {
      if (keyword) {
        const haystack = `${job.title} ${job.company}`.toLowerCase();
        if (!haystack.includes(keyword)) {
          return false;
        }
      }

      if (filters.location !== 'All' && job.location !== filters.location) {
        return false;
      }

      if (filters.mode !== 'All' && job.mode !== filters.mode) {
        return false;
      }

      if (filters.experience !== 'All' && job.experience !== filters.experience) {
        return false;
      }

      if (filters.source !== 'All' && job.source !== filters.source) {
        return false;
      }

      if (filters.status !== 'All' && getStatus(job.id) !== filters.status) {
        return false;
      }

      if (showOnlyAboveThreshold && job.matchScore < preferences.minMatchScore) {
        return false;
      }

      return true;
    });

    if (filters.sort === 'Latest') {
      return [...filtered].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    }

    if (filters.sort === 'Match Score') {
      return [...filtered].sort((a, b) => b.matchScore - a.matchScore);
    }

    return [...filtered].sort(sortBySalaryDescending);
  }, [filters, getStatus, preferences.minMatchScore, scoredJobs, showOnlyAboveThreshold]);

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content">
        <h1>Dashboard</h1>
        <p>Track realistic opportunities and shortlist only what fits your goals.</p>

        {!hasPreferences ? (
          <section className="preference-banner" role="status">
            Set your preferences to activate intelligent matching.
          </section>
        ) : null}

        {toastMessage ? <section className="status-toast">{toastMessage}</section> : null}

        <FilterBar filters={filters} locations={uniqueLocations} onChange={setFilters} />

        <label className="threshold-toggle">
          <input
            type="checkbox"
            checked={showOnlyAboveThreshold}
            onChange={(event) => setShowOnlyAboveThreshold(event.target.checked)}
          />
          <span>Show only jobs above my threshold</span>
        </label>

        {filteredJobs.length === 0 ? (
          <EmptyState title="No roles match your criteria. Adjust filters or lower threshold." />
        ) : (
          <section className="job-grid" aria-label="Job results">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                matchScore={job.matchScore}
                status={getStatus(job.id)}
                isSaved={savedIds.includes(job.id)}
                onView={setSelectedJob}
                onToggleSave={toggleSaved}
                onStatusChange={updateStatus}
              />
            ))}
          </section>
        )}

        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      </section>
    </main>
  );
}
