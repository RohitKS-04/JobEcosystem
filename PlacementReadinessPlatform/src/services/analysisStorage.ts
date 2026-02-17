import type { AnalysisResult, ExtractedSkills, RoundChecklist, RoundMappingStep, SkillConfidenceMap } from '../types/analysis';
import { generateRoundMapping, inferCompanyIntel } from './analysisEngine';

const HISTORY_KEY = 'prp.analysis.history.v1';
const SELECTED_ID_KEY = 'prp.analysis.selected.id.v1';
const CORRUPTION_WARNING = "One saved entry couldn't be loaded. Create a new analysis.";

let hasCorruptedEntries = false;

function calculateAdjusted(baseScore: number, confidenceMap: AnalysisResult['skillConfidenceMap']) {
  let score = baseScore;

  Object.values(confidenceMap).forEach((value) => {
    if (value === 'know') {
      score += 2;
      return;
    }

    score -= 2;
  });

  return Math.max(0, Math.min(100, score));
}

function toStringOrEmpty(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeExtractedSkills(raw: Record<string, unknown>): ExtractedSkills {
  const coreCS = asStringArray(raw.coreCS ?? raw['Core CS']);
  const languages = asStringArray(raw.languages ?? raw.Languages);
  const web = asStringArray(raw.web ?? raw.Web);
  const data = asStringArray(raw.data ?? raw.Data);
  const cloud = asStringArray(raw.cloud ?? raw['Cloud/DevOps']);
  const testing = asStringArray(raw.testing ?? raw.Testing);

  let other = asStringArray(raw.other ?? raw.General);
  if (coreCS.length + languages.length + web.length + data.length + cloud.length + testing.length === 0 && other.length === 0) {
    other = ['Communication', 'Problem solving', 'Basic coding', 'Projects'];
  }

  return {
    coreCS,
    languages,
    web,
    data,
    cloud,
    testing,
    other,
    'Core CS': coreCS,
    Languages: languages,
    Web: web,
    Data: data,
    'Cloud/DevOps': cloud,
    Testing: testing,
    General: other,
  };
}

function normalizeChecklist(raw: unknown): RoundChecklist[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const source = item as Record<string, unknown>;
      const roundTitle = toStringOrEmpty(source.roundTitle || source.round);
      const items = asStringArray(source.items);

      if (!roundTitle || items.length === 0) {
        return null;
      }

      return {
        roundTitle,
        round: roundTitle,
        items,
      };
    })
    .filter((item): item is RoundChecklist => item !== null);
}

function normalizeRoundMapping(raw: unknown): RoundMappingStep[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const source = item as Record<string, unknown>;
      const roundTitle = toStringOrEmpty(source.roundTitle || source.title || source.round);
      const focus = toStringOrEmpty(source.focus);
      const whyItMatters = toStringOrEmpty(source.whyItMatters);
      const focusAreas = asStringArray(source.focusAreas);

      if (!roundTitle || !whyItMatters) {
        return null;
      }

      return {
        roundTitle,
        round: toStringOrEmpty(source.round) || roundTitle,
        title: toStringOrEmpty(source.title) || roundTitle,
        focus: focus || focusAreas.join(', '),
        focusAreas: focusAreas.length > 0 ? focusAreas : (focus ? [focus] : []),
        whyItMatters,
      };
    })
    .filter((item): item is RoundMappingStep => item !== null);
}

function normalizePlan(raw: unknown): AnalysisResult['plan7Days'] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const source = item as Record<string, unknown>;
      const day = toStringOrEmpty(source.day);
      const focus = toStringOrEmpty(source.focus);
      const tasks = asStringArray(source.tasks);

      if (!day || !focus) {
        return null;
      }

      return {
        day,
        focus,
        tasks: tasks.length > 0 ? tasks : [focus],
      };
    })
    .filter((item): item is AnalysisResult['plan7Days'][number] => item !== null);
}

function normalizeEntry(entry: unknown): AnalysisResult {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid entry');
  }

  const source = entry as Record<string, unknown>;
  const now = new Date().toISOString();
  const id = toStringOrEmpty(source.id) || crypto.randomUUID();
  const createdAt = toStringOrEmpty(source.createdAt) || now;
  const company = toStringOrEmpty(source.company);
  const role = toStringOrEmpty(source.role);
  const jdText = toStringOrEmpty(source.jdText);
  const extractedSkills = normalizeExtractedSkills((source.extractedSkills as Record<string, unknown>) ?? {});

  const allSkills = Array.from(
    new Set([
      ...extractedSkills.coreCS,
      ...extractedSkills.languages,
      ...extractedSkills.web,
      ...extractedSkills.data,
      ...extractedSkills.cloud,
      ...extractedSkills.testing,
      ...extractedSkills.other,
    ]),
  );

  const map: SkillConfidenceMap = {};
  const incomingMap = (source.skillConfidenceMap as Record<string, unknown>) ?? {};
  allSkills.forEach((skill) => {
    const value = incomingMap[skill];
    map[skill] = value === 'know' ? 'know' : 'practice';
  });

  const baseScoreCandidate = source.baseScore ?? source.baseReadinessScore ?? source.readinessScore ?? 35;
  const baseScore = typeof baseScoreCandidate === 'number' ? baseScoreCandidate : 35;
  const finalScore = calculateAdjusted(baseScore, map);

  const plan7Days = normalizePlan(source.plan7Days ?? source.plan);
  const checklist = normalizeChecklist(source.checklist);
  const companyIntel = source.companyIntel && typeof source.companyIntel === 'object'
    ? (source.companyIntel as AnalysisResult['companyIntel'])
    : inferCompanyIntel(company, jdText);
  const roundMapping = (() => {
    const normalized = normalizeRoundMapping(source.roundMapping);
    return normalized.length > 0 ? normalized : generateRoundMapping(extractedSkills, companyIntel);
  })();
  const questions = asStringArray(source.questions);
  const updatedAt = toStringOrEmpty(source.updatedAt) || createdAt;

  return {
    id,
    createdAt,
    company,
    role,
    jdText,
    extractedSkills,
    plan7Days,
    plan: plan7Days,
    checklist,
    questions,
    baseScore,
    baseReadinessScore: baseScore,
    finalScore,
    readinessScore: finalScore,
    skillConfidenceMap: map,
    companyIntel,
    roundMapping,
    updatedAt,
  };
}

function safeParseHistory(raw: string | null): AnalysisResult[] {
  hasCorruptedEntries = false;

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      hasCorruptedEntries = true;
      return [];
    }

    const valid: AnalysisResult[] = [];
    parsed.forEach((entry) => {
      try {
        valid.push(normalizeEntry(entry));
      } catch {
        hasCorruptedEntries = true;
      }
    });

    return valid;
  } catch {
    hasCorruptedEntries = true;
    return [];
  }
}

export function readAnalysisHistory(): AnalysisResult[] {
  return safeParseHistory(window.localStorage.getItem(HISTORY_KEY));
}

export function writeAnalysisHistory(entries: AnalysisResult[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function saveAnalysisEntry(entry: AnalysisResult) {
  const current = readAnalysisHistory();
  const normalized = normalizeEntry(entry);
  const next = [normalized, ...current.filter((item) => item.id !== entry.id)];
  writeAnalysisHistory(next);
  window.localStorage.setItem(SELECTED_ID_KEY, entry.id);
}

export function updateAnalysisEntry(entry: AnalysisResult) {
  const current = readAnalysisHistory();
  const next = current.map((item) => (item.id === entry.id ? normalizeEntry(entry) : item));
  writeAnalysisHistory(next);
  window.localStorage.setItem(SELECTED_ID_KEY, entry.id);
}

export function getHistoryLoadWarning(): string | null {
  return hasCorruptedEntries ? CORRUPTION_WARNING : null;
}

export function setSelectedAnalysisId(id: string) {
  window.localStorage.setItem(SELECTED_ID_KEY, id);
}

export function readSelectedAnalysisId() {
  return window.localStorage.getItem(SELECTED_ID_KEY);
}

export function readSelectedOrLatestAnalysis(): AnalysisResult | null {
  const history = readAnalysisHistory();
  if (history.length === 0) {
    return null;
  }

  const selectedId = readSelectedAnalysisId();
  if (!selectedId) {
    return history[0];
  }

  return history.find((entry) => entry.id === selectedId) ?? history[0];
}
