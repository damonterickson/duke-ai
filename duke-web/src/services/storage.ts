/**
 * Storage Layer — localStorage-backed CRUD helpers + KV cache
 *
 * Web migration: replaces SQLite with localStorage JSON arrays,
 * replaces AsyncStorage with localStorage for KV cache.
 * Same exports / function signatures as the React Native version.
 */

// ─── localStorage Helpers ───────────────────────────────────────────

const KEYS = {
  profile: 'duke_profile',
  scores: 'duke_scores',
  acft: 'duke_acft',
  courses: 'duke_courses',
  leadership: 'duke_leadership',
  conversations: 'duke_conversations',
  offlineQueue: 'duke_offline_queue',
  goals: 'duke_goals',
  goalProgress: 'duke_goal_progress',
} as const;

function getTable<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setTable<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows));
}

let _nextId = Date.now();
function nextId(): number {
  return _nextId++;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ─── Database Init (no-op for localStorage) ─────────────────────────

let dbInitialized = false;

export async function initDatabase(): Promise<void> {
  dbInitialized = true;
}

export async function healthCheck(): Promise<boolean> {
  try {
    localStorage.setItem('duke_health', '1');
    localStorage.removeItem('duke_health');
    return true;
  } catch {
    return false;
  }
}

// ─── Cadet Profile CRUD ──────────────────────────────────────────────

export interface CadetProfileRow {
  id?: number;
  name?: string | null;
  photo_uri?: string | null;
  year_group: string;
  gender: string;
  age_bracket: string;
  target_branch?: string | null;
  goal_oml?: number | null;
  created_at?: string;
  updated_at?: string;
}

export async function getProfile(): Promise<CadetProfileRow | null> {
  const rows = getTable<CadetProfileRow>(KEYS.profile);
  return rows.length > 0 ? rows[rows.length - 1] : null;
}

export async function upsertProfile(
  profile: Omit<CadetProfileRow, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const rows = getTable<CadetProfileRow>(KEYS.profile);
  const existing = rows.length > 0 ? rows[rows.length - 1] : null;

  if (existing?.id) {
    const updated: CadetProfileRow = {
      ...existing,
      ...profile,
      updated_at: nowISO(),
    };
    const updatedRows = rows.map((r) => (r.id === existing.id ? updated : r));
    setTable(KEYS.profile, updatedRows);
    return existing.id;
  } else {
    const id = nextId();
    const newRow: CadetProfileRow = {
      ...profile,
      id,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    setTable(KEYS.profile, [...rows, newRow]);
    return id;
  }
}

// ─── Score History CRUD ──────────────────────────────────────────────

export interface ScoreHistoryRow {
  id?: number;
  gpa: number | null;
  msl_gpa: number | null;
  acft_total: number | null;
  leadership_eval: number | null;
  cst_score: number | null;
  clc_score: number | null;
  total_oml: number | null;
  recorded_at?: string;
}

export async function insertScoreHistory(
  row: Omit<ScoreHistoryRow, 'id' | 'recorded_at'>
): Promise<number> {
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
  const id = nextId();
  const newRow: ScoreHistoryRow = { ...row, id, recorded_at: nowISO() };
  setTable(KEYS.scores, [...rows, newRow]);
  return id;
}

export async function updateLatestScoreHistory(
  fields: Partial<Omit<ScoreHistoryRow, 'id' | 'recorded_at'>>
): Promise<void> {
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
  // Sort descending by recorded_at to find latest
  const sorted = [...rows].sort(
    (a, b) => (b.recorded_at ?? '').localeCompare(a.recorded_at ?? '')
  );
  const latest = sorted[0];

  if (latest?.id) {
    const merged: ScoreHistoryRow = {
      ...latest,
      gpa: fields.gpa !== undefined ? fields.gpa : latest.gpa,
      msl_gpa: fields.msl_gpa !== undefined ? fields.msl_gpa : latest.msl_gpa,
      acft_total: fields.acft_total !== undefined ? fields.acft_total : latest.acft_total,
      leadership_eval: fields.leadership_eval !== undefined ? fields.leadership_eval : latest.leadership_eval,
      cst_score: fields.cst_score !== undefined ? fields.cst_score : latest.cst_score,
      clc_score: fields.clc_score !== undefined ? fields.clc_score : latest.clc_score,
      total_oml: fields.total_oml !== undefined ? fields.total_oml : latest.total_oml,
    };
    const updatedRows = rows.map((r) => (r.id === latest.id ? merged : r));
    setTable(KEYS.scores, updatedRows);
  } else {
    await insertScoreHistory({
      gpa: fields.gpa ?? null,
      msl_gpa: fields.msl_gpa ?? null,
      acft_total: fields.acft_total ?? null,
      leadership_eval: fields.leadership_eval ?? null,
      cst_score: fields.cst_score ?? null,
      clc_score: fields.clc_score ?? null,
      total_oml: fields.total_oml ?? null,
    });
  }
}

export async function getScoreHistory(limit = 50): Promise<ScoreHistoryRow[]> {
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
  return [...rows]
    .sort((a, b) => (b.recorded_at ?? '').localeCompare(a.recorded_at ?? ''))
    .slice(0, limit);
}

// ─── ACFT Assessments CRUD ───────────────────────────────────────────

export interface ACFTAssessmentRow {
  id?: number;
  deadlift: number | null;
  power_throw: number | null;
  push_ups: number | null;
  sprint_drag_carry: number | null;
  plank: number | null;
  two_mile_run: number | null;
  alt_event_name: string | null;
  alt_event_score: number | null;
  total: number | null;
  recorded_at?: string;
}

export async function insertACFTAssessment(
  row: Omit<ACFTAssessmentRow, 'id' | 'recorded_at'>
): Promise<number> {
  const rows = getTable<ACFTAssessmentRow>(KEYS.acft);
  const id = nextId();
  const newRow: ACFTAssessmentRow = { ...row, id, recorded_at: nowISO() };
  setTable(KEYS.acft, [...rows, newRow]);
  return id;
}

export async function getACFTAssessments(limit = 20): Promise<ACFTAssessmentRow[]> {
  const rows = getTable<ACFTAssessmentRow>(KEYS.acft);
  return [...rows]
    .sort((a, b) => (b.recorded_at ?? '').localeCompare(a.recorded_at ?? ''))
    .slice(0, limit);
}

// ─── Courses CRUD ────────────────────────────────────────────────────

export interface CourseRow {
  id?: number;
  code: string;
  name: string;
  credits: number;
  grade: string;
  is_msl: number;
  semester: string;
  created_at?: string;
}

export async function insertCourse(
  row: Omit<CourseRow, 'id' | 'created_at'>
): Promise<number> {
  const rows = getTable<CourseRow>(KEYS.courses);
  const id = nextId();
  const newRow: CourseRow = { ...row, id, created_at: nowISO() };
  setTable(KEYS.courses, [...rows, newRow]);
  return id;
}

export async function getCourses(): Promise<CourseRow[]> {
  const rows = getTable<CourseRow>(KEYS.courses);
  return [...rows].sort((a, b) => {
    const semCmp = (b.semester ?? '').localeCompare(a.semester ?? '');
    if (semCmp !== 0) return semCmp;
    return (a.code ?? '').localeCompare(b.code ?? '');
  });
}

export async function updateCourse(
  id: number,
  row: Partial<Omit<CourseRow, 'id' | 'created_at'>>
): Promise<void> {
  const ALLOWED_COURSE_COLUMNS = new Set([
    'code', 'name', 'credits', 'grade', 'is_msl', 'semester',
  ]);

  for (const key of Object.keys(row)) {
    if (!ALLOWED_COURSE_COLUMNS.has(key)) {
      throw new Error(`updateCourse: unknown column "${key}"`);
    }
  }

  const rows = getTable<CourseRow>(KEYS.courses);
  const updatedRows = rows.map((r) => (r.id === id ? { ...r, ...row } : r));
  setTable(KEYS.courses, updatedRows);
}

export async function deleteCourse(id: number): Promise<void> {
  const rows = getTable<CourseRow>(KEYS.courses);
  setTable(KEYS.courses, rows.filter((r) => r.id !== id));
}

// ─── Leadership Entries CRUD ─────────────────────────────────────────

export interface LeadershipEntryRow {
  id?: number;
  type: string;
  title: string;
  description: string | null;
  points: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
}

export async function insertLeadershipEntry(
  row: Omit<LeadershipEntryRow, 'id' | 'created_at'>
): Promise<number> {
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  const id = nextId();
  const newRow: LeadershipEntryRow = { ...row, id, created_at: nowISO() };
  setTable(KEYS.leadership, [...rows, newRow]);
  return id;
}

export async function getLeadershipEntries(): Promise<LeadershipEntryRow[]> {
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  return [...rows].sort((a, b) =>
    (b.start_date ?? '').localeCompare(a.start_date ?? '')
  );
}

export async function deleteLeadershipEntry(id: number): Promise<void> {
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  setTable(KEYS.leadership, rows.filter((r) => r.id !== id));
}

// ─── Conversations CRUD ──────────────────────────────────────────────

export interface ConversationRow {
  id?: number;
  role: string;
  content: string;
  timestamp?: string;
}

export async function insertConversation(
  row: Omit<ConversationRow, 'id' | 'timestamp'>
): Promise<number> {
  const rows = getTable<ConversationRow>(KEYS.conversations);
  const id = nextId();
  const newRow: ConversationRow = { ...row, id, timestamp: nowISO() };
  setTable(KEYS.conversations, [...rows, newRow]);
  return id;
}

export async function getConversations(limit = 50): Promise<ConversationRow[]> {
  const rows = getTable<ConversationRow>(KEYS.conversations);
  return [...rows]
    .sort((a, b) => (a.timestamp ?? '').localeCompare(b.timestamp ?? ''))
    .slice(0, limit);
}

export async function clearConversations(): Promise<void> {
  setTable(KEYS.conversations, []);
}

// ─── Offline Queue CRUD ──────────────────────────────────────────────

export interface OfflineQueueRow {
  id?: number;
  query: string;
  created_at?: string;
  sent_at?: string | null;
}

export async function insertOfflineQuery(query: string): Promise<number> {
  const rows = getTable<OfflineQueueRow>(KEYS.offlineQueue);
  const id = nextId();
  const newRow: OfflineQueueRow = { id, query, created_at: nowISO(), sent_at: null };
  setTable(KEYS.offlineQueue, [...rows, newRow]);
  return id;
}

export async function getPendingQueries(): Promise<OfflineQueueRow[]> {
  const rows = getTable<OfflineQueueRow>(KEYS.offlineQueue);
  return rows
    .filter((r) => r.sent_at == null)
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));
}

export async function markQuerySent(id: number): Promise<void> {
  const rows = getTable<OfflineQueueRow>(KEYS.offlineQueue);
  const updatedRows = rows.map((r) =>
    r.id === id ? { ...r, sent_at: nowISO() } : r
  );
  setTable(KEYS.offlineQueue, updatedRows);
}

// ─── KV Cache (localStorage) ────────────────────────────────────────

const kvCache: Record<string, string> = {};
let kvInitialized = false;

export async function initKVCache(): Promise<void> {
  if (kvInitialized) return;
  try {
    const keys = [
      'cached_briefing',
      'cached_recommendation',
      'app_settings',
      'onboarding_complete',
      'ai_coach_enabled',
      'briefing_timestamp',
    ];
    for (const key of keys) {
      const value = localStorage.getItem(`duke_kv_${key}`);
      if (value !== null) kvCache[key] = value;
    }
    kvInitialized = true;
  } catch (error) {
    console.warn('KV cache init failed:', error);
    kvInitialized = true;
  }
}

// Keep the old export name for compatibility
export function initMMKV(): void {
  // No-op synchronously — actual init is async via initKVCache()
}

// Briefing cache
export function getCachedBriefing(): string | undefined {
  return kvCache['cached_briefing'];
}

export function setCachedBriefing(briefing: string): void {
  kvCache['cached_briefing'] = briefing;
  try { localStorage.setItem('duke_kv_cached_briefing', briefing); } catch {}
}

// Recommendation cache
export function getCachedRecommendation(): string | undefined {
  return kvCache['cached_recommendation'];
}

export function setCachedRecommendation(recommendation: string): void {
  kvCache['cached_recommendation'] = recommendation;
  try { localStorage.setItem('duke_kv_cached_recommendation', recommendation); } catch {}
}

// Settings
export interface AppSettings {
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  hapticFeedback?: boolean;
}

export function getSettings(): AppSettings {
  const raw = kvCache['app_settings'];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AppSettings;
  } catch {
    return {};
  }
}

export function setSettings(settings: AppSettings): void {
  const json = JSON.stringify(settings);
  kvCache['app_settings'] = json;
  try { localStorage.setItem('duke_kv_app_settings', json); } catch {}
}

// Onboarding
export function getOnboardingComplete(): boolean {
  return kvCache['onboarding_complete'] === 'true';
}

export function setOnboardingComplete(complete: boolean): void {
  kvCache['onboarding_complete'] = String(complete);
  try { localStorage.setItem('duke_kv_onboarding_complete', String(complete)); } catch {}
}

// AI Coach
export function getAICoachEnabled(): boolean {
  return kvCache['ai_coach_enabled'] === 'true';
}

export function setAICoachEnabled(enabled: boolean): void {
  kvCache['ai_coach_enabled'] = String(enabled);
  try { localStorage.setItem('duke_kv_ai_coach_enabled', String(enabled)); } catch {}
}

// ─── Goals CRUD ─────────────────────────────────────────────────────

export interface GoalRow {
  id?: number;
  title: string;
  category: string;
  metric: string;
  target_value: number;
  current_value: number | null;
  baseline_value: number;
  deadline: string;
  status: string;
  created_by: string;
  oml_impact: number | null;
  completed_at: string | null;
  created_at?: string;
}

export async function getGoals(status?: string): Promise<GoalRow[]> {
  const rows = getTable<GoalRow>(KEYS.goals);
  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return [...filtered].sort((a, b) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? '')
  );
}

export async function getGoalById(id: number): Promise<GoalRow | null> {
  const rows = getTable<GoalRow>(KEYS.goals);
  return rows.find((r) => r.id === id) ?? null;
}

export async function insertGoal(
  goal: Omit<GoalRow, 'id' | 'created_at'>
): Promise<number> {
  const rows = getTable<GoalRow>(KEYS.goals);
  const id = nextId();
  const newRow: GoalRow = { ...goal, id, created_at: nowISO() };
  setTable(KEYS.goals, [...rows, newRow]);
  return id;
}

export async function updateGoal(
  id: number,
  updates: Partial<Omit<GoalRow, 'id' | 'created_at'>>
): Promise<void> {
  const ALLOWED_GOAL_COLUMNS = new Set([
    'title', 'category', 'metric', 'target_value', 'current_value',
    'baseline_value', 'deadline', 'status', 'created_by', 'oml_impact',
    'completed_at',
  ]);

  for (const key of Object.keys(updates)) {
    if (!ALLOWED_GOAL_COLUMNS.has(key)) {
      throw new Error(`updateGoal: unknown column "${key}"`);
    }
  }

  const rows = getTable<GoalRow>(KEYS.goals);
  const updatedRows = rows.map((r) => (r.id === id ? { ...r, ...updates } : r));
  setTable(KEYS.goals, updatedRows);
}

export async function deleteGoal(id: number): Promise<void> {
  const rows = getTable<GoalRow>(KEYS.goals);
  setTable(KEYS.goals, rows.filter((r) => r.id !== id));
}

// ─── Goal Progress Log CRUD ─────────────────────────────────────────

export interface GoalProgressLogRow {
  id?: number;
  goal_id: number;
  value: number;
  logged_at?: string;
}

export async function getGoalProgressLog(goalId: number): Promise<GoalProgressLogRow[]> {
  const rows = getTable<GoalProgressLogRow>(KEYS.goalProgress);
  return rows
    .filter((r) => r.goal_id === goalId)
    .sort((a, b) => (a.logged_at ?? '').localeCompare(b.logged_at ?? ''));
}

export async function insertGoalProgress(goalId: number, value: number): Promise<number> {
  const rows = getTable<GoalProgressLogRow>(KEYS.goalProgress);
  const id = nextId();
  const newRow: GoalProgressLogRow = { id, goal_id: goalId, value, logged_at: nowISO() };
  setTable(KEYS.goalProgress, [...rows, newRow]);
  return id;
}
