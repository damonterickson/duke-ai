'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VButton, VInput } from '@/components';
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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-8">
      <h1
        className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Fitness Profile
      </h1>

      {/* Gender Selection */}
      <label className="text-sm font-semibold text-[var(--color-on-surface)] mb-2 mt-2">
        Gender (for ACFT scoring)
      </label>
      <div className="grid grid-cols-2 gap-3">
        <VButton
          label="Male"
          onPress={() => {
            setGender('M');
            setError('');
          }}
          variant={gender === 'M' ? 'primary' : 'secondary'}
          className="min-h-[48px]"
        />
        <VButton
          label="Female"
          onPress={() => {
            setGender('F');
            setError('');
          }}
          variant={gender === 'F' ? 'primary' : 'secondary'}
          className="min-h-[48px]"
        />
      </div>

      {/* Age Bracket */}
      <label className="text-sm font-semibold text-[var(--color-on-surface)] mb-2 mt-4">
        Age Bracket
      </label>
      <div className="grid grid-cols-3 gap-3">
        {AGE_BRACKETS.map((bracket) => (
          <VButton
            key={bracket}
            label={bracket}
            onPress={() => {
              setAgeBracket(bracket);
              setError('');
            }}
            variant={ageBracket === bracket ? 'primary' : 'secondary'}
            className="min-h-[48px]"
          />
        ))}
      </div>

      {/* ACFT Total */}
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
        className="mt-4"
      />

      <div className="mt-auto pb-8">
        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!gender || !ageBracket}
          className="w-full"
        />
      </div>
    </div>
  );
}
