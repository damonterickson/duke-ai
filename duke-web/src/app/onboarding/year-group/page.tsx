'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VButton } from '@/components';
import { useProfileStore } from '@/stores/profile';

const YEAR_GROUPS = ['MSI', 'MSII', 'MSIII', 'MSIV'] as const;
type YearGroup = (typeof YEAR_GROUPS)[number];

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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-8">
      <h1
        className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-8"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        What year are you?
      </h1>

      <div className="flex flex-col gap-3 mb-8">
        {YEAR_GROUPS.map((yg) => (
          <VButton
            key={yg}
            label={yg}
            onPress={() => setSelected(yg)}
            variant={selected === yg ? 'primary' : 'secondary'}
            className="min-h-[56px]"
          />
        ))}
      </div>

      <div className="mt-auto pb-8">
        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!selected}
          className="w-full"
        />
      </div>
    </div>
  );
}
