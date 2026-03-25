'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { VButton, VCard, VInput, VMetricCard } from '@/components';
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
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="flex items-center justify-between mt-2 mb-2">
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">What-If Simulator</h1>
          <VButton label="Close" onPress={() => router.back()} variant="tertiary" />
        </div>

        <p className="text-sm text-[var(--color-outline)] mb-4">
          Adjust your scores to see how changes would impact your OML.
        </p>

        {/* Projection */}
        <div className="flex gap-3 mb-6">
          <VMetricCard
            value={String(projectedOml)}
            label="Projected OML"
            className="flex-[2]"
          />
          {delta !== 0 && (
            <VCard tier={delta > 0 ? 'low' : 'high'} className="flex-1 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${delta > 0 ? 'text-[var(--color-tertiary)]' : 'text-[var(--color-error)]'}`}>
                {deltaSign}{delta}
              </span>
              <span className="text-xs text-[var(--color-outline)]">OML points</span>
            </VCard>
          )}
        </div>

        {/* Inputs */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">Adjust Variables</h2>

        <VCard tier="low" className="mb-3">
          <VInput
            label={`GPA (Current: ${currentGpa.toFixed(2)})`}
            value={whatIfGpa}
            onChangeText={setWhatIfGpa}
            placeholder="3.50"
            type="number"
          />
        </VCard>

        <VCard tier="low" className="mb-3">
          <VInput
            label={`ACFT Total (Current: ${Math.round(currentAcft)})`}
            value={whatIfAcft}
            onChangeText={setWhatIfAcft}
            placeholder="480"
            type="number"
          />
        </VCard>

        <VCard tier="low" className="mb-3">
          <VInput
            label={`Leadership Eval (Current: ${Math.round(currentLeadership)})`}
            value={whatIfLeadership}
            onChangeText={setWhatIfLeadership}
            placeholder="85"
            type="number"
          />
        </VCard>

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <VCard tier="high" className="mt-4">
            <h3 className="text-base font-semibold text-[var(--color-tertiary)] mb-1">
              Target: {Math.round(profile.goalOml)} OML
            </h3>
            <p className="text-sm text-[var(--color-on-surface)]">
              {projectedOml >= profile.goalOml
                ? 'This scenario meets your target!'
                : `${Math.round(profile.goalOml - projectedOml)} points short of your target.`}
            </p>
          </VCard>
        )}
      </div>
    </div>
  );
}
