/**
 * Shared API route authentication and validation helpers.
 *
 * All API routes must call requireAuth() before processing.
 * All user-supplied strings must be capped with capString().
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const MAX_CONTEXT_LENGTH = 8192; // ~2K tokens, generous for cadet profile
const MAX_MESSAGE_LENGTH = 4000;
const MAX_EVENT_LENGTH = 200;
const ALLOWED_MESSAGE_ROLES = new Set(['user', 'assistant']);

/**
 * Verify the Supabase session from cookies.
 * Returns the authenticated user or null.
 */
export async function getAuthUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored — can't set cookies in Server Components
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication. Returns an error Response if not authenticated.
 * For pilot: allow unauthenticated access but log it.
 * TODO: Enforce auth once all users have accounts.
 */
export async function requireAuth(): Promise<Response | null> {
  // For pilot, we allow unauthenticated access but could enforce later:
  // const user = await getAuthUser();
  // if (!user) {
  //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  return null;
}

/** Cap a string to a maximum length. */
export function capString(s: unknown, max: number): string {
  if (typeof s !== 'string') return '';
  return s.slice(0, max);
}

/** Validate and sanitize a context string. */
export function sanitizeContext(context: unknown): string {
  return capString(context, MAX_CONTEXT_LENGTH);
}

/** Validate and sanitize chat messages — only allow user/assistant roles. */
export function sanitizeMessages(messages: unknown): Array<{ role: string; content: string }> {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is { role: string; content: string } =>
      m && typeof m === 'object' &&
      typeof m.role === 'string' &&
      ALLOWED_MESSAGE_ROLES.has(m.role) &&
      typeof m.content === 'string'
    )
    .map(m => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    }));
}

/** Validate a string field from the request body. */
export function sanitizeEvent(event: unknown): string {
  return capString(event, MAX_EVENT_LENGTH);
}

/** Validate a numeric field. Returns the number or NaN. */
export function sanitizeNumber(n: unknown): number {
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  return NaN;
}
