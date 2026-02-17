// Page Renderers
function renderTopBar(isShipped) {
  const statusText = isShipped ? 'Shipped' : 'In Progress';
  const statusClass = isShipped ? 'status-badge--shipped' : '';
  
  return `
    <header class="top-bar" role="banner" aria-label="AI Resume Builder top bar">
      <div class="top-bar__project">AI Resume Builder</div>
      <nav class="top-nav" aria-label="Primary navigation">
        <button class="top-nav__link" type="button" data-route="/builder">Builder</button>
        <button class="top-nav__link" type="button" data-route="/preview">Preview</button>
        <button class="top-nav__link" type="button" data-route="/proof">Proof</button>
      </nav>
      <div class="status-badge ${statusClass}" aria-label="Status badge">${statusText}</div>
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

function renderTemplateSwitcher(selectedTemplate) {
  const TEMPLATES = ['classic', 'modern', 'minimal'];
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

function renderBuilderPreviewCard(resumeData, selectedTemplate) {
  const sections = [];
  const summaryText = sanitizeString(resumeData.summary).trim();
  if (summaryText) {
    sections.push(`<section><h4>Summary</h4><p>${summaryText}</p></section>`);
  }

  const educationRows = resumeData.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    sections.push(`<section><h4>Education</h4><ul>${educationRows
      .map((item) => `<li>${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}</li>`)
      .join('')}</ul></section>`);
  }

  const experienceRows = resumeData.experience.filter(
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

  const projectRows = resumeData.projects.filter(
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

  const skills = parseSkills(resumeData.skills);
  if (skills.length > 0) {
    sections.push(`<section><h4>Skills</h4><p>${skills.join(', ')}</p></section>`);
  }

  if (hasContent(resumeData.links.github) || hasContent(resumeData.links.linkedin)) {
    sections.push(`<section><h4>Links</h4><p>${resumeData.links.github || ''}${
      resumeData.links.github && resumeData.links.linkedin ? ' • ' : ''
    }${resumeData.links.linkedin || ''}</p></section>`);
  }

  return `
    <div class="resume-preview-shell template-${selectedTemplate}">
      <header class="resume-preview-header">
        <h3>${resumeData.personal.name || 'Your Name'}</h3>
        <p>${resumeData.personal.email || 'email@example.com'} • ${resumeData.personal.phone || 'Phone'} • ${resumeData.personal.location || 'Location'}</p>
      </header>
      ${sections.length > 0 ? sections.join('') : '<p class="preview-empty">Add content to view sectioned resume preview.</p>'}
    </div>
  `;
}

function renderHome(isShipped) {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar(isShipped)}
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
}

function renderProof(isShipped, steps, checklist, submission) {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const allStepsCompleted = steps.every((step) => step.completed);
  const allTestsPassed = checklist.every((test) => test.passed);
  const allLinksValid =
    isValidUrl(submission.lovableLink) &&
    isValidUrl(submission.githubLink) &&
    isValidUrl(submission.deployedLink);

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopBar(isShipped)}
      <section class="context-header">
        <h1>Proof & Submission</h1>
        <p>Final validation and artifact collection for project completion.</p>
      </section>
      <main class="workspace">
        <section class="primary-workspace">
          ${isShipped ? `
            <div class="message message--success">
              <strong>Project 3 Shipped Successfully.</strong>
              <p>All requirements met. Submission exported and ready.</p>
            </div>
          ` : ''}

          <article class="card">
            <h2>Step Completion Overview</h2>
            <div class="step-overview">
              ${steps.map((step) => `
                <div class="step-overview-row">
                  <span class="step-overview-icon">${step.completed ? '✓' : '○'}</span>
                  <span class="step-overview-label">${step.label}</span>
                </div>
              `).join('')}
            </div>
            <p class="step-overview-status">
              ${allStepsCompleted ? '✓ All steps completed' : `${steps.filter(s => s.completed).length} / ${steps.length} steps completed`}
            </p>
          </article>

          <article class="card">
            <h2>Test Checklist</h2>
            <div class="checklist-grid">
              ${checklist.map((test) => `
                <label class="checklist-item">
                  <input type="checkbox" data-test="${test.id}" ${test.passed ? 'checked' : ''} />
                  <span>${test.label}</span>
                </label>
              `).join('')}
            </div>
            <p class="checklist-status">
              ${allTestsPassed ? '✓ All tests passed' : `${checklist.filter(t => t.passed).length} / ${checklist.length} tests passed`}
            </p>
          </article>

          <article class="card">
            <h2>Artifact Collection</h2>
            <p class="card-hint">All three links required to mark project as shipped.</p>
            <div class="form-stack">
              <div>
                <label>Lovable Project Link</label>
                <input 
                  type="url" 
                  data-submission="lovableLink" 
                  placeholder="https://lovable.dev/projects/..." 
                  value="${inputValue(submission.lovableLink)}"
                  class="${submission.lovableLink && !isValidUrl(submission.lovableLink) ? 'input--error' : ''}"
                />
                ${submission.lovableLink && !isValidUrl(submission.lovableLink) ? '<p class="input-error">Invalid URL format</p>' : ''}
              </div>
              <div>
                <label>GitHub Repository Link</label>
                <input 
                  type="url" 
                  data-submission="githubLink" 
                  placeholder="https://github.com/..." 
                  value="${inputValue(submission.githubLink)}"
                  class="${submission.githubLink && !isValidUrl(submission.githubLink) ? 'input--error' : ''}"
                />
                ${submission.githubLink && !isValidUrl(submission.githubLink) ? '<p class="input-error">Invalid URL format</p>' : ''}
              </div>
              <div>
                <label>Deployed URL</label>
                <input 
                  type="url" 
                  data-submission="deployedLink" 
                  placeholder="https://..." 
                  value="${inputValue(submission.deployedLink)}"
                  class="${submission.deployedLink && !isValidUrl(submission.deployedLink) ? 'input--error' : ''}"
                />
                ${submission.deployedLink && !isValidUrl(submission.deployedLink) ? '<p class="input-error">Invalid URL format</p>' : ''}
              </div>
            </div>
            <p class="artifact-status">
              ${allLinksValid ? '✓ All links provided and valid' : 'Complete all artifact links to enable shipping'}
            </p>
          </article>

          <article class="card">
            <h2>Final Submission</h2>
            <div class="actions-row">
              <button class="btn btn--primary" type="button" data-export-submission ${!isShipped ? 'disabled' : ''}>
                Copy Final Submission
              </button>
            </div>
            ${!isShipped ? '<p class="card-hint">Complete all requirements above to enable export.</p>' : ''}
          </article>
        </section>

        <aside class="secondary-panel">
          <div class="panel-block">
            <h3>Shipping Requirements</h3>
            <ul class="requirement-list">
              <li class="${allStepsCompleted ? 'requirement--met' : ''}">
                ${allStepsCompleted ? '✓' : '○'} All 8 steps completed
              </li>
              <li class="${allTestsPassed ? 'requirement--met' : ''}">
                ${allTestsPassed ? '✓' : '○'} All 10 tests passed
              </li>
              <li class="${allLinksValid ? 'requirement--met' : ''}">
                ${allLinksValid ? '✓' : '○'} All 3 proof links provided
              </li>
            </ul>
          </div>
        </aside>
      </main>
      ${renderFooter()}
    </div>
  `;
}
