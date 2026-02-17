import { useMemo, useState } from 'react';
import {
  getPassedTestsCount,
  readTestChecklistState,
  resetTestChecklistState,
  testChecklistItems,
  writeTestChecklistState,
} from '../../../utils';

export function TestChecklistPage() {
  const [checklistState, setChecklistState] = useState(() => readTestChecklistState());

  const passedCount = useMemo(() => getPassedTestsCount(checklistState), [checklistState]);
  const totalCount = testChecklistItems.length;

  const toggleItem = (itemId: string, checked: boolean) => {
    const nextState = { ...checklistState, [itemId]: checked };
    setChecklistState(nextState);
    writeTestChecklistState(nextState);
  };

  const handleReset = () => {
    resetTestChecklistState();
    setChecklistState(readTestChecklistState());
  };

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content test-checklist-content">
        <div className="test-summary-card">
          <h1>Built-In Test Checklist</h1>
          <p className="test-summary-count">
            Tests Passed: <strong>{passedCount}</strong> / {totalCount}
          </p>

          {passedCount < totalCount ? (
            <p className="test-warning" role="status">
              Resolve all issues before shipping.
            </p>
          ) : null}

          <button type="button" className="btn-secondary test-reset-button" onClick={handleReset}>
            Reset Test Status
          </button>
        </div>

        <ul className="test-checklist" aria-label="Test checklist items">
          {testChecklistItems.map((item) => (
            <li key={item.id} className="test-checklist-item">
              <label className="test-checklist-label">
                <input
                  type="checkbox"
                  checked={Boolean(checklistState[item.id])}
                  onChange={(event) => toggleItem(item.id, event.target.checked)}
                />
                <span>{item.label}</span>
              </label>

              {item.howToTest ? (
                <span className="test-tooltip" title={item.howToTest} aria-label={`How to test: ${item.label}`}>
                  How to test
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
