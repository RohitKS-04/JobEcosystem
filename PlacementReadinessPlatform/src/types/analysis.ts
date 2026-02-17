export type SkillCategory =
  | 'Core CS'
  | 'Languages'
  | 'Web'
  | 'Data'
  | 'Cloud/DevOps'
  | 'Testing'
  | 'General';

export type NormalizedExtractedSkills = {
  coreCS: string[];
  languages: string[];
  web: string[];
  data: string[];
  cloud: string[];
  testing: string[];
  other: string[];
};

export type ExtractedSkills = NormalizedExtractedSkills & Record<SkillCategory, string[]>;

export type SkillConfidence = 'know' | 'practice';
export type SkillConfidenceMap = Record<string, SkillConfidence>;

export type CompanySizeCategory = 'Startup' | 'Mid-size' | 'Enterprise';

export type CompanyIntel = {
  companyName: string;
  industry: string;
  sizeCategory: CompanySizeCategory;
  typicalHiringFocus: string;
  note: string;
};

export type RoundMappingStep = {
  roundTitle: string;
  focusAreas: string[];
  round: string;
  title: string;
  focus: string;
  whyItMatters: string;
};

export type RoundChecklist = {
  roundTitle: string;
  round: string;
  items: string[];
};

export type DayPlan = {
  day: string;
  focus: string;
  tasks: string[];
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkills;
  plan7Days: DayPlan[];
  plan: DayPlan[];
  checklist: RoundChecklist[];
  questions: string[];
  baseScore: number;
  baseReadinessScore: number;
  finalScore: number;
  readinessScore: number;
  skillConfidenceMap: SkillConfidenceMap;
  companyIntel: CompanyIntel | null;
  roundMapping: RoundMappingStep[];
  updatedAt: string;
};

export type AnalyzeInput = {
  company: string;
  role: string;
  jdText: string;
};
