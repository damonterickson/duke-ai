/**
 * Goal Sync — Automatically update goal progress when scores change.
 *
 * Call syncGoalsWithScores() after any score is saved (GPA, ACFT, leadership).
 * It checks all active goals against the latest scores and updates progress.
 */

import { checkGoalProgress } from './goalEngine';
import type { GoalRow, ScoreHistoryRow } from './storage';

export interface GoalSyncResult {
  updated: Array<{ goalId: number; newValue: number; completed: boolean }>;
}

/**
 * Given active goals and the latest score entry, find goals that should be updated.
 */
export function syncGoalsWithScores(
  goals: GoalRow[],
  latestScore: ScoreHistoryRow
): GoalSyncResult {
  const updated: GoalSyncResult['updated'] = [];

  // Map score fields to goal metrics
  const metrics: Array<{ metric: string; value: number | null }> = [
    { metric: 'gpa', value: latestScore.gpa },
    { metric: 'acft_total', value: latestScore.acft_total },
    { metric: 'leadership_eval', value: latestScore.leadership_eval },
  ];

  // Also compute a rough total_oms for "overall" goals (100-point model)
  // academic ~= 22*(gpa/4), leadership ~= cerScore, physical ~= (aft/600)*6
  const gpa = latestScore.gpa ?? 0;
  const acft = latestScore.acft_total ?? 0;
  const lead = latestScore.leadership_eval ?? 0;
  const roughOms = Math.round((22 * (gpa / 4) + lead + (acft / 600) * 6) * 100) / 100;
  metrics.push({ metric: 'total_oms', value: roughOms > 0 ? roughOms : null });

  for (const { metric, value } of metrics) {
    if (value === null || value === 0) continue;

    const updates = checkGoalProgress(goals, { metric, value });
    updated.push(...updates);
  }

  return { updated };
}
