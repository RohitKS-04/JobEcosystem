// ATS Scoring Engine - Deterministic scoring logic
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

function sanitizeString(value) {
  return typeof value === 'string' ? value : '';
}

function hasContent(value) {
  return sanitizeString(value).trim().length > 0;
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

function hasActionVerbs(text) {
  const lowerText = sanitizeString(text).toLowerCase();
  return ACTION_VERBS.some((verb) => lowerText.includes(verb));
}

function hasNumericIndicator(text) {
  return /\d|%|\bx\b|\bk\b/i.test(sanitizeString(text));
}

function computeAtsScore(resumeData) {
  let score = 0;
  const suggestions = [];

  if (hasContent(resumeData.personal.name)) {
    score += 10;
  } else {
    suggestions.push('Add your name (+10 points)');
  }

  if (hasContent(resumeData.personal.email)) {
    score += 10;
  } else {
    suggestions.push('Add your email (+10 points)');
  }

  const summaryText = sanitizeString(resumeData.summary);
  if (summaryText.length > 50) {
    score += 10;
  } else {
    suggestions.push('Add a professional summary (+10 points)');
  }

  const experienceWithContent = resumeData.experience.filter(
    (item) => hasContent(item.role) && getBullets(item.bullets).length > 0,
  );
  if (experienceWithContent.length >= 1) {
    score += 15;
  } else {
    suggestions.push('Add at least 1 experience entry with bullets (+15 points)');
  }

  const educationComplete = resumeData.education.some(
    (item) => hasContent(item.school) && hasContent(item.degree),
  );
  if (educationComplete) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 education entry (+10 points)');
  }

  const skills = parseSkills(resumeData.skills);
  if (skills.length >= 5) {
    score += 10;
  } else {
    suggestions.push('Add at least 5 skills (+10 points)');
  }

  const projectsWithContent = resumeData.projects.filter(
    (item) => hasContent(item.title) || getBullets(item.bullets).length > 0,
  );
  if (projectsWithContent.length >= 1) {
    score += 10;
  } else {
    suggestions.push('Add at least 1 project (+10 points)');
  }

  if (hasContent(resumeData.personal.phone)) {
    score += 5;
  } else {
    suggestions.push('Add phone number (+5 points)');
  }

  if (hasContent(resumeData.links.linkedin)) {
    score += 5;
  } else {
    suggestions.push('Add LinkedIn URL (+5 points)');
  }

  if (hasContent(resumeData.links.github)) {
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
