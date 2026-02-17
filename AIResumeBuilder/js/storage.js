// Storage Service - localStorage persistence
const STORAGE_KEYS = {
  DATA: 'resumeBuilderData',
  TEMPLATE: 'resumeTemplate',
  SUBMISSION: 'rb_final_submission',
  CHECKLIST: 'rb_test_checklist',
  STEPS: 'rb_steps_status',
};

const TEMPLATES = ['classic', 'modern', 'minimal'];

function sanitizeString(value) {
  return typeof value === 'string' ? value : '';
}

function defaultResumeState() {
  return {
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ role: '', company: '', duration: '', bullets: '' }],
    projects: [{ title: '', stack: '', bullets: '' }],
    skills: '',
    links: {
      github: '',
      linkedin: '',
    },
  };
}

function normalizeResumeData(raw) {
  const fallback = defaultResumeState();

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const source = raw;
  const safeEducation = Array.isArray(source.education)
    ? source.education.map((item) => ({
        school: sanitizeString(item?.school),
        degree: sanitizeString(item?.degree),
        year: sanitizeString(item?.year),
      }))
    : fallback.education;

  const safeExperience = Array.isArray(source.experience)
    ? source.experience.map((item) => ({
        role: sanitizeString(item?.role),
        company: sanitizeString(item?.company),
        duration: sanitizeString(item?.duration),
        bullets: sanitizeString(item?.bullets || item?.details),
      }))
    : fallback.experience;

  const safeProjects = Array.isArray(source.projects)
    ? source.projects.map((item) => ({
        title: sanitizeString(item?.title),
        stack: sanitizeString(item?.stack),
        bullets: sanitizeString(item?.bullets || item?.description),
      }))
    : fallback.projects;

  return {
    personal: {
      name: sanitizeString(source.personal?.name),
      email: sanitizeString(source.personal?.email),
      phone: sanitizeString(source.personal?.phone),
      location: sanitizeString(source.personal?.location),
    },
    summary: sanitizeString(source.summary),
    education: safeEducation.length > 0 ? safeEducation : fallback.education,
    experience: safeExperience.length > 0 ? safeExperience : fallback.experience,
    projects: safeProjects.length > 0 ? safeProjects : fallback.projects,
    skills: sanitizeString(source.skills),
    links: {
      github: sanitizeString(source.links?.github),
      linkedin: sanitizeString(source.links?.linkedin),
    },
  };
}

function readResumeData() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.DATA);
  if (!raw) {
    return defaultResumeState();
  }

  try {
    return normalizeResumeData(JSON.parse(raw));
  } catch {
    return defaultResumeState();
  }
}

function writeResumeData(data) {
  window.localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
}

function readTemplate() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.TEMPLATE);
  return TEMPLATES.includes(raw) ? raw : 'classic';
}

function writeTemplate(template) {
  if (TEMPLATES.includes(template)) {
    window.localStorage.setItem(STORAGE_KEYS.TEMPLATE, template);
  }
}

function defaultSubmission() {
  return {
    lovableLink: '',
    githubLink: '',
    deployedLink: '',
    submittedAt: null,
  };
}

function readSubmission() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.SUBMISSION);
  if (!raw) {
    return defaultSubmission();
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      lovableLink: sanitizeString(parsed.lovableLink),
      githubLink: sanitizeString(parsed.githubLink),
      deployedLink: sanitizeString(parsed.deployedLink),
      submittedAt: parsed.submittedAt || null,
    };
  } catch {
    return defaultSubmission();
  }
}

function writeSubmission(data) {
  window.localStorage.setItem(STORAGE_KEYS.SUBMISSION, JSON.stringify(data));
}

function defaultChecklist() {
  return [
    { id: 1, label: 'All form sections save to localStorage', passed: false },
    { id: 2, label: 'Live preview updates in real-time', passed: false },
    { id: 3, label: 'Template switching preserves data', passed: false },
    { id: 4, label: 'ATS score calculates correctly', passed: false },
    { id: 5, label: 'Score updates live on edit', passed: false },
    { id: 6, label: 'Export buttons work (copy/download)', passed: false },
    { id: 7, label: 'Empty states handled gracefully', passed: false },
    { id: 8, label: 'Mobile responsive layout works', passed: false },
    { id: 9, label: 'No console errors on any page', passed: false },
    { id: 10, label: 'Bullet guidance appears contextually', passed: false },
  ];
}

function readChecklist() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.CHECKLIST);
  if (!raw) {
    return defaultChecklist();
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultChecklist();
  } catch {
    return defaultChecklist();
  }
}

function writeChecklist(checklist) {
  window.localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
}

function defaultSteps() {
  return [
    { id: 1, label: 'Project Setup', completed: true },
    { id: 2, label: 'Form Builder', completed: true },
    { id: 3, label: 'Live Preview', completed: true },
    { id: 4, label: 'ATS Scoring', completed: true },
    { id: 5, label: 'Template System', completed: true },
    { id: 6, label: 'Export Features', completed: true },
    { id: 7, label: 'Testing', completed: false },
    { id: 8, label: 'Proof Submission', completed: false },
  ];
}

function readSteps() {
  const raw = window.localStorage.getItem(STORAGE_KEYS.STEPS);
  if (!raw) {
    return defaultSteps();
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultSteps();
  } catch {
    return defaultSteps();
  }
}

function writeSteps(steps) {
  window.localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(steps));
}
