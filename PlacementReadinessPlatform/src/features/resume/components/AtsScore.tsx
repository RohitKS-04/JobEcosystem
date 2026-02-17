import { ResumeData } from './ResumeForm';

interface AtsScoreProps {
  data: ResumeData;
}

const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'led', 'improved', 'created', 'optimized', 'automated'];

function hasContent(value: string): boolean {
  return value.trim().length > 0;
}

function parseSkills(skillsRaw: string): string[] {
  return skillsRaw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBullets(multiline: string): string[] {
  return multiline
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasActionVerbs(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ACTION_VERBS.some((verb) => lowerText.includes(verb));
}

function computeAtsScore(data: ResumeData): { score: number; label: string; colorClass: string; suggestions: string[] } {
  let score = 0;
  const suggestions: string[] = [];

  if (hasContent(data.personal.name)) {
    score += 10;
  } else {
    suggestions.push('Add your name (+10 points)');
  }

  if (hasContent(data.personal.email)) {
    score += 10;
  } else {
    suggestions.push('Add your email (+10 points)');
  }

  const summaryText = data.summary.trim();
  if (summaryText.length > 50) {
    score += 10;
  } else {
    suggestions.push('Add a professional summary (+10 points)');
  }

  const experienceWithContent = data.experience.filter((item: any) => hasContent(item.role) && getBullets(item.bullets).length > 0);
  if (experienceWithContent.length >= 1) {
    score += 15;
  } else {
    suggestions.push('Add at least 1 experience entry with bullets (+15 points)');
  }

  const educationComplete = data.education.some((item: any) => hasContent(item.school) && hasContent(item.degree));
  if (educationComplete) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 education entry (+10 points)');
  }

  const skills = parseSkills(data.skills);
  if (skills.length >= 5) {
    score += 10;
  } else {
    suggestions.push('Add at least 5 skills (+10 points)');
  }

  const projectsWithContent = data.projects.filter((item: any) => hasContent(item.title) || getBullets(item.bullets).length > 0);
  if (projectsWithContent.length >= 1) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 project (+10 points)');
  }

  if (hasContent(data.personal.phone)) {
    score += 5;
  } else {
    suggestions.push('Add phone number (+5 points)');
  }

  if (hasContent(data.links.linkedin)) {
    score += 5;
  } else {
    suggestions.push('Add LinkedIn URL (+5 points)');
  }

  if (hasContent(data.links.github)) {
    score += 5;
  } else {
    suggestions.push('Add GitHub URL (+5 points)');
  }

  if (hasActionVerbs(summaryText)) {
    score += 10;
  } else if (summaryText.length > 50) {
    suggestions.push('Use action verbs in summary (+10 points)');
  }

  const finalScore = Math.min(100, score);

  let label = 'Needs Work';
  let colorClass = 'text-red-500';
  if (finalScore >= 71) {
    label = 'Strong Resume';
    colorClass = 'text-green-500';
  } else if (finalScore >= 41) {
    label = 'Getting There';
    colorClass = 'text-amber-500';
  }

  return {
    score: finalScore,
    label,
    colorClass,
    suggestions: suggestions.slice(0, 5),
  };
}

export function AtsScore({ data }: AtsScoreProps) {
  const ats = computeAtsScore(data);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (ats.score / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">ATS Readiness Score</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={ats.score >= 71 ? '#10b981' : ats.score >= 41 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${ats.colorClass}`}>{ats.score}</span>
            <span className={`text-xs font-medium ${ats.colorClass}`}>{ats.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Improvement Suggestions</h4>
        <ul className="space-y-2">
          {ats.suggestions.length > 0 ? (
            ats.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-start">
                <span className="text-primary mr-2">•</span>
                {suggestion}
              </li>
            ))
          ) : (
            <li className="text-sm text-green-600 flex items-start">
              <span className="mr-2">✓</span>
              Excellent! Your resume is ATS-ready.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
