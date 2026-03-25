'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VInput } from '@/components';
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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[var(--color-background)] min-h-screen max-w-lg mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 font-[family-name:var(--font-label)]">STEP 2 OF 5</span>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">
        What&apos;s your GPA?
      </h1>
      <p className="text-sm text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
        GPA is a major component of your OML score. Enter your most recent cumulative GPA.
      </p>

      <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5 space-y-4">
        <VInput
          label="Cumulative GPA"
          value={gpa}
          onChangeText={(v) => {
            setGpa(v);
            setError('');
          }}
          placeholder="3.50"
          type="number"
          error={!!error}
          errorText={error}
        />

        <VInput
          label="MSL GPA (optional)"
          value={mslGpa}
          onChangeText={setMslGpa}
          placeholder="3.80"
          type="number"
          helperText="Military Science GPA. Leave blank to use your cumulative GPA."
        />
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          disabled={!gpa.trim()}
          className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </div>
  );
}
