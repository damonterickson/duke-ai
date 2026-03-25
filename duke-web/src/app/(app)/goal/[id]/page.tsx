'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { VConicGauge, VProgressBar, VRankBadge } from '@/components';
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
      <div className="flex flex-col min-h-full bg-[#151317]">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col min-h-full bg-[#151317]">
        <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20">
          <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
            <MdArrowBack size={24} />
          </button>
          <h1
            className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            GOAL
          </h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <span className="text-5xl">{'\u{1F3AF}'}</span>
          <h1
            className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] text-center"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            GOAL NOT FOUND
          </h1>
          <p className="text-sm text-[#cdc3d4] text-center leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            This goal may have been deleted or hasn&apos;t been created yet.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
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
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          GOAL DETAIL
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* Title */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{icon}</span>
            <h1
              className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] flex-1"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {goal.title}
            </h1>
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
        <section className="flex justify-center glass-card ghost-border rounded-sm py-8 glow-shadow-purple">
          <VConicGauge progress={progress} size={180} strokeWidth={16} label={percentText} />
        </section>

        {/* Current vs Target */}
        <section className="glass-card ghost-border rounded-sm p-5 flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <span
                className="text-3xl font-black text-[#f8e19e] block"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {currentDisplay}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Current
              </span>
            </div>
            <span className="text-2xl font-black text-[#968d9d]">/</span>
            <div className="text-center">
              <span
                className="text-3xl font-black text-[#d9b9ff] block"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {targetDisplay}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Target
              </span>
            </div>
          </div>
          {goal.oml_impact != null && goal.oml_impact > 0 && (
            <span className="text-sm font-bold text-[#d9b9ff] mb-3">
              +{goal.oml_impact} OML points when complete
            </span>
          )}
          <VProgressBar progress={progress} height={8} className="mt-2 w-full" />
        </section>

        {/* Progress History */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            PROGRESS HISTORY
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5">
            <p className="text-sm text-[#e7e1e6] text-center font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>No progress logged yet</p>
            <p className="text-sm text-[#cdc3d4] text-center mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your progress will appear here as you log new scores.
            </p>
          </div>
        </section>

        {/* Metadata */}
        <section className="glass-card ghost-border rounded-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Deadline
            </span>
            <span
              className="text-base font-black text-[#f8e19e]"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Baseline
            </span>
            <span
              className="text-base font-black text-[#f8e19e]"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {goal.baseline_value % 1 === 0 ? String(Math.round(goal.baseline_value)) : goal.baseline_value.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Category
            </span>
            <span
              className="text-base font-black text-[#f8e19e] capitalize"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {goal.category}
            </span>
          </div>
        </section>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePause}
              className="w-full py-3 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#450084]/10 transition-colors"
            >
              {goal.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-sm text-[#ffb4ab] text-sm font-semibold cursor-pointer glass-card ghost-border hover:bg-[#93000a]/20 transition-colors"
            >
              Delete Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
