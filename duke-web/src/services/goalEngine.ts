/**
 * Goal Engine — Auto-update logic, 5-goal cap enforcement, goal JSON parsing
 *
 * Pure TypeScript. No external dependencies beyond storage types.
 */

import type { GoalRow } from './storage';

// ─── Constants ───────────────────────────────────────────────────────

const MAX_ACTIVE_GOALS = 5;

// ─── Types ───────────────────────────────────────────────────────────

export interface GoalActionCreate {
  type: 'create';
  title: string;
  category: string;
  metric: string;
  target_value: number;
  deadline: string;
  oml_impact?: number;
}

export interface GoalActionUpdate {
  type: 'update';
  goal_id: number;
  current_value: number;
}

export interface GoalActionComplete {
  type: 'complete';
  goal_id: number;
  message?: string;
}

export interface GoalActionRetire {
  type: 'retire';
  goal_id: number;
  message?: string;
}

export type GoalAction = GoalActionCreate | GoalActionUpdate | GoalActionComplete | GoalActionRetire;

export interface ParsedGoalResponse {
  displayText: string;
  actions: GoalAction[];
}

export interface GoalProgressUpdate {
  goalId: number;
  newValue: number;
  completed: boolean;
}

// ─── Core Functions ─────────────────────────────────────────────────

/**
 * Called after any data entry (ACFT, GPA, leadership).
 * Scans active goals matching the metric and returns updates to apply.
 */
export function checkGoalProgress(
  goals: GoalRow[],
  latestData: { metric: string; value: number }
): GoalProgressUpdate[] {
  const updates: GoalProgressUpdate[] = [];

  for (const goal of goals) {
    // Skip non-active goals
    if (goal.status !== 'active') continue;

    // Only process goals matching the metric
    if (goal.metric !== latestData.metric) continue;

    const newValue = latestData.value;
    const completed = newValue >= goal.target_value;

    updates.push({
      goalId: goal.id!,
      newValue,
      completed,
    });
  }

  return updates;
}

/**
 * Parse goal JSON from AI response text, strip it from display text.
 *
 * Looks for a ```goals JSON block in the response.
 * If found: parse it, strip from the response text, return both.
 * If not found: return original text with empty actions.
 * If malformed: log warning, return original text with empty actions.
 */
export function parseGoalActions(responseText: string): ParsedGoalResponse {
  // Match ```goals ... ``` block (with optional whitespace)
  const goalBlockRegex = /```goals\s*([\s\S]*?)```/;
  const match = responseText.match(goalBlockRegex);

  if (!match) {
    return { displayText: responseText, actions: [] };
  }

  const jsonStr = match[1].trim();
  const displayText = responseText.replace(match[0], '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const actions: GoalAction[] = Array.isArray(parsed.actions) ? parsed.actions : [];

    const ALLOWED_CATEGORIES = ['gpa', 'acft', 'leadership', 'oml'];

    // Validate each action has the required type field
    const validActions = actions.filter((a) => {
      if (!a || typeof a.type !== 'string') return false;
      if (!['create', 'update', 'complete', 'retire'].includes(a.type)) return false;
      return true;
    });

    // Per-type field validation
    const fullyValidActions = validActions.filter((a) => {
      switch (a.type) {
        case 'create': {
          const c = a as GoalActionCreate;
          if (typeof c.title !== 'string' || c.title.length === 0 || c.title.length > 200) return false;
          if (!ALLOWED_CATEGORIES.includes(c.category)) return false;
          if (typeof c.target_value !== 'number' || !Number.isFinite(c.target_value) || c.target_value <= 0) return false;
          if (isNaN(Date.parse(c.deadline))) return false;
          return true;
        }
        case 'update': {
          const u = a as GoalActionUpdate;
          if (!Number.isInteger(u.goal_id)) return false;
          if (typeof u.current_value !== 'number' || !Number.isFinite(u.current_value)) return false;
          return true;
        }
        case 'complete':
        case 'retire': {
          const cr = a as GoalActionComplete | GoalActionRetire;
          if (!Number.isInteger(cr.goal_id)) return false;
          return true;
        }
        default:
          return false;
      }
    });

    return { displayText, actions: fullyValidActions };
  } catch (error) {
    console.warn('Failed to parse goal JSON from AI response:', error);
    return { displayText: responseText, actions: [] };
  }
}

/**
 * Enforce 5-goal cap. Returns true if a new goal can be created.
 */
export function canCreateGoal(activeGoalCount: number): boolean {
  return activeGoalCount < MAX_ACTIVE_GOALS;
}
