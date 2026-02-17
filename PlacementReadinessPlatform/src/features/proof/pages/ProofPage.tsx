import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import {
  areProofLinksValid,
  buildFinalSubmissionText,
  isProjectShipped,
  isValidHttpUrl,
  patchFinalSubmissionState,
  readFinalSubmissionState,
  toggleProofStep,
} from '../../../services/finalSubmissionStorage';

export function ProofPage() {
  const [state, setState] = useState(() => readFinalSubmissionState());
  const [copyMessage, setCopyMessage] = useState('');

  const passedCount = state.steps.filter((step) => step.completed).length;
  const linksValid = areProofLinksValid(state);
  const shipped = isProjectShipped(state);

  const updateLink = (key: 'lovableProjectLink' | 'githubRepositoryLink' | 'deployedUrl', value: string) => {
    setState(patchFinalSubmissionState({ [key]: value }));
  };

  const copyFinalSubmission = async () => {
    try {
      await navigator.clipboard.writeText(buildFinalSubmissionText(state));
      setCopyMessage('Final submission copied.');
    } catch {
      setCopyMessage('Unable to copy final submission on this browser.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proof + Submission</CardTitle>
          <CardDescription>
            Project Status:{' '}
            <span className={shipped ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
              {shipped ? 'Shipped' : 'In Progress'}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Completion Overview</CardTitle>
          <CardDescription>Mark all 8 steps as completed to satisfy ship requirements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.steps.map((step) => (
            <label key={step.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={step.completed}
                onChange={(event) => setState(toggleProofStep(step.id, event.target.checked))}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">{step.label}</p>
                <p className="text-xs text-slate-500">Status: {step.completed ? 'Completed' : 'Pending'}</p>
              </div>
            </label>
          ))}
          <p className="text-xs text-slate-500">Completed {passedCount} / {state.steps.length} steps.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artifact Inputs</CardTitle>
          <CardDescription>All 3 links are required and must be valid URLs for ship status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-1 text-sm text-slate-700">
            Lovable Project Link
            <input
              value={state.lovableProjectLink}
              onChange={(event) => updateLink('lovableProjectLink', event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              placeholder="https://..."
            />
            {state.lovableProjectLink && !isValidHttpUrl(state.lovableProjectLink) ? (
              <span className="text-xs text-amber-700">Enter a valid URL (http/https).</span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            GitHub Repository Link
            <input
              value={state.githubRepositoryLink}
              onChange={(event) => updateLink('githubRepositoryLink', event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              placeholder="https://github.com/..."
            />
            {state.githubRepositoryLink && !isValidHttpUrl(state.githubRepositoryLink) ? (
              <span className="text-xs text-amber-700">Enter a valid URL (http/https).</span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Deployed URL
            <input
              value={state.deployedUrl}
              onChange={(event) => updateLink('deployedUrl', event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              placeholder="https://..."
            />
            {state.deployedUrl && !isValidHttpUrl(state.deployedUrl) ? (
              <span className="text-xs text-amber-700">Enter a valid URL (http/https).</span>
            ) : null}
          </label>

          <button
            type="button"
            onClick={copyFinalSubmission}
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Copy Final Submission
          </button>
          {copyMessage ? <p className="text-xs text-slate-500">{copyMessage}</p> : null}
          {!linksValid ? <p className="text-xs text-amber-700">Provide all 3 valid links to qualify for shipped status.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
