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
          const sb = getSupabase();
          const { data, error } = await sb.auth.getSession();
          if (error) console.error('Auth callback error:', error);
          if (data.session) {
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
          // No Supabase session — check localStorage for anonymous users
          const onboardingComplete = localStorage.getItem('duke_onboarding_complete');
          if (onboardingComplete === 'true') {
            router.replace('/mission');
          } else {
            router.replace('/landing');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/landing');
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  if (!checking) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] gap-4">
      <div className="w-16 h-16 rounded-md gradient-primary flex items-center justify-center shadow-glow">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </div>
      <span className="text-sm font-bold uppercase tracking-[4px] text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)] animate-pulse">
        Duke Vanguard
      </span>
    </div>
  );
}
