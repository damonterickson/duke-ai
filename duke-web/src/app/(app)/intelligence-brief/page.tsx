'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { calculateOML } from '@/engine/oml';
import type { CadetProfile, OMLConfig, ACFTTables } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

export default function IntelligenceBriefPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();

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
      return calculateOML(cadet, omlConfig as OMLConfig, acftTables as unknown as ACFTTables);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const oml = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;

  const pillars = [
    { label: 'Academic', value: latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0, display: latestScore?.gpa?.toFixed(2) ?? '--', accent: '#f8e19e', bg: '#544511', icon: 'school' },
    { label: 'Physical', value: latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0, display: latestScore?.acft_total ? `${Math.round(latestScore.acft_total)}` : '--', accent: '#c3cc8c', bg: '#2c3303', icon: 'fitness_center' },
    { label: 'Leadership', value: latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0, display: latestScore?.leadership_eval?.toString() ?? '--', accent: '#d9b9ff', bg: '#450084', icon: 'military_tech' },
  ];

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-brief { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            INTELLIGENCE BRIEF
          </h1>
        </div>

        {/* OML Summary */}
        <section className="glass-panel-brief rounded-lg p-10 relative overflow-hidden" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-[120px]">query_stats</span>
          </div>
          <div className="relative z-10">
            <span className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold block mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Composite OML Score
            </span>
            <div className="flex items-baseline mb-4">
              <span className="text-7xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>
                {oml > 0 ? Math.round(oml) : '--'}
              </span>
              <span className="text-2xl font-semibold text-[#968d9d] ml-2"> / 1000</span>
            </div>
            <div className="w-full h-2 bg-[#373438] rounded-full mb-4">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(oml / 1000, 1) * 100}%`,
                  background: 'linear-gradient(90deg, #d9b9ff, #dbc585)',
                  boxShadow: '0 0 10px rgba(219,197,133,0.3)',
                }}
              />
            </div>
            {profile.goalOml != null && (
              <p className="text-sm font-bold text-[#d9b9ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Target: {profile.goalOml} ({oml > 0 ? `${Math.round(profile.goalOml - oml)} points to go` : 'Set scores to track'})
              </p>
            )}

            {/* Pillar Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {pillars.map((pillar) => (
                <div key={pillar.label} className="bg-[#1d1b1f] rounded-lg p-4 border-l-4" style={{ borderLeftColor: pillar.bg }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: pillar.accent, fontVariationSettings: "'FILL' 1" }}>{pillar.icon}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {pillar.label}
                    </span>
                  </div>
                  <span className="text-2xl font-black block mb-2" style={{ fontFamily: 'Public Sans, sans-serif', color: pillar.accent }}>
                    {pillar.display}
                  </span>
                  <div className="w-full h-1.5 bg-[#373438] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pillar.value * 100}%`,
                        backgroundColor: pillar.accent,
                        boxShadow: `0 0 8px ${pillar.accent}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-[#1d1b1f] rounded-lg p-12 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-20 rounded-lg bg-[#450084] flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
            <span className="material-symbols-outlined text-4xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            AI INTELLIGENCE BRIEFINGS COMING SOON
          </h2>
          <p className="text-sm text-[#968d9d] leading-relaxed max-w-md">
            AI Intelligence Briefings are coming soon. In the meantime, track your scores and check your OML on the dashboard.
          </p>
          <button
            className="mt-2 px-8 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
            style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            onClick={() => router.push('/mission')}
          >
            Go to Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}
