'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';

const AGE_BRACKETS = ['17-21', '22-26', '27-31'] as const;
type AgeBracket = (typeof AGE_BRACKETS)[number];

export default function AftPage() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [ageBracket, setAgeBracket] = useState<AgeBracket | null>(null);
  const [acftTotal, setAcftTotal] = useState('');
  const [error, setError] = useState('');

  async function handleNext() {
    if (!gender) {
      setError('Please select your gender for ACFT scoring tables.');
      return;
    }
    if (!ageBracket) {
      setError('Please select your age bracket.');
      return;
    }

    const total = parseFloat(acftTotal);
    if (acftTotal && (isNaN(total) || total < 0 || total > 600)) {
      setError('ACFT total must be between 0 and 600.');
      return;
    }

    setError('');
    try {
      await updateProfile({ gender, ageBracket });
    } catch (err) {
      console.warn('Failed to save AFT info:', err);
    }
    router.push('/onboarding/leadership');
  }

  return (
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 max-w-lg mx-auto w-full">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585] mb-3"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 03 OF 05
      </span>

      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        FITNESS PROFILE
      </h1>

      <p className="text-sm text-[#968d9d] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        Gender and age bracket are used for ACFT scoring normalization.
      </p>

      {/* Gender Selection */}
      <label
        className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Gender (for ACFT scoring)
      </label>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {([
          { key: 'M' as const, label: 'Male', icon: 'male' },
          { key: 'F' as const, label: 'Female', icon: 'female' },
        ]).map((g) => (
          <button
            key={g.key}
            onClick={() => { setGender(g.key); setError(''); }}
            className={`p-4 rounded-sm font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
              gender === g.key
                ? 'bg-[#450084] text-[#b27ff5] glow-purple-ob'
                : 'glass-surface-ob text-[#e7e1e6] hover:bg-[#2c292d]'
            }`}
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: gender === g.key ? "'FILL' 1" : "'FILL' 0" }}
            >
              {g.icon}
            </span>
            {g.label}
          </button>
        ))}
      </div>

      {/* Age Bracket */}
      <label
        className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Age Bracket
      </label>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {AGE_BRACKETS.map((bracket) => (
          <button
            key={bracket}
            onClick={() => { setAgeBracket(bracket); setError(''); }}
            className={`p-4 rounded-sm font-bold text-sm cursor-pointer transition-all ${
              ageBracket === bracket
                ? 'bg-[#450084] text-[#b27ff5] glow-purple-ob'
                : 'glass-surface-ob text-[#e7e1e6] hover:bg-[#2c292d]'
            }`}
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            {bracket}
          </button>
        ))}
      </div>

      {/* ACFT Total */}
      <div className="glass-panel-ob rounded-sm p-6">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACFT Total Score (optional)
          </label>
          <input
            type="number"
            value={acftTotal}
            onChange={(e) => { setAcftTotal(e.target.value); setError(''); }}
            placeholder="480"
            min="0"
            max="600"
            className="bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]/50 text-base transition-all"
            style={{ fontFamily: 'Inter, sans-serif', border: 'none' }}
          />
          <span className="text-xs text-[#968d9d]/70 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Enter your most recent ACFT total (0-600). You can add details later.
          </span>
          {error && (
            <span className="text-xs text-[#ffb4ab] mt-1">{error}</span>
          )}
        </div>
      </div>

      <div className="mt-auto pb-4">
        <button
          onClick={handleNext}
          disabled={!gender || !ageBracket}
          className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 transition-all glow-purple-ob flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="material-symbols-outlined text-base">arrow_forward</span>
          Next
        </button>
      </div>
    </div>
  );
}
