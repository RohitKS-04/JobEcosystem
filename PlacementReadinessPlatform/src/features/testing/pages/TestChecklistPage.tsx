import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import {
  countPassed,
  isShipUnlocked,
  readTestChecklistState,
  resetChecklistState,
  toggleChecklistItem,
} from '../../../services/testChecklistStorage';

export function TestChecklistPage() {
  const [state, setState] = useState(() => readTestChecklistState());

  const passed = countPassed(state);
  const total = state.items.length;
  const unlocked = isShipUnlocked(state);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placement QA Checklist</CardTitle>
          <CardDescription>Tests Passed: {passed} / {total}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passed < total ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">Fix issues before shipping.</p>
          ) : (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">All checks passed. Ready for ship gate.</p>
          )}

          <div className="space-y-3">
            {state.items.map((item) => (
              <label key={item.id} className="block rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) => setState(toggleChecklistItem(item.id, event.target.checked))}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">How to test: {item.hint}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setState(resetChecklistState())}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Reset checklist
            </button>
            <Link
              to="/prp/08-ship"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open Ship Gate
            </Link>
          </div>

          <p className="text-xs text-slate-500">Checklist is stored in localStorage and persists across refreshes.</p>
        </CardContent>
      </Card>

      {!unlocked ? (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Status</CardTitle>
            <CardDescription>Ship route remains locked until all 10 checks are complete.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
