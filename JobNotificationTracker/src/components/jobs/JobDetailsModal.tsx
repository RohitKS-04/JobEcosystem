import type { Job } from '../../types';

type JobDetailsModalProps = {
  job: Job | null;
  onClose: () => void;
};

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  if (!job) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="job-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Job details"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="job-modal__header">
          <div>
            <h2>{job.title}</h2>
            <p>{job.company}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="job-modal__description">{job.description}</p>

        <ul className="skill-list">
          {job.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
