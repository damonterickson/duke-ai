'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VInput } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { getSession, getSupabase } from '@/services/supabase';

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

    try {
      localStorage.setItem('duke_onboarding_complete', 'true');
    } catch {
      // localStorage may not be available
    }

    try {
      const session = await getSession();
      if (session) {
        const sb = getSupabase();
        await sb.from('profiles').upsert({
          id: session.user.id,
          onboarding_complete: true,
          year_group: useProfileStore.getState().yearGroup,
          target_branch: selected,
          goal_oml: goalOml ? parseFloat(goalOml) : null,
        });
      }
    } catch (err) {
      console.warn('Failed to sync onboarding to Supabase:', err);
    }

    router.push('/onboarding/mission-ready');
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-background)] min-h-screen max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-10 pb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 block font-[family-name:var(--font-label)]">STEP 5 OF 5</span>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">
          Target Branch
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
          Which branch are you hoping for? This helps Vanguard AI tailor its advice.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {POPULAR_BRANCHES.map((branch) => (
            <button
              key={branch}
              onClick={() => setSelected(branch)}
              className={`px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-all border ${
                selected === branch
                  ? 'gradient-primary text-white border-transparent shadow-[var(--shadow-sm)]'
                  : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
          <VInput
            label="Target OML Score (optional)"
            value={goalOml}
            onChangeText={setGoalOml}
            placeholder="700"
            type="number"
            helperText="Set a goal OML score to track progress against."
          />
        </div>
      </div>

      <div className="px-6 md:px-8 pb-8">
        <button
          onClick={handleFinish}
          className="w-full py-3.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-glow font-[family-name:var(--font-label)]"
        >
          Finish Setup
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
      </div>
    </div>
  );
}
