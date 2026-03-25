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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-secondary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">WHAT-IF SIMULATOR</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        <p className="text-sm md:text-base text-[var(--color-on-surface-variant)] leading-relaxed">
          Adjust your scores to see how changes would impact your OML.
        </p>

        {/* Projection */}
        <section className="flex gap-3">
          <div className="flex-[2] bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 font-[family-name:var(--font-label)]">Projected OML</span>
            <span className="text-4xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">{projectedOml}</span>
          </div>
          {delta !== 0 && (
            <div className={`flex-1 rounded-md shadow-[var(--shadow-sm)] p-4 flex flex-col items-center justify-center border ${delta > 0 ? 'bg-[var(--color-primary-container)] border-[var(--color-primary)]' : 'bg-[var(--color-error-container)] border-[var(--color-error)]'}`}>
              {delta > 0 ? <MdTrendingUp size={24} className="text-[var(--color-primary)]" /> : <MdTrendingDown size={24} className="text-[var(--color-error)]" />}
              <span className={`text-2xl font-bold mt-1 font-[family-name:var(--font-display)] ${delta > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                {deltaSign}{delta}
              </span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">OML pts</span>
            </div>
          )}
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Adjust Variables</h2>

          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 mb-3">
            <VInput
              label={`GPA (Current: ${currentGpa.toFixed(2)})`}
              value={whatIfGpa}
              onChangeText={setWhatIfGpa}
              placeholder="3.50"
              type="number"
            />
          </div>

          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 mb-3">
            <VInput
              label={`ACFT Total (Current: ${Math.round(currentAcft)})`}
              value={whatIfAcft}
              onChangeText={setWhatIfAcft}
              placeholder="480"
              type="number"
            />
          </div>

          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4">
            <VInput
              label={`Leadership Eval (Current: ${Math.round(currentLeadership)})`}
              value={whatIfLeadership}
              onChangeText={setWhatIfLeadership}
              placeholder="85"
              type="number"
            />
          </div>
        </section>

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <section className={`rounded-md shadow-[var(--shadow-sm)] p-4 border ${projectedOml >= profile.goalOml ? 'bg-[var(--color-primary-container)] border-[var(--color-primary)]' : 'gradient-gold border-transparent'}`}>
            <h3 className="text-base font-bold text-white mb-1 font-[family-name:var(--font-display)]">
              Target: {Math.round(profile.goalOml)} OML
            </h3>
            <p className="text-sm text-white/90">
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
