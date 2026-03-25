'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';

const YEAR_GROUPS = [
  { key: 'MSI', label: 'MSI', subtitle: 'Foundation', desc: 'Military Science I' },
  { key: 'MSII', label: 'MSII', subtitle: 'Development', desc: 'Military Science II' },
  { key: 'MSIII', label: 'MSIII', subtitle: 'Advancement', desc: 'Military Science III' },
  { key: 'MSIV', label: 'MSIV', subtitle: 'Commissioning', desc: 'Military Science IV' },
] as const;

type YearGroup = (typeof YEAR_GROUPS)[number]['key'];

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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 max-w-lg mx-auto w-full">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585] mb-3"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 01 OF 05
      </span>

      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        WHAT YEAR ARE YOU?
      </h1>

      <p className="text-sm text-[#968d9d] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        This determines how your OML score is weighted and evaluated.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-8">
        {YEAR_GROUPS.map((yg) => (
          <button
            key={yg.key}
            onClick={() => setSelected(yg.key)}
            className={`p-5 rounded-sm text-left cursor-pointer transition-all ${
              selected === yg.key
                ? 'bg-[#450084] glow-purple-ob'
                : 'glass-surface-ob hover:bg-[#2c292d]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-lg font-black uppercase tracking-tight block ${
                    selected === yg.key ? 'text-[#b27ff5]' : 'text-[#e7e1e6]'
                  }`}
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {yg.label}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    selected === yg.key ? 'text-[#d9b9ff]/70' : 'text-[#968d9d]'
                  }`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {yg.subtitle}
                </span>
              </div>
              <span
                className={`text-xs ${
                  selected === yg.key ? 'text-[#d9b9ff]/60' : 'text-[#968d9d]/60'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {yg.desc}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto pb-4">
        <button
          onClick={handleNext}
          disabled={!selected}
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
