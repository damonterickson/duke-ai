'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithMagicLink, signInWithOAuth, getSession, getSupabase } from '@/services/supabase';

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'input' | 'sent'>('input');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    async function check() {
      const callbackError = searchParams.get('error');
      if (callbackError) {
        setError('Sign-in failed. Please try again.');
      }

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
  }, [router, searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const { error: authError } = await signInWithOAuth(provider);
      if (authError) {
        setError(authError);
        setOauthLoading(null);
      }
    } catch {
      setError('Failed to start sign-in. Please try again.');
      setOauthLoading(null);
    }
  };

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
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-auth { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .kinetic-grid-auth {
          background-image: radial-gradient(circle at 2px 2px, rgba(217, 185, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="flex flex-col min-h-screen kinetic-grid-auth">
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
          {/* Brand */}
          <span className="text-[12px] uppercase tracking-[0.3em] text-[#968d9d] mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            DUKE VANGUARD
          </span>
          <div className="w-24 h-24 rounded-lg bg-[#450084] flex items-center justify-center mb-6" style={{ boxShadow: '0 0 30px rgba(69,0,132,0.3)' }}>
            <span className="material-symbols-outlined text-5xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            YOUR OML MENTOR
          </h1>
          <p className="text-sm md:text-base text-[#968d9d] text-center mb-10 leading-relaxed max-w-sm">
            AI-powered Order of Merit List optimizer for Army ROTC cadets.
            Sign in to save your progress across devices.
          </p>

          {error && (
            <div className="w-full mb-4 text-center">
              <span className="text-xs font-semibold text-[#ffb4ab]">{error}</span>
            </div>
          )}

          {state === 'input' ? (
            <div className="w-full space-y-4">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={oauthLoading !== null}
                  className="w-full py-4 rounded-sm bg-white text-[#1b1c1c] text-sm font-semibold cursor-pointer hover:bg-gray-100 disabled:opacity-60 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5"
                >
                  {oauthLoading === 'google' ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full" />
                  ) : (
                    <GoogleIcon size={20} />
                  )}
                  Continue with Google
                </button>

                <button
                  onClick={() => handleOAuth('github')}
                  disabled={oauthLoading !== null}
                  className="w-full py-4 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#2c292d] disabled:opacity-60 transition-all flex items-center justify-center gap-3"
                >
                  {oauthLoading === 'github' ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-[#968d9d]/30 border-t-[#e7e1e6] rounded-full" />
                  ) : (
                    <GitHubIcon size={20} />
                  )}
                  Continue with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="py-3 flex items-center justify-center gap-4">
                <div className="flex-1 h-px bg-[#373438]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  or
                </span>
                <div className="flex-1 h-px bg-[#373438]" />
              </div>

              {/* Magic Link */}
              <div className="glass-panel-auth rounded-lg p-6 space-y-4">
                <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="cadet@university.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 transition-all placeholder:text-[#968d9d]"
                  style={{ border: 'none' }}
                />
                <button
                  className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider disabled:opacity-60 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
                  onClick={handleSend}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-[#b27ff5]/30 border-t-[#b27ff5] rounded-full" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                      Send Magic Link
                    </>
                  )}
                </button>
                <p className="text-xs text-[#968d9d] text-center">
                  No password needed — we&apos;ll email you a secure sign-in link.
                </p>
              </div>

              {/* Skip */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-sm text-[#968d9d] text-sm cursor-pointer hover:text-[#e7e1e6] transition-colors"
                >
                  Try without an account
                </button>
                <p className="text-xs text-[#968d9d]/60 text-center">
                  Your data will only be saved on this device.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full glass-panel-auth rounded-lg p-8 flex flex-col items-center" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
              <div className="w-20 h-20 rounded-lg bg-[#450084] flex items-center justify-center mb-6" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
                <span className="material-symbols-outlined text-4xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-center mb-3" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                CHECK YOUR EMAIL
              </h2>
              <p className="text-sm text-[#968d9d] text-center mb-8 leading-relaxed">
                We sent a magic link to <strong className="text-[#d9b9ff]">{email}</strong>.
                Click it to sign in — no password needed.
              </p>
              <button
                className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider disabled:opacity-40 hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
                onClick={handleSend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Magic Link'}
              </button>
              <button
                onClick={() => { setState('input'); setEmail(''); }}
                className="text-sm font-semibold text-[#d9b9ff] mt-4 cursor-pointer hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center flex flex-col items-center gap-2">
          <Link href="/landing" className="text-xs font-semibold text-[#d9b9ff] hover:underline">
            &larr; Back to Home
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Duke Vanguard v0.2.0 — AI-First OML Optimizer
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#151317]"><span className="text-[#968d9d] animate-pulse">Loading...</span></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
