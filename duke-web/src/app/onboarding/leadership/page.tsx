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
    <div className="flex-1 flex flex-col px-6 md:px-8 pt-10 bg-[#151317] min-h-screen max-w-lg mx-auto">
      <span
        className="text-xs uppercase tracking-[0.3em] text-[#d9b9ff] mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        STEP 4 OF 5
      </span>
      <h1
        className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
        style={{ fontFamily: 'Public Sans, sans-serif' }}
      >
        LEADERSHIP EVALUATION
      </h1>
      <p className="text-sm text-[#cdc3d4] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        Your commander&apos;s assessment score is a key OML pillar. Enter it below or skip for now.
      </p>

      <div className="glass-card ghost-border rounded-sm p-5">
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

      <div className="glass-card ghost-border rounded-sm p-4 mt-4">
        <p className="text-sm text-[#cdc3d4] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Don&apos;t worry if you don&apos;t have this yet. You can log leadership
          activities, command roles, and extracurriculars in detail after setup.
        </p>
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Next
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#d9b9ff]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
      </div>
    </div>
  );
}
