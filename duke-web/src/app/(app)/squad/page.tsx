'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
    <section className="relative">
      <div className="glass-panel-squad p-10 md:p-16 rounded-lg flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <span className="material-symbols-outlined text-[120px]">shield</span>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-lg bg-[#450084] flex items-center justify-center mb-6" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
            <span className="material-symbols-outlined text-4xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            SIGN IN TO UNLOCK SQUADS
          </h2>
          <p className="text-sm text-[#968d9d] mb-8 max-w-md leading-relaxed">
            Create squads, invite your battle buddies, and share achievements.
          </p>
          <button
            className="px-10 py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
            style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            onClick={() => router.push('/auth')}
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );

  const renderEmpty = () => (
    <section className="relative">
      <div className="glass-panel-squad p-10 md:p-16 rounded-lg flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <span className="material-symbols-outlined text-[120px]">groups</span>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-lg bg-[#211f23] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-[#968d9d]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-3" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            NO SQUADS YET
          </h2>
          <div className="flex gap-4 mt-6">
            <button
              className="py-3 px-8 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              onClick={() => router.push('/squad/create')}
            >
              Create Squad
            </button>
            <button
              className="py-3 px-8 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold hover:bg-[#2c292d] transition-colors"
              onClick={() => router.push('/squad/join')}
            >
              Join Squad
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSquads = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        {squads.map((sq) => {
          const isLeader = session?.user?.id === sq.leader_id;
          return (
            <button
              key={sq.id}
              className="w-full text-left bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-6 border-l-4 border-[#450084] transition-all group"
              onClick={() => router.push(`/squad/${sq.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-black uppercase tracking-tighter truncate" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {sq.name}
                </span>
                {isLeader && (
                  <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm ml-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Leader
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm text-[#968d9d]">people</span>
                <span className="text-xs text-[#968d9d]">
                  {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Code: {sq.invite_code}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-4">
        <button
          className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
          style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
          onClick={() => router.push('/squad/create')}
        >
          Create Squad
        </button>
        <button
          className="flex-1 py-3 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold hover:bg-[#2c292d] transition-colors"
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
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-squad { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              SQUAD OPERATIONS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Duke Vanguard
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {renderBody()}
      </div>
    </div>
  );
}
