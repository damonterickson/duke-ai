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

    // Validate each action has the required type field
    const validActions = actions.filter((a) => {
      if (!a || typeof a.type !== 'string') return false;
      if (!['create', 'update', 'complete', 'retire'].includes(a.type)) return false;
      return true;
    });

    return { displayText, actions: validActions };
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
