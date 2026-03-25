'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGoalsStore } from '@/stores/goals';

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  physical: { icon: 'fitness_center', color: '#c3cc8c', bg: '#2c3303' },
  academic: { icon: 'school', color: '#f8e19e', bg: '#544511' },
  leadership: { icon: 'military_tech', color: '#d9b9ff', bg: '#450084' },
  overall: { icon: 'query_stats', color: '#dbc585', bg: '#544511' },
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
      <div className="flex flex-col min-h-screen bg-[#151317]">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#151317] text-[#e7e1e6]">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <div className="pt-6 pb-8 px-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              GOAL
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <span className="material-symbols-outlined text-6xl text-[#968d9d]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-center" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              GOAL NOT FOUND
            </h2>
            <p className="text-sm text-[#968d9d] text-center leading-relaxed">
              This goal may have been deleted or hasn&apos;t been created yet.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-8 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentValue = goal.current_value ?? goal.baseline_value;
  const targetValue = goal.target_value;
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  const percentText = `${Math.round(progress * 100)}%`;
  const cat = CATEGORY_CONFIG[goal.category] ?? CATEGORY_CONFIG.overall;
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
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-goal { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            GOAL DETAIL
          </h1>
        </div>

        {/* Goal Header */}
        <section className="glass-panel-goal rounded-lg p-10 relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-[100px]">{cat.icon}</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-sm" style={{ backgroundColor: cat.bg }}>
                <span className="material-symbols-outlined" style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {statusLabels[goal.status] ?? goal.status}
                </span>
                {goal.created_by === 'ai' && (
                  <span className="px-3 py-1 bg-[#544511] text-[#dbc585] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    AI Coach
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              {goal.title}
            </h2>
          </div>
        </section>

        {/* Progress Gauge */}
        <section className="glass-panel-goal rounded-lg p-10 flex flex-col items-center" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.15)' }}>
          <div className="relative w-[200px] h-[200px] mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#373438" strokeWidth="14" />
              <circle
                cx="100" cy="100" r="85" fill="none"
                stroke={cat.color} strokeWidth="14"
                strokeDasharray={`${progress * 534} 534`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${cat.color}60)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))' }}>
                {percentText}
              </span>
            </div>
          </div>

          {/* Current vs Target */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <span className="text-3xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {currentDisplay}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1 block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Current
              </span>
            </div>
            <span className="text-2xl font-black text-[#968d9d]">/</span>
            <div className="text-center">
              <span className="text-3xl font-black text-[#d9b9ff] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {targetDisplay}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1 block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Target
              </span>
            </div>
          </div>
          {goal.oml_impact != null && goal.oml_impact > 0 && (
            <span className="text-sm font-bold text-[#d9b9ff]">
              +{goal.oml_impact} OML points when complete
            </span>
          )}
          <div className="w-full h-2 bg-[#373438] rounded-full mt-4">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: cat.color,
                boxShadow: `0 0 10px ${cat.color}40`,
              }}
            />
          </div>
        </section>

        {/* Progress History */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Progress History
          </h3>
          <div className="bg-[#211f23] rounded-lg p-8 text-center">
            <p className="text-sm text-[#e7e1e6] font-semibold">No progress logged yet</p>
            <p className="text-sm text-[#968d9d] mt-1">
              Your progress will appear here as you log new scores.
            </p>
          </div>
        </section>

        {/* Metadata */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Details
          </h3>
          <div className="bg-[#211f23] rounded-lg p-6 space-y-4">
            {[
              { label: 'Deadline', value: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '--' },
              { label: 'Baseline', value: goal.baseline_value % 1 === 0 ? String(Math.round(goal.baseline_value)) : goal.baseline_value.toFixed(2) },
              { label: 'Category', value: goal.category },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {item.label}
                </span>
                <span className="text-base font-black text-[#f8e19e] capitalize" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePause}
              className="w-full py-3 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold hover:bg-[#2c292d] transition-colors"
            >
              {goal.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-sm bg-[#211f23] text-[#ffb4ab] text-sm font-semibold hover:bg-[#93000a]/20 transition-colors"
            >
              Delete Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
