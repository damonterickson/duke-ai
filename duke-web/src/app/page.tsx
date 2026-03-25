'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getSupabase } from '@/services/supabase';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Handle magic link callback (hash fragment with access_token)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Supabase will auto-detect and set the session from the URL hash
          const sb = getSupabase();
          const { data, error } = await sb.auth.getSession();
          if (error) console.error('Auth callback error:', error);
          if (data.session) {
            // Check if profile exists (onboarding complete)
            const { data: profile } = await sb
              .from('profiles')
              .select('onboarding_complete')
              .eq('id', data.session.user.id)
              .single();

            if (profile?.onboarding_complete) {
              router.replace('/mission');
            } else {
              router.replace('/onboarding/welcome');
            }
            return;
          }
        }

        // Check existing session
        const session = await getSession();
        if (session) {
          // User is authenticated — check if onboarding is done
          const sb = getSupabase();
          const { data: profile } = await sb
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single();

          if (profile?.onboarding_complete) {
            router.replace('/mission');
          } else {
            router.replace('/onboarding/welcome');
          }
        } else {
          // No session — go to auth
          router.replace('/auth');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/auth');
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  if (!checking) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
      <div className="animate-pulse text-[var(--color-on-surface-variant)] font-[var(--font-label)] text-sm uppercase tracking-widest">
        Duke Vanguard
      </div>
    </div>
  );
}
