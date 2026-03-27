'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useGoalsStore } from '@/stores/goals';
import { profileFromScores, calculateOMS } from '@/engine/oms';
import { loadAuditState, computeTotalUnclaimed } from '@/services/auditData';

// ─── Goal category config ───────────────────────────────────
const CATEGORIES = [
  { key: 'physical', label: 'Physical', icon: 'fitness_center', color: '#d9b9ff', bgColor: '#450084' },
  { key: 'academic', label: 'Academic', icon: 'school', color: '#dbc585', bgColor: '#544511' },
  { key: 'leadership', label: 'Leadership', icon: 'diversity_3', color: '#c3cc8c', bgColor: '#2c3303' },
  { key: 'overall', label: 'Overall', icon: 'military_tech', color: '#f8e19e', bgColor: '#544511' },
] as const;

// ─── Auto-generated goal suggestions ────────────────────────
function getSuggestedGoals(gpa: number | null, acft: number | null, leadership: number | null) {
  const suggestions: Array<{ title: string; category: string; metric: string; target_value: number; description: string }> = [];

  if (!gpa || gpa < 3.5) {
    suggestions.push({
      title: 'Raise GPA to 3.5+',
      category: 'academic',
      metric: 'gpa',
      target_value: 3.5,
      description: 'Target a 3.5+ cumulative GPA to maximize academic OMS contribution.',
    });
  }
  if (!acft || acft < 500) {
    suggestions.push({
      title: 'Hit 500+ ACFT Total',
      category: 'physical',
      metric: 'acft_total',
      target_value: 500,
      description: 'Push your ACFT total above 500 for significant OMS improvement.',
    });
  }
  if (!leadership || leadership < 80) {
    suggestions.push({
      title: 'Earn 80+ Leadership Eval',
      category: 'leadership',
      metric: 'leadership_eval',
      target_value: 80,
      description: 'Seek command roles and extracurriculars to boost your leadership score.',
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Maintain Top Performance',
      category: 'overall',
      metric: 'total_oms',
      target_value: 85,
      description: 'You\'re performing well. Keep all pillars above target to maintain ranking.',
    });
  }
  return suggestions;
}

// ─── Generate contextual insights ───────────────────────────
function getInsights(gpa: number | null, acft: number | null, activeGoals: number) {
  const insights: Array<{ title: string; body: string; icon: string; iconColor: string; bgColor: string }> = [];

  if (gpa && gpa >= 3.0) {
    insights.push({
      title: 'Academic Strength Detected',
      body: `Your ${gpa.toFixed(2)} GPA is a strong OMS contributor. Focus physical training to create a balanced profile.`,
      icon: 'school',
      iconColor: '#dbc585',
      bgColor: '#544511',
    });
  } else {
    insights.push({
      title: 'Academic Focus Recommended',
      body: 'Academic pillar is worth up to 29 OMS points. Prioritize study hours for maximum impact.',
      icon: 'psychology',
      iconColor: '#c3cc8c',
      bgColor: '#2c3303',
    });
  }

  if (activeGoals === 0) {
    insights.push({
      title: 'Set Your First Path',
      body: 'Optimization paths help you track progress and stay focused. Create one below or accept a suggested goal.',
      icon: 'flag',
      iconColor: '#d9b9ff',
      bgColor: '#450084',
    });
  } else if (activeGoals >= 3) {
    insights.push({
      title: 'Path Load Check',
      body: `You have ${activeGoals} active paths. Consider completing or retiring one before adding more.`,
      icon: 'psychology',
      iconColor: '#c3cc8c',
      bgColor: '#2c3303',
    });
  } else {
    insights.push({
      title: 'Squad Leadership Opportunity',
      body: 'Volunteer for lead roles during field exercises. Leadership pillar is worth up to 62 OMS points.',
      icon: 'military_tech',
      iconColor: '#dbc585',
      bgColor: '#544511',
    });
  }

  // Check for unclaimed audit points (client-only)
  if (typeof window !== 'undefined') {
    try {
      const auditState = loadAuditState();
      const unclaimed = computeTotalUnclaimed(auditState.items);
      if (unclaimed > 0) {
        insights.push({
          title: 'Hidden Points Available',
          body: `You have ${unclaimed.toFixed(1)} unclaimed OMS points. Run the Hidden Points Audit to claim them.`,
          icon: 'fact_check',
          iconColor: '#f8e19e',
          bgColor: '#544511',
        });
      }
    } catch {
      // Ignore errors in SSR or when localStorage is unavailable
    }
  }

  return insights;
}

// ─── Create Path Modal ──────────────────────────────────────
function CreateGoalModal({ onClose, onSave }: { onClose: () => void; onSave: (goal: { title: string; category: string; metric: string; target_value: number }) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('physical');
  const [target, setTarget] = useState('');

  const metrics: Record<string, string> = { physical: 'acft_total', academic: 'gpa', leadership: 'leadership_eval', overall: 'total_oms' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#211f23] rounded-lg p-8 w-full max-w-md space-y-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>
          NEW PATH
        </h3>

        <div>
          <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Path Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Hit 500 ACFT"
            className="w-full bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
            style={{ border: 'none' }}
          />
        </div>

        <div>
          <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`p-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${
                  category === cat.key
                    ? 'bg-[#450084] text-[#d9b9ff]'
                    : 'bg-[#151317] text-[#968d9d] hover:bg-[#1d1b1f]'
                }`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Target Value</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., 500"
            className="w-full bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
            style={{ border: 'none' }}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-sm text-[#968d9d] hover:text-[#e7e1e6] transition-colors text-sm font-bold uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim() && target) {
                onSave({ title: title.trim(), category, metric: metrics[category], target_value: parseFloat(target) });
              }
            }}
            className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] hover:scale-[1.02] transition-all text-sm font-bold uppercase tracking-wider"
            style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Intel Page ────────────────────────────────────────
export default function IntelPage() {
  const profile = useProfileStore();
  const scores = useScoresStore();
  const goalsStore = useGoalsStore();
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  useEffect(() => {
    if (!goalsStore.isLoaded) goalsStore.loadFromSQLite();
  }, [goalsStore]);

  const latest = scores.scoreHistory[scores.scoreHistory.length - 1];
  const omsScore = useMemo(() => {
    try {
      const omsProfile = profileFromScores(
        latest?.gpa ?? null,
        latest?.msl_gpa ?? null,
        latest?.acft_total ?? null,
        latest?.leadership_eval ?? null,
        latest?.cst_score ?? null,
      );
      const result = calculateOMS(omsProfile);
      return result.totalOMS > 0 ? result.totalOMS : 35;
    } catch {
      return 35;
    }
  }, [latest]);
  const gpa = latest?.gpa ?? null;
  const acft = latest?.acft_total ?? null;
  const leadership = latest?.leadership_eval ?? null;

  const activeGoals = goalsStore.goals.filter((g) => g.status === 'active');
  const suggestions = useMemo(() => getSuggestedGoals(gpa, acft, leadership), [gpa, acft, leadership]);
  const insights = useMemo(() => getInsights(gpa, acft, activeGoals.length), [gpa, acft, activeGoals.length]);

  // Build trajectory from score history (up to 5 most recent)
  const trajectory = useMemo(() => {
    const hist = scores.scoreHistory.slice(-5);
    if (hist.length === 0) return [20, 28, 31, 33, omsScore]; // Placeholder ramp
    return hist.map((s) => {
      try {
        const p = profileFromScores(s.gpa ?? null, s.msl_gpa ?? null, s.acft_total ?? null, s.leadership_eval ?? null, s.cst_score ?? null);
        return calculateOMS(p).totalOMS;
      } catch { return 0; }
    });
  }, [scores.scoreHistory, omsScore]);
  const maxTrajectory = Math.max(...trajectory, 100);

  const [greeting, setGreeting] = useState('Welcome');
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
  }, []);
  const name = profile.name || 'Duke';

  async function handleCreateGoal(goal: { title: string; category: string; metric: string; target_value: number }) {
    await goalsStore.addGoal({
      title: goal.title,
      category: goal.category,
      metric: goal.metric,
      target_value: goal.target_value,
      current_value: 0,
      baseline_value: 0,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: 'user',
      oml_impact: null,
      completed_at: null,
    });
    setShowCreateGoal(false);
  }

  async function handleAcceptSuggestion(suggestion: typeof suggestions[0]) {
    await goalsStore.addGoal({
      title: suggestion.title,
      category: suggestion.category,
      metric: suggestion.metric,
      target_value: suggestion.target_value,
      current_value: 0,
      baseline_value: 0,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_by: 'system',
      oml_impact: null,
      completed_at: null,
    });
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-intel { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .kinetic-gradient { background: linear-gradient(135deg, #d9b9ff 0%, #450084 100%); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-7xl mx-auto space-y-12">

        {/* ── Briefing Section ──────────────────────────────── */}
        <section className="relative animate-fadeInUp">
          <div className="glass-panel-intel p-10 md:p-16 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-[144px]">shield_with_heart</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Status: Operational</span>
                <div className="w-2 h-2 rounded-full bg-[#dbc585] animate-pulse" style={{ boxShadow: '0 0 10px #f8e19e' }}></div>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tighter uppercase font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {greeting}, {name}. <br />
                Your OMS is <span className="text-[#dbc585]" style={{ filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>{omsScore.toFixed(1)}</span>.
              </h2>
              <p className="text-[#968d9d] max-w-2xl text-lg leading-relaxed">
                {gpa ? `Academic pillar: ${gpa.toFixed(2)} GPA. ` : 'Enter your GPA to unlock academic insights. '}
                {acft ? `Physical pillar: ${acft} ACFT. ` : ''}
                {activeGoals.length > 0
                  ? `You have ${activeGoals.length} active path${activeGoals.length > 1 ? 's' : ''} in progress.`
                  : 'Set paths below to start tracking your optimization path.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Goals & Trajectory Grid ──────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Goals Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Optimization Paths ({activeGoals.length}/5)
              </h3>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="px-3 py-1 bg-[#450084] text-[#b27ff5] text-[10px] uppercase tracking-widest font-bold rounded-sm hover:scale-105 transition-transform"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 15px rgba(69,0,132,0.2)' }}
              >
                + New
              </button>
            </div>

            <div className="space-y-4 animate-slideInLeft delay-200">
              {/* Optimization Paths */}
              {activeGoals.map((goal) => {
                const cat = CATEGORIES.find((c) => c.key === goal.category) ?? CATEGORIES[0];
                const progress = goal.target_value > 0 ? Math.min((goal.current_value ?? 0) / goal.target_value, 1) : 0;
                const isComplete = progress >= 1;
                return (
                  <div key={goal.id} className="group p-6 bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg border-l-4" style={{ borderLeftColor: cat.bgColor }}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="material-symbols-outlined" style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: isComplete ? '#c3cc8c' : cat.color }}>
                          {isComplete ? 'COMPLETE' : `${Math.round(progress * 100)}%`}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>{goal.title}</h4>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-[#373438] rounded-full mt-3">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress * 100}%`, backgroundColor: isComplete ? '#c3cc8c' : cat.color, boxShadow: `0 0 8px ${isComplete ? '#c3cc8c' : cat.color}` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{goal.current_value ?? 0} / {goal.target_value}</span>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isComplete ? (
                          <button
                            onClick={() => goalsStore.completeGoal(goal.id!)}
                            className="text-[10px] text-[#c3cc8c] uppercase font-bold hover:text-[#dfe8a6] transition-colors"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            ✓ Retire
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            if (confirm('Remove this optimization path?')) {
                              goalsStore.removeGoal(goal.id!);
                            }
                          }}
                          className="text-[10px] text-[#968d9d] uppercase font-bold hover:text-[#ffb4ab] transition-colors"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Suggested Goals */}
              {activeGoals.length < 5 && suggestions.length > 0 && (
                <>
                  <div className="pt-4">
                    <h4 className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Suggested</h4>
                  </div>
                  {suggestions.slice(0, 3 - activeGoals.length).map((suggestion, i) => {
                    const cat = CATEGORIES.find((c) => c.key === suggestion.category) ?? CATEGORIES[0];
                    return (
                      <div key={i} className="group cursor-pointer p-6 bg-[#1d1b1f] hover:bg-[#211f23] transition-all rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <span className="material-symbols-outlined text-[#968d9d] group-hover:transition-colors" style={{ color: undefined }}>{cat.icon}</span>
                          <button
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="text-[10px] text-[#dbc585] uppercase font-bold hover:text-[#f8e19e] transition-colors"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            + Accept
                          </button>
                        </div>
                        <h4 className="text-lg uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>{suggestion.title}</h4>
                        <p className="text-sm text-[#968d9d]">{suggestion.description}</p>
                      </div>
                    );
                  })}
                </>
              )}

              {activeGoals.length === 0 && suggestions.length === 0 && (
                <div className="p-6 bg-[#1d1b1f] rounded-lg text-center">
                  <p className="text-sm text-[#968d9d]">All goals are on track. Create new paths to keep pushing.</p>
                </div>
              )}
            </div>
          </div>

          {/* OMS Trajectory */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>OMS Trajectory</h3>
            <div className="glass-panel-intel p-8 rounded-lg h-[450px] flex flex-col relative animate-fadeIn delay-300">
              <div className="flex-1 flex items-end gap-2 px-2 relative">
                {/* Grid */}
                <div className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none opacity-10">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-full h-px bg-[#968d9d]" />)}
                </div>
                {/* Bars from trajectory data */}
                {trajectory.map((val, i) => {
                  const height = Math.max((val / maxTrajectory) * 100, 5);
                  const isLast = i === trajectory.length - 1;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm relative group overflow-hidden transition-all ${isLast ? 'kinetic-gradient' : ''}`}
                      style={{
                        height: `${height}%`,
                        backgroundColor: isLast ? undefined : `rgba(69, 0, 132, ${0.3 + (i * 0.1)})`,
                        boxShadow: isLast ? '0 0 30px rgba(217,185,255,0.3)' : undefined,
                      }}
                    >
                      {!isLast && <div className="absolute inset-x-0 bottom-0 bg-[#d9b9ff] h-full opacity-0 group-hover:opacity-20 transition-opacity" />}
                      {isLast && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#dbc585] text-[#3c2f00] px-2 py-1 rounded text-[10px] font-black whitespace-nowrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          CURRENT: {omsScore.toFixed(1)}
                        </div>
                      )}
                      {/* Hover tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#373438] text-[#e7e1e6] px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {Math.round(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X-axis */}
              <div className="mt-6 flex justify-between text-[10px] text-[#968d9d] uppercase font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {trajectory.map((_, i) => (
                  <span key={i}>{i === trajectory.length - 1 ? `WK ${String(i + 1).padStart(2, '0')} (NOW)` : `WK ${String(i + 1).padStart(2, '0')}`}</span>
                ))}
              </div>
              {/* Legend */}
              <div className="absolute top-8 right-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#d9b9ff] rounded-full" />
                  <span className="text-[10px] text-[#e7e1e6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your OMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#dbc585] rounded-full" style={{ boxShadow: '0 0 10px #dbc585' }} />
                  <span className="text-[10px] text-[#e7e1e6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Target</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dynamic Insights ─────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.map((insight, i) => (
            <div key={i} className="p-8 bg-[#373438]/40 backdrop-blur rounded-lg flex gap-6 items-start">
              <div className="p-4 rounded-sm" style={{ backgroundColor: insight.bgColor }}>
                <span className="material-symbols-outlined" style={{ color: insight.iconColor, fontVariationSettings: "'FILL' 1" }}>{insight.icon}</span>
              </div>
              <div>
                <h5 className="text-lg uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>{insight.title}</h5>
                <p className="text-sm text-[#968d9d]">{insight.body}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Create Path Modal */}
      {showCreateGoal && (
        <CreateGoalModal onClose={() => setShowCreateGoal(false)} onSave={handleCreateGoal} />
      )}
    </div>
  );
}
