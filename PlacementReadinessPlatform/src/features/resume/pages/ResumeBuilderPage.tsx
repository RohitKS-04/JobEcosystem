import { useState, useEffect } from 'react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  bullets: string;
}

interface Project {
  title: string;
  bullets: string;
  stack: string;
}

interface Links {
  github: string;
  linkedin: string;
}

interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string;
  links: Links;
}

const defaultResumeData: ResumeData = {
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [{ school: '', degree: '', year: '' }],
  experience: [{ role: '', company: '', duration: '', bullets: '' }],
  projects: [{ title: '', bullets: '', stack: '' }],
  skills: '',
  links: { github: '', linkedin: '' },
};

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
  const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'led', 'improved', 'created', 'optimized', 'automated'];
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

  const experienceWithContent = data.experience.filter((item) => hasContent(item.role) && getBullets(item.bullets).length > 0);
  if (experienceWithContent.length >= 1) {
    score += 15;
  } else {
    suggestions.push('Add at least 1 experience entry with bullets (+15 points)');
  }

  const educationComplete = data.education.some((item) => hasContent(item.school) && hasContent(item.degree));
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

  const projectsWithContent = data.projects.filter((item) => hasContent(item.title) || getBullets(item.bullets).length > 0);
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

function getBulletGuidance(text: string): string[] {
  const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'led', 'improved', 'created', 'optimized', 'automated'];
  const bullets = getBullets(text);
  if (bullets.length === 0) {
    return [];
  }

  const firstWords = bullets.map((bullet) => bullet.split(/\s+/)[0].toLowerCase());
  const needsActionVerb = firstWords.some((word) => !ACTION_VERBS.includes(word));
  const needsNumbers = bullets.some((bullet) => !/\d|%|\bx\b|\bk\b/i.test(bullet));

  const guidance: string[] = [];
  if (needsActionVerb) {
    guidance.push('Start with a strong action verb.');
  }
  if (needsNumbers) {
    guidance.push('Add measurable impact (numbers).');
  }

  return guidance;
}

function AtsScore({ data }: { data: ResumeData }) {
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

function TemplateSelector({ 
  selectedTemplate, 
  onTemplateChange 
}: { 
  selectedTemplate: 'classic' | 'modern' | 'minimal';
  onTemplateChange: (template: 'classic' | 'modern' | 'minimal') => void;
}) {
  const templates = [
    {
      id: 'classic' as const,
      name: 'Classic',
      description: 'Traditional single-column with serif headings',
      preview: 'border-2 border-slate-800',
    },
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Two-column with colored sidebar',
      preview: 'border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white',
    },
    {
      id: 'minimal' as const,
      name: 'Minimal',
      description: 'Clean layout with generous whitespace',
      preview: 'border border-slate-200',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose Template</h3>
      
      <div className="grid gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">{template.name}</span>
              {selectedTemplate === template.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 text-left">{template.description}</p>
            <div className="mt-3 h-8 rounded bg-white p-1">
              <div className={`h-full rounded ${template.preview}`}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResumePreview({ data, template }: { data: ResumeData; template: 'classic' | 'modern' | 'minimal' }) {
  const templateStyles = {
    classic: 'border-2 border-slate-800',
    modern: 'border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white',
    minimal: 'border border-slate-200',
  };

  const headerStyles = {
    classic: 'border-b-2 border-slate-800 pb-4',
    modern: 'border-b border-blue-600 pb-4',
    minimal: 'border-b border-slate-200 pb-4',
  };

  const headingStyles = {
    classic: 'font-serif text-xl font-bold text-slate-900',
    modern: 'font-sans text-xl font-bold text-slate-900',
    minimal: 'font-sans text-lg font-light text-slate-900 uppercase tracking-wide',
  };

  return (
    <div className={`rounded-xl bg-white p-8 shadow-sm ${templateStyles[template]}`}>
      {/* Header */}
      <header className={`mb-6 ${headerStyles[template]}`}>
        <h1 className={`text-2xl font-bold text-slate-900 mb-2`}>
          {data.personal.name || 'Your Name'}
        </h1>
        <div className="text-sm text-slate-600 flex flex-wrap gap-2">
          {hasContent(data.personal.email) && <span>{data.personal.email}</span>}
          {hasContent(data.personal.phone) && <span>• {data.personal.phone}</span>}
          {hasContent(data.personal.location) && <span>• {data.personal.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {hasContent(data.summary) && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Summary</h2>
          <p className="text-slate-700 leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Empty State */}
      {!hasContent(data.summary) &&
        !data.education.some((item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year)) &&
        !data.experience.some((item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0) &&
        !data.projects.some((item) => hasContent(item.title) || getBullets(item.bullets).length > 0) &&
        parseSkills(data.skills).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-lg font-medium mb-2">No content added yet</div>
            <div className="text-sm">Start filling in the form to see your resume preview</div>
          </div>
        )}
    </div>
  );
}

export function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    return saved ? JSON.parse(saved) : defaultResumeData;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal'>(() => {
    const saved = localStorage.getItem('resumeTemplate');
    return (saved === 'classic' || saved === 'modern' || saved === 'minimal') ? saved : 'classic';
  });

  useEffect(() => {
    localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem('resumeTemplate', selectedTemplate);
  }, [selectedTemplate]);

  const updateField = (path: string, value: string) => {
    const newData = { ...resumeData };
    const segments = path.split('.');

    if (segments.length === 1) {
      (newData as any)[segments[0]] = value;
    } else if (segments.length === 2) {
      (newData as any)[segments[0]][segments[1]] = value;
    } else if (segments.length === 3) {
      const index = Number(segments[1]);
      (newData as any)[segments[0]][index][segments[2]] = value;
    }

    setResumeData(newData);
  };

  const addEntry = (type: 'education' | 'experience' | 'projects') => {
    const newData = { ...resumeData };
    if (type === 'education') {
      newData.education.push({ school: '', degree: '', year: '' });
    } else if (type === 'experience') {
      newData.experience.push({ role: '', company: '', duration: '', bullets: '' });
    } else if (type === 'projects') {
      newData.projects.push({ title: '', bullets: '', stack: '' });
    }
    setResumeData(newData);
  };

  const loadSampleData = () => {
    setResumeData({
      personal: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@email.com',
        phone: '+91-90000-00000',
        location: 'Bengaluru, India',
      },
      summary: 'Entry-level software engineer focused on frontend systems and practical product delivery.',
      education: [{ school: 'ABC Institute of Technology', degree: 'B.Tech Computer Science', year: '2026' }],
      experience: [
        {
          role: 'Frontend Intern',
          company: 'Nova Labs',
          duration: 'Jan 2025 - Jun 2025',
          bullets: 'Built reusable UI modules that improved component consistency by 40%.\nOptimized dashboard rendering and reduced initial load time by 28%.',
        },
      ],
      projects: [
        {
          title: 'Smart Resume Assistant',
          bullets: 'Implemented real-time resume section composition with deterministic layout updates.\nImproved editing flow and reduced manual formatting effort by 60%.',
          stack: 'JavaScript, HTML, CSS',
        },
        {
          title: 'Applicant Tracker Lite',
          bullets: 'Designed structured tracking panels for 50+ applications with quick status filters.',
          stack: 'TypeScript, React',
        },
      ],
      skills: 'JavaScript, React, TypeScript, CSS, HTML, Git, Node.js, PostgreSQL',
      links: {
        github: 'https://github.com/aaravsharma',
        linkedin: 'https://linkedin.com/in/aaravsharma',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Resume Builder</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                value={resumeData.personal.name}
                onChange={(e) => updateField('personal.name', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
              <input
                type="email"
                placeholder="Email"
                value={resumeData.personal.email}
                onChange={(e) => updateField('personal.email', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
              <input
                type="text"
                placeholder="Phone"
                value={resumeData.personal.phone}
                onChange={(e) => updateField('personal.phone', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
              <input
                type="text"
                placeholder="Location"
                value={resumeData.personal.location}
                onChange={(e) => updateField('personal.location', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Summary</h3>
            <textarea
              placeholder="Write your professional summary..."
              value={resumeData.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary min-h-32"
            />
          </div>

          {/* Education */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Education</h3>
            <div className="space-y-4">
              {resumeData.education.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="School"
                    value={item.school}
                    onChange={(e) => updateField(`education.${index}.school`, e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={item.degree}
                    onChange={(e) => updateField(`education.${index}.degree`, e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={item.year}
                    onChange={(e) => updateField(`education.${index}.year`, e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => addEntry('education')}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Add Education
            </button>
          </div>

          {/* Experience */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Experience</h3>
            <div className="space-y-4">
              {resumeData.experience.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Role"
                      value={item.role}
                      onChange={(e) => updateField(`experience.${index}.role`, e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={item.company}
                      onChange={(e) => updateField(`experience.${index}.company`, e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={item.duration}
                      onChange={(e) => updateField(`experience.${index}.duration`, e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                    />
                  </div>
                  <textarea
                    placeholder="One bullet point per line"
                    value={item.bullets}
                    onChange={(e) => updateField(`experience.${index}.bullets`, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary min-h-24"
                  />
                  {getBulletGuidance(item.bullets).map((hint, idx) => (
                    <p key={idx} className="text-sm text-amber-600 italic">{hint}</p>
                  ))}
                </div>
              ))}
            </div>
            <button
              onClick={() => addEntry('experience')}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Add Experience
            </button>
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Projects</h3>
            <div className="space-y-4">
              {resumeData.projects.map((item, index) => (
                <div key={index} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={item.title}
                    onChange={(e) => updateField(`projects.${index}.title`, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  />
                  <textarea
                    placeholder="One bullet point per line"
                    value={item.bullets}
                    onChange={(e) => updateField(`projects.${index}.bullets`, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary min-h-24"
                  />
                  {getBulletGuidance(item.bullets).map((hint, idx) => (
                    <p key={idx} className="text-sm text-amber-600 italic">{hint}</p>
                  ))}
                  <input
                    type="text"
                    placeholder="Tech Stack"
                    value={item.stack}
                    onChange={(e) => updateField(`projects.${index}.stack`, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => addEntry('projects')}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Add Project
            </button>
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
            <input
              type="text"
              placeholder="Comma separated skills (e.g., JavaScript, React, TypeScript)"
              value={resumeData.skills}
              onChange={(e) => updateField('skills', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
            />
          </div>

          {/* Links */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Links</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="GitHub URL"
                value={resumeData.links.github}
                onChange={(e) => updateField('links.github', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
              <input
                type="text"
                placeholder="LinkedIn URL"
                value={resumeData.links.linkedin}
                onChange={(e) => updateField('links.linkedin', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={loadSampleData}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 transition-colors"
            >
              Load Sample Data
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AtsScore data={resumeData} />
          <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
          <ResumePreview data={resumeData} template={selectedTemplate} />
        </div>
      </div>
    </div>
  );
}
