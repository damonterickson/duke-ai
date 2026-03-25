'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { VInput } from '@/components';
import { useScoresStore } from '@/stores/scores';
import { useProfileStore } from '@/stores/profile';

export default function WhatIfPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const profile = useProfileStore();

  const latestScore = scores.scoreHistory[0];
  const currentOml = latestScore?.total_oml ?? 0;
  const currentGpa = latestScore?.gpa ?? 0;
  const currentAcft = latestScore?.acft_total ?? 0;
  const currentLeadership = latestScore?.leadership_eval ?? 0;

  const [whatIfGpa, setWhatIfGpa] = useState(String(currentGpa || '3.50'));
  const [whatIfAcft, setWhatIfAcft] = useState(String(currentAcft || '480'));
  const [whatIfLeadership, setWhatIfLeadership] = useState(String(currentLeadership || '85'));

  // Simple OML estimation
  const projectedOml = useMemo(() => {
    const gpa = parseFloat(whatIfGpa) || 0;
    const acft = parseFloat(whatIfAcft) || 0;
    const lead = parseFloat(whatIfLeadership) || 0;
    const academic = (Math.min(gpa, 4.0) / 4.0) * 400;
    const physical = (Math.min(acft, 600) / 600) * 200;
    const leadership = (Math.min(lead, 100) / 100) * 400;
    return Math.round(academic + physical + leadership);
  }, [whatIfGpa, whatIfAcft, whatIfLeadership]);

  const delta = projectedOml - Math.round(currentOml);
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#dbc585]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          WHAT-IF SIMULATOR
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        <p className="text-sm md:text-base text-[#cdc3d4] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Adjust your scores to see how changes would impact your OML.
        </p>

        {/* Projection */}
        <section className="flex gap-3">
          <div className="flex-[2] glass-card ghost-border rounded-sm p-5 flex flex-col items-center justify-center glow-shadow-gold">
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Projected OML
            </span>
            <span
              className="text-4xl font-black text-[#f8e19e]"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {projectedOml}
            </span>
          </div>
          {delta !== 0 && (
            <div className={`flex-1 rounded-sm p-4 flex flex-col items-center justify-center ${delta > 0 ? 'bg-[#450084] glow-shadow-purple' : 'bg-[#93000a]/30'}`}>
              {delta > 0 ? <MdTrendingUp size={24} className="text-[#d9b9ff]" /> : <MdTrendingDown size={24} className="text-[#ffb4ab]" />}
              <span
                className={`text-2xl font-black mt-1 ${delta > 0 ? 'text-[#d9b9ff]' : 'text-[#ffb4ab]'}`}
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {deltaSign}{delta}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                OML pts
              </span>
            </div>
          )}
        </section>

        {/* Inputs */}
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ADJUST VARIABLES
          </h2>

          <div className="space-y-4">
            <div className="glass-card ghost-border rounded-sm p-4">
              <VInput
                label={`GPA (Current: ${currentGpa.toFixed(2)})`}
                value={whatIfGpa}
                onChangeText={setWhatIfGpa}
                placeholder="3.50"
                type="number"
              />
            </div>

            <div className="glass-card ghost-border rounded-sm p-4">
              <VInput
                label={`ACFT Total (Current: ${Math.round(currentAcft)})`}
                value={whatIfAcft}
                onChangeText={setWhatIfAcft}
                placeholder="480"
                type="number"
              />
            </div>

            <div className="glass-card ghost-border rounded-sm p-4">
              <VInput
                label={`Leadership Eval (Current: ${Math.round(currentLeadership)})`}
                value={whatIfLeadership}
                onChangeText={setWhatIfLeadership}
                placeholder="85"
                type="number"
              />
            </div>
          </div>
        </section>

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <section className={`rounded-sm p-5 ${projectedOml >= profile.goalOml ? 'bg-[#450084] glow-shadow-purple' : 'bg-[#544511] glow-shadow-gold'}`}>
            <h3
              className="text-base font-black uppercase tracking-tight text-[#e7e1e6] mb-1"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              Target: {Math.round(profile.goalOml)} OML
            </h3>
            <p className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {projectedOml >= profile.goalOml
                ? 'This scenario meets your target!'
                : `${Math.round(profile.goalOml - projectedOml)} points short of your target.`}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
