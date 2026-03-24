/**
 * AI Service — Client-side LLM integration for Duke Vanguard (Web)
 *
 * All API calls go through our Next.js API routes (/api/chat, /api/briefing, etc.)
 * which proxy to OpenRouter server-side. No API key needed on the client.
 *
 * Streaming via fetch + ReadableStream (SSE).
 * Offline fallback: cached briefing from localStorage, local briefing generator.
 */

import { parseGoalActions, type GoalAction } from './goalEngine';
import { generateLocalBriefing } from './localBriefing';
import type { CadetProfile, OMLResult } from '../engine/oml';
import type { GoalRow, ScoreHistoryRow } from './storage';
export type { GoalAction } from './goalEngine';

// Re-export prompts for context building on the client
export {
  VANGUARD_SYSTEM_PROMPT,
  GOAL_MANAGEMENT_PROMPT,
} from './prompts';

// ─── Types ───────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string, goalActions?: GoalAction[]) => void;
  onError: (error: Error) => void;
}

export interface BriefingResult {
  text: string;
  goalActions?: GoalAction[];
}

export interface MissionResult {
  id: string;
  title: string;
  location: string;
  description: string;
  targetMetric: string;
  omlImpact: number;
  acceptedAt: string | null;
  completedAt: string | null;
  xpReward: number;
}

// ─── Cache Keys ──────────────────────────────────────────────────────

const BRIEFING_CACHE_KEY = '@duke_cached_briefing';
const MISSION_CACHE_KEY = '@duke_daily_mission';
const MISSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Local Fallback Data ─────────────────────────────────────────────

let _localFallbackData: {
  profile: CadetProfile | null;
  omlResult: OMLResult | null;
  goals: GoalRow[];
  scoreHistory: ScoreHistoryRow[];
} = { profile: null, omlResult: null, goals: [], scoreHistory: [] };

/**
 * Set the local data used for fallback briefings when the API is unavailable.
 */
export function setLocalFallbackData(
  profile: CadetProfile | null,
  omlResult: OMLResult | null,
  goals: GoalRow[],
  scoreHistory: ScoreHistoryRow[],
): void {
  _localFallbackData = { profile, omlResult, goals, scoreHistory };
}

// ─── Briefing State ──────────────────────────────────────────────────

let _lastBriefingGoalActions: GoalAction[] | undefined;
let _lastBriefingIsLocal = false;
let _lastBriefingTimestamp: number | null = null;

export function consumeBriefingGoalActions(): GoalAction[] | undefined {
  const actions = _lastBriefingGoalActions;
  _lastBriefingGoalActions = undefined;
  return actions;
}

export function isLastBriefingLocal(): boolean {
  return _lastBriefingIsLocal;
}

export function getLastBriefingTimestamp(): number | null {
  return _lastBriefingTimestamp;
}

// ─── localStorage Helpers ────────────────────────────────────────────

function getCachedBriefing(): string | null {
  try {
    return localStorage.getItem(BRIEFING_CACHE_KEY);
  } catch {
    return null;
  }
}

function setCachedBriefing(text: string): void {
  try {
    localStorage.setItem(BRIEFING_CACHE_KEY, text);
  } catch {
    // Storage full or unavailable
  }
}

// ─── Streaming Chat ──────────────────────────────────────────────────

/**
 * Send a chat message with streaming via our API route.
 * The API route proxies to OpenRouter with the API key server-side.
 */
export async function streamChat(
  messages: AIMessage[],
  contextJson: string,
  callbacks: StreamCallbacks,
  enableGoals = false,
): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        context: contextJson,
        enableGoals,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      callbacks.onError(new Error(errorData.error || `API error ${response.status}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError(new Error('No response stream'));
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          if (json.content) {
            fullText += json.content;
            callbacks.onToken(json.content);
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    if (fullText) {
      const { displayText, actions } = enableGoals
        ? parseGoalActions(fullText)
        : { displayText: fullText, actions: [] as GoalAction[] };

      callbacks.onComplete(displayText, actions.length > 0 ? actions : undefined);
    } else {
      callbacks.onError(new Error('Empty response from AI'));
    }
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

// ─── Briefing ────────────────────────────────────────────────────────

function _getLocalBriefing(): string {
  const { profile, omlResult, goals, scoreHistory } = _localFallbackData;
  return generateLocalBriefing(profile, omlResult, goals, scoreHistory);
}

/**
 * Generate a daily briefing (non-streaming).
 * Returns the display text as a string (backward compatible).
 */
export async function generateBriefing(contextJson: string): Promise<string> {
  const result = await generateBriefingWithGoals(contextJson);
  _lastBriefingGoalActions = result.goalActions;
  return result.text;
}

/**
 * Generate a daily briefing with explicit goal actions.
 */
export async function generateBriefingWithGoals(
  contextJson: string,
  enableGoals = false,
): Promise<BriefingResult> {
  try {
    const response = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: contextJson, enableGoals }),
    });

    if (!response.ok) {
      throw new Error(`Briefing API error ${response.status}`);
    }

    const data = await response.json();

    if (data.text) {
      setCachedBriefing(data.text);
      _lastBriefingIsLocal = false;
      _lastBriefingTimestamp = Date.now();
      return {
        text: data.text,
        goalActions: data.goalActions,
      };
    }

    throw new Error('Empty briefing response');
  } catch (error) {
    console.warn('[AI] Briefing failed, using local fallback:', error);
    _lastBriefingIsLocal = true;
    _lastBriefingTimestamp = Date.now();
    const cached = getCachedBriefing();
    const localText = cached ?? _getLocalBriefing();
    return { text: localText };
  }
}

// ─── Insights ────────────────────────────────────────────────────────

/**
 * Generate a micro-insight for a specific topic (non-streaming).
 */
export async function generateInsight(
  contextJson: string,
  topic: string,
): Promise<string> {
  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: contextJson, topic }),
    });

    if (!response.ok) return '';

    const data = await response.json();
    return data.insight ?? '';
  } catch {
    return '';
  }
}

/**
 * Generate a micro-insight for a post-entry event.
 */
export async function generateMicroInsight(
  contextJson: string,
  event: string,
  omlDelta: number,
): Promise<string> {
  const localFallback = omlDelta !== 0
    ? `That ${event} moved your OML by ${omlDelta > 0 ? '+' : ''}${omlDelta.toFixed(1)} points.`
    : `Logged: ${event}.`;

  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: contextJson, event, omlDelta }),
    });

    if (!response.ok) return localFallback;

    const data = await response.json();
    return data.insight || localFallback;
  } catch {
    return localFallback;
  }
}

// ─── Mission Generation ─────────────────────────────────────────────

const FALLBACK_MISSION: MissionResult = {
  id: 'fallback',
  title: 'Review Your OML Standing',
  location: 'Duke Vanguard App',
  description: 'Check your current OML score and identify your biggest opportunity for improvement.',
  targetMetric: 'oml_review',
  omlImpact: 0,
  acceptedAt: null,
  completedAt: null,
  xpReward: 5,
};

/**
 * Generate a personalized daily mission.
 * Uses 24h cache in localStorage. Falls back to a generic mission on failure.
 */
export async function generateMission(contextJson: string): Promise<MissionResult> {
  // Check cache first
  try {
    const cached = localStorage.getItem(MISSION_CACHE_KEY);
    if (cached) {
      const { mission, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < MISSION_TTL_MS) {
        return mission as MissionResult;
      }
    }
  } catch {
    // Cache read failed
  }

  try {
    const response = await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: contextJson }),
    });

    if (!response.ok) return FALLBACK_MISSION;

    const data = await response.json();

    if (!data.title || !data.description) return FALLBACK_MISSION;

    const mission: MissionResult = {
      id: `mission-${Date.now()}`,
      title: data.title,
      location: data.location ?? 'JMU Campus',
      description: data.description,
      targetMetric: data.targetMetric,
      omlImpact: data.omlImpact ?? 0,
      acceptedAt: null,
      completedAt: null,
      xpReward: data.xpReward ?? 10,
    };

    // Cache the mission
    try {
      localStorage.setItem(
        MISSION_CACHE_KEY,
        JSON.stringify({ mission, timestamp: Date.now() }),
      );
    } catch {
      // Cache write failed
    }

    return mission;
  } catch {
    return FALLBACK_MISSION;
  }
}
