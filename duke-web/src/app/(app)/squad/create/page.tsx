'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSquad } from '@/services/supabase';

export default function CreateSquadPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [squadId, setSquadId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { squad, error: createError } = await createSquad(name.trim());
      if (createError) {
        setError(createError);
      } else if (squad) {
        setInviteCode(squad.invite_code);
        setSquadId(squad.id);
      }
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
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-create { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-lg mx-auto space-y-10">
        <div className="flex items-center gap-4 animate-fadeInUp">
          <button onClick={() => router.back()} className="text-[#b0a8b8] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            CREATE SQUAD
          </h1>
        </div>

        {!inviteCode ? (
          <section className="glass-panel-create rounded-lg p-8 space-y-6 animate-fadeIn">
            <label className="text-[12px] text-[#b0a8b8] uppercase tracking-[0.3em] font-bold block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Squad Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g., Bravo Company"
              autoFocus
              className="w-full text-sm px-4 py-4 rounded-sm bg-[#151317] text-[#e7e1e6] placeholder:text-[#b0a8b8] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 transition-all"
              style={{ border: 'none' }}
            />
            {error && <p className="text-xs font-semibold text-[#ffb4ab]">{error}</p>}
            <button
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              onClick={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Squad'
              )}
            </button>
          </section>
        ) : (
          <section className="glass-panel-create rounded-lg p-10 flex flex-col items-center animate-fadeInUp" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
            <div className="w-20 h-20 rounded-lg bg-[#450084] flex items-center justify-center mb-6" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
              <span className="material-symbols-outlined text-4xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <span className="text-[12px] uppercase tracking-[0.3em] text-[#b0a8b8] mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Your invite code:
            </span>
            <span className="text-5xl font-black tracking-[12px] text-[#dbc585] my-4" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))' }}>
              {inviteCode}
            </span>
            <p className="text-sm text-[#b0a8b8] text-center mb-8 leading-relaxed">
              Share this code with your squad mates so they can join.
            </p>
            <button
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Invite Code'}
            </button>
            <button
              className="w-full py-3 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold mt-3 hover:bg-[#2c292d] transition-colors"
              onClick={() => squadId ? router.push(`/squad/${squadId}`) : router.push('/squad')}
            >
              View Squad
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
