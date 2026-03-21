/**
 * AI Service — Claude API Integration
 *
 * Provides streaming chat, daily briefing generation, and micro-insights
 * using the Anthropic API directly from the client (pilot mode).
 */

import {
  getCachedBriefing,
  setCachedBriefing,
  getLastBriefingTime,
  setLastBriefingTime,
  getDataHash,
  setDataHash,
} from './storage';
import { isOnline, queueQuery } from './offline';

const API_URL = 'https://api.anthropic.com/v1/messages';
const CHAT_MODEL = 'claude-sonnet-4-6';
const MICRO_MODEL = 'claude-haiku-4-5-20251001';
const MAX_RETRIES = 3;
const BRIEFING_COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20 hours

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY not set');
  return key;
}

const SYSTEM_PROMPT = `You are Vanguard AI, a knowledgeable senior cadet and OML mentor for Army ROTC cadets.

## OML Formula Overview
The Order of Merit List (OML) score determines branching priority for ROTC cadets. It is composed of three pillars:
- Academic (40% weight): Based on cumulative GPA. Max 4.0 GPA = 40 points.
- Physical (20% weight): Based on ACFT score. Max 600 ACFT = 20 points.
- Leadership (40% weight): Based on CST performance, leadership roles, and extracurricular activities. Max 100 leadership score = 40 points.
- Total maximum: 100 points.

## Your Persona
- Be direct, specific, and actionable. Never give generic advice.
- Always reference the cadet's actual numbers when making recommendations.
- Professional but not stiff — like a trusted senior cadet mentor.
- Use concrete examples: "Raising your GPA from 3.2 to 3.5 would add 3.0 OML points" not "try to improve your GPA."
- Prioritize high-impact, achievable improvements.

## Guardrails
- Never speculate about other cadets' scores or rankings.
- Never guarantee specific rankings or branch assignments.
- Always caveat projections as estimates based on available data.
- If you don't have enough data to give specific advice, ask for more information.
- Stay focused on OML optimization — redirect off-topic questions politely.`;

interface APIMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callAPI(
  model: string,
  systemPrompt: string,
  messages: APIMessage[],
  stream: boolean = false
): Promise<Response> {
  const apiKey = getApiKey();

  const body = {
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
    stream,
  };

  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
}

async function callWithRetry(
  model: string,
  systemPrompt: string,
  messages: APIMessage[],
  stream: boolean = false,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await callAPI(model, systemPrompt, messages, stream);

      if (response.status === 429) {
        // Rate limited — exponential backoff
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (response.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('API call failed after retries');
}

/**
 * Streaming chat — yields tokens as they arrive
 */
export async function* sendMessage(
  message: string,
  context: string,
  conversationHistory: APIMessage[] = []
): AsyncGenerator<string> {
  const online = await isOnline();
  if (!online) {
    const cached = getCachedBriefing();
    if (cached) {
      yield "I'm currently offline. Here's your most recent briefing:\n\n" + cached;
    } else {
      yield "I'm currently offline and don't have a cached briefing. I'll queue your question for when connectivity returns.";
      queueQuery(message, context);
    }
    return;
  }

  try {
    const systemWithContext = `${SYSTEM_PROMPT}\n\n## Current Cadet Context\n${context}`;
    const messages: APIMessage[] = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const response = await callWithRetry(CHAT_MODEL, systemWithContext, messages, true);

    if (!response.ok) {
      const errorBody = await response.text();
      yield `I encountered an error (${response.status}). Please try again in a moment.`;
      console.error('API error:', response.status, errorBody);
      return;
    }

    if (!response.body) {
      yield "I couldn't process that response. Please try again.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }
  } catch (err) {
    console.error('sendMessage error:', err);
    yield "I couldn't process that response. Please try again.";
  }
}

/**
 * Generate daily briefing — non-streaming, cached
 */
export async function generateBriefing(context: string): Promise<string> {
  const online = await isOnline();
  if (!online) {
    return getCachedBriefing() || 'Unable to generate briefing while offline.';
  }

  try {
    const response = await callWithRetry(
      CHAT_MODEL,
      SYSTEM_PROMPT,
      [
        {
          role: 'user',
          content: `Based on the following cadet data, generate a concise daily briefing (3-5 sentences). Focus on: current OML standing, top priority improvement, and one specific actionable recommendation for today.\n\n${context}`,
        },
      ],
      false
    );

    if (!response.ok) {
      return getCachedBriefing() || 'Unable to generate briefing right now.';
    }

    const json = await response.json();
    const text = json.content?.[0]?.text || 'Unable to parse briefing response.';

    setCachedBriefing(text);
    setLastBriefingTime(Date.now());

    return text;
  } catch (err) {
    console.error('generateBriefing error:', err);
    return getCachedBriefing() || 'Unable to generate briefing right now.';
  }
}

/**
 * Generate micro-insight for score changes (uses cheaper model)
 */
export async function generateMicroInsight(event: string, delta: number): Promise<string> {
  const online = await isOnline();
  if (!online) return '';

  try {
    const direction = delta > 0 ? 'improved' : 'declined';
    const response = await callWithRetry(
      MICRO_MODEL,
      'You are a concise OML advisor. Respond in exactly one sentence.',
      [
        {
          role: 'user',
          content: `The cadet's ${event} ${direction} by ${Math.abs(delta)} points. Give a brief, specific reaction and next step.`,
        },
      ],
      false
    );

    if (!response.ok) return '';

    const json = await response.json();
    return json.content?.[0]?.text || '';
  } catch {
    return '';
  }
}

/**
 * Check if briefing needs refresh
 */
export function needsBriefingRefresh(currentDataHash: string): boolean {
  const lastTime = getLastBriefingTime();
  const lastHash = getDataHash();
  const elapsed = Date.now() - lastTime;

  if (elapsed > BRIEFING_COOLDOWN_MS) return true;
  if (lastHash !== currentDataHash) return true;
  return false;
}

/**
 * Compute a simple hash of current data for change detection
 */
export function computeDataHash(gpa: number, acft: number, leadership: number): string {
  return `${gpa.toFixed(2)}_${acft}_${leadership}`;
}
