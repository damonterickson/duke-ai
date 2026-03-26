/**
 * Hidden Points Audit — Data Model & State Management
 *
 * Defines the audit checklist for OMS hidden points:
 * - Language/Cultural Awareness (max 5 OMS)
 * - Training/Extracurricular (max 5 OMS, capped at 100 activity pts)
 * - Maturity/Responsibility (max 5 OMS)
 * - Athletics (max 3 OMS)
 *
 * Persists to localStorage. Feeds into OMS engine calculations.
 */

// ─── Types ───────────────────────────────────────────────────

export type AuditCategory = 'language' | 'training' | 'maturity' | 'athletics';
export type AuditStatus = 'unclaimed' | 'claimed' | 'evidenced';

export interface AuditItem {
  id: string;
  category: AuditCategory;
  label: string;
  description: string;
  maxPoints: number;
  evidenceTypes: string[];
  status: AuditStatus;
  value: number;
  evidenceNote: string;
}

export interface CategorySummary {
  category: AuditCategory;
  label: string;
  icon: string;
  maxOMS: number;
  claimedOMS: number;
  unclaimedOMS: number;
  itemsClaimed: number;
  itemsTotal: number;
  itemsEvidenced: number;
  color: string;
  bgColor: string;
}

export interface AuditState {
  items: AuditItem[];
  lastAuditDate: string | null;
}

// ─── Default Audit Items ─────────────────────────────────────

const DEFAULT_ITEMS: AuditItem[] = [
  // Language/Cultural Awareness (max 5 OMS)
  { id: 'lang-major', category: 'language', label: 'Language Major/Minor Courses', description: 'Completed language courses as part of major or minor', maxPoints: 2, evidenceTypes: ['Transcript'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'lang-rosetta', category: 'language', label: 'Rosetta Stone Completion', description: 'Completed Rosetta Stone language program', maxPoints: 1, evidenceTypes: ['Certificate of Completion'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'lang-dli', category: 'language', label: 'DLI HeadStart Completion', description: 'Completed Defense Language Institute HeadStart program', maxPoints: 1, evidenceTypes: ['Certificate'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'lang-dlpt', category: 'language', label: 'DLPT Scores', description: 'Defense Language Proficiency Test scores on file', maxPoints: 2, evidenceTypes: ['DA Form 330 (signed by TCO)'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'lang-opi', category: 'language', label: 'OPI Scores', description: 'Oral Proficiency Interview scores', maxPoints: 1, evidenceTypes: ['OPI Score Report'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'lang-abroad', category: 'language', label: 'Study Abroad Program', description: 'Completed study abroad or cultural immersion', maxPoints: 2, evidenceTypes: ['Transcript', 'Certificate', 'Program Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },

  // Training/Extracurricular (max 5 OMS, 100 activity pts = full 5)
  { id: 'train-ranger', category: 'training', label: 'Ranger Challenge Team', description: 'Active Ranger Challenge team member', maxPoints: 25, evidenceTypes: ['Team Roster', 'Coach Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-color', category: 'training', label: 'Color Guard / Drill Team', description: 'Active member of Color Guard or Drill Team', maxPoints: 15, evidenceTypes: ['Team Roster'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-recruiter', category: 'training', label: 'ROTC Recruiter Duties', description: 'Active ROTC recruiting role', maxPoints: 15, evidenceTypes: ['PMS Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-govt', category: 'training', label: 'Student Government', description: 'Elected or appointed student government role', maxPoints: 15, evidenceTypes: ['Appointment Letter', 'Election Results'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-ra', category: 'training', label: 'Resident Advisor', description: 'Serving as a Resident Advisor', maxPoints: 15, evidenceTypes: ['Employment Letter', 'Contract'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-service', category: 'training', label: 'Community Service Hours', description: 'Documented volunteer/community service', maxPoints: 20, evidenceTypes: ['Service Log', 'Organization Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-tutor', category: 'training', label: 'Tutoring/Mentoring', description: 'Tutoring or academic mentoring role', maxPoints: 10, evidenceTypes: ['Program Letter', 'Hours Log'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'train-club', category: 'training', label: 'Club Leadership Position', description: 'President, VP, or officer of a recognized club', maxPoints: 15, evidenceTypes: ['Club Roster', 'Appointment'], status: 'unclaimed', value: 0, evidenceNote: '' },

  // Maturity/Responsibility (max 5 OMS)
  { id: 'mat-ft', category: 'maturity', label: 'Full-Time Employment', description: '20+ hours/week while enrolled', maxPoints: 3, evidenceTypes: ['Employment Verification Letter', 'Pay Stubs'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'mat-pt', category: 'maturity', label: 'Part-Time Employment', description: '10-19 hours/week while enrolled', maxPoints: 2, evidenceTypes: ['Employment Verification Letter', 'Pay Stubs'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'mat-smp', category: 'maturity', label: 'Simultaneous Membership Program', description: 'Active SMP with National Guard/Reserve', maxPoints: 3, evidenceTypes: ['SMP Orders', 'Unit Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'mat-g2g', category: 'maturity', label: 'Green-to-Gold Active Duty', description: 'Green-to-Gold ADO participant', maxPoints: 3, evidenceTypes: ['G2G Orders', 'DA Form'], status: 'unclaimed', value: 0, evidenceNote: '' },

  // Athletics (max 3 OMS)
  { id: 'ath-varsity', category: 'athletics', label: 'NCAA Varsity Sport', description: 'Active roster NCAA varsity athlete', maxPoints: 3, evidenceTypes: ['Team Roster', 'Athletic Department Letter'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'ath-club', category: 'athletics', label: 'Club/Intramural Sport', description: 'Active in club or intramural athletics', maxPoints: 2, evidenceTypes: ['Club Roster', 'Intramural Records'], status: 'unclaimed', value: 0, evidenceNote: '' },
  { id: 'ath-community', category: 'athletics', label: 'Community Athletic League', description: 'Active in community sports league', maxPoints: 1, evidenceTypes: ['League Registration', 'Team Records'], status: 'unclaimed', value: 0, evidenceNote: '' },
];

// ─── Category Metadata ───────────────────────────────────────

export const CATEGORY_META: Record<AuditCategory, { label: string; icon: string; maxOMS: number; color: string; bgColor: string; description: string }> = {
  language: { label: 'Language / Cultural', icon: 'translate', maxOMS: 5, color: '#f8e19e', bgColor: '#544511', description: 'Language courses, DLPT, study abroad, cultural immersion' },
  training: { label: 'Training / Extracurricular', icon: 'workspace_premium', maxOMS: 5, color: '#d9b9ff', bgColor: '#450084', description: '100 activity points = full 5 OMS. Ranger Challenge, community service, clubs, etc.' },
  maturity: { label: 'Maturity / Responsibility', icon: 'work', maxOMS: 5, color: '#c3cc8c', bgColor: '#2c3303', description: 'Employment, SMP, Green-to-Gold. Documented work experience.' },
  athletics: { label: 'Athletics', icon: 'sports', maxOMS: 3, color: '#dbc585', bgColor: '#544511', description: 'Varsity, intramural, or community athletic participation' },
};

// ─── State Management ────────────────────────────────────────

const STORAGE_KEY = 'duke_audit_state';

export function loadAuditState(): AuditState {
  if (typeof window === 'undefined') return { items: [...DEFAULT_ITEMS], lastAuditDate: null };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AuditState;
      // Merge with defaults (in case new items were added)
      const savedIds = new Set(parsed.items.map((i) => i.id));
      const merged = [
        ...parsed.items,
        ...DEFAULT_ITEMS.filter((d) => !savedIds.has(d.id)),
      ];
      return { ...parsed, items: merged };
    }
  } catch { /* use defaults */ }
  return { items: [...DEFAULT_ITEMS], lastAuditDate: null };
}

export function saveAuditState(state: AuditState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastAuditDate: new Date().toISOString() }));
  } catch { /* storage full or unavailable */ }
}

// ─── Computed Summaries ──────────────────────────────────────

export function computeCategorySummary(items: AuditItem[], category: AuditCategory): CategorySummary {
  const meta = CATEGORY_META[category];
  const catItems = items.filter((i) => i.category === category);
  const claimed = catItems.filter((i) => i.status !== 'unclaimed');
  const evidenced = catItems.filter((i) => i.status === 'evidenced');

  let claimedOMS: number;
  if (category === 'training') {
    // Training: activity points capped at 100 → 5 OMS
    const totalActivityPts = claimed.reduce((sum, i) => sum + i.value, 0);
    claimedOMS = Math.min(totalActivityPts, 100) / 100 * 5;
  } else if (category === 'language') {
    // Language: direct OMS points, capped at 5
    claimedOMS = Math.min(claimed.reduce((sum, i) => sum + i.value, 0), 5);
  } else if (category === 'maturity') {
    claimedOMS = Math.min(claimed.reduce((sum, i) => sum + i.value, 0), 5);
  } else {
    // Athletics: direct, capped at 3
    claimedOMS = Math.min(claimed.reduce((sum, i) => sum + i.value, 0), 3);
  }

  claimedOMS = Math.round(claimedOMS * 100) / 100;

  return {
    category,
    label: meta.label,
    icon: meta.icon,
    maxOMS: meta.maxOMS,
    claimedOMS,
    unclaimedOMS: Math.round((meta.maxOMS - claimedOMS) * 100) / 100,
    itemsClaimed: claimed.length,
    itemsTotal: catItems.length,
    itemsEvidenced: evidenced.length,
    color: meta.color,
    bgColor: meta.bgColor,
  };
}

export function computeAllSummaries(items: AuditItem[]): CategorySummary[] {
  return (['language', 'training', 'maturity', 'athletics'] as AuditCategory[]).map((cat) =>
    computeCategorySummary(items, cat)
  );
}

export function computeTotalUnclaimed(items: AuditItem[]): number {
  return computeAllSummaries(items).reduce((sum, s) => sum + s.unclaimedOMS, 0);
}

export function computeTotalClaimed(items: AuditItem[]): number {
  return computeAllSummaries(items).reduce((sum, s) => sum + s.claimedOMS, 0);
}

export function getMissingItems(items: AuditItem[]): AuditItem[] {
  return items.filter((i) => i.status === 'unclaimed').sort((a, b) => b.maxPoints - a.maxPoints);
}

export function getEvidenceNeeded(items: AuditItem[]): AuditItem[] {
  return items.filter((i) => i.status === 'claimed' && !i.evidenceNote);
}
