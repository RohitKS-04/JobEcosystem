import type {
  AnalyzeInput,
  AnalysisResult,
  CompanyIntel,
  CompanySizeCategory,
  DayPlan,
  ExtractedSkills,
  RoundMappingStep,
  RoundChecklist,
  SkillCategory,
  SkillConfidenceMap,
} from '../types/analysis';

type SkillDefinition = {
  label: string;
  patterns: RegExp[];
};

const CATEGORY_MAP: Record<Exclude<SkillCategory, 'General'>, SkillDefinition[]> = {
  'Core CS': [
    { label: 'DSA', patterns: [/\bdsa\b/i, /data\s*structures?/i, /algorithms?/i] },
    { label: 'OOP', patterns: [/\boop\b/i, /object\s*oriented/i] },
    { label: 'DBMS', patterns: [/\bdbms\b/i, /database\s*management/i] },
    { label: 'OS', patterns: [/\bos\b/i, /operating\s*systems?/i] },
    { label: 'Networks', patterns: [/\bnetworks?\b/i, /computer\s*networks?/i] },
  ],
  Languages: [
    { label: 'Java', patterns: [/\bjava\b/i] },
    { label: 'Python', patterns: [/\bpython\b/i] },
    { label: 'JavaScript', patterns: [/\bjavascript\b/i] },
    { label: 'TypeScript', patterns: [/\btypescript\b/i] },
    { label: 'C', patterns: [/(^|[^+#\w])c([^+#\w]|$)/i] },
    { label: 'C++', patterns: [/\bc\+\+\b/i] },
    { label: 'C#', patterns: [/\bc#\b/i] },
    { label: 'Go', patterns: [/\bgo\b/i, /\bgolang\b/i] },
  ],
  Web: [
    { label: 'React', patterns: [/\breact\b/i] },
    { label: 'Next.js', patterns: [/\bnext\.?js\b/i] },
    { label: 'Node.js', patterns: [/\bnode\.?js\b/i] },
    { label: 'Express', patterns: [/\bexpress\b/i, /express\.?js/i] },
    { label: 'REST', patterns: [/\brest\b/i, /restful/i] },
    { label: 'GraphQL', patterns: [/\bgraphql\b/i] },
  ],
  Data: [
    { label: 'SQL', patterns: [/\bsql\b/i] },
    { label: 'MongoDB', patterns: [/\bmongodb\b/i, /mongo\s*db/i] },
    { label: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
    { label: 'MySQL', patterns: [/\bmysql\b/i] },
    { label: 'Redis', patterns: [/\bredis\b/i] },
  ],
  'Cloud/DevOps': [
    { label: 'AWS', patterns: [/\baws\b/i, /amazon\s*web\s*services/i] },
    { label: 'Azure', patterns: [/\bazure\b/i] },
    { label: 'GCP', patterns: [/\bgcp\b/i, /google\s*cloud/i] },
    { label: 'Docker', patterns: [/\bdocker\b/i] },
    { label: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { label: 'CI/CD', patterns: [/\bci\/?cd\b/i, /continuous\s*integration/i] },
    { label: 'Linux', patterns: [/\blinux\b/i] },
  ],
  Testing: [
    { label: 'Selenium', patterns: [/\bselenium\b/i] },
    { label: 'Cypress', patterns: [/\bcypress\b/i] },
    { label: 'Playwright', patterns: [/\bplaywright\b/i] },
    { label: 'JUnit', patterns: [/\bjunit\b/i] },
    { label: 'PyTest', patterns: [/\bpytest\b/i, /py\s*test/i] },
  ],
};

function matchSkill(text: string, skill: SkillDefinition): boolean {
  return skill.patterns.some((pattern) => pattern.test(text));
}

export function extractSkills(jdText: string): ExtractedSkills {
  const skills: ExtractedSkills = {
    'Core CS': [],
    Languages: [],
    Web: [],
    Data: [],
    'Cloud/DevOps': [],
    Testing: [],
    General: [],
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  };

  const source = jdText || '';

  (Object.keys(CATEGORY_MAP) as Array<Exclude<SkillCategory, 'General'>>).forEach((category) => {
    const matched = CATEGORY_MAP[category]
      .filter((skill) => matchSkill(source, skill))
      .map((skill) => skill.label);

    skills[category] = matched;
  });

  skills.coreCS = skills['Core CS'];
  skills.languages = skills.Languages;
  skills.web = skills.Web;
  skills.data = skills.Data;
  skills.cloud = skills['Cloud/DevOps'];
  skills.testing = skills.Testing;

  const detectedCount =
    skills.coreCS.length +
    skills.languages.length +
    skills.web.length +
    skills.data.length +
    skills.cloud.length +
    skills.testing.length;

  if (detectedCount === 0) {
    const fallback = ['Communication', 'Problem solving', 'Basic coding', 'Projects'];
    skills.General = fallback;
    skills.other = fallback;
  }

  if (skills.other.length === 0) {
    skills.other = skills.General;
  }

  return skills;
}

function includesAny(skills: ExtractedSkills, labels: string[]) {
  return labels.some((label) => Object.values(skills).some((list) => list.includes(label)));
}

function hasNoDetectedSkills(skills: ExtractedSkills) {
  return (
    skills.coreCS.length === 0 &&
    skills.languages.length === 0 &&
    skills.web.length === 0 &&
    skills.data.length === 0 &&
    skills.cloud.length === 0 &&
    skills.testing.length === 0
  );
}

function generateChecklist(skills: ExtractedSkills): RoundChecklist[] {
  const hasWeb = skills.Web.length > 0;
  const hasData = skills.Data.length > 0;
  const hasCloud = skills['Cloud/DevOps'].length > 0;
  const hasTesting = skills.Testing.length > 0;
  const hasCore = skills['Core CS'].length > 0;

  const round1 = [
    'Practice percentages, probability, and time-work aptitude sets.',
    'Revise language fundamentals and OOP basics from your primary language.',
    'Solve 2 quick coding warmups under time constraints.',
    'Review resume summary and project elevator pitch.',
    'Prepare quick answers for strengths, weaknesses, and role fit.',
  ];

  if (hasCore) {
    round1.push('Revise key CS definitions: DBMS normalization, OS process/thread, and networking layers.');
  }

  if (hasNoDetectedSkills(skills)) {
    round1.push('Practice communication and project storytelling with concise examples.');
  }

  const round2 = [
    'Solve array, string, and binary search problems with dry-run explanations.',
    'Practice two medium DSA problems with optimal complexity justification.',
    'Revise recursion vs iteration trade-offs and edge cases.',
    'Review DBMS indexing, transactions, and ACID properties.',
    'Revise OS scheduling and deadlock basics with examples.',
  ];

  if (!includesAny(skills, ['DSA'])) {
    round2.push('Start with beginner-level DSA patterns: two pointers, hashing, and prefix sums.');
  }

  const round3 = [
    'Map your strongest project to business problem, architecture, and outcomes.',
    'Prepare STAR-format answers for implementation challenges and fixes.',
    'Explain API design decisions and data flow in your project.',
    'Practice discussing performance improvements and measurable impact.',
    'Align resume bullet points with role keywords from the JD.',
  ];

  if (hasWeb) {
    round3.push('Revise frontend/backend stack decisions (React/Node/REST) and deployment workflow.');
  }
  if (hasData) {
    round3.push('Prepare SQL schema/indexing rationale and query optimization examples.');
  }
  if (hasCloud) {
    round3.push('Revise deployment basics, containers, and CI/CD pipeline explanation.');
  }
  if (hasTesting) {
    round3.push('Showcase test strategy, tooling choice, and automation coverage examples.');
  }

  if (hasNoDetectedSkills(skills)) {
    round3.push('Prepare one project walkthrough showing problem statement, approach, and results.');
  }

  const round4 = [
    'Prepare concise career narrative: background, goals, and why this company.',
    'Draft answers for conflict resolution and teamwork situations.',
    'Prepare salary expectation range with rationale.',
    'List 3 thoughtful questions for interviewer about role and growth.',
    'Practice availability, relocation, and joining timeline response.',
  ];

  return [
    {
      round: 'Round 1: Aptitude / Basics',
      roundTitle: 'Round 1: Aptitude / Basics',
      items: round1.slice(0, 8),
    },
    {
      round: 'Round 2: DSA + Core CS',
      roundTitle: 'Round 2: DSA + Core CS',
      items: round2.slice(0, 8),
    },
    {
      round: 'Round 3: Tech interview (projects + stack)',
      roundTitle: 'Round 3: Tech interview (projects + stack)',
      items: round3.slice(0, 8),
    },
    {
      round: 'Round 4: Managerial / HR',
      roundTitle: 'Round 4: Managerial / HR',
      items: round4.slice(0, 8),
    },
  ];
}

function generatePlan(skills: ExtractedSkills): DayPlan[] {
  const notes: string[] = [];
  if (includesAny(skills, ['React', 'Next.js'])) {
    notes.push('frontend revision');
  }
  if (includesAny(skills, ['Node.js', 'Express', 'REST', 'GraphQL'])) {
    notes.push('API/backend revision');
  }
  if (skills.Data.length > 0) {
    notes.push('SQL/data-model revision');
  }
  if (skills['Cloud/DevOps'].length > 0) {
    notes.push('deployment/devops revision');
  }

  const adaptiveTail = notes.length > 0 ? ` Include ${notes.join(', ')}.` : '';

  const day5Tasks = ['Align resume bullets with measurable impact', 'Update project highlights for interviews'];
  if (hasNoDetectedSkills(skills)) {
    day5Tasks.push('Draft project story focused on communication and problem solving');
  }

  return [
    {
      day: 'Day 1',
      focus: 'Basics + core CS: OS, DBMS, networks fundamentals with short notes.',
      tasks: ['Revise fundamentals chapter-wise', 'Create one-page cheat sheet'],
    },
    {
      day: 'Day 2',
      focus: 'Basics + core CS revision with aptitude speed drills and concept quizzes.',
      tasks: ['Attempt aptitude set', 'Review mistakes and retry'],
    },
    {
      day: 'Day 3',
      focus: 'DSA + coding practice: arrays, strings, sorting, and complexity analysis.',
      tasks: ['Solve 3 focused coding questions', 'Document brute-force vs optimized approach'],
    },
    {
      day: 'Day 4',
      focus: 'DSA + coding practice: medium problems and mock coding under timer.',
      tasks: ['Run one timed mock', 'Review edge-case handling'],
    },
    {
      day: 'Day 5',
      focus: `Project + resume alignment to JD keywords and impact metrics.${adaptiveTail}`,
      tasks: day5Tasks,
    },
    {
      day: 'Day 6',
      focus: 'Mock interview questions: technical + behavioral with recorded self-review.',
      tasks: ['Practice 10 interview questions', 'Record and refine delivery'],
    },
    {
      day: 'Day 7',
      focus: 'Revision + weak areas: patch gaps found in mocks and finalize interview kit.',
      tasks: ['Revisit weakest topics', 'Prepare final revision sheet'],
    },
  ];
}

function addQuestionIfSkillPresent(
  questions: string[],
  skills: ExtractedSkills,
  skill: string,
  question: string,
) {
  if (includesAny(skills, [skill])) {
    questions.push(question);
  }
}

function generateQuestions(skills: ExtractedSkills): string[] {
  const questions: string[] = [];

  addQuestionIfSkillPresent(questions, skills, 'SQL', 'Explain indexing in SQL and when it improves query performance.');
  addQuestionIfSkillPresent(questions, skills, 'React', 'Explain state management options in React and when you choose each.');
  addQuestionIfSkillPresent(questions, skills, 'DSA', 'How would you optimize search in sorted data and justify complexity?');
  addQuestionIfSkillPresent(questions, skills, 'Node.js', 'How does Node.js handle concurrent requests with the event loop?');
  addQuestionIfSkillPresent(questions, skills, 'GraphQL', 'What are GraphQL resolver performance pitfalls and how do you mitigate N+1?');
  addQuestionIfSkillPresent(questions, skills, 'Docker', 'How would you containerize an app and optimize image size for deployment?');
  addQuestionIfSkillPresent(questions, skills, 'Kubernetes', 'How do readiness and liveness probes differ in Kubernetes?');
  addQuestionIfSkillPresent(questions, skills, 'MongoDB', 'When would you model data with embedding vs referencing in MongoDB?');
  addQuestionIfSkillPresent(questions, skills, 'REST', 'How do you design idempotent REST endpoints for update operations?');
  addQuestionIfSkillPresent(questions, skills, 'TypeScript', 'How do union types and type narrowing improve API safety in TypeScript?');

  if (skills['Cloud/DevOps'].length > 0) {
    questions.push('Design a deployment pipeline with rollback strategy for a production release.');
  }

  if (skills.Testing.length > 0) {
    questions.push('How would you structure unit, integration, and e2e tests in a new project?');
  }

  if (skills['Core CS'].length > 0) {
    questions.push('Design a scalable notification service for interview reminders and discuss bottlenecks.');
  }

  const fallback = [
    'Walk through your strongest project architecture and one trade-off you accepted.',
    'How do you debug a production issue that you cannot reproduce locally?',
    'How do you prioritize tasks when multiple deadlines conflict?',
    'Describe one optimization you made that measurably improved performance.',
    'How do you validate code quality before raising a pull request?',
    'How do you explain a technical concept to a non-technical stakeholder?',
    'Which weak area are you currently improving and what is your plan?',
    'How would you break down an unfamiliar problem during an interview?',
    'How do you make your resume bullets evidence-based?',
    'What questions would you ask before implementing a new feature?',
  ];

  if (hasNoDetectedSkills(skills)) {
    questions.unshift(
      'How do you communicate project trade-offs to technical and non-technical stakeholders?',
      'Describe a problem-solving approach you used in a recent academic or project scenario.',
    );
  }

  for (const item of fallback) {
    if (questions.length >= 10) {
      break;
    }
    if (!questions.includes(item)) {
      questions.push(item);
    }
  }

  return questions.slice(0, 10);
}

const ENTERPRISE_COMPANIES = ['amazon', 'infosys', 'tcs', 'wipro', 'accenture', 'google', 'microsoft', 'ibm'];
const MID_SIZE_COMPANIES = ['zoho', 'freshworks', 'razorpay', 'postman', 'thoughtworks'];

function inferIndustry(companyName: string, jdText: string): string {
  const source = `${companyName} ${jdText}`.toLowerCase();

  if (source.includes('bank') || source.includes('fintech') || source.includes('payment')) {
    return 'Financial Technology';
  }
  if (source.includes('health') || source.includes('hospital') || source.includes('med')) {
    return 'Healthcare Technology';
  }
  if (source.includes('retail') || source.includes('commerce') || source.includes('e-commerce')) {
    return 'E-commerce';
  }
  if (source.includes('data') || source.includes('ai') || source.includes('analytics')) {
    return 'Data & AI Platforms';
  }

  return 'Technology Services';
}

function inferSizeCategory(companyName: string): CompanySizeCategory {
  const normalized = companyName.trim().toLowerCase();
  if (!normalized) {
    return 'Startup';
  }

  if (ENTERPRISE_COMPANIES.some((name) => normalized.includes(name))) {
    return 'Enterprise';
  }

  if (MID_SIZE_COMPANIES.some((name) => normalized.includes(name))) {
    return 'Mid-size';
  }

  return 'Startup';
}

export function inferCompanyIntel(companyName: string, jdText: string): CompanyIntel | null {
  if (companyName.trim().length === 0) {
    return null;
  }

  const sizeCategory = inferSizeCategory(companyName);
  let typicalHiringFocus = 'Balanced fundamentals with project depth and practical execution.';

  if (sizeCategory === 'Enterprise') {
    typicalHiringFocus = 'Structured DSA + core fundamentals with strong round-by-round consistency.';
  } else if (sizeCategory === 'Startup') {
    typicalHiringFocus = 'Practical problem solving + stack depth with ownership in implementation.';
  }

  return {
    companyName: companyName.trim(),
    industry: inferIndustry(companyName, jdText),
    sizeCategory,
    typicalHiringFocus,
    note: 'Demo Mode: Company intel generated heuristically.',
  };
}

export function generateRoundMapping(skills: ExtractedSkills, companyIntel: CompanyIntel | null): RoundMappingStep[] {
  const size = companyIntel?.sizeCategory ?? 'Startup';
  const hasDsa = skills['Core CS'].includes('DSA');
  const hasWebStack = skills.Web.some((item) => ['React', 'Node.js', 'Express', 'REST', 'GraphQL'].includes(item));

  if (size === 'Enterprise') {
    return [
      {
        round: 'Round 1',
        roundTitle: 'Round 1: Online Test',
        focusAreas: hasDsa ? ['DSA', 'Aptitude'] : ['Aptitude', 'Coding basics'],
        title: hasDsa ? 'Online Test (DSA + Aptitude)' : 'Online Test (Aptitude + Basics)',
        focus: hasDsa ? 'Timed coding questions plus aptitude sections.' : 'Aptitude and foundational coding assessment.',
        whyItMatters: 'This filters candidates on speed, correctness, and structured thinking.',
      },
      {
        round: 'Round 2',
        roundTitle: 'Round 2: Technical',
        focusAreas: hasDsa ? ['DSA', 'Core CS'] : ['Core fundamentals'],
        title: hasDsa ? 'Technical (DSA + Core CS)' : 'Technical (Core Fundamentals)',
        focus: 'Deep checks on problem-solving, DBMS, OS, and networking basics.',
        whyItMatters: 'Interviewers validate conceptual depth before project-level discussion.',
      },
      {
        round: 'Round 3',
        roundTitle: 'Round 3: Tech + Projects',
        focusAreas: ['Projects', 'System thinking'],
        title: 'Tech + Projects',
        focus: 'Project architecture, trade-offs, and real implementation decisions.',
        whyItMatters: 'Demonstrates execution maturity beyond theoretical knowledge.',
      },
      {
        round: 'Round 4',
        roundTitle: 'Round 4: HR',
        focusAreas: ['Communication', 'Role fit'],
        title: 'HR',
        focus: 'Communication, motivation, role fit, and joining readiness.',
        whyItMatters: 'Ensures long-term fit with team expectations and company culture.',
      },
    ];
  }

  if (size === 'Startup') {
    return [
      {
        round: 'Round 1',
        roundTitle: 'Round 1: Practical coding',
        focusAreas: hasWebStack ? ['Practical coding', 'Stack implementation'] : ['Problem solving'],
        title: hasWebStack ? 'Practical coding' : 'Practical problem solving',
        focus: hasWebStack ? 'Hands-on feature or debugging task with your stack.' : 'Live coding around real product constraints.',
        whyItMatters: 'Startups prioritize shipping ability and fast decision making.',
      },
      {
        round: 'Round 2',
        roundTitle: 'Round 2: System discussion',
        focusAreas: hasWebStack ? ['Architecture', 'API design'] : ['System design'],
        title: 'System discussion',
        focus: hasWebStack ? 'Design API/component flows and discuss scaling trade-offs.' : 'Discuss architecture choices and maintainability.',
        whyItMatters: 'Shows ownership mindset and ability to reason through ambiguity.',
      },
      {
        round: 'Round 3',
        roundTitle: 'Round 3: Culture fit',
        focusAreas: ['Ownership', 'Team collaboration'],
        title: 'Culture fit',
        focus: 'Collaboration style, accountability, and startup adaptability.',
        whyItMatters: 'Small teams need people who align quickly and execute independently.',
      },
    ];
  }

  return [
    {
      round: 'Round 1',
      roundTitle: 'Round 1: Screening',
      focusAreas: ['Aptitude', 'Coding'],
      title: 'Screening (Aptitude + Coding)',
      focus: 'Initial benchmark of problem solving and coding clarity.',
      whyItMatters: 'Creates a baseline before deeper technical rounds.',
    },
    {
      round: 'Round 2',
      roundTitle: 'Round 2: Technical Depth',
      focusAreas: ['Core CS', 'Role stack'],
      title: 'Technical Depth',
      focus: 'Core CS concepts plus role-related stack evaluation.',
      whyItMatters: 'Verifies practical and conceptual balance expected in mid-size teams.',
    },
    {
      round: 'Round 3',
      roundTitle: 'Round 3: Managerial / HR',
      focusAreas: ['Communication', 'Ownership'],
      title: 'Managerial / HR',
      focus: 'Communication, ownership, and growth alignment.',
      whyItMatters: 'Confirms delivery reliability and long-term team compatibility.',
    },
  ];
}

export function calculateReadinessScore(input: AnalyzeInput, extractedSkills: ExtractedSkills): number {
  let score = 35;

  const categoryCount = (Object.keys(CATEGORY_MAP) as Array<Exclude<SkillCategory, 'General'>>).filter(
    (category) => extractedSkills[category].length > 0,
  ).length;

  score += Math.min(categoryCount * 5, 30);

  if (input.company.trim().length > 0) {
    score += 10;
  }
  if (input.role.trim().length > 0) {
    score += 10;
  }
  if (input.jdText.trim().length > 800) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function createDefaultSkillConfidenceMap(extractedSkills: ExtractedSkills): SkillConfidenceMap {
  const map: SkillConfidenceMap = {};

  Object.values(extractedSkills)
    .flat()
    .forEach((skill) => {
      map[skill] = 'practice';
    });

  return map;
}

export function calculateConfidenceAdjustedReadiness(baseScore: number, skillConfidenceMap: SkillConfidenceMap): number {
  let score = baseScore;

  Object.values(skillConfidenceMap).forEach((value) => {
    if (value === 'know') {
      score += 2;
      return;
    }

    score -= 2;
  });

  return Math.max(0, Math.min(100, score));
}

export function analyzeJobDescription(input: AnalyzeInput): AnalysisResult {
  const extractedSkills = extractSkills(input.jdText);
  const companyIntel = inferCompanyIntel(input.company, input.jdText);
  const roundMapping = generateRoundMapping(extractedSkills, companyIntel);
  const baseReadinessScore = calculateReadinessScore(input, extractedSkills);
  const skillConfidenceMap = createDefaultSkillConfidenceMap(extractedSkills);
  const readinessScore = calculateConfidenceAdjustedReadiness(baseReadinessScore, skillConfidenceMap);
  const plan = generatePlan(extractedSkills);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    company: input.company.trim(),
    role: input.role.trim(),
    jdText: input.jdText,
    extractedSkills,
    plan7Days: plan,
    plan,
    checklist: generateChecklist(extractedSkills),
    questions: generateQuestions(extractedSkills),
    baseScore: baseReadinessScore,
    baseReadinessScore,
    finalScore: readinessScore,
    readinessScore,
    skillConfidenceMap,
    companyIntel,
    roundMapping,
    updatedAt: now,
  };
}
