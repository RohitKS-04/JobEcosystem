import { useEffect, useState } from 'react';
import type { JobApplicationStatus } from '../types';
import { appendStatusHistory, readJobStatusMap, writeJobStatus } from '../utils';

const toastEligibleStatuses: JobApplicationStatus[] = ['Applied', 'Rejected', 'Selected'];

export function useJobStatuses() {
  const [statusMap, setStatusMap] = useState<Record<string, JobApplicationStatus>>(() => readJobStatusMap());
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const getStatus = (jobId: string): JobApplicationStatus => statusMap[jobId] ?? 'Not Applied';

  const updateStatus = (jobId: string, status: JobApplicationStatus) => {
    const previous = statusMap[jobId] ?? 'Not Applied';
    if (previous === status) {
      return;
    }

    writeJobStatus(jobId, status);
    setStatusMap((current) => ({ ...current, [jobId]: status }));

    appendStatusHistory({
      jobId,
      status,
      changedAt: new Date().toISOString(),
    });

    if (toastEligibleStatuses.includes(status)) {
      setToastMessage(`Status updated: ${status}`);
    }
  };

  return {
    getStatus,
    updateStatus,
    toastMessage,
  };
}
