/**
 * GET /auth/callback — Handle Supabase magic link redirect
 *
 * Supabase redirects here with a `code` query parameter after the user
 * clicks the magic link in their email. We exchange the code for a session
 * and redirect to the app.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
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
              // Can't set cookies in some contexts
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_complete) {
          return NextResponse.redirect(`${origin}/mission`);
        }
      }
      return NextResponse.redirect(`${origin}/onboarding/welcome`);
    }
  }

  // If something went wrong, redirect to auth page
  return NextResponse.redirect(`${origin}/auth?error=callback_failed`);
}
