'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VButton, VInput } from '@/components';
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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-8">
      <h1
        className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-8"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        What&apos;s your GPA?
      </h1>

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
        className="mt-4"
      />

      <div className="mt-auto pb-8">
        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!gpa.trim()}
          className="w-full"
        />
      </div>
    </div>
  );
}
