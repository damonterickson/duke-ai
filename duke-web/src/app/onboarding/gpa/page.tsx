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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[#151317] min-h-screen max-w-lg mx-auto">
      <span
        className="text-xs uppercase tracking-[0.3em] text-[#d9b9ff] mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 2 OF 5
      </span>
      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        WHAT&apos;S YOUR GPA?
      </h1>
      <p className="text-sm text-[#cdc3d4] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        GPA is a major component of your OML score. Enter your most recent cumulative GPA.
      </p>

      <div className="glass-card ghost-border rounded-sm p-5 space-y-4">
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
          className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-all shadow-lg shadow-[#450084]/20"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#d9b9ff]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
      </div>
    </div>
  );
}
