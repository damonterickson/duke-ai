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
    // In production, call Supabase createSquad
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Generate demo code
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
        // Fallback
        window.alert(`Invite code: ${inviteCode}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-container)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[var(--color-on-surface)] cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-on-surface)]">Create Squad</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 p-4">
        {!inviteCode ? (
          <>
            <label className="text-sm font-semibold text-[var(--color-on-surface)] mb-2 block">
              Squad Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bravo Company"
              autoFocus
              className="w-full text-sm px-3 py-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] mb-4 outline-none"
            />
            {error && <p className="text-xs text-[var(--color-error)] mb-3">{error}</p>}
            <button
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer disabled:opacity-50"
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
            <MdCheckCircle size={48} className="text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-[var(--color-outline)] mt-4">Your invite code:</span>
            <span className="text-4xl font-bold tracking-[8px] text-[var(--color-on-surface)] my-2">{inviteCode}</span>
            <p className="text-sm text-[var(--color-outline)] text-center mb-6">
              Share this code with your squad mates
            </p>
            <button
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              className="w-full py-3 rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer mt-2"
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
