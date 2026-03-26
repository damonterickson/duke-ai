'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/services/supabase';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const sb = getSupabase();

    // onAuthStateChange handles both:
    // 1. OAuth redirects (hash fragment → SIGNED_IN event)
    // 2. Existing sessions (INITIAL_SESSION event)
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      console.log('[Root] Auth event:', event, session ? `user=${session.user.email}` : 'no session');

      if (event === 'SIGNED_IN' && session) {
        // User just signed in via OAuth or magic link — ensure profile exists
        await sb.from('profiles').upsert({
          id: session.user.id,
          display_name: session.user.user_metadata?.full_name ?? session.user.email ?? 'Cadet',
          year_group: 'MSIII',
        }, { onConflict: 'id' });

        localStorage.setItem('duke_onboarding_complete', 'true');
        router.replace('/mission');
        setChecking(false);
        return;
      }

      if (event === 'INITIAL_SESSION') {
        // Fired once on page load with the current session (or null)
        if (session) {
          router.replace('/mission');
        } else {
          const onboardingComplete = localStorage.getItem('duke_onboarding_complete');
          if (onboardingComplete === 'true') {
            router.replace('/mission');
          } else {
            router.replace('/landing');
          }
        }
        setChecking(false);
        return;
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [router]);

  if (!checking) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#151317] gap-6 relative overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(217, 185, 255, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute w-[400px] h-[400px] bg-[#d9b9ff]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="relative z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 30px rgba(69,0,132,0.4))' }}>
        <span className="material-symbols-outlined text-[80px] text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>shield_with_heart</span>
      </div>
      <span className="relative z-10 text-sm font-black uppercase tracking-[4px] text-[#b0a8b8]" style={{ fontFamily: 'Public Sans, sans-serif' }}>DUKE VANGUARD</span>
    </div>
  );
}
