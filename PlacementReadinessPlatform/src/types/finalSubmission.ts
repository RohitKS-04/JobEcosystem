export type ProofStep = {
  id: string;
  label: string;
  completed: boolean;
};

export type FinalSubmissionState = {
  lovableProjectLink: string;
  githubRepositoryLink: string;
  deployedUrl: string;
  steps: ProofStep[];
  updatedAt: string;
};
