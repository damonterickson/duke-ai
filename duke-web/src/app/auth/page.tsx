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
    // Allow anonymous usage with localStorage only
    router.replace('/onboarding/welcome');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        {/* Brand */}
        <span className="text-xs font-semibold tracking-[4px] uppercase text-[var(--color-primary)] mb-6">
          DUKE VANGUARD
        </span>
        <MdShield size={80} className="text-[var(--color-primary)] mb-2" />
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)] text-center mb-1 font-[var(--font-display)]">
          Your OML Mentor
        </h1>
        <p className="text-sm text-[var(--color-outline)] text-center mb-8 leading-relaxed">
          AI-powered Order of Merit List optimizer for Army ROTC cadets.
          Sign in to save your progress across devices.
        </p>

        {state === 'input' ? (
          <>
            {/* Email input */}
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 self-start">
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
              className="w-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-lg px-4 py-3.5 text-sm mb-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors placeholder:text-[var(--color-outline)]"
            />
            {error && (
              <span className="text-xs text-[var(--color-error)] mb-3 text-center">{error}</span>
            )}

            {/* Sign In button */}
            <button
              className="w-full py-3.5 rounded-lg bg-gradient-to-br from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)] text-white text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
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

            <p className="text-xs text-[var(--color-outline)] text-center mt-3">
              No password needed — we&apos;ll email you a secure sign-in link.
            </p>

            {/* Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
              <span className="px-3 text-xs text-[var(--color-outline)]">or</span>
              <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
            </div>

            {/* Skip / Try without account */}
            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-medium cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
            >
              Try without an account
            </button>
            <p className="text-xs text-[var(--color-outline)] text-center mt-2">
              Your data will only be saved on this device.
            </p>
          </>
        ) : (
          <>
            {/* Email sent state */}
            <MdMarkEmailRead size={48} className="text-[var(--color-primary)] mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] text-center mb-2">
              Check your email
            </h2>
            <p className="text-sm text-[var(--color-outline)] text-center mb-6">
              We sent a magic link to <strong className="text-[var(--color-on-surface)]">{email}</strong>.
              Click it to sign in — no password needed.
            </p>

            {error && (
              <span className="text-xs text-[var(--color-error)] mb-3 text-center">{error}</span>
            )}

            <button
              className="w-full py-3.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold cursor-pointer disabled:opacity-40 transition-opacity"
              onClick={handleSend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Magic Link'}
            </button>

            <button
              onClick={() => { setState('input'); setEmail(''); }}
              className="text-sm text-[var(--color-primary)] mt-4 cursor-pointer hover:underline"
            >
              Use a different email
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <span className="text-xs text-[var(--color-outline)]">
          Duke Vanguard v0.2.0 — AI-First OML Optimizer
        </span>
      </div>
    </div>
  );
}
