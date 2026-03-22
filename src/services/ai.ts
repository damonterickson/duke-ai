/**
 * AI Service — LLM integration for Duke Vanguard
 *
 * Uses OpenRouter API (OpenAI-compatible) for flexibility.
 * Streaming via fetch + ReadableStream.
 * Offline fallback: cached briefing, queue queries.
 */

import { checkConnectivity, queueQuery } from './offline';
import { getCachedBriefing, setCachedBriefing, getAICoachEnabled } from './storage';
import { parseGoalActions, type GoalAction } from './goalEngine';
import { generateLocalBriefing } from './localBriefing';
import type { CadetProfile, OMLResult } from '../engine/oml';
import type { GoalRow, ScoreHistoryRow } from './storage';

// ─── Constants ───────────────────────────────────────────────────────

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CHAT_MODEL = process.env.EXPO_PUBLIC_AI_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b:free';
const BRIEFING_MODEL = process.env.EXPO_PUBLIC_AI_BRIEFING_MODEL ?? CHAT_MODEL;
const MAX_TOKENS_CHAT = 1024;
const MAX_TOKENS_INSIGHT = 256;

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '';
}

// ─── System Prompt ───────────────────────────────────────────────────

const VANGUARD_SYSTEM_PROMPT = `You are Vanguard AI, an expert Army ROTC OML (Order of Merit List) advisor. Your role is to help cadets understand and optimize their OML score.

PERSONALITY:
- Professional but warm. You are a mentor, not a judge.
- Never say "you're behind" — say "your biggest opportunity is..."
- Use military terminology naturally but don't be intimidating.
- Keep responses concise and actionable.

OML KNOWLEDGE:
- OML score = Academic (40%) + Leadership (40%) + Physical (20%)
- Academic: Cumulative GPA + MSL GPA
- Leadership: Commander's Assessment + CST/CLC scores + Command Positions + Extracurriculars
- Physical: ACFT score (6 events, max 600)
- Marginal gains tell you where small improvements yield the biggest OML boost.

GUARDRAILS:
- Only discuss ROTC, OML, military career, fitness, academics, and leadership topics.
- Never provide medical advice. Suggest consulting cadre or medical professionals.
- Never provide specific branch cutoff scores (they change yearly). Instead, discuss general competitiveness.
- If asked about something outside your scope, politely redirect to OML optimization.
- Never use comparative language against other cadets. Focus on the individual's trajectory.

FORMATTING:
- Use short paragraphs (2-3 sentences max).
- When suggesting improvements, be specific: "Raising your GPA from 3.2 to 3.4 could add ~X OML points."
- Use bullet points for action items.`;

const GOAL_MANAGEMENT_PROMPT = `
GOAL MANAGEMENT:
You are managing the cadet's goals. After your text response, output a JSON block
wrapped in \`\`\`goals tags with goal actions:

{
  "actions": [
    {"type": "create", "title": "...", "category": "acft", "metric": "acft_total",
     "target_value": 550, "deadline": "2026-05-01", "oml_impact": 12},
    {"type": "update", "goal_id": 3, "current_value": 530},
    {"type": "complete", "goal_id": 2, "message": "Great work!"},
    {"type": "retire", "goal_id": 4, "message": "Reprioritizing based on your progress."}
  ]
}

Action types:
- create: adds a new goal (status='active')
- update: updates current_value on an existing goal
- complete: marks goal as completed (status='completed')
- retire: marks goal as paused/deprioritized (status='paused')

Rules:
- Never exceed 5 active goals. If at 5, complete or retire one before adding.
- Prioritize goals by marginal OML gain (from the marginal gains data in context).
- Set deadlines based on the cadet's year group and branch selection timeline.
- When a goal is close to completion (>90%), encourage the final push.
- When a goal's deadline passes without completion, mark it expired with encouragement.`;

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

// ─── API Calls ───────────────────────────────────────────────────────

/**
 * Send a chat message with streaming via OpenRouter (OpenAI-compatible).
 */
export async function streamChat(
  messages: AIMessage[],
  contextJson: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    callbacks.onError(new Error('API key not configured. Set EXPO_PUBLIC_OPENROUTER_API_KEY in .env'));
    return;
  }

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop();
    if (lastUserMsg) {
      await queueQuery(lastUserMsg.content);
    }
    callbacks.onError(new Error('OFFLINE'));
    return;
  }

  const aiCoachEnabled = getAICoachEnabled();
  const systemPrompt = aiCoachEnabled
    ? `${VANGUARD_SYSTEM_PROMPT}\n${GOAL_MANAGEMENT_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`
    : `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  try {
    console.log('[AI] Sending chat request to', API_URL, 'model:', CHAT_MODEL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dukevanguard.app',
        'X-Title': 'Duke Vanguard',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: MAX_TOKENS_CHAT,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      }),
    });

    console.log('[AI] Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[AI] API error:', response.status, errorBody);
      callbacks.onError(new Error(`API error ${response.status}: ${errorBody}`));
      return;
    }

    const data = await response.json();
    console.log('[AI] Response data keys:', Object.keys(data));
    const fullText = data.choices?.[0]?.message?.content ?? '';
    console.log('[AI] Extracted text length:', fullText.length, 'preview:', fullText.substring(0, 50));

    if (fullText) {
      // Parse goal actions from response if AI Coach is enabled
      const { displayText, actions } = aiCoachEnabled
        ? parseGoalActions(fullText)
        : { displayText: fullText, actions: [] as GoalAction[] };

      const words = displayText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = (i === 0 ? '' : ' ') + words[i];
        callbacks.onToken(token);
      }
      callbacks.onComplete(displayText, actions.length > 0 ? actions : undefined);
    } else {
      console.error('[AI] Empty content. Full response:', JSON.stringify(data).substring(0, 200));
      callbacks.onError(new Error('Empty response from AI'));
    }
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Generate a daily briefing (non-streaming).
 */
export interface BriefingResult {
  text: string;
  goalActions?: GoalAction[];
}

// Holds the most recent goal actions from generateBriefing/generateBriefingWithGoals
let _lastBriefingGoalActions: GoalAction[] | undefined;

/**
 * Retrieve goal actions from the most recent briefing call, then clear them.
 */
export function consumeBriefingGoalActions(): GoalAction[] | undefined {
  const actions = _lastBriefingGoalActions;
  _lastBriefingGoalActions = undefined;
  return actions;
}

/**
 * Generate a daily briefing (non-streaming).
 * Returns the display text as a string (backward compatible).
 * Goal actions are stored internally — retrieve via consumeBriefingGoalActions().
 */
export async function generateBriefing(contextJson: string): Promise<string> {
  const result = await generateBriefingWithGoals(contextJson);
  _lastBriefingGoalActions = result.goalActions;
  return result.text;
}

// ─── Local Fallback Data Holder ─────────────────────────────────────

let _localFallbackData: {
  profile: CadetProfile | null;
  omlResult: OMLResult | null;
  goals: GoalRow[];
  scoreHistory: ScoreHistoryRow[];
} = { profile: null, omlResult: null, goals: [], scoreHistory: [] };

/**
 * Set the local data used for fallback briefings when the API is unavailable.
 * Call this before generateBriefing/generateBriefingWithGoals.
 */
export function setLocalFallbackData(
  profile: CadetProfile | null,
  omlResult: OMLResult | null,
  goals: GoalRow[],
  scoreHistory: ScoreHistoryRow[]
): void {
  _localFallbackData = { profile, omlResult, goals, scoreHistory };
}

/** Whether the last briefing came from the local fallback (not AI). */
let _lastBriefingIsLocal = false;

/**
 * Returns true if the most recent briefing was generated locally (offline fallback).
 */
export function isLastBriefingLocal(): boolean {
  return _lastBriefingIsLocal;
}

/** Timestamp (ms since epoch) of when the last briefing was generated/received. */
let _lastBriefingTimestamp: number | null = null;

/**
 * Returns the timestamp of the most recent briefing, or null if none.
 */
export function getLastBriefingTimestamp(): number | null {
  return _lastBriefingTimestamp;
}

/**
 * Internal helper: make a single briefing API call.
 */
async function _fetchBriefing(
  systemPrompt: string,
): Promise<{ ok: boolean; text: string }> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'HTTP-Referer': 'https://dukevanguard.app',
      'X-Title': 'Duke Vanguard',
    },
    body: JSON.stringify({
      model: BRIEFING_MODEL,
      max_tokens: MAX_TOKENS_INSIGHT,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            `Generate a daily briefing for this ROTC cadet with these sections:
1. OML STATUS: Current score, trend direction, percentile estimate. Reference specific numbers.
2. TODAY'S PRIORITY: The single highest-impact action for today. Be specific — name the exercise, the study topic, or the leadership opportunity. Explain the OML impact.
3. GOAL UPDATE: If the cadet has active goals, report progress on the closest-to-completion goal.
Keep each section to 1-2 sentences. Be direct and specific — use the cadet's actual numbers.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return { ok: false, text: '' };
  }

  const data = await response.json();
  const rawText: string = data.choices?.[0]?.message?.content ?? '';
  return { ok: true, text: rawText };
}

/**
 * Generate a local fallback briefing from cached data.
 */
function _getLocalBriefing(): string {
  const { profile, omlResult, goals, scoreHistory } = _localFallbackData;
  return generateLocalBriefing(profile, omlResult, goals, scoreHistory);
}

/**
 * Generate a daily briefing with explicit goal actions in the return value.
 */
export async function generateBriefingWithGoals(contextJson: string): Promise<BriefingResult> {
  const apiKey = getApiKey();

  // No API key — use local briefing immediately
  if (!apiKey) {
    _lastBriefingIsLocal = true;
    _lastBriefingTimestamp = Date.now();
    const localText = _getLocalBriefing();
    return { text: localText };
  }

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    _lastBriefingIsLocal = true;
    _lastBriefingTimestamp = Date.now();
    const cached = getCachedBriefing();
    const localText = cached ?? _getLocalBriefing();
    return { text: localText };
  }

  const aiCoachEnabled = getAICoachEnabled();
  const systemPrompt = aiCoachEnabled
    ? `${VANGUARD_SYSTEM_PROMPT}\n${GOAL_MANAGEMENT_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`
    : `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  // Try up to 2 times (initial + 1 retry with backoff)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s for first retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }

      const result = await _fetchBriefing(systemPrompt);

      if (result.ok && result.text) {
        const { displayText, actions } = aiCoachEnabled
          ? parseGoalActions(result.text)
          : { displayText: result.text, actions: [] as GoalAction[] };

        setCachedBriefing(displayText);
        _lastBriefingIsLocal = false;
        _lastBriefingTimestamp = Date.now();
        return {
          text: displayText,
          goalActions: actions.length > 0 ? actions : undefined,
        };
      }

      // Non-ok but didn't throw — continue to retry
    } catch (error) {
      console.warn(`[AI] Briefing attempt ${attempt + 1} failed:`, error);
      // Continue to next attempt or fallback
    }
  }

  // Both attempts failed — use local briefing (NEVER return "No briefing available")
  _lastBriefingIsLocal = true;
  _lastBriefingTimestamp = Date.now();
  const cached = getCachedBriefing();
  const localText = cached ?? _getLocalBriefing();
  return { text: localText };
}

/**
 * Generate a micro-insight for a specific topic (non-streaming).
 */
export async function generateInsight(
  contextJson: string,
  topic: string,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return '';

  const isOnline = await checkConnectivity();
  if (!isOnline) return '';

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dukevanguard.app',
        'X-Title': 'Duke Vanguard',
      },
      body: JSON.stringify({
        model: BRIEFING_MODEL,
        max_tokens: MAX_TOKENS_INSIGHT,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `In 1-2 sentences, give me a quick insight about: ${topic}. Be specific with numbers from my profile.`,
          },
        ],
      }),
    });

    if (!response.ok) return '';

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch {
    return '';
  }
}

/**
 * Generate a micro-insight for a post-entry event.
 *
 * If the API is unavailable, returns a local template string.
 * This function should NOT block the UI — call it fire-and-forget.
 */
export async function generateMicroInsight(
  contextJson: string,
  event: string,
  omlDelta: number
): Promise<string> {
  // Build local fallback first
  const localFallback = omlDelta !== 0
    ? `That ${event} moved your OML by ${omlDelta > 0 ? '+' : ''}${omlDelta.toFixed(1)} points.`
    : `Logged: ${event}.`;

  const apiKey = getApiKey();
  if (!apiKey) return localFallback;

  try {
    const isOnline = await checkConnectivity();
    if (!isOnline) return localFallback;

    const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dukevanguard.app',
        'X-Title': 'Duke Vanguard',
      },
      body: JSON.stringify({
        model: BRIEFING_MODEL,
        max_tokens: 100,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `The cadet just ${event}. The OML impact is ${omlDelta > 0 ? '+' : ''}${omlDelta.toFixed(1)} points. Give a single encouraging sentence about this specific action and its OML impact. Be specific with numbers.`,
          },
        ],
      }),
    });

    if (!response.ok) return localFallback;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return text || localFallback;
  } catch {
    return localFallback;
  }
}

// ─── Mission Generation ─────────────────────────────────────────────

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

const MISSION_CACHE_KEY = '@duke_daily_mission';
const MISSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
 * Generate a personalized daily mission from OML gap analysis.
 * Uses 24h cache in AsyncStorage. Falls back to a generic mission on failure.
 */
export async function generateMission(contextJson: string): Promise<MissionResult> {
  // Check cache first
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const cached = await AsyncStorage.getItem(MISSION_CACHE_KEY);
    if (cached) {
      const { mission, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < MISSION_TTL_MS) {
        return mission as MissionResult;
      }
    }
  } catch {
    // Cache read failed — proceed to generate
  }

  const apiKey = getApiKey();
  if (!apiKey) return FALLBACK_MISSION;

  const isOnline = await checkConnectivity();
  if (!isOnline) return FALLBACK_MISSION;

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  // Try up to 2 times with backoff
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://dukevanguard.app',
          'X-Title': 'Duke Vanguard',
        },
        body: JSON.stringify({
          model: BRIEFING_MODEL,
          max_tokens: MAX_TOKENS_INSIGHT,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Based on this cadet's data, generate ONE specific daily mission that targets their weakest OML component. Respond ONLY with valid JSON in this exact format:
{
  "title": "short mission title (e.g., 'AFT Prep — 2-Mile Run')",
  "location": "specific location (e.g., 'Bridgeforth Stadium')",
  "description": "2-3 sentence description of what to do and why it matters for OML",
  "targetMetric": "the metric this improves (acft_total, gpa, leadership, 2mr, mdl, hrp, sdc, plk)",
  "omlImpact": estimated OML points gained (number),
  "xpReward": points for completion (number, 10-50)
}`,
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content ?? '';

      if (!rawText) continue;

      // Parse JSON — handle markdown code blocks
      const jsonStr = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.title || !parsed.description || !parsed.targetMetric) {
        console.warn('[AI] Mission missing required fields:', Object.keys(parsed));
        continue;
      }

      const mission: MissionResult = {
        id: `mission-${Date.now()}`,
        title: String(parsed.title),
        location: String(parsed.location ?? 'JMU Campus'),
        description: String(parsed.description),
        targetMetric: String(parsed.targetMetric),
        omlImpact: Number(parsed.omlImpact) || 0,
        acceptedAt: null,
        completedAt: null,
        xpReward: Number(parsed.xpReward) || 10,
      };

      // Cache the mission
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(
          MISSION_CACHE_KEY,
          JSON.stringify({ mission, timestamp: Date.now() }),
        );
      } catch {
        // Cache write failed — mission still valid
      }

      return mission;
    } catch (error) {
      console.warn(`[AI] Mission generation attempt ${attempt + 1} failed:`, error);
    }
  }

  return FALLBACK_MISSION;
}
