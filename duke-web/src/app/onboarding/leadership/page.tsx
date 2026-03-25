'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VInput } from '@/components';

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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[var(--color-background)] min-h-screen max-w-lg mx-auto">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 font-[family-name:var(--font-label)]">STEP 4 OF 5</span>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">
        Leadership Evaluation
      </h1>
      <p className="text-sm text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
        Your commander&apos;s assessment score is a key OML pillar. Enter it below or skip for now.
      </p>

      <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
        <VInput
          label="Commander's Assessment Score (optional)"
          value={leadershipEval}
          onChangeText={(v) => {
            setLeadershipEval(v);
            setError('');
          }}
          placeholder="85"
          type="number"
          helperText="Your most recent commander's assessment (0-100). You can add this later if you don't have it handy."
          error={!!error}
          errorText={error}
        />
      </div>

      <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 mt-4">
        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
          Don&apos;t worry if you don&apos;t have this yet. You can log leadership
          activities, command roles, and extracurriculars in detail after setup.
        </p>
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </div>
  );
}
