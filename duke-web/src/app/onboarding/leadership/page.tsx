'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VButton, VInput } from '@/components';

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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-8">
      <h1
        className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Leadership Evaluation
      </h1>

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

      <p className="text-sm text-[var(--color-outline)] mt-6">
        Don&apos;t worry if you don&apos;t have this yet. You can log leadership
        activities, command roles, and extracurriculars in detail after setup.
      </p>

      <div className="mt-auto pb-8">
        <VButton
          label="Next"
          onPress={handleNext}
          className="w-full"
        />
      </div>
    </div>
  );
}
