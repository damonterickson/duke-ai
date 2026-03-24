/**
 * POST /api/chat — Streaming chat endpoint
 *
 * Proxies to OpenRouter with the Vanguard system prompt.
 * Returns a streaming text/event-stream response.
 */

import { NextRequest } from 'next/server';
import {
  VANGUARD_SYSTEM_PROMPT,
  GOAL_MANAGEMENT_PROMPT,
  OPENROUTER_API_URL,
  CHAT_MODEL,
  MAX_TOKENS_CHAT,
} from '@/services/prompts';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { messages: Array<{ role: string; content: string }>; context: string; enableGoals?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { messages, context, enableGoals } = body;

  if (!Array.isArray(messages) || typeof context !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: messages (array), context (string)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const systemPrompt = enableGoals
    ? `${VANGUARD_SYSTEM_PROMPT}\n${GOAL_MANAGEMENT_PROMPT}\n\nCADET CONTEXT:\n${context}`
    : `${VANGUARD_SYSTEM_PROMPT}\n\nCADET CONTEXT:\n${context}`;

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
      return new Response(
        JSON.stringify({ error: `OpenRouter API error ${response.status}`, details: errorBody }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Pipe the SSE stream from OpenRouter back to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE lines
            const lines = buffer.split('\n');
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (!trimmed.startsWith('data: ')) continue;

              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Skip malformed SSE chunks
              }
            }
          }
        } catch (error) {
          console.error('[chat/route] Stream error:', error);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[chat/route] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
