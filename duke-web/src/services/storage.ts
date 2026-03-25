/**
 * Storage Layer — Supabase Postgres + localStorage fallback
 *
 * Dual-mode: if the user is authenticated via Supabase, all CRUD goes to
 * Postgres (with RLS). If not authenticated, falls back to localStorage
 * JSON arrays so the app still works for anonymous / pilot users.
 *
 * KV cache functions always use localStorage (client-side only).
 */

import { getSupabase, isSupabaseConfigured } from './supabase';

// ─── Auth Helper ────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = getSupabase();
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── localStorage Helpers (fallback for unauthenticated users) ──────

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

// ─── Database Init ──────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  // No-op — Supabase tables are pre-created via migrations.
  // localStorage needs no init.
}

export async function healthCheck(): Promise<boolean> {
  const userId = await getUserId();
  if (userId) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from('profiles').select('id').eq('id', userId).single();
      // PGRST116 = no rows — that's fine, user just hasn't set up profile yet
      return !error || error.code === 'PGRST116';
    } catch {
      return false;
    }
  }
  // Fallback: localStorage check
  try {
    localStorage.setItem('duke_health', '1');
    localStorage.removeItem('duke_health');
    return true;
  } catch {
    return false;
  }
}

// ─── Cadet Profile CRUD ─────────────────────────────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    // Map DB columns to CadetProfileRow shape
    return {
      id: undefined, // Supabase profiles use uuid, but callers don't depend on numeric id
      name: data.name ?? null,
      photo_uri: data.photo_uri ?? null,
      year_group: data.year_group ?? '',
      gender: data.gender ?? '',
      age_bracket: data.age_bracket ?? '',
      target_branch: data.target_branch ?? null,
      goal_oml: data.goal_oml ?? null,
      created_at: data.created_at ?? undefined,
      updated_at: data.updated_at ?? undefined,
    };
  }
  // Fallback: localStorage
  const rows = getTable<CadetProfileRow>(KEYS.profile);
  return rows.length > 0 ? rows[rows.length - 1] : null;
}

export async function upsertProfile(
  profile: Omit<CadetProfileRow, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { error } = await sb.from('profiles').upsert({
      id: userId,
      name: profile.name ?? null,
      photo_uri: profile.photo_uri ?? null,
      year_group: profile.year_group,
      gender: profile.gender,
      age_bracket: profile.age_bracket,
      target_branch: profile.target_branch ?? null,
      goal_oml: profile.goal_oml ?? null,
    });
    if (error) {
      console.error('[storage] upsertProfile failed:', error);
      throw error;
    }
    // Return a stable numeric id for callers that track it (hash of uuid)
    return hashUuid(userId);
  }
  // Fallback: localStorage
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

/** Simple hash of a UUID string to a stable positive integer. */
function hashUuid(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash + uuid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Score History CRUD ─────────────────────────────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('score_history')
      .insert({
        user_id: userId,
        gpa: row.gpa,
        msl_gpa: row.msl_gpa,
        acft_total: row.acft_total,
        commander_assessment: row.leadership_eval,
        cst_score: row.cst_score,
        clc_score: row.clc_score,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertScoreHistory failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
  const id = nextId();
  const newRow: ScoreHistoryRow = { ...row, id, recorded_at: nowISO() };
  setTable(KEYS.scores, [...rows, newRow]);
  return id;
}

export async function updateLatestScoreHistory(
  fields: Partial<Omit<ScoreHistoryRow, 'id' | 'recorded_at'>>
): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    // Find the latest row
    const { data: latest } = await sb
      .from('score_history')
      .select('id')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const dbFields: Record<string, unknown> = {};
    if (fields.gpa !== undefined) dbFields.gpa = fields.gpa;
    if (fields.msl_gpa !== undefined) dbFields.msl_gpa = fields.msl_gpa;
    if (fields.acft_total !== undefined) dbFields.acft_total = fields.acft_total;
    if (fields.leadership_eval !== undefined) dbFields.commander_assessment = fields.leadership_eval;
    if (fields.cst_score !== undefined) dbFields.cst_score = fields.cst_score;
    if (fields.clc_score !== undefined) dbFields.clc_score = fields.clc_score;
    // total_oml is computed client-side, not stored in DB

    if (latest?.id && Object.keys(dbFields).length > 0) {
      const { error } = await sb
        .from('score_history')
        .update(dbFields)
        .eq('id', latest.id);
      if (error) console.error('[storage] updateLatestScoreHistory failed:', error);
    } else if (!latest) {
      // No existing row — insert one
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
    return;
  }
  // Fallback: localStorage
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
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

/** Map a Supabase score_history row to the app's ScoreHistoryRow shape. */
function mapScoreRow(row: Record<string, unknown>): ScoreHistoryRow {
  return {
    id: row.id as number | undefined,
    gpa: (row.gpa as number) ?? null,
    msl_gpa: (row.msl_gpa as number) ?? null,
    acft_total: (row.acft_total as number) ?? null,
    leadership_eval: (row.commander_assessment as number) ?? null,
    cst_score: (row.cst_score as number) ?? null,
    clc_score: (row.clc_score as number) ?? null,
    total_oml: null, // computed client-side
    recorded_at: (row.recorded_at as string) ?? undefined,
  };
}

export async function getScoreHistory(limit = 50): Promise<ScoreHistoryRow[]> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('score_history')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('[storage] getScoreHistory failed:', error);
      return [];
    }
    return (data ?? []).map(mapScoreRow);
  }
  // Fallback: localStorage
  const rows = getTable<ScoreHistoryRow>(KEYS.scores);
  return [...rows]
    .sort((a, b) => (b.recorded_at ?? '').localeCompare(a.recorded_at ?? ''))
    .slice(0, limit);
}

// ─── ACFT Assessments CRUD ──────────────────────────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('acft_assessments')
      .insert({
        user_id: userId,
        deadlift: row.deadlift,
        power_throw: row.power_throw,
        push_ups: row.push_ups,
        sprint_drag_carry: row.sprint_drag_carry,
        plank: row.plank,
        two_mile_run: row.two_mile_run,
        alt_event_name: row.alt_event_name,
        alt_event_score: row.alt_event_score,
        total: row.total,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertACFTAssessment failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<ACFTAssessmentRow>(KEYS.acft);
  const id = nextId();
  const newRow: ACFTAssessmentRow = { ...row, id, recorded_at: nowISO() };
  setTable(KEYS.acft, [...rows, newRow]);
  return id;
}

export async function getACFTAssessments(limit = 20): Promise<ACFTAssessmentRow[]> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('acft_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('[storage] getACFTAssessments failed:', error);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      deadlift: r.deadlift ?? null,
      power_throw: r.power_throw ?? null,
      push_ups: r.push_ups ?? null,
      sprint_drag_carry: r.sprint_drag_carry ?? null,
      plank: r.plank ?? null,
      two_mile_run: r.two_mile_run ?? null,
      alt_event_name: r.alt_event_name ?? null,
      alt_event_score: r.alt_event_score ?? null,
      total: r.total ?? null,
      recorded_at: r.recorded_at ?? undefined,
    }));
  }
  // Fallback: localStorage
  const rows = getTable<ACFTAssessmentRow>(KEYS.acft);
  return [...rows]
    .sort((a, b) => (b.recorded_at ?? '').localeCompare(a.recorded_at ?? ''))
    .slice(0, limit);
}

// ─── Courses CRUD ───────────────────────────────────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('courses')
      .insert({
        user_id: userId,
        code: row.code,
        name: row.name,
        credits: row.credits,
        grade: row.grade,
        is_msl: !!row.is_msl,
        semester: row.semester,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertCourse failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<CourseRow>(KEYS.courses);
  const id = nextId();
  const newRow: CourseRow = { ...row, id, created_at: nowISO() };
  setTable(KEYS.courses, [...rows, newRow]);
  return id;
}

export async function getCourses(): Promise<CourseRow[]> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('semester', { ascending: false })
      .order('code', { ascending: true });
    if (error) {
      console.error('[storage] getCourses failed:', error);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      code: r.code ?? '',
      name: r.name ?? '',
      credits: r.credits ?? 0,
      grade: r.grade ?? '',
      is_msl: r.is_msl ? 1 : 0,
      semester: r.semester ?? '',
      created_at: r.created_at ?? undefined,
    }));
  }
  // Fallback: localStorage
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

  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    // Convert is_msl number to boolean for Postgres
    const dbRow: Record<string, unknown> = { ...row };
    if ('is_msl' in dbRow) {
      dbRow.is_msl = !!dbRow.is_msl;
    }
    const { error } = await sb
      .from('courses')
      .update(dbRow)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('[storage] updateCourse failed:', error);
      throw error;
    }
    return;
  }
  // Fallback: localStorage
  const rows = getTable<CourseRow>(KEYS.courses);
  const updatedRows = rows.map((r) => (r.id === id ? { ...r, ...row } : r));
  setTable(KEYS.courses, updatedRows);
}

export async function deleteCourse(id: number): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { error } = await sb
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) console.error('[storage] deleteCourse failed:', error);
    return;
  }
  // Fallback: localStorage
  const rows = getTable<CourseRow>(KEYS.courses);
  setTable(KEYS.courses, rows.filter((r) => r.id !== id));
}

// ─── Leadership Entries CRUD ────────────────────────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('leadership_entries')
      .insert({
        user_id: userId,
        entry_type: row.type,
        title: row.title,
        description: row.description,
        hours: row.points,
        start_date: row.start_date,
        end_date: row.end_date,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertLeadershipEntry failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  const id = nextId();
  const newRow: LeadershipEntryRow = { ...row, id, created_at: nowISO() };
  setTable(KEYS.leadership, [...rows, newRow]);
  return id;
}

export async function getLeadershipEntries(): Promise<LeadershipEntryRow[]> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('leadership_entries')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    if (error) {
      console.error('[storage] getLeadershipEntries failed:', error);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      type: r.entry_type ?? '',
      title: r.title ?? '',
      description: r.description ?? null,
      points: r.hours ?? null,
      start_date: r.start_date ?? null,
      end_date: r.end_date ?? null,
      created_at: r.created_at ?? undefined,
    }));
  }
  // Fallback: localStorage
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  return [...rows].sort((a, b) =>
    (b.start_date ?? '').localeCompare(a.start_date ?? '')
  );
}

export async function deleteLeadershipEntry(id: number): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { error } = await sb
      .from('leadership_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) console.error('[storage] deleteLeadershipEntry failed:', error);
    return;
  }
  // Fallback: localStorage
  const rows = getTable<LeadershipEntryRow>(KEYS.leadership);
  setTable(KEYS.leadership, rows.filter((r) => r.id !== id));
}

// ─── Conversations CRUD ─────────────────────────────────────────────

export interface ConversationRow {
  id?: number;
  role: string;
  content: string;
  timestamp?: string;
}

export async function insertConversation(
  row: Omit<ConversationRow, 'id' | 'timestamp'>
): Promise<number> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('conversations')
      .insert({
        user_id: userId,
        role: row.role,
        content: row.content,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertConversation failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<ConversationRow>(KEYS.conversations);
  const id = nextId();
  const newRow: ConversationRow = { ...row, id, timestamp: nowISO() };
  setTable(KEYS.conversations, [...rows, newRow]);
  return id;
}

export async function getConversations(limit = 50): Promise<ConversationRow[]> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) {
      console.error('[storage] getConversations failed:', error);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      role: r.role ?? '',
      content: r.content ?? '',
      timestamp: r.created_at ?? undefined,
    }));
  }
  // Fallback: localStorage
  const rows = getTable<ConversationRow>(KEYS.conversations);
  return [...rows]
    .sort((a, b) => (a.timestamp ?? '').localeCompare(b.timestamp ?? ''))
    .slice(0, limit);
}

export async function clearConversations(): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { error } = await sb
      .from('conversations')
      .delete()
      .eq('user_id', userId);
    if (error) console.error('[storage] clearConversations failed:', error);
    return;
  }
  // Fallback: localStorage
  setTable(KEYS.conversations, []);
}

// ─── Offline Queue CRUD ─────────────────────────────────────────────
// Offline queue stays localStorage-only — it's a client-side queue
// that gets flushed to the AI service, not persisted user data.

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

// ─── KV Cache (localStorage — client-side only) ────────────────────

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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    let query = sb
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[storage] getGoals failed:', error);
      return [];
    }
    return (data ?? []).map(mapGoalRow);
  }
  // Fallback: localStorage
  const rows = getTable<GoalRow>(KEYS.goals);
  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return [...filtered].sort((a, b) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? '')
  );
}

function mapGoalRow(r: Record<string, unknown>): GoalRow {
  return {
    id: r.id as number | undefined,
    title: (r.title as string) ?? '',
    category: (r.category as string) ?? '',
    metric: (r.target_metric as string) ?? '',
    target_value: (r.target_value as number) ?? 0,
    current_value: (r.current_value as number) ?? null,
    baseline_value: 0, // not stored in DB — always 0 fallback
    deadline: (r.deadline as string) ?? '',
    status: (r.status as string) ?? 'active',
    created_by: 'user', // not stored in DB
    oml_impact: (r.oml_impact as number) ?? null,
    completed_at: (r.completed_at as string) ?? null,
    created_at: (r.created_at as string) ?? undefined,
  };
}

export async function getGoalById(id: number): Promise<GoalRow | null> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return mapGoalRow(data);
  }
  // Fallback: localStorage
  const rows = getTable<GoalRow>(KEYS.goals);
  return rows.find((r) => r.id === id) ?? null;
}

export async function insertGoal(
  goal: Omit<GoalRow, 'id' | 'created_at'>
): Promise<number> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('goals')
      .insert({
        user_id: userId,
        title: goal.title,
        description: null,
        category: goal.category,
        status: goal.status,
        target_value: goal.target_value,
        current_value: goal.current_value,
        target_metric: goal.metric,
        deadline: goal.deadline || null,
        oml_impact: goal.oml_impact,
        completed_at: goal.completed_at,
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertGoal failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
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

  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    // Map app column names to DB column names
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.metric !== undefined) dbUpdates.target_metric = updates.metric;
    if (updates.target_value !== undefined) dbUpdates.target_value = updates.target_value;
    if (updates.current_value !== undefined) dbUpdates.current_value = updates.current_value;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.oml_impact !== undefined) dbUpdates.oml_impact = updates.oml_impact;
    if (updates.completed_at !== undefined) dbUpdates.completed_at = updates.completed_at;
    // baseline_value and created_by are not in the DB — skip silently

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await sb
        .from('goals')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);
      if (error) {
        console.error('[storage] updateGoal failed:', error);
        throw error;
      }
    }
    return;
  }
  // Fallback: localStorage
  const rows = getTable<GoalRow>(KEYS.goals);
  const updatedRows = rows.map((r) => (r.id === id ? { ...r, ...updates } : r));
  setTable(KEYS.goals, updatedRows);
}

export async function deleteGoal(id: number): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { error } = await sb
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) console.error('[storage] deleteGoal failed:', error);
    return;
  }
  // Fallback: localStorage
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
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('goal_progress')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true });
    if (error) {
      console.error('[storage] getGoalProgressLog failed:', error);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      goal_id: r.goal_id,
      value: r.new_value ?? 0,
      logged_at: r.recorded_at ?? undefined,
    }));
  }
  // Fallback: localStorage
  const rows = getTable<GoalProgressLogRow>(KEYS.goalProgress);
  return rows
    .filter((r) => r.goal_id === goalId)
    .sort((a, b) => (a.logged_at ?? '').localeCompare(b.logged_at ?? ''));
}

export async function insertGoalProgress(goalId: number, value: number): Promise<number> {
  const userId = await getUserId();
  if (userId) {
    const sb = getSupabase();
    // Get current value for old_value
    const { data: goal } = await sb
      .from('goals')
      .select('current_value')
      .eq('id', goalId)
      .single();

    const { data, error } = await sb
      .from('goal_progress')
      .insert({
        goal_id: goalId,
        user_id: userId,
        old_value: goal?.current_value ?? 0,
        new_value: value,
        source: 'manual',
      })
      .select('id')
      .single();
    if (error) {
      console.error('[storage] insertGoalProgress failed:', error);
      throw error;
    }
    return data?.id ?? nextId();
  }
  // Fallback: localStorage
  const rows = getTable<GoalProgressLogRow>(KEYS.goalProgress);
  const id = nextId();
  const newRow: GoalProgressLogRow = { id, goal_id: goalId, value, logged_at: nowISO() };
  setTable(KEYS.goalProgress, [...rows, newRow]);
  return id;
}
