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
        // Handle magic link callback (hash fragment with access_token or token_type)
        if (typeof window !== 'undefined' &&
            (window.location.hash.includes('access_token') || window.location.hash.includes('token_type'))) {
          // Let the Supabase client process the hash fragment
          const sb = getSupabase();
          // Wait a moment for Supabase to detect and process the URL
          await new Promise(resolve => setTimeout(resolve, 500));
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#151317] gap-6 relative overflow-hidden">
      {/* Material Symbols font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Kinetic grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(217, 185, 255, 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] bg-[#d9b9ff]/10 rounded-full blur-[120px] animate-pulse" />

      {/* Shield icon pulsing */}
      <div className="relative z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 30px rgba(69,0,132,0.4))' }}>
        <span
          className="material-symbols-outlined text-[80px] text-[#d9b9ff]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          shield_with_heart
        </span>
      </div>

      <span
        className="relative z-10 text-sm font-black uppercase tracking-[4px] text-[#968d9d]"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        DUKE VANGUARD
      </span>
    </div>
  );
}
