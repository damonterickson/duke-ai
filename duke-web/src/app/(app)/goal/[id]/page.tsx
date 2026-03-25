'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VButton, VCard, VConicGauge, VProgressBar, VRankBadge } from '@/components';
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
      <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-[var(--color-outline)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <span className="text-6xl">{'\u{1F3AF}'}</span>
          <h1 className="text-xl font-semibold text-[var(--color-on-surface)] text-center">Goal Not Found</h1>
          <p className="text-sm text-[var(--color-outline)] text-center">
            This goal may have been deleted or hasn&apos;t been created yet.
          </p>
          <VButton label="Back to Dashboard" onPress={() => router.back()} variant="secondary" className="mt-4" />
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

  const statusColors: Record<string, string> = {
    active: 'var(--color-primary)',
    completed: 'var(--color-tertiary)',
    expired: 'var(--color-error)',
    paused: 'var(--color-outline)',
  };

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
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        {/* Header */}
        <div className="flex justify-start mt-2 mb-2">
          <VButton label="Back" onPress={() => router.back()} variant="tertiary" />
        </div>

        {/* Title */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{icon}</span>
            <h1 className="text-xl font-semibold text-[var(--color-on-surface)] flex-1">{goal.title}</h1>
          </div>
          <div className="flex gap-2">
            <VRankBadge
              rank={statusLabels[goal.status] ?? goal.status}
              className={`bg-opacity-20`}
              label={`Status: ${statusLabels[goal.status] ?? goal.status}`}
            />
            {goal.created_by === 'ai' && (
              <VRankBadge rank="AI Coach" label="Created by AI Coach" />
            )}
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="flex justify-center mb-6">
          <VConicGauge progress={progress} size={180} strokeWidth={16} label={percentText} />
        </div>

        {/* Current vs Target */}
        <VCard tier="lowest" className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-center">
              <span className="text-2xl font-bold text-[var(--color-on-surface)] block">{currentDisplay}</span>
              <span className="text-xs text-[var(--color-outline)] mt-1 block">Current</span>
            </div>
            <span className="text-2xl font-bold text-[var(--color-outline)]">/</span>
            <div className="text-center">
              <span className="text-2xl font-bold text-[var(--color-on-surface)] block">{targetDisplay}</span>
              <span className="text-xs text-[var(--color-outline)] mt-1 block">Target</span>
            </div>
          </div>
          {goal.oml_impact != null && goal.oml_impact > 0 && (
            <span className="text-sm font-medium text-[var(--color-tertiary)] mb-3">
              +{goal.oml_impact} OML points when complete
            </span>
          )}
          <VProgressBar progress={progress} height={8} className="mt-2 w-full" />
        </VCard>

        {/* Progress History */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Progress History</h2>
        <VCard tier="low" className="mb-4 py-4 px-4">
          <p className="text-sm text-[var(--color-on-surface)] text-center">No progress logged yet</p>
          <p className="text-sm text-[var(--color-outline)] text-center mt-1">
            Your progress will appear here as you log new scores.
          </p>
        </VCard>

        {/* Metadata */}
        <VCard tier="low" className="mb-4 py-4 px-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-[var(--color-outline)]">Deadline</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-[var(--color-outline)]">Baseline</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">
              {goal.baseline_value % 1 === 0 ? String(Math.round(goal.baseline_value)) : goal.baseline_value.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-[var(--color-outline)]">Category</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">{goal.category}</span>
          </div>
        </VCard>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex flex-col gap-3 mt-6">
            <VButton
              label={goal.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
              onPress={handlePause}
              variant="secondary"
              className="min-h-[48px]"
            />
            <VButton
              label="Delete Goal"
              onPress={handleDelete}
              variant="tertiary"
              className="min-h-[48px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
