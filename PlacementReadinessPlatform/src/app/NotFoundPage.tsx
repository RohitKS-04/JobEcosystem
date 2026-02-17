import { Link, useLocation } from 'react-router-dom';
import { HistoryPage } from '../features/analysis/pages/HistoryPage';
import { ProofPage } from '../features/proof/pages';
import { ResultsPage } from '../features/analysis/pages/ResultsPage';
import { ShipLockPage } from '../features/testing/pages/ShipLockPage';
import { TestChecklistPage } from '../features/testing/pages/TestChecklistPage';

export function NotFoundPage() {
  const { pathname } = useLocation();

  if (pathname === '/results') {
    return <ResultsPage />;
  }

  if (pathname === '/history') {
    return <HistoryPage />;
  }

  if (pathname === '/prp/07-test') {
    return <TestChecklistPage />;
  }

  if (pathname === '/prp/08-ship') {
    return <ShipLockPage />;
  }

  if (pathname === '/prp/proof') {
    return <ProofPage />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-slate-600">
          The page you are trying to access does not exist. Return to the landing page to continue.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
