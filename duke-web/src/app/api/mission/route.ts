/**
 * POST /api/mission — Daily mission generation
 *
 * Generates a personalized daily mission targeting the cadet's weakest OML component.
 */

import { NextRequest } from 'next/server';
import {
  VANGUARD_SYSTEM_PROMPT,
  MISSION_USER_PROMPT,
  OPENROUTER_API_URL,
  BRIEFING_MODEL,
  MAX_TOKENS_INSIGHT,
} from '@/services/prompts';
import { requireAuth, sanitizeContext } from '../_auth';

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  let rawBody: { context: unknown };
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const context = sanitizeContext(rawBody.context);

  if (typeof context !== 'string') {
    return Response.json({ error: 'Missing required field: context (string)' }, { status: 400 });
  }

  const systemPrompt = `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${context}`;

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
            { role: 'user', content: MISSION_USER_PROMPT },
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
        console.warn('[mission/route] Mission missing required fields:', Object.keys(parsed));
        continue;
      }

      return Response.json({
        title: String(parsed.title),
        description: String(parsed.description),
        targetMetric: String(parsed.targetMetric),
        targetValue: Number(parsed.omlImpact) || 0,
        location: String(parsed.location ?? 'JMU Campus'),
        duration: String(parsed.duration ?? '30 min'),
        omlImpact: Number(parsed.omlImpact) || 0,
        xpReward: Number(parsed.xpReward) || 10,
      });
    } catch (error) {
      console.warn(`[mission/route] Attempt ${attempt + 1} failed:`, error);
    }
  }

  // Fallback mission
  return Response.json({
    title: 'Review Your OML Standing',
    description: 'Check your current OML score and identify your biggest opportunity for improvement.',
    targetMetric: 'oml_review',
    targetValue: 0,
    location: 'Duke Vanguard App',
    duration: '15 min',
    omlImpact: 0,
    xpReward: 5,
  });
}
