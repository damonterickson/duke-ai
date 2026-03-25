/**
 * Context Engine — assembles cadet profile into structured JSON for LLM system prompt.
 *
 * Pure TypeScript. No external dependencies.
 */

import type { CadetProfile, OMLResult } from './oml';
import type { GoalRow, ScoreHistoryRow } from '../services/storage';

// ─── Types ───────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TrendEntry {
  totalScore: number;
  pillarScores: {
    academic: number;
    leadership: number;
    physical: number;
  };
  recordedAt: number;
}

export interface ContextOutput {
  profile: {
    yearGroup: string;
    gender: string;
    ageBracket: string;
    gpa: number;
    mslGpa: number;
    leadershipEval: number;
    cstScore?: number;
    clcScore?: number;
    commandRoles: string[];
    extracurricularHours: number;
  };
  oml: {
    totalScore: number;
    pillarScores: {
      academic: number;
      leadership: number;
      physical: number;
    };
  };
  pillarDeltas?: {
    academic: number;
    leadership: number;
    physical: number;
    total: number;
  };
  trend?: {
    entries: Array<{
      total: number;
      academic: number;
      leadership: number;
      physical: number;
      date: string;
    }>;
    direction: 'improving' | 'declining' | 'stable';
  };
  active_goals?: Array<{
    id: number;
    title: string;
    current: number | null;
    target: number;
    deadline: string;
    pct_complete: number;
  }>;
  score_history?: Array<{
    gpa: number | null;
    acft_total: number | null;
    total_oml: number | null;
    recorded_at: string;
  }>;
  marginal_gains?: Array<{ action: string; impact: number }>;
  recent_activity?: Array<{
    total_oml: number | null;
    recorded_at: string;
  }>;
  upcoming_deadlines?: Array<{
    title: string;
    deadline: string;
    days_remaining: number;
  }>;
  topGains: Array<{ action: string; impact: number }>;
  recentConversation: Array<{ role: string; content: string }>;
}

// ─── Constants ───────────────────────────────────────────────────────

/** Target ~800 tokens. Approximate 1 token ≈ 4 characters. */
const TOKEN_BUDGET = 800;
const CHAR_BUDGET = TOKEN_BUDGET * 4; // 3200 characters
const MAX_CONVERSATION_TURNS = 5;
const MAX_TREND_ENTRIES = 3;
const MAX_TOP_GAINS = 3;

// ─── Helpers ─────────────────────────────────────────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function determineTrendDirection(entries: TrendEntry[]): 'improving' | 'declining' | 'stable' {
  if (entries.length < 2) return 'stable';

  const first = entries[0].totalScore;
  const last = entries[entries.length - 1].totalScore;
  const delta = last - first;

  if (delta > 5) return 'improving';
  if (delta < -5) return 'declining';
  return 'stable';
}

function sortMarginalGains(
  gains: { [input: string]: number }
): Array<{ action: string; impact: number }> {
  return Object.entries(gains)
    .map(([action, impact]) => ({ action, impact }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, MAX_TOP_GAINS);
}

// ─── Main Entry Point ────────────────────────────────────────────────

export function buildContext(
  profile: CadetProfile,
  omlResult: OMLResult,
  history: ConversationTurn[],
  trendData?: TrendEntry[],
  activeGoals?: GoalRow[],
  scoreHistory?: ScoreHistoryRow[]
): string {
  // Build the base context object
  const ctx: ContextOutput = {
    profile: {
      yearGroup: profile.yearGroup,
      gender: profile.gender,
      ageBracket: profile.ageBracket,
      gpa: profile.gpa,
      mslGpa: profile.mslGpa,
      leadershipEval: profile.leadershipEval,
      commandRoles: profile.commandRoles,
      extracurricularHours: profile.extracurricularHours,
    },
    oml: {
      totalScore: omlResult.totalScore,
      pillarScores: { ...omlResult.pillarScores },
    },
    topGains: sortMarginalGains(omlResult.marginalGains),
    recentConversation: [],
  };

  // Optional fields
  if (profile.cstScore !== undefined) {
    ctx.profile.cstScore = profile.cstScore;
  }
  if (profile.clcScore !== undefined) {
    ctx.profile.clcScore = profile.clcScore;
  }

  // Pillar deltas from trend data
  if (trendData && trendData.length >= 2) {
    const prev = trendData[trendData.length - 2];
    const curr = trendData[trendData.length - 1];
    ctx.pillarDeltas = {
      academic: Math.round((curr.pillarScores.academic - prev.pillarScores.academic) * 100) / 100,
      leadership: Math.round((curr.pillarScores.leadership - prev.pillarScores.leadership) * 100) / 100,
      physical: Math.round((curr.pillarScores.physical - prev.pillarScores.physical) * 100) / 100,
      total: Math.round((curr.totalScore - prev.totalScore) * 100) / 100,
    };
  }

  // Trend summary (last 3 entries)
  if (trendData && trendData.length > 0) {
    const recentTrend = trendData.slice(-MAX_TREND_ENTRIES);
    ctx.trend = {
      entries: recentTrend.map((e) => ({
        total: e.totalScore,
        academic: e.pillarScores.academic,
        leadership: e.pillarScores.leadership,
        physical: e.pillarScores.physical,
        date: new Date(e.recordedAt).toISOString().split('T')[0],
      })),
      direction: determineTrendDirection(recentTrend),
    };
  }

  // Add conversation history (most recent turns last)
  const recentHistory = history.slice(-MAX_CONVERSATION_TURNS);
  ctx.recentConversation = recentHistory.map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  // Add active goals with percent complete
  if (activeGoals && activeGoals.length > 0) {
    ctx.active_goals = activeGoals.map((g) => {
      const current = g.current_value ?? 0;
      const pct_complete = g.target_value > 0
        ? Math.round((current / g.target_value) * 100)
        : 0;
      return {
        id: g.id!,
        title: g.title,
        current: g.current_value,
        target: g.target_value,
        deadline: g.deadline,
        pct_complete,
      };
    });
  }

  // Score history — last 5 entries with dates and values
  if (scoreHistory && scoreHistory.length > 0) {
    ctx.score_history = scoreHistory.slice(0, 5).map((s) => ({
      gpa: s.gpa,
      acft_total: s.acft_total,
      total_oml: s.total_oml,
      recorded_at: s.recorded_at ?? '',
    }));
  }

  // Marginal gains — top 3 improvements ranked by OML impact
  if (omlResult.marginalGains && Object.keys(omlResult.marginalGains).length > 0) {
    ctx.marginal_gains = sortMarginalGains(omlResult.marginalGains);
  }

  // Recent activity — last 3 score_history entries
  if (scoreHistory && scoreHistory.length > 0) {
    ctx.recent_activity = scoreHistory.slice(0, 3).map((s) => ({
      total_oml: s.total_oml,
      recorded_at: s.recorded_at ?? '',
    }));
  }

  // Upcoming deadlines — goal deadlines within 14 days
  if (activeGoals && activeGoals.length > 0) {
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    const upcoming = activeGoals
      .filter((g) => g.status === 'active')
      .map((g) => {
        const deadlineMs = Date.parse(g.deadline);
        const days_remaining = Math.ceil((deadlineMs - now) / (24 * 60 * 60 * 1000));
        return { title: g.title, deadline: g.deadline, days_remaining };
      })
      .filter((g) => g.days_remaining >= 0 && g.days_remaining <= 14)
      .sort((a, b) => a.days_remaining - b.days_remaining);

    if (upcoming.length > 0) {
      ctx.upcoming_deadlines = upcoming;
    }
  }

  // Check token budget and trim if needed
  let output = JSON.stringify(ctx);

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // First: trim conversation turns oldest-first
    while (ctx.recentConversation.length > 0 && estimateTokens(JSON.stringify(ctx)) > TOKEN_BUDGET) {
      ctx.recentConversation.shift();
    }
    output = JSON.stringify(ctx);
  }

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // Remove recent_activity and upcoming_deadlines first (lower priority)
    delete ctx.recent_activity;
    delete ctx.upcoming_deadlines;
    output = JSON.stringify(ctx);
  }

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // Remove score_history
    delete ctx.score_history;
    output = JSON.stringify(ctx);
  }

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // Second: remove trend entries to compress
    if (ctx.trend) {
      ctx.trend.entries = ctx.trend.entries.slice(-1);
      output = JSON.stringify(ctx);
    }
  }

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // Third: remove trend entirely
    delete ctx.trend;
    delete ctx.pillarDeltas;
    output = JSON.stringify(ctx);
  }

  if (estimateTokens(output) > TOKEN_BUDGET) {
    // Fourth: remove active goals to fit budget
    delete ctx.active_goals;
    output = JSON.stringify(ctx);
  }

  return output;
}
