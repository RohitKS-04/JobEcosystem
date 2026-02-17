const ROUTES = ['/', '/builder', '/preview', '/proof'];
const DATA_KEY = 'resumeBuilderData';
const TEMPLATE_KEY = 'resumeTemplate';
const TEMPLATES = ['classic', 'modern', 'minimal'];

const ACTION_VERBS = [
  'built',
  'developed',
  'designed',
  'implemented',
  'led',
  'improved',
  'created',
  'optimized',
  'automated',
];

function defaultState() {
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

function sanitizeString(value) {
  return typeof value === 'string' ? value : '';
}

function normalizeData(raw) {
  const fallback = defaultState();

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

function readState() {
  const raw = window.localStorage.getItem(DATA_KEY);
  if (!raw) {
    return defaultState();
  }

  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function writeState() {
  window.localStorage.setItem(DATA_KEY, JSON.stringify(builderState));
}

function readTemplate() {
  const raw = window.localStorage.getItem(TEMPLATE_KEY);
  return TEMPLATES.includes(raw) ? raw : 'classic';
}

function writeTemplate(template) {
  if (TEMPLATES.includes(template)) {
    window.localStorage.setItem(TEMPLATE_KEY, template);
  }
}

const builderState = readState();
let selectedTemplate = readTemplate();

function navigate(path) {
  window.history.pushState({}, '', path);
  render();
}

window.addEventListener('popstate', render);

function countWords(text) {
  return sanitizeString(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function parseSkills(skillsRaw) {
  return sanitizeString(skillsRaw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasNumericIndicator(text) {
  return /\d|%|\bx\b|\bk\b/i.test(sanitizeString(text));
}

function getBullets(multiline) {
  return sanitizeString(multiline)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasContent(value) {
  return sanitizeString(value).trim().length > 0;
}

function hasActionVerbs(text) {
  const lowerText = sanitizeString(text).toLowerCase();
  return ACTION_VERBS.some((verb) => lowerText.includes(verb));
}

function computeAts() {
  let score = 0;
  const suggestions = [];

  if (hasContent(builderState.personal.name)) {
    score += 10;
  } else {
    suggestions.push('Add your name (+10 points)');
  }

  if (hasContent(builderState.personal.email)) {
    score += 10;
  } else {
    suggestions.push('Add your email (+10 points)');
  }

  const summaryText = sanitizeString(builderState.summary);
  if (summaryText.length > 50) {
    score += 10;
  } else {
    suggestions.push('Add a professional summary (+10 points)');
  }

  const experienceWithContent = builderState.experience.filter(
    (item) => hasContent(item.role) && getBullets(item.bullets).length > 0,
  );
  if (experienceWithContent.length >= 1) {
    score += 15;
  } else {
    suggestions.push('Add at least 1 experience entry with bullets (+15 points)');
  }

  const educationComplete = builderState.education.some(
    (item) => hasContent(item.school) && hasContent(item.degree),
  );
  if (educationComplete) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 education entry (+10 points)');
  }

  const skills = parseSkills(builderState.skills);
  if (skills.length >= 5) {
    score += 10;
  } else {
    suggestions.push('Add at least 5 skills (+10 points)');
  }

  const projectsWithContent = builderState.projects.filter(
    (item) => hasContent(item.title) || getBullets(item.bullets).length > 0,
  );
  if (projectsWithContent.length >= 1) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 project (+10 points)');
  }

  if (hasContent(builderState.personal.phone)) {
    score += 5;
  } else {
    suggestions.push('Add phone number (+5 points)');
  }

  if (hasContent(builderState.links.linkedin)) {
    score += 5;
  } else {
    suggestions.push('Add LinkedIn URL (+5 points)');
  }

  if (hasContent(builderState.links.github)) {
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
  let colorClass = 'score--red';
  if (finalScore >= 71) {
    label = 'Strong Resume';
    colorClass = 'score--green';
  } else if (finalScore >= 41) {
    label = 'Getting There';
    colorClass = 'score--amber';
  }

  return {
    score: finalScore,
    label,
    colorClass,
    suggestions: suggestions.slice(0, 5),
  };
}

function getBulletGuidance(text) {
  const bullets = getBullets(text);
  if (bullets.length === 0) {
    return [];
  }

  const firstWords = bullets.map((bullet) => bullet.split(/\s+/)[0].toLowerCase());
  const needsActionVerb = firstWords.some((word) => !ACTION_VERBS.includes(word));
  const needsNumbers = bullets.some((bullet) => !hasNumericIndicator(bullet));

  const guidance = [];
  if (needsActionVerb) {
    guidance.push('Start with a strong action verb.');
  }
  if (needsNumbers) {
    guidance.push('Add measurable impact (numbers).');
  }

  return guidance;
}

function renderTemplateSwitcher() {
  return `
    <div class="template-switcher">
      <span>Template:</span>
      ${TEMPLATES.map(
        (template) => `
          <button
            type="button"
            class="template-switcher__btn ${selectedTemplate === template ? 'template-switcher__btn--active' : ''}"
            data-template="${template}"
          >
            ${template.charAt(0).toUpperCase() + template.slice(1)}
          </button>
        `,
      ).join('')}
    </div>
  `;
}

function bindTemplateButtons() {
  document.querySelectorAll('[data-template]').forEach((button) => {
    button.addEventListener('click', () => {
      const template = button.getAttribute('data-template');
      if (!template || !TEMPLATES.includes(template)) {
        return;
      }

      selectedTemplate = template;
      writeTemplate(template);
      render();
    });
  });
}

function renderTopBar() {
  return `
    <header class="top-bar" role="banner" aria-label="AI Resume Builder top bar">
      <div class="top-bar__project">AI Resume Builder</div>
      <nav class="top-nav" aria-label="Primary navigation">
        <button class="top-nav__link" type="button" data-route="/builder">Builder</button>
        <button class="top-nav__link" type="button" data-route="/preview">Preview</button>
        <button class="top-nav__link" type="button" data-route="/proof">Proof</button>
      </nav>
      <div class="status-badge" aria-label="Status badge">In Progress</div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="proof-footer" aria-label="Proof footer">
      <h2>Proof Footer</h2>
      <div class="proof-grid">
        <div class="proof-item"><span>○ UI skeleton prepared</span></div>
        <div class="proof-item"><span>○ Builder structure created</span></div>
        <div class="proof-item"><span>○ Preview route active</span></div>
        <div class="proof-item"><span>○ Proof artifacts pending</span></div>
      </div>
    </footer>
  `;
}

function bindRouteButtons() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      const route = button.getAttribute('data-route');
      if (route) {
        navigate(route);
      }
    });
  });
}

function renderHome() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar()}
      <section class="context-header">
        <h1>Build a Resume That Gets Read.</h1>
        <p>Create a calm, premium resume workflow with structured writing surfaces and live layout visibility.</p>
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          <article class="card">
            <h2>AI Resume Builder — Premium Skeleton</h2>
            <p>Start with the Builder workspace to shape your resume sections in one focused flow.</p>
            <div class="actions-row">
              <button class="btn btn--primary" type="button" data-route="/builder">Start Building</button>
            </div>
          </article>
        </section>
        <aside class="secondary-panel">
          <div class="panel-block">
            <h3>What this includes</h3>
            <p>Route structure, builder forms, preview shell, and proof placeholder.</p>
          </div>
        </aside>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
  bindTemplateButtons();
}

function renderBuilderPreviewCard() {
  const sections = [];
  const summaryText = sanitizeString(builderState.summary).trim();
  if (summaryText) {
    sections.push(`<section><h4>Summary</h4><p>${summaryText}</p></section>`);
  }

  const educationRows = builderState.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    sections.push(`<section><h4>Education</h4><ul>${educationRows
      .map((item) => `<li>${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}</li>`)
      .join('')}</ul></section>`);
  }

  const experienceRows = builderState.experience.filter(
    (item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0,
  );
  if (experienceRows.length > 0) {
    sections.push(`<section><h4>Experience</h4>${experienceRows
      .map(
        (item) => `<div class="resume-preview-block"><strong>${item.role || 'Role'}${item.company ? `, ${item.company}` : ''}</strong>${
          item.duration ? `<p>${item.duration}</p>` : ''
        }<ul>${getBullets(item.bullets).map((bullet) => `<li>${bullet}</li>`).join('')}</ul></div>`,
      )
      .join('')}</section>`);
  }

  const projectRows = builderState.projects.filter(
    (item) => hasContent(item.title) || hasContent(item.stack) || getBullets(item.bullets).length > 0,
  );
  if (projectRows.length > 0) {
    sections.push(`<section><h4>Projects</h4>${projectRows
      .map(
        (item) => `<div class="resume-preview-block"><strong>${item.title || 'Project'}${item.stack ? ` — ${item.stack}` : ''}</strong><ul>${getBullets(
          item.bullets,
        )
          .map((bullet) => `<li>${bullet}</li>`)
          .join('')}</ul></div>`,
      )
      .join('')}</section>`);
  }

  const skills = parseSkills(builderState.skills);
  if (skills.length > 0) {
    sections.push(`<section><h4>Skills</h4><p>${skills.join(', ')}</p></section>`);
  }

  if (hasContent(builderState.links.github) || hasContent(builderState.links.linkedin)) {
    sections.push(`<section><h4>Links</h4><p>${builderState.links.github || ''}${
      builderState.links.github && builderState.links.linkedin ? ' • ' : ''
    }${builderState.links.linkedin || ''}</p></section>`);
  }

  return `
    <div class="resume-preview-shell template-${selectedTemplate}">
      <header class="resume-preview-header">
        <h3>${builderState.personal.name || 'Your Name'}</h3>
        <p>${builderState.personal.email || 'email@example.com'} • ${builderState.personal.phone || 'Phone'} • ${builderState.personal.location || 'Location'}</p>
      </header>
      ${sections.length > 0 ? sections.join('') : '<p class="preview-empty">Add content to view sectioned resume preview.</p>'}
    </div>
  `;
}

function inputValue(path, fallback = '') {
  return path ?? fallback;
}

function renderBuilder() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar()}
      <section class="context-header">
        <h1>Builder Workspace</h1>
        <p>Structure resume content on the left while keeping a live layout shell visible on the right.</p>
        ${renderTemplateSwitcher()}
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          <article class="card">
            <h2>Personal Info</h2>
            <div class="form-stack">
              <input data-field="personal.name" type="text" placeholder="Full Name" value="${inputValue(builderState.personal.name)}" />
              <input data-field="personal.email" type="email" placeholder="Email" value="${inputValue(builderState.personal.email)}" />
              <input data-field="personal.phone" type="text" placeholder="Phone" value="${inputValue(builderState.personal.phone)}" />
              <input data-field="personal.location" type="text" placeholder="Location" value="${inputValue(builderState.personal.location)}" />
            </div>
          </article>

          <article class="card">
            <h2>Summary</h2>
            <div class="form-stack">
              <textarea data-field="summary" placeholder="Write your summary...">${inputValue(builderState.summary)}</textarea>
            </div>
          </article>

          <article class="card">
            <h2>Education</h2>
            <div class="entry-stack" id="education-stack">
              ${builderState.education
                .map(
                  (item, index) => `
                  <div class="entry-item">
                    <input data-field="education.${index}.school" type="text" placeholder="School" value="${inputValue(item.school)}" />
                    <input data-field="education.${index}.degree" type="text" placeholder="Degree" value="${inputValue(item.degree)}" />
                    <input data-field="education.${index}.year" type="text" placeholder="Year" value="${inputValue(item.year)}" />
                  </div>
                `,
                )
                .join('')}
            </div>
            <button class="btn btn--secondary" type="button" data-add="education">Add Education</button>
          </article>

          <article class="card">
            <h2>Experience</h2>
            <div class="entry-stack" id="experience-stack">
              ${builderState.experience
                .map(
                  (item, index) => `
                  <div class="entry-item">
                    <input data-field="experience.${index}.role" type="text" placeholder="Role" value="${inputValue(item.role)}" />
                    <input data-field="experience.${index}.company" type="text" placeholder="Company" value="${inputValue(item.company)}" />
                    <input data-field="experience.${index}.duration" type="text" placeholder="Duration" value="${inputValue(item.duration)}" />
                    <textarea data-field="experience.${index}.bullets" placeholder="One bullet per line">${inputValue(item.bullets)}</textarea>
                    ${getBulletGuidance(item.bullets)
                      .map((hint) => `<p class="guidance-inline">${hint}</p>`)
                      .join('')}
                  </div>
                `,
                )
                .join('')}
            </div>
            <button class="btn btn--secondary" type="button" data-add="experience">Add Experience</button>
          </article>

          <article class="card">
            <h2>Projects</h2>
            <div class="entry-stack" id="projects-stack">
              ${builderState.projects
                .map(
                  (item, index) => `
                  <div class="entry-item">
                    <input data-field="projects.${index}.title" type="text" placeholder="Project Title" value="${inputValue(item.title)}" />
                    <textarea data-field="projects.${index}.bullets" placeholder="One bullet per line">${inputValue(item.bullets)}</textarea>
                    ${getBulletGuidance(item.bullets)
                      .map((hint) => `<p class="guidance-inline">${hint}</p>`)
                      .join('')}
                    <input data-field="projects.${index}.stack" type="text" placeholder="Tech Stack" value="${inputValue(item.stack)}" />
                  </div>
                `,
                )
                .join('')}
            </div>
            <button class="btn btn--secondary" type="button" data-add="projects">Add Project</button>
          </article>

          <article class="card">
            <h2>Skills</h2>
            <input data-field="skills" type="text" placeholder="Comma separated skills" value="${inputValue(builderState.skills)}" />
          </article>

          <article class="card">
            <h2>Links</h2>
            <div class="form-stack">
              <input data-field="links.github" type="text" placeholder="GitHub" value="${inputValue(builderState.links.github)}" />
              <input data-field="links.linkedin" type="text" placeholder="LinkedIn" value="${inputValue(builderState.links.linkedin)}" />
            </div>
          </article>

          <article class="card">
            <div class="actions-row">
              <button class="btn btn--secondary" type="button" data-sample>Load Sample Data</button>
            </div>
          </article>
        </section>

        <aside class="secondary-panel">
          ${(() => {
            const ats = computeAts();
            return `
              <div class="panel-block">
                <h3>ATS Readiness Score</h3>
                <div class="score-circle-container">
                  <svg class="score-circle" viewBox="0 0 120 120" width="120" height="120">
                    <circle class="score-circle__bg" cx="60" cy="60" r="54" fill="none" stroke="#e8e5dd" stroke-width="8"></circle>
                    <circle class="score-circle__progress ${ats.colorClass}" cx="60" cy="60" r="54" fill="none" stroke-width="8" 
                      stroke-dasharray="${(ats.score / 100) * 339.292} 339.292" 
                      stroke-linecap="round" 
                      transform="rotate(-90 60 60)"></circle>
                    <text x="60" y="55" text-anchor="middle" class="score-circle__value">${ats.score}</text>
                    <text x="60" y="72" text-anchor="middle" class="score-circle__label">${ats.label}</text>
                  </svg>
                </div>
                <h4>Improvement Suggestions</h4>
                <ul class="improvement-list">
                  ${ats.suggestions.length > 0 ? ats.suggestions.map((item) => `<li>${item}</li>`).join('') : '<li>Excellent! Your resume is ATS-ready.</li>'}
                </ul>
              </div>
            `;
          })()}
          <div class="panel-block">
            <h3>Live Preview</h3>
            <p>Structured placeholder layout. No scoring or export in this phase.</p>
          </div>
          ${renderBuilderPreviewCard()}
        </aside>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();

  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      const path = target.getAttribute('data-field');
      if (!path) {
        return;
      }

      const segments = path.split('.');

      if (segments.length === 1) {
        builderState[segments[0]] = target.value;
      } else if (segments.length === 2) {
        builderState[segments[0]][segments[1]] = target.value;
      } else if (segments.length === 3) {
        const index = Number(segments[1]);
        builderState[segments[0]][index][segments[2]] = target.value;
      }

      writeState();
      renderBuilder();
    });
  });

  document.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-add');
      if (target === 'education') {
        builderState.education.push({ school: '', degree: '', year: '' });
      }
      if (target === 'experience') {
        builderState.experience.push({ role: '', company: '', duration: '', bullets: '' });
      }
      if (target === 'projects') {
        builderState.projects.push({ title: '', bullets: '', stack: '' });
      }
      writeState();
      renderBuilder();
    });
  });

  document.querySelector('[data-sample]')?.addEventListener('click', () => {
    builderState.personal = {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@email.com',
      phone: '+91-90000-00000',
      location: 'Bengaluru, India',
    };
    builderState.summary = 'Entry-level software engineer focused on frontend systems and practical product delivery.';
    builderState.education = [{ school: 'ABC Institute of Technology', degree: 'B.Tech Computer Science', year: '2026' }];
    builderState.experience = [
      {
        role: 'Frontend Intern',
        company: 'Nova Labs',
        duration: 'Jan 2025 - Jun 2025',
        bullets: 'Built reusable UI modules that improved component consistency by 40%.\nOptimized dashboard rendering and reduced initial load time by 28%.',
      },
    ];
    builderState.projects = [
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
    ];
    builderState.skills = 'JavaScript, React, TypeScript, CSS';
    builderState.links = {
      github: 'https://github.com/aaravsharma',
      linkedin: 'https://linkedin.com/in/aaravsharma',
    };
    writeState();
    renderBuilder();
  });
}

function checkResumeCompleteness() {
  const warnings = [];

  if (!hasContent(builderState.personal.name)) {
    warnings.push('Name is missing.');
  }

  const projectsWithContent = builderState.projects.filter(
    (item) => hasContent(item.title) || hasContent(item.stack) || getBullets(item.bullets).length > 0,
  );
  const experienceWithContent = builderState.experience.filter(
    (item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0,
  );

  if (projectsWithContent.length === 0 && experienceWithContent.length === 0) {
    warnings.push('Add at least one project or experience entry.');
  }

  return warnings;
}

function generatePlainTextResume() {
  const lines = [];

  lines.push(builderState.personal.name || 'Your Name');
  lines.push('');

  const contactParts = [];
  if (hasContent(builderState.personal.email)) {
    contactParts.push(builderState.personal.email);
  }
  if (hasContent(builderState.personal.phone)) {
    contactParts.push(builderState.personal.phone);
  }
  if (hasContent(builderState.personal.location)) {
    contactParts.push(builderState.personal.location);
  }
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' • '));
    lines.push('');
  }

  if (hasContent(builderState.summary)) {
    lines.push('SUMMARY');
    lines.push(builderState.summary);
    lines.push('');
  }

  const educationRows = builderState.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    lines.push('EDUCATION');
    educationRows.forEach((item) => {
      lines.push(`${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}`);
    });
    lines.push('');
  }

  const experienceRows = builderState.experience.filter(
    (item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0,
  );
  if (experienceRows.length > 0) {
    lines.push('EXPERIENCE');
    experienceRows.forEach((item) => {
      lines.push(`${item.role || 'Role'}${item.company ? `, ${item.company}` : ''}`);
      if (item.duration) {
        lines.push(item.duration);
      }
      getBullets(item.bullets).forEach((bullet) => {
        lines.push(`• ${bullet}`);
      });
      lines.push('');
    });
  }

  const projectRows = builderState.projects.filter(
    (item) => hasContent(item.title) || hasContent(item.stack) || getBullets(item.bullets).length > 0,
  );
  if (projectRows.length > 0) {
    lines.push('PROJECTS');
    projectRows.forEach((item) => {
      lines.push(`${item.title || 'Project'}${item.stack ? ` — ${item.stack}` : ''}`);
      getBullets(item.bullets).forEach((bullet) => {
        lines.push(`• ${bullet}`);
      });
      lines.push('');
    });
  }

  const skills = parseSkills(builderState.skills);
  if (skills.length > 0) {
    lines.push('SKILLS');
    lines.push(skills.join(', '));
    lines.push('');
  }

  if (hasContent(builderState.links.github) || hasContent(builderState.links.linkedin)) {
    lines.push('LINKS');
    if (hasContent(builderState.links.github)) {
      lines.push(builderState.links.github);
    }
    if (hasContent(builderState.links.linkedin)) {
      lines.push(builderState.links.linkedin);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderPreview() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const sections = [];
  const summaryText = sanitizeString(builderState.summary).trim();
  if (summaryText) {
    sections.push(`<section><h3>Summary</h3><p>${summaryText}</p></section>`);
  }

  const educationRows = builderState.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    sections.push(`<section><h3>Education</h3><ul>${educationRows
      .map((item) => `<li>${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}</li>`)
      .join('')}</ul></section>`);
  }

  const experienceRows = builderState.experience.filter(
    (item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0,
  );
  if (experienceRows.length > 0) {
    sections.push(`<section><h3>Experience</h3>${experienceRows
      .map(
        (item) => `<div class="preview-item"><strong>${item.role || 'Role'}${item.company ? `, ${item.company}` : ''}</strong>${
          item.duration ? `<p>${item.duration}</p>` : ''
        }<ul>${getBullets(item.bullets).map((bullet) => `<li>${bullet}</li>`).join('')}</ul></div>`,
      )
      .join('')}</section>`);
  }

  const projectRows = builderState.projects.filter(
    (item) => hasContent(item.title) || hasContent(item.stack) || getBullets(item.bullets).length > 0,
  );
  if (projectRows.length > 0) {
    sections.push(`<section><h3>Projects</h3>${projectRows
      .map(
        (item) => `<div class="preview-item"><strong>${item.title || 'Project'}${item.stack ? ` — ${item.stack}` : ''}</strong><ul>${getBullets(
          item.bullets,
        )
          .map((bullet) => `<li>${bullet}</li>`)
          .join('')}</ul></div>`,
      )
      .join('')}</section>`);
  }

  const skills = parseSkills(builderState.skills);
  if (skills.length > 0) {
    sections.push(`<section><h3>Skills</h3><p>${skills.join(', ')}</p></section>`);
  }

  if (hasContent(builderState.links.github) || hasContent(builderState.links.linkedin)) {
    sections.push(`<section><h3>Links</h3><p>${builderState.links.github || ''}${
      builderState.links.github && builderState.links.linkedin ? ' • ' : ''
    }${builderState.links.linkedin || ''}</p></section>`);
  }

  const warnings = checkResumeCompleteness();

  app.innerHTML = `
    <div class="app-shell app-shell--preview">
      ${renderTopBar()}
      <section class="context-header context-header--preview">
        <h1>Preview</h1>
        <p>Minimal resume layout with typography-first structure.</p>
        ${renderTemplateSwitcher()}
      </section>
      <main class="preview-page">
        ${warnings.length > 0 ? `<div class="export-warning">Your resume may look incomplete: ${warnings.join(' ')}</div>` : ''}
        <div class="export-actions">
          <button class="btn btn--primary" type="button" data-export="print">Print / Save as PDF</button>
          <button class="btn btn--secondary" type="button" data-export="text">Copy Resume as Text</button>
        </div>
        <article class="preview-document template-${selectedTemplate}">
          <header>
            <h2>${builderState.personal.name || 'Your Name'}</h2>
            <p>${builderState.personal.email || 'email@example.com'} • ${builderState.personal.phone || 'Phone'} • ${builderState.personal.location || 'Location'}</p>
          </header>
          ${sections.length > 0 ? sections.join('') : '<p class="preview-empty">No content added yet. Return to Builder to start drafting.</p>'}
        </article>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
  bindTemplateButtons();

  document.querySelectorAll('[data-export]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-export');
      if (action === 'print') {
        window.print();
      } else if (action === 'text') {
        const plainText = generatePlainTextResume();
        navigator.clipboard.writeText(plainText).then(() => {
          alert('Resume copied to clipboard!');
        }).catch(() => {
          alert('Failed to copy. Please try again.');
        });
      }
    });
  });
}

function renderProof() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar()}
      <section class="context-header">
        <h1>Proof</h1>
        <p>Placeholder for artifacts and submission evidence.</p>
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          <article class="card">
            <h2>Artifacts Placeholder</h2>
            <p>Attach final build artifacts, screenshots, and submission notes here in the next phase.</p>
          </article>
        </section>
        <aside class="secondary-panel">
          <div class="panel-block">
            <h3>Proof Panel</h3>
            <p>Reserved for artifact checklist and submission actions.</p>
          </div>
        </aside>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
}

function renderNotFound() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar()}
      <section class="context-header">
        <h1>Page Not Found</h1>
        <p>Open Builder, Preview, or Proof from the top navigation.</p>
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          <article class="card">
            <div class="actions-row">
              <button class="btn btn--primary" type="button" data-route="/">Go Home</button>
            </div>
          </article>
        </section>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
}

function render() {
  const path = window.location.pathname;

  if (!ROUTES.includes(path)) {
    renderNotFound();
    return;
  }

  if (path === '/') {
    renderHome();
    return;
  }

  if (path === '/builder') {
    renderBuilder();
    return;
  }

  if (path === '/preview') {
    renderPreview();
    return;
  }

  renderProof();
}

render();
