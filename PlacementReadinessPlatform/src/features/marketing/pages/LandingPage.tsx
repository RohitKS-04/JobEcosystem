import { FormEvent, useState } from 'react';
import { Briefcase, Code2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzeJobDescription } from '../../../services/analysisEngine';
import { saveAnalysisEntry } from '../../../services/analysisStorage';

const features = [
  {
    title: 'Placement Readiness',
    description: 'Analyze job descriptions, practice coding problems, and prepare for interviews.',
    icon: Code2,
    link: '/app/practice',
  },
  {
    title: 'Job Tracker',
    description: 'Track job applications, manage interview schedules, and monitor your job search progress.',
    icon: Briefcase,
    link: '/app/jobs',
  },
];

export function LandingPage() {
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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-8 lg:py-20">
        <section className="rounded-2xl bg-white px-8 py-14 text-center shadow-sm ring-1 ring-slate-200 sm:px-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Job Ecosystem Platform</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Your complete toolkit for job search: placement readiness, job tracking, and resume building
          </p>
          <Link
            to="/app/dashboard"
            className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Get Started
          </Link>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.link} className="group">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </article>
              </Link>
            );
          })}
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-slate-900">Quick JD Analyzer</h2>
            <p className="mt-1 text-sm text-slate-600">Run a readiness analysis directly from home.</p>
          </div>

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
                className="min-h-52 rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                placeholder="Paste full JD text here..."
              />
            </label>

            {isJdTooShort ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                This JD is too short to analyze deeply. Paste full JD for better output.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Analyze Now
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Job Ecosystem Platform. All rights reserved.
      </footer>
    </div>
  );
}
