'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VButton, VInput } from '@/components';
import { useProfileStore } from '@/stores/profile';

const POPULAR_BRANCHES = [
  'Infantry',
  'Armor',
  'Aviation',
  'Engineer',
  'Signal',
  'Military Intelligence',
  'Medical Service',
  'Finance',
  'Quartermaster',
  'Transportation',
];

export default function BranchPage() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<string | null>(null);
  const [goalOml, setGoalOml] = useState('');

  async function handleFinish() {
    try {
      await updateProfile({
        targetBranch: selected,
        goalOml: goalOml ? parseFloat(goalOml) : null,
      });
    } catch (err) {
      console.warn('Failed to save branch info:', err);
    }

    // Mark onboarding complete
    try {
      localStorage.setItem('duke_onboarding_complete', 'true');
    } catch {
      // localStorage may not be available
    }

    router.push('/onboarding/mission-ready');
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-8 pb-4">
        <h1
          className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Target Branch
        </h1>
        <p className="text-sm text-[var(--color-outline)] mb-6">
          Which branch are you hoping for? This helps Vanguard AI tailor its
          advice.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {POPULAR_BRANCHES.map((branch) => (
            <VButton
              key={branch}
              label={branch}
              onPress={() => setSelected(branch)}
              variant={selected === branch ? 'primary' : 'secondary'}
              className="px-4"
            />
          ))}
        </div>

        <VInput
          label="Target OML Score (optional)"
          value={goalOml}
          onChangeText={setGoalOml}
          placeholder="700"
          type="number"
          helperText="Set a goal OML score to track progress against."
          className="mt-2"
        />
      </div>

      <div className="px-6 md:px-8 pb-8">
        <VButton
          label="Finish Setup"
          onPress={handleFinish}
          className="w-full"
        />
      </div>
    </div>
  );
}
