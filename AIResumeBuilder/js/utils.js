// Utility Functions
function sanitizeString(value) {
  return typeof value === 'string' ? value : '';
}

function hasContent(value) {
  return sanitizeString(value).trim().length > 0;
}

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

function getBullets(multiline) {
  return sanitizeString(multiline)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function inputValue(path, fallback = '') {
  return path ?? fallback;
}

function checkResumeCompleteness(resumeData) {
  const warnings = [];

  if (!hasContent(resumeData.personal.name)) {
    warnings.push('Name is missing.');
  }

  const projectsWithContent = resumeData.projects.filter(
    (item) => hasContent(item.title) || hasContent(item.stack) || getBullets(item.bullets).length > 0,
  );
  const experienceWithContent = resumeData.experience.filter(
    (item) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0,
  );

  if (projectsWithContent.length === 0 && experienceWithContent.length === 0) {
    warnings.push('Add at least one project or experience entry.');
  }

  return warnings;
}

function generatePlainTextResume(resumeData) {
  const lines = [];

  lines.push(resumeData.personal.name || 'Your Name');
  lines.push('');

  const contactParts = [];
  if (hasContent(resumeData.personal.email)) {
    contactParts.push(resumeData.personal.email);
  }
  if (hasContent(resumeData.personal.phone)) {
    contactParts.push(resumeData.personal.phone);
  }
  if (hasContent(resumeData.personal.location)) {
    contactParts.push(resumeData.personal.location);
  }
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' • '));
    lines.push('');
  }

  if (hasContent(resumeData.summary)) {
    lines.push('SUMMARY');
    lines.push(resumeData.summary);
    lines.push('');
  }

  const educationRows = resumeData.education.filter(
    (item) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year),
  );
  if (educationRows.length > 0) {
    lines.push('EDUCATION');
    educationRows.forEach((item) => {
      lines.push(`${item.degree || 'Degree'} — ${item.school || 'Institution'} ${item.year ? `(${item.year})` : ''}`);
    });
    lines.push('');
  }

  const experienceRows = resumeData.experience.filter(
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

  const projectRows = resumeData.projects.filter(
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

  const skills = parseSkills(resumeData.skills);
  if (skills.length > 0) {
    lines.push('SKILLS');
    lines.push(skills.join(', '));
    lines.push('');
  }

  if (hasContent(resumeData.links.github) || hasContent(resumeData.links.linkedin)) {
    lines.push('LINKS');
    if (hasContent(resumeData.links.github)) {
      lines.push(resumeData.links.github);
    }
    if (hasContent(resumeData.links.linkedin)) {
      lines.push(resumeData.links.linkedin);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function checkShippedStatus(steps, checklist, submission) {
  const allStepsCompleted = steps.every((step) => step.completed);
  const allTestsPassed = checklist.every((test) => test.passed);
  const allLinksProvided =
    isValidUrl(submission.lovableLink) &&
    isValidUrl(submission.githubLink) &&
    isValidUrl(submission.deployedLink);

  return allStepsCompleted && allTestsPassed && allLinksProvided;
}

function generateFinalSubmission(submission) {
  return `------------------------------------------
AI Resume Builder — Final Submission

Lovable Project: ${submission.lovableLink || '[Not provided]'}
GitHub Repository: ${submission.githubLink || '[Not provided]'}
Live Deployment: ${submission.deployedLink || '[Not provided]'}

Core Capabilities:
- Structured resume builder
- Deterministic ATS scoring
- Template switching
- PDF export with clean formatting
- Persistence + validation checklist
------------------------------------------`;
}
