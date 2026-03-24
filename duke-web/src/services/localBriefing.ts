/**
 * Local Briefing Generator — Offline/Fallback Briefing
 *
 * When the AI API is unavailable (offline, no key, error), generate a useful
 * briefing from LOCAL DATA ONLY. Ensures the app NEVER shows "No briefing available."
 *
 * Pure TypeScript. No external dependencies beyond types.
 */

import type { CadetProfile, OMLResult } from '../engine/oml';
import type { GoalRow, ScoreHistoryRow } from './storage';

/**
 * Generate a local briefing from available data. Always returns a non-empty string.
 */
export function generateLocalBriefing(
  profile: CadetProfile | null,
  omlResult: OMLResult | null,
  goals: GoalRow[],
  scoreHistory: ScoreHistoryRow[]
): string {
  // No profile or no data at all — welcome message
  if (!profile || (!omlResult && scoreHistory.length === 0 && goals.length === 0)) {
    return 'Welcome to Duke Vanguard. Enter your scores to get personalized insights.';
  }

  const lines: string[] = [];

  // OML score line
  if (omlResult && omlResult.totalScore > 0) {
    lines.push(`Your projected OML is ${omlResult.totalScore.toFixed(1)}.`);

    // Strongest / weakest pillar
    const pillars = omlResult.pillarScores;
    const pillarEntries: Array<{ name: string; score: number; max: number }> = [
      { name: 'Academic', score: pillars.academic, max: 400 },
      { name: 'Leadership', score: pillars.leadership, max: 400 },
      { name: 'Physical', score: pillars.physical, max: 200 },
    ];

    // Calculate percentages
    const withPct = pillarEntries.map((p) => ({
      ...p,
      pct: p.max > 0 ? Math.round((p.score / p.max) * 100) : 0,
    }));

    const strongest = withPct.reduce((a, b) => (a.pct >= b.pct ? a : b));
    const weakest = withPct.reduce((a, b) => (a.pct <= b.pct ? a : b));

    if (strongest.pct > 0) {
      lines.push(`${strongest.name} is your strongest pillar at ${strongest.pct}%.`);
    }

    if (weakest.pct < strongest.pct) {
      // Estimate marginal gain from improving weakest
      const topGain = omlResult.marginalGains
        ? Object.entries(omlResult.marginalGains)
            .sort(([, a], [, b]) => b - a)
            .find(([key]) => {
              const lowerKey = key.toLowerCase();
              const lowerWeakest = weakest.name.toLowerCase();
              if (lowerWeakest === 'academic') return lowerKey.includes('gpa');
              if (lowerWeakest === 'physical') return lowerKey.includes('acft');
              if (lowerWeakest === 'leadership') return lowerKey.includes('leadership') || lowerKey.includes('extracurricular');
              return false;
            })
        : undefined;

      if (topGain) {
        lines.push(
          `Your biggest opportunity is ${weakest.name} — improving it could add ${topGain[1].toFixed(1)} OML points.`
        );
      } else {
        lines.push(
          `Your biggest opportunity is ${weakest.name} at ${weakest.pct}% — focus here for the most OML impact.`
        );
      }
    }
  }

  // Score history trend
  if (scoreHistory.length > 1) {
    const newest = scoreHistory[0];
    const oldest = scoreHistory[scoreHistory.length - 1];
    if (newest.total_oml != null && oldest.total_oml != null) {
      const delta = newest.total_oml - oldest.total_oml;
      const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'remained stable';
      const dateStr = oldest.recorded_at
        ? new Date(oldest.recorded_at).toLocaleDateString()
        : 'your first entry';
      if (delta !== 0) {
        lines.push(
          `Your OML has ${direction} by ${Math.abs(Math.round(delta * 10) / 10)} points since ${dateStr}.`
        );
      }
    }
  }

  // Goal progress
  const activeGoals = goals.filter((g) => g.status === 'active');
  if (activeGoals.length > 0) {
    // Pick the closest-to-completion goal
    const goalsWithPct = activeGoals
      .map((g) => {
        const current = g.current_value ?? 0;
        const pct = g.target_value > 0 ? Math.round((current / g.target_value) * 100) : 0;
        const delta = g.target_value - current;
        return { ...g, pct, delta };
      })
      .sort((a, b) => b.pct - a.pct);

    const top = goalsWithPct[0];
    if (top.pct > 0) {
      lines.push(
        `${top.title} is ${top.pct}% complete — ${top.delta.toFixed(1)} to go by ${top.deadline}.`
      );
    } else {
      lines.push(`You have ${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''} set. Keep pushing!`);
    }
  }

  // Fallback if we somehow generated nothing despite having data
  if (lines.length === 0) {
    return 'Welcome to Duke Vanguard. Enter your scores to get personalized insights.';
  }

  return lines.join(' ');
}
