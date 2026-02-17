import type { Job, JobMode } from '../../../types';

const companies = [
  'Infosys',
  'TCS',
  'Wipro',
  'Accenture',
  'Capgemini',
  'Cognizant',
  'IBM',
  'Oracle',
  'SAP',
  'Dell',
  'Amazon',
  'Flipkart',
  'Swiggy',
  'Razorpay',
  'PhonePe',
  'Paytm',
  'Zoho',
  'Freshworks',
  'Juspay',
  'CRED',
  'ByteForge Labs',
  'NimbusStack',
  'ScaleOrbit',
  'PixelMint Technologies',
  'CodeHarbor',
  'SprintLeaf',
  'DataNook',
  'Kiteframe AI',
  'CloudYatra',
  'StackPulse',
] as const;

const roles = [
  'SDE Intern',
  'Graduate Engineer Trainee',
  'Junior Backend Developer',
  'Frontend Intern',
  'QA Intern',
  'Data Analyst Intern',
  'Java Developer (0-1)',
  'Python Developer (Fresher)',
  'React Developer (1-3)',
  'Associate Software Engineer',
  'Backend Engineer (1-3)',
  'Quality Engineer (0-1)',
] as const;

const locations = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Gurugram',
  'Noida',
  'Mumbai',
  'Delhi',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
  'Coimbatore',
] as const;

const modes: JobMode[] = ['Remote', 'Hybrid', 'Onsite'];
const experiences: Job['experience'][] = ['Fresher', '0-1', '1-3', '3-5'];
const sources: Job['source'][] = ['LinkedIn', 'Naukri', 'Indeed'];
const salaryRanges: Job['salaryRange'][] = ['3–5 LPA', '6–10 LPA', '10–18 LPA', '₹15k–₹40k/month Internship'];

function slugifyCompany(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function skillSetForRole(role: string): string[] {
  if (role.includes('Frontend') || role.includes('React')) {
    return ['React', 'TypeScript', 'HTML', 'CSS', 'REST APIs'];
  }

  if (role.includes('Backend') || role.includes('Java') || role.includes('Python')) {
    return ['Node.js', 'Java', 'Python', 'SQL', 'Microservices'];
  }

  if (role.includes('QA')) {
    return ['Manual Testing', 'Selenium', 'Test Cases', 'API Testing', 'Jira'];
  }

  if (role.includes('Data Analyst')) {
    return ['SQL', 'Excel', 'Python', 'Power BI', 'Statistics'];
  }

  return ['Problem Solving', 'Data Structures', 'Git', 'REST APIs', 'Communication'];
}

function buildDescription(role: string, company: string, location: string, mode: JobMode): string {
  return [
    `${company} is hiring a ${role} to support a fast-moving product engineering team in ${location}.`,
    `You will collaborate with cross-functional teams to ship dependable features and improve release quality.`,
    `The role offers ${mode.toLowerCase()} work expectations, structured mentorship, and weekly technical reviews.`,
    `Ideal candidates are detail-oriented, comfortable with clean code practices, and eager to learn in production environments.`,
  ].join('\n');
}

export const jobs: Job[] = Array.from({ length: 60 }, (_, index) => {
  const role = roles[index % roles.length];
  const company = companies[index % companies.length];
  const location = locations[index % locations.length];
  const mode = modes[index % modes.length];
  const experience = experiences[index % experiences.length];
  const source = sources[index % sources.length];
  const postedDaysAgo = index % 11;

  const isInternRole = role.includes('Intern');
  const salaryRange = isInternRole
    ? '₹15k–₹40k/month Internship'
    : salaryRanges[(index % (salaryRanges.length - 1))] as Job['salaryRange'];

  return {
    id: `job-${String(index + 1).padStart(3, '0')}`,
    title: role,
    company,
    location,
    mode,
    experience,
    skills: skillSetForRole(role),
    source,
    postedDaysAgo,
    salaryRange,
    applyUrl: `https://careers.${slugifyCompany(company)}.in/jobs/${index + 1001}`,
    description: buildDescription(role, company, location, mode),
  };
});
