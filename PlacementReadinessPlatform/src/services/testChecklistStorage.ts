import type { TestChecklistItem, TestChecklistState } from '../types/testChecklist';

const CHECKLIST_KEY = 'prp.test.checklist.v1';

const DEFAULT_ITEMS: Array<Omit<TestChecklistItem, 'checked'>> = [
  {
    id: 'jd-required',
    label: 'JD required validation works',
    hint: 'Try submitting analyzer form with empty JD field.',
  },
  {
    id: 'jd-short-warning',
    label: 'Short JD warning shows for <200 chars',
    hint: 'Paste short text and verify calm warning appears.',
  },
  {
    id: 'skill-groups',
    label: 'Skills extraction groups correctly',
    hint: 'Use JD with React, SQL, AWS and verify category grouping.',
  },
  {
    id: 'round-mapping',
    label: 'Round mapping changes based on company + skills',
    hint: 'Compare Infosys + DSA vs unknown startup + React/Node.',
  },
  {
    id: 'score-deterministic',
    label: 'Score calculation is deterministic',
    hint: 'Run same JD twice and compare base/final score behavior.',
  },
  {
    id: 'toggle-live-score',
    label: 'Skill toggles update score live',
    hint: 'Toggle know/practice and confirm instant score update.',
  },
  {
    id: 'persist-refresh',
    label: 'Changes persist after refresh',
    hint: 'Refresh /results and verify toggles + scores remain.',
  },
  {
    id: 'history-load-save',
    label: 'History saves and loads correctly',
    hint: 'Create analyses and reopen entries from history.',
  },
  {
    id: 'export-correct',
    label: 'Export buttons copy the correct content',
    hint: 'Use copy + TXT export and validate sections are complete.',
  },
  {
    id: 'console-clean',
    label: 'No console errors on core pages',
    hint: 'Check /, /app/practice, /results, /history in browser console.',
  },
];

export function createDefaultChecklistState(): TestChecklistState {
  return {
    items: DEFAULT_ITEMS.map((item) => ({ ...item, checked: false })),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeState(raw: unknown): TestChecklistState {
  const fallback = createDefaultChecklistState();

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const source = raw as Record<string, unknown>;
  const incoming = Array.isArray(source.items) ? source.items : [];
  const incomingById = new Map<string, boolean>();

  incoming.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const entry = item as Record<string, unknown>;
    const id = typeof entry.id === 'string' ? entry.id : '';
    const checked = entry.checked === true;

    if (id) {
      incomingById.set(id, checked);
    }
  });

  return {
    items: DEFAULT_ITEMS.map((item) => ({
      ...item,
      checked: incomingById.get(item.id) ?? false,
    })),
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : fallback.updatedAt,
  };
}

export function readTestChecklistState(): TestChecklistState {
  const raw = window.localStorage.getItem(CHECKLIST_KEY);
  if (!raw) {
    return createDefaultChecklistState();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeState(parsed);
  } catch {
    return createDefaultChecklistState();
  }
}

export function writeTestChecklistState(state: TestChecklistState) {
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

export function toggleChecklistItem(id: string, checked: boolean): TestChecklistState {
  const current = readTestChecklistState();
  const next: TestChecklistState = {
    items: current.items.map((item) => (item.id === id ? { ...item, checked } : item)),
    updatedAt: new Date().toISOString(),
  };

  writeTestChecklistState(next);
  return next;
}

export function resetChecklistState(): TestChecklistState {
  const next = createDefaultChecklistState();
  writeTestChecklistState(next);
  return next;
}

export function countPassed(state: TestChecklistState): number {
  return state.items.filter((item) => item.checked).length;
}

export function isShipUnlocked(state: TestChecklistState): boolean {
  return countPassed(state) === state.items.length;
}
