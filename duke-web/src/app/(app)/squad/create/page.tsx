'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';

export default function CreateSquadPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const code = Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
      setInviteCode(code);
    } catch {
      setError('Failed to create squad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteCode) {
      try {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.alert(`Invite code: ${inviteCode}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">CREATE SQUAD</h1>
      </header>

      <div className="flex-1 px-4 md:px-6 py-8 max-w-lg mx-auto w-full">
        {!inviteCode ? (
          <>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-3 block font-[family-name:var(--font-label)]">
              Squad Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bravo Company"
              autoFocus
              className="w-full text-sm px-4 py-3.5 rounded-md border border-[var(--ghost-border)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] mb-4 outline-none shadow-[var(--shadow-sm)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all"
            />
            {error && <p className="text-xs font-semibold text-[var(--color-error)] mb-3">{error}</p>}
            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
              onClick={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Squad'
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center mt-16">
            <div className="w-16 h-16 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center mb-4">
              <MdCheckCircle size={40} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mt-2 font-[family-name:var(--font-label)]">Your invite code:</span>
            <span className="text-4xl font-bold tracking-[10px] text-[var(--color-on-surface)] my-3 font-[family-name:var(--font-display)]">{inviteCode}</span>
            <p className="text-sm text-[var(--color-on-surface-variant)] text-center mb-6 leading-relaxed">
              Share this code with your squad mates
            </p>
            <button
              className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              className="w-full py-3 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer mt-3 hover:bg-[var(--color-surface-container)] transition-colors"
              onClick={() => router.back()}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
