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

/**
 * Generate a daily briefing with explicit goal actions in the return value.
 */
export async function generateBriefingWithGoals(contextJson: string): Promise<BriefingResult> {
  const apiKey = getApiKey();
  const cached = getCachedBriefing();

  if (!apiKey) {
    return { text: cached ?? 'Configure your API key to get personalized briefings.' };
  }

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    return { text: cached ?? 'You\'re offline. Your briefing will update when you reconnect.' };
  }

  const aiCoachEnabled = getAICoachEnabled();
  const systemPrompt = aiCoachEnabled
    ? `${VANGUARD_SYSTEM_PROMPT}\n${GOAL_MANAGEMENT_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`
    : `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

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
            content:
              'Generate a concise daily briefing (3-4 sentences). Cover: current OML standing, the single highest-impact action to take today, and an encouraging closer. Be specific with numbers from my profile.',
          },
        ],
      }),
    });

    if (!response.ok) {
      return { text: cached ?? 'Unable to generate briefing right now. Check back later.' };
    }

    const data = await response.json();
    const rawText: string = data.choices?.[0]?.message?.content ?? '';

    if (rawText) {
      // Parse goal actions from response if AI Coach is enabled
      const { displayText, actions } = aiCoachEnabled
        ? parseGoalActions(rawText)
        : { displayText: rawText, actions: [] as GoalAction[] };

      setCachedBriefing(displayText);
      return {
        text: displayText,
        goalActions: actions.length > 0 ? actions : undefined,
      };
    }

    return { text: cached || 'No briefing available.' };
  } catch {
    return { text: cached ?? 'Unable to generate briefing right now. Check back later.' };
  }
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
