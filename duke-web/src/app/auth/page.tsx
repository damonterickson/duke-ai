'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdShield, MdMarkEmailRead } from 'react-icons/md';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'input' | 'sent'>('input');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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

    // In production, call Supabase magic link API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setState('sent');
      setCooldown(30);
    } catch {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <span className="text-sm font-semibold tracking-[3px] uppercase text-[var(--color-primary)] mb-4">
          DUKE VANGUARD
        </span>
        <MdShield size={72} className="text-[var(--color-primary)] mb-4" />
        <h1 className="text-xl font-semibold text-[var(--color-on-surface)] text-center mb-2">
          Sign in to unlock Squads
        </h1>
        <p className="text-sm text-[var(--color-outline)] text-center mb-5 px-2">
          Enter your school email to get a magic link &mdash; no password needed.
        </p>

        {state === 'input' ? (
          <>
            <input
              type="email"
              placeholder="you@dukes.jmu.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full max-w-sm border border-[var(--color-outline)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] rounded-lg px-4 py-3 text-sm mb-3 outline-none placeholder:text-[var(--color-outline)]"
            />
            {error && (
              <span className="text-xs text-[var(--color-error)] mb-2 text-center">{error}</span>
            )}
            <button
              className="w-full max-w-sm py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold mb-4 cursor-pointer hover:opacity-85 disabled:opacity-60"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </>
        ) : (
          <>
            <MdMarkEmailRead size={40} className="text-[var(--color-primary)] mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-primary)] text-center mb-2">
              Check your email!
            </h2>
            {error && (
              <span className="text-xs text-[var(--color-error)] mb-2 text-center">{error}</span>
            )}
            <button
              className="w-full max-w-sm py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold mb-4 cursor-pointer disabled:opacity-40"
              onClick={handleSend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
            </button>
          </>
        )}

        <button
          onClick={() => router.replace('/mission')}
          className="text-sm text-[var(--color-outline)] underline cursor-pointer py-2"
        >
          Skip &mdash; use app without squads
        </button>
      </div>
    </div>
  );
}
