'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useEngagementStore } from '@/stores/engagement';
import { useSquadStore } from '@/stores/squad';
import { calculateOML } from '@/engine/oml';
import type { CadetProfile } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

export default function MissionPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const engagement = useEngagementStore();
  const squad = useSquadStore();

  const latestScore = scores.scoreHistory[0];

  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    const cadet: CadetProfile = {
      gpa: latestScore?.gpa ?? 0,
      mslGpa: latestScore?.msl_gpa ?? 0,
      acftScores: {},
      leadershipEval: latestScore?.leadership_eval ?? 0,
      cstScore: latestScore?.cst_score ?? undefined,
      clcScore: latestScore?.clc_score ?? undefined,
      commandRoles: [],
      extracurricularHours: 0,
      yearGroup: profile.yearGroup,
      gender: profile.gender,
      ageBracket: profile.ageBracket,
    };
    try {
      return calculateOML(cadet, omlConfig as any, acftTables as any);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const omlTotal = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;
  const omlProgress = Math.min(omlTotal / 1000, 1);
  const percentile =
    squad.totalCadets > 0
      ? Math.round(((squad.totalCadets - squad.individualRank) / squad.totalCadets) * 100)
      : 0;

  const topBranch = engagement.branchFit[0];

  const physical = latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0;
  const academic = latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0;
  const leadership = latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = profile.name || 'Cadet';

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-mission { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-7xl mx-auto space-y-12">

        {/* Briefing Header */}
        <section className="relative">
          <div className="glass-panel-mission p-10 md:p-16 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-[144px]">shield_with_heart</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {engagement.tier || 'Status: Operational'}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#dbc585] animate-pulse" style={{ boxShadow: '0 0 10px #f8e19e' }} />
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tighter uppercase font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {greeting}, {name}. <br />
                Your OML is{' '}
                <span className="text-[#dbc585]" style={{ filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>
                  {omlTotal > 0 ? Math.round(omlTotal) : '--'}
                </span>.
              </h2>
              <p className="text-[#968d9d] max-w-2xl text-lg leading-relaxed">
                {percentile > 0 ? `Top ${100 - percentile}% of your battalion. ` : ''}
                {topBranch ? `Best branch fit: ${topBranch.branch} (${topBranch.percentage}%). ` : ''}
                Track your scores to unlock daily missions and AI-powered insights.
              </p>
            </div>
          </div>
        </section>

        {/* OML Gauge + Achievements Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* OML Gauge Panel */}
          <div className="lg:col-span-1">
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Command Readiness
            </h3>
            <div className="glass-panel-mission p-8 rounded-lg flex flex-col items-center">
              {/* Circular gauge */}
              <div className="relative w-[200px] h-[200px] mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#373438" strokeWidth="14" />
                  <circle
                    cx="100" cy="100" r="85" fill="none"
                    stroke="url(#omlGradient)" strokeWidth="14"
                    strokeDasharray={`${omlProgress * 534} 534`}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(219,197,133,0.4))' }}
                  />
                  <defs>
                    <linearGradient id="omlGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d9b9ff" />
                      <stop offset="100%" stopColor="#dbc585" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))' }}>
                    {omlTotal > 0 ? Math.round(omlTotal) : '--'}
                  </span>
                  <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    OML Score
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {percentile > 0 ? `Top ${100 - percentile}%` : '--'}
                </span>
              </div>
              <button
                onClick={() => router.push('/what-if')}
                className="mt-6 px-6 py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                  What-If Simulator
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Achievements + Readiness */}
          <div className="lg:col-span-2 space-y-8">
            {/* Achievement Cards */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 border-l-4 border-[#450084] group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Streak</span>
                  </div>
                  <span className="text-4xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {engagement.streak}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Day streak
                  </span>
                </div>

                <div className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 border-l-4 border-[#544511] group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ranking</span>
                  </div>
                  <span className="text-4xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {squad.totalCadets > 0
                      ? `Top ${Math.round((squad.individualRank / squad.totalCadets) * 100)}%`
                      : '--'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Battalion rank
                  </span>
                </div>

                <div className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 border-l-4 border-[#2c3303] group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="material-symbols-outlined text-[#c3cc8c]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Branch</span>
                  </div>
                  <span className="text-4xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {topBranch ? topBranch.branch : '--'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {topBranch ? `${topBranch.percentage}% Fit` : 'Set up profile'}
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Readiness */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Strategic Readiness
              </h3>
              <div className="glass-panel-mission p-8 rounded-lg space-y-6">
                {[
                  { label: 'Physical', value: physical, color: '#d9b9ff', icon: 'fitness_center' },
                  { label: 'Academic', value: academic, color: '#dbc585', icon: 'school' },
                  { label: 'Leadership', value: leadership, color: '#c3cc8c', icon: 'military_tech' },
                ].map((pillar) => (
                  <div key={pillar.label}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm" style={{ color: pillar.color, fontVariationSettings: "'FILL' 1" }}>{pillar.icon}</span>
                        <span className="text-sm font-semibold text-[#e7e1e6]">{pillar.label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: pillar.color }}>
                        {Math.round(pillar.value * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#373438] rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pillar.value * 100}%`,
                          background: `linear-gradient(90deg, ${pillar.color}88, ${pillar.color})`,
                          boxShadow: `0 0 10px ${pillar.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Active Mission */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Active Mission
          </h3>
          <div className="glass-panel-mission p-8 rounded-lg flex items-start gap-6">
            <div className="p-4 rounded-sm bg-[#450084]">
              <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  Track Your Scores
                </h4>
                <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  In Progress
                </span>
              </div>
              <p className="text-sm text-[#968d9d] leading-relaxed">
                Track your scores to unlock daily missions. Update your GPA, ACFT, and leadership evaluations on the Profile tab.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'cloud_upload', label: 'Upload & Sync', route: '/upload', color: '#d9b9ff' },
              { icon: 'fitness_center', label: 'ACFT Log', route: '/acft-log', color: '#c3cc8c' },
              { icon: 'query_stats', label: 'Intel Brief', route: '/intelligence-brief', color: '#dbc585' },
              { icon: 'school', label: 'Canvas', route: '/canvas', color: '#f8e19e' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.route)}
                className="bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-6 flex flex-col items-center gap-3 transition-all hover:scale-[1.02] group"
                style={{ boxShadow: 'none' }}
              >
                <span className="material-symbols-outlined text-2xl transition-colors" style={{ color: action.color, fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                <span className="text-sm font-black uppercase tracking-tight text-[#e7e1e6]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
