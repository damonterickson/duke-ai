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
    // In production, check actual session via Supabase
    setAuthChecked(true);
    setSession(null); // Default to unauthenticated for now
  }, []);

  const fetchSquads = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    // In production, fetch from Supabase
    setSquads([]);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) fetchSquads();
  }, [session, fetchSquads]);

  const renderUnauthenticated = () => (
    <div className="flex flex-col items-center pt-20">
      <MdShield size={56} className="text-[var(--color-outline)]" />
      <h2 className="text-xl font-semibold text-[var(--color-on-surface)] mt-4 mb-2 text-center">
        Sign in to unlock Squads
      </h2>
      <p className="text-sm text-[var(--color-outline)] text-center mb-5 px-4">
        Create squads, invite your battle buddies, and share achievements.
      </p>
      <button
        className="flex-1 max-w-[200px] py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold cursor-pointer hover:opacity-85 text-center"
        onClick={() => router.push('/auth')}
      >
        Sign In
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center pt-20">
      <MdGroups size={56} className="text-[var(--color-outline)]" />
      <h2 className="text-xl font-semibold text-[var(--color-on-surface)] mt-4 mb-2 text-center">
        No squads yet
      </h2>
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-3 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold cursor-pointer hover:opacity-85"
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="flex-1 py-3 px-4 rounded-lg border border-[var(--color-outline)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:opacity-85"
          onClick={() => router.push('/squad/join')}
        >
          Join Squad
        </button>
      </div>
    </div>
  );

  const renderSquads = () => (
    <>
      {squads.map((sq) => {
        const isLeader = session?.user?.id === sq.leader_id;
        return (
          <button
            key={sq.id}
            className="w-full text-left rounded-xl p-4 mb-3 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] cursor-pointer hover:opacity-90"
            onClick={() => router.push(`/squad/${sq.id}`)}
            aria-label={`Squad ${sq.name}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-semibold text-[var(--color-on-surface)] truncate">
                {sq.name}
              </span>
              {isLeader && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] ml-2">
                  Leader
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MdPeople size={16} className="text-[var(--color-outline)]" />
              <span className="text-xs text-[var(--color-outline)]">
                {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <span className="text-xs text-[var(--color-outline-variant)]">
              Code: {sq.invite_code}
            </span>
          </button>
        );
      })}
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold cursor-pointer hover:opacity-85"
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="flex-1 py-3 rounded-lg border border-[var(--color-outline)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:opacity-85"
          onClick={() => router.push('/squad/join')}
        >
          Join Squad
        </button>
      </div>
    </>
  );

  const renderBody = () => {
    if (!authChecked) {
      return (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!session) return renderUnauthenticated();
    if (loading && squads.length === 0) {
      return (
        <div className="flex justify-center mt-10">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (squads.length === 0) return renderEmpty();
    return renderSquads();
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <div>
          <h1 className="text-sm font-semibold tracking-[2px] uppercase text-white">DUKE VANGUARD</h1>
          <p className="text-xs text-white/60 mt-0.5">Squad Operations</p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="text-white cursor-pointer"
        >
          <MdSettings size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-16">
        {renderBody()}
      </div>
    </div>
  );
}
