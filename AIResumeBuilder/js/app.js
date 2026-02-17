// Main Application - Modular AI Resume Builder
const ROUTES = ['/', '/builder', '/preview', '/proof'];

// Global state
let resumeData = readResumeData();
let selectedTemplate = readTemplate();
let steps = readSteps();
let checklist = readChecklist();
let submission = readSubmission();

// Navigation
function navigate(path) {
  window.history.pushState({}, '', path);
  render();
}

window.addEventListener('popstate', render);

// Event binding helpers
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

function bindTemplateButtons() {
  document.querySelectorAll('[data-template]').forEach((button) => {
    button.addEventListener('click', () => {
      const template = button.getAttribute('data-template');
      if (!template || !['classic', 'modern', 'minimal'].includes(template)) {
        return;
      }

      selectedTemplate = template;
      writeTemplate(template);
      render();
    });
  });
}

// Builder page
function renderBuilder() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const isShipped = checkShippedStatus(steps, checklist, submission);
  const ats = computeAtsScore(resumeData);

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar(isShipped)}
      <section class="context-header">
        <h1>Builder Workspace</h1>
        <p>Structure resume content on the left while keeping a live layout shell visible on the right.</p>
        ${renderTemplateSwitcher(selectedTemplate)}
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          <article class="card">
            <h2>Personal Info</h2>
            <div class="form-stack">
              <input data-field="personal.name" type="text" placeholder="Full Name" value="${inputValue(resumeData.personal.name)}" />
              <input data-field="personal.email" type="email" placeholder="Email" value="${inputValue(resumeData.personal.email)}" />
              <input data-field="personal.phone" type="text" placeholder="Phone" value="${inputValue(resumeData.personal.phone)}" />
              <input data-field="personal.location" type="text" placeholder="Location" value="${inputValue(resumeData.personal.location)}" />
            </div>
          </article>

          <article class="card">
            <h2>Summary</h2>
            <div class="form-stack">
              <textarea data-field="summary" placeholder="Write your summary...">${inputValue(resumeData.summary)}</textarea>
            </div>
          </article>

          <article class="card">
            <h2>Education</h2>
            <div class="entry-stack" id="education-stack">
              ${resumeData.education
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
              ${resumeData.experience
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
              ${resumeData.projects
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
            <input data-field="skills" type="text" placeholder="Comma separated skills" value="${inputValue(resumeData.skills)}" />
          </article>

          <article class="card">
            <h2>Links</h2>
            <div class="form-stack">
              <input data-field="links.github" type="text" placeholder="GitHub" value="${inputValue(resumeData.links.github)}" />
              <input data-field="links.linkedin" type="text" placeholder="LinkedIn" value="${inputValue(resumeData.links.linkedin)}" />
            </div>
          </article>

          <article class="card">
            <div class="actions-row">
              <button class="btn btn--secondary" type="button" data-sample>Load Sample Data</button>
            </div>
          </article>
        </section>

        <aside class="secondary-panel">
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
          <div class="panel-block">
            <h3>Live Preview</h3>
            <p>Real-time resume preview with selected template.</p>
          </div>
          ${renderBuilderPreviewCard(resumeData, selectedTemplate)}
        </aside>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
  bindTemplateButtons();

  // Form input handlers
  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const target = event.target;
      const path = target.getAttribute('data-field');
      if (!path) {
        return;
      }

      const segments = path.split('.');

      if (segments.length === 1) {
        resumeData[segments[0]] = target.value;
      } else if (segments.length === 2) {
        resumeData[segments[0]][segments[1]] = target.value;
      } else if (segments.length === 3) {
        const index = Number(segments[1]);
        resumeData[segments[0]][index][segments[2]] = target.value;
      }

      writeResumeData(resumeData);
      renderBuilder();
    });
  });

  // Add entry buttons
  document.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-add');
      if (target === 'education') {
        resumeData.education.push({ school: '', degree: '', year: '' });
      }
      if (target === 'experience') {
        resumeData.experience.push({ role: '', company: '', duration: '', bullets: '' });
      }
      if (target === 'projects') {
        resumeData.projects.push({ title: '', bullets: '', stack: '' });
      }
      writeResumeData(resumeData);
      renderBuilder();
    });
  });

  // Sample data button
  document.querySelector('[data-sample]')?.addEventListener('click', () => {
    resumeData.personal = {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@email.com',
      phone: '+91-90000-00000',
      location: 'Bengaluru, India',
    };
    resumeData.summary = 'Entry-level software engineer focused on frontend systems and practical product delivery.';
    resumeData.education = [{ school: 'ABC Institute of Technology', degree: 'B.Tech Computer Science', year: '2026' }];
    resumeData.experience = [
      {
        role: 'Frontend Intern',
        company: 'Nova Labs',
        duration: 'Jan 2025 - Jun 2025',
        bullets: 'Built reusable UI modules that improved component consistency by 40%.\nOptimized dashboard rendering and reduced initial load time by 28%.',
      },
    ];
    resumeData.projects = [
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
    resumeData.skills = 'JavaScript, React, TypeScript, CSS, HTML, Git, Node.js, PostgreSQL';
    resumeData.links = {
      github: 'https://github.com/aaravsharma',
      linkedin: 'https://linkedin.com/in/aaravsharma',
    };
    writeResumeData(resumeData);
    renderBuilder();
  });
}

// Preview page
function renderPreview() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const isShipped = checkShippedStatus(steps, checklist, submission);
  const sections = [];
  const summaryText = sanitizeString(resumeData.summary).trim();
  if (summaryText) {
    sections.push(`<section><h3>Summary</h3><p>${summaryText}</p></section>`);
  }

  const educationRows = resumeData.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    sections.push(`<section><h3>Education</h3><ul>${educationRows
      .map((item) => `<li>${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}</li>`)
      .join('')}</ul></section>`);
  }

  const experienceRows = resumeData.experience.filter(
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

  const projectRows = resumeData.projects.filter(
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

  const skills = parseSkills(resumeData.skills);
  if (skills.length > 0) {
    sections.push(`<section><h3>Skills</h3><p>${skills.join(', ')}</p></section>`);
  }

  if (hasContent(resumeData.links.github) || hasContent(resumeData.links.linkedin)) {
    sections.push(`<section><h3>Links</h3><p>${resumeData.links.github || ''}${
      resumeData.links.github && resumeData.links.linkedin ? ' • ' : ''
    }${resumeData.links.linkedin || ''}</p></section>`);
  }

  const warnings = checkResumeCompleteness(resumeData);

  app.innerHTML = `
    <div class="app-shell app-shell--preview">
      ${renderTopBar(isShipped)}
      <section class="context-header context-header--preview">
        <h1>Preview</h1>
        <p>Minimal resume layout with typography-first structure.</p>
        ${renderTemplateSwitcher(selectedTemplate)}
      </section>
      <main class="preview-page">
        ${warnings.length > 0 ? `<div class="export-warning">Your resume may look incomplete: ${warnings.join(' ')}</div>` : ''}
        <div class="export-actions">
          <button class="btn btn--primary" type="button" data-export="print">Print / Save as PDF</button>
          <button class="btn btn--secondary" type="button" data-export="text">Copy Resume as Text</button>
        </div>
        <article class="preview-document template-${selectedTemplate}">
          <header>
            <h2>${resumeData.personal.name || 'Your Name'}</h2>
            <p>${resumeData.personal.email || 'email@example.com'} • ${resumeData.personal.phone || 'Phone'} • ${resumeData.personal.location || 'Location'}</p>
          </header>
          ${sections.length > 0 ? sections.join('') : '<p class="preview-empty">No content added yet. Return to Builder to start drafting.</p>'}
        </article>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindRouteButtons();
  bindTemplateButtons();

  // Export handlers
  document.querySelectorAll('[data-export]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-export');
      if (action === 'print') {
        window.print();
      } else if (action === 'text') {
        const plainText = generatePlainTextResume(resumeData);
        navigator.clipboard.writeText(plainText).then(() => {
          alert('Resume copied to clipboard!');
        }).catch(() => {
          alert('Failed to copy. Please try again.');
        });
      }
    });
  });
}

// Proof page handler
function handleProofPage() {
  const isShipped = checkShippedStatus(steps, checklist, submission);
  renderProof(isShipped, steps, checklist, submission);
  
  bindRouteButtons();

  // Checklist handlers
  document.querySelectorAll('[data-test]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const testId = Number(event.target.getAttribute('data-test'));
      const test = checklist.find((t) => t.id === testId);
      if (test) {
        test.passed = event.target.checked;
        writeChecklist(checklist);
        handleProofPage();
      }
    });
  });

  // Submission input handlers
  document.querySelectorAll('[data-submission]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const field = event.target.getAttribute('data-submission');
      submission[field] = event.target.value;
      writeSubmission(submission);
      handleProofPage();
    });
  });

  // Final submission export
  document.querySelector('[data-export-submission]')?.addEventListener('click', () => {
    const text = generateFinalSubmission(submission);
    navigator.clipboard.writeText(text).then(() => {
      alert('Final submission copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please try again.');
    });
  });
}

// Not found page
function renderNotFound() {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const isShipped = checkShippedStatus(steps, checklist, submission);

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar(isShipped)}
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

// Main render function
function render() {
  const path = window.location.pathname;

  if (!ROUTES.includes(path)) {
    renderNotFound();
    return;
  }

  if (path === '/') {
    const isShipped = checkShippedStatus(steps, checklist, submission);
    renderHome(isShipped);
    bindRouteButtons();
    bindTemplateButtons();
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

  if (path === '/proof') {
    handleProofPage();
    return;
  }
}

// Initialize app
render();
