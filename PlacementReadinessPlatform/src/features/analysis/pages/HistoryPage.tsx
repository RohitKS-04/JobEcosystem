import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { getHistoryLoadWarning, readAnalysisHistory, setSelectedAnalysisId } from '../../../services/analysisStorage';

export function HistoryPage() {
  const navigate = useNavigate();
  const history = readAnalysisHistory();
  const warning = getHistoryLoadWarning();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>Persisted entries from localStorage. Click an entry to open results.</CardDescription>
        </CardHeader>
        <CardContent>
          {warning ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{warning}</p> : null}
          {history.length === 0 ? (
            <p className="text-sm text-slate-600">No history found. Run an analysis from the Practice page first.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnalysisId(entry.id);
                      navigate('/results');
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {entry.company || 'Unknown Company'} • {entry.role || 'Unknown Role'}
                      </span>
                      <span className="block text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {entry.finalScore}/100
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
