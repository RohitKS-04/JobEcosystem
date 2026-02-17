import { useMemo, useState } from 'react';
import { jobs } from '../../jobs/data/jobs';
import { JobCard, JobDetailsModal } from '../../../components/jobs';
import { EmptyState } from '../../../components/ui';
import { useJobStatuses, useSavedJobs } from '../../../hooks';
import type { Job } from '../../../types';

export function SavedPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { savedIds, toggleSaved } = useSavedJobs();
  const { getStatus, updateStatus, toastMessage } = useJobStatuses();

  const savedJobs = useMemo(() => {
    const ids = new Set(savedIds);
    return jobs.filter((job) => ids.has(job.id));
  }, [savedIds]);

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content">
        <h1>Saved</h1>
        <p>Your shortlist appears here for quick follow-up and review.</p>

        {toastMessage ? <section className="status-toast">{toastMessage}</section> : null}

        {savedJobs.length === 0 ? (
          <EmptyState title="No saved jobs yet.">
            <p>Save opportunities from the dashboard to build your shortlist.</p>
          </EmptyState>
        ) : (
          <section className="job-grid" aria-label="Saved jobs">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                status={getStatus(job.id)}
                isSaved
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
