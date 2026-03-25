'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';

export default function GpaPage() {
  const router = useRouter();
  const addScoreEntry = useScoresStore((s) => s.addScoreEntry);
  const [gpa, setGpa] = useState('');
  const [mslGpa, setMslGpa] = useState('');
  const [error, setError] = useState('');

  async function handleNext() {
    const gpaNum = parseFloat(gpa);
    const mslNum = parseFloat(mslGpa || gpa);

    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      setError('Please enter a valid GPA between 0.0 and 4.0.');
      return;
    }
    if (mslGpa && (isNaN(mslNum) || mslNum < 0 || mslNum > 4.0)) {
      setError('Please enter a valid MSL GPA between 0.0 and 4.0.');
      return;
    }

    setError('');
    try {
      await addScoreEntry({
        gpa: gpaNum,
        msl_gpa: mslNum,
        acft_total: null,
        leadership_eval: null,
        cst_score: null,
        clc_score: null,
        total_oml: null,
      });
    } catch (err) {
      console.warn('Failed to save GPA:', err);
    }
    router.push('/onboarding/aft');
  }

  return (
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 max-w-lg mx-auto w-full">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585] mb-3"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 02 OF 05
      </span>

      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        WHAT&apos;S YOUR GPA?
      </h1>

      <p className="text-sm text-[#968d9d] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        GPA is a major component of your OML score. Enter your most recent cumulative GPA.
      </p>

      {/* Glass panel for inputs */}
      <div className="glass-panel-ob rounded-sm p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Cumulative GPA
          </label>
          <input
            type="number"
            value={gpa}
            onChange={(e) => { setGpa(e.target.value); setError(''); }}
            placeholder="3.50"
            step="0.01"
            min="0"
            max="4"
            className="bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]/50 text-base transition-all"
            style={{ fontFamily: 'Inter, sans-serif', border: 'none' }}
          />
          {error && (
            <span className="text-xs text-[#ffb4ab] mt-0.5">{error}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            MSL GPA (optional)
          </label>
          <input
            type="number"
            value={mslGpa}
            onChange={(e) => setMslGpa(e.target.value)}
            placeholder="3.80"
            step="0.01"
            min="0"
            max="4"
            className="bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]/50 text-base transition-all"
            style={{ fontFamily: 'Inter, sans-serif', border: 'none' }}
          />
          <span className="text-xs text-[#968d9d]/70 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Military Science GPA. Leave blank to use your cumulative GPA.
          </span>
        </div>
      </div>

      <div className="mt-auto pb-4">
        <button
          onClick={handleNext}
          disabled={!gpa.trim()}
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
