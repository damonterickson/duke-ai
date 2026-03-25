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
      <div className="w-20 h-20 rounded-sm bg-[#211f23] flex items-center justify-center mb-5">
        <MdShield size={40} className="text-[#968d9d]" />
      </div>
      <h2
        className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2 text-center"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        SIGN IN TO UNLOCK SQUADS
      </h2>
      <p className="text-sm text-[#cdc3d4] text-center mb-6 px-4 leading-relaxed max-w-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
        Create squads, invite your battle buddies, and share achievements.
      </p>
      <button
        className="px-8 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        onClick={() => router.push('/auth')}
      >
        Sign In
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center pt-16">
      <div className="w-20 h-20 rounded-sm bg-[#211f23] flex items-center justify-center mb-5">
        <MdGroups size={40} className="text-[#968d9d]" />
      </div>
      <h2
        className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2 text-center"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        NO SQUADS YET
      </h2>
      <div className="flex gap-3 mt-4">
        <button
          className="py-3 px-6 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="py-3 px-6 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#450084]/10 transition-colors"
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
            className="w-full text-left rounded-sm p-4 glass-card ghost-border cursor-pointer hover:bg-[#450084]/10 transition-all"
            onClick={() => router.push(`/squad/${sq.id}`)}
            aria-label={`Squad ${sq.name}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-lg font-black uppercase tracking-tighter text-[#e7e1e6] truncate"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {sq.name}
              </span>
              {isLeader && (
                <span
                  className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] bg-[#450084] text-[#b27ff5] ml-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Leader
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MdPeople size={16} className="text-[#968d9d]" />
              <span className="text-xs text-[#968d9d]">
                {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Code: {sq.invite_code}
            </span>
          </button>
        );
      })}
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="flex-1 py-3 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#450084]/10 transition-colors"
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
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!session) return renderUnauthenticated();
    if (loading && squads.length === 0) {
      return (
        <div className="flex justify-center mt-12">
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (squads.length === 0) return renderEmpty();
    return renderSquads();
  };

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center justify-between shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <div>
          <h1
            className="text-lg font-black uppercase tracking-tighter italic text-[#d9b9ff]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            DUKE VANGUARD
          </h1>
          <p
            className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] mt-0.5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Squad Operations
          </p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors"
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
