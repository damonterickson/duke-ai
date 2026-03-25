'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-10 pb-4">
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585] mb-3 block"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          STEP 05 OF 05
        </span>

        <h1
          className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          TARGET BRANCH
        </h1>

        <p className="text-sm text-[#968d9d] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Which branch are you hoping for? This helps Vanguard AI tailor its advice.
        </p>

        {/* Branch chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {POPULAR_BRANCHES.map((branch) => (
            <button
              key={branch}
              onClick={() => setSelected(branch)}
              className={`px-4 py-2.5 rounded-sm text-sm font-semibold cursor-pointer transition-all ${
                selected === branch
                  ? 'bg-[#450084] text-[#b27ff5] glow-purple-ob'
                  : 'glass-surface-ob text-[#e7e1e6] hover:bg-[#2c292d]'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* Target OML input */}
        <div className="glass-panel-ob rounded-sm p-6">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Target OML Score (optional)
            </label>
            <input
              type="number"
              value={goalOml}
              onChange={(e) => setGoalOml(e.target.value)}
              placeholder="700"
              className="bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]/50 text-base transition-all"
              style={{ fontFamily: 'Inter, sans-serif', border: 'none' }}
            />
            <span className="text-xs text-[#968d9d]/70 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Set a goal OML score to track progress against.
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-4">
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.01] transition-all glow-gold-ob flex items-center justify-center gap-3"
          style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 25px rgba(219, 197, 133, 0.25)' }}
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          Finish Setup
        </button>
      </div>
    </div>
  );
}
