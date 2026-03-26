'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinSquad } from '@/services/supabase';

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
      const { squad, error: joinError } = await joinSquad(code.trim().toUpperCase());
      if (joinError) {
        setError(joinError);
      } else if (squad) {
        setJoinedSquad({ id: squad.id, name: squad.name });
      }
    } catch {
      setError('Failed to join squad. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-join { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-lg mx-auto space-y-10">
        <div className="flex items-center gap-4 animate-fadeInUp">
          <button onClick={() => router.back()} className="text-[#b0a8b8] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            JOIN SQUAD
          </h1>
        </div>

        {!joinedSquad ? (
          <section className="glass-panel-join rounded-lg p-8 space-y-6 animate-fadeIn">
            <label className="text-[12px] text-[#b0a8b8] uppercase tracking-[0.3em] font-bold block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="ABCDEF"
              autoFocus
              maxLength={6}
              className="w-full text-center text-3xl font-black tracking-[8px] px-4 py-5 rounded-sm bg-[#151317] text-[#dbc585] placeholder:text-[#b0a8b8] placeholder:tracking-[8px] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 transition-all"
              style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
            />
            <p className="text-xs text-[#b0a8b8] text-center">
              Enter the 6-character invite code from your squad leader.
            </p>
            {error && <p className="text-xs font-semibold text-[#ffb4ab] text-center">{error}</p>}
            <button
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Join Squad'
              )}
            </button>
          </section>
        ) : (
          <section className="glass-panel-join rounded-lg p-10 flex flex-col items-center animate-fadeInUp" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
            <div className="w-20 h-20 rounded-lg bg-[#450084] flex items-center justify-center mb-6" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
              <span className="material-symbols-outlined text-4xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              SQUAD JOINED
            </h2>
            <span className="text-xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              {joinedSquad.name}
            </span>
            <button
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider mt-8 hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              onClick={() => router.push(`/squad/${joinedSquad.id}`)}
            >
              View Squad
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
