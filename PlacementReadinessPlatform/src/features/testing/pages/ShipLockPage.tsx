import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { countPassed, isShipUnlocked, readTestChecklistState } from '../../../services/testChecklistStorage';
import {
  areAllProofStepsCompleted,
  areProofLinksValid,
  isProjectShipped,
  readFinalSubmissionState,
} from '../../../services/finalSubmissionStorage';

export function ShipLockPage() {
  const checklist = readTestChecklistState();
  const proof = readFinalSubmissionState();
  const passed = countPassed(checklist);
  const total = checklist.items.length;
  const checklistUnlocked = isShipUnlocked(checklist);
  const proofStepsReady = areAllProofStepsCompleted(proof);
  const proofLinksReady = areProofLinksValid(proof);
  const shipped = isProjectShipped(proof);

  if (!checklistUnlocked) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Locked</CardTitle>
            <CardDescription>
              Tests Passed: {passed} / {total}. Complete all checklist items before shipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">Fix issues before shipping.</p>
            <Link
              to="/prp/07-test"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go to Test Checklist
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ship Gate</CardTitle>
          <CardDescription>
            Project Status:{' '}
            <span className={shipped ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
              {shipped ? 'Shipped' : 'In Progress'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shipped ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              You built a real product.
              <br />
              Not a tutorial. Not a clone.
              <br />
              A structured tool that solves a real problem.
              <br />
              <br />
              This is your proof of work.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                All checklist items are complete, but shipping is still blocked until proof requirements are met.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-700">
                <li>8/8 proof steps completed: {proofStepsReady ? 'Yes' : 'No'}</li>
                <li>All 3 proof links valid: {proofLinksReady ? 'Yes' : 'No'}</li>
                <li>Checklist passed: Yes ({passed}/{total})</li>
              </ul>
              <Link
                to="/prp/proof"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open Proof Page
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
