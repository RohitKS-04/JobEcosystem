import type { FinalSubmissionState, ProofStep } from '../types/finalSubmission';
import { isShipUnlocked, readTestChecklistState } from './testChecklistStorage';

const STORAGE_KEY = 'prp_final_submission';

const DEFAULT_STEPS: Array<Omit<ProofStep, 'completed'>> = [
  { id: 'step-1', label: 'Input validation implemented' },
  { id: 'step-2', label: 'Skill extraction deterministic and grouped' },
  { id: 'step-3', label: 'Round mapping engine active' },
  { id: 'step-4', label: '7-day prep planner generated' },
  { id: 'step-5', label: 'Interactive readiness scoring working' },
  { id: 'step-6', label: 'History persistence verified' },
  { id: 'step-7', label: 'Checklist flow completed' },
  { id: 'step-8', label: 'Proof artifacts prepared' },
];

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function createDefaultFinalSubmissionState(): FinalSubmissionState {
  return {
    lovableProjectLink: '',
    githubRepositoryLink: '',
    deployedUrl: '',
    steps: DEFAULT_STEPS.map((step) => ({ ...step, completed: false })),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeState(raw: unknown): FinalSubmissionState {
  const fallback = createDefaultFinalSubmissionState();

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const source = raw as Record<string, unknown>;
  const incomingSteps = Array.isArray(source.steps) ? source.steps : [];
  const completedById = new Map<string, boolean>();

  incomingSteps.forEach((step) => {
    if (!step || typeof step !== 'object') {
      return;
    }

    const entry = step as Record<string, unknown>;
    if (typeof entry.id === 'string') {
      completedById.set(entry.id, entry.completed === true);
    }
  });

  return {
    lovableProjectLink: typeof source.lovableProjectLink === 'string' ? source.lovableProjectLink : '',
    githubRepositoryLink: typeof source.githubRepositoryLink === 'string' ? source.githubRepositoryLink : '',
    deployedUrl: typeof source.deployedUrl === 'string' ? source.deployedUrl : '',
    steps: DEFAULT_STEPS.map((step) => ({
      ...step,
      completed: completedById.get(step.id) ?? false,
    })),
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : fallback.updatedAt,
  };
}

export function readFinalSubmissionState(): FinalSubmissionState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultFinalSubmissionState();
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultFinalSubmissionState();
  }
}

export function writeFinalSubmissionState(state: FinalSubmissionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function patchFinalSubmissionState(patch: Partial<FinalSubmissionState>): FinalSubmissionState {
  const current = readFinalSubmissionState();
  const next: FinalSubmissionState = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeFinalSubmissionState(next);
  return next;
}

export function toggleProofStep(stepId: string, completed: boolean): FinalSubmissionState {
  const current = readFinalSubmissionState();
  return patchFinalSubmissionState({
    steps: current.steps.map((step) => (step.id === stepId ? { ...step, completed } : step)),
  });
}

export function areProofLinksValid(state: FinalSubmissionState): boolean {
  return (
    isValidHttpUrl(state.lovableProjectLink) &&
    isValidHttpUrl(state.githubRepositoryLink) &&
    isValidHttpUrl(state.deployedUrl)
  );
}

export function areAllProofStepsCompleted(state: FinalSubmissionState): boolean {
  return state.steps.every((step) => step.completed);
}

export function isProjectShipped(state: FinalSubmissionState): boolean {
  return areAllProofStepsCompleted(state) && areProofLinksValid(state) && isShipUnlocked(readTestChecklistState());
}

export function buildFinalSubmissionText(state: FinalSubmissionState): string {
  return [
    '------------------------------------------',
    'Placement Readiness Platform — Final Submission',
    '',
    `Lovable Project: ${state.lovableProjectLink}`,
    `GitHub Repository: ${state.githubRepositoryLink}`,
    `Live Deployment: ${state.deployedUrl}`,
    '',
    'Core Capabilities:',
    '- JD skill extraction (deterministic)',
    '- Round mapping engine',
    '- 7-day prep plan',
    '- Interactive readiness scoring',
    '- History persistence',
    '------------------------------------------',
  ].join('\n');
}
