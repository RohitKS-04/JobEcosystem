import { memo } from 'react';
import type { Job, JobApplicationStatus } from '../../types';
import { formatPostedLabel } from '../../utils';

type JobCardProps = {
  job: Job;
  matchScore?: number;
  status: JobApplicationStatus;
  isSaved: boolean;
  onView: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobApplicationStatus) => void;
};

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

function getStatusBadgeClass(status: JobApplicationStatus): string {
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

export const JobCard = memo(function JobCard({
  job,
  matchScore,
  status,
  isSaved,
  onView,
  onToggleSave,
  onStatusChange,
}: JobCardProps) {
  return (
    <article className="job-card">
      <div className="job-card__header">
        <div>
          <h3>{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
        </div>

        <div className="job-card__badge-stack">
          {typeof matchScore === 'number' ? (
            <span className={getMatchBadgeClass(matchScore)} aria-label={`Match score ${matchScore}`}>
              Match {matchScore}
            </span>
          ) : null}
          <span className="source-badge">{job.source}</span>
        </div>
      </div>

      <div className="job-card__meta">
        <span>{job.location}</span>
        <span>{job.mode}</span>
        <span>{job.experience}</span>
        <span>{job.salaryRange}</span>
      </div>

      <p className="job-card__posted">{formatPostedLabel(job.postedDaysAgo)}</p>

      <div className="job-card__status-row">
        <span className={getStatusBadgeClass(status)}>{status}</span>
        <div className="status-button-group" role="group" aria-label={`Application status for ${job.title}`}>
          {(['Not Applied', 'Applied', 'Rejected', 'Selected'] as JobApplicationStatus[]).map((option) => (
            <button
              key={option}
              type="button"
              className={option === status ? 'status-btn status-btn--active' : 'status-btn'}
              onClick={() => onStatusChange(job.id, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="job-card__actions">
        <button type="button" className="btn-secondary" onClick={() => onView(job)}>
          View
        </button>
        <button type="button" className="btn-secondary" onClick={() => onToggleSave(job.id)}>
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <a className="btn-primary" href={job.applyUrl} target="_blank" rel="noreferrer">
          Apply
        </a>
      </div>
    </article>
  );
});
