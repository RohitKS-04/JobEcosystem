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

export interface ResumeData {
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

const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'led', 'improved', 'created', 'optimized', 'automated'];



function getBulletGuidance(text: string): string[] {
  const bullets = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
    
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

export function ResumeForm() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    return saved ? JSON.parse(saved) : defaultResumeData;
  });

  useEffect(() => {
    localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
  }, [resumeData]);

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
  );
}
