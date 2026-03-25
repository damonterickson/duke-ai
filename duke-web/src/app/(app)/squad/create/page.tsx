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
          CREATE SQUAD
        </h1>
      </header>

      <div className="flex-1 px-4 md:px-6 py-8 max-w-lg mx-auto w-full">
        {!inviteCode ? (
          <>
            <label
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-3 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Squad Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bravo Company"
              autoFocus
              className="w-full text-sm px-4 py-3.5 rounded-sm bg-[#211f23] text-[#e7e1e6] placeholder:text-[#968d9d] mb-4 outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 transition-all"
            />
            {error && <p className="text-xs font-semibold text-[#ffb4ab] mb-3">{error}</p>}
            <button
              className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Squad'
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center mt-16">
            <div className="w-16 h-16 rounded-sm bg-[#450084] flex items-center justify-center mb-4 glow-shadow-purple">
              <MdCheckCircle size={40} className="text-[#d9b9ff]" />
            </div>
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mt-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Your invite code:
            </span>
            <span
              className="text-4xl font-black tracking-[10px] text-[#f8e19e] my-3"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {inviteCode}
            </span>
            <p className="text-sm text-[#cdc3d4] text-center mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Share this code with your squad mates
            </p>
            <button
              className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              className="w-full py-3 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer mt-3 hover:bg-[#450084]/10 transition-colors"
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
