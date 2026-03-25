'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdShield, MdMarkEmailRead, MdRocketLaunch } from 'react-icons/md';
import { signInWithMagicLink, getSession, getSupabase } from '@/services/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'input' | 'sent'>('input');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check if already authenticated
  useEffect(() => {
    async function check() {
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
      }
    }
    check();
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await signInWithMagicLink(email.trim());
      if (authError) {
        setError(authError);
      } else {
        setState('sent');
        setCooldown(30);
      }
    } catch {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleSkip = () => {
    router.replace('/onboarding/welcome');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        {/* Brand */}
        <span className="text-xs font-bold tracking-[4px] uppercase text-[var(--color-primary)] mb-6 font-[family-name:var(--font-label)]">
          DUKE VANGUARD
        </span>
        <div className="w-20 h-20 rounded-md gradient-primary flex items-center justify-center mb-4 shadow-glow">
          <MdShield size={48} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-on-surface)] text-center mb-1 font-[family-name:var(--font-display)]">
          Your OML Mentor
        </h1>
        <p className="text-sm md:text-base text-[var(--color-on-surface-variant)] text-center mb-8 leading-relaxed max-w-sm">
          AI-powered Order of Merit List optimizer for Army ROTC cadets.
          Sign in to save your progress across devices.
        </p>

        {state === 'input' ? (
          <>
            {/* Email input */}
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 self-start font-[family-name:var(--font-label)]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="cadet@university.edu"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-md px-4 py-3.5 text-sm mb-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all placeholder:text-[var(--color-outline)]"
            />
            {error && (
              <span className="text-xs font-semibold text-[var(--color-error)] mb-3 text-center">{error}</span>
            )}

            {/* Sign In button */}
            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <MdRocketLaunch size={18} />
                  Send Magic Link
                </>
              )}
            </button>

            <p className="text-xs text-[var(--color-on-surface-variant)] text-center mt-3">
              No password needed -- we&apos;ll email you a secure sign-in link.
            </p>

            {/* Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
              <span className="px-3 text-xs font-semibold text-[var(--color-outline)] uppercase font-[family-name:var(--font-label)]">or</span>
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
            </div>

            {/* Skip / Try without account */}
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
            >
              Try without an account
            </button>
            <p className="text-xs text-[var(--color-on-surface-variant)] text-center mt-2">
              Your data will only be saved on this device.
            </p>
          </>
        ) : (
          <>
            {/* Email sent state */}
            <div className="w-16 h-16 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center mb-4">
              <MdMarkEmailRead size={36} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] text-center mb-2 font-[family-name:var(--font-display)]">
              Check your email
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] text-center mb-6 leading-relaxed">
              We sent a magic link to <strong className="text-[var(--color-on-surface)]">{email}</strong>.
              Click it to sign in -- no password needed.
            </p>

            {error && (
              <span className="text-xs font-semibold text-[var(--color-error)] mb-3 text-center">{error}</span>
            )}

            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
              onClick={handleSend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Magic Link'}
            </button>

            <button
              onClick={() => { setState('input'); setEmail(''); }}
              className="text-sm font-semibold text-[var(--color-primary)] mt-4 cursor-pointer hover:underline"
            >
              Use a different email
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <span className="text-xs text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">
          Duke Vanguard v0.2.0 -- AI-First OML Optimizer
        </span>
      </div>
    </div>
  );
}
