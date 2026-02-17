import { useEffect, useState } from 'react';
import { readSavedJobIds, writeSavedJobIds } from '../utils/storage';

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>(readSavedJobIds);

  useEffect(() => {
    writeSavedJobIds(savedIds);
  }, [savedIds]);

  const toggleSaved = (jobId: string) => {
    setSavedIds((current) => {
      if (current.includes(jobId)) {
        return current.filter((id) => id !== jobId);
      }

      return [jobId, ...current];
    });
  };

  return { savedIds, toggleSaved };
}
