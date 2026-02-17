import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { calculateConfidenceAdjustedReadiness } from '../../../services/analysisEngine';
import { readSelectedOrLatestAnalysis, updateAnalysisEntry } from '../../../services/analysisStorage';
import type { AnalysisResult, SkillCategory, SkillConfidence } from '../../../types/analysis';

const categoryOrder: SkillCategory[] = [
  'Core CS',
  'Languages',
  'Web',
  'Data',
  'Cloud/DevOps',
  'Testing',
  'General',
];

export function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(() => readSelectedOrLatestAnalysis());
  const [statusMessage, setStatusMessage] = useState('');

  const weakSkills = useMemo(() => {
    if (!result) {
      return [];
    }

    return Object.entries(result.skillConfidenceMap)
      .filter(([, value]) => value === 'practice')
      .map(([skill]) => skill)
      .slice(0, 3);
  }, [result]);

  const updateSkillConfidence = (skill: string, value: SkillConfidence) => {
    setResult((current) => {
      if (!current) {
        return current;
      }

      const nextMap = {
        ...current.skillConfidenceMap,
        [skill]: value,
      };
      const nextScore = calculateConfidenceAdjustedReadiness(current.baseScore, nextMap);
      const next: AnalysisResult = {
        ...current,
        skillConfidenceMap: nextMap,
        finalScore: nextScore,
        readinessScore: nextScore,
        updatedAt: new Date().toISOString(),
      };

      updateAnalysisEntry(next);
      return next;
    });
  };

  const buildPlanText = (entry: AnalysisResult) =>
    `7-Day Plan\n${entry.plan.map((item) => `${item.day}: ${item.focus}`).join('\n')}`;

  const buildChecklistText = (entry: AnalysisResult) =>
    `Round-wise Preparation Checklist\n${entry.checklist
      .map((round) => `${round.round}\n${round.items.map((item) => `- ${item}`).join('\n')}`)
      .join('\n\n')}`;

  const buildQuestionsText = (entry: AnalysisResult) =>
    `10 Likely Interview Questions\n${entry.questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}`;

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied.`);
    } catch {
      setStatusMessage(`Unable to copy ${label.toLowerCase()} on this browser.`);
    }
  };

  const downloadAsTxt = (entry: AnalysisResult) => {
    const sections = [
      `Company: ${entry.company || 'N/A'}`,
      `Role: ${entry.role || 'N/A'}`,
      `Score: ${entry.finalScore}/100 (Base ${entry.baseScore})`,
      '',
      'Key Skills Extracted',
      ...categoryOrder
        .filter((category) => entry.extractedSkills[category]?.length > 0)
        .map((category) => `${category}: ${entry.extractedSkills[category].join(', ')}`),
      '',
      buildPlanText(entry),
      '',
      buildChecklistText(entry),
      '',
      buildQuestionsText(entry),
    ].join('\n');

    const blob = new Blob([sections], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `placement-readiness-${entry.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatusMessage('TXT downloaded.');
  };

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>No analysis yet</CardTitle>
            <CardDescription>Run your first JD analysis to generate preparation output.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/practice"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go to Analyze
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>
            {result.company || 'Company not provided'} • {result.role || 'Role not provided'} • Score {result.finalScore}/100
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText('7-day plan', buildPlanText(result))}
              className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
            >
              Copy 7-day plan
            </button>
            <button
              type="button"
              onClick={() => copyText('round checklist', buildChecklistText(result))}
              className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
            >
              Copy round checklist
            </button>
            <button
              type="button"
              onClick={() => copyText('10 questions', buildQuestionsText(result))}
              className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
            >
              Copy 10 questions
            </button>
            <button
              type="button"
              onClick={() => downloadAsTxt(result)}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Download as TXT
            </button>
          </div>
          {statusMessage ? <p className="mt-2 text-xs text-slate-500">{statusMessage}</p> : null}
        </CardContent>
      </Card>

      {result.companyIntel ? (
        <Card>
          <CardHeader>
            <CardTitle>Company Intel</CardTitle>
            <CardDescription>{result.companyIntel.note}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Company</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{result.companyIntel.companyName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Industry</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{result.companyIntel.industry}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Estimated size</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{result.companyIntel.sizeCategory}</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Typical Hiring Focus</p>
              <p className="mt-1 text-sm text-slate-700">{result.companyIntel.typicalHiringFocus}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Round Mapping</CardTitle>
          <CardDescription>Dynamic round flow based on company profile and detected skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.roundMapping.map((step, index) => (
              <div key={`${step.round}-${step.title}`} className="relative pl-8">
                <span
                  className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {index < result.roundMapping.length - 1 ? (
                  <span className="absolute left-[7px] top-6 h-[calc(100%-6px)] w-px bg-primary/30" aria-hidden="true" />
                ) : null}
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{step.round}</p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.focus}</p>
                  <p className="mt-2 text-xs font-medium text-primary">Why this round matters: {step.whyItMatters}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
          <CardDescription>Detected keywords grouped by category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryOrder.map((category) => {
            const skills = result.extractedSkills[category];
            if (!skills || skills.length === 0) {
              return null;
            }

            return (
              <div key={category}>
                <p className="mb-2 text-sm font-semibold text-slate-700">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div key={`${category}-${skill}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-800">{skill}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateSkillConfidence(skill, 'know')}
                          className={
                            result.skillConfidenceMap[skill] === 'know'
                              ? 'rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700'
                              : 'rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600'
                          }
                        >
                          I know this
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSkillConfidence(skill, 'practice')}
                          className={
                            result.skillConfidenceMap[skill] === 'practice'
                              ? 'rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700'
                              : 'rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600'
                          }
                        >
                          Need practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Round-wise Preparation Checklist</CardTitle>
            <CardDescription>Template adapted to detected skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.checklist.map((round) => (
              <div key={round.round} className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{round.round}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {round.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-Day Plan</CardTitle>
            <CardDescription>Adaptive weekly execution roadmap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.plan.map((item) => (
              <div key={item.day} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.day}</p>
                <p className="mt-1 text-sm text-slate-600">{item.focus}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>10 Likely Interview Questions</CardTitle>
          <CardDescription>Generated from extracted stack signals.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {result.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Next</CardTitle>
          <CardDescription>Calm focus for your immediate next move.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Top weak skills</p>
            {weakSkills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {weakSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No weak skills marked. Great progress.</p>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            Start Day 1 plan now.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
