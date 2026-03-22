/**
 * AI Service — LLM integration for Iron Vanguard
 *
 * Uses OpenRouter API (OpenAI-compatible) for flexibility.
 * Streaming via fetch + ReadableStream.
 * Offline fallback: cached briefing, queue queries.
 */

import { checkConnectivity, queueQuery } from './offline';
import { getCachedBriefing, setCachedBriefing } from './storage';

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

// ─── Types ───────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
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

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ironvanguard.app',
        'X-Title': 'Iron Vanguard',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: MAX_TOKENS_CHAT,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      callbacks.onError(new Error(`API error ${response.status}: ${errorBody}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError(new Error('No response stream available'));
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
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          // OpenAI-compatible format: choices[0].delta.content
          const token = event.choices?.[0]?.delta?.content;
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    callbacks.onComplete(fullText);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Generate a daily briefing (non-streaming).
 */
export async function generateBriefing(contextJson: string): Promise<string> {
  const apiKey = getApiKey();
  const cached = getCachedBriefing();

  if (!apiKey) {
    return cached ?? 'Configure your API key to get personalized briefings.';
  }

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    return cached ?? 'You\'re offline. Your briefing will update when you reconnect.';
  }

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${contextJson}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ironvanguard.app',
        'X-Title': 'Iron Vanguard',
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
      return cached ?? 'Unable to generate briefing right now. Check back later.';
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';

    if (text) {
      setCachedBriefing(text);
    }

    return text || cached || 'No briefing available.';
  } catch {
    return cached ?? 'Unable to generate briefing right now. Check back later.';
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
        'HTTP-Referer': 'https://ironvanguard.app',
        'X-Title': 'Iron Vanguard',
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
