import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { analyzeJobDescription } from '../../../services/analysisEngine';
import { saveAnalysisEntry } from '../../../services/analysisStorage';

export function PracticePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const isJdTooShort = jdText.trim().length > 0 && jdText.trim().length < 200;

  const onAnalyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = analyzeJobDescription({
      company,
      role,
      jdText,
    });

    saveAnalysisEntry(result);
    navigate('/results');
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JD Analyzer</CardTitle>
          <CardDescription>
            Paste a job description to extract skills, generate a prep checklist, and compute readiness score offline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onAnalyze}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-700">
                Company (optional)
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  placeholder="e.g. Infosys"
                />
              </label>

              <label className="grid gap-1 text-sm text-slate-700">
                Role (optional)
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  placeholder="e.g. Software Engineer"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm text-slate-700">
              Job Description
              <textarea
                required
                value={jdText}
                onChange={(event) => setJdText(event.target.value)}
                className="min-h-64 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                placeholder="Paste full JD text here..."
              />
            </label>

            {isJdTooShort ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                This JD is too short to analyze deeply. Paste full JD for better output.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Analyze
              </button>
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
              >
                Open History
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
