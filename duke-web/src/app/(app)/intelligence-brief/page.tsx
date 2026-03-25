'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdLock } from 'react-icons/md';
import { VProgressBar } from '@/components';
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
    { label: 'Academic', value: latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0, display: latestScore?.gpa?.toFixed(2) ?? '--', accent: '#f8e19e' },
    { label: 'Physical', value: latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0, display: latestScore?.acft_total ? `${Math.round(latestScore.acft_total)}` : '--', accent: '#c3cc8c' },
    { label: 'Leadership', value: latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0, display: latestScore?.leadership_eval?.toString() ?? '--', accent: '#d9b9ff' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center justify-between shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          INTELLIGENCE BRIEF
        </h1>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* OML Summary */}
        <section className="glass-card ghost-border rounded-sm p-6 glow-shadow-purple">
          <span
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-3 block"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            COMPOSITE OML SCORE
          </span>
          <div className="flex items-baseline mb-3">
            <span
              className="text-5xl font-black text-[#f8e19e]"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {oml > 0 ? Math.round(oml) : '--'}
            </span>
            <span className="text-xl font-semibold text-[#968d9d] ml-1"> / 1000</span>
          </div>
          <VProgressBar progress={Math.min(oml / 1000, 1)} />
          {profile.goalOml != null && (
            <p
              className="text-sm font-bold text-[#d9b9ff] mt-3"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Target: {profile.goalOml} ({oml > 0 ? `${Math.round(profile.goalOml - oml)} points to go` : 'Set scores to track'})
            </p>
          )}
          <div className="flex gap-3 mt-5">
            {pillars.map((pillar, i) => (
              <div key={i} className="flex-1 bg-[#1d1b1f] rounded-sm p-3">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block mb-1"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {pillar.label}
                </span>
                <span
                  className="text-lg font-black block mb-2"
                  style={{ fontFamily: 'Public Sans, sans-serif', color: pillar.accent }}
                >
                  {pillar.display}
                </span>
                <VProgressBar progress={pillar.value} />
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-[#1d1b1f] rounded-sm p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-sm bg-[#450084] flex items-center justify-center glow-shadow-purple">
            <MdLock size={32} className="text-[#b27ff5]" />
          </div>
          <h2
            className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            AI INTELLIGENCE BRIEFINGS COMING SOON
          </h2>
          <p className="text-sm text-[#cdc3d4] leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif' }}>
            AI Intelligence Briefings are coming soon. In the meantime, track your scores and check your OML on the dashboard.
          </p>
          <button
            className="mt-2 px-6 py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 active:scale-[0.98] transition-all shadow-lg shadow-[#450084]/20"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            onClick={() => router.push('/mission')}
          >
            Go to Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}
