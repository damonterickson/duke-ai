/**
 * POST /api/briefing — Non-streaming briefing generation
 *
 * Generates a daily OML briefing via OpenRouter.
 * Parses goal action blocks from the response.
 */

import { NextRequest } from 'next/server';
import {
  VANGUARD_SYSTEM_PROMPT,
  GOAL_MANAGEMENT_PROMPT,
  BRIEFING_USER_PROMPT,
  OPENROUTER_API_URL,
  BRIEFING_MODEL,
  MAX_TOKENS_INSIGHT,
} from '@/services/prompts';
import { parseGoalActions } from '@/services/goalEngine';
import { requireAuth, sanitizeContext } from '../_auth';

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  let rawBody: { context: unknown; enableGoals?: boolean };
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = { context: sanitizeContext(rawBody.context), enableGoals: rawBody.enableGoals === true };

  const { context, enableGoals } = body;

  if (typeof context !== 'string') {
    return Response.json({ error: 'Missing required field: context (string)' }, { status: 400 });
  }

  const systemPrompt = enableGoals
    ? `${VANGUARD_SYSTEM_PROMPT}\n${GOAL_MANAGEMENT_PROMPT}\n\nCADET CONTEXT:\n${context}`
    : `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${context}`;

  // Try up to 2 times with backoff
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

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
          max_tokens: MAX_TOKENS_INSIGHT,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: BRIEFING_USER_PROMPT },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content ?? '';

      if (!rawText) continue;

      const { displayText, actions } = enableGoals
        ? parseGoalActions(rawText)
        : { displayText: rawText, actions: [] };

      return Response.json({
        text: displayText,
        goalActions: actions.length > 0 ? actions : undefined,
      });
    } catch (error) {
      console.warn(`[briefing/route] Attempt ${attempt + 1} failed:`, error);
    }
  }

  return Response.json({ error: 'Failed to generate briefing after retries' }, { status: 502 });
}
