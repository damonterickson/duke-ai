'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VInput } from '@/components';
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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[var(--color-background)] min-h-screen max-w-lg mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 font-[family-name:var(--font-label)]">STEP 3 OF 5</span>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">
        Fitness Profile
      </h1>
      <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
        Gender and age bracket are used for ACFT scoring normalization.
      </p>

      {/* Gender Selection */}
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 font-[family-name:var(--font-label)]">
        Gender (for ACFT scoring)
      </label>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {(['M', 'F'] as const).map((g) => (
          <button
            key={g}
            onClick={() => { setGender(g); setError(''); }}
            className={`min-h-[52px] rounded-md font-bold text-sm cursor-pointer transition-all border ${
              gender === g
                ? 'gradient-primary text-white border-transparent shadow-[var(--shadow-sm)]'
                : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
            }`}
          >
            {g === 'M' ? 'Male' : 'Female'}
          </button>
        ))}
      </div>

      {/* Age Bracket */}
      <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 font-[family-name:var(--font-label)]">
        Age Bracket
      </label>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {AGE_BRACKETS.map((bracket) => (
          <button
            key={bracket}
            onClick={() => { setAgeBracket(bracket); setError(''); }}
            className={`min-h-[52px] rounded-md font-bold text-sm cursor-pointer transition-all border ${
              ageBracket === bracket
                ? 'gradient-primary text-white border-transparent shadow-[var(--shadow-sm)]'
                : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
            }`}
          >
            {bracket}
          </button>
        ))}
      </div>

      {/* ACFT Total */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
        <VInput
          label="ACFT Total Score (optional)"
          value={acftTotal}
          onChangeText={(v) => {
            setAcftTotal(v);
            setError('');
          }}
          placeholder="480"
          type="number"
          helperText="Enter your most recent ACFT total (0-600). You can add details later."
          error={!!error}
          errorText={error}
        />
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          disabled={!gender || !ageBracket}
          className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </div>
  );
}
