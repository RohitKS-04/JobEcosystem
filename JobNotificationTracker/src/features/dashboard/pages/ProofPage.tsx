import { useEffect, useMemo, useState } from 'react';
import {
  TEST_CHECKLIST_UPDATED_EVENT,
  areAllProofLinksValid,
  areAllTestsPassed,
  getPassedTestsCount,
  isValidHttpUrl,
  readProofArtifacts,
  readTestChecklistState,
  testChecklistItems,
  writeProofArtifacts,
} from '../../../utils';

type ProofArtifacts = {
  lovableProjectUrl: string;
  githubRepositoryUrl: string;
  deployedUrl: string;
};

type ProjectStatus = 'Not Started' | 'In Progress' | 'Shipped';

function getProjectStatus(linksValid: boolean, allTestsPassed: boolean, hasAnyLink: boolean): ProjectStatus {
  if (linksValid && allTestsPassed) {
    return 'Shipped';
  }

  if (hasAnyLink || allTestsPassed) {
    return 'In Progress';
  }

  return 'Not Started';
}

function getProjectStatusClass(status: ProjectStatus): string {
  if (status === 'Shipped') {
    return 'proof-status-badge proof-status-badge--shipped';
  }

  if (status === 'In Progress') {
    return 'proof-status-badge proof-status-badge--progress';
  }

  return 'proof-status-badge proof-status-badge--not-started';
}

function formatSubmissionText(artifacts: ProofArtifacts): string {
  return [
    '------------------------------------------',
    'Job Notification Tracker - Final Submission',
    '',
    'Lovable Project:',
    artifacts.lovableProjectUrl || '-',
    '',
    'GitHub Repository:',
    artifacts.githubRepositoryUrl || '-',
    '',
    'Live Deployment:',
    artifacts.deployedUrl || '-',
    '',
    'Core Features:',
    '- Intelligent match scoring',
    '- Daily digest simulation',
    '- Status tracking',
    '- Test checklist enforced',
    '------------------------------------------',
  ].join('\n');
}

export function ProofPage() {
  const [artifacts, setArtifacts] = useState(() => readProofArtifacts());
  const [copyMessage, setCopyMessage] = useState('');
  const [checklistState, setChecklistState] = useState(() => readTestChecklistState());

  const passedTests = useMemo(() => getPassedTestsCount(checklistState), [checklistState]);
  const allTestsPassed = useMemo(() => areAllTestsPassed(checklistState), [checklistState]);
  const totalTests = testChecklistItems.length;

  useEffect(() => {
    const syncChecklistState = () => {
      setChecklistState(readTestChecklistState());
    };

    window.addEventListener('storage', syncChecklistState);
    window.addEventListener(TEST_CHECKLIST_UPDATED_EVENT, syncChecklistState as EventListener);

    return () => {
      window.removeEventListener('storage', syncChecklistState);
      window.removeEventListener(TEST_CHECKLIST_UPDATED_EVENT, syncChecklistState as EventListener);
    };
  }, []);

  const validations = useMemo(
    () => ({
      lovableProjectUrl: artifacts.lovableProjectUrl.length === 0 || isValidHttpUrl(artifacts.lovableProjectUrl),
      githubRepositoryUrl:
        artifacts.githubRepositoryUrl.length === 0 || isValidHttpUrl(artifacts.githubRepositoryUrl),
      deployedUrl: artifacts.deployedUrl.length === 0 || isValidHttpUrl(artifacts.deployedUrl),
    }),
    [artifacts],
  );

  const linksValid = useMemo(() => areAllProofLinksValid(artifacts), [artifacts]);
  const hasAnyLink = useMemo(
    () =>
      Boolean(
        artifacts.lovableProjectUrl.trim() || artifacts.githubRepositoryUrl.trim() || artifacts.deployedUrl.trim(),
      ),
    [artifacts],
  );

  const status = useMemo(() => getProjectStatus(linksValid, allTestsPassed, hasAnyLink), [linksValid, allTestsPassed, hasAnyLink]);

  const stepCompletion = useMemo(
    () => [
      { label: 'Step 1 - Preferences Engine', completed: true },
      { label: 'Step 2 - Deterministic Match Scoring', completed: true },
      { label: 'Step 3 - Dashboard Filters and Threshold', completed: true },
      { label: 'Step 4 - Saved Jobs Persistence', completed: true },
      { label: 'Step 5 - Status Tracking and Notifications', completed: true },
      { label: 'Step 6 - Daily Digest Simulation', completed: true },
      { label: 'Step 7 - Test Checklist Completion', completed: allTestsPassed },
      { label: 'Step 8 - Final Artifact Submission', completed: linksValid },
    ],
    [allTestsPassed, linksValid],
  );

  const updateArtifact = (key: keyof ProofArtifacts, value: string) => {
    const next = { ...artifacts, [key]: value };
    setArtifacts(next);
    writeProofArtifacts(next);
  };

  const onCopySubmission = async () => {
    const payload = formatSubmissionText(artifacts);

    try {
      await navigator.clipboard.writeText(payload);
      setCopyMessage('Final submission copied.');
    } catch {
      setCopyMessage('Copy failed. Please copy manually from the form values.');
    }
  };

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content proof-content">
        <header className="proof-header-card">
          <h1>Project 1 - Job Notification Tracker</h1>
          <p>
            Status: <span className={getProjectStatusClass(status)}>{status}</span>
          </p>
          {status === 'Shipped' ? <p className="proof-shipped-message">Project 1 Shipped Successfully.</p> : null}
        </header>

        <section className="proof-section-card" aria-label="Step completion summary">
          <h2>Step Completion Summary</h2>
          <ul className="proof-step-list">
            {stepCompletion.map((step) => (
              <li key={step.label} className="proof-step-item">
                <span>{step.label}</span>
                <span className={step.completed ? 'proof-step-status proof-step-status--done' : 'proof-step-status'}>
                  {step.completed ? 'Completed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
          <p className="proof-helper-text">
            Test checklist completion: {passedTests} / {totalTests}
          </p>
        </section>

        <section className="proof-section-card" aria-label="Artifact collection inputs">
          <h2>Artifact Collection Inputs</h2>

          <div className="field-group">
            <label htmlFor="lovable-project-link">Lovable Project Link</label>
            <input
              id="lovable-project-link"
              type="url"
              placeholder="https://..."
              value={artifacts.lovableProjectUrl}
              onChange={(event) => updateArtifact('lovableProjectUrl', event.target.value)}
            />
            {!validations.lovableProjectUrl ? <small className="proof-input-error">Enter a valid URL.</small> : null}
          </div>

          <div className="field-group">
            <label htmlFor="github-repository-link">GitHub Repository Link</label>
            <input
              id="github-repository-link"
              type="url"
              placeholder="https://github.com/..."
              value={artifacts.githubRepositoryUrl}
              onChange={(event) => updateArtifact('githubRepositoryUrl', event.target.value)}
            />
            {!validations.githubRepositoryUrl ? <small className="proof-input-error">Enter a valid URL.</small> : null}
          </div>

          <div className="field-group">
            <label htmlFor="deployed-url">Deployed URL (Vercel or equivalent)</label>
            <input
              id="deployed-url"
              type="url"
              placeholder="https://your-app.vercel.app"
              value={artifacts.deployedUrl}
              onChange={(event) => updateArtifact('deployedUrl', event.target.value)}
            />
            {!validations.deployedUrl ? <small className="proof-input-error">Enter a valid URL.</small> : null}
          </div>

          <div className="proof-actions">
            <button type="button" className="btn-primary" onClick={onCopySubmission}>
              Copy Final Submission
            </button>
            {copyMessage ? <p className="proof-helper-text">{copyMessage}</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
