/**
 * Storage Layer — SQLite schema + CRUD helpers + MMKV cache
 *
 * Uses expo-sqlite for persistent structured data and react-native-mmkv for fast KV cache.
 */

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── SQLite Database ─────────────────────────────────────────────────

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('duke_ai.db');
  }
  return dbPromise;
}

let dbInitialized = false;

export async function initDatabase(): Promise<void> {
  if (dbInitialized) return;
  const database = await getDatabase();

  // Execute each CREATE TABLE separately for compatibility
  const tables = [
    `CREATE TABLE IF NOT EXISTS cadet_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year_group TEXT NOT NULL,
      gender TEXT NOT NULL,
      age_bracket TEXT NOT NULL,
      target_branch TEXT,
      goal_oml REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS score_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gpa REAL,
      msl_gpa REAL,
      acft_total REAL,
      leadership_eval REAL,
      cst_score REAL,
      clc_score REAL,
      total_oml REAL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS acft_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deadlift REAL,
      power_throw REAL,
      push_ups REAL,
      sprint_drag_carry REAL,
      plank REAL,
      two_mile_run REAL,
      alt_event_name TEXT,
      alt_event_score REAL,
      total REAL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      credits REAL NOT NULL,
      grade TEXT NOT NULL,
      is_msl INTEGER NOT NULL DEFAULT 0,
      semester TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS leadership_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      points REAL,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      sent_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      metric TEXT NOT NULL,
      target_value REAL NOT NULL,
      current_value REAL,
      baseline_value REAL NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT NOT NULL DEFAULT 'user',
      oml_impact REAL,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS goal_progress_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      value REAL NOT NULL,
      logged_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of tables) {
    await database.execAsync(sql);
  }
  dbInitialized = true;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ integrity_check: string }>(
      "PRAGMA integrity_check"
    );
    return result?.integrity_check === 'ok';
  } catch {
    return false;
  }
}

// ─── Cadet Profile CRUD ──────────────────────────────────────────────

export interface CadetProfileRow {
  id?: number;
  year_group: string;
  gender: string;
  age_bracket: string;
  target_branch?: string | null;
  goal_oml?: number | null;
  created_at?: string;
  updated_at?: string;
}

export async function getProfile(): Promise<CadetProfileRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<CadetProfileRow>(
    'SELECT * FROM cadet_profile ORDER BY id DESC LIMIT 1'
  );
}

export async function upsertProfile(profile: Omit<CadetProfileRow, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const database = await getDatabase();
  const existing = await getProfile();

  if (existing?.id) {
    await database.runAsync(
      `UPDATE cadet_profile SET year_group = ?, gender = ?, age_bracket = ?, target_branch = ?, goal_oml = ?, updated_at = datetime('now') WHERE id = ?`,
      profile.year_group, profile.gender, profile.age_bracket, profile.target_branch ?? null, profile.goal_oml ?? null, existing.id
    );
    return existing.id;
  } else {
    const result = await database.runAsync(
      `INSERT INTO cadet_profile (year_group, gender, age_bracket, target_branch, goal_oml) VALUES (?, ?, ?, ?, ?)`,
      profile.year_group, profile.gender, profile.age_bracket, profile.target_branch ?? null, profile.goal_oml ?? null
    );
    return result.lastInsertRowId;
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

export async function insertScoreHistory(row: Omit<ScoreHistoryRow, 'id' | 'recorded_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO score_history (gpa, msl_gpa, acft_total, leadership_eval, cst_score, clc_score, total_oml) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    row.gpa, row.msl_gpa, row.acft_total, row.leadership_eval, row.cst_score, row.clc_score, row.total_oml
  );
  return result.lastInsertRowId;
}

export async function getScoreHistory(limit = 50): Promise<ScoreHistoryRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<ScoreHistoryRow>(
    'SELECT * FROM score_history ORDER BY recorded_at DESC LIMIT ?',
    limit
  );
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

export async function insertACFTAssessment(row: Omit<ACFTAssessmentRow, 'id' | 'recorded_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO acft_assessments (deadlift, power_throw, push_ups, sprint_drag_carry, plank, two_mile_run, alt_event_name, alt_event_score, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    row.deadlift, row.power_throw, row.push_ups, row.sprint_drag_carry, row.plank, row.two_mile_run, row.alt_event_name, row.alt_event_score, row.total
  );
  return result.lastInsertRowId;
}

export async function getACFTAssessments(limit = 20): Promise<ACFTAssessmentRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<ACFTAssessmentRow>(
    'SELECT * FROM acft_assessments ORDER BY recorded_at DESC LIMIT ?',
    limit
  );
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

export async function insertCourse(row: Omit<CourseRow, 'id' | 'created_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO courses (code, name, credits, grade, is_msl, semester) VALUES (?, ?, ?, ?, ?, ?)`,
    row.code, row.name, row.credits, row.grade, row.is_msl, row.semester
  );
  return result.lastInsertRowId;
}

export async function getCourses(): Promise<CourseRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<CourseRow>('SELECT * FROM courses ORDER BY semester DESC, code ASC');
}

export async function updateCourse(id: number, row: Partial<Omit<CourseRow, 'id' | 'created_at'>>): Promise<void> {
  const database = await getDatabase();

  const ALLOWED_COURSE_COLUMNS = new Set([
    'code', 'name', 'credits', 'grade', 'is_msl', 'semester',
  ]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(row)) {
    if (!ALLOWED_COURSE_COLUMNS.has(key)) {
      throw new Error(`updateCourse: unknown column "${key}"`);
    }
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return;
  values.push(id);

  await database.runAsync(
    `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
    ...(values as SQLite.SQLiteBindValue[])
  );
}

export async function deleteCourse(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM courses WHERE id = ?', id);
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

export async function insertLeadershipEntry(row: Omit<LeadershipEntryRow, 'id' | 'created_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO leadership_entries (type, title, description, points, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)`,
    row.type, row.title, row.description, row.points, row.start_date, row.end_date
  );
  return result.lastInsertRowId;
}

export async function getLeadershipEntries(): Promise<LeadershipEntryRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<LeadershipEntryRow>(
    'SELECT * FROM leadership_entries ORDER BY start_date DESC'
  );
}

export async function deleteLeadershipEntry(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM leadership_entries WHERE id = ?', id);
}

// ─── Conversations CRUD ──────────────────────────────────────────────

export interface ConversationRow {
  id?: number;
  role: string;
  content: string;
  timestamp?: string;
}

export async function insertConversation(row: Omit<ConversationRow, 'id' | 'timestamp'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO conversations (role, content) VALUES (?, ?)`,
    row.role, row.content
  );
  return result.lastInsertRowId;
}

export async function getConversations(limit = 50): Promise<ConversationRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<ConversationRow>(
    'SELECT * FROM conversations ORDER BY timestamp ASC LIMIT ?',
    limit
  );
}

export async function clearConversations(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM conversations');
}

// ─── Offline Queue CRUD ──────────────────────────────────────────────

export interface OfflineQueueRow {
  id?: number;
  query: string;
  created_at?: string;
  sent_at?: string | null;
}

export async function insertOfflineQuery(query: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO offline_queue (query) VALUES (?)`,
    query
  );
  return result.lastInsertRowId;
}

export async function getPendingQueries(): Promise<OfflineQueueRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<OfflineQueueRow>(
    'SELECT * FROM offline_queue WHERE sent_at IS NULL ORDER BY created_at ASC'
  );
}

export async function markQuerySent(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE offline_queue SET sent_at = datetime('now') WHERE id = ?`,
    id
  );
}

// ─── KV Cache (AsyncStorage — works in Expo Go) ─────────────────────

// In-memory cache for synchronous reads (populated from AsyncStorage on init)
const kvCache: Record<string, string> = {};
let kvInitialized = false;

export async function initKVCache(): Promise<void> {
  if (kvInitialized) return;
  try {
    const keys = ['cached_briefing', 'cached_recommendation', 'app_settings', 'onboarding_complete', 'ai_coach_enabled'];
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [key, value] of pairs) {
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
  AsyncStorage.setItem('cached_briefing', briefing).catch(() => {});
}

// Recommendation cache
export function getCachedRecommendation(): string | undefined {
  return kvCache['cached_recommendation'];
}

export function setCachedRecommendation(recommendation: string): void {
  kvCache['cached_recommendation'] = recommendation;
  AsyncStorage.setItem('cached_recommendation', recommendation).catch(() => {});
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
  AsyncStorage.setItem('app_settings', json).catch(() => {});
}

// Onboarding
export function getOnboardingComplete(): boolean {
  return kvCache['onboarding_complete'] === 'true';
}

export function setOnboardingComplete(complete: boolean): void {
  kvCache['onboarding_complete'] = String(complete);
  AsyncStorage.setItem('onboarding_complete', String(complete)).catch(() => {});
}

// AI Coach
export function getAICoachEnabled(): boolean {
  return kvCache['ai_coach_enabled'] === 'true';
}

export function setAICoachEnabled(enabled: boolean): void {
  kvCache['ai_coach_enabled'] = String(enabled);
  AsyncStorage.setItem('ai_coach_enabled', String(enabled)).catch(() => {});
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
  const database = await getDatabase();
  if (status) {
    return database.getAllAsync<GoalRow>(
      'SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC',
      status
    );
  }
  return database.getAllAsync<GoalRow>(
    'SELECT * FROM goals ORDER BY created_at DESC'
  );
}

export async function getGoalById(id: number): Promise<GoalRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<GoalRow>(
    'SELECT * FROM goals WHERE id = ?',
    id
  );
}

export async function insertGoal(goal: Omit<GoalRow, 'id' | 'created_at'>): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO goals (title, category, metric, target_value, current_value, baseline_value, deadline, status, created_by, oml_impact, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    goal.title, goal.category, goal.metric, goal.target_value, goal.current_value, goal.baseline_value, goal.deadline, goal.status, goal.created_by, goal.oml_impact, goal.completed_at
  );
  return result.lastInsertRowId;
}

export async function updateGoal(id: number, updates: Partial<Omit<GoalRow, 'id' | 'created_at'>>): Promise<void> {
  const database = await getDatabase();

  const ALLOWED_GOAL_COLUMNS = new Set([
    'title', 'category', 'metric', 'target_value', 'current_value',
    'baseline_value', 'deadline', 'status', 'created_by', 'oml_impact',
    'completed_at',
  ]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_GOAL_COLUMNS.has(key)) {
      throw new Error(`updateGoal: unknown column "${key}"`);
    }
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return;
  values.push(id);

  await database.runAsync(
    `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`,
    ...(values as SQLite.SQLiteBindValue[])
  );
}

export async function deleteGoal(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM goals WHERE id = ?', id);
}

// ─── Goal Progress Log CRUD ─────────────────────────────────────────

export interface GoalProgressLogRow {
  id?: number;
  goal_id: number;
  value: number;
  logged_at?: string;
}

export async function getGoalProgressLog(goalId: number): Promise<GoalProgressLogRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<GoalProgressLogRow>(
    'SELECT * FROM goal_progress_log WHERE goal_id = ? ORDER BY logged_at ASC',
    goalId
  );
}

export async function insertGoalProgress(goalId: number, value: number): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO goal_progress_log (goal_id, value) VALUES (?, ?)`,
    goalId, value
  );
  return result.lastInsertRowId;
}
