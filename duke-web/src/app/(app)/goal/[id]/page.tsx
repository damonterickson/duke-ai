'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { VButton, VConicGauge, VProgressBar, VRankBadge } from '@/components';
import { useGoalsStore } from '@/stores/goals';

const categoryIcons: Record<string, string> = {
  acft: '\u{1F4AA}',
  gpa: '\u{1F4DA}',
  leadership: '\u{1F396}\uFE0F',
  oml: '\u{1F4CA}',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  expired: 'Expired',
  paused: 'Paused',
};

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const goals = useGoalsStore((s: any) => s.goals);
  const isLoaded = useGoalsStore((s: any) => s.isLoaded);
  const removeGoal = useGoalsStore((s: any) => s.removeGoal);

  const goalId = id ? parseInt(id, 10) : NaN;
  const goal = !isNaN(goalId) ? goals.find((g: any) => g.id === goalId) : undefined;

  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-full bg-[var(--color-background)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col min-h-full bg-[var(--color-background)]">
        <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
          <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">GOAL</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <span className="text-5xl">{'\u{1F3AF}'}</span>
          <h1 className="text-xl font-bold text-[var(--color-on-surface)] text-center font-[family-name:var(--font-display)]">Goal Not Found</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] text-center leading-relaxed">
            This goal may have been deleted or hasn&apos;t been created yet.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2.5 rounded-md gradient-primary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentValue = goal.current_value ?? goal.baseline_value;
  const targetValue = goal.target_value;
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  const percentText = `${Math.round(progress * 100)}%`;
  const icon = categoryIcons[goal.category] ?? '\u{1F4CA}';
  const isCompleted = goal.status === 'completed';

  const currentDisplay = currentValue % 1 === 0 ? String(Math.round(currentValue)) : currentValue.toFixed(2);
  const targetDisplay = targetValue % 1 === 0 ? String(Math.round(targetValue)) : targetValue.toFixed(2);

  function handlePause() {
    const isPaused = goal.status === 'paused';
    const action = isPaused ? 'Resume' : 'Pause';
    if (window.confirm(`${action} this goal?`)) {
      window.alert(`Goal ${isPaused ? 'resumed' : 'paused'}.`);
    }
  }

  function handleDelete() {
    if (window.confirm('Delete this goal? This action cannot be undone.')) {
      if (goal.id != null) {
        removeGoal(goal.id);
      }
      router.back();
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">GOAL DETAIL</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Title */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{icon}</span>
            <h1 className="text-xl font-bold text-[var(--color-on-surface)] flex-1 font-[family-name:var(--font-display)]">{goal.title}</h1>
          </div>
          <div className="flex gap-2">
            <VRankBadge
              rank={statusLabels[goal.status] ?? goal.status}
              className="bg-opacity-20"
              label={`Status: ${statusLabels[goal.status] ?? goal.status}`}
            />
            {goal.created_by === 'ai' && (
              <VRankBadge rank="AI Coach" label="Created by AI Coach" />
            )}
          </div>
        </section>

        {/* Progress Gauge */}
        <section className="flex justify-center bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] py-8">
          <VConicGauge progress={progress} size={180} strokeWidth={16} label={percentText} />
        </section>

        {/* Current vs Target */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <span className="text-3xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">{currentDisplay}</span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] mt-1 block uppercase tracking-wider font-[family-name:var(--font-label)]">Current</span>
            </div>
            <span className="text-2xl font-bold text-[var(--color-outline)]">/</span>
            <div className="text-center">
              <span className="text-3xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">{targetDisplay}</span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] mt-1 block uppercase tracking-wider font-[family-name:var(--font-label)]">Target</span>
            </div>
          </div>
          {goal.oml_impact != null && goal.oml_impact > 0 && (
            <span className="text-sm font-bold text-[var(--color-primary)] mb-3">
              +{goal.oml_impact} OML points when complete
            </span>
          )}
          <VProgressBar progress={progress} height={8} className="mt-2 w-full" />
        </section>

        {/* Progress History */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Progress History</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
            <p className="text-sm text-[var(--color-on-surface)] text-center font-semibold">No progress logged yet</p>
            <p className="text-sm text-[var(--color-on-surface-variant)] text-center mt-1">
              Your progress will appear here as you log new scores.
            </p>
          </div>
        </section>

        {/* Metadata */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 divide-y divide-[var(--ghost-border)]">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Deadline</span>
            <span className="text-base font-bold text-[var(--color-on-surface)]">
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Baseline</span>
            <span className="text-base font-bold text-[var(--color-on-surface)]">
              {goal.baseline_value % 1 === 0 ? String(Math.round(goal.baseline_value)) : goal.baseline_value.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Category</span>
            <span className="text-base font-bold text-[var(--color-on-surface)] capitalize">{goal.category}</span>
          </div>
        </section>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePause}
              className="w-full py-3 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
            >
              {goal.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-md border border-[var(--color-error)] text-[var(--color-error)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-error-container)] transition-colors"
            >
              Delete Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
