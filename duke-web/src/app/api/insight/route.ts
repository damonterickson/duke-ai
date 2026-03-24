/**
 * POST /api/insight — Micro-insight generation
 *
 * Generates a short, metric-specific insight via OpenRouter.
 * Supports both topic-based insights and post-entry micro-insights.
 */

import { NextRequest } from 'next/server';
import {
  VANGUARD_SYSTEM_PROMPT,
  OPENROUTER_API_URL,
  BRIEFING_MODEL,
  MAX_TOKENS_INSIGHT,
} from '@/services/prompts';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  let body: {
    context: string;
    metric?: string;
    value?: number;
    previousValue?: number;
    topic?: string;
    event?: string;
    omlDelta?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { context } = body;

  if (typeof context !== 'string') {
    return Response.json({ error: 'Missing required field: context (string)' }, { status: 400 });
  }

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${context}`;

  // Build the user prompt based on what was provided
  let userPrompt: string;
  let maxTokens = MAX_TOKENS_INSIGHT;

  if (body.event !== undefined) {
    // Micro-insight for a post-entry event
    const omlDelta = body.omlDelta ?? 0;
    userPrompt = `The cadet just ${body.event}. The OML impact is ${omlDelta > 0 ? '+' : ''}${omlDelta.toFixed(1)} points. Give a single encouraging sentence about this specific action and its OML impact. Be specific with numbers.`;
    maxTokens = 100;
  } else if (body.topic) {
    // Topic-based insight
    userPrompt = `In 1-2 sentences, give me a quick insight about: ${body.topic}. Be specific with numbers from my profile.`;
  } else if (body.metric !== undefined) {
    // Metric + value insight
    const changeNote = body.previousValue !== undefined
      ? ` (changed from ${body.previousValue} to ${body.value})`
      : '';
    userPrompt = `In 1-2 sentences, give a quick insight about the cadet's ${body.metric} at ${body.value}${changeNote}. Be specific with numbers from the profile.`;
  } else {
    return Response.json(
      { error: 'Must provide one of: topic, metric+value, or event' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dukevanguard.app',
        'X-Title': 'Duke Vanguard',
      },
      body: JSON.stringify({
        model: BRIEFING_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return Response.json(
        { error: `OpenRouter API error ${response.status}`, details: errorBody },
        { status: response.status },
      );
    }

    const data = await response.json();
    const insight: string = data.choices?.[0]?.message?.content ?? '';

    return Response.json({ insight });
  } catch (error) {
    console.error('[insight/route] Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
