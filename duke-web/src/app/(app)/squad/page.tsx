'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getMySquads, getSquadMembers, onAuthStateChange } from '@/services/supabase';

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

  // Check actual Supabase session
  useEffect(() => {
    async function checkAuth() {
      try {
        const sess = await getSession();
        console.log('[Squad] getSession result:', sess ? `user=${sess.user?.email}` : 'NULL');
        setSession(sess);
      } catch (err) {
        console.error('[Squad] getSession error:', err);
        setSession(null);
      }
      setAuthChecked(true);
    }
    checkAuth();

    // Listen for auth changes (e.g., user signs in from another tab)
    const { data } = onAuthStateChange((sess) => {
      setSession(sess);
      setAuthChecked(true);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const fetchSquads = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { squads: mySquads } = await getMySquads();
      const withCounts = await Promise.all(
        mySquads.map(async (sq) => {
          const { members } = await getSquadMembers(sq.id);
          return { ...sq, memberCount: members.length };
        })
      );
      setSquads(withCounts);
    } catch (err) {
      console.error('Failed to fetch squads:', err);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) fetchSquads();
  }, [session, fetchSquads]);

  const renderUnauthenticated = () => (
    <section className="relative animate-fadeInUp">
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
          <p className="text-sm text-[#b0a8b8] mb-8 max-w-md leading-relaxed">
            Create squads, invite your battle buddies, and share achievements. Sign in with Google or email to get started.
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
    <section className="relative animate-fadeInUp">
      <div className="glass-panel-squad p-10 md:p-16 rounded-lg flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <span className="material-symbols-outlined text-[120px]">groups</span>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-lg bg-[#211f23] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-[#b0a8b8]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-3" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            NO SQUADS YET
          </h2>
          <p className="text-sm text-[#b0a8b8] mb-6 max-w-md">
            Create a squad and invite your battle buddies, or join an existing squad with an invite code.
          </p>
          <div className="flex gap-4 mt-2">
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
    <div className="space-y-8 animate-fadeIn">
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
                <span className="material-symbols-outlined text-sm text-[#b0a8b8]">people</span>
                <span className="text-xs text-[#b0a8b8]">
                  {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#b0a8b8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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
        <div className="flex items-center justify-between animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              SQUAD OPERATIONS
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#b0a8b8] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {authChecked ? (session ? `Signed in as ${session.user?.email ?? 'Cadet'}` : 'Duke Vanguard') : 'Duke Vanguard'}
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="text-[#b0a8b8] hover:text-[#d9b9ff] transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {renderBody()}
      </div>
    </div>
  );
}
