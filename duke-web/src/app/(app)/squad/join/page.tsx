'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';

export default function JoinSquadPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedSquad, setJoinedSquad] = useState<{ id: string; name: string } | null>(null);

  const handleJoin = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    // In production, call Supabase joinSquad
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate success
      setJoinedSquad({ id: 'demo-squad', name: 'Bravo Company' });
    } catch {
      setError('Failed to join squad. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (joinedSquad) {
      router.replace(`/squad/${joinedSquad.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-container)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[var(--color-on-surface)] cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-on-surface)]">Join Squad</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 p-4">
        {!joinedSquad ? (
          <>
            <label className="text-sm font-semibold text-[var(--color-on-surface)] mb-2 block">
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCDEF"
              maxLength={6}
              autoFocus
              className="w-full text-3xl font-bold text-center tracking-[6px] px-3 py-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] mb-4 outline-none uppercase"
            />
            {error && <p className="text-xs text-[var(--color-error)] mb-3">{error}</p>}
            <button
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer disabled:opacity-50"
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Join'
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center mt-16">
            <MdCheckCircle size={48} className="text-[var(--color-primary)]" />
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] mt-3">You&apos;re in!</h2>
            <p className="text-base text-[var(--color-outline)] mt-1 mb-6">{joinedSquad.name}</p>
            <button
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer"
              onClick={handleContinue}
            >
              View Squad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
