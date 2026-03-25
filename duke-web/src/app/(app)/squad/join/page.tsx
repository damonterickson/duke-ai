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
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          JOIN SQUAD
        </h1>
      </header>

      <div className="flex-1 px-4 md:px-6 py-8 max-w-lg mx-auto w-full">
        {!joinedSquad ? (
          <>
            <label
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-3 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Invite Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCDEF"
              maxLength={6}
              autoFocus
              className="w-full text-3xl font-black text-center tracking-[8px] px-3 py-4 rounded-sm bg-[#211f23] text-[#e7e1e6] placeholder:text-[#968d9d] mb-4 outline-none uppercase focus:ring-2 focus:ring-[#d9b9ff]/30 transition-all"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            />
            {error && <p className="text-xs font-semibold text-[#ffb4ab] mb-3">{error}</p>}
            <button
              className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Join'
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center mt-16">
            <div className="w-16 h-16 rounded-sm bg-[#450084] flex items-center justify-center mb-4 glow-shadow-purple">
              <MdCheckCircle size={40} className="text-[#d9b9ff]" />
            </div>
            <h2
              className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] mt-1"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              YOU&apos;RE IN!
            </h2>
            <p className="text-base text-[#cdc3d4] mt-2 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>{joinedSquad.name}</p>
            <button
              className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
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
