export type TestChecklistItem = {
  id: string;
  label: string;
  howToTest?: string;
};

export const testChecklistItems: TestChecklistItem[] = [
  {
    id: 'preferences-persist',
    label: 'Preferences persist after refresh',
    howToTest: 'Save preferences in Settings, refresh page, verify values are still populated.',
  },
  {
    id: 'match-score-correct',
    label: 'Match score calculates correctly',
    howToTest: 'Compare score with your saved preferences and job attributes to confirm deterministic output.',
  },
  {
    id: 'matches-toggle-works',
    label: '"Show only matches" toggle works',
    howToTest: 'Enable threshold-only toggle and confirm lower-score jobs disappear.',
  },
  {
    id: 'save-job-persists',
    label: 'Save job persists after refresh',
    howToTest: 'Save a job, refresh, and verify it remains in Saved.',
  },
  {
    id: 'apply-opens-new-tab',
    label: 'Apply opens in new tab',
    howToTest: 'Click Apply on any card and confirm a new browser tab opens.',
  },
  {
    id: 'status-persists',
    label: 'Status update persists after refresh',
    howToTest: 'Set status on a job, refresh, and confirm status badge and control remain updated.',
  },
  {
    id: 'status-filter-works',
    label: 'Status filter works correctly',
    howToTest: 'Filter by Applied/Rejected/Selected and verify only matching cards are shown.',
  },
  {
    id: 'digest-top-ten',
    label: 'Digest generates top 10 by score',
    howToTest: 'Generate digest and verify exactly up to 10 highest-score jobs are included.',
  },
  {
    id: 'digest-persists-day',
    label: 'Digest persists for the day',
    howToTest: 'Generate digest, reload Digest page, and confirm same digest is loaded for today.',
  },
  {
    id: 'no-console-errors',
    label: 'No console errors on main pages',
    howToTest: 'Open Dashboard, Saved, Settings, Digest, Test, and Ship pages while monitoring browser console.',
  },
];

const TEST_CHECKLIST_KEY = 'jobTrackerTestChecklist';
export const TEST_CHECKLIST_UPDATED_EVENT = 'job-tracker:test-checklist-updated';

export type TestChecklistState = Record<string, boolean>;

function getDefaultTestChecklistState(): TestChecklistState {
  return Object.fromEntries(testChecklistItems.map((item) => [item.id, false]));
}

export function readTestChecklistState(): TestChecklistState {
  const defaults = getDefaultTestChecklistState();

  try {
    const raw = localStorage.getItem(TEST_CHECKLIST_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      testChecklistItems.map((item) => [item.id, Boolean(parsed[item.id])]),
    );
  } catch {
    return defaults;
  }
}

export function writeTestChecklistState(state: TestChecklistState) {
  localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(state));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TEST_CHECKLIST_UPDATED_EVENT));
  }
}

export function resetTestChecklistState() {
  writeTestChecklistState(getDefaultTestChecklistState());
}

export function getPassedTestsCount(state: TestChecklistState): number {
  return testChecklistItems.reduce((total, item) => total + (state[item.id] ? 1 : 0), 0);
}

export function areAllTestsPassed(state: TestChecklistState): boolean {
  return getPassedTestsCount(state) === testChecklistItems.length;
}
