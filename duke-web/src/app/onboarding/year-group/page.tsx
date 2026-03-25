'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';

const YEAR_GROUPS = ['MSI', 'MSII', 'MSIII', 'MSIV'] as const;
type YearGroup = (typeof YEAR_GROUPS)[number];

const yearDescriptions: Record<YearGroup, string> = {
  MSI: 'Military Science I - Freshman',
  MSII: 'Military Science II - Sophomore',
  MSIII: 'Military Science III - Junior',
  MSIV: 'Military Science IV - Senior',
};

export default function YearGroupPage() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<YearGroup | null>(null);

  async function handleNext() {
    if (!selected) return;
    try {
      await updateProfile({ yearGroup: selected });
    } catch (error) {
      console.warn('Failed to save year group:', error);
    }
    router.push('/onboarding/gpa');
  }

  return (
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[#151317] min-h-screen max-w-lg mx-auto">
      <span
        className="text-xs uppercase tracking-[0.3em] text-[#d9b9ff] mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 1 OF 5
      </span>
      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        WHAT YEAR ARE YOU?
      </h1>
      <p className="text-sm text-[#cdc3d4] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        This determines how your OML score is weighted and evaluated.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {YEAR_GROUPS.map((yg) => (
          <button
            key={yg}
            onClick={() => setSelected(yg)}
            className={`min-h-[60px] px-5 rounded-sm text-left cursor-pointer transition-all ${
              selected === yg
                ? 'bg-[#450084] text-[#b27ff5] shadow-lg shadow-[#450084]/30 glow-shadow-purple'
                : 'glass-card ghost-border text-[#e7e1e6] hover:bg-[#450084]/10'
            } flex flex-col justify-center`}
          >
            <span
              className={`text-base font-black uppercase tracking-tight ${selected === yg ? 'text-[#b27ff5]' : 'text-[#e7e1e6]'}`}
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {yg}
            </span>
            <span className={`text-xs mt-0.5 ${selected === yg ? 'text-[#d9b9ff]/80' : 'text-[#968d9d]'}`}>
              {yearDescriptions[yg]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-all shadow-lg shadow-[#450084]/20"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#d9b9ff]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
      </div>
    </div>
  );
}
