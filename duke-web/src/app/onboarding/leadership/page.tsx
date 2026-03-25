'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadershipPage() {
  const router = useRouter();
  const [leadershipEval, setLeadershipEval] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    if (leadershipEval) {
      const val = parseFloat(leadershipEval);
      if (isNaN(val) || val < 0 || val > 100) {
        setError('Leadership evaluation must be between 0 and 100.');
        return;
      }
    }
    setError('');
    router.push('/onboarding/branch');
  }

  return (
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 max-w-lg mx-auto w-full">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585] mb-3"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 04 OF 05
      </span>

      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        LEADERSHIP EVALUATION
      </h1>

      <p className="text-sm text-[#968d9d] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        Your commander&apos;s assessment score is a key OML pillar. Enter it below or skip for now.
      </p>

      {/* Glass panel for input */}
      <div className="glass-panel-ob rounded-sm p-6">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Commander&apos;s Assessment Score (optional)
          </label>
          <input
            type="number"
            value={leadershipEval}
            onChange={(e) => { setLeadershipEval(e.target.value); setError(''); }}
            placeholder="85"
            min="0"
            max="100"
            className="bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]/50 text-base transition-all"
            style={{ fontFamily: 'Inter, sans-serif', border: 'none' }}
          />
          <span className="text-xs text-[#968d9d]/70 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your most recent commander&apos;s assessment (0-100). You can add this later.
          </span>
          {error && (
            <span className="text-xs text-[#ffb4ab] mt-1">{error}</span>
          )}
        </div>
      </div>

      {/* Descriptive info panel */}
      <div className="glass-surface-ob rounded-sm p-5 mt-4 flex gap-4 items-start">
        <div className="p-3 rounded-sm bg-[#450084] flex-shrink-0">
          <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
        </div>
        <div>
          <p className="text-sm text-[#968d9d] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Don&apos;t worry if you don&apos;t have this yet. You can log leadership
            activities, command roles, and extracurriculars in detail after setup.
            Leadership evaluation contributes to your overall OML ranking.
          </p>
        </div>
      </div>

      <div className="mt-auto pb-4">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.01] transition-all glow-purple-ob flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="material-symbols-outlined text-base">arrow_forward</span>
          Next
        </button>
      </div>
    </div>
  );
}
