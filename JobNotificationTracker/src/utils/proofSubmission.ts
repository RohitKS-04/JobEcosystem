export type ProofArtifacts = {
  lovableProjectUrl: string;
  githubRepositoryUrl: string;
  deployedUrl: string;
};

const PROOF_ARTIFACTS_KEY = 'jobTrackerProofArtifacts';

export const defaultProofArtifacts: ProofArtifacts = {
  lovableProjectUrl: '',
  githubRepositoryUrl: '',
  deployedUrl: '',
};

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

export function readProofArtifacts(): ProofArtifacts {
  try {
    const raw = localStorage.getItem(PROOF_ARTIFACTS_KEY);
    if (!raw) {
      return defaultProofArtifacts;
    }

    const parsed = JSON.parse(raw) as Partial<ProofArtifacts>;
    return {
      lovableProjectUrl: typeof parsed.lovableProjectUrl === 'string' ? parsed.lovableProjectUrl : '',
      githubRepositoryUrl: typeof parsed.githubRepositoryUrl === 'string' ? parsed.githubRepositoryUrl : '',
      deployedUrl: typeof parsed.deployedUrl === 'string' ? parsed.deployedUrl : '',
    };
  } catch {
    return defaultProofArtifacts;
  }
}

export function writeProofArtifacts(artifacts: ProofArtifacts) {
  localStorage.setItem(PROOF_ARTIFACTS_KEY, JSON.stringify(artifacts));
}

export function areAllProofLinksValid(artifacts: ProofArtifacts): boolean {
  return (
    isValidHttpUrl(artifacts.lovableProjectUrl) &&
    isValidHttpUrl(artifacts.githubRepositoryUrl) &&
    isValidHttpUrl(artifacts.deployedUrl)
  );
}
