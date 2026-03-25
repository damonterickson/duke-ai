'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdSettings, MdShield, MdGroups, MdPeople } from 'react-icons/md';
import { useSquadStore } from '@/stores/squad';

interface SquadItem {
  id: string;
  name: string;
  invite_code: string;
  leader_id: string;
  memberCount: number;
}

export default function SquadPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [squads, setSquads] = useState<SquadItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate auth check
  useEffect(() => {
    setAuthChecked(true);
    setSession(null);
  }, []);

  const fetchSquads = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setSquads([]);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) fetchSquads();
  }, [session, fetchSquads]);

  const renderUnauthenticated = () => (
    <div className="flex flex-col items-center pt-16">
      <div className="w-20 h-20 rounded-md bg-[var(--color-surface-container)] flex items-center justify-center mb-5">
        <MdShield size={40} className="text-[var(--color-outline)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2 text-center font-[family-name:var(--font-display)]">
        Sign in to unlock Squads
      </h2>
      <p className="text-sm text-[var(--color-on-surface-variant)] text-center mb-6 px-4 leading-relaxed max-w-sm">
        Create squads, invite your battle buddies, and share achievements.
      </p>
      <button
        className="px-8 py-3 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
        onClick={() => router.push('/auth')}
      >
        Sign In
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center pt-16">
      <div className="w-20 h-20 rounded-md bg-[var(--color-surface-container)] flex items-center justify-center mb-5">
        <MdGroups size={40} className="text-[var(--color-outline)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2 text-center font-[family-name:var(--font-display)]">
        No squads yet
      </h2>
      <div className="flex gap-3 mt-4">
        <button
          className="py-3 px-6 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="py-3 px-6 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
          onClick={() => router.push('/squad/join')}
        >
          Join Squad
        </button>
      </div>
    </div>
  );

  const renderSquads = () => (
    <div className="space-y-3">
      {squads.map((sq) => {
        const isLeader = session?.user?.id === sq.leader_id;
        return (
          <button
            key={sq.id}
            className="w-full text-left rounded-md p-4 border border-[var(--ghost-border)] bg-[var(--color-surface-container-low)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
            onClick={() => router.push(`/squad/${sq.id}`)}
            aria-label={`Squad ${sq.name}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-bold text-[var(--color-on-surface)] truncate font-[family-name:var(--font-display)]">
                {sq.name}
              </span>
              {isLeader && (
                <span className="px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] ml-2 font-[family-name:var(--font-label)]">
                  Leader
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MdPeople size={16} className="text-[var(--color-on-surface-variant)]" />
              <span className="text-xs text-[var(--color-on-surface-variant)]">
                {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <span className="text-xs font-semibold text-[var(--color-outline)] font-[family-name:var(--font-label)]">
              Code: {sq.invite_code}
            </span>
          </button>
        );
      })}
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-3 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="flex-1 py-3 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
          onClick={() => router.push('/squad/join')}
        >
          Join Squad
        </button>
      </div>
    </div>
  );

  const renderBody = () => {
    if (!authChecked) {
      return (
        <div className="flex justify-center mt-12">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!session) return renderUnauthenticated();
    if (loading && squads.length === 0) {
      return (
        <div className="flex justify-center mt-12">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (squads.length === 0) return renderEmpty();
    return renderSquads();
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-[3px] text-white font-[family-name:var(--font-label)]">DUKE VANGUARD</h1>
          <p className="text-xs text-white/60 mt-0.5 font-[family-name:var(--font-label)]">Squad Operations</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <MdSettings size={22} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full">
        {renderBody()}
      </div>
    </div>
  );
}
