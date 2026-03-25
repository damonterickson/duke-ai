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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[var(--color-background)] min-h-screen max-w-lg mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 font-[family-name:var(--font-label)]">STEP 1 OF 5</span>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">
        What year are you?
      </h1>
      <p className="text-sm text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
        This determines how your OML score is weighted and evaluated.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {YEAR_GROUPS.map((yg) => (
          <button
            key={yg}
            onClick={() => setSelected(yg)}
            className={`min-h-[60px] px-5 rounded-md text-left cursor-pointer transition-all border ${
              selected === yg
                ? 'gradient-primary text-white border-transparent shadow-[var(--shadow-sm)]'
                : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
            } flex flex-col justify-center`}
          >
            <span className={`text-base font-bold ${selected === yg ? 'text-white' : 'text-[var(--color-on-surface)]'}`}>{yg}</span>
            <span className={`text-xs mt-0.5 ${selected === yg ? 'text-white/80' : 'text-[var(--color-on-surface-variant)]'}`}>{yearDescriptions[yg]}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </div>
  );
}
