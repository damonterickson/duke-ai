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
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">JOIN SQUAD</h1>
      </header>

      <div className="flex-1 px-4 md:px-6 py-8 max-w-lg mx-auto w-full">
        {!joinedSquad ? (
          <>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-3 block font-[family-name:var(--font-label)]">
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCDEF"
              maxLength={6}
              autoFocus
              className="w-full text-3xl font-bold text-center tracking-[8px] px-3 py-4 rounded-md border border-[var(--ghost-border)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] mb-4 outline-none uppercase shadow-[var(--shadow-sm)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all font-[family-name:var(--font-display)]"
            />
            {error && <p className="text-xs font-semibold text-[var(--color-error)] mb-3">{error}</p>}
            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
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
            <div className="w-16 h-16 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center mb-4">
              <MdCheckCircle size={40} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] mt-1 font-[family-name:var(--font-display)]">You&apos;re in!</h2>
            <p className="text-base text-[var(--color-on-surface-variant)] mt-2 mb-6">{joinedSquad.name}</p>
            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
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
