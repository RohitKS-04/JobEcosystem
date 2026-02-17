import { Link } from 'react-router-dom';
import { areAllTestsPassed, getPassedTestsCount, readTestChecklistState, testChecklistItems } from '../../../utils';

export function ShipPage() {
  const checklistState = readTestChecklistState();
  const passedCount = getPassedTestsCount(checklistState);
  const allPassed = areAllTestsPassed(checklistState);

  if (!allPassed) {
    return (
      <main className="page-shell">
        <section className="page-content dashboard-content ship-lock-card" aria-live="polite">
          <h1>Ship Locked</h1>
          <p>
            /jt/08-ship is locked until all test checklist items are complete.
          </p>
          <p>
            Tests Passed: <strong>{passedCount}</strong> / {testChecklistItems.length}
          </p>
          <Link className="btn-primary" to="/jt/07-test">
            Go to Test Checklist
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-content dashboard-content ship-ready-card">
        <h1>Ship Unlocked</h1>
        <p>All 10 checklist items are complete. You can proceed with release confidence.</p>
      </section>
    </main>
  );
}
